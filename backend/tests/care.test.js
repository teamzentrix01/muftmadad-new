const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, randomBytes } = require('node:crypto');
const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const { createCareRouter } = require('../routes/care.routes');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env')));
const config = { host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME };
const schema = 'care_test_' + randomBytes(8).toString('hex');
const adminDb = new Pool(config);
const db = new Pool({ ...config, options:`-c search_path=${schema}`, max:5 });
process.env.JWT_SECRET = randomBytes(32).toString('hex');
let server,base;
const token = id => jwt.sign({userId:id},process.env.JWT_SECRET);
const request = async (url,method='GET',body,user=1) => {
    const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(user?{Authorization:'Bearer '+token(user)}:{})},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,body:await response.json()};
};
const future = hours => new Date(Date.now()+hours*3600000).toISOString();

before(async()=>{
    assert.match(schema,/^care_test_[a-f0-9]{16}$/);
    await adminDb.query(`CREATE SCHEMA ${schema}`);
    const c=await db.connect();
    try {
        const original=fs.readFileSync(path.join(__dirname,'../schema.sql'),'utf8').replace(/^\\(?:un)?restrict[^\r\n]*\r?$/gm,'').replaceAll('public.',`${schema}.`);
        await c.query(original);
        await c.query(`SET search_path TO ${schema}`);
        await c.query(fs.readFileSync(path.join(__dirname,'../migrations/002_hospital_care.sql'),'utf8'));
        await c.query(`INSERT INTO users(id,name,email,phone,hash_password,isadmin) VALUES
            (1,'Admin','admin@test.invalid','1111111111','unused',true),
            (2,'Patient','patient@test.invalid','2222222222','unused',false),
            (3,'Other patient','other@test.invalid','3333333333','unused',false),
            (4,'Hospital staff','staff@test.invalid','4444444444','unused',false);
            INSERT INTO hospitals(id,name,address,city) VALUES(1,'Test Hospital','Test Address','Test City'),(2,'Other Hospital','Other Address','Other City');
            INSERT INTO doctors(id,name,email,degrees,specialities,experience_in_years,is_verified,city,consultation_fee)
                VALUES(1,'Test Doctor','doctor@test.invalid',ARRAY['MBBS'],ARRAY['Orthopaedics'],0,true,'Test City',0),
                (2,'Unverified Doctor','doctor2@test.invalid',ARRAY['MBBS'],ARRAY['Orthopaedics'],1,false,'Test City',100);
            INSERT INTO specialities(id,name_en,is_active) VALUES(1,'Orthopaedics',true);
            INSERT INTO treatments(id,name,slug,comes_in) VALUES(1,'Knee care','knee-care','Orthopaedics');
            INSERT INTO care_memberships(user_id,hospital_id) VALUES(4,2);`);
    } finally {c.release();}
    const app=express();app.use(express.json());app.use('/care',createCareRouter(db));
    server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
    base=`http://127.0.0.1:${server.address().port}/care`;
});
after(async()=>{
    if(server)await new Promise(resolve=>server.close(resolve));
    await db.end();
    // Only the randomly named schema created by this test is removed.
    assert.match(schema,/^care_test_[a-f0-9]{16}$/);
    await adminDb.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await adminDb.end();
});

test('patient discovery, booking, assistance and care progression',async()=>{
    assert.equal((await request('/manage/overview','GET',null,null)).status,401);
    assert.equal((await request('/manage/overview','GET',null,2)).status,403);
    assert.equal((await request('/appointments','GET',null,null)).status,401);
    assert.equal((await request('/manage/concerns','POST',{keyword:'knee pain',speciality_id:1})).status,201);
    let found=await request('/doctors?q=knee%20pain&city=Test%20City','GET',null,null);
    assert.equal(found.status,200);assert.equal(found.body.length,1);assert.equal(found.body[0].id,1);
    assert.equal(found.body[0].consultation_fee,'0.00');
    const p=await request('/manage/packages','POST',{hospital_id:1,treatment_id:1,title:'Care package',min_price:1000,max_price:2000,inclusions:['Surgeon fee','Diagnostics'],exclusions:['Travel'],valid_until:'2099-01-01'});
    assert.equal(p.status,201);
    const slot=await request('/manage/slots','POST',{doctor_id:1,hospital_id:1,starts_at:future(24),ends_at:future(25),capacity:1});
    assert.equal(slot.status,201);
    assert.equal((await request('/manage/slots','POST',{doctor_id:1,hospital_id:2,starts_at:future(24.2),ends_at:future(24.8),capacity:1})).status,409);
    assert.equal((await request('/manage/packages','POST',{hospital_id:1,treatment_id:1,title:'Wrong',min_price:2,max_price:1,valid_until:'2099-01-01'})).status,400);
    assert.equal((await request('/manage/packages','POST',{hospital_id:1,treatment_id:1,title:'No access',min_price:1,max_price:2,valid_until:'2099-01-01'},4)).status,403);
    assert.equal((await request('/packages?doctor=1','GET',null,null)).body.length,1);
    const payload={patient_name:'Patient',patient_phone:'9999999999',requirement:'Knee consultation',slot_id:slot.body.id,package_id:p.body.id,request_key:randomUUID()};
    const booking=await request('/appointments','POST',payload,2);assert.equal(booking.status,201);
    const id=booking.body.id;assert.equal(booking.body.price_snapshot.min_price,'1000.00');
    assert.equal((await request('/doctors?doctor=1','GET',null,null)).body[0].id,1);
    assert.equal((await request('/doctors?hospital=2','GET',null,null)).body.length,0);
    assert.equal((await request(`/manage/packages/${p.body.id}`,'PATCH',{title:'Updated package',min_price:3000,max_price:4000,inclusions:['New pricing'],exclusions:[],valid_until:'2099-01-01'})).status,200);
    assert.equal((await request('/appointments','GET',null,2)).body[0].price_snapshot.min_price,'1000.00');
    assert.equal((await request('/appointments','POST',payload,2)).body.id,id);
    assert.equal((await request('/appointments','POST',{...payload,request_key:randomUUID()},3)).status,409);
    assert.equal((await request('/slots?doctor=1','GET',null,null)).body.length,0);
    assert.equal((await request('/appointments','GET',null,3)).body.length,0);
    assert.equal((await request(`/appointments/${id}/cancel`,'POST',{},3)).status,404);
    assert.equal((await request(`/manage/slots/${slot.body.id}`,'PATCH')).status,409);
    assert.equal((await request(`/manage/appointments/${id}`,'PATCH',{status:'consulted',note:'Ready'},4)).status,403);
    assert.equal((await request(`/manage/appointments/${id}`,'PATCH',{status:'completed',note:'Skip steps'})).status,409);
    const help=await request(`/appointments/${id}/assistance`,'POST',{reason:'Need financial support',requested_amount:1000},2);assert.equal(help.status,201);
    assert.equal((await request(`/manage/assistance/${help.body.id}`,'PATCH',{status:'under_review',decision_note:'Review in progress'})).status,200);
    assert.equal((await request(`/manage/assistance/${help.body.id}`,'PATCH',{status:'approved',decision_note:'Eligibility approved. Contact coordinator.'})).status,200);
    assert.equal((await request(`/manage/assistance/${help.body.id}`,'PATCH',{status:'declined',decision_note:'Overwrite'})).status,409);
    for(const status of ['consulted','diagnostics','treatment','follow_up'])assert.equal((await request(`/manage/appointments/${id}`,'PATCH',{status,note:'Guidance for '+status})).status,200);
    assert.equal((await request(`/manage/appointments/${id}/followups`,'POST',{due_at:future(48),note:'Return for follow-up'})).status,201);
    let own=(await request('/appointments','GET',null,2)).body[0];assert.equal(own.followups.length,1);assert.equal(own.assistance.status,'approved');
    assert.equal((await request(`/manage/followups/${own.followups[0].id}`,'PATCH')).status,200);
    assert.equal((await request(`/manage/appointments/${id}`,'PATCH',{status:'completed',note:'Care completed'})).status,200);
    own=(await request('/appointments','GET',null,2)).body[0];assert.equal(own.status,'completed');assert.ok(own.events.find(e=>e.status==='followup_completed'));
});

test('concurrent bookings cannot overbook; cancellation releases capacity',async()=>{
    const slot=await request('/manage/slots','POST',{doctor_id:1,hospital_id:1,starts_at:future(72),ends_at:future(73),capacity:1});
    assert.equal(slot.status,201);
    const payload={patient_name:'Patient',patient_phone:'9999999999',requirement:'Consultation',slot_id:slot.body.id};
    const results=await Promise.all([2,3].map(user=>request('/appointments','POST',{...payload,request_key:randomUUID()},user)));
    assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
    const winner=results.findIndex(r=>r.status===201),id=results[winner].body.id;
    assert.equal((await request(`/appointments/${id}/cancel`,'POST',{},[2,3][winner])).status,200);
    const replacement=await request('/appointments','POST',{...payload,request_key:randomUUID()},2);
    assert.equal(replacement.status,201);
    const later=await request('/manage/slots','POST',{doctor_id:1,hospital_id:1,starts_at:future(96),ends_at:future(97),capacity:1});
    assert.equal(later.status,201);
    assert.equal((await request(`/appointments/${replacement.body.id}/reschedule`,'POST',{slot_id:later.body.id},3)).status,404);
    assert.equal((await request(`/appointments/${replacement.body.id}/reschedule`,'POST',{slot_id:later.body.id},2)).status,200);
    assert.equal((await request('/appointments','GET',null,2)).body.find(a=>a.id===replacement.body.id).slot_id,later.body.id);
    const available=(await request('/slots?doctor=1','GET',null,null)).body;
    assert.ok(available.find(s=>s.id===slot.body.id));
    assert.ok(!available.find(s=>s.id===later.body.id));
});

test('invalid requests do not create bookings and expired packages stay hidden',async()=>{
    assert.equal((await request('/appointments','POST',{slot_id:'bad'},2)).status,400);
    assert.equal((await request('/slots?doctor=bad','GET',null,null)).status,400);
    await db.query("UPDATE care_packages SET valid_until='2000-01-01'");
    assert.equal((await request('/packages','GET',null,null)).body.length,0);
    assert.equal((await request('/manage/overview','GET',null,4)).body.appointments.length,0);
    const id=(await db.query('INSERT INTO users(id,name,email,phone,hash_password) VALUES(500,$1,$2,$3,$4) RETURNING isadmin', ['New patient','new@test.invalid','8888888888','unused'])).rows[0];
    assert.equal(id.isadmin,false);
});

test('staff can manage assigned hospital and revoked access takes effect immediately', async () => {
    const membership = await request('/manage/memberships', 'POST', { email: 'staff@test.invalid', hospital_id: 1 });
    assert.equal(membership.status, 201);
    const overview = await request('/manage/overview', 'GET', null, 4);
    assert.ok(overview.body.hospital_ids.includes(1));
    assert.ok(overview.body.appointments.length > 0);
    assert.deepEqual(overview.body.memberships, []);
    assert.equal((await request('/manage/memberships', 'POST', { email: 'other@test.invalid', hospital_id: 1 }, 4)).status, 403);
    const slot = await request('/manage/slots', 'POST', { doctor_id: 1, hospital_id: 1, starts_at: future(120), ends_at: future(121), capacity: 1 }, 4);
    assert.equal(slot.status, 201);
    assert.equal((await request(`/manage/slots/${slot.body.id}`, 'PATCH', {}, 4)).status, 200);
    assert.ok(!(await request('/slots?doctor=1', 'GET', null, null)).body.some(s => s.id === slot.body.id));
    const admin = await request('/manage/overview');
    const access = admin.body.memberships.find(m => m.email === 'staff@test.invalid' && m.hospital_id === 1);
    assert.equal((await request(`/manage/memberships/${access.id}`, 'DELETE')).status, 200);
    assert.equal((await request(`/manage/slots/${slot.body.id}`, 'PATCH', {}, 4)).status, 403);
    assert.equal((await request('/manage/overview', 'GET', null, 4)).body.appointments.length, 0);
});

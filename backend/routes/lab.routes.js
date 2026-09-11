const express = require('express');
const jwt = require('jsonwebtoken');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const text = (v, max = 500) => { if (typeof v !== 'string' || !v.trim() || v.trim().length > max) fail(400, 'Enter all required details within the length limit.'); return v.trim(); };
const id = v => { if (!/^\d+$/.test(String(v)) || !Number.isSafeInteger(Number(v)) || Number(v)<1) fail(400,'Invalid selection.'); return Number(v); };
const amount = v => { if (v === '' || v == null || !Number.isFinite(Number(v)) || Number(v)<0 || Number(v)>10000000 || Math.abs(Number(v)*100-Math.round(Number(v)*100))>0.00001) fail(400,'Enter a valid amount with up to two decimals.'); return Number(v); };
const uuid = v => { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v || '')) fail(400,'Invalid booking reference.'); return v; };
const transitions = { confirmed:['assigned','cancelled'], assigned:['collected','cancelled'], collected:['received'], received:['processing'], processing:['report_ready'], report_ready:[], cancelled:[] };
const masters = {
 laboratories: { table:'lab_laboratories', fields:['name','phone','address'] },
 areas: { table:'lab_areas', fields:['name','pincode','collection_fee'] },
 tests: { table:'lab_tests', fields:['name','kind','price','sample_type','preparation','includes','turnaround_hours'] },
 collectors: { table:'lab_collectors', fields:['name','phone','area_id'] },
};
function validateMaster(kind, body) {
 const config=Object.hasOwn(masters,kind) && masters[kind]; if(!config) fail(404,'Unknown catalogue.');
 const values=config.fields.map(key=>{
  if(['price','collection_fee'].includes(key)) return amount(body[key]);
  if(['area_id','turnaround_hours'].includes(key)) return id(body[key]);
  if(['preparation','includes'].includes(key)) return body[key] ? text(body[key],2000) : '';
  if(key==='kind' && !['test','package'].includes(body[key])) fail(400,'Choose test or package.');
  const value=text(body[key]);
  if(key==='phone' && !/^\+?[0-9 ()-]{8,20}$/.test(value)) fail(400,'Enter a valid phone number.');
  if(key==='pincode' && !/^\d{6}$/.test(value)) fail(400,'Enter a six digit pincode.');
  return value;
 });
 if(body.is_active !== undefined && typeof body.is_active !== 'boolean') fail(400,'Invalid active status.');
 return [...values,body.is_active ?? true];
}
function pdfContent(value) {
 if(typeof value!=='string' || value.length>7*1024*1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) fail(400,'Upload a PDF up to 5 MB.');
 const bytes=Buffer.from(value,'base64');
 if(bytes.length>5*1024*1024 || bytes.subarray(0,5).toString()!=='%PDF-') fail(400,'Upload a valid PDF up to 5 MB.');
 return bytes;
}
function createLabRouter(db) {
 const router=express.Router();
 const route=fn=>async(req,res,next)=>{try{await fn(req,res);}catch(e){next(e);}};
 const tx=async fn=>{const c=await db.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}};
 const event=(c,b,actor,status,note='')=>c.query('INSERT INTO lab_events(booking_id,actor_id,status,note) VALUES($1,$2,$3,$4)',[b,actor,status,note]);
 const admin=(req,res,next)=>req.user.isadmin?next():res.status(403).json({message:'Administrator access required.'});
 const canRead=(req,b)=>req.user.isadmin || String(b.user_id)===String(req.user.id) || (req.member.collector_id && String(b.collector_id)===String(req.member.collector_id)) || (req.member.laboratory_id && String(b.laboratory_id)===String(req.member.laboratory_id));
 const booking=async(c,req,lock=false)=>{const b=(await c.query(`SELECT * FROM lab_bookings WHERE id=$1${lock?' FOR UPDATE':''}`,[uuid(req.params.id)])).rows[0];if(!b)fail(404,'Booking not found.');if(!canRead(req,b))fail(403,'You cannot access this booking.');return b;};
 router.get('/catalog',route(async(req,res)=>{
  const [tests,areas]=await Promise.all([db.query('SELECT * FROM lab_tests WHERE is_active ORDER BY name'),db.query('SELECT * FROM lab_areas WHERE is_active ORDER BY name')]);
  res.json({tests:tests.rows,areas:areas.rows});
 }));
 router.use(async (req,res,next)=>{
  try {
   const token=req.headers.authorization?.replace(/^Bearer /,'') || req.cookies?.authToken;
   if(!token)fail(401,'Please log in.');
   let decoded;try{decoded=jwt.verify(token,process.env.JWT_SECRET);}catch{fail(401,'Please log in again.');}
   req.user=(await db.query('SELECT id,name,isadmin FROM users WHERE id=$1',[decoded.userId])).rows[0];
   if(!req.user)fail(401,'Please log in again.');
   req.member=(await db.query(`SELECT m.* FROM lab_memberships m
    LEFT JOIN lab_collectors c ON c.id=m.collector_id LEFT JOIN lab_laboratories l ON l.id=m.laboratory_id
    WHERE m.user_id=$1 AND (c.is_active OR l.is_active)`,[req.user.id])).rows[0] || {};
   next();
  }catch(e){next(e);}
 });
 router.get('/session',(req,res)=>res.json({user:req.user,membership:req.member}));
 router.get('/admin/analytics',admin,route(async(req,res)=>{
  const [summary,areas,tests]=await Promise.all([
   db.query(`SELECT count(*)::integer AS total,
    count(*) FILTER(WHERE status='confirmed')::integer AS confirmed,
    count(*) FILTER(WHERE status='assigned')::integer AS assigned,
    count(*) FILTER(WHERE status='collected')::integer AS collected,
    count(*) FILTER(WHERE status='received')::integer AS received,
    count(*) FILTER(WHERE status='processing')::integer AS processing,
    count(*) FILTER(WHERE status='report_ready')::integer AS report_ready,
    COALESCE(sum(total) FILTER(WHERE status<>'cancelled'),0) AS booking_value,
    COALESCE(sum(paid_amount),0) AS cash_received,
    COALESCE(sum((CASE WHEN collector_settled THEN 0 ELSE collector_due END)+(CASE WHEN lab_settled THEN 0 ELSE lab_due END)) FILTER(WHERE status='report_ready'),0) AS unsettled
    FROM lab_bookings`),
   db.query('SELECT area_id,count(*)::integer AS count FROM lab_bookings GROUP BY area_id'),
   db.query('SELECT test_id,count(*)::integer AS count FROM lab_booking_items GROUP BY test_id'),
  ]);res.json({summary:summary.rows[0],areas:areas.rows,tests:tests.rows});
 }));
 router.get('/admin/masters',admin,route(async(req,res)=>{
  const result={};for(const [key,c] of Object.entries(masters)) result[key]=(await db.query(`SELECT * FROM ${c.table} ORDER BY name`)).rows;
  result.memberships=(await db.query('SELECT m.*,u.name FROM lab_memberships m JOIN users u ON u.id=m.user_id ORDER BY u.name')).rows;
  result.users=(await db.query('SELECT id,name,email FROM users ORDER BY name LIMIT 1000')).rows;
  res.json(result);
 }));
 router.post('/admin/masters/:kind',admin,route(async(req,res)=>{
  const c=masters[req.params.kind],values=validateMaster(req.params.kind,req.body);
  const fields=[...c.fields,'is_active'];
  res.status(201).json((await db.query(`INSERT INTO ${c.table}(${fields.join(',')}) VALUES(${values.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,values)).rows[0]);
 }));
 router.put('/admin/masters/:kind/:id',admin,route(async(req,res)=>{
  const c=masters[req.params.kind],values=validateMaster(req.params.kind,req.body);
  const fields=[...c.fields,'is_active'];values.push(id(req.params.id));
  const r=await db.query(`UPDATE ${c.table} SET ${fields.map((f,i)=>f+'=$'+(i+1)).join(',')} WHERE id=$${values.length} RETURNING *`,values);
  if(!r.rowCount)fail(404,'Record not found.');res.json(r.rows[0]);
 }));
 router.post('/admin/access',admin,route(async(req,res)=>{
  const user=id(req.body.user_id),lab=req.body.laboratory_id?id(req.body.laboratory_id):null,collector=req.body.collector_id?id(req.body.collector_id):null;
  if(!!lab===!!collector)fail(400,'Select exactly one lab or collector role.');
  await db.query('INSERT INTO lab_memberships(user_id,laboratory_id,collector_id) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET laboratory_id=$2,collector_id=$3',[user,lab,collector]);res.json({success:true});
 }));
 router.delete('/admin/access/:id',admin,route(async(req,res)=>{await db.query('DELETE FROM lab_memberships WHERE user_id=$1',[id(req.params.id)]);res.json({success:true});}));
 router.post('/bookings',route(async(req,res)=>{
  const body=req.body,key=uuid(body.request_key),area=id(body.area_id),name=text(body.patient_name,100),phone=text(body.phone,20),address=text(body.address,1000);
  if(body.patient_user_id && !req.user.isadmin)fail(403,'Only an administrator can book for another account.');
  const patientUser=body.patient_user_id?id(body.patient_user_id):req.user.id;
  if(!/^\+?[0-9 ()-]{8,20}$/.test(phone))fail(400,'Enter a valid phone number.');
  const when=new Date(body.collection_at);if(!Number.isFinite(when.getTime()) || when<=new Date() || when>Date.now()+90*86400000)fail(400,'Choose a collection time within the next 90 days.');
  if(!Array.isArray(body.test_ids)||!body.test_ids.length||body.test_ids.length>30)fail(400,'Select 1–30 tests or packages.');
  const ids=[...new Set(body.test_ids.map(id))];
  const result=await tx(async c=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`${patientUser}:${key}`]);
   const prior=(await c.query('SELECT * FROM lab_bookings WHERE user_id=$1 AND request_key=$2',[patientUser,key])).rows[0];if(prior)return prior;
   const a=(await c.query('SELECT * FROM lab_areas WHERE id=$1 AND is_active FOR SHARE',[area])).rows[0];if(!a)fail(409,'This area is unavailable.');
   const tests=(await c.query('SELECT * FROM lab_tests WHERE id=ANY($1::bigint[]) AND is_active FOR SHARE',[ids])).rows;
   if(tests.length!==ids.length)fail(409,'A selected test is unavailable. Refresh and select again.');
   const total=(tests.reduce((sum,t)=>sum+Math.round(Number(t.price)*100),Math.round(Number(a.collection_fee)*100)))/100;
   const b=(await c.query('INSERT INTO lab_bookings(user_id,request_key,patient_name,phone,address,area_id,collection_at,total,collection_fee) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[patientUser,key,name,phone,address,area,when,total,a.collection_fee])).rows[0];
   for(const t of tests)await c.query('INSERT INTO lab_booking_items(booking_id,test_id,name,price) VALUES($1,$2,$3,$4)',[b.id,t.id,t.name,t.price]);
   await event(c,b.id,req.user.id,'confirmed','Booking confirmed. Cash on collection.');return b;
  });res.status(201).json(result);
 }));
 router.get('/bookings',route(async(req,res)=>{
  const r=await db.query(`SELECT b.*,a.name AS area_name,c.name AS collector_name,l.name AS laboratory_name,
   (SELECT json_agg(json_build_object('test_id',i.test_id,'name',i.name,'price',i.price)) FROM lab_booking_items i WHERE i.booking_id=b.id) AS items,
   EXISTS(SELECT 1 FROM lab_reports r WHERE r.booking_id=b.id) AS has_report
   FROM lab_bookings b JOIN lab_areas a ON a.id=b.area_id LEFT JOIN lab_collectors c ON c.id=b.collector_id LEFT JOIN lab_laboratories l ON l.id=b.laboratory_id
   WHERE $1::boolean OR b.user_id=$2 OR b.collector_id=$3 OR b.laboratory_id=$4 ORDER BY b.created_at DESC LIMIT 500`,[!!req.user.isadmin,req.user.id,req.member.collector_id||null,req.member.laboratory_id||null]);res.json(r.rows);
 }));
 router.get('/bookings/:id/events',route(async(req,res)=>{await booking(db,req);res.json((await db.query('SELECT status,note,created_at FROM lab_events WHERE booking_id=$1 ORDER BY id',[req.params.id])).rows);}));
 router.post('/bookings/:id/assign',admin,route(async(req,res)=>{
  const result=await tx(async c=>{
   const b=await booking(c,req,true);if(!['confirmed','assigned'].includes(b.status))fail(409,'Only uncollected bookings can be assigned.');
   const collector=id(req.body.collector_id),lab=id(req.body.laboratory_id);
   if(!(await c.query('SELECT 1 FROM lab_collectors WHERE id=$1 AND area_id=$2 AND is_active',[collector,b.area_id])).rowCount)fail(400,'Choose an active collector serving this area.');
   if(!(await c.query('SELECT 1 FROM lab_laboratories WHERE id=$1 AND is_active',[lab])).rowCount)fail(400,'Choose an active lab.');
   const cd=amount(req.body.collector_due??0),ld=amount(req.body.lab_due??0);if(cd+ld>Number(b.total))fail(400,'Settlements cannot exceed the booking total.');
   const updated=(await c.query("UPDATE lab_bookings SET collector_id=$2,laboratory_id=$3,status='assigned',collector_due=$4,lab_due=$5 WHERE id=$1 RETURNING *",[b.id,collector,lab,cd,ld])).rows[0];
   await event(c,b.id,req.user.id,'assigned','Collector and laboratory assigned.');return updated;
  });res.json(result);
 }));
 router.post('/bookings/:id/status',route(async(req,res)=>{
  res.json(await tx(async c=>{
   const b=await booking(c,req,true),next=req.body.status;
   if(!transitions[b.status]?.includes(next) || next==='assigned')fail(409,'This status change is not allowed.');
   const collector=req.member.collector_id && String(req.member.collector_id)===String(b.collector_id);
   const lab=req.member.laboratory_id && String(req.member.laboratory_id)===String(b.laboratory_id);
   const owner=String(b.user_id)===String(req.user.id);
   if(!req.user.isadmin && !(next==='collected' && collector) && !(['received','processing','report_ready'].includes(next)&&lab) && !(next==='cancelled'&&owner))fail(403,'This action is not available for your role.');
   if(['collected','received'].includes(next) && req.body.barcode!==b.barcode)fail(400,'Scan or enter the matching sample barcode.');
   if(next==='report_ready' && !(await c.query('SELECT 1 FROM lab_reports WHERE booking_id=$1',[b.id])).rowCount)fail(409,'Upload a PDF report first.');
   const note=req.body.note?text(req.body.note,1000):'';
   if(next==='cancelled' && Number(b.paid_amount)>0)fail(409,'Ask the administrator to record a refund before cancellation.');
   const r=(await c.query('UPDATE lab_bookings SET status=$2 WHERE id=$1 RETURNING *',[b.id,next])).rows[0];await event(c,b.id,req.user.id,next,note);return r;
  }));
 }));
 router.put('/bookings/:id/report',route(async(req,res)=>{
  const bytes=pdfContent(req.body.content);
  res.json(await tx(async c=>{
   const b=await booking(c,req,true);
   if(!req.user.isadmin && (!req.member.laboratory_id || String(req.member.laboratory_id)!==String(b.laboratory_id)))fail(403,'Laboratory access required.');
   if(b.status!=='processing')fail(409,'Reports can be uploaded only while processing.');
   const name=text(req.body.filename,150).replace(/[^a-zA-Z0-9._-]/g,'_');
   await c.query('INSERT INTO lab_reports(booking_id,filename,content,uploaded_by) VALUES($1,$2,$3,$4) ON CONFLICT(booking_id) DO UPDATE SET filename=$2,content=$3,uploaded_by=$4,uploaded_at=now()',[b.id,name,bytes,req.user.id]);
   await event(c,b.id,req.user.id,b.status,'Report uploaded for review.');return {success:true};
  }));
 }));
 router.get('/bookings/:id/report',route(async(req,res)=>{
  const b=await booking(db,req);
  const staff=req.user.isadmin || (req.member.laboratory_id && String(req.member.laboratory_id)===String(b.laboratory_id));
  if(!staff && (String(b.user_id)!==String(req.user.id)||b.status!=='report_ready'))fail(403,'Report is not available.');
  const r=(await db.query('SELECT filename,content FROM lab_reports WHERE booking_id=$1',[b.id])).rows[0];if(!r)fail(404,'Report not uploaded yet.');
  res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${r.filename}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}).send(r.content);
 }));
 router.post('/bookings/:id/payment',admin,route(async(req,res)=>{
  res.json(await tx(async c=>{
   const b=await booking(c,req,true),paid=amount(req.body.paid_amount);
   if(paid>Number(b.total) || b.status==='cancelled')fail(400,'Invalid payment for this booking.');
   if(paid<Number(b.paid_amount) && (b.collector_settled || b.lab_settled))fail(409,'Settled bookings require reconciliation before refund.');
   const note=text(req.body.note,500);
   const r=(await c.query('UPDATE lab_bookings SET paid_amount=$2 WHERE id=$1 RETURNING *',[b.id,paid])).rows[0];
   await event(c,b.id,req.user.id,b.status,`Payment recorded: INR ${paid}. ${note}`);return r;
  }));
 }));
 router.post('/bookings/:id/settle',admin,route(async(req,res)=>{
  const party=req.body.party;if(!['collector','lab'].includes(party))fail(400,'Choose a settlement party.');
  res.json(await tx(async c=>{
   const b=await booking(c,req,true);if(b.status!=='report_ready' || Number(b.paid_amount)<Number(b.total))fail(409,'Complete the booking and collect payment before settlement.');
   if(b[party+'_settled'])fail(409,'Already settled.');
   const note=text(req.body.note,500);
   await c.query(`UPDATE lab_bookings SET ${party}_settled=true WHERE id=$1`,[b.id]);await event(c,b.id,req.user.id,b.status,`${party} settlement recorded: INR ${b[party+'_due']}. ${note}`);return {success:true};
  }));
 }));
 router.use((error,req,res,next)=>{if(res.headersSent)return next(error);const status=error.status || (['23503','23514','23505'].includes(error.code)?400:500);if(status===500)console.error('Lab API:',error.code||error.message);res.status(status).json({message:error.status?error.message:status===400?'Check the selected records and values.':'Lab service could not complete the request.'});});
 return router;
}
module.exports={createLabRouter,transitions,validateMaster,pdfContent};

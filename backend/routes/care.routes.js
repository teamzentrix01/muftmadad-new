const express = require('express');
const jwt = require('jsonwebtoken');

const transitions = {
    confirmed: ['consulted', 'cancelled', 'no_show'],
    consulted: ['diagnostics', 'treatment', 'follow_up', 'completed'],
    diagnostics: ['treatment', 'follow_up', 'completed'],
    treatment: ['follow_up', 'completed'],
    follow_up: ['follow_up', 'completed'],
    completed: [], cancelled: [], no_show: [],
};
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
const integer = v => { const n = Number(v); if (!Number.isSafeInteger(n) || n < 1) fail(400, 'A valid selection is required.'); return n; };
const text = (v, max = 2000) => { if (typeof v !== 'string' || !v.trim() || v.trim().length > max) fail(400, `Enter text between 1 and ${max} characters.`); return v.trim(); };
const money = v => { if (v === '' || v == null || !Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 9999999999) fail(400, 'Enter a valid amount.'); return Number(v); };
const date = v => { const d = new Date(v); if (!v || Number.isNaN(d.getTime())) fail(400, 'Enter a valid date.'); return d; };
const uuid = v => { if (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) fail(400, 'Invalid reference.'); return v; };
const lines = v => { if (!Array.isArray(v) || v.length > 30) fail(400, 'Use up to 30 inclusions or exclusions.'); return v.map(s => text(s, 300)); };

function createCareRouter(db) {
    const router = express.Router();
    const route = fn => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
    const auth = async (req, res, next) => {
        try {
            const token = req.headers.authorization?.replace(/^Bearer /, '') || req.cookies?.authToken;
            if (!token) fail(401, 'Please log in to continue.');
            if (!process.env.JWT_SECRET) fail(503, 'Authentication is not configured.');
            let decoded;
            try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { fail(401, 'Your session expired. Please log in again.'); }
            const r = await db.query('SELECT id, name, isadmin FROM users WHERE id=$1', [decoded.userId]);
            if (!r.rowCount) fail(401, 'Please log in again.');
            req.user = r.rows[0];
            req.hospitals = (await db.query('SELECT hospital_id FROM care_memberships WHERE user_id=$1', [req.user.id])).rows.map(r => r.hospital_id);
            next();
        } catch (e) { next(e); }
    };
    const staff = (req, res, next) => req.user.isadmin || req.hospitals.length ? next() : res.status(403).json({message:'Hospital staff access is required.'});
    const hospitalAccess = (req, id) => { if (!req.user.isadmin && !req.hospitals.includes(Number(id))) fail(403, 'You cannot manage this hospital.'); };
    const transaction = async fn => {
        const c = await db.connect();
        try { await c.query('BEGIN'); const result = await fn(c); await c.query('COMMIT'); return result; }
        catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
    };
    const event = (c, id, actor, status, note) => c.query('INSERT INTO care_events(appointment_id,actor_id,status,note) VALUES($1,$2,$3,$4)', [id,actor,status,note]);

    router.get('/catalog', route(async (req,res) => {
        const [s,t,h] = await Promise.all([
            db.query('SELECT id,name_en,name_hi FROM specialities WHERE is_active=true ORDER BY display_order,id'),
            db.query('SELECT id,name,specialty_id FROM treatments ORDER BY display_order,id'),
            db.query('SELECT id,name,city FROM hospitals WHERE is_active=true AND deleted_at IS NULL ORDER BY name'),
        ]);
        res.json({specialities:s.rows,treatments:t.rows,hospitals:h.rows});
    }));
    router.get('/doctors', route(async (req,res) => {
        const q = String(req.query.q || '').trim().slice(0,120);
        const city = String(req.query.city || '').trim().slice(0,100);
        const speciality = req.query.speciality ? integer(req.query.speciality) : null;
        const doctorId = req.query.doctor ? integer(req.query.doctor) : null;
        const hospitalId = req.query.hospital ? integer(req.query.hospital) : null;
        const result = await db.query(`SELECT d.id,d.uuid,d.name,d.photo,d.city,d.degrees,d.specialities,
            d.experience_in_years,d.consultation_fee,d.average_rating,d.total_reviews,
            (SELECT min(s.starts_at) FROM care_slots s JOIN hospitals h ON h.id=s.hospital_id
             WHERE s.doctor_id=d.id AND s.is_active AND s.starts_at>now() AND h.is_active AND h.deleted_at IS NULL
             AND (SELECT count(*) FROM care_appointments a WHERE a.slot_id=s.id AND a.status<>'cancelled')<s.capacity) AS next_available
            FROM doctors d WHERE d.is_active=true AND d.is_verified=true AND d.deleted_at IS NULL
            AND ($4::integer IS NULL OR d.id=$4)
            AND ($5::integer IS NULL OR EXISTS(SELECT 1 FROM care_slots cs WHERE cs.doctor_id=d.id AND cs.hospital_id=$5 AND cs.is_active AND cs.starts_at>now())
                OR EXISTS(SELECT 1 FROM doctor_hospitals dh WHERE dh.doctor_id=d.id AND dh.hospital_id=$5))
            AND ($2='' OR d.city ILIKE '%'||$2||'%')
            AND ($3::integer IS NULL OR EXISTS(SELECT 1 FROM specialities sp WHERE sp.id=$3 AND
                (sp.name_en=ANY(d.specialities) OR sp.name_hi=ANY(d.specialities) OR EXISTS
                (SELECT 1 FROM doctor_specialities ds WHERE ds.doctor_id=d.id AND ds.speciality_id=sp.id))))
            AND ($1='' OR d.name ILIKE '%'||$1||'%' OR array_to_string(d.specialities,',') ILIKE '%'||$1||'%'
                OR EXISTS(SELECT 1 FROM care_concerns cc JOIN specialities sp ON sp.id=cc.speciality_id
                    WHERE $1 ILIKE '%'||cc.keyword||'%' AND (sp.name_en=ANY(d.specialities) OR sp.name_hi=ANY(d.specialities)
                    OR EXISTS(SELECT 1 FROM doctor_specialities ds WHERE ds.doctor_id=d.id AND ds.speciality_id=sp.id))))
            ORDER BY next_available NULLS LAST,d.average_rating DESC,d.id LIMIT 100`, [q,city,speciality,doctorId,hospitalId]);
        res.json(result.rows);
    }));
    router.get('/packages', route(async (req,res) => {
        const treatment = req.query.treatment ? integer(req.query.treatment) : null;
        const doctor = req.query.doctor ? integer(req.query.doctor) : null;
        const result = await db.query(`SELECT p.*,h.name AS hospital_name,h.city,t.name AS treatment_name
            FROM care_packages p JOIN hospitals h ON h.id=p.hospital_id JOIN treatments t ON t.id=p.treatment_id
            WHERE p.is_active AND p.valid_until>=CURRENT_DATE AND h.is_active AND h.deleted_at IS NULL
            AND ($1::bigint IS NULL OR p.treatment_id=$1) AND ($2::integer IS NULL OR EXISTS
              (SELECT 1 FROM care_slots s WHERE s.hospital_id=h.id AND s.doctor_id=$2 AND s.is_active AND s.starts_at>now()))
            ORDER BY p.min_price,p.id LIMIT 100`, [treatment,doctor]);
        res.json(result.rows);
    }));
    router.get('/slots', route(async (req,res) => {
        const doctor=integer(req.query.doctor), hospital=req.query.hospital?integer(req.query.hospital):null;
        const r=await db.query(`SELECT s.*,h.name AS hospital_name,s.capacity-(SELECT count(*) FROM care_appointments a
            WHERE a.slot_id=s.id AND a.status<>'cancelled') AS remaining FROM care_slots s
            JOIN doctors d ON d.id=s.doctor_id JOIN hospitals h ON h.id=s.hospital_id
            WHERE s.doctor_id=$1 AND ($2::integer IS NULL OR s.hospital_id=$2) AND s.is_active AND s.starts_at>now()
            AND d.is_active AND d.is_verified AND d.deleted_at IS NULL AND h.is_active AND h.deleted_at IS NULL
            ORDER BY s.starts_at LIMIT 100`,[doctor,hospital]);
        res.json(r.rows.filter(s=>Number(s.remaining)>0));
    }));
    router.use(auth);
    router.get('/session', (req,res)=>res.json({user:req.user,canManage:!!req.user.isadmin||!!req.hospitals.length}));
    router.post('/appointments', route(async (req,res) => {
        const b=req.body, slotId=integer(b.slot_id), key=uuid(b.request_key);
        const name=text(b.patient_name,100), phone=text(b.patient_phone,20), requirement=text(b.requirement);
        if(!/^\+?[0-9 ()-]{8,20}$/.test(phone)) fail(400,'Enter a valid phone number.');
        const result=await transaction(async c=>{
            await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`${req.user.id}:${key}`]);
            const prior=await c.query('SELECT * FROM care_appointments WHERE user_id=$1 AND request_key=$2',[req.user.id,key]);
            if(prior.rowCount) return prior.rows[0];
            const s=(await c.query(`SELECT s.*,d.consultation_fee FROM care_slots s JOIN doctors d ON d.id=s.doctor_id
                JOIN hospitals h ON h.id=s.hospital_id WHERE s.id=$1 AND s.is_active AND s.starts_at>now()
                AND d.is_active AND d.is_verified AND d.deleted_at IS NULL AND h.is_active AND h.deleted_at IS NULL FOR UPDATE OF s`,[slotId])).rows[0];
            if(!s) fail(409,'This appointment slot is no longer available.');
            const used=Number((await c.query("SELECT count(*) FROM care_appointments WHERE slot_id=$1 AND status<>'cancelled'",[slotId])).rows[0].count);
            if(used>=s.capacity) fail(409,'This slot just filled up. Please choose another time.');
            let snapshot={consultation_fee:s.consultation_fee},packageId=null;
            if(b.package_id){
                packageId=integer(b.package_id);
                const p=(await c.query('SELECT * FROM care_packages WHERE id=$1 AND hospital_id=$2 AND is_active AND valid_until>=CURRENT_DATE FOR SHARE',[packageId,s.hospital_id])).rows[0];
                if(!p) fail(409,'This package is unavailable at the selected hospital.');
                snapshot={...snapshot,title:p.title,min_price:p.min_price,max_price:p.max_price,inclusions:p.inclusions,exclusions:p.exclusions};
            }
            const a=(await c.query(`INSERT INTO care_appointments(user_id,slot_id,package_id,patient_name,patient_phone,requirement,request_key,price_snapshot)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[req.user.id,slotId,packageId,name,phone,requirement,key,snapshot])).rows[0];
            await event(c,a.id,req.user.id,'confirmed','Appointment confirmed.');
            return a;
        });
        res.status(201).json(result);
    }));
    const appointments = async (req, managed) => {
        const r=await db.query(`SELECT a.*,d.name AS doctor_name,h.name AS hospital_name,h.id AS hospital_id,
            s.starts_at,s.ends_at,s.doctor_id, u.name AS account_name,
            (SELECT row_to_json(f) FROM care_assistance f WHERE f.appointment_id=a.id) AS assistance,
            COALESCE((SELECT json_agg(e ORDER BY e.created_at,e.id) FROM care_events e WHERE e.appointment_id=a.id),'[]') AS events,
            COALESCE((SELECT json_agg(f ORDER BY f.due_at) FROM care_followups f WHERE f.appointment_id=a.id),'[]') AS followups
            FROM care_appointments a JOIN care_slots s ON s.id=a.slot_id JOIN doctors d ON d.id=s.doctor_id
            JOIN hospitals h ON h.id=s.hospital_id JOIN users u ON u.id=a.user_id
            WHERE ($1::boolean AND ($2::boolean OR h.id=ANY($3::integer[]))) OR (NOT $1 AND a.user_id=$4)
            ORDER BY a.created_at DESC LIMIT 500`,[managed,!!req.user.isadmin,req.hospitals,req.user.id]);
        return r.rows;
    };
    router.get('/appointments',route(async(req,res)=>res.json(await appointments(req,false))));
    router.post('/appointments/:id/cancel',route(async(req,res)=>{
        const id=uuid(req.params.id);
        await transaction(async c=>{
            const a=(await c.query('SELECT * FROM care_appointments WHERE id=$1 AND user_id=$2 FOR UPDATE',[id,req.user.id])).rows[0];
            if(!a) fail(404,'Appointment not found.');
            if(a.status==='cancelled') return;
            if(a.status!=='confirmed') fail(409,'Please contact your care team to change an appointment already in progress.');
            await c.query("UPDATE care_appointments SET status='cancelled',updated_at=now() WHERE id=$1",[id]);
            await event(c,id,req.user.id,'cancelled','Cancelled by patient.');
        });res.json({success:true});
    }));
    router.post('/appointments/:id/reschedule',route(async(req,res)=>{
        const id=uuid(req.params.id),slotId=integer(req.body.slot_id);
        await transaction(async c=>{
            const a=(await c.query('SELECT * FROM care_appointments WHERE id=$1 AND user_id=$2 FOR UPDATE',[id,req.user.id])).rows[0];
            if(!a)fail(404,'Appointment not found.');
            if(a.status!=='confirmed')fail(409,'Only confirmed appointments can be rescheduled.');
            if(a.slot_id===slotId)return;
            const old=(await c.query('SELECT doctor_id,hospital_id FROM care_slots WHERE id=$1',[a.slot_id])).rows[0];
            const s=(await c.query(`SELECT s.* FROM care_slots s JOIN doctors d ON d.id=s.doctor_id JOIN hospitals h ON h.id=s.hospital_id
                WHERE s.id=$1 AND s.is_active AND s.starts_at>now() AND d.is_active AND d.is_verified AND d.deleted_at IS NULL
                AND h.is_active AND h.deleted_at IS NULL FOR UPDATE OF s`,[slotId])).rows[0];
            if(!s||s.doctor_id!==old.doctor_id||s.hospital_id!==old.hospital_id)fail(409,'Choose another slot with the same doctor and hospital.');
            const used=Number((await c.query("SELECT count(*) FROM care_appointments WHERE slot_id=$1 AND status<>'cancelled'",[slotId])).rows[0].count);
            if(used>=s.capacity)fail(409,'This slot is full. Choose another time.');
            await c.query('UPDATE care_appointments SET slot_id=$1,updated_at=now() WHERE id=$2',[slotId,id]);
            await event(c,id,req.user.id,'rescheduled','Appointment rescheduled to '+new Date(s.starts_at).toISOString());
        });res.json({success:true});
    }));
    router.post('/appointments/:id/assistance',route(async(req,res)=>{
        const id=uuid(req.params.id),reason=text(req.body.reason),amount=money(req.body.requested_amount);
        if(amount<=0) fail(400,'Requested amount must be greater than zero.');
        const a=(await db.query('SELECT status FROM care_appointments WHERE id=$1 AND user_id=$2',[id,req.user.id])).rows[0];
        if(!a) fail(404,'Appointment not found.');
        if(['cancelled','no_show'].includes(a.status)) fail(409,'Assistance requires an active appointment.');
        const r=await db.query(`INSERT INTO care_assistance(appointment_id,reason,requested_amount) VALUES($1,$2,$3)
            ON CONFLICT(appointment_id) DO UPDATE SET reason=EXCLUDED.reason,requested_amount=EXCLUDED.requested_amount,
            status='submitted',decision_note='',decided_by=NULL,updated_at=now() WHERE care_assistance.status IN ('submitted','needs_information') RETURNING *`,[id,reason,amount]);
        if(!r.rowCount) fail(409,'This application is already being reviewed.');
        res.status(201).json(r.rows[0]);
    }));

    router.use('/manage',staff);
    router.get('/manage/overview',route(async(req,res)=>{
        const [bookings,packages,slots,catalog,concerns,members]=await Promise.all([
            appointments(req,true),
            db.query(`SELECT p.*,h.name AS hospital_name,t.name AS treatment_name FROM care_packages p JOIN hospitals h ON h.id=p.hospital_id
                JOIN treatments t ON t.id=p.treatment_id WHERE $1 OR p.hospital_id=ANY($2::integer[]) ORDER BY p.created_at DESC`,[!!req.user.isadmin,req.hospitals]),
            db.query(`SELECT s.*,d.name AS doctor_name,h.name AS hospital_name FROM care_slots s JOIN doctors d ON d.id=s.doctor_id JOIN hospitals h ON h.id=s.hospital_id
                WHERE ($1 OR s.hospital_id=ANY($2::integer[])) AND s.starts_at>now()-interval '1 day' ORDER BY s.starts_at`,[!!req.user.isadmin,req.hospitals]),
            db.query('SELECT id,uuid,name,is_verified,is_active FROM doctors WHERE deleted_at IS NULL ORDER BY name'),
            db.query('SELECT c.*,s.name_en FROM care_concerns c JOIN specialities s ON s.id=c.speciality_id ORDER BY keyword'),
            req.user.isadmin?db.query('SELECT m.id,m.hospital_id,u.email,h.name AS hospital_name FROM care_memberships m JOIN users u ON u.id=m.user_id JOIN hospitals h ON h.id=m.hospital_id ORDER BY m.id'):Promise.resolve({rows:[]}),
        ]);
        res.json({appointments:bookings,packages:packages.rows,slots:slots.rows,doctors:catalog.rows,concerns:concerns.rows,memberships:members.rows,isadmin:!!req.user.isadmin,hospital_ids:req.hospitals,transitions});
    }));
    router.post('/manage/packages',route(async(req,res)=>{
        const b=req.body,h=integer(b.hospital_id),t=integer(b.treatment_id);hospitalAccess(req,h);
        const min=money(b.min_price),max=money(b.max_price);if(max<min) fail(400,'Maximum price cannot be lower than minimum price.');
        const until=date(b.valid_until);if(until.getTime()<Date.now()-86400000) fail(400,'Package expiry must be today or later.');
        const r=await db.query(`INSERT INTO care_packages(hospital_id,treatment_id,title,min_price,max_price,inclusions,exclusions,valid_until)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[h,t,text(b.title,200),min,max,lines(b.inclusions||[]),lines(b.exclusions||[]),b.valid_until]);
        res.status(201).json(r.rows[0]);
    }));
    router.patch('/manage/packages/:id',route(async(req,res)=>{
        const id=integer(req.params.id),p=(await db.query('SELECT hospital_id FROM care_packages WHERE id=$1',[id])).rows[0];
        if(!p) fail(404,'Package not found.');hospitalAccess(req,p.hospital_id);
        if(req.body.title !== undefined) {
            const b=req.body,min=money(b.min_price),max=money(b.max_price);
            if(max<min)fail(400,'Maximum price cannot be lower than minimum price.');
            const until=date(b.valid_until);if(until.getTime()<Date.now()-86400000)fail(400,'Package expiry must be today or later.');
            await db.query(`UPDATE care_packages SET title=$1,min_price=$2,max_price=$3,inclusions=$4,exclusions=$5,valid_until=$6 WHERE id=$7`,
                [text(b.title,200),min,max,lines(b.inclusions||[]),lines(b.exclusions||[]),b.valid_until,id]);
        } else {
            if(typeof req.body.is_active!=='boolean') fail(400,'Specify package availability.');
            await db.query('UPDATE care_packages SET is_active=$1 WHERE id=$2',[req.body.is_active,id]);
        }
        res.json({success:true});
    }));
    router.post('/manage/slots',route(async(req,res)=>{
        const b=req.body,h=integer(b.hospital_id),d=integer(b.doctor_id),start=date(b.starts_at),end=date(b.ends_at),capacity=integer(b.capacity||1);hospitalAccess(req,h);
        if(start<=new Date()||end<=start||capacity>50) fail(400,'Choose a future start, a later end, and capacity from 1 to 50.');
        const r=await transaction(async c=>{
            await c.query('SELECT pg_advisory_xact_lock($1)',[d]);
            const overlap=await c.query('SELECT 1 FROM care_slots WHERE doctor_id=$1 AND is_active AND starts_at<$3 AND ends_at>$2',[d,start,end]);
            if(overlap.rowCount) fail(409,'This doctor already has availability during these hours.');
            return c.query('INSERT INTO care_slots(doctor_id,hospital_id,starts_at,ends_at,capacity) VALUES($1,$2,$3,$4,$5) RETURNING *',[d,h,start,end,capacity]);
        });res.status(201).json(r.rows[0]);
    }));
    router.patch('/manage/slots/:id',route(async(req,res)=>{
        const id=integer(req.params.id);
        await transaction(async c=>{
            const s=(await c.query('SELECT * FROM care_slots WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!s)fail(404,'Slot not found.');hospitalAccess(req,s.hospital_id);
            if((await c.query("SELECT 1 FROM care_appointments WHERE slot_id=$1 AND status NOT IN ('cancelled','completed','no_show')",[id])).rowCount) fail(409,'Manage existing appointments before closing this slot.');
            await c.query('UPDATE care_slots SET is_active=false WHERE id=$1',[id]);
        });res.json({success:true});
    }));
    const getManaged = async(c,req,id)=>{
        const a=(await c.query('SELECT a.*,s.hospital_id FROM care_appointments a JOIN care_slots s ON s.id=a.slot_id WHERE a.id=$1 FOR UPDATE OF a',[uuid(id)])).rows[0];
        if(!a)fail(404,'Appointment not found.');hospitalAccess(req,a.hospital_id);return a;
    };
    router.patch('/manage/appointments/:id',route(async(req,res)=>{
        const status=text(req.body.status,30),note=text(req.body.note);
        await transaction(async c=>{
            const a=await getManaged(c,req,req.params.id);
            if(!transitions[a.status]?.includes(status)) fail(409,'This status change is not allowed. Refresh the appointment.');
            await c.query('UPDATE care_appointments SET status=$1,updated_at=now() WHERE id=$2',[status,a.id]);
            await event(c,a.id,req.user.id,status,note);
        });res.json({success:true});
    }));
    router.patch('/manage/assistance/:id',route(async(req,res)=>{
        if(!req.user.isadmin)fail(403,'Only an administrator can decide financial assistance.');
        const status=text(req.body.status,30),note=text(req.body.decision_note);
        if(!['under_review','needs_information','approved','declined'].includes(status))fail(400,'Invalid assistance status.');
        await transaction(async c=>{
            const a=(await c.query('SELECT * FROM care_assistance WHERE id=$1 FOR UPDATE',[integer(req.params.id)])).rows[0];
            if(!a)fail(404,'Application not found.');if(['approved','declined'].includes(a.status))fail(409,'A final decision has already been recorded.');
            await c.query('UPDATE care_assistance SET status=$1,decision_note=$2,decided_by=$3,updated_at=now() WHERE id=$4',[status,note,req.user.id,a.id]);
            await event(c,a.appointment_id,req.user.id,'assistance_'+status,note);
        });res.json({success:true});
    }));
    router.post('/manage/appointments/:id/followups',route(async(req,res)=>{
        const due=date(req.body.due_at),note=text(req.body.note);if(due<=new Date())fail(400,'Choose a future follow-up time.');
        await transaction(async c=>{
            const a=await getManaged(c,req,req.params.id);if(['cancelled','no_show','completed'].includes(a.status))fail(409,'This care journey is closed.');
            await c.query('INSERT INTO care_followups(appointment_id,due_at,note,created_by) VALUES($1,$2,$3,$4)',[a.id,due,note,req.user.id]);
            await event(c,a.id,req.user.id,'followup_scheduled',note);
        });res.status(201).json({success:true});
    }));
    router.patch('/manage/followups/:id',route(async(req,res)=>{
        await transaction(async c=>{
            const f=(await c.query('SELECT * FROM care_followups WHERE id=$1',[integer(req.params.id)])).rows[0];if(!f)fail(404,'Follow-up not found.');
            await getManaged(c,req,f.appointment_id);
            const done=await c.query('UPDATE care_followups SET completed_at=now() WHERE id=$1 AND completed_at IS NULL RETURNING id',[f.id]);
            if(done.rowCount)await event(c,f.appointment_id,req.user.id,'followup_completed',f.note);
        });res.json({success:true});
    }));
    router.post('/manage/concerns',route(async(req,res)=>{
        if(!req.user.isadmin)fail(403,'Administrator access required.');
        await db.query('INSERT INTO care_concerns(keyword,speciality_id) VALUES($1,$2) ON CONFLICT(keyword) DO UPDATE SET speciality_id=EXCLUDED.speciality_id',[text(req.body.keyword,120).toLowerCase(),integer(req.body.speciality_id)]);
        res.status(201).json({success:true});
    }));
    router.post('/manage/memberships',route(async(req,res)=>{
        if(!req.user.isadmin)fail(403,'Administrator access required.');
        const u=(await db.query('SELECT id FROM users WHERE email=$1',[text(req.body.email,255).toLowerCase()])).rows[0];if(!u)fail(404,'Ask the staff member to register an account first.');
        await db.query('INSERT INTO care_memberships(user_id,hospital_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[u.id,integer(req.body.hospital_id)]);res.status(201).json({success:true});
    }));
    router.delete('/manage/memberships/:id',route(async(req,res)=>{
        if(!req.user.isadmin)fail(403,'Administrator access required.');
        await db.query('DELETE FROM care_memberships WHERE id=$1',[integer(req.params.id)]);res.json({success:true});
    }));
    router.use((err,req,res,next)=>{
        if(res.headersSent)return next(err);
        const status=err.status||(err.code==='23505'?409:['23503','23514','22P02','22007'].includes(err.code)?400:500);
        if(status===500)console.error('Hospital care request failed:',err.code||err.message);
        res.status(status).json({message:err.status?err.message:status===409?'This entry already exists.':status===400?'Check your selections and entered values.':'Unable to complete the request. Please try again.'});
    });
    return router;
}
module.exports = {createCareRouter,transitions};

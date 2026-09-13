"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical, RefreshCw, Plus, ArrowUpRight, X, Download, Search,
  CheckCircle2, Clock, FileText, AlertCircle, ShieldCheck, MapPin, Phone,
  FileCheck2, ArrowRight, Check
} from 'lucide-react';
import { labApi, labTabs, labStatuses, title, rupees } from '@/lib/lab-api';

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors';
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const date = v => new Date(v).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

const fields = {
 tests: [
  ['name','Name'],
  ['kind','Type','kind'],
  ['price','Price (INR)','number'],
  ['sample_type','Sample type'],
  ['turnaround_hours','Report turnaround (hours)','number'],
  ['home_collection','Home Collection Service Available?','home_collection'],
  ['preparation','Patient preparation','textarea'],
  ['includes','Included tests (for packages)','textarea']
 ],
 laboratories: [['name','Laboratory name'],['phone','Phone','tel'],['address','Address','textarea']],
 collectors: [['name','Collector name'],['phone','Phone','tel'],['area_id','Service area','areas']],
 areas: [['name','Village / service area'],['pincode','Pincode'],['collection_fee','Home collection fee (INR)','number']],
};

function Field({ label, children }) { return <label className="block space-y-1.5 text-sm font-medium text-slate-600"><span>{label}</span>{children}</label>; }
function Empty({ children }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{children}</div>; }
function Status({ value }) {
 return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
   value==='report_ready'?'bg-emerald-100 text-emerald-800':
   value==='processing'?'bg-purple-100 text-purple-800':
   value==='received'?'bg-indigo-100 text-indigo-800':
   value==='collected'?'bg-amber-100 text-amber-800':
   value==='assigned'?'bg-blue-100 text-blue-800':
   value==='cancelled'?'bg-red-100 text-red-700':
   'bg-slate-100 text-slate-700'
 }`}>
   <span className={`h-1.5 w-1.5 rounded-full ${
     value==='report_ready'?'bg-emerald-500':
     value==='processing'?'bg-purple-500 animate-pulse':
     value==='received'?'bg-indigo-500':
     value==='collected'?'bg-amber-500':
     value==='assigned'?'bg-blue-500':
     value==='cancelled'?'bg-red-500':'bg-slate-400'
   }`} />
   {title(value)}
 </span>;
}

const pipelineSteps = [
  { key: 'confirmed', label: '1. Booking Confirmed' },
  { key: 'assigned', label: '2. Collector Assigned' },
  { key: 'collected', label: '3. Sample Collected' },
  { key: 'received', label: '4. Lab Received & Verified' },
  { key: 'processing', label: '5. In Testing (NABL)' },
  { key: 'report_ready', label: '6. Report Ready' },
];

export function MasterForm({ kind, item, masters, onSave, onCancel, busy }) {
 const [form,setForm]=useState(item || {kind:'test',is_active:true,home_collection:true,collection_fee:0,price:0,turnaround_hours:24});
 return <form className={card+' space-y-4'} onSubmit={e=>{e.preventDefault();onSave(form);}}>
  <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">{item?'Edit':'Add'} {kind==='tests'?'test / package':title(kind)}</h3><button type="button" onClick={onCancel} aria-label="Close form"><X size={18}/></button></div>
  <div className="grid gap-4 sm:grid-cols-2">{fields[kind].map(([key,label,type])=><Field key={key} label={label}>
   {type==='kind'||type==='areas'||type==='home_collection'?<select className={input} required value={type==='home_collection'?(form.home_collection!==false?'yes':'no'):(form[key]||'')} onChange={e=>setForm({...form,[key]:type==='home_collection'?(e.target.value==='yes'):e.target.value})}>
    {type==='home_collection' ? <>
      <option value="yes">Yes - Home Collection Available (Doorstep pickup)</option>
      <option value="no">No - Service NOT available in home service (Lab Visit Only)</option>
    </> : <>
      <option value="">Select</option>{(type==='kind'?[{id:'test',name:'Test'},{id:'package',name:'Health package'}]:masters.areas).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
    </>}
   </select>:type==='textarea'?<textarea className={input} rows={3} maxLength={2000} required={key==='address'} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input className={input} type={type||'text'} min={key==='turnaround_hours'?1:0} step={key==='turnaround_hours'?1:'0.01'} maxLength={500} required value={form[key]??''} onChange={e=>setForm({...form,[key]:e.target.value})}/>}
  </Field>)}</div>
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Active and available</label>
  <button disabled={busy} className={button}>{busy?'Saving…':'Save'}</button>
 </form>;
}

export function BookingForm({ catalog, users, onCreated, onCancel }) {
 const [form,setForm]=useState({patient_name:'',phone:'',address:'',area_id:'',collection_at:''});
 const [selected,setSelected]=useState([]),[search,setSearch]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const requestKey=useRef(null);
 const area=catalog.areas.find(a=>String(a.id)===form.area_id);
 const total=catalog.tests.filter(t=>selected.includes(t.id)).reduce((sum,t)=>sum+Number(t.price),Number(area?.collection_fee||0));
 const submit=async e=>{e.preventDefault();setError('');setBusy(true);try{
  requestKey.current ||= crypto.randomUUID();
  const result=await labApi('/bookings',{method:'POST',body:{...form,collection_at:new Date(form.collection_at).toISOString(),test_ids:selected,request_key:requestKey.current}});
  onCreated(result);
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 return <form onSubmit={submit} className={card+' space-y-5'}>
  <div className="flex justify-between"><h2 className="text-lg font-bold">Book a home collection</h2>{onCancel&&<button type="button" onClick={onCancel} aria-label="Close booking form"><X size={20}/></button>}</div>
  {users&&<Field label="Patient account (receives booking and report)"><select required className={input} value={form.patient_user_id||''} onChange={e=>{requestKey.current=null;setForm({...form,patient_user_id:e.target.value});}}><option value="">Select an existing patient account</option>{users.map(u=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select></Field>}
  <input className={input} aria-label="Search tests" placeholder="Search tests and health packages" value={search} onChange={e=>setSearch(e.target.value)}/>
  {!catalog.tests.length?<Empty>No tests are available yet. Please check again later.</Empty>:<div className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">{catalog.tests.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())).map(t=>{
    const isHomeAvail = t.home_collection !== false;
    const isChecked = selected.includes(t.id);
    return (
      <div key={t.id} className={`rounded-xl border p-4 transition-all ${
        !isHomeAvail 
          ? 'border-amber-200 bg-amber-50/60' 
          : isChecked 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-200 hover:border-slate-300'
      }`}>
       <div className="flex items-start gap-3">
        {isHomeAvail ? (
          <input 
            type="checkbox" 
            className="mt-1 h-4 w-4 text-blue-600 rounded cursor-pointer" 
            checked={isChecked} 
            onChange={e=>{
              requestKey.current=null;
              setSelected(e.target.checked?[...selected,t.id]:selected.filter(id=>id!==t.id));
            }}
          />
        ) : (
          <div className="mt-1 h-4 w-4 rounded-full border border-amber-400 bg-amber-100 flex items-center justify-center shrink-0" title="Home collection not available">
            <span className="text-[10px] text-amber-700 font-bold">✕</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <p className="font-semibold text-slate-900">{t.name}</p>
            {isHomeAvail ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                🏠 Home Collection Available
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                🏥 Lab Visit Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{title(t.kind)} · Specimen: <span className="font-medium text-slate-700">{t.sample_type}</span> · {t.turnaround_hours}h report</p>
          <p className="mt-1 font-bold text-blue-700">{rupees(t.price)}</p>

          {!isHomeAvail && (
            <div className="mt-2 rounded-lg bg-white border border-amber-200 p-2 text-xs text-amber-900 flex items-start gap-1.5">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5"/>
              <span><strong>Yeh service home available nahi hai:</strong> Kripya nearest diagnostic lab me jaakar iska test karwayen. (Service not available to collect sample in home service).</span>
            </div>
          )}

          {t.includes&&<p className="mt-1.5 text-xs text-slate-600">Includes: {t.includes}</p>}
          {t.preparation&&<p className="mt-0.5 text-xs text-amber-700">Prep: {t.preparation}</p>}
        </div>
       </div>
      </div>
    );
  })}</div>}
  <div className="grid gap-4 sm:grid-cols-2">{[['patient_name','Patient name','text'],['phone','Mobile number','tel'],['address','Full collection address','text'],['collection_at','Collection date & time','datetime-local']].map(([key,label,type])=><Field key={key} label={label}><input required className={input} type={type} value={form[key]} onChange={e=>{requestKey.current=null;setForm({...form,[key]:e.target.value});}}/></Field>)}
   <Field label="Village / service area"><select required className={input} value={form.area_id} onChange={e=>{requestKey.current=null;setForm({...form,area_id:e.target.value});}}><option value="">Select service area</option>{catalog.areas.map(a=><option key={a.id} value={a.id}>{a.name} · {a.pincode}</option>)}</select></Field>
  </div>
  <div className="rounded-xl bg-slate-50 p-4"><p className="font-bold">Total: {rupees(total)}</p><p className="mt-1 text-sm text-slate-600">Includes {rupees(area?.collection_fee)} home collection fee. Pay cash on collection.</p></div>
  {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
  <button className={button} disabled={busy||!selected.length||!area}>{busy?'Booking…':'Confirm booking'}</button>
 </form>;
}

export function BookingDetail({ booking:b, session, masters, onRefresh, onClose }) {
 const [events,setEvents]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [assignment,setAssignment]=useState({collector_id:b.collector_id||'',laboratory_id:b.laboratory_id||'',collector_due:b.collector_due,lab_due:b.lab_due});
 const [barcode,setBarcode]=useState(''),[note,setNote]=useState(''),[paid,setPaid]=useState(b.paid_amount);
 const [checklist,setChecklist]=useState({barcodeVerified:false,specimenIntegrity:false,patientMatched:false});
 const admin=!!session?.user?.isadmin, collector=!!session?.membership?.collector_id&&String(session.membership.collector_id)===String(b.collector_id), lab=!!session?.membership?.laboratory_id&&String(session.membership.laboratory_id)===String(b.laboratory_id), owner=String(session?.user?.id)===String(b.user_id);
 
 const refreshEvents=useCallback(()=>labApi(`/bookings/${b.id}/events`).then(setEvents).catch(e=>setError(e.message)),[b.id]);
 useEffect(()=>{refreshEvents();},[refreshEvents,b.status,b.has_report,b.paid_amount]);
 
 async function act(path,body,method='POST') {setError('');setBusy(true);try{await labApi(`/bookings/${b.id}/${path}`,{method,body});await onRefresh();await refreshEvents();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function download() {setBusy(true);setError('');try{const blob=await labApi(`/bookings/${b.id}/report`,{download:true});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`lab-report-${b.id}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function upload(file) {if(!file)return;if(file.size>5*1024*1024){setError('Choose a PDF smaller than 5 MB.');return;}try{const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Cannot read this file.'));reader.readAsDataURL(file);});await act('report',{filename:file.name,content},'PUT');}catch(e){setError(e.message);}}

 const next=({assigned:'collected',collected:'received',received:'processing',processing:'report_ready'})[b.status];
 const canAdvance=next&&(admin||(next==='collected'&&collector)||(next!=='collected'&&lab));
 const currentStepIndex=pipelineSteps.findIndex(s=>s.key===b.status);

 return <div className={card+' space-y-6'}>
  <div className="flex items-start justify-between gap-4">
   <div>
    <div className="flex flex-wrap items-center gap-2">
     <h2 className="text-xl font-bold text-slate-900">{b.patient_name}</h2>
     <Status value={b.status}/>
    </div>
    <p className="mt-1 font-mono text-xs text-slate-500">Booking ID: {b.id}</p>
   </div>
   <button type="button" onClick={onClose} aria-label="Close booking details" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20}/></button>
  </div>

  {/* Visual Workflow Stepper matching flow diagram */}
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
   <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Workflow Progress (Rural Diagnostic Flow)</p>
   <div className="flex flex-wrap items-center gap-1 sm:gap-2">
    {pipelineSteps.map((step, idx) => {
      const isPast = currentStepIndex > idx;
      const isCurrent = currentStepIndex === idx;
      return (
        <div key={step.key} className="flex items-center text-xs">
          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${
            isCurrent ? 'bg-blue-600 text-white shadow-sm' :
            isPast ? 'bg-emerald-100 text-emerald-800' :
            'bg-slate-200/70 text-slate-500'
          }`}>
            {isPast ? <Check size={12}/> : isCurrent ? <Clock size={12}/> : null}
            {step.label}
          </span>
          {idx < pipelineSteps.length - 1 && <ArrowRight size={12} className="mx-1 text-slate-400" />}
        </div>
      );
    })}
   </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
   <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-1 text-sm">
    <p className="text-xs font-semibold text-slate-400 uppercase">Patient & Location</p>
    <p className="font-semibold text-slate-900 flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {b.phone}</p>
    <p className="text-slate-600 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 text-slate-400 shrink-0"/> {b.address}, {b.area_name}</p>
    {(admin||collector)&&<a className={secondary+' mt-2 text-xs'} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address+' '+b.area_name)}`} target="_blank" rel="noreferrer">Navigate to Patient (Maps) <ArrowUpRight size={14}/></a>}
   </div>
   <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-1 text-sm">
    <p className="text-xs font-semibold text-slate-400 uppercase">Operations & Staff</p>
    <p className="text-slate-700">Scheduled: <strong className="text-slate-900">{date(b.collection_at)}</strong></p>
    <p className="text-slate-700">Collector: <strong className="text-slate-900">{b.collector_name || 'Unassigned'}</strong></p>
    <p className="text-slate-700">Diagnostic Lab: <strong className="text-slate-900">{b.laboratory_name || 'Unassigned'}</strong></p>
   </div>
  </div>

  {/* Tests and Required Sample Types */}
  <div className="rounded-xl border border-slate-200 bg-white p-4">
   <h3 className="mb-2 text-sm font-bold text-slate-800">Tests & Required Specimen Types</h3>
   <div className="divide-y divide-slate-100">
    {b.items?.map((item, idx) => (
     <div key={idx} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <div>
       <span className="font-medium text-slate-900">{item.name}</span>
       {item.sample_type && <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Specimen: {item.sample_type}</span>}
       {item.preparation && <p className="mt-0.5 text-xs text-amber-700">Prep: {item.preparation}</p>}
      </div>
      <span className="font-semibold text-slate-700">{rupees(item.price)}</span>
     </div>
    ))}
   </div>
  </div>

  {/* Barcode Station */}
  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
   <div>
    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Sample Barcode / Label ID</p>
    <p className="mt-1 font-mono text-base font-bold text-blue-900">{b.barcode}</p>
    <p className="text-xs text-slate-500">Scan or type this ID to verify sample intake at the diagnostic lab.</p>
   </div>
   {canAdvance && ['collected','received'].includes(next) && (
     <button className={secondary+' text-xs'} onClick={()=>setBarcode(b.barcode)}>Fill matching barcode</button>
   )}
  </div>

  {/* Admin Assignment */}
  {admin&&['confirmed','assigned'].includes(b.status)&&<form className="space-y-3 rounded-xl border border-slate-200 p-4" onSubmit={e=>{e.preventDefault();act('assign',assignment);}}>
   <h3 className="font-semibold text-slate-900">Assign collection & laboratory</h3>
   <div className="grid gap-3 sm:grid-cols-2">
    <Field label="Collector in this area"><select required className={input} value={assignment.collector_id} onChange={e=>setAssignment({...assignment,collector_id:e.target.value})}><option value="">Choose collector</option>{masters.collectors.filter(c=>c.is_active&&String(c.area_id)===String(b.area_id)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field label="Laboratory"><select required className={input} value={assignment.laboratory_id} onChange={e=>setAssignment({...assignment,laboratory_id:e.target.value})}><option value="">Choose laboratory</option>{masters.laboratories.filter(l=>l.is_active).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
    {['collector_due','lab_due'].map(key=><Field key={key} label={`${title(key)} (INR)`}><input className={input} type="number" min="0" step="0.01" required value={assignment[key]} onChange={e=>setAssignment({...assignment,[key]:e.target.value})}/></Field>)}
   </div>
   <button disabled={busy} className={button}>Save assignment</button>
  </form>}

  {/* Workflow Stage Actions */}
  {(canAdvance||((admin||owner)&&['confirmed','assigned'].includes(b.status)))&&<div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
   <div className="flex items-center justify-between">
    <h3 className="font-bold text-slate-900">Next Action: {title(next)}</h3>
    <span className="text-xs text-slate-500">Step {currentStepIndex + 2} of 6</span>
   </div>

   {/* Scan & Verify Station for Lab Intake */}
   {canAdvance && next === 'received' && (
     <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
       <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
         <ShieldCheck size={18} className="text-indigo-600"/>
         <span>Diagnostic Lab Intake: Scan & Verify Sample</span>
       </div>
       <p className="text-xs text-indigo-700">Verify patient identity and match sample barcode before receiving into testing queue.</p>
       
       <Field label="Scan or Enter Sample Barcode ID">
         <input className={input} placeholder="Scan barcode with scanner or enter manually" value={barcode} onChange={e=>setBarcode(e.target.value)} autoComplete="off"/>
       </Field>

       <div className="space-y-1.5 text-xs text-slate-700 pt-1">
         <label className="flex items-center gap-2 cursor-pointer">
           <input type="checkbox" checked={checklist.patientMatched} onChange={e=>setChecklist({...checklist, patientMatched: e.target.checked})}/>
           <span>Patient details verified ({b.patient_name}, {b.phone})</span>
         </label>
         <label className="flex items-center gap-2 cursor-pointer">
           <input type="checkbox" checked={checklist.specimenIntegrity} onChange={e=>setChecklist({...checklist, specimenIntegrity: e.target.checked})}/>
           <span>Sample container & cold chain integrity adequate</span>
         </label>
       </div>
     </div>
   )}

   {/* Collector Barcode verification on collection */}
   {canAdvance && next === 'collected' && (
     <Field label="Enter Barcode on Collected Sample Tube">
       <input className={input} placeholder="Enter barcode label pasted on vial" value={barcode} onChange={e=>setBarcode(e.target.value)} autoComplete="off"/>
     </Field>
   )}

   {/* NABL Standard Testing Checklist */}
   {canAdvance && next === 'processing' && (
     <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 text-xs space-y-2">
       <p className="font-semibold text-purple-900">NABL Standard Testing Procedures</p>
       <p className="text-purple-700">Sample verified. Running tests on calibrated analyzers according to standard diagnostic protocols.</p>
     </div>
   )}

   <Field label="Internal Notes / Action Remarks">
     <textarea className={input} placeholder="Optional notes for lab records or cancellation reason" value={note} onChange={e=>setNote(e.target.value)} maxLength={1000}/>
   </Field>

   <div className="flex flex-wrap gap-2 pt-2">
     {canAdvance&&<button disabled={busy||(next==='report_ready'&&!b.has_report)||(['collected','received'].includes(next)&&!barcode.trim())} className={button} onClick={()=>act('status',{status:next,barcode,note})}>
       {next==='received'?'Scan & Verify (Mark Received)':
        next==='processing'?'Process Tests (NABL Compliant)':
        next==='report_ready'?'Mark Report Ready & Notify Patient':
        `Mark ${title(next)}`}
     </button>}
     {(admin||owner)&&['confirmed','assigned'].includes(b.status)&&<button disabled={busy} className={secondary} onClick={()=>act('status',{status:'cancelled',note})}>Cancel booking</button>}
   </div>
  </div>}

  {/* PDF Report Upload & Preview */}
  {(admin||lab)&&(b.status==='processing'||b.status==='report_ready')&&<div className="space-y-3 rounded-xl border border-slate-200 p-4">
   <div className="flex items-center justify-between">
     <h3 className="font-semibold text-slate-900 flex items-center gap-2">
       <FileText size={16} className="text-blue-600"/> Digital Report (PDF, up to 5 MB)
     </h3>
     {b.has_report && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Report Uploaded</span>}
   </div>
   {b.report_filename && <p className="text-xs text-slate-600">Current file: <strong className="text-slate-900">{b.report_filename}</strong> {b.report_uploaded_at && `(Uploaded ${date(b.report_uploaded_at)})`}</p>}
   
   <Field label={b.has_report ? "Replace digital report (PDF)" : "Upload digital report against patient booking ID"}>
     <input type="file" accept="application/pdf,.pdf" disabled={busy} className={input} onChange={e=>{upload(e.target.files[0]);e.target.value='';}}/>
   </Field>
  </div>}

  {/* Download Report */}
  {b.has_report&&(admin||lab||(owner&&b.status==='report_ready'))&&<div className="rounded-xl bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
   <div>
     <p className="text-sm font-bold text-emerald-900">Diagnostic Report is Available</p>
     <p className="text-xs text-emerald-700">Digital PDF report certified by diagnostic laboratory.</p>
   </div>
   <button disabled={busy} className={button} onClick={download}><Download size={16}/> Download PDF Report</button>
  </div>}

  {/* Payments & settlements for Admin */}
  {admin&&<div className="space-y-3 rounded-xl bg-slate-50 p-4">
   <h3 className="font-semibold">Payments & settlements</h3>
   <p className="text-sm">Total {rupees(b.total)} · Paid {rupees(b.paid_amount)}</p>
   <form onSubmit={e=>{e.preventDefault();act('payment',{paid_amount:paid,note});}} className="space-y-3">
    <Field label="Total cash received (INR)"><input required className={input} type="number" min="0" max={b.total} step="0.01" value={paid} onChange={e=>setPaid(e.target.value)}/></Field>
    <Field label="Receipt / refund reference"><input required className={input} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></Field>
    <button disabled={busy||b.status==='cancelled'} className={secondary}>Record payment</button>
   </form>
   {['collector','lab'].map(party=><div key={party} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3"><span className="text-sm">{title(party)}: {rupees(b[party+'_due'])}</span><button className={secondary} disabled={busy||b[party+'_settled']||b.status!=='report_ready'||Number(b.paid_amount)<Number(b.total)||!note.trim()} onClick={()=>act('settle',{party,note})}>{b[party+'_settled']?'Settlement recorded':'Record settlement'}</button></div>)}
   <p className="text-xs text-slate-500">Records payments made outside the app. Enter the transfer reference before recording a settlement.</p>
  </div>}

  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

  {/* Activity History and Automatic System Notifications */}
  <div>
   <h3 className="mb-3 font-semibold text-slate-900">Activity & Automatic System Notifications</h3>
   <ol className="space-y-3 border-l-2 border-blue-200 pl-4">
    {events.map((e,i)=>{
      const isNotif = e.note && (e.note.toLowerCase().includes('notif') || e.note.toLowerCase().includes('sms') || e.status === 'report_ready');
      return (
        <li key={i} className="text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{title(e.status)}</span>
            {isNotif && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">Notification Dispatched</span>}
          </div>
          <p className="text-slate-600">{e.note}</p>
          <time className="text-xs text-slate-400">{date(e.created_at)}</time>
        </li>
      );
    })}
   </ol>
  </div>
 </div>;
}

export default function LabDashboard({ tab='overview' }) {
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState('');
 const [edit,setEdit]=useState(null),[selected,setSelected]=useState(null),[newBooking,setNewBooking]=useState(false),[search,setSearch]=useState(''),[status,setStatus]=useState('');
 const [access,setAccess]=useState({user_id:'',role:'laboratory',target:''});
 const [staffMode,setStaffMode]=useState('create');
 const [newStaff,setNewStaff]=useState({name:'',email:'',phone:'',password:'',role:'laboratory',target:''});
 const load=useCallback(async()=>{const [session,masters,bookings,analytics]=await Promise.all([labApi('/session'),labApi('/admin/masters'),labApi('/bookings'),labApi('/admin/analytics')]);setData({session,masters,bookings,analytics});},[]);
 useEffect(()=>{let active=true;load().catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[load]);
 async function save(path,body,method='POST'){setBusy(true);setError('');setNotice('');try{await labApi(path,{method,body});await load();setEdit(null);setNotice('Saved successfully.');}catch(e){setError(e.message);}finally{setBusy(false);}}
 if(loading)return <div className="p-10 text-slate-500">Loading lab dashboard…</div>;
 if(!data)return <div className="p-6"><p role="alert" className="text-red-600">{error}</p><button className={secondary+' mt-3'} onClick={()=>{setLoading(true);load().catch(e=>setError(e.message)).finally(()=>setLoading(false));}}>Retry</button></div>;
 const {masters,bookings,session,analytics}=data;
 const summary=analytics.summary;
 const activeBooking=bookings.find(b=>b.id===selected);
 const filtered=bookings.filter(b=>(!status||b.status===status)&&`${b.patient_name} ${b.phone} ${b.id} ${b.barcode} ${b.area_name}`.toLowerCase().includes(search.toLowerCase())&&(tab!=='reports'||['collected','received','processing','report_ready'].includes(b.status)));
 const stats=[['Bookings',summary.total],['Awaiting assignment',summary.confirmed],['In processing',summary.received+summary.processing],['Reports ready',summary.report_ready]];
 const catalog={tests:masters.tests.filter(t=>t.is_active),areas:masters.areas.filter(a=>a.is_active)};

 return <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-7">
  <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Muft Madad · Diagnostics</p><h1 className="text-2xl font-bold text-slate-900">{labTabs.find(([key])=>key===tab)?.[1]||'Lab Dashboard'}</h1><p className="mt-1 text-sm text-slate-500">Home collection, sample processing and report delivery.</p></div><div className="flex gap-2"><button aria-label="Refresh lab dashboard" className={secondary} onClick={()=>load().catch(e=>setError(e.message))}><RefreshCw size={16}/></button><Link href="/labs/workspace" className={secondary}>Staff workspace <ArrowUpRight size={16}/></Link><Link href="/labs" className={secondary}>Patient portal <ArrowUpRight size={16}/></Link></div></header>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
  
  {/* Interactive Workflow Pipeline Bar */}
  {['overview','bookings','reports'].includes(tab) && (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Workflow Pipeline Tracker</h2>
        <span className="text-xs text-blue-600 font-semibold">{bookings.length} active bookings</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={()=>setStatus('')} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${status===''?'bg-blue-600 text-white shadow-sm':'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
          All ({bookings.length})
        </button>
        {labStatuses.filter(s=>s!=='cancelled').map(s => {
          const count = summary[s] || 0;
          return (
            <button key={s} onClick={()=>setStatus(status===s?'':s)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${status===s?'bg-blue-600 text-white shadow-sm':'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
              <span>{title(s)}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[11px] ${status===s?'bg-white/25 text-white':'bg-slate-200 text-slate-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  )}

  <nav aria-label="Lab navigation" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{labTabs.map(([key,name])=><Link key={key} href={`/dashboard?page=lab&tab=${key}`} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab===key?'bg-blue-600 text-white':'text-slate-600 hover:bg-slate-100'}`}>{name}</Link>)}</nav>
  {tab==='overview'&&<>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label,value])=><div className={card} key={label}><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>)}</div>
   <div className="grid gap-4 sm:grid-cols-3">
    <div className={card}><p className="text-xs font-semibold text-slate-400">Booking value</p><p className="mt-2 text-2xl font-bold text-slate-900">{rupees(summary.gross_sales)}</p></div>
    <div className={card}><p className="text-xs font-semibold text-slate-400">Cash received</p><p className="mt-2 text-2xl font-bold text-slate-900">{rupees(summary.cash_collected)}</p></div>
    <div className={card}><p className="text-xs font-semibold text-slate-400">Unsettled commissions</p><p className="mt-2 text-2xl font-bold text-slate-900">{rupees(summary.collector_unsettled+summary.lab_unsettled)}</p></div>
   </div>
   <div className={card+' space-y-4'}>
    <h2 className="font-bold">Start managing diagnostics</h2>
    <p className="text-sm text-slate-500">Add your service areas, tests, laboratories and collectors from the sidebar. Assign existing user accounts under Users &amp; Permissions.</p>
    <div className="flex flex-wrap gap-3">
      <button className={button} onClick={()=>setNewBooking(true)}><Plus size={16}/>New booking</button>
      <Link href="/labs/workspace" className={secondary}>Collector / laboratory workspace <ArrowUpRight size={16}/></Link>
    </div>
   </div>
   {analytics.areas.length > 0 && <div className={card+' space-y-3'}>
      <h3 className="font-bold text-slate-900">Area Performance</h3>
      <div className="divide-y divide-slate-100">
        {analytics.areas.map(a => {
          const areaObj = masters.areas.find(ma => String(ma.id) === String(a.area_id));
          return (
            <div key={a.area_id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-slate-700">{areaObj?.name || 'Area #' + a.area_id}</span>
              <span className="text-slate-500">{a.total} bookings · {rupees(a.revenue)}</span>
            </div>
          );
        })}
      </div>
    </div>}
  </>}
  {fields[tab]&&<><div className="flex justify-end"><button className={button} onClick={()=>setEdit({})}><Plus size={16}/>Add {tab==='tests'?'test / package':title(tab)}</button></div>{edit&&<MasterForm key={edit.id||'new'} kind={tab} item={edit.id?edit:null} masters={masters} busy={busy} onCancel={()=>setEdit(null)} onSave={body=>save(`/admin/masters/${tab}${edit.id?'/'+edit.id:''}`,body,edit.id?'PUT':'POST')}/>}
   {!masters[tab].length?<Empty>No {tab} added yet. Add the first record to get started.</Empty>:<div className="grid gap-4 md:grid-cols-2">{masters[tab].map(item=><div className={card} key={item.id}><div className="flex justify-between gap-3"><h3 className="font-bold">{item.name}</h3><span className={`text-xs ${item.is_active?'text-emerald-700':'text-slate-400'}`}>{item.is_active?'Active':'Inactive'}</span></div><div className="my-3 space-y-1 text-sm text-slate-500">{fields[tab].filter(([key])=>key!=='name').map(([key,label])=><p key={key}><span>{label}: </span>{key==='area_id'?masters.areas.find(a=>String(a.id)===String(item[key]))?.name:key==='home_collection'?(item[key]!==false?'Yes (Doorstep Pickup)':'No (Lab Visit Only)'):item[key]||'—'}</p>)}</div><button className={secondary} onClick={()=>setEdit(item)}>Edit</button></div>)}</div>}
  </>}
  {tab==='access'&&<>
   <div className={card+' space-y-4'}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <div>
        <h2 className="font-bold text-slate-900">Staff Access &amp; Permissions</h2>
        <p className="text-xs text-slate-500">Register new staff accounts or connect existing users to laboratory or sample collector roles.</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={()=>setStaffMode('create')} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${staffMode==='create'?'bg-blue-600 text-white shadow-sm':'border border-slate-200 bg-slate-50 text-slate-700'}`}>
          + Register New Staff
        </button>
        <button type="button" onClick={()=>setStaffMode('connect')} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${staffMode==='connect'?'bg-blue-600 text-white shadow-sm':'border border-slate-200 bg-slate-50 text-slate-700'}`}>
          Connect Existing User
        </button>
      </div>
    </div>

    {staffMode==='create' ? (
      <form className="space-y-4" onSubmit={async e=>{
        e.preventDefault();
        await save('/admin/access',{
          create_user: true,
          name: newStaff.name,
          email: newStaff.email,
          phone: newStaff.phone,
          password: newStaff.password,
          [newStaff.role+'_id']: newStaff.target
        });
        setNewStaff({name:'',email:'',phone:'',password:'',role:'laboratory',target:''});
      }}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Staff Member Full Name">
            <input required placeholder="e.g. Rahul Sharma" className={input} value={newStaff.name} onChange={e=>setNewStaff({...newStaff,name:e.target.value})}/>
          </Field>
          <Field label="Registered Email (Login ID)">
            <input type="email" required placeholder="staff@example.com" className={input} value={newStaff.email} onChange={e=>setNewStaff({...newStaff,email:e.target.value})}/>
          </Field>
          <Field label="Mobile Phone">
            <input required placeholder="9876543210" className={input} value={newStaff.phone} onChange={e=>setNewStaff({...newStaff,phone:e.target.value})}/>
          </Field>
          <Field label="Set Login Password">
            <input type="password" required minLength={6} placeholder="Min 6 characters" className={input} value={newStaff.password} onChange={e=>setNewStaff({...newStaff,password:e.target.value})}/>
          </Field>
          <Field label="Staff Role">
            <select className={input} value={newStaff.role} onChange={e=>setNewStaff({...newStaff,role:e.target.value,target:''})}>
              <option value="laboratory">Laboratory Staff / Technician</option>
              <option value="collector">Sample Collector / Phlebotomist</option>
            </select>
          </Field>
          <Field label="Assign Facility / Entity">
            <select required className={input} value={newStaff.target} onChange={e=>setNewStaff({...newStaff,target:e.target.value})}>
              <option value="">Select facility</option>
              {masters[newStaff.role==='collector'?'collectors':'laboratories'].filter(x=>x.is_active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
        </div>
        <button className={button} disabled={busy}>Register &amp; Grant Workspace Access</button>
      </form>
    ) : (
      <form className="space-y-4" onSubmit={e=>{
        e.preventDefault();
        save('/admin/access',{user_id:access.user_id,[access.role+'_id']:access.target});
      }}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Select User Account">
            <select required className={input} value={access.user_id} onChange={e=>setAccess({...access,user_id:e.target.value})}>
              <option value="">Select account</option>
              {masters.users.map(u=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}
            </select>
          </Field>
          <Field label="Role">
            <select className={input} value={access.role} onChange={e=>setAccess({...access,role:e.target.value,target:''})}>
              <option value="laboratory">Laboratory staff</option>
              <option value="collector">Collector</option>
            </select>
          </Field>
          <Field label="Assigned to">
            <select required className={input} value={access.target} onChange={e=>setAccess({...access,target:e.target.value})}>
              <option value="">Select facility</option>
              {masters[access.role==='collector'?'collectors':'laboratories'].filter(x=>x.is_active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
        </div>
        <button className={button} disabled={busy}>Save Access</button>
      </form>
    )}
   </div>

   <div className="space-y-3">
     <h3 className="font-bold text-slate-900">Active Staff Members ({masters.memberships.length})</h3>
     {!masters.memberships.length ? (
       <p className="text-sm text-slate-500">No staff members assigned yet.</p>
     ) : (
       <div className="grid gap-3 sm:grid-cols-2">
         {masters.memberships.map(m=>{
           const isCol = !!m.collector_id;
           const targetObj = masters[isCol?'collectors':'laboratories'].find(x=>String(x.id)===String(m.collector_id||m.laboratory_id));
           return (
             <div key={m.user_id} className={card+' flex flex-wrap justify-between items-center gap-3'}>
               <div>
                 <div className="flex items-center gap-2">
                   <p className="font-bold text-slate-900">{m.name}</p>
                   <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isCol?'bg-amber-100 text-amber-800':'bg-blue-100 text-blue-800'}`}>
                     {isCol ? 'Collector' : 'Laboratory Staff'}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 mt-0.5">{m.email || 'No email'} · {m.phone || 'No phone'}</p>
                 <p className="text-xs font-semibold text-slate-700 mt-1">Assigned: {targetObj?.name || 'Assigned ID: ' + (m.collector_id||m.laboratory_id)}</p>
               </div>
               <button disabled={busy} className={secondary+' text-xs text-red-600 hover:bg-red-50 hover:border-red-200'} onClick={()=>save(`/admin/access/${m.user_id}`,undefined,'DELETE')}>
                 Revoke access
               </button>
             </div>
           );
         })}
       </div>
     )}
   </div>
  </>}
  {newBooking&&<BookingForm catalog={catalog} users={masters.users} onCancel={()=>setNewBooking(false)} onCreated={async b=>{setNewBooking(false);setSelected(b.id);setNotice('Booking confirmed.');await load();}}/>}
  {['bookings','reports','payments','overview'].includes(tab)&&<><div className="flex flex-wrap items-center gap-3"><div className="relative min-w-48 flex-1"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input className={input+' pl-9'} aria-label="Search bookings" placeholder="Patient, mobile, booking or sample ID" value={search} onChange={e=>setSearch(e.target.value)}/></div><select className={input+' sm:w-48'} aria-label="Filter status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{labStatuses.map(s=><option key={s}>{s}</option>)}</select><button className={button} onClick={()=>setNewBooking(true)}><Plus size={16}/>New booking</button></div>
   {activeBooking&&<BookingDetail key={activeBooking.id} booking={activeBooking} masters={masters} session={session} onRefresh={load} onClose={()=>setSelected(null)}/>}
   {!filtered.length?<Empty>No bookings match this view.</Empty>:<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Patient / booking','Collection & Specimen','Status','Payment','Report',''].map((h,i)=><th className="p-4" key={i}>{h}</th>)}</tr></thead><tbody>{filtered.map(b=><tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/50"><td className="p-4"><p className="font-semibold">{b.patient_name}</p><p className="text-xs text-slate-500">{b.phone} · {b.id.slice(0,8)}</p><p className="font-mono text-[11px] text-blue-700">{b.barcode}</p></td><td className="p-4"><p>{date(b.collection_at)}</p><p className="text-xs text-slate-500">{b.area_name} · {b.collector_name||'Unassigned'}</p><p className="text-xs text-slate-600 font-medium">{b.items?.map(i=>i.sample_type?`${i.name} (${i.sample_type})`:i.name).join(', ')}</p></td><td className="p-4"><Status value={b.status}/></td><td className="p-4">{rupees(b.paid_amount)} / {rupees(b.total)}</td><td className="p-4">{b.has_report?<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"><CheckCircle2 size={12}/> Ready</span>:<span className="text-xs text-slate-400">Pending</span>}</td><td className="p-4"><button className={secondary+' text-xs'} onClick={()=>setSelected(b.id)}>Manage</button></td></tr>)}</tbody></table></div>}
   <p className="text-xs text-slate-400">Showing the latest {bookings.length} bookings (up to 500). Refresh for current status.</p>
  </>}
 </div>;
}

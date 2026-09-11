"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FlaskConical, RefreshCw, Plus, ArrowUpRight, X, Download, Search } from 'lucide-react';
import { labApi, labTabs, labStatuses, title, rupees } from '@/lib/lab-api';

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50';
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const date = v => new Date(v).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
const fields = {
 tests: [['name','Name'],['kind','Type','kind'],['price','Price (INR)','number'],['sample_type','Sample type'],['turnaround_hours','Report turnaround (hours)','number'],['preparation','Patient preparation','textarea'],['includes','Included tests (for packages)','textarea']],
 laboratories: [['name','Laboratory name'],['phone','Phone','tel'],['address','Address','textarea']],
 collectors: [['name','Collector name'],['phone','Phone','tel'],['area_id','Service area','areas']],
 areas: [['name','Village / service area'],['pincode','Pincode'],['collection_fee','Home collection fee (INR)','number']],
};
function Field({ label, children }) { return <label className="block space-y-1.5 text-sm font-medium text-slate-600"><span>{label}</span>{children}</label>; }
function Empty({ children }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{children}</div>; }
function Status({ value }) { return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${value==='report_ready'?'bg-emerald-100 text-emerald-800':value==='cancelled'?'bg-red-100 text-red-700':'bg-blue-50 text-blue-700'}`}>{title(value)}</span>; }

export function MasterForm({ kind, item, masters, onSave, onCancel, busy }) {
 const [form,setForm]=useState(item || {kind:'test',is_active:true,collection_fee:0,price:0,turnaround_hours:24});
 return <form className={card+' space-y-4'} onSubmit={e=>{e.preventDefault();onSave(form);}}>
  <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">{item?'Edit':'Add'} {kind==='tests'?'test / package':title(kind)}</h3><button type="button" onClick={onCancel} aria-label="Close form"><X size={18}/></button></div>
  <div className="grid gap-4 sm:grid-cols-2">{fields[kind].map(([key,label,type])=><Field key={key} label={label}>
   {type==='kind'||type==='areas'?<select className={input} required value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}>
    <option value="">Select</option>{(type==='kind'?[{id:'test',name:'Test'},{id:'package',name:'Health package'}]:masters.areas).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
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
  {!catalog.tests.length?<Empty>No tests are available yet. Please check again later.</Empty>:<div className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">{catalog.tests.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())).map(t=><label key={t.id} className={`cursor-pointer rounded-xl border p-4 ${selected.includes(t.id)?'border-blue-500 bg-blue-50':'border-slate-200'}`}>
   <div className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={selected.includes(t.id)} onChange={e=>{requestKey.current=null;setSelected(e.target.checked?[...selected,t.id]:selected.filter(id=>id!==t.id));}}/><div className="flex-1"><p className="font-semibold">{t.name}</p><p className="text-xs text-slate-500">{title(t.kind)} · {t.sample_type} · {t.turnaround_hours} hours</p><p className="mt-1 font-bold text-blue-700">{rupees(t.price)}</p>{t.includes&&<p className="mt-2 text-xs text-slate-600">Includes: {t.includes}</p>}{t.preparation&&<p className="mt-1 text-xs text-slate-600">Preparation: {t.preparation}</p>}</div></div>
  </label>)}</div>}
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
 const admin=!!session.user.isadmin, collector=!!session.membership?.collector_id&&String(session.membership.collector_id)===String(b.collector_id), lab=!!session.membership?.laboratory_id&&String(session.membership.laboratory_id)===String(b.laboratory_id), owner=String(session.user.id)===String(b.user_id);
 const refreshEvents=useCallback(()=>labApi(`/bookings/${b.id}/events`).then(setEvents).catch(e=>setError(e.message)),[b.id]);
 useEffect(()=>{refreshEvents();},[refreshEvents,b.status,b.has_report,b.paid_amount]);
 async function act(path,body,method='POST') {setError('');setBusy(true);try{await labApi(`/bookings/${b.id}/${path}`,{method,body});await onRefresh();await refreshEvents();}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function download() {setBusy(true);setError('');try{const blob=await labApi(`/bookings/${b.id}/report`,{download:true});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`lab-report-${b.id}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function upload(file) {if(!file)return;if(file.size>5*1024*1024){setError('Choose a PDF smaller than 5 MB.');return;}try{const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Cannot read this file.'));reader.readAsDataURL(file);});await act('report',{filename:file.name,content},'PUT');}catch(e){setError(e.message);}}
 const next=({assigned:'collected',collected:'received',received:'processing',processing:'report_ready'})[b.status];
 const canAdvance=next&&(admin||(next==='collected'&&collector)||(next!=='collected'&&lab));
 return <div className={card+' space-y-5'}>
  <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{b.patient_name}</h2><p className="mt-1 break-all font-mono text-xs text-slate-500">Booking {b.id}</p></div><button type="button" onClick={onClose} aria-label="Close booking details"><X size={20}/></button></div>
  <Status value={b.status}/><div className="grid gap-3 text-sm sm:grid-cols-2"><p>{b.phone}<br/>{b.address}<br/>{b.area_name}</p><p>Collection: {date(b.collection_at)}<br/>Collector: {b.collector_name||'Not assigned'}<br/>Lab: {b.laboratory_name||'Not assigned'}</p></div>
  <p className="text-sm text-slate-600">{b.items?.map(t=>t.name).join(' · ')}</p>
  <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">SAMPLE / BARCODE ID</p><p className="mt-1 break-all font-mono text-sm font-bold">{b.barcode}</p></div>
  {(admin||collector)&&<a className={secondary} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address+' '+b.area_name)}`} target="_blank" rel="noreferrer">Directions to patient <ArrowUpRight size={16}/></a>}
  {admin&&['confirmed','assigned'].includes(b.status)&&<form className="space-y-3 rounded-xl border border-slate-200 p-4" onSubmit={e=>{e.preventDefault();act('assign',assignment);}}>
   <h3 className="font-semibold">Assign collection & laboratory</h3><div className="grid gap-3 sm:grid-cols-2">
    <Field label="Collector in this area"><select required className={input} value={assignment.collector_id} onChange={e=>setAssignment({...assignment,collector_id:e.target.value})}><option value="">Choose collector</option>{masters.collectors.filter(c=>c.is_active&&String(c.area_id)===String(b.area_id)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field label="Laboratory"><select required className={input} value={assignment.laboratory_id} onChange={e=>setAssignment({...assignment,laboratory_id:e.target.value})}><option value="">Choose laboratory</option>{masters.laboratories.filter(l=>l.is_active).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
    {['collector_due','lab_due'].map(key=><Field key={key} label={`${title(key)} (INR)`}><input className={input} type="number" min="0" step="0.01" required value={assignment[key]} onChange={e=>setAssignment({...assignment,[key]:e.target.value})}/></Field>)}
   </div><button disabled={busy} className={button}>Save assignment</button>
  </form>}
  {(canAdvance||((admin||owner)&&['confirmed','assigned'].includes(b.status)))&&<div className="space-y-3">
   {canAdvance&&['collected','received'].includes(next)&&<Field label="Scan barcode or enter sample ID to verify"><input className={input} value={barcode} onChange={e=>setBarcode(e.target.value)} autoComplete="off"/></Field>}
   <Field label="Notes / cancellation reason"><textarea className={input} value={note} onChange={e=>setNote(e.target.value)} maxLength={1000}/></Field>
   <div className="flex flex-wrap gap-2">{canAdvance&&<button disabled={busy||(next==='report_ready'&&!b.has_report)} className={button} onClick={()=>act('status',{status:next,barcode,note})}>Mark {title(next)}</button>}
    {(admin||owner)&&['confirmed','assigned'].includes(b.status)&&<button disabled={busy} className={secondary} onClick={()=>act('status',{status:'cancelled',note})}>Cancel booking</button>}
   </div>
  </div>}
  {(admin||lab)&&b.status==='processing'&&<Field label="Upload final report (PDF, up to 5 MB)"><input type="file" accept="application/pdf,.pdf" disabled={busy} className={input} onChange={e=>{upload(e.target.files[0]);e.target.value='';}}/></Field>}
  {b.has_report&&(admin||lab||(owner&&b.status==='report_ready'))&&<button disabled={busy} className={secondary} onClick={download}><Download size={16}/> Download report</button>}
  {admin&&<div className="space-y-3 rounded-xl bg-slate-50 p-4"><h3 className="font-semibold">Payments & settlements</h3><p className="text-sm">Total {rupees(b.total)} · Paid {rupees(b.paid_amount)}</p>
   <form onSubmit={e=>{e.preventDefault();act('payment',{paid_amount:paid,note});}} className="space-y-3"><Field label="Total cash received (INR)"><input required className={input} type="number" min="0" max={b.total} step="0.01" value={paid} onChange={e=>setPaid(e.target.value)}/></Field><Field label="Receipt / refund reference"><input required className={input} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></Field><button disabled={busy||b.status==='cancelled'} className={secondary}>Record payment</button></form>
   {['collector','lab'].map(party=><div key={party} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3"><span className="text-sm">{title(party)}: {rupees(b[party+'_due'])}</span><button className={secondary} disabled={busy||b[party+'_settled']||b.status!=='report_ready'||Number(b.paid_amount)<Number(b.total)||!note.trim()} onClick={()=>act('settle',{party,note})}>{b[party+'_settled']?'Settlement recorded':'Record settlement'}</button></div>)}
   <p className="text-xs text-slate-500">Records payments made outside the app. Enter the transfer reference before recording a settlement.</p>
  </div>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <div><h3 className="mb-3 font-semibold">Activity & status updates</h3><ol className="space-y-3 border-l-2 border-blue-100 pl-4">{events.map((e,i)=><li key={i} className="text-sm"><p className="font-medium">{title(e.status)}</p><p className="text-slate-600">{e.note}</p><time className="text-xs text-slate-400">{date(e.created_at)}</time></li>)}</ol></div>
 </div>;
}

export default function LabDashboard({ tab='overview' }) {
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState('');
 const [edit,setEdit]=useState(null),[selected,setSelected]=useState(null),[newBooking,setNewBooking]=useState(false),[search,setSearch]=useState(''),[status,setStatus]=useState('');
 const [access,setAccess]=useState({user_id:'',role:'laboratory',target:''});
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
  <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Muft Madad · Diagnostics</p><h1 className="text-2xl font-bold text-slate-900">{labTabs.find(([key])=>key===tab)?.[1]||'Lab Dashboard'}</h1><p className="mt-1 text-sm text-slate-500">Home collection, sample processing and report delivery.</p></div><div className="flex gap-2"><button aria-label="Refresh lab dashboard" className={secondary} onClick={()=>load().catch(e=>setError(e.message))}><RefreshCw size={16}/></button><Link href="/labs" className={secondary}>Patient portal <ArrowUpRight size={16}/></Link></div></header>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
  {['overview','analytics'].includes(tab)&&<><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(([name,value])=><div key={name} className={card}><p className="text-sm text-slate-500">{name}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div>)}</div>
   <div className={card}><h2 className="font-bold">Collection to report</h2><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">{labStatuses.filter(s=>s!=='cancelled').map(s=><div key={s} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{title(s)}</p><p className="mt-2 text-xl font-bold">{summary[s]}</p></div>)}</div></div>
   <div className="grid gap-4 md:grid-cols-3">{[['Booking value',summary.booking_value],['Cash received',summary.cash_received],['Unsettled commissions',summary.unsettled]].map(([name,value])=><div className={card} key={name}><p className="text-sm text-slate-500">{name}</p><p className="mt-2 text-2xl font-bold">{rupees(value)}</p></div>)}</div>
   {tab==='overview'&&<div className={card}><h2 className="font-bold">Start managing diagnostics</h2><p className="mt-2 text-sm text-slate-500">Add your service areas, tests, laboratories and collectors from the sidebar. Assign existing user accounts under Users & Permissions.</p><div className="mt-4 flex flex-wrap gap-3"><button className={button} onClick={()=>setNewBooking(true)}><Plus size={16}/>New booking</button><Link className={secondary} href="/labs/workspace">Collector / laboratory workspace <ArrowUpRight size={16}/></Link></div></div>}
   {tab==='analytics'&&<div className="grid gap-4 md:grid-cols-2"><div className={card}><h2 className="mb-3 font-bold">Village-wise bookings</h2>{masters.areas.map(a=><p key={a.id} className="flex justify-between border-b border-slate-100 py-2 text-sm"><span>{a.name}</span><strong>{analytics.areas.find(x=>String(x.area_id)===String(a.id))?.count||0}</strong></p>)}</div><div className={card}><h2 className="mb-3 font-bold">Test-wise demand</h2>{masters.tests.map(t=><p key={t.id} className="flex justify-between border-b border-slate-100 py-2 text-sm"><span>{t.name}</span><strong>{analytics.tests.find(x=>String(x.test_id)===String(t.id))?.count||0}</strong></p>)}</div></div>}
  </>}
  {fields[tab]&&<><div className="flex justify-end"><button className={button} onClick={()=>setEdit({})}><Plus size={16}/>Add {tab==='tests'?'test / package':title(tab)}</button></div>{edit&&<MasterForm key={edit.id||'new'} kind={tab} item={edit.id?edit:null} masters={masters} busy={busy} onCancel={()=>setEdit(null)} onSave={body=>save(`/admin/masters/${tab}${edit.id?'/'+edit.id:''}`,body,edit.id?'PUT':'POST')}/>}
   {!masters[tab].length?<Empty>No {tab} added yet. Add the first record to get started.</Empty>:<div className="grid gap-4 md:grid-cols-2">{masters[tab].map(item=><div className={card} key={item.id}><div className="flex justify-between gap-3"><h3 className="font-bold">{item.name}</h3><span className={`text-xs ${item.is_active?'text-emerald-700':'text-slate-400'}`}>{item.is_active?'Active':'Inactive'}</span></div><div className="my-3 space-y-1 text-sm text-slate-500">{fields[tab].filter(([key])=>key!=='name').map(([key,label])=><p key={key}><span>{label}: </span>{key==='area_id'?masters.areas.find(a=>String(a.id)===String(item[key]))?.name:item[key]||'—'}</p>)}</div><button className={secondary} onClick={()=>setEdit(item)}>Edit</button></div>)}</div>}
  </>}
  {tab==='access'&&<><form className={card+' space-y-4'} onSubmit={e=>{e.preventDefault();save('/admin/access',{user_id:access.user_id,[access.role+'_id']:access.target});}}><h2 className="font-bold">Connect an existing account</h2><div className="grid gap-3 sm:grid-cols-3"><Field label="User"><select required className={input} value={access.user_id} onChange={e=>setAccess({...access,user_id:e.target.value})}><option value="">Select account</option>{masters.users.map(u=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select></Field><Field label="Role"><select className={input} value={access.role} onChange={e=>setAccess({...access,role:e.target.value,target:''})}><option value="laboratory">Laboratory staff</option><option value="collector">Collector</option></select></Field><Field label="Assigned to"><select required className={input} value={access.target} onChange={e=>setAccess({...access,target:e.target.value})}><option value="">Select</option>{masters[access.role==='collector'?'collectors':'laboratories'].filter(x=>x.is_active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field></div><button className={button} disabled={busy}>Save access</button></form>
   {masters.memberships.map(m=><div key={m.user_id} className={card+' flex flex-wrap justify-between gap-3'}><div><p className="font-bold">{m.name}</p><p className="text-sm text-slate-500">{m.collector_id?'Collector':'Laboratory'} · {masters[m.collector_id?'collectors':'laboratories'].find(x=>String(x.id)===String(m.collector_id||m.laboratory_id))?.name}</p></div><button disabled={busy} className={secondary} onClick={()=>save(`/admin/access/${m.user_id}`,undefined,'DELETE')}>Revoke access</button></div>)}
  </>}
  {newBooking&&<BookingForm catalog={catalog} users={masters.users} onCancel={()=>setNewBooking(false)} onCreated={async b=>{setNewBooking(false);setSelected(b.id);setNotice('Booking confirmed.');await load();}}/>}
  {['bookings','reports','payments','overview'].includes(tab)&&<><div className="flex flex-wrap items-center gap-3"><div className="relative min-w-48 flex-1"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input className={input+' pl-9'} aria-label="Search bookings" placeholder="Patient, mobile, booking or sample ID" value={search} onChange={e=>setSearch(e.target.value)}/></div><select className={input+' sm:w-48'} aria-label="Filter status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{labStatuses.map(s=><option key={s}>{s}</option>)}</select><button className={button} onClick={()=>setNewBooking(true)}><Plus size={16}/>New booking</button></div>
   {activeBooking&&<BookingDetail key={activeBooking.id} booking={activeBooking} masters={masters} session={session} onRefresh={load} onClose={()=>setSelected(null)}/>}
   {!filtered.length?<Empty>No bookings match this view.</Empty>:<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Patient / booking','Collection','Status','Payment',''].map((h,i)=><th className="p-4" key={i}>{h}</th>)}</tr></thead><tbody>{filtered.map(b=><tr key={b.id} className="border-t border-slate-100"><td className="p-4"><p className="font-semibold">{b.patient_name}</p><p className="text-xs text-slate-500">{b.phone} · {b.id.slice(0,8)}</p></td><td className="p-4"><p>{date(b.collection_at)}</p><p className="text-xs text-slate-500">{b.area_name} · {b.collector_name||'Unassigned'}</p></td><td className="p-4"><Status value={b.status}/></td><td className="p-4">{rupees(b.paid_amount)} / {rupees(b.total)}</td><td className="p-4"><button className={secondary} onClick={()=>setSelected(b.id)}>Manage</button></td></tr>)}</tbody></table></div>}
   <p className="text-xs text-slate-400">Showing the latest {bookings.length} bookings (up to 500). Refresh for current status.</p>
  </>}
 </div>;
}

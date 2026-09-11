"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowLeft, RefreshCw } from 'lucide-react';
import { labApi, title, rupees } from '@/lib/lab-api';
import { BookingDetail, BookingForm } from './LabDashboard';

export default function LabPortal({ workspace=false }) {
 const [catalog,setCatalog]=useState(null),[session,setSession]=useState(null),[bookings,setBookings]=useState([]);
 const [masters,setMasters]=useState({collectors:[],laboratories:[]});
 const [selected,setSelected]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[view,setView]=useState(workspace?'bookings':'book'),[notice,setNotice]=useState('');
 const reload=useCallback(async()=>{setBookings(await labApi('/bookings'));},[]);
 useEffect(()=>{let active=true;(async()=>{
  try {const cat=await labApi('/catalog');if(!active)return;setCatalog(cat);
   try {const s=await labApi('/session');if(!active)return;setSession(s);if(s.user.isadmin)setMasters(await labApi('/admin/masters'));await reload();}catch(e){if(e.status!==401)throw e;}
  }catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}
 })();return()=>{active=false;};},[reload]);
 useEffect(()=>{if(!session)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')reload().catch(e=>setError(e.message));},30000);return()=>clearInterval(timer);},[session,reload]);
 const canWork=session&&(session.user.isadmin||session.membership?.laboratory_id||session.membership?.collector_id);
 const list=workspace?bookings.filter(b=>session?.user.isadmin||(session?.membership?.collector_id&&String(b.collector_id)===String(session.membership.collector_id))||(session?.membership?.laboratory_id&&String(b.laboratory_id)===String(session.membership.laboratory_id))):bookings.filter(b=>String(b.user_id)===String(session?.user.id));
 const active=list.find(b=>b.id===selected);
 return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-5xl space-y-6">
  <header className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="text-sm text-slate-500"><ArrowLeft className="mr-1 inline h-4 w-4"/> Muft Madad</Link><div className="flex gap-4 text-sm text-blue-700"><Link href={workspace?'/labs':'/labs/workspace'}>{workspace?'Patient portal':'Staff workspace'}</Link>{session?.user.isadmin&&<Link href="/dashboard">Admin dashboard</Link>}</div></header>
  <section className="rounded-3xl bg-gradient-to-br from-blue-900 to-blue-600 p-7 text-white sm:p-10"><FlaskConical className="mb-5 h-9 w-9"/><p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">Muft Madad Diagnostics</p><h1 className="text-3xl font-bold">{workspace?'Collection & laboratory workspace':'Book tests. Get reports. Stay close to home.'}</h1><p className="mt-3 max-w-xl text-blue-100">{workspace?'View your assignments, verify samples and deliver reports.':'Choose tests or health packages, schedule a home collection and track your report in one place.'}</p></section>
  {loading&&<p className="text-slate-500">Loading diagnostics…</p>}
  {error&&<div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}<button className="ml-3 underline" onClick={()=>window.location.reload()}>Retry</button></div>}
  {notice&&<p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
  {!loading&&!session&&<div className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold">Log in to {workspace?'open your assignments':'book and track tests'}</h2><p className="mt-2 text-sm text-slate-500">Use your existing Muft Madad account.</p><Link className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white" href={`/login?next=${encodeURIComponent(workspace?'/labs/workspace':'/labs')}`}>Log in</Link></div>}
  {!loading&&workspace&&session&&!canWork&&<p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">Your account has no lab staff role yet. Ask the administrator to assign your account to a collector or laboratory.</p>}
  {!workspace&&session&&<div className="flex gap-2">{[['book','Book tests'],['bookings','My bookings & reports']].map(([key,name])=><button key={key} className={`rounded-xl px-4 py-3 text-sm font-semibold ${view===key?'bg-blue-600 text-white':'border border-slate-200 bg-white text-slate-700'}`} onClick={()=>setView(key)}>{name}</button>)}</div>}
  {!workspace&&view==='book'&&catalog&&session&&<BookingForm catalog={catalog} onCreated={async b=>{setNotice(`Booking confirmed: ${b.id}. Pay cash on collection.`);await reload();setSelected(b.id);setView('bookings');}}/>}
  {!workspace&&catalog&&!session&&<div className="grid gap-3 sm:grid-cols-2">{catalog.tests.map(t=><div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">{t.name}</h2><p className="mt-2 text-sm text-slate-500">{t.sample_type} · Report in {t.turnaround_hours} hours</p><p className="mt-3 font-bold text-blue-700">{rupees(t.price)}</p></div>)}</div>}
  {session&&((workspace&&canWork)||(!workspace&&view==='bookings'))&&<>
   <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{workspace?'Assigned bookings':'My bookings'}</h2><button aria-label="Refresh bookings" className="rounded-xl border border-slate-200 bg-white p-3" onClick={()=>reload().catch(e=>setError(e.message))}><RefreshCw size={17}/></button></div>
   {active&&<BookingDetail key={active.id} booking={active} session={session} masters={masters} onRefresh={reload} onClose={()=>setSelected(null)}/>}
   {!list.length?<p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No bookings yet.</p>:list.map(b=><button key={b.id} onClick={()=>setSelected(b.id)} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400"><div><p className="font-bold">{b.patient_name}</p><p className="mt-1 text-sm text-slate-500">{b.items?.map(t=>t.name).join(', ')}</p><p className="mt-1 text-xs text-slate-500">{new Date(b.collection_at).toLocaleString('en-IN')} · {b.area_name}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{title(b.status)}</span></button>)}
  </>}
 </div></main>;
}

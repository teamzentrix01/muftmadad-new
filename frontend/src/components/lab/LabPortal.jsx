"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical, ArrowLeft, RefreshCw, Search, ShieldCheck, MapPin,
  Phone, CheckCircle2, Clock, FileText, Download, ArrowUpRight,
  TestTube, QrCode, User, Navigation, AlertCircle
} from 'lucide-react';
import { labApi, title, rupees } from '@/lib/lab-api';
import { BookingDetail, BookingForm } from './LabDashboard';

export default function LabPortal({ workspace=false }) {
 const [catalog,setCatalog]=useState(null),[session,setSession]=useState(null),[bookings,setBookings]=useState([]);
 const [masters,setMasters]=useState({collectors:[],laboratories:[],areas:[]});
 const [selected,setSelected]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [view,setView]=useState(workspace?'bookings':'book'),[notice,setNotice]=useState('');
 const [scannerBarcode,setScannerBarcode]=useState(''),[searchQuery,setSearchQuery]=useState('');
 const [labStageFilter,setLabStageFilter]=useState('all');
 const [collectorFilter,setCollectorFilter]=useState('assigned');

 const reload=useCallback(async()=>{
   try {
     const data = await labApi('/bookings');
     setBookings(data);
   } catch(e) {
     setError(e.message);
   }
 },[]);

 useEffect(()=>{
  let active=true;
  (async()=>{
   try {
    const cat=await labApi('/catalog');
    if(!active)return;
    setCatalog(cat);
    try {
     const s=await labApi('/session');
     if(!active)return;
     setSession(s);
     if(s.user.isadmin) setMasters(await labApi('/admin/masters'));
     await reload();
    }catch(e){if(e.status!==401)throw e;}
   }catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}
  })();
  return()=>{active=false;};
 },[reload]);

 useEffect(()=>{
  if(!session)return;
  const timer=setInterval(()=>{
    if(document.visibilityState==='visible') reload().catch(e=>setError(e.message));
  },30000);
  return()=>clearInterval(timer);
 },[session,reload]);

 const isLabStaff = !!session?.membership?.laboratory_id;
 const isCollector = !!session?.membership?.collector_id;
 const isAdmin = !!session?.user?.isadmin;
 const canWork = session && (isAdmin || isLabStaff || isCollector);

 // Filter bookings based on role
 const userBookings = useMemo(()=>{
   if (!workspace) {
     return bookings.filter(b => String(b.user_id) === String(session?.user?.id));
   }
   if (isAdmin) return bookings;
   if (isCollector) {
     return bookings.filter(b => String(b.collector_id) === String(session.membership.collector_id));
   }
   if (isLabStaff) {
     return bookings.filter(b => String(b.laboratory_id) === String(session.membership.laboratory_id));
   }
   return [];
 },[workspace, bookings, session, isAdmin, isCollector, isLabStaff]);

 // Stage filtered bookings for Diagnostic Lab
 const labFilteredBookings = useMemo(()=>{
   let list = userBookings;
   if (searchQuery.trim()) {
     const q = searchQuery.toLowerCase();
     list = list.filter(b => 
       b.patient_name?.toLowerCase().includes(q) ||
       b.phone?.includes(q) ||
       b.barcode?.toLowerCase().includes(q) ||
       b.area_name?.toLowerCase().includes(q)
     );
   }
   if (labStageFilter === 'receive') {
     return list.filter(b => b.status === 'collected');
   }
   if (labStageFilter === 'testing') {
     return list.filter(b => ['received','processing'].includes(b.status));
   }
   if (labStageFilter === 'upload_report') {
     return list.filter(b => b.status === 'processing' && !b.has_report);
   }
   if (labStageFilter === 'report_ready') {
     return list.filter(b => b.status === 'report_ready');
   }
   return list;
 },[userBookings, searchQuery, labStageFilter]);

 // Filtered bookings for Collector
 const collectorFilteredBookings = useMemo(()=>{
   let list = userBookings;
   if (collectorFilter === 'assigned') {
     return list.filter(b => b.status === 'assigned');
   }
   if (collectorFilter === 'collected') {
     return list.filter(b => b.status === 'collected');
   }
   return list;
 },[userBookings, collectorFilter]);

 const active = userBookings.find(b => b.id === selected);

 // Barcode intake lookup
 const matchedByScanner = useMemo(()=>{
   if (!scannerBarcode.trim() || !workspace) return null;
   const clean = scannerBarcode.trim().toUpperCase();
   return userBookings.find(b => b.barcode?.toUpperCase() === clean);
 },[scannerBarcode, userBookings, workspace]);

 const handleScannerReceive = async (bookingItem) => {
   setError('');
   try {
     await labApi(`/bookings/${bookingItem.id}/status`, {
       method: 'POST',
       body: {
         status: 'received',
         barcode: bookingItem.barcode,
         note: 'Sample received at diagnostic lab. Barcode scanned and patient details verified.'
       }
     });
     setNotice(`Sample ${bookingItem.barcode} verified and received into testing queue!`);
     setScannerBarcode('');
     await reload();
     setSelected(bookingItem.id);
   } catch(e) {
     setError(e.message);
   }
 };

 return (
  <main className="min-h-screen bg-slate-50 px-4 py-8">
   <div className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="mr-1.5 inline h-4 w-4"/> Return to Muft Madad
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium text-blue-700">
        <Link href={workspace ? '/labs' : '/labs/workspace'} className="hover:underline">
          {workspace ? 'Patient Test Portal' : 'Staff Workspace'}
        </Link>
        {session?.user?.isadmin && (
          <Link href="/dashboard" className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-700 hover:bg-blue-100">
            Admin Dashboard
          </Link>
        )}
      </div>
    </header>

    {/* Hero Banner tailored to role */}
    <section className="rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-700 p-6 text-white shadow-md sm:p-9">
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="h-6 w-6 text-blue-300"/>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
            {workspace 
              ? (isLabStaff ? 'Diagnostic Lab Web Portal' : isCollector ? 'Collector Field Workspace' : 'Staff Diagnostics Portal')
              : 'Muft Madad Rural Diagnostics'}
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {workspace
            ? (isLabStaff ? 'Laboratory Processing & Report Portal' : isCollector ? 'Sample Collection Workspace' : 'Collection & Laboratory Workspace')
            : 'Book Diagnostic Tests. Doorstep Collection. Digital Reports.'}
        </h1>
        <p className="mt-2.5 max-w-xl text-sm sm:text-base text-blue-100/90">
          {workspace
            ? (isLabStaff 
                ? 'Scan incoming barcodes, verify patient identity, run NABL-compliant tests, and publish digital reports directly to rural patients.'
                : 'View today\'s home collection list, navigate via GPS directions, collect specimens with barcodes, and deliver to labs.')
            : 'Affordable pathology tests and health packages with trained village phlebotomists and certified diagnostic labs.'}
        </p>
      </div>

      {workspace && isLabStaff && (
        <div className="rounded-2xl border border-blue-400/30 bg-white/10 p-4 text-xs backdrop-blur-sm space-y-1">
          <p className="font-semibold text-blue-200 uppercase tracking-wider">Diagnostic Lab Station</p>
          <p className="text-white font-bold flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400"/> NABL Compliant Procedures</p>
          <p className="text-blue-200">Barcode Intake & Verification Active</p>
        </div>
      )}
     </div>
    </section>

    {loading && <p className="text-slate-500 py-6 text-center">Loading diagnostic services…</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button className="ml-3 font-semibold underline" onClick={()=>window.location.reload()}>Retry</button></div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{notice}</p>}

    {/* Login prompt */}
    {!loading && !session && (
      <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center sm:text-left">
       <h2 className="text-lg font-bold text-slate-900">Sign in to {workspace ? 'access your staff workspace' : 'book tests and view reports'}</h2>
       <p className="mt-1 text-sm text-slate-500">Sign in with your registered Muft Madad account to continue.</p>
       <Link className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors" href={`/login?next=${encodeURIComponent(workspace?'/labs/workspace':'/labs')}`}>
        Sign in
       </Link>
      </div>
    )}

    {!loading && workspace && session && !canWork && (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-bold">No Staff Role Assigned</p>
        <p className="mt-1 text-amber-800">Your account does not have a Collector or Laboratory staff role assigned yet. Please contact the administrator to connect your account to an active laboratory or collector in Users & Permissions.</p>
      </div>
    )}

    {/* DIAGNOSTIC LAB PORTAL WORKSPACE (Column 3 of Flow Chart) */}
    {session && workspace && (isLabStaff || isAdmin) && (
      <div className="space-y-6">
        {/* Step 1 & 2: Quick Barcode Intake & Scan Station */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600 p-2 text-white">
                <QrCode size={20}/>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Step 1 & 2: Receive & Scan Samples</h3>
                <p className="text-xs text-slate-500">Scan sample tube barcode or enter sample ID for instant patient verification</p>
              </div>
            </div>
            <button aria-label="Refresh bookings" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50" onClick={()=>reload().catch(e=>setError(e.message))}>
              <RefreshCw size={16}/>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400"/>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scan barcode (LAB-...) or enter Sample ID to verify"
                value={scannerBarcode}
                onChange={e=>setScannerBarcode(e.target.value)}
              />
            </div>
            {matchedByScanner && (
              <button 
                onClick={()=>setSelected(matchedByScanner.id)} 
                className="rounded-xl border border-blue-600 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                Open Details
              </button>
            )}
          </div>

          {/* Instant Match Card */}
          {matchedByScanner && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sample Match Found</span>
                  <p className="font-bold text-slate-900 text-base">{matchedByScanner.patient_name} · <span className="font-mono text-xs">{matchedByScanner.barcode}</span></p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{title(matchedByScanner.status)}</span>
              </div>
              <div className="grid gap-2 py-3 text-xs sm:grid-cols-3 text-slate-600">
                <p>Phone: <strong>{matchedByScanner.phone}</strong></p>
                <p>Area: <strong>{matchedByScanner.area_name}</strong></p>
                <p>Collector: <strong>{matchedByScanner.collector_name || 'N/A'}</strong></p>
              </div>
              <div className="border-t border-slate-100 pt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-700">
                  Specimens required: <strong>{matchedByScanner.items?.map(i => i.sample_type ? `${i.name} (${i.sample_type})` : i.name).join(', ')}</strong>
                </p>
                {matchedByScanner.status === 'collected' && (
                  <button 
                    onClick={()=>handleScannerReceive(matchedByScanner)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
                  >
                    ✓ Scan & Receive Sample
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5-Step Flow Tabs for Diagnostic Lab */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            ['all', `All Assigned (${userBookings.length})`],
            ['receive', `1. Receive Samples (${userBookings.filter(b=>b.status==='collected').length})`],
            ['testing', `2. Process Tests (${userBookings.filter(b=>['received','processing'].includes(b.status)).length})`],
            ['upload_report', `3. Upload Reports (${userBookings.filter(b=>b.status==='processing'&&!b.has_report).length})`],
            ['report_ready', `4. Reports Ready (${userBookings.filter(b=>b.status==='report_ready').length})`]
          ].map(([key,label]) => (
            <button
              key={key}
              onClick={()=>setLabStageFilter(key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                labStageFilter === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Detail Modal / Drawer if a booking is selected */}
        {active && (
          <BookingDetail 
            key={active.id} 
            booking={active} 
            session={session} 
            masters={masters} 
            onRefresh={reload} 
            onClose={()=>setSelected(null)}
          />
        )}

        {/* List of Lab Bookings */}
        <div className="space-y-3">
          {!labFilteredBookings.length ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No samples in this stage.
            </p>
          ) : (
            labFilteredBookings.map(b => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900">{b.patient_name}</h4>
                      <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-semibold">
                        {b.barcode}
                      </span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        b.status==='report_ready'?'bg-emerald-100 text-emerald-800':
                        b.status==='processing'?'bg-purple-100 text-purple-800':
                        b.status==='received'?'bg-indigo-100 text-indigo-800':
                        b.status==='collected'?'bg-amber-100 text-amber-800':
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {title(b.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Tests: <strong>{b.items?.map(t=>t.name).join(', ')}</strong>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(b.collection_at).toLocaleString('en-IN')} · Area: {b.area_name} · Collector: {b.collector_name || 'Unassigned'}
                    </p>
                    {b.items?.some(i => i.sample_type) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.items.map((i, idx) => i.sample_type ? (
                          <span key={idx} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            Specimen: {i.sample_type}
                          </span>
                        ) : null)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={()=>setSelected(b.id)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      {b.status === 'collected' ? 'Scan & Receive' :
                       b.status === 'received' ? 'Process Tests (NABL)' :
                       b.status === 'processing' && !b.has_report ? 'Upload Report' :
                       'Manage Booking'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

    {/* COLLECTOR WORKSPACE (Column 2 of Flow Chart) */}
    {session && workspace && isCollector && !isLabStaff && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              ['assigned', `Today's Collections (${userBookings.filter(b=>b.status==='assigned').length})`],
              ['collected', `In Transit to Lab (${userBookings.filter(b=>b.status==='collected').length})`],
              ['all', `All Collections (${userBookings.length})`]
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={()=>setCollectorFilter(key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  collectorFilter === key ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button aria-label="Refresh" className="rounded-xl border border-slate-200 bg-white p-2.5" onClick={()=>reload().catch(e=>setError(e.message))}>
            <RefreshCw size={16}/>
          </button>
        </div>

        {active && (
          <BookingDetail 
            key={active.id} 
            booking={active} 
            session={session} 
            masters={masters} 
            onRefresh={reload} 
            onClose={()=>setSelected(null)}
          />
        )}

        <div className="space-y-3">
          {!collectorFilteredBookings.length ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No collections found in this category.
            </p>
          ) : (
            collectorFilteredBookings.map(b => (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{b.patient_name}</h4>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{title(b.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 flex items-center gap-1"><Phone size={13}/> {b.phone}</p>
                    <p className="mt-1 text-xs text-slate-600 flex items-start gap-1"><MapPin size={13} className="shrink-0 mt-0.5"/> {b.address}, {b.area_name}</p>
                    <p className="mt-1.5 text-xs text-slate-500">Scheduled: <strong>{new Date(b.collection_at).toLocaleString('en-IN')}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Cash on Collection</p>
                    <p className="text-base font-bold text-slate-900">{rupees(b.total)}</p>
                    <p className="text-[11px] text-slate-400">Barcode: <span className="font-mono font-medium text-slate-700">{b.barcode}</span></p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {b.items?.map((item, idx) => (
                      <span key={idx} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {item.name} {item.sample_type && `(${item.sample_type})`}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address+' '+b.area_name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Navigation size={14} className="text-blue-600"/> Directions
                    </a>
                    <button
                      onClick={()=>setSelected(b.id)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      {b.status === 'assigned' ? 'Collect Sample' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

    {/* PATIENT PORTAL (Column 1 of Flow Chart) */}
    {!workspace && session && (
      <div className="space-y-6">
        <div className="flex gap-2">
          {[['book','1. Book Home Test'],['bookings','2. My Bookings & Reports']].map(([key,name])=>(
            <button 
              key={key} 
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                view===key ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`} 
              onClick={()=>setView(key)}
            >
              {name}
            </button>
          ))}
        </div>

        {view === 'book' && catalog && (
          <BookingForm 
            catalog={catalog} 
            onCreated={async b=>{
              setNotice(`Booking confirmed! Booking ID: ${b.id}. Collector will visit your address. Pay cash on collection.`);
              await reload();
              setSelected(b.id);
              setView('bookings');
            }}
          />
        )}

        {view === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Bookings & Digital Reports</h2>
              <button aria-label="Refresh bookings" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50" onClick={()=>reload().catch(e=>setError(e.message))}>
                <RefreshCw size={16}/>
              </button>
            </div>

            {active && (
              <BookingDetail 
                key={active.id} 
                booking={active} 
                session={session} 
                masters={masters} 
                onRefresh={reload} 
                onClose={()=>setSelected(null)}
              />
            )}

            {!userBookings.length ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                You have not booked any diagnostic tests yet.
              </p>
            ) : (
              userBookings.map(b => (
                <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{b.patient_name}</h3>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          b.status==='report_ready'?'bg-emerald-100 text-emerald-800':
                          b.status==='processing'?'bg-purple-100 text-purple-800':
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {title(b.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Tests: {b.items?.map(t=>t.name).join(', ')}</p>
                      <p className="mt-1 text-xs text-slate-500">Scheduled: {new Date(b.collection_at).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.has_report && b.status === 'report_ready' && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={13}/> Report Ready
                        </span>
                      )}
                      <button onClick={()=>setSelected(b.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                        Track & Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )}

    {/* Unauthenticated catalog preview for patient */}
    {!workspace && catalog && !session && (
      <div className="grid gap-4 sm:grid-cols-2">
        {catalog.tests.map(t=>{
          const isHomeAvail = t.home_collection !== false;
          return (
            <div key={t.id} className={`rounded-2xl border p-5 shadow-sm transition-all ${!isHomeAvail ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900">{t.name}</h3>
                {isHomeAvail ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    🏠 Home Service
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                    🏥 Lab Visit Only
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Specimen: <strong className="text-slate-700">{t.sample_type}</strong> · Results in {t.turnaround_hours} hours</p>
              {!isHomeAvail && (
                <div className="mt-2 rounded-lg bg-white/90 border border-amber-200 p-2 text-xs text-amber-900 flex items-start gap-1.5">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Yeh service home available nahi hai:</strong> Kripya nearest diagnostic lab me jaakar iska test karwayen.</span>
                </div>
              )}
              {t.preparation && <p className="mt-1 text-xs text-amber-700">Preparation: {t.preparation}</p>}
              <p className="mt-3 text-lg font-bold text-blue-700">{rupees(t.price)}</p>
            </div>
          );
        })}
      </div>
    )}
   </div>
  </main>
 );
}

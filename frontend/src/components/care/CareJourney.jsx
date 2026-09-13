'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, CalendarDays, MapPin, Search, ShieldCheck, Stethoscope, HeartHandshake, IndianRupee, Clock3, ArrowLeft } from 'lucide-react';
import { careApi, money, when, label, primary, secondary, input, card } from '@/lib/care-api';

const steps = ['Your requirement', 'Find a doctor', 'Compare costs', 'Book & get guidance', 'Treatment & support'];
const emptyCatalog = { specialities: [], treatments: [], hospitals: [] };

export default function CareJourney() {
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState({ q: '', city: '', speciality: '' });
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [treatment, setTreatment] = useState('');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ patient_name: '', patient_phone: '', requirement: '', slot_id: '' });
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const requestKey = useRef(null);

  useEffect(() => {
    const c = new AbortController();
    careApi('/catalog', { signal: c.signal }).then(setCatalog).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    const p = new URLSearchParams(window.location.search);
    if (p.get('treatment')) setTreatment(p.get('treatment'));
    if (p.get('speciality')) setQuery(q => ({ ...q, speciality: p.get('speciality') }));
    if (p.get('hospital')) setQuery(q => ({ ...q, hospital: p.get('hospital') }));
    if (p.get('doctor') || p.get('hospital')) {
      const filters = new URLSearchParams();
      if (p.get('doctor')) filters.set('doctor', p.get('doctor'));
      if (p.get('hospital')) filters.set('hospital', p.get('hospital'));
      careApi('/doctors?' + filters, { signal: c.signal }).then(rows => { setDoctors(rows); setStep(1); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    }
    if (p.get('view') === 'bookings') {
      setStep(4);
      careApi('/appointments', { signal: c.signal }).then(setBookings).catch(e => {
        if (e.name !== 'AbortError') { setError(e.message); setNeedsLogin(e.status === 401); }
      });
    }
    return () => c.abort();
  }, []);

  async function run(fn) {
    setBusy(true); setError(''); setNotice(''); setNeedsLogin(false);
    try { await fn(); } catch (e) { setError(e.message); setNeedsLogin(e.status === 401); } finally { setBusy(false); }
  }
  const search = e => {
    e?.preventDefault();
    run(async () => {
      const result = await careApi('/doctors?' + new URLSearchParams(query));
      setDoctors(result); setDoctor(null); setSelectedPackage(null); setStep(1);
    });
  };
  const compare = async (selectedDoctor, treatmentId = treatment) => {
    setDoctor(selectedDoctor); setSelectedPackage(null);
    const p = new URLSearchParams(); if (treatmentId) p.set('treatment', treatmentId); if (selectedDoctor) p.set('doctor', selectedDoctor.id);
    setPackages(await careApi('/packages?' + p)); setStep(2);
  };
  const book = p => run(async () => {
    if (!doctor) { setNotice('Choose a doctor first to see available consultation times.'); setStep(0); return; }
    const params = new URLSearchParams({ doctor: doctor.id }); if (p) params.set('hospital', p.hospital_id);
    const result = await careApi('/slots?' + params);
    setSelectedPackage(p); setSlots(result); setForm(f => ({ ...f, slot_id: '', requirement: f.requirement || query.q }));
    requestKey.current = crypto.randomUUID(); setStep(3);
  });
  const submitBooking = e => {
    e.preventDefault();
    run(async () => {
      const confirmed = await careApi('/appointments', { method: 'POST', body: { ...form, package_id: selectedPackage?.id || null, request_key: requestKey.current } });
      setStep(4); setNotice(`Appointment confirmed. Booking reference: ${confirmed.id.slice(0, 8)}. Your booking is saved.`);
      try { setBookings(await careApi('/appointments')); } catch { setError('Your appointment is saved, but its details could not load. Press Refresh to view it.'); }
    });
  };
  const myBookings = () => run(async () => { setStep(4); setBookings(await careApi('/appointments')); });
  const cities = [...new Set(catalog.hospitals.map(h => h.city).filter(Boolean))].sort();
  const loginReturn = doctor ? `/care?doctor=${doctor.id}${treatment ? `&treatment=${treatment}` : ''}` : '/care?view=bookings';

  return <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 pt-24 pb-16 text-slate-800">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-500"><ArrowLeft size={16} /> Home / Hospital care</Link>
        <div className="flex flex-wrap gap-2"><Link href="/provider" className={secondary}>Hospital staff</Link><button onClick={myBookings} disabled={busy} className={secondary}><CalendarDays size={16} /> My appointments</button></div>
      </div>
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-500 p-7 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-50"><HeartHandshake size={19} /> MUFT MADAD • HOSPITAL CARE</div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">From confusion to care.</h1>
        <p className="mt-3 max-w-2xl text-blue-50 text-base sm:text-lg">Find the right doctor. Understand treatment costs. Get guidance through every step of your care.</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm"><span className="flex gap-2 items-center"><ShieldCheck size={17} /> Verified specialists</span><span className="flex gap-2 items-center"><IndianRupee size={17} /> Clear cost estimates</span><span className="flex gap-2 items-center"><HeartHandshake size={17} /> Ongoing support</span></div>
      </section>
      <ol className="my-7 grid grid-cols-2 gap-2 lg:grid-cols-5">
        {steps.map((s, i) => <li key={s} aria-current={step === i ? 'step' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-4 text-xs sm:text-sm font-semibold ${step === i ? 'bg-white shadow-sm text-blue-700 ring-1 ring-blue-200' : 'text-slate-500'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${step >= i ? 'bg-gradient-to-br from-blue-600 to-emerald-500 text-white' : 'bg-slate-200'}`}>{step > i ? <Check size={16} /> : i + 1}</span>{s}</li>)}
      </ol>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}{needsLogin && <div className="mt-3 flex flex-wrap gap-3"><Link className="underline font-semibold" href={'/login?next=' + encodeURIComponent(loginReturn)}>Log in</Link><Link className="underline font-semibold" href={'/signup?next=' + encodeURIComponent(loginReturn)}>Create account</Link><span className="text-sm">After signing in, choose your slot to confirm the booking.</span></div>}</div>}
      {notice && <div role="status" className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">{notice}</div>}
      {step > 0 && step < 4 && <button className="mb-4 flex items-center gap-2 text-sm text-slate-600" disabled={busy} onClick={() => { setStep(step - 1); setError(''); }}><ArrowLeft size={16} /> Back</button>}

      {step === 0 && <section className={card}>
        <h2 className="text-2xl font-bold">What can we help you with?</h2><p className="mt-2 text-sm text-slate-500">Enter your concern or choose a speciality and city.</p>
        {query.hospital && <p className="mt-3 text-sm text-blue-700">Hospital: {catalog.hospitals.find(h => String(h.id) === String(query.hospital))?.name || 'Selected hospital'} <button className="ml-2 underline" onClick={() => setQuery(q => ({ ...q, hospital: '' }))}>Search all hospitals</button></p>}
        <form onSubmit={search} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Concern with doctor"><input className={input} placeholder="e.g. knee pain, orthopaedics" maxLength={120} value={query.q} onChange={e => setQuery({ ...query, q: e.target.value })} /></Field>
          <Field label="Speciality"><select className={input} value={query.speciality} onChange={e => setQuery({ ...query, speciality: e.target.value })}><option value="">All specialities</option>{catalog.specialities.map(s => <option key={s.id} value={s.id}>{s.name_en || s.name_hi}</option>)}</select></Field>
          <Field label="City"><select className={input} value={query.city} onChange={e => setQuery({ ...query, city: e.target.value })}><option value="">All cities</option>{cities.map(c => <option key={c}>{c}</option>)}</select></Field>
          <button className={`${primary} self-end`} disabled={busy}><Search size={17} /> {busy ? 'Searching…' : 'Find specialists'}</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-2">{catalog.specialities.slice(0,8).map(s => <button key={s.id} className={`${secondary} ${String(query.speciality) === String(s.id) ? 'ring-2 ring-emerald-400' : ''}`} onClick={() => setQuery({ ...query, speciality: s.id })}>{s.name_en || s.name_hi}</button>)}</div>
        <p className="mt-6 text-xs text-slate-500">Concern matching helps you find a speciality; it does not provide a diagnosis.</p>
      </section>}

      {step === 1 && <section>
        <div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="text-2xl font-bold">Find your specialist</h2><p className="mt-1 text-sm text-slate-500">{doctors.length} verified doctors matching your search</p></div><button className={secondary} onClick={() => setStep(0)}>Change search</button></div>
        {!doctors.length && <Empty title="No verified specialists match yet" detail="Try another city or speciality. The hospital team must verify doctors before they appear here." />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{doctors.map(d => <article key={d.id} className={card}>
          <div className="flex gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Stethoscope size={27} /></div><div><h3 className="font-bold text-lg">{d.name}</h3><p className="text-sm text-slate-500">{d.specialities?.join(', ')}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><ShieldCheck size={13} /> Verified specialist</span></div></div>
          <div className="mt-5 space-y-2 text-sm text-slate-600"><p>{d.degrees?.join(', ')} • {d.experience_in_years} years experience</p><p className="flex gap-2 items-center"><MapPin size={14} />{d.city || 'Contact for location'}</p><p>{Number(d.average_rating).toFixed(1)} / 5 · {d.total_reviews} reviews</p><p>Consultation: <strong className="text-slate-800">{money(d.consultation_fee)}</strong></p><p className="flex gap-2"><Clock3 size={15} />{d.next_available ? when(d.next_available) : 'No published slots yet'}</p></div>
          <div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} onClick={() => run(() => compare(d))} className={primary}>Select doctor <ArrowRight size={15} /></button><Link className={secondary} href={`/allDoctors/${d.uuid}`}>Profile</Link></div>
        </article>)}</div>
      </section>}

      {step === 2 && <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">Compare treatment costs</h2><p className="mt-1 text-sm text-slate-500">Hospital packages for {doctor?.name}. Estimates are confirmed by the hospital after assessment.</p></div><Field label="Treatment"><select className={input} disabled={busy} value={treatment} onChange={e => { setTreatment(e.target.value); run(() => compare(doctor, e.target.value)); }}><option value="">All treatments</option>{catalog.treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field></div>
        {!packages.length && <Empty title="No published packages for this selection" detail="You can still book a consultation using a published appointment slot. The hospital can advise on treatment costs." />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{packages.map(p => <article key={p.id} className={card}>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{p.city}</div><h3 className="mt-2 text-xl font-bold">{p.hospital_name}</h3><p className="mt-1 text-sm text-slate-500">{p.title} · {p.treatment_name}</p>
          <p className="my-5 text-2xl font-bold text-blue-700">{money(p.min_price)} – {money(p.max_price)}</p><p className="text-xs text-slate-500">Estimated package cost · valid through {new Date(p.valid_until).toLocaleDateString('en-IN')}</p>
          <h4 className="mt-5 text-sm font-semibold">What is included</h4><ul className="mt-2 space-y-2 text-sm text-slate-600">{p.inclusions.map(s => <li className="flex gap-2" key={s}><CheckCircle2 className="shrink-0 text-emerald-500" size={16} />{s}</li>)}</ul>
          {!!p.exclusions.length && <p className="mt-4 text-xs text-slate-500">Not included: {p.exclusions.join(', ')}</p>}
          <button className={`${primary} mt-6 w-full`} disabled={busy} onClick={() => book(p)}>Choose package <ArrowRight size={15} /></button>
        </article>)}</div>
        <button className={`${secondary} mt-5`} disabled={busy} onClick={() => book(null)}>Continue with consultation only <ArrowRight size={15} /></button>
      </section>}

      {step === 3 && <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submitBooking} className={`${card} lg:col-span-2`}><h2 className="text-2xl font-bold">Book & get guidance</h2><p className="mt-2 text-sm text-slate-500">Book for yourself or a family member. A login is required to keep your care details private.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Patient name"><input required maxLength={100} className={input} value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} /></Field><Field label="Contact phone"><input required type="tel" maxLength={20} className={input} value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} /></Field></div>
          <div className="mt-4"><Field label="Your requirement"><textarea required maxLength={2000} rows={3} className={input} value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} /></Field></div>
          <div className="mt-4"><Field label="Available appointment"><select required className={input} value={form.slot_id} onChange={e => setForm({ ...form, slot_id: e.target.value })}><option value="">Choose date, time and hospital</option>{slots.map(s => <option key={s.id} value={s.id}>{when(s.starts_at)} — {s.hospital_name} ({s.remaining} available)</option>)}</select></Field></div>
          {!slots.length && <p className="mt-3 text-sm text-amber-700">No bookable slots are published. Choose another doctor or ask the hospital to publish availability.</p>}
          <button className={`${primary} mt-6`} disabled={busy || !slots.length}>{busy ? 'Confirming…' : 'Confirm appointment'} <CalendarDays size={16} /></button>
        </form>
        <aside className={`${card} self-start`}><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><HeartHandshake /></div><h3 className="font-bold text-xl">Your care summary</h3><p className="mt-4 font-semibold">{doctor?.name}</p><p className="mt-2 text-sm text-slate-500">Consultation: {money(doctor?.consultation_fee)}</p>{selectedPackage && <div className="mt-4 border-t pt-4"><p className="font-medium">{selectedPackage.title}</p><p className="mt-1 text-sm">{selectedPackage.hospital_name}</p><p className="mt-2 font-bold text-blue-700">{money(selectedPackage.min_price)} – {money(selectedPackage.max_price)}</p></div>}<p className="mt-5 text-sm text-slate-500">Need financial help? Submit an assistance request from your confirmed appointment. Approval is reviewed separately.</p></aside>
      </div>}

      {step === 4 && <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">My care journey</h2><p className="mt-1 text-sm text-slate-500">Appointments, guidance, assistance and follow-up support in one place.</p></div><div className="flex gap-2"><button className={secondary} disabled={busy} onClick={myBookings}>Refresh</button><button className={primary} disabled={busy} onClick={() => { setStep(0); setError(''); }}>New appointment</button></div></div>
        {!bookings.length && !needsLogin && !error && !busy && <Empty title="No appointments yet" detail="Find a specialist and book your first consultation to start your care journey." />}
        <div className="space-y-5">{bookings.map(a => <PatientBooking key={a.id} booking={a} busy={busy} action={fn => run(async () => { await fn(); setBookings(await careApi('/appointments')); })} />)}</div>
      </section>}
    </div>
  </main>;
}

export function Field({ label: title, children }) { return <label className="block min-w-0"><span className="mb-1.5 block text-sm font-medium text-slate-600">{title}</span>{children}</label>; }
export function Empty({ title, detail }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-semibold text-slate-700">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{detail}</p></div>; }

function PatientBooking({ booking: a, action, busy }) {
  const [help, setHelp] = useState(false);
  const [reason, setReason] = useState(a.assistance?.reason || '');
  const [amount, setAmount] = useState(a.assistance?.requested_amount || '');
  const [reschedule, setReschedule] = useState(false);
  const [available, setAvailable] = useState([]);
  const [nextSlot, setNextSlot] = useState('');
  return <article className={card}>
    <div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Booking {a.id.slice(0,8)}</p><h3 className="mt-1 text-xl font-bold">{a.doctor_name}</h3><p className="mt-1 text-sm text-slate-500">{a.hospital_name} · {when(a.starts_at)}</p><p className="mt-1 text-sm">Patient: {a.patient_name}</p></div><span className="h-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">{label(a.status)}</span></div>
    <div className="mt-5 grid gap-5 md:grid-cols-2"><div><h4 className="text-sm font-bold">Care updates</h4><ol className="mt-3 space-y-3">{a.events.map(e => <li key={e.id} className="border-l-2 border-emerald-200 pl-3 text-sm"><strong>{label(e.status)}</strong><p className="text-slate-600">{e.note}</p><p className="mt-1 text-xs text-slate-400">{when(e.created_at)}</p></li>)}</ol></div><div><h4 className="text-sm font-bold">Follow-up support</h4>{!a.followups.length && <p className="mt-2 text-sm text-slate-500">Your care team will publish follow-up guidance here.</p>}{a.followups.map(f => <div key={f.id} className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{when(f.due_at)} · {f.completed_at ? 'Completed' : 'Scheduled'}</p><p className="mt-1 text-slate-600">{f.note}</p></div>)}{a.price_snapshot?.title && <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm"><p className="font-semibold">{a.price_snapshot.title}</p><p>{money(a.price_snapshot.min_price)} – {money(a.price_snapshot.max_price)} estimated</p></div>}</div></div>
    {a.assistance && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm"><strong>Financial assistance: {label(a.assistance.status)}</strong><p className="mt-1">Requested: {money(a.assistance.requested_amount)}</p>{a.assistance.decision_note && <p className="mt-1">{a.assistance.decision_note}</p>}<p className="mt-2 text-xs">Approval records eligibility; it does not indicate that money has been paid.</p></div>}
    <div className="mt-5 flex flex-wrap gap-2">{!['cancelled','no_show'].includes(a.status) && (!a.assistance || ['submitted','needs_information'].includes(a.assistance.status)) && <button className={secondary} onClick={() => setHelp(!help)}><HeartHandshake size={16} /> {a.assistance ? 'Update assistance request' : 'Request financial help'}</button>}{a.status === 'confirmed' && <><button disabled={busy} className={secondary} onClick={() => action(async () => { setAvailable((await careApi(`/slots?doctor=${a.doctor_id}&hospital=${a.hospital_id}`)).filter(s => s.id !== a.slot_id)); setReschedule(true); })}>Reschedule</button><button disabled={busy} className={secondary} onClick={() => { if(window.confirm('Cancel this appointment?')) action(() => careApi(`/appointments/${a.id}/cancel`, { method: 'POST' })); }}>Cancel appointment</button></>}</div>
    {reschedule && a.status === 'confirmed' && <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-blue-50 p-4" onSubmit={e => { e.preventDefault(); action(async () => { await careApi(`/appointments/${a.id}/reschedule`, { method: 'POST', body: { slot_id: nextSlot } }); setReschedule(false); setNextSlot(''); }); }}><Field label="New time with the same doctor and hospital"><select required className={input} value={nextSlot} onChange={e => setNextSlot(e.target.value)}><option value="">Select another time</option>{available.map(s => <option key={s.id} value={s.id}>{when(s.starts_at)}</option>)}</select></Field><button className={primary} disabled={busy || !available.length}>Confirm new time</button>{!available.length && <p className="text-sm text-slate-500">No alternative slots have been published.</p>}</form>}
    {help && <form className="mt-4 grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4" onSubmit={e => { e.preventDefault(); action(async () => { await careApi(`/appointments/${a.id}/assistance`, { method: 'POST', body: { reason, requested_amount: amount } }); setHelp(false); }); }}><Field label="Amount requested (₹)"><input required min="1" max="9999999999" type="number" className={input} value={amount} onChange={e => setAmount(e.target.value)} /></Field><Field label="Tell us what support you need"><textarea required maxLength={2000} className={input} value={reason} onChange={e => setReason(e.target.value)} /></Field><button className={`${primary} justify-self-start`} disabled={busy}>Submit for review</button></form>}
  </article>;
}

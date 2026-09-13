'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, HeartHandshake, Clock3, IndianRupee, ArrowUpRight, Plus, RefreshCw, CheckCircle2, Users } from 'lucide-react';
import { careApi, when, money, label, primary, secondary, input, card } from '@/lib/care-api';
import { Field, Empty } from './CareJourney';

const tabs = ['overview', 'appointments', 'packages', 'availability', 'assistance', 'followups', 'settings'];
const titles = { overview: 'Hospital Dashboard', appointments: 'Appointments & patient leads', packages: 'Treatment packages', availability: 'Doctor availability', assistance: 'Financial assistance', followups: 'Treatment & follow-up support', settings: 'Hospital access & concern matching' };
const initialData = { appointments: [], packages: [], slots: [], doctors: [], concerns: [], memberships: [], transitions: {}, hospital_ids: [] };

export default function HospitalCareAdmin({ initialTab = 'overview', standalone = false }) {
  const [tab, setTab] = useState(initialTab);
  const [data, setData] = useState(initialData);
  const [catalog, setCatalog] = useState({ hospitals: [], specialities: [], treatments: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editingPackage, setEditingPackage] = useState(null);
  const [accountData, setAccountData] = useState({
    stats: { total_accounts: 0, total_patients: 0, total_staff: 0, recent_signups: 0 },
    recent: []
  });
  const load = useCallback(async (signal) => {
    const [d, c] = await Promise.all([careApi('/manage/overview', { signal }), careApi('/catalog', { signal })]);
    if (signal?.aborted) return;
    setData(d); setCatalog({ ...c, hospitals: d.isadmin ? c.hospitals : c.hospitals.filter(h => d.hospital_ids.includes(h.id)) });
    if (d.isadmin) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const accRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-users/accounts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          signal
        });
        if (accRes.ok) {
          const json = await accRes.json();
          setAccountData({ stats: json.stats || {}, recent: (json.data || []).slice(0, 5) });
        }
      } catch {}
    }
    setLoaded(true); setError(''); setNeedsLogin(false);
  }, []);
  useEffect(() => { const controller = new AbortController(); load(controller.signal).catch(e => { if (!controller.signal.aborted) { setError(e.message); setNeedsLogin(e.status === 401); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [load]);
  async function action(fn, message = 'Changes saved.') {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); await load(); setNotice(message); return true; } catch (e) { setError(e.message); setNeedsLogin(e.status === 401); return false; } finally { setBusy(false); }
  }
  const navigate = value => { setTab(value); setStatus(''); setSearch(''); setError(''); setNotice(''); };
  const appointments = data.appointments.filter(a => (!status || a.status === status) && `${a.patient_name} ${a.patient_phone} ${a.doctor_name} ${a.hospital_name} ${a.id}`.toLowerCase().includes(search.toLowerCase()));
  const active = data.appointments.filter(a => !['completed','cancelled','no_show'].includes(a.status));
  const assistance = data.appointments.filter(a => a.assistance);
  const followups = data.appointments.flatMap(a => a.followups.map(f => ({ ...f, patient_name: a.patient_name, doctor_name: a.doctor_name, hospital_name: a.hospital_name })));
  const pendingHelp = assistance.filter(a => !['approved','declined'].includes(a.assistance.status));
  const pendingFollowups = followups.filter(f => !f.completed_at);
  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return <div className="p-4 sm:p-7 lg:p-9 text-slate-800">
    <header className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Hospital management · From confusion to care</p><h1 className="mt-2 text-2xl sm:text-3xl font-bold">{titles[tab]}</h1><p className="mt-2 text-sm text-slate-500">{day}</p></div><div className="flex gap-2"><Link href="/care" className={secondary}>Patient view <ArrowUpRight size={16} /></Link><Link href="/labs/workspace" className={secondary}>Staff workspace <ArrowUpRight size={16} /></Link><button aria-label="Refresh dashboard" className={secondary} disabled={busy || loading} onClick={() => action(async () => {}, 'Dashboard refreshed.')}><RefreshCw size={16} /></button></div></header>
    <nav aria-label="Hospital workflow" className="mb-6 flex gap-2 overflow-x-auto pb-2">{tabs.filter(t => data.isadmin || t !== 'settings').map(t => <button key={t} onClick={() => navigate(t)} className={`whitespace-nowrap ${tab === t ? primary : secondary}`}>{label(t)}</button>)}</nav>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}{needsLogin && <Link href="/login?next=/provider" className="ml-3 underline">Log in</Link>}</div>}
    {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
    {loading ? <div className="py-20 text-center text-slate-500">Loading hospital operations…</div> : !loaded ? <Empty title="Hospital dashboard could not load" detail="Use the refresh button to retry. If access is denied, ask your administrator to assign your hospital account." /> : <>
      {tab === 'overview' && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
          ['Appointments', data.appointments.length, CalendarDays, 'appointments'], ['Active care journeys', active.length, Users, 'appointments'], ['Assistance requests', pendingHelp.length, HeartHandshake, 'assistance'], ['Pending follow-ups', pendingFollowups.length, Clock3, 'followups'],
        ].map(([title, count, Icon, target], i) => <button key={title} onClick={() => navigate(target)} className={`rounded-2xl p-6 text-left shadow-sm ${i === 0 ? 'bg-gradient-to-br from-blue-600 to-emerald-500 text-white' : 'border border-slate-100 bg-white'}`}><div className="flex justify-between items-center text-sm font-medium"><span>{title}</span><Icon size={21} className={i ? 'text-blue-500' : 'text-blue-100'} /></div><p className="mt-5 text-4xl font-bold">{count}</p><p className={`mt-2 text-xs ${i ? 'text-slate-400' : 'text-blue-100'}`}>View and manage →</p></button>)}</div>
        <section className={`${card} mt-6`}><h2 className="text-lg font-bold">Patient journey</h2><p className="mt-1 text-sm text-slate-500">Manage the complete flow from finding care to recovery.</p><div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">{[['01','Requirement','Concern & city','settings'],['02','Specialist','Verified doctor','availability'],['03','Compare cost','Hospital packages','packages'],['04','Book & guide','Appointments','appointments'],['05','Financial help','Review requests','assistance'],['06','Ongoing care','Treatment & follow-up','followups']].map(([n,title,detail,target]) => <button key={n} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left hover:border-blue-300" onClick={() => navigate(target === 'settings' && !data.isadmin ? 'availability' : target)}><span className="text-xs font-bold text-emerald-600">STEP {n}</span><h3 className="mt-3 text-sm font-bold">{title}</h3><p className="mt-1 text-xs text-slate-500">{detail}</p></button>)}</div></section>
        <div className="mt-6 grid gap-6 xl:grid-cols-3"><section className={`${card} xl:col-span-2`}><div className="flex justify-between"><h2 className="font-bold text-lg">Recent appointments</h2><button className="text-sm font-semibold text-blue-600" onClick={() => navigate('appointments')}>View all →</button></div>{!data.appointments.length ? <p className="py-10 text-sm text-slate-500">Bookings will appear here when patients confirm an appointment.</p> : <div className="mt-4 divide-y divide-slate-100">{data.appointments.slice(0,5).map(a => <button key={a.id} onClick={() => { navigate('appointments'); setSearch(a.id); }} className="flex w-full flex-wrap justify-between gap-3 py-4 text-left"><div><p className="font-semibold text-sm">{a.patient_name}</p><p className="mt-1 text-xs text-slate-500">{a.doctor_name} · {a.hospital_name}</p></div><div className="text-right"><p className="text-xs text-slate-500">{when(a.starts_at)}</p><Badge value={a.status} /></div></button>)}</div>}</section><section className={card}><h2 className="font-bold text-lg">Ready to receive patients?</h2><p className="mt-2 text-sm text-slate-500">Verified doctors need published availability. Packages make comparison possible.</p><div className="mt-5 space-y-3">{[['Published packages',data.packages.filter(p => p.is_active).length,'packages'],['Upcoming slots',data.slots.filter(s => s.is_active && new Date(s.starts_at)>new Date()).length,'availability']].map(([s,n,t]) => <button key={s} className="flex w-full justify-between rounded-xl bg-blue-50 p-4 text-sm" onClick={() => navigate(t)}><span>{s}</span><strong className="text-blue-700">{n}</strong></button>)}</div><button className={`${primary} mt-5 w-full`} onClick={() => navigate('availability')}><Plus size={16} /> Publish availability</button></section></div>
        {data.isadmin && <section className={`${card} mt-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="font-bold text-lg text-slate-800">Recent Account Registrations &amp; Staff Members</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time record of users creating accounts (Patients &amp; Healthcare Staff)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                Total Users: {accountData.stats.total_accounts || 0}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                Staff Members: {accountData.stats.total_staff || 0}
              </span>
            </div>
          </div>
          {!accountData.recent.length ? (
            <p className="text-xs text-slate-400 py-4">No registered accounts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-bold">User</th>
                    <th className="pb-2.5 font-bold">Role</th>
                    <th className="pb-2.5 font-bold">Post / Designation</th>
                    <th className="pb-2.5 font-bold">Phone</th>
                    <th className="pb-2.5 font-bold">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {accountData.recent.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5">
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          u.role === 'staff'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.isadmin
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role === 'staff' ? '🩺 Staff' : (u.isadmin ? '🛡️ Admin' : '👤 Patient')}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {u.role === 'staff' ? (
                          <span className={`font-semibold ${u.post && u.post !== '-' && u.post !== 'Pending Assignment' ? 'text-slate-700' : 'text-slate-400'}`}>
                            {u.post && u.post !== '-' && u.post !== 'Pending Assignment' ? u.post : '-'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">{u.phone || '—'}</td>
                      <td className="py-2.5 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>}
      </>}

      {tab === 'appointments' && <><div className="mb-5 flex flex-wrap gap-3"><input className={`${input} sm:max-w-sm`} aria-label="Search appointments" placeholder="Search patient, doctor, hospital or booking…" value={search} onChange={e => setSearch(e.target.value)} /><select className={`${input} sm:max-w-xs`} aria-label="Filter appointment status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{Object.keys(data.transitions).map(s => <option key={s} value={s}>{label(s)}</option>)}</select></div>{!appointments.length && <Empty title="No appointments found" detail="Publish slots and invite patients to book through the Hospital care page." />}<div className="space-y-5">{appointments.map(a => <Appointment key={a.id} booking={a} transitions={data.transitions} action={action} busy={busy} />)}</div></>}

      {tab === 'packages' && <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-1"><PackageForm key={editingPackage?.id || "new"} catalog={catalog} action={action} busy={busy} existing={editingPackage} onDone={() => setEditingPackage(null)} /></div><div className="space-y-4 xl:col-span-2">{!data.packages.length && <Empty title="No treatment packages yet" detail="Add hospital-specific prices and inclusions for patients to compare." />}{data.packages.map(p => <article key={p.id} className={card}><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-semibold text-emerald-600">{p.hospital_name}</p><h3 className="mt-1 text-lg font-bold">{p.title}</h3><p className="text-sm text-slate-500">{p.treatment_name}</p></div><Badge value={p.is_active ? 'published' : 'paused'} /></div><p className="mt-4 text-2xl font-bold text-blue-700">{money(p.min_price)} – {money(p.max_price)}</p><p className="mt-2 text-sm text-slate-600">Included: {p.inclusions.join(', ') || 'Not specified'}</p><p className="mt-1 text-sm text-slate-500">Excluded: {p.exclusions.join(', ') || 'Not specified'}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">Valid until {new Date(p.valid_until).toLocaleDateString('en-IN')}</span><button className={secondary} disabled={busy} onClick={() => { setEditingPackage(p); window.scrollTo({top:0,behavior:'smooth'}); }}>Edit</button><button disabled={busy} className={secondary} onClick={() => action(() => careApi(`/manage/packages/${p.id}`, { method: 'PATCH', body: { is_active: !p.is_active } }))}>{p.is_active ? 'Pause package' : 'Publish package'}</button></div></article>)}</div></div>}

      {tab === 'availability' && <div className="grid gap-6 xl:grid-cols-3"><SlotForm catalog={catalog} doctors={data.doctors} action={action} busy={busy} /><div className="space-y-4 xl:col-span-2">{!data.slots.length && <Empty title="No upcoming availability" detail="Publish doctor slots so patients can book real appointments." />}{data.slots.map(s => <article key={s.id} className={card}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{s.doctor_name}</h3><p className="mt-1 text-sm text-slate-500">{s.hospital_name}</p><p className="mt-3 text-sm font-semibold">{when(s.starts_at)} → {when(s.ends_at)}</p><p className="mt-1 text-xs text-slate-500">Capacity: {s.capacity} · {s.is_active ? 'Open' : 'Closed'}</p></div>{s.is_active && <button className={`${secondary} self-center`} disabled={busy} onClick={() => action(() => careApi(`/manage/slots/${s.id}`, { method: 'PATCH' }))}>Close slot</button>}</div></article>)}</div></div>}

      {tab === 'assistance' && <div className="space-y-4"><p className="text-sm text-slate-500">Review requests and record a clear decision. Approval here does not initiate a payment.</p>{!assistance.length && <Empty title="No assistance requests" detail="Patients can request financial support from a confirmed booking." />}{assistance.map(a => <Assistance key={a.id} booking={a} action={action} busy={busy} isadmin={data.isadmin} />)}</div>}

      {tab === 'followups' && <div className="space-y-4">{!followups.length && <Empty title="No follow-ups scheduled" detail="Open an appointment to add follow-up instructions and a date." />}{[...followups].sort((a,b) => new Date(a.due_at)-new Date(b.due_at)).map(f => <article className={card} key={f.id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{f.patient_name}</h3><p className="mt-1 text-sm text-slate-500">{f.doctor_name} · {f.hospital_name}</p><p className={`mt-3 text-sm font-semibold ${!f.completed_at && new Date(f.due_at)<new Date() ? 'text-red-600' : 'text-blue-600'}`}>{when(f.due_at)}</p><p className="mt-2 text-sm">{f.note}</p></div>{f.completed_at ? <Badge value="completed" /> : <button className={`${primary} self-center`} disabled={busy} onClick={() => action(() => careApi(`/manage/followups/${f.id}`, { method: 'PATCH' }))}><CheckCircle2 size={16} /> Mark completed</button>}</div></article>)}</div>}

      {tab === 'settings' && data.isadmin && <Settings data={data} catalog={catalog} action={action} busy={busy} />}
    </>}
  </div>;
}

function Badge({ value }) { return <span className="mt-1 inline-block h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{label(value)}</span>; }
const formValues = e => Object.fromEntries(new FormData(e.currentTarget));
const split = s => s.split('\n').map(x => x.trim()).filter(Boolean);
function HospitalSelect({ hospitals }) { return <Field label="Hospital"><select name="hospital_id" required className={input}><option value="">Choose hospital</option>{hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>; }

function PackageForm({ catalog, action, busy, existing, onDone }) {
  return <form className={`${card} self-start space-y-4`} onSubmit={async e => { e.preventDefault(); const form=e.currentTarget,v=formValues(e); const ok=await action(() => careApi(existing ? `/manage/packages/${existing.id}` : '/manage/packages', { method: existing ? 'PATCH' : 'POST', body: { ...v, inclusions: split(v.inclusions), exclusions: split(v.exclusions) } })); if(ok){form.reset();onDone();} }}><h2 className="font-bold text-lg">{existing ? "Edit treatment package" : "Create treatment package"}</h2>{existing ? <p className="text-sm text-slate-500">{existing.hospital_name} ? {existing.treatment_name}</p> : <HospitalSelect hospitals={catalog.hospitals} />}{!existing && <Field label="Treatment"><select name="treatment_id" required className={input}><option value="">Choose treatment</option>{catalog.treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>}<Field label="Package title"><input name="title" defaultValue={existing?.title || ''} required maxLength={200} className={input} placeholder="e.g. Knee replacement package" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Minimum ₹"><input name="min_price" defaultValue={existing?.min_price ?? ''} required min="0" max="9999999999" step="0.01" type="number" className={input} /></Field><Field label="Maximum ₹"><input name="max_price" defaultValue={existing?.max_price ?? ''} required min="0" max="9999999999" step="0.01" type="number" className={input} /></Field></div><Field label="Included (one per line)"><textarea name="inclusions" defaultValue={existing?.inclusions?.join("\n") || ""} rows={4} className={input} placeholder={'Surgeon fee\nRoom charges\nDiagnostics'} /></Field><Field label="Excluded (one per line)"><textarea name="exclusions" defaultValue={existing?.exclusions?.join("\n") || ""} rows={2} className={input} /></Field><Field label="Valid until"><input name="valid_until" defaultValue={existing?.valid_until?.slice(0,10) || ""} required type="date" className={input} /></Field><button className={`${primary} w-full`} disabled={busy}><Plus size={16} /> {existing ? "Save package changes" : "Publish package"}</button>{existing && <button type="button" className={secondary} onClick={onDone}>Cancel editing</button>}</form>;
}
function SlotForm({ catalog, doctors, action, busy }) {
  return <form className={`${card} self-start space-y-4`} onSubmit={async e => { e.preventDefault(); const form=e.currentTarget,v=formValues(e); const ok=await action(() => careApi('/manage/slots', { method: 'POST', body: { ...v, starts_at:new Date(v.starts_at).toISOString(),ends_at:new Date(v.ends_at).toISOString() } })); if(ok)form.reset(); }}><h2 className="font-bold text-lg">Publish appointment slot</h2><HospitalSelect hospitals={catalog.hospitals} /><Field label="Doctor"><select name="doctor_id" required className={input}><option value="">Choose doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}{!d.is_verified ? ' (verification pending)' : ''}</option>)}</select></Field><p className="text-xs text-slate-500">Only active, verified doctors appear in patient searches.</p><Field label="Starts at (local time)"><input name="starts_at" type="datetime-local" required className={input} /></Field><Field label="Ends at (local time)"><input name="ends_at" type="datetime-local" required className={input} /></Field><Field label="Patient capacity"><input name="capacity" type="number" min="1" max="50" defaultValue="1" required className={input} /></Field><button className={`${primary} w-full`} disabled={busy}><CalendarDays size={16} /> Publish availability</button></form>;
}
function Appointment({ booking:a, transitions, action, busy }) {
  const [expanded,setExpanded]=useState(false);
  return <article className={card}><div className="flex flex-wrap justify-between gap-4"><div><span className="text-xs font-semibold text-emerald-600">{a.id.slice(0,8)}</span><h3 className="mt-1 text-lg font-bold">{a.patient_name}</h3><p className="mt-1 text-sm text-slate-500">{a.doctor_name} · {a.hospital_name}</p><p className="mt-2 text-sm font-medium">{when(a.starts_at)}</p></div><div className="flex items-start gap-3"><Badge value={a.status} /><button className={secondary} onClick={() => setExpanded(!expanded)}>{expanded?'Close details':'Manage care'}</button></div></div>{expanded && <div className="mt-5 border-t border-slate-100 pt-5"><p className="text-sm"><strong>Phone:</strong> {a.patient_phone}</p><p className="mt-2 text-sm"><strong>Requirement:</strong> {a.requirement}</p>{a.price_snapshot.title && <p className="mt-2 text-sm"><strong>Selected package:</strong> {a.price_snapshot.title} · {money(a.price_snapshot.min_price)} – {money(a.price_snapshot.max_price)}</p>}<div className="mt-5 grid gap-5 lg:grid-cols-2">{!!transitions[a.status]?.length && <form className="space-y-3 rounded-xl bg-slate-50 p-4" onSubmit={async e => { e.preventDefault();const f=e.currentTarget,v=formValues(e);if(await action(() => careApi(`/manage/appointments/${a.id}`,{method:'PATCH',body:v})))f.reset(); }}><h4 className="font-semibold text-sm">Update care stage</h4><Field label="Next stage"><select name="status" required className={input}><option value="">Choose stage</option>{transitions[a.status].map(s=><option key={s} value={s}>{label(s)}</option>)}</select></Field><Field label="Guidance visible to patient"><textarea name="note" required maxLength={2000} className={input} /></Field><button className={primary} disabled={busy}>Save update</button></form>}{!['cancelled','no_show','completed'].includes(a.status) && <form className="space-y-3 rounded-xl bg-slate-50 p-4" onSubmit={async e => { e.preventDefault();const f=e.currentTarget,v=formValues(e);if(await action(() => careApi(`/manage/appointments/${a.id}/followups`,{method:'POST',body:{...v,due_at:new Date(v.due_at).toISOString()}})))f.reset(); }}><h4 className="font-semibold text-sm">Schedule follow-up</h4><Field label="Follow-up date and time"><input type="datetime-local" name="due_at" required className={input} /></Field><Field label="Patient instructions"><textarea name="note" required maxLength={2000} className={input} /></Field><button className={primary} disabled={busy}>Schedule follow-up</button></form>}</div><ol className="mt-5 space-y-3">{a.events.map(e=><li key={e.id} className="border-l-2 border-emerald-200 pl-3 text-sm"><strong>{label(e.status)}</strong><span className="ml-2 text-xs text-slate-400">{when(e.created_at)}</span><p className="mt-1 text-slate-600">{e.note}</p></li>)}</ol></div>}</article>;
}
function Assistance({ booking:a, action, busy, isadmin }) {
  const f=a.assistance;
  return <article className={card}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{a.patient_name}</h3><p className="mt-1 text-sm text-slate-500">{a.hospital_name} · Booking {a.id.slice(0,8)}</p></div><Badge value={f.status} /></div><p className="mt-4 font-bold text-blue-700">Requested: {money(f.requested_amount)}</p><p className="mt-2 text-sm">{f.reason}</p>{f.decision_note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">Review note: {f.decision_note}</p>}{isadmin && !['approved','declined'].includes(f.status) && <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={e=>{e.preventDefault();const values=formValues(e);action(()=>careApi(`/manage/assistance/${f.id}`,{method:'PATCH',body:values}));}}><Field label="Decision"><select name="status" required className={input}><option value="">Select</option>{['under_review','needs_information','approved','declined'].map(s=><option key={s} value={s}>{label(s)}</option>)}</select></Field><Field label="Reason / next steps"><input name="decision_note" required maxLength={2000} className={input} /></Field><button className={`${primary} self-end`} disabled={busy}>Save decision</button></form>}</article>;
}
function Settings({data,catalog,action,busy}) {
  return <div className="grid gap-6 lg:grid-cols-2"><section className={card}><h2 className="font-bold text-lg">Concern-to-speciality matching</h2><p className="mt-2 text-sm text-slate-500">Add reviewed search phrases, including Hindi terms. These guide discovery, not diagnosis.</p><form className="mt-5 space-y-3" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget,v=formValues(e);if(await action(()=>careApi('/manage/concerns',{method:'POST',body:v})))f.reset();}}><Field label="Concern keyword"><input name="keyword" required maxLength={120} className={input} placeholder="e.g. knee pain" /></Field><Field label="Speciality"><select name="speciality_id" required className={input}><option value="">Choose speciality</option>{catalog.specialities.map(s=><option key={s.id} value={s.id}>{s.name_en}</option>)}</select></Field><button disabled={busy} className={primary}>Save mapping</button></form><div className="mt-5 divide-y">{data.concerns.map(c=><div key={c.id} className="flex justify-between py-3 text-sm"><span>{c.keyword}</span><strong>{c.name_en}</strong></div>)}</div></section><section className={card}><h2 className="font-bold text-lg">Hospital staff access</h2><p className="mt-2 text-sm text-slate-500">Staff use /provider to manage only their assigned hospitals. Ask them to register before assigning access.</p><form className="mt-5 space-y-3" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget,v=formValues(e);if(await action(()=>careApi('/manage/memberships',{method:'POST',body:v})))f.reset();}}><Field label="Registered staff email"><input name="email" type="email" required className={input} /></Field><HospitalSelect hospitals={catalog.hospitals} /><button disabled={busy} className={primary}>Grant hospital access</button></form><div className="mt-5 space-y-3">{data.memberships.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm"><div><p>{m.email}</p><p className="text-xs text-slate-500">{m.hospital_name}</p></div><button className="text-red-600" disabled={busy} onClick={()=>{if(window.confirm('Remove this hospital access?'))action(()=>careApi(`/manage/memberships/${m.id}`,{method:'DELETE'}));}}>Revoke</button></div>)}</div></section></div>;
}

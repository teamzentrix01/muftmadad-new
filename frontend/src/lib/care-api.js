export const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export async function careApi(path, { method = 'GET', body, signal } = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!API) throw new Error('Hospital service is not configured. Set NEXT_PUBLIC_API_URL and restart the frontend.');
  const timeout = AbortSignal.timeout(20000);
  let response;
  try {
    response = await fetch(`${API}/care${path}`, {
    method, credentials: 'include', cache: 'no-store', signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(timeout.aborted ? 'Hospital service took too long to respond. Please retry.' : 'Cannot connect to the hospital service. Check your connection and try again.');
  }
  const result = await response.json().catch(() => { throw new Error('Hospital service returned an invalid response. Please retry.'); });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Hospital service returned an invalid response. Check the API configuration.');
  if (!response.ok) { const error = new Error(result.message || 'Please try again.'); error.status = response.status; throw error; }
  return result;
}

export const money = value => value == null ? 'Contact hospital' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
export const when = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
export const label = value => value.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
export const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed';
export const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';
export const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
export const card = 'rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm';

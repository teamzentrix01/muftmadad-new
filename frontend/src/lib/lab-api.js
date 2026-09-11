const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
export async function labApi(path, { method = 'GET', body, signal, download = false } = {}) {
  if (!API) throw new Error('Lab service is not configured. Set NEXT_PUBLIC_API_URL and restart the frontend.');
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  let response;
  try { response = await fetch(`${API}/lab${path}`, {
    method, credentials: 'include', cache: 'no-store',
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }); } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Cannot connect to the lab service. Please check your connection and retry.');
  }
  if (download && response.ok) {
    if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('The report could not be downloaded. Please retry.');
    return response.blob();
  }
  const result = await response.json().catch(() => { throw new Error('Lab service is unavailable. Please retry.'); });
  if (!response.ok) throw Object.assign(new Error(result.message || 'Please retry.'), { status: response.status });
  return result;
}
export const labTabs = [
  ['overview', 'Lab Overview'], ['bookings', 'Bookings & Assignment'], ['tests', 'Tests & Packages'],
  ['laboratories', 'Laboratories'], ['collectors', 'Collectors'], ['areas', 'Service Areas'],
  ['reports', 'Samples & Reports'], ['payments', 'Payments & Settlements'], ['analytics', 'Reports & Analytics'], ['access', 'Users & Permissions'],
];
export const labStatuses = ['confirmed', 'assigned', 'collected', 'received', 'processing', 'report_ready', 'cancelled'];
export const title = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
export const rupees = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0));

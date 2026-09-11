import axios from 'axios';

export async function saveAdminRecord(createPath, updatePath, id, data) {
  const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (!api) throw new Error('API is not configured. Restart the frontend after setting NEXT_PUBLIC_API_URL.');
  const token = localStorage.getItem('authToken');
  const response = await axios({
    method: id ? 'put' : 'post',
    url: `${api}${id ? `${updatePath}/${id}` : createPath}`,
    data, withCredentials: true,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = response.data;
  if (body?.success === false) throw new Error(body.message || 'Save failed.');
  const record = Array.isArray(body) ? body[0] : body.data ?? body;
  if (!record?.id) throw new Error('The server did not return the saved record. Refresh the list before retrying.');
  return record;
}

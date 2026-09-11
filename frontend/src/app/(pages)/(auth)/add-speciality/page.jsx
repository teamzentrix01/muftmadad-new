'use client';
import React, { useState } from 'react';
import { saveAdminRecord } from '@/lib/admin-save';

export default function AddSpecialityForm() {
  const [form, setForm] = useState({
    name_en: '', name_hi: '', slug: '',
    image: '', description_en: '', description_hi: '', is_active: true
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name_en' ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (e, createNext = false) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg({ type: '', text: '' });


    try {
      const record = await saveAdminRecord('/specialities', '/specialities', savedId, form);
      setSavedId(record.id);
      setMsg({ type: 'success', text: 'Speciality added successfully!' });
      if (createNext) { setSavedId(null); setForm({ name_en: '', name_hi: '', slug: '', image: '', description_en: '', description_hi: '', is_active: true }); }
    } catch (err) {
      // ✅ Show the actual backend error message
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Unknown error';

      console.error('Full error:', err.response?.data); // ✅ log full backend response
      setMsg({ type: 'error', text: typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 ">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-500">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Speciality</h1>

        {msg.text && (
          <div className={`mb-4 p-4 rounded-lg text-sm font-medium break-all ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-400'
              : 'bg-red-50 text-red-800 border border-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                name="name_en" value={form.name_en} onChange={handleChange} required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                placeholder="Ophthalmology"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name (Hindi) <span className="text-red-500">*</span>
              </label>
              <input
                name="name_hi" value={form.name_hi} onChange={handleChange} required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                placeholder="नेत्र रोग"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Auto-generated)</label>
            <input
              name="slug" value={form.slug} onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 outline-none"
              placeholder="ophthalmology"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              name="image" value={form.image} onChange={handleChange} required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (English)</label>
            <textarea
              name="description_en" value={form.description_en} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="Ophthalmology deals with eye health..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Hindi)</label>
            <textarea
              name="description_hi" value={form.description_hi} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              placeholder="नेत्रऔषधि विज्ञान..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" name="is_active" id="is_active"
              checked={form.is_active} onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Is Active</label>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" disabled={loading} onClick={e => { if (e.currentTarget.form.reportValidity()) handleSubmit(e, true); }} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50">Save &amp; Create Next</button>
        </form>

        {/* ✅ Debug panel — remove in production */}
        {/* <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs font-bold text-gray-500 mb-2">DEBUG — Current form data:</p>
          <pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(form, null, 2)}</pre>
        </div> */}
      </div>
    </div>
  );
}
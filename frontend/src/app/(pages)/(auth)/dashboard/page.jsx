"use client";

import React, { useState, useEffect, useCallback, useRef} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Users,
  Stethoscope,
  Calendar,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Building2,
  Star,
  LogOut,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Layers,
  FileText,
  Eye,
  Pencil,
  Save,
  MapPin,
  Menu,
  UserCheck,
  Shield,
} from "lucide-react";
import HospitalCareAdmin from '@/components/care/HospitalCareAdmin';
import LabDashboard from '@/components/lab/LabDashboard';
import DashboardNavigation from '@/components/lab/DashboardNavigation';
import Navbar from "@/components/Navbar";
import AdminDoctorForm from "../add_doctors/page";
import AdminHospitalForm from "../add_hospitals/page";
import TreatmentAdminForm from "../add_treatments/page";
import ReviewForm from "../add_user_reviews/page";
import AddSpecialityForm from "../add-speciality/page";
import BlogBuilder from "../../BlogBuilder/page";
import AddCityForm from "../add_city/page";
import RecycleBinAdmin from "@/components/admin/RecycleBinAdmin";

const API = process.env.NEXT_PUBLIC_API_URL; // Remove hardcoded value
const grad = "linear-gradient(90deg,#2563eb,#10b981)";
const gradCard = "linear-gradient(135deg,#2563eb,#10b981)";

/* ─── Badge ──────────────────────────────────────────────────────────────────*/
function Badge({ active }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────────*/
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-xl text-white font-medium text-sm max-w-xs sm:max-w-sm ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}>
        <X className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

/* ─── Confirm Modal ──────────────────────────────────────────────────────────*/
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-gray-800 font-semibold text-lg">{message}</p>
          <p className="text-gray-500 text-sm">This action cannot be undone.</p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Drawer ────────────────────────────────────────────────────────────*/
function EditDrawer({ title, item, fields, onSave, onClose, loading }) {
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach((f) => {
      const v = item[f.key];
      init[f.key] = Array.isArray(v) ? v.join(", ") : (v ?? "");
    });
    return init;
  });

  const handleSave = () => {
    const payload = {};
    fields.forEach((f) => {
      if (f.isArray) {
        payload[f.key] = String(form[f.key])
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "checkbox") {
        payload[f.key] =
          form[f.key] === true ||
          form[f.key] === "true" ||
          form[f.key] === true;
      } else if (f.type === "number") {
        payload[f.key] = form[f.key] === "" ? null : Number(form[f.key]);
      } else {
        payload[f.key] = form[f.key] || null;
      }
    });
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Drawer: full-width on mobile, max-lg on larger screens */}
      <div className="w-full max-w-full sm:max-w-lg bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> Edit{" "}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {f.label}
                {f.isArray && (
                  <span className="text-gray-400 normal-case font-normal ml-1">
                    (comma-separated)
                  </span>
                )}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : f.type === "checkbox" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [f.key]: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Enabled</span>
                </label>
              ) : (
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: grad }}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Generic List Page ──────────────────────────────────────────────────────*/
function ListPage({
  title,
  fetchUrl,
  deleteUrl,
  updateUrl,
  idField,
  columns,
  renderRow,
  addKey,
  setPage,
  viewUrl,
  editFields,
  entityName,
}) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(fetchUrl, { withCredentials: true });
      const result = res.data?.data ?? res.data;
      setData(Array.isArray(result) ? result : []);
    } catch {
      setToast({ msg: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${deleteUrl}/${deleteTarget[idField]}`, {
        withCredentials: true,
      });
      setToast({ msg: "Deleted successfully!", type: "success" });
      setData((prev) =>
        prev.filter((d) => d[idField] !== deleteTarget[idField]),
      );
    } catch {
      setToast({ msg: "Delete failed.", type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = async (payload) => {
    if (!updateUrl || !editTarget) return;
    setEditLoading(true);
    try {
      const res = await axios.put(
        `${updateUrl}/${editTarget[idField]}`,
        payload,
        { withCredentials: true },
      );
      const updated = res.data?.data || res.data;
      setData((prev) =>
        prev.map((d) =>
          d[idField] === editTarget[idField] ? { ...d, ...updated } : d,
        ),
      );
      setToast({ msg: "Updated successfully!", type: "success" });
      setEditTarget(null);
    } catch (err) {
      setToast({
        msg: err.response?.data?.message || "Update failed.",
        type: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = data.filter((item) =>
    columns.some((col) =>
      String(item[col.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmModal
          message={`Delete this ${entityName || title.replace("All ", "")}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editTarget && editFields && (
        <EditDrawer
          title={entityName || ""}
          item={editTarget}
          fields={editFields}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {data.length} total records
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-100 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          {addKey && (
            <button
              onClick={() => setPage(addKey)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow"
              style={{ background: grad }}
            >
              <Plus className="w-4 h-4" />{" "}
              <span className="hidden xs:inline">Add New</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Table — horizontally scrollable on small screens */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={item[idField] ?? idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    {renderRow(item)}
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-1">
                        {viewUrl && (
                          <button
                            onClick={() => router.push(viewUrl(item))}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {editFields && (
                          <button
                            onClick={() => setEditTarget(item)}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Specialities List ──────────────────────────────────────────────────────*/
function SpecialitiesListPage({ setPage }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/specialities`, { withCredentials: true });
      const result = res.data?.data ?? res.data;
      setData(Array.isArray(result) ? result : []);
    } catch {
      setToast({ msg: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('tr[data-drag-row-sp]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex.current !== index) {
      document.querySelectorAll('tr[data-drag-row-sp]')
        .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
      dragOverIndex.current = index;
      const row = document.querySelector(`tr[data-drag-row-sp="${index}"]`);
      if (row) row.classList.add('bg-blue-50', 'border-t-2', 'border-blue-400');
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    setData((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
    document.querySelectorAll('tr[data-drag-row-sp]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const orderedIds = data.map((item, idx) => ({
        id: item.id,
        display_order: idx + 1,
      }));
      await axios.post(`${API}/specialities/reorder`, { orderedIds }, { withCredentials: true });
      setToast({ msg: 'Order saved! Frontend will now show specialities in this order.', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to save order.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/specialities/${deleteTarget.id}`, { withCredentials: true });
      setToast({ msg: 'Deleted successfully!', type: 'success' });
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      setToast({ msg: 'Delete failed.', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const editFields = [
    { key: 'name_en', label: 'Name (English)', type: 'text' },
    { key: 'name_hi', label: 'Name (Hindi)', type: 'text' },
    { key: 'slug', label: 'Slug', type: 'text' },
    { key: 'image', label: 'Image URL', type: 'text' },
    { key: 'description_en', label: 'Description (EN)', type: 'textarea' },
    { key: 'description_hi', label: 'Description (HI)', type: 'textarea' },
    { key: 'is_active', label: 'Is Active', type: 'checkbox' },
  ];

  const handleEdit = async (payload) => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const res = await axios.put(`${API}/specialities/${editTarget.id}`, payload, { withCredentials: true });
      const updated = res.data?.data || res.data;
      setData((prev) => prev.map((d) => (d.id === editTarget.id ? { ...d, ...updated } : d)));
      setToast({ msg: 'Updated successfully!', type: 'success' });
      setEditTarget(null);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Update failed.', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { key: 'name_en', label: 'Name (EN)' },
    { key: 'name_hi', label: 'Name (HI)' },
    { key: 'slug', label: 'Slug' },
    { key: 'is_active', label: 'Status' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmModal
          message="Delete this Speciality?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editTarget && (
        <EditDrawer
          title="Speciality"
          item={editTarget}
          fields={editFields}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Specialities</h2>
          <p className="text-gray-500 text-sm mt-1">{data.length} total records</p>
          <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
            <span>⠿</span> Drag rows to reorder · click <strong>Save Order</strong> to apply
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            onClick={() => setPage('add-speciality')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow"
            style={{ background: grad }}
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase w-10"></th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    data-drag-row-sp={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <td className="py-3 px-3 text-gray-300 select-none text-lg text-center">⠿</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: '#6366f1' }}>
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 text-sm">{item.name_en}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.name_hi || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500 font-mono">{item.slug || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5"><Badge active={item.is_active} /></td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/speciality/${item.id}`)} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditTarget(item)} className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        After reordering, click <strong>Save Order</strong> to persist changes to the database.
      </p>
    </div>
  );
}

/* ─── Doctors List ───────────────────────────────────────────────────────────*/
function DoctorsListPage({ setPage }) {
  return (
    <ListPage
      title="All Doctors"
      entityName="Doctor"
      fetchUrl={`${API}/doctors`}
      deleteUrl={`${API}/doctors`}
      updateUrl={`${API}/doctors`}
      idField="uuid"
      addKey="add-doctor"
      setPage={setPage}
      editFields={[
        { key: "name", label: "Full Name", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "photo", label: "Photo URL", type: "text" },
        { key: "city", label: "City", type: "text" },
        { key: "state", label: "State", type: "text" },
        { key: "country", label: "Country", type: "text" },
        {
          key: "experience_in_years",
          label: "Experience (yrs)",
          type: "number",
        },
        { key: "consultation_fee", label: "Consultation Fee", type: "number" },
        { key: "degrees", label: "Degrees", type: "text", isArray: true },
        {
          key: "specialities",
          label: "Specialities",
          type: "text",
          isArray: true,
        },
        {
          key: "languages_spoken",
          label: "Languages",
          type: "text",
          isArray: true,
        },
        { key: "currently_serving", label: "Currently Serving", type: "text" },
        { key: "overview", label: "Overview / Bio", type: "textarea" },
        { key: "is_active", label: "Is Active", type: "checkbox" },
        { key: "is_verified", label: "Is Verified", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "specialities", label: "Specialities" },
        { key: "city", label: "City" },
        { key: "experience_in_years", label: "Exp (yrs)" },
        { key: "is_active", label: "Status" },
      ]}
      renderRow={(item) => (
        <>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <div className="flex items-center gap-2 sm:gap-3">
              {item.photo ? (
                <img
                  src={item.photo}
                  alt=""
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: gradCard }}
                >
                  {item.name?.[0] ?? "D"}
                </div>
              )}
              <span className="font-semibold text-gray-800 text-sm">
                {item.name}
              </span>
            </div>
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.email}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {Array.isArray(item.specialities)
              ? item.specialities.join(", ")
              : item.specialities || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.city || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.experience_in_years ?? "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <Badge active={item.is_active} />
          </td>
        </>
      )}
    />
  );
}

/* ─── Hospitals List ─────────────────────────────────────────────────────────*/
/* ─── Hospitals List (with drag-to-reorder) ──────────────────────────────────*/
function HospitalsListPage({ setPage }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // drag state — stored in refs to avoid re-renders during drag
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hospitals`, { withCredentials: true });
      const result = res.data?.data ?? res.data;
      setData(Array.isArray(result) ? result : []);
    } catch {
      setToast({ msg: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Drag handlers ── */
  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // ghost styling
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    // clear highlight on all rows
    document
      .querySelectorAll('tr[data-drag-row]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex.current !== index) {
      // clear previous highlight
      document
        .querySelectorAll('tr[data-drag-row]')
        .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
      dragOverIndex.current = index;
      // highlight current target row
      const row = document.querySelector(`tr[data-drag-row="${index}"]`);
      if (row) row.classList.add('bg-blue-50', 'border-t-2', 'border-blue-400');
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;

    setData((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });

    dragIndex.current = null;
    dragOverIndex.current = null;

    // clear highlight
    document
      .querySelectorAll('tr[data-drag-row]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  /* ── Save order to backend ── */
  const saveOrder = async () => {
    setSaving(true);
    try {
      const orderedIds = data.map((item, idx) => ({
        id: item.id,
        display_order: idx + 1,
      }));
      await axios.post(
        `${API}/hospitals/reorder`,
        { orderedIds },
        { withCredentials: true }
      );
      setToast({ msg: 'Order saved! Frontend will now show hospitals in this order.', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to save order.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/hospitals/${deleteTarget.id}`, { withCredentials: true });
      setToast({ msg: 'Deleted successfully!', type: 'success' });
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      setToast({ msg: 'Delete failed.', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── Edit ── */
  const editFields = [
    { key: 'name', label: 'Hospital Name', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
    { key: 'photo', label: 'Photo URL', type: 'text' },
    { key: 'about', label: 'About', type: 'textarea' },
    { key: 'timing_display', label: 'Timings', type: 'text' },
    { key: 'certifications', label: 'Certifications', type: 'text', isArray: true },
    { key: 'available_specialities', label: 'Specialities', type: 'text', isArray: true },
    { key: 'available_treatments', label: 'Treatments', type: 'text', isArray: true },
    { key: 'available_services', label: 'Services', type: 'text', isArray: true },
    { key: 'total_doctors', label: 'Total Doctors', type: 'number' },
    { key: 'total_specialities', label: 'Total Specialities', type: 'number' },
    { key: 'is_verified', label: 'Is Verified', type: 'checkbox' },
    { key: 'is_active', label: 'Is Active', type: 'checkbox' },
    { key: 'meta_title', label: 'Meta Title', type: 'text' },
    { key: 'meta_description', label: 'Meta Description', type: 'textarea' },
  ];

  const handleEdit = async (payload) => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const res = await axios.put(`${API}/hospitals/${editTarget.id}`, payload, {
        withCredentials: true,
      });
      const updated = res.data?.data || res.data;
      setData((prev) =>
        prev.map((d) => (d.id === editTarget.id ? { ...d, ...updated } : d))
      );
      setToast({ msg: 'Updated successfully!', type: 'success' });
      setEditTarget(null);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Update failed.', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'phone', label: 'Phone' },
    { key: 'is_active', label: 'Status' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Modals */}
      {deleteTarget && (
        <ConfirmModal
          message="Delete this Hospital?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editTarget && (
        <EditDrawer
          title="Hospital"
          item={editTarget}
          fields={editFields}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Hospitals</h2>
          <p className="text-gray-500 text-sm mt-1">{data.length} total records</p>
          {/* Drag hint */}
          <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
            <span>⠿</span> Drag rows to reorder · click <strong>Save Order</strong> to apply
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-100 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          {/* Save Order button */}
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            onClick={() => setPage('add-hospital')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow"
            style={{ background: grad }}
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* drag handle col */}
                  <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase w-10"></th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    data-drag-row={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing"
                  >
                    {/* drag handle */}
                    <td className="py-3 px-3 text-gray-300 select-none text-lg text-center">
                      ⠿
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    {/* Name */}
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt=""
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ background: gradCard }}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.city || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.state || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.phone || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <Badge active={item.is_active} />
                    </td>
                    {/* Actions */}
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/allHospitals/${item.id}`)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditTarget(item)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom save hint */}
      <p className="text-center text-xs text-gray-400 mt-3">
        After reordering, click <strong>Save Order</strong> to persist changes to the database.
      </p>
    </div>
  );
}

/* ─── Treatments List ────────────────────────────────────────────────────────*/
function TreatmentsListPage({ setPage }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/getAll`, { withCredentials: true });
      const result = res.data?.data ?? res.data;
      setData(Array.isArray(result) ? result : []);
    } catch {
      setToast({ msg: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('tr[data-drag-row-tr]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex.current !== index) {
      document.querySelectorAll('tr[data-drag-row-tr]')
        .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
      dragOverIndex.current = index;
      const row = document.querySelector(`tr[data-drag-row-tr="${index}"]`);
      if (row) row.classList.add('bg-blue-50', 'border-t-2', 'border-blue-400');
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    setData((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
    document.querySelectorAll('tr[data-drag-row-tr]')
      .forEach((el) => el.classList.remove('bg-blue-50', 'border-t-2', 'border-blue-400'));
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const orderedIds = data.map((item, idx) => ({
        id: item.id,
        display_order: idx + 1,
      }));
      await axios.post(`${API}/admin/reorder`, { orderedIds }, { withCredentials: true });
      setToast({ msg: 'Order saved! Frontend will now show treatments in this order.', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to save order.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/admin/${deleteTarget.id}`, { withCredentials: true });
      setToast({ msg: 'Deleted successfully!', type: 'success' });
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      setToast({ msg: 'Delete failed.', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const editFields = [
    { key: 'name', label: 'Treatment Name', type: 'text' },
    { key: 'slug', label: 'Slug', type: 'text' },
    { key: 'specialty_id', label: 'Specialty ID', type: 'number' },
    { key: 'treatment_image', label: 'Treatment Image URL', type: 'text' },
    { key: 'png_logo', label: 'PNG Logo URL', type: 'text' },
    { key: 'comes_in', label: 'Category (comes_in)', type: 'text' },
    { key: 'surgery_duration', label: 'Surgery Duration', type: 'text' },
    { key: 'hospital_stay', label: 'Hospital Stay', type: 'text' },
    { key: 'recovery_time', label: 'Recovery Time', type: 'text' },
    { key: 'success_rate', label: 'Success Rate', type: 'text' },
    { key: 'overview_description', label: 'Overview Description', type: 'textarea' },
    { key: 'who_gets_description', label: 'Who Gets Description', type: 'textarea' },
    { key: 'causes_description', label: 'Causes Description', type: 'textarea' },
    { key: 'symptoms_description', label: 'Symptoms Description', type: 'textarea' },
    { key: 'diagnosis_description', label: 'Diagnosis Description', type: 'textarea' },
    { key: 'treatment_procedure_description', label: 'Procedure Description', type: 'textarea' },
    { key: 'cost_description', label: 'Cost Description', type: 'textarea' },
    { key: 'ayushman_covered', label: 'Ayushman Covered', type: 'checkbox' },
    { key: 'ayushman_description', label: 'Ayushman Description', type: 'textarea' },
    { key: 'key_benefits', label: 'Key Benefits', type: 'text', isArray: true },
    { key: 'ideal_candidates', label: 'Ideal Candidates', type: 'text', isArray: true },
    { key: 'not_suitable_for', label: 'Not Suitable For', type: 'text', isArray: true },
    { key: 'pre_operative_steps', label: 'Pre-Operative Steps', type: 'text', isArray: true },
    { key: 'surgical_procedure_steps', label: 'Surgical Steps', type: 'text', isArray: true },
    { key: 'post_operative_steps', label: 'Post-Operative Steps', type: 'text', isArray: true },
    { key: 'cost_factors', label: 'Cost Factors', type: 'text', isArray: true },
    { key: 'ayushman_benefits', label: 'Ayushman Benefits', type: 'text', isArray: true },
    { key: 'ayushman_eligibility', label: 'Ayushman Eligibility', type: 'text', isArray: true },
    { key: 'ayushman_claim_steps', label: 'Ayushman Claim Steps', type: 'text', isArray: true },
  ];

  const handleEdit = async (payload) => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const res = await axios.put(`${API}/admin/${editTarget.id}`, payload, { withCredentials: true });
      const updated = res.data?.data || res.data;
      setData((prev) => prev.map((d) => (d.id === editTarget.id ? { ...d, ...updated } : d)));
      setToast({ msg: 'Updated successfully!', type: 'success' });
      setEditTarget(null);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Update failed.', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'specialty_id', label: 'Specialty ID' },
    { key: 'surgery_duration', label: 'Duration' },
    { key: 'hospital_stay', label: 'Stay' },
    { key: 'recovery_time', label: 'Recovery' },
    { key: 'success_rate', label: 'Success Rate' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmModal
          message="Delete this Treatment?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editTarget && (
        <EditDrawer
          title="Treatment"
          item={editTarget}
          fields={editFields}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Treatments</h2>
          <p className="text-gray-500 text-sm mt-1">{data.length} total records</p>
          <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
            <span>⠿</span> Drag rows to reorder · click <strong>Save Order</strong> to apply
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            onClick={() => setPage('add-treatment')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-sm font-medium shadow"
            style={{ background: grad }}
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase w-10"></th>
                  <th className="text-left py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-left py-4 px-3 sm:px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    data-drag-row-tr={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <td className="py-3 px-3 text-gray-300 select-none text-lg text-center">⠿</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.treatment_image ? (
                          <img src={item.treatment_image} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: '#f97316' }}>
                            <ClipboardList className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.specialty_id ?? '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.surgery_duration || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.hospital_stay || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.recovery_time || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">{item.success_rate || '—'}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/treatments/${item.id}`)} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditTarget(item)} className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        After reordering, click <strong>Save Order</strong> to persist changes to the database.
      </p>
    </div>
  );
}

/* ─── Reviews List ───────────────────────────────────────────────────────────*/
function ReviewsListPage({ setPage }) {
  return (
    <ListPage
      title="All Reviews"
      entityName="Review"
      fetchUrl={`${API}/users/reviews`}
      deleteUrl={`${API}/users/reviews`}
      updateUrl={`${API}/users/reviews`}
      idField="id"
      addKey="add-review"
      setPage={setPage}
      editFields={[
        { key: "name",        label: "Full Name",    type: "text"     },
        { key: "treatment",   label: "Treatment",    type: "text"     },
        { key: "city",        label: "City",         type: "text"     },
        { key: "date",        label: "Date",         type: "text"     },
        { key: "rating",      label: "Rating (1-5)", type: "number"   },
        { key: "description", label: "Description",  type: "textarea" },
      ]}
      columns={[
        { key: "name",        label: "Name"      },
        { key: "treatment",   label: "Treatment" },
        { key: "city",        label: "City"      },
        { key: "rating",      label: "Rating"    },
        { key: "date",        label: "Date"      },
      ]}
      renderRow={(item) => (
        <>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: gradCard }}
              >
                {item.name?.[0]?.toUpperCase() ?? "R"}
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                {item.name}
              </span>
            </div>
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.treatment || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.city || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-yellow-500">
            {"★".repeat(item.rating ?? 0)}{"☆".repeat(5 - (item.rating ?? 0))}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600 whitespace-nowrap">
            {item.date ? new Date(item.date).toLocaleDateString() : "—"}
          </td>
        </>
      )}
    />
  );
}

/* ─── Blogs List ─────────────────────────────────────────────────────────────*/
function BlogsListPage({ setPage }) {
  return (
    <ListPage
      title="All Blogs"
      entityName="Blog"
      fetchUrl={`${API}/blogs?all=true`}
      deleteUrl={`${API}/blogs`}
      updateUrl={`${API}/blogs`}
      idField="id"
      addKey="add-blog"
      setPage={setPage}
      viewUrl={(item) => `/blogs/${item.slug}`}
      editFields={[
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "tag", label: "Tag / Category", type: "text" },
        { key: "author", label: "Author", type: "text" },
        { key: "publish_date", label: "Publish Date", type: "text" },
        { key: "read_time", label: "Read Time", type: "text" },
        { key: "bg_image", label: "Cover Image URL", type: "text" },
        { key: "is_published", label: "Is Published", type: "checkbox" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "tag", label: "Tag" },
        { key: "author", label: "Author" },
        { key: "publish_date", label: "Date" },
        { key: "is_published", label: "Status" },
      ]}
      renderRow={(item) => (
        <>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <div className="flex items-center gap-2 sm:gap-3">
              {item.bg_image ? (
                <img
                  src={item.bg_image}
                  alt=""
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                  B
                </div>
              )}
              <span className="font-semibold text-gray-800 text-sm line-clamp-1">
                {item.title}
              </span>
            </div>
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.tag || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.author || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600 whitespace-nowrap">
            {item.publish_date || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {item.is_published ? "Published" : "Draft"}
            </span>
          </td>
        </>
      )}
    />
  );
}

/* ─── Cities List ─────────────────────────────────────────────────────────────*/
function CitiesListPage({ setPage }) {
  return (
    <ListPage
      title="All Cities"
      entityName="City"
      fetchUrl={`${API}/admin/cities`}
      deleteUrl={`${API}/admin/cities`}
      updateUrl={`${API}/admin/cities`}
      idField="id"
      addKey="add-city"
      setPage={setPage}
      editFields={[
        { key: "name_en", label: "Name (English)", type: "text" },
        { key: "name_hi", label: "Name (Hindi)", type: "text" },
        { key: "slug", label: "Slug", type: "text" },
        { key: "display_order", label: "Display Order", type: "number" },
        { key: "is_active", label: "Is Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name_en", label: "Name (EN)" },
        { key: "name_hi", label: "Name (HI)" },
        { key: "slug", label: "Slug" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Status" },
      ]}
      renderRow={(item) => (
        <>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: "#ef4444" }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                {item.name_en}
              </span>
            </div>
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.name_hi || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-500 font-mono">
            {item.slug || "—"}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5 text-sm text-gray-600">
            {item.display_order || 1}
          </td>
          <td className="py-3 sm:py-4 px-3 sm:px-5">
            <Badge active={item.is_active} />
          </td>
        </>
      )}
    />
  );
}

/* ─── All Registered Accounts List ───────────────────────────────────────────*/
function AccountsListPage({ setPage }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_accounts: 0, total_patients: 0, total_staff: 0, recent_signups: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API}/admin-users/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          search: search.trim() || undefined
        },
        withCredentials: true,
      });
      if (res.data?.success) {
        setData(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed to load user accounts", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAccounts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchAccounts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API}/admin-users/accounts/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setToast({ msg: `Account deleted successfully!`, type: "success" });
      setData(prev => prev.filter(item => item.id !== deleteTarget.id));
      setStats(prev => ({
        ...prev,
        total_accounts: Math.max(0, prev.total_accounts - 1),
        total_patients: deleteTarget.role === 'patient' ? Math.max(0, prev.total_patients - 1) : prev.total_patients,
        total_staff: deleteTarget.role === 'staff' ? Math.max(0, prev.total_staff - 1) : prev.total_staff,
      }));
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed to delete account", type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete the account for "${deleteTarget.name}" (${deleteTarget.email})?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Account Registration Tracking
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Registered Accounts</h2>
          <p className="text-gray-500 text-sm mt-1">
            Real-time record of every patient and healthcare staff member who registered on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 hover:bg-gray-100 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setPage('list-staff')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            style={{ background: grad }}
          >
            <Shield className="w-4 h-4" />
            <span>Manage Staff &amp; Posts →</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Accounts</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total_accounts}</p>
          <p className="text-xs text-blue-600 mt-1">All registered users</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Patients</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{stats.total_patients}</p>
          <p className="text-xs text-gray-400 mt-1">Individuals &amp; families</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Healthcare Staff</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{stats.total_staff}</p>
          <p className="text-xs text-gray-400 mt-1">Staff directory members</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">New (Last 7 Days)</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">{stats.recent_signups}</p>
          <p className="text-xs text-gray-400 mt-1">Recent registrations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          {[
            { key: "all", label: "All Accounts" },
            { key: "patient", label: "👤 Patients" },
            { key: "staff", label: "🩺 Staff Members" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === tab.key
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3 text-blue-500" /> Loading registered accounts...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-semibold text-gray-600">No accounts match the criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Account Role</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Post / Designation</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered At</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const isStaff = item.role === 'staff';
                  const isAdmin = Boolean(item.isadmin);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="py-3 sm:py-4 px-4 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-3 sm:py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                            style={{
                              background: isAdmin
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : isStaff
                                ? 'linear-gradient(135deg, #059669, #10b981)'
                                : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            }}
                          >
                            {item.name ? item.name.slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                              {item.name}
                              {isAdmin && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs font-mono text-gray-700">
                        {item.phone || "—"}
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            🛡️ Administrator
                          </span>
                        ) : isStaff ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🩺 Healthcare Staff
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            👤 Patient
                          </span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        {isStaff ? (
                          item.post && item.post.trim() && item.post !== '-' && item.post !== 'Pending Assignment' ? (
                            <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {item.post}
                            </span>
                          ) : (
                            <span className="font-bold text-gray-500 text-sm">-</span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs">
                        {isStaff ? (
                          item.department && item.department.trim() && item.department !== '-' ? (
                            <span className="text-gray-700 font-medium">{item.department}</span>
                          ) : (
                            <span className="font-bold text-gray-500 text-sm">-</span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : "—"}
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        {isStaff && (!item.status || item.status.toLowerCase() === 'pending') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        ) : (
                          <Badge active={item.status === 'active' || (!isStaff && item.status !== 'inactive')} />
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStaff && (
                            <button
                              onClick={() => setPage('list-staff')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Assign or edit post in staff directory"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit Post</span>
                            </button>
                          )}
                          {!isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Staff Directory & Post Assignment ──────────────────────────────────────*/
function StaffListPage({ setPage }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit form state inside modal
  const [postForm, setPostForm] = useState({
    post: "",
    department: "General",
    status: "active",
    notes: "",
  });

  const postPresets = [
    "Lab Technician",
    "Sample Collector",
    "Duty Doctor",
    "Staff Nurse",
    "Head Nurse",
    "Receptionist / Front Desk",
    "Radiology Technician",
    "Pharmacist",
    "Billing & Insurance Executive",
    "Ward Coordinator",
    "Hospital Administrator"
  ];

  const deptPresets = [
    "Hospital Care",
    "Diagnostic Lab",
    "Emergency / ICU",
    "OPD & Consultation",
    "Radiology",
    "Pharmacy",
    "Administration",
    "General"
  ];

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API}/admin-users/staff`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search.trim() || undefined
        },
        withCredentials: true,
      });
      if (res.data?.success) {
        setData(res.data.data || []);
      }
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed to load staff list", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchStaff]);

  const openEditModal = (staffItem) => {
    setEditTarget(staffItem);
    setPostForm({
      post: (staffItem.post === '-' || staffItem.post === 'Pending Assignment') ? '' : (staffItem.post || ''),
      department: (staffItem.department === '-') ? '' : (staffItem.department || ''),
      status: staffItem.status || 'pending',
      notes: staffItem.notes || '',
    });
  };

  const handleSavePost = async (e) => {
    e?.preventDefault();
    if (!editTarget) return;
    if (!postForm.post.trim()) {
      setToast({ msg: "Please enter or select a Post / Designation", type: "error" });
      return;
    }
    setEditLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(`${API}/admin-users/staff/${editTarget.id}`, {
        post: postForm.post.trim() || '-',
        department: postForm.department.trim() || '-',
        status: postForm.status || 'active',
        notes: postForm.notes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (res.data?.success) {
        setToast({ msg: res.data.message || "Post assigned successfully!", type: "success" });
        setData(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...res.data.data } : s));
        setEditTarget(null);
      }
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed to update staff post", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API}/admin-users/staff/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setToast({ msg: `${deleteTarget.name} removed from staff directory`, type: "success" });
      setData(prev => prev.filter(s => s.id !== deleteTarget.id));
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed to remove staff member", type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const assignedCount = data.filter(s => s.post && s.post !== '-' && s.post !== 'Pending Assignment').length;
  const pendingCount = data.filter(s => !s.post || s.post === '-' || s.post === 'Pending Assignment' || s.status === 'pending').length;
  const hospitalCount = data.filter(s => {
    const d = (s.department || '').toLowerCase();
    const p = (s.post || '').toLowerCase();
    return d.includes('hospital') || d.includes('care') || d.includes('ward') || d.includes('opd') || d.includes('emergency') || p.includes('doctor') || p.includes('nurse');
  }).length;
  const labCount = data.filter(s => {
    const d = (s.department || '').toLowerCase();
    const p = (s.post || '').toLowerCase();
    return d.includes('lab') || d.includes('diagnost') || d.includes('patholog') || p.includes('technician') || p.includes('collector');
  }).length;

  const displayData = data.filter(item => {
    if (deptFilter === 'pending') {
      return !item.post || item.post === '-' || item.post === 'Pending Assignment' || item.status === 'pending';
    }
    if (deptFilter === 'hospital') {
      const d = (item.department || '').toLowerCase();
      const p = (item.post || '').toLowerCase();
      return d.includes('hospital') || d.includes('care') || d.includes('ward') || d.includes('opd') || d.includes('emergency') || p.includes('doctor') || p.includes('nurse');
    }
    if (deptFilter === 'lab') {
      const d = (item.department || '').toLowerCase();
      const p = (item.post || '').toLowerCase();
      return d.includes('lab') || d.includes('diagnost') || d.includes('patholog') || p.includes('technician') || p.includes('collector');
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmModal
          message={`Remove "${deleteTarget.name}" from Staff Directory? Their user account will be reverted to patient.`}
          onConfirm={handleDeleteStaff}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Edit Post Modal / Drawer */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Admin Post Assignment
                </span>
                <h3 className="text-xl font-bold text-gray-800 mt-1">Assign Post / Designation</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set the official hospital/lab role for <strong className="text-gray-700">{editTarget.name}</strong>
                </p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              {/* Member Info Summary */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-xs space-y-1">
                <p className="text-gray-700 font-semibold">{editTarget.name}</p>
                <p className="text-gray-500 font-mono">Email: {editTarget.email} · Phone: {editTarget.phone}</p>
              </div>

              {/* Quick Preset Chips */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Quick Post Presets (Click to choose)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {postPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPostForm(prev => ({ ...prev, post: preset }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        postForm.post === preset
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post / Designation Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Post / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={postForm.post}
                  onChange={(e) => setPostForm(prev => ({ ...prev, post: e.target.value }))}
                  placeholder="e.g. Senior Lab Technician, Head Nurse, Duty Doctor..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Department / Facility
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {deptPresets.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setPostForm(prev => ({ ...prev, department: dept }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        postForm.department === dept
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={postForm.department}
                  onChange={(e) => setPostForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Diagnostic Lab, Hospital Care, Emergency, OPD..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Staff Status
                </label>
                <select
                  value={postForm.status}
                  onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="active">Active (On Duty)</option>
                  <option value="pending">Pending Verification</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive / Suspended</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Admin Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={postForm.notes}
                  onChange={(e) => setPostForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any internal remarks or verification notes..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                  style={{ background: grad }}
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editLoading ? "Saving..." : "Save Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Staff Management &amp; Roles
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Staff Directory &amp; Post Assignment</h2>
          <p className="text-gray-500 text-sm mt-1">
            Central staff management: view and assign posts across Hospital Care, Diagnostic Labs, and Pending requests.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchStaff}
            className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 hover:bg-gray-100 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setPage('list-accounts')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium shadow-xs"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>View All Accounts</span>
          </button>
        </div>
      </div>

      {/* Interactive Category Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <button
          type="button"
          onClick={() => setDeptFilter('all')}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all cursor-pointer ${
            deptFilter === 'all'
              ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
          }`}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Staff Members</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{data.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">All departments →</p>
        </button>

        <button
          type="button"
          onClick={() => setDeptFilter('pending')}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all cursor-pointer ${
            deptFilter === 'pending'
              ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">⚠️ Pending Allocation</p>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Require post/dept →</p>
        </button>

        <button
          type="button"
          onClick={() => setDeptFilter('hospital')}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all cursor-pointer ${
            deptFilter === 'hospital'
              ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
          }`}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🩺 Hospital Care</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{hospitalCount}</p>
          <p className="text-xs text-emerald-700 font-medium mt-1">Doctors, Nurses, Ward →</p>
        </button>

        <button
          type="button"
          onClick={() => setDeptFilter('lab')}
          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all cursor-pointer ${
            deptFilter === 'lab'
              ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
          }`}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🧪 Diagnostic Lab</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">{labCount}</p>
          <p className="text-xs text-indigo-700 font-medium mt-1">Technicians, Collectors →</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          {[
            { key: "all", label: "All Status" },
            { key: "active", label: "Active" },
            { key: "pending", label: "Pending" },
            { key: "on_leave", label: "On Leave" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff, post, department..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3 text-emerald-500" /> Loading staff directory...
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Shield className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-semibold text-gray-600">No staff members found in this category</p>
            <p className="text-xs text-gray-400 mt-1">Try switching categories or clearing search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Post / Designation</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, idx) => {
                  const hasPost = Boolean(item.post && item.post.trim() && item.post !== '-' && item.post !== 'Pending Assignment');
                  const hasDept = Boolean(item.department && item.department.trim() && item.department !== '-');
                  const isPending = !item.status || item.status.toLowerCase() === 'pending';
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="py-3 sm:py-4 px-4 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-3 sm:py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                          >
                            {item.name ? item.name.slice(0, 2).toUpperCase() : "ST"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs font-mono text-gray-700">
                        {item.phone || "—"}
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        {!hasPost ? (
                          <span className="font-bold text-gray-500 text-sm">-</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            🩺 {item.post}
                          </span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs">
                        {!hasDept ? (
                          <span className="font-bold text-gray-500 text-sm">-</span>
                        ) : (
                          <span className="text-gray-700 font-medium">{item.department}</span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'active'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : item.status === 'on_leave'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {item.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                            {item.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : "—"}
                      </td>
                      <td className="py-3 sm:py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                            style={{ background: grad }}
                            title="Assign or edit post"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{isPending ? "Assign Post" : "Edit Post"}</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove from staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────────────*/
function Sidebar({ activePage, setPage, isOpen, onClose }) {
  const router = useRouter();
  const nav = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Dashboard",
      key: "dashboard",
    },
    { divider: true, label: "PATIENT CARE" },
    { icon: <Calendar className="w-5 h-5" />, label: "Appointments", key: "care-appointments" },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Treatment Packages", key: "care-packages" },
    { icon: <Calendar className="w-5 h-5" />, label: "Doctor Availability", key: "care-availability" },
    { icon: <Users className="w-5 h-5" />, label: "Financial Assistance", key: "care-assistance" },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: "Follow-up Support", key: "care-followups" },
    { icon: <Users className="w-5 h-5" />, label: "Hospital Access", key: "care-settings" },
    { divider: true, label: "ADD NEW" },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Add Speciality",
      key: "add-speciality",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Add Doctor",
      key: "add-doctor",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "Add Hospital",
      key: "add-hospital",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Add Treatment",
      key: "add-treatment",
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Add Review",
      key: "add-review",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Add Blog",
      key: "add-blog",
    },
    { icon: <MapPin className="w-5 h-5" />,        label: 'Add City',         key: 'add-city' },
    { divider: true, label: "MANAGE" },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "All Specialities",
      key: "list-specialities",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "All Doctors",
      key: "list-doctors",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "All Hospitals",
      key: "list-hospitals",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "All Treatments",
      key: "list-treatments",
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "All Reviews",
      key: "list-reviews",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "All Blogs",
      key: "list-blogs",
    },
    { icon: <MapPin className="w-5 h-5" />,        label: 'All Cities',       key: 'list-cities' },
  ];

  const handleNav = (key, keepOpen = false) => {
    setPage(key);
    if (!keepOpen) onClose(); // close on mobile after selecting
  };

  return (
    <>
      {/* Sidebar panel — hidden on mobile, always visible on lg+ */}
      <div
        className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-30 flex flex-col overflow-y-auto
        hidden lg:flex
      `}
      >
        <div className="p-6 flex-1">
          {/* Logo + close button on mobile */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: gradCard }}
              >
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h1
                className="text-xl font-bold"
                style={{
                  background: grad,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MUFT MADAD
              </h1>
            </div>
          </div>

          <DashboardNavigation hospitalNav={nav} activePage={activePage} onNavigate={handleNav} />
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={async () => {
              try {
                await axios.post(
                  `${API}/auth/logout`,
                  {},
                  { withCredentials: true },
                );
              } catch {}
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              router.replace("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────────*/
function DashboardPage({ setPage }) {
  const [stats, setStats] = useState({
    specialities: 0,
    doctors: 0,
    hospitals: 0,
    treatments: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sp, d, h, t, r] = await Promise.allSettled([
          axios.get(`${API}/specialities`),
          axios.get(`${API}/doctors`),
          axios.get(`${API}/hospitals`),
          axios.get(`${API}/admin/getAll`),
          axios.get(`${API}/users/reviews`),
        ]);
        const count = (res) =>
          res.status !== "fulfilled"
            ? 0
            : (res.value.data?.data?.length ?? res.value.data?.length ?? 0);
        setStats({
          specialities: count(sp),
          doctors: count(d),
          hospitals: count(h),
          treatments: count(t),
          reviews: count(r),
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const { firstDay, daysInMonth } = (() => {
    const m = currentDate.getMonth(),
      y = currentDate.getFullYear();
    return {
      firstDay: new Date(y, m, 1).getDay(),
      daysInMonth: new Date(y, m + 1, 0).getDate(),
    };
  })();
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const statCards = [
    {
      label: "Total Specialities",
      value: stats.specialities,
      key: "list-specialities",
      primary: true,
    },
    { label: "Total Doctors", value: stats.doctors, key: "list-doctors" },
    { label: "Total Hospitals", value: stats.hospitals, key: "list-hospitals" },
    {
      label: "Total Treatments",
      value: stats.treatments,
      key: "list-treatments",
    },
    { label: "Total Reviews", value: stats.reviews, key: "list-reviews" },
  ];
  const quickActions = [
    {
      label: "Add Speciality",
      key: "add-speciality",
      icon: <Layers className="w-5 h-5" />,
      color: "#6366f1",
    },
    {
      label: "Add Doctor",
      key: "add-doctor",
      icon: <Users className="w-5 h-5" />,
      color: "#2563eb",
    },
    {
      label: "Add Hospital",
      key: "add-hospital",
      icon: <Building2 className="w-5 h-5" />,
      color: "#10b981",
    },
    {
      label: "Add Treatment",
      key: "add-treatment",
      icon: <ClipboardList className="w-5 h-5" />,
      color: "#f97316",
    },
    {
      label: "Add Blog",
      key: "add-blog",
      icon: <FileText className="w-5 h-5" />,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Hospital Dashboard
        </h2>
      </div>

      {/* Stat cards — 2 cols on mobile, 3 on md, 5 on xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((s, i) => (
          <button
            key={i}
            onClick={() => setPage(s.key)}
            className={`rounded-2xl p-4 sm:p-6 shadow-lg text-left transition-transform hover:scale-105 ${s.primary ? "text-white" : "bg-white border border-gray-100"}`}
            style={s.primary ? { background: gradCard } : {}}
          >
            <h3
              className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${s.primary ? "text-blue-100" : "text-gray-600"}`}
            >
              {s.label}
            </h3>
            <p
              className={`text-2xl sm:text-4xl font-bold mb-1 ${s.primary ? "text-white" : "text-gray-800"}`}
            >
              {loading ? "..." : s.value}
            </p>
            <p
              className={`text-xs ${s.primary ? "text-blue-200" : "text-gray-400"}`}
            >
              Click to view all
            </p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.key}
              onClick={() => setPage(action.key)}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                style={{ background: action.color }}
              >
                {action.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview + Calendar — stack on small, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Overview takes 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {statCards.map((s, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{
                    background: [
                      "#6366f1",
                      "#2563eb",
                      "#10b981",
                      "#f97316",
                      "#8b5cf6",
                    ][i],
                  }}
                >
                  {
                    [
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
                      <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
                      <Star className="w-4 h-4 sm:w-5 sm:h-5" />,
                    ][i]
                  }
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {loading ? "..." : s.value}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar takes 1/3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                  ),
                )
              }
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-blue-500" />
            </button>
            <h3 className="font-bold text-gray-800 text-sm">{monthName}</h3>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                  ),
                )
              }
            >
              <ChevronRight className="w-5 h-5 text-gray-600 hover:text-blue-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-xs text-gray-400 text-center font-medium"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all ${
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth()
                    ? "text-white font-bold"
                    : day
                      ? "hover:bg-blue-50 text-gray-700 cursor-pointer"
                      : ""
                }`}
                style={
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth()
                    ? { background: grad }
                    : {}
                }
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hamburger Menu (mobile-only, fully self-contained) ─────────────────────
   Shows a top bar with a hamburger button. Clicking it opens a slide-in drawer
   that contains the full nav list + logout — identical behaviour to the sidebar.
   Visible only below lg breakpoint.
──────────────────────────────────────────────────────────────────────────────*/
function HamburgerMenu({ activePage, setPage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Dashboard",
      key: "dashboard",
    },
    { divider: true, label: "PATIENT CARE" },
    { icon: <Calendar className="w-5 h-5" />, label: "Appointments", key: "care-appointments" },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Treatment Packages", key: "care-packages" },
    { icon: <Calendar className="w-5 h-5" />, label: "Doctor Availability", key: "care-availability" },
    { icon: <Users className="w-5 h-5" />, label: "Financial Assistance", key: "care-assistance" },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: "Follow-up Support", key: "care-followups" },
    { icon: <Users className="w-5 h-5" />, label: "Hospital Access", key: "care-settings" },
    { divider: true, label: "ADD NEW" },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Add Speciality",
      key: "add-speciality",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Add Doctor",
      key: "add-doctor",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "Add Hospital",
      key: "add-hospital",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Add Treatment",
      key: "add-treatment",
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Add Review",
      key: "add-review",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Add Blog",
      key: "add-blog",
    },
    { icon: <MapPin className="w-5 h-5" />,        label: 'Add City',         key: 'add-city' },
    { divider: true, label: "MANAGE" },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "All Specialities",
      key: "list-specialities",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "All Doctors",
      key: "list-doctors",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "All Hospitals",
      key: "list-hospitals",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "All Treatments",
      key: "list-treatments",
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "All Reviews",
      key: "list-reviews",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "All Blogs",
      key: "list-blogs",
    },
    { icon: <MapPin className="w-5 h-5" />,        label: 'All Cities',       key: 'list-cities' },
    { divider: true, label: "ACCOUNTS & STAFF" },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: "All Accounts",
      key: "list-accounts",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Staff & Posts",
      key: "list-staff",
    },
  ];

  const handleNav = (key, keepOpen = false) => {
    setPage(key);
    if (!keepOpen) setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <>
      {/* ── Top bar strip (always visible on mobile, hidden on lg+) ── */}
      <div
        className="fixed left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden"
        style={{ top: "var(--navbar-height, 64px)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: gradCard }}
          >
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-base font-bold"
            style={{
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MUFT MADAD
          </span>
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Slide-in drawer ── */}
      <div
        className={`
        fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-40 flex flex-col
        transition-transform duration-300 ease-in-out lg:hidden
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: gradCard }}
            >
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <h1
              className="text-lg font-bold"
              style={{
                background: grad,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MUFT MADAD
            </h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav items — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <DashboardNavigation hospitalNav={nav} activePage={activePage} onNavigate={handleNav} />
        </div>

        {/* Logout — pinned to bottom */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── App Root ───────────────────────────────────────────────────────────────*/
export default function HospitalDashboard() {
  const [page, setPage] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const session = await axios.get(`${API}/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 5000,
        });
        if (!session.data.user?.isadmin) {
          if (session.data.user?.is_staff || session.data.user?.membership?.laboratory_id || session.data.user?.membership?.collector_id) {
            router.replace("/labs/workspace");
          } else {
            router.replace("/labs");
          }
          return;
        }
        setAuthChecked(true);
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    };
    verifyAuth();
  }, []);

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium">Verifying session...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Existing Navbar (unchanged) */}
      <Navbar />

      {/* Mobile-only: top bar strip with hamburger + slide-in drawer (full nav + logout) */}
      <HamburgerMenu activePage={page} setPage={setPage} />

      {/* Desktop sidebar — always visible on lg+, not rendered on mobile */}
      <Sidebar
        activePage={page}
        setPage={setPage}
        isOpen={false}
        onClose={() => {}}
      />

      {/* Main content:
          • Mobile  → full width, pt-28 to clear Navbar + hamburger bar
          • Desktop → ml-64 for sidebar, pt-20 for just the Navbar
      */}
      <div className="lg:ml-64 pt-28 lg:pt-20">
        {page === "dashboard" && <HospitalCareAdmin />}
        {page.startsWith("lab-") && <LabDashboard key={page} tab={page.slice(4)} />}
        {page.startsWith("care-") && <HospitalCareAdmin key={page} initialTab={page.slice(5)} />}
        {page === "add-speciality" && <AddSpecialityForm />}
        {page === "add-doctor" && <AdminDoctorForm />}
        {page === "add-hospital" && <AdminHospitalForm />}
        {page === "add-treatment" && <TreatmentAdminForm />}
        {page === "add-review" && <ReviewForm />}
        {page === "add-blog" && <BlogBuilder />}
        {page === "list-specialities" && (
          <SpecialitiesListPage setPage={setPage} />
        )}
        {page === "list-doctors" && <DoctorsListPage setPage={setPage} />}
        {page === "list-hospitals" && <HospitalsListPage setPage={setPage} />}
        {page === "list-treatments" && <TreatmentsListPage setPage={setPage} />}
        {page === "list-reviews" && <ReviewsListPage setPage={setPage} />}
        {page === "list-blogs" && <BlogsListPage setPage={setPage} />}
        {page === "add-city" && <AddCityForm />}
        {page === "list-cities" && <CitiesListPage setPage={setPage} />}
        {page === "list-accounts" && <AccountsListPage setPage={setPage} />}
        {page === "list-staff" && <StaffListPage setPage={setPage} />}
        {page === "recycle-bin" && <RecycleBinAdmin />}
      </div>
    </div>
  );
}

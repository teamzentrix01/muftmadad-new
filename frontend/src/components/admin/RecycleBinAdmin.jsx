'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building2,
  Stethoscope,
  Activity,
  Star,
  Layers,
  MapPin,
  FileText,
  Users,
  Shield,
  Eye,
  Mail,
  Phone,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  AlertTriangle,
  X
} from 'lucide-react';

const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

const TYPE_CONFIG = {
  hospital: { label: 'Hospital', icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  doctor: { label: 'Doctor', icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  treatment: { label: 'Treatment', icon: Activity, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  review: { label: 'Review', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  speciality: { label: 'Speciality', icon: Layers, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  city: { label: 'City', icon: MapPin, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  blog: { label: 'Blog', icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  account: { label: 'User Account', icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  staff: { label: 'Staff Member', icon: Shield, color: 'text-orange-600 bg-orange-50 border-orange-200' }
};

export default function RecycleBinAdmin() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ inBin: 0, restored: 0, byType: [] });
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('in_bin');
  const [notice, setNotice] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showEmptyBinModal, setShowEmptyBinModal] = useState(false);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        status: statusFilter,
        type: selectedType,
        ...(search.trim() ? { search: search.trim() } : {}),
        limit: '100'
      });

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API}/recycle-bin/items?${queryParams}`, {
          headers: getHeaders(),
          credentials: 'include'
        }),
        fetch(`${API}/recycle-bin/stats`, {
          headers: getHeaders(),
          credentials: 'include'
        })
      ]);

      if (itemsRes.ok) {
        const itemsJson = await itemsRes.json();
        setItems(itemsJson.items || []);
      }
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        setStats(statsJson.stats || { inBin: 0, restored: 0, byType: [] });
      }
    } catch (err) {
      console.error('Failed to load recycle bin data:', err);
      setNotice({ type: 'error', text: 'Failed to load recycle bin data. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Restore action
  const handleRestore = async (item) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/recycle-bin/restore/${item.id}`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to restore item');

      setNotice({
        type: 'success',
        text: data.message || `Successfully restored "${item.entity_name}".`
      });
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to restore item. Please try again.' });
    } finally {
      setActionBusy(false);
    }
  };

  // Permanent Delete (Purge)
  const handlePurge = async (item) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/recycle-bin/${item.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to purge item');

      setNotice({
        type: 'success',
        text: data.message || `"${item.entity_name}" has been permanently deleted.`
      });
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to permanently delete item.' });
    } finally {
      setActionBusy(false);
    }
  };

  // Empty Bin
  const handleEmptyBin = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const res = await fetch(`${API}/recycle-bin/empty`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to empty bin');

      setNotice({
        type: 'success',
        text: data.message || 'Recycle bin has been emptied successfully.'
      });
      setShowEmptyBinModal(false);
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to empty recycle bin.' });
    } finally {
      setActionBusy(false);
    }
  };

  const typeCounts = useMemo(() => {
    const map = {};
    (stats.byType || []).forEach(({ entity_type, count }) => {
      map[entity_type] = parseInt(count, 10);
    });
    return map;
  }, [stats.byType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {notice.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Recycle Bin</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Audit history and restore controls for deleted records across all dashboards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading || actionBusy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {stats.inBin > 0 && statusFilter === 'in_bin' && (
            <button
              onClick={() => setShowEmptyBinModal(true)}
              disabled={actionBusy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Empty Bin</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Recycle Bin</div>
            <div className="text-2xl font-bold text-slate-800">{stats.inBin || 0}</div>
            <div className="text-xs text-rose-600 font-medium">Archived items ready to restore</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Restored Records</div>
            <div className="text-2xl font-bold text-slate-800">{stats.restored || 0}</div>
            <div className="text-xs text-emerald-600 font-medium">Successfully brought back</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Audit Protection</div>
            <div className="text-sm font-bold text-slate-800">100% Deleter Logged</div>
            <div className="text-xs text-slate-500">Name, Email & Phone captured</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setStatusFilter('in_bin')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                statusFilter === 'in_bin'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active In Bin ({stats.inBin || 0})
            </button>
            <button
              onClick={() => setStatusFilter('restored')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                statusFilter === 'restored'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Restored History ({stats.restored || 0})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, deleter email, phone, dashboard..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Dashboards ({statusFilter === 'in_bin' ? stats.inBin : items.length})
          </button>

          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const count = typeCounts[key] || 0;
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedType === key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cfg.label}</span>
                {statusFilter === 'in_bin' && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedType === key ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading recycle bin items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Recycle Bin is Empty</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {search
                ? `No deleted records matching "${search}".`
                : 'No deleted items found. All dashboard records are active and safe.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const cfg = TYPE_CONFIG[item.entity_type] || {
                label: item.entity_type,
                icon: AlertCircle,
                color: 'text-slate-600 bg-slate-50 border-slate-200'
              };
              const Icon = cfg.icon;
              const isRestored = item.status === 'restored';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isRestored ? 'bg-slate-50/60 opacity-80' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Left: Entity Name & Metadata */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl border ${cfg.color} shrink-0 mt-0.5`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {item.entity_name || 'Unnamed Item'}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          From: {item.source_dashboard || 'Dashboard'}
                        </span>
                        {isRestored && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Restored
                          </span>
                        )}
                      </div>

                      {/* Deleter Audit Info Row */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-rose-50/80 px-2.5 py-1 rounded-md border border-rose-100">
                          <User className="h-3.5 w-3.5 text-rose-500" />
                          <span>Deleted by: {item.deleted_by_name || 'Administrator'}</span>
                        </div>

                        {item.deleted_by_email && (
                          <a
                            href={`mailto:${item.deleted_by_email}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.deleted_by_email}</span>
                          </a>
                        )}

                        {item.deleted_by_phone && (
                          <a
                            href={`tel:${item.deleted_by_phone}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.deleted_by_phone}</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Deleted: {formatDate(item.deleted_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => setInspectItem(item)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </button>

                    {!isRestored ? (
                      <>
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={actionBusy}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-95 rounded-lg shadow-xs transition-all disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore Record</span>
                        </button>

                        <button
                          onClick={() => setConfirmDelete(item)}
                          disabled={actionBusy}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                        Restored at {formatDate(item.restored_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{inspectItem.entity_name}</h3>
                  <p className="text-xs text-slate-500">
                    Type: <span className="font-semibold text-slate-700">{inspectItem.entity_type}</span> | Source: {inspectItem.source_dashboard}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audit banner */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Deleter Audit Trail</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block">Deleted By:</span>
                  <span className="font-semibold text-slate-800">{inspectItem.deleted_by_name || 'Administrator'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-semibold text-slate-800">{inspectItem.deleted_by_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-semibold text-slate-800">{inspectItem.deleted_by_phone || 'N/A'}</span>
                </div>
              </div>
              <div className="text-slate-400 pt-1">
                Timestamp: <span className="text-slate-700 font-medium">{formatDate(inspectItem.deleted_at)}</span>
              </div>
            </div>

            {/* Original Snapshot JSON */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Record Snapshot:</div>
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72">
                {JSON.stringify(inspectItem.original_data, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {inspectItem.status === 'in_bin' && (
                <button
                  onClick={() => {
                    handleRestore(inspectItem);
                    setInspectItem(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl shadow-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Permanent Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Permanent Delete?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{confirmDelete.entity_name}"</strong>? This item cannot be recovered once purged.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurge(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Bin Modal */}
      {showEmptyBinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Empty Entire Recycle Bin?</h3>
              <p className="text-sm text-slate-500 mt-1">
                All <strong>{stats.inBin} records</strong> in the recycle bin will be permanently deleted and cannot be restored.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEmptyBinModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyBin}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-sm"
              >
                Empty Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

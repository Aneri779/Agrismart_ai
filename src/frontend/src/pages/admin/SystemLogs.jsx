import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Trash2, Download, Filter, RefreshCw, Plus, X } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'agrismart_system_logs';

const LOG_TYPES = ['All', 'Authentication', 'Crop Analysis', 'System Error', 'Data Sync', 'User Action', 'API Call'];

const STATUS_STYLES = {
  Success: 'bg-green-100 text-green-700',
  Failed:  'bg-red-100 text-red-600',
  Warning: 'bg-amber-100 text-amber-700',
  Info:    'bg-blue-100 text-blue-700',
};

const defaultLogs = [];

const AddLogModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ user: '', action: '', type: 'System Error', status: 'Info', details: '' });
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.user.trim() || !form.action.trim()) return;
    onSave({
      ...form,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });
    setForm({ user: '', action: '', type: 'System Error', status: 'Info', details: '' });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="absolute inset-0 bg-[#004D3C]/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <h2 className="text-xl font-bold text-[#004D3C] mb-6">Add Log Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">User</label>
              <input value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                placeholder="e.g. admin@agri.ai" required
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Action</label>
              <input value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                placeholder="e.g. Login" required
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]">
                {LOG_TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]">
                {['Success', 'Failed', 'Warning', 'Info'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Details</label>
            <input value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              placeholder="Additional log details..."
              className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#45665A] bg-[#F5FAF1] border border-[#EAF8E9] hover:bg-[#EAF8E9]">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F] shadow">
              Add Log
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const SystemLogs = () => {
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultLogs; }
    catch { return defaultLogs; }
  });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const filtered = logs.filter(log => {
    const matchSearch = !search || 
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || log.type === filterType;
    const matchStatus = filterStatus === 'All' || log.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const addLog = (log) => setLogs(prev => [log, ...prev]);
  const clearAll = () => { setLogs([]); localStorage.removeItem(STORAGE_KEY); };

  const formatTime = (iso) => new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const exportCsv = () => {
    const csv = ['Timestamp,User,Action,Type,Status,Details',
      ...filtered.map(l => `"${formatTime(l.timestamp)}","${l.user}","${l.action}","${l.type}","${l.status}","${l.details}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'system_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 w-72 shadow-sm focus-within:border-[#008F5A]">
            <Search className="w-4 h-4 text-[#008F5A] mr-2 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..." className="bg-transparent outline-none text-[13px] text-[#004D3C] w-full" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            {LOG_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            {['All', 'Success', 'Failed', 'Warning', 'Info'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#EAF8E9] bg-white text-[13px] font-semibold text-[#45665A] hover:bg-[#EAF8E9] disabled:opacity-50 shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          {logs.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-red-200 bg-white text-[13px] font-semibold text-red-500 hover:bg-red-50 shadow-sm">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#008F5A] text-white text-[13px] font-bold shadow-md hover:bg-[#006B4F]">
            <Plus className="w-3.5 h-3.5" /> Add Log
          </button>
        </div>
      </div>

      <AdminCard>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#EAF8E9] rounded-full flex items-center justify-center mb-4">
              <ScrollText className="w-8 h-8 text-[#008F5A]" />
            </div>
            <p className="text-[#004D3C] font-bold text-lg mb-1">No system logs available</p>
            <p className="text-[#45665A] text-sm max-w-sm mb-4">
              {search || filterType !== 'All' || filterStatus !== 'All'
                ? 'No logs match your current filters.'
                : 'System logs will appear here once backend services start emitting telemetry data.'}
            </p>
            <button onClick={() => setModalOpen(true)}
              className="px-5 py-2 bg-[#008F5A] text-white text-sm font-bold rounded-xl hover:bg-[#006B4F]">
              Add First Log
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAF8E9] text-[11px] uppercase tracking-wider text-[#45665A]">
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Details</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((log) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-[#F7FBF5] hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 text-[11px] text-[#789187] font-mono whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 text-[13px] font-semibold text-[#004D3C]">{log.user}</td>
                      <td className="py-3.5 px-4 text-[13px] text-[#183F34]">{log.action}</td>
                      <td className="py-3.5 px-4 text-[12px] text-[#45665A]">{log.type}</td>
                      <td className="py-3.5 px-4 text-[12px] text-[#789187] max-w-[200px] truncate">{log.details}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[log.status] || STATUS_STYLES.Info}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => setLogs(prev => prev.filter(l => l.id !== log.id))}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            <div className="mt-4 px-4 py-2 text-[12px] text-[#789187]">
              Showing {filtered.length} of {logs.length} log entries
            </div>
          </div>
        )}
      </AdminCard>

      <AddLogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={addLog} />
    </div>
  );
};

export default SystemLogs;

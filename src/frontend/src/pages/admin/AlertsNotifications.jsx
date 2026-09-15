import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CloudRain, Droplet, Monitor, User, CheckCircle2, Trash2, Plus, X } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'agrismart_alerts';

const CATEGORIES = [
  { id: 'all', label: 'All Alerts', icon: Bell },
  { id: 'disease', label: 'Disease', icon: AlertTriangle },
  { id: 'weather', label: 'Weather', icon: CloudRain },
  { id: 'irrigation', label: 'Irrigation', icon: Droplet },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'user', label: 'User', icon: User },
];

const SEVERITY_STYLES = {
  high:   { pill: 'bg-red-100 text-red-600',    dot: 'bg-red-500'   },
  medium: { pill: 'bg-amber-100 text-amber-600', dot: 'bg-amber-400' },
  low:    { pill: 'bg-green-100 text-green-600', dot: 'bg-green-500' },
};

const CAT_COLORS = {
  disease:    { bg: 'bg-red-100',    icon: 'text-red-500',    Icon: AlertTriangle },
  weather:    { bg: 'bg-blue-100',   icon: 'text-blue-500',   Icon: CloudRain     },
  irrigation: { bg: 'bg-cyan-100',   icon: 'text-cyan-600',   Icon: Droplet       },
  system:     { bg: 'bg-purple-100', icon: 'text-purple-600', Icon: Monitor       },
  user:       { bg: 'bg-orange-100', icon: 'text-orange-500', Icon: User          },
};

const defaultAlerts = [];

const AddAlertModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', message: '', category: 'system', severity: 'medium' });
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    onSave({
      ...form,
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
    });
    setForm({ title: '', message: '', category: 'system', severity: 'medium' });
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
        <h2 className="text-xl font-bold text-[#004D3C] mb-6">Add New Alert</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Alert Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Early Blight detected in Farm #3"
              required className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A] focus:ring-2 focus:ring-[#EAF8E9]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3} required placeholder="Describe the alert details..."
              className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A] focus:ring-2 focus:ring-[#EAF8E9] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]">
                <option value="disease">Disease</option>
                <option value="weather">Weather</option>
                <option value="irrigation">Irrigation</option>
                <option value="system">System</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Severity</label>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#45665A] bg-[#F5FAF1] border border-[#EAF8E9] hover:bg-[#EAF8E9]">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F] shadow">
              Add Alert
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const AlertsNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultAlerts; }
    catch { return defaultAlerts; }
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const filtered = activeTab === 'all' ? alerts : alerts.filter(a => a.category === activeTab);
  const unreadCount = alerts.filter(a => !a.read).length;

  const markRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  const deleteAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const addAlert = (alert) => setAlerts(prev => [alert, ...prev]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? 'bg-[#008F5A] text-white shadow-md'
                  : 'bg-white text-[#45665A] border border-[#EAF8E9] hover:bg-[#EAF8E9]'
              }`}>
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-4 py-2 text-[13px] font-semibold text-[#008F5A] border border-[#008F5A] rounded-full hover:bg-[#EAF8E9] transition-colors flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
          <button onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#008F5A] hover:bg-[#006B4F] text-white text-[13px] font-bold rounded-full shadow-md flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Alert
          </button>
        </div>
      </div>

      <AdminCard>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#EAF8E9] rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#008F5A]" />
            </div>
            <p className="text-[#004D3C] font-bold text-lg mb-1">No alerts found</p>
            <p className="text-[#45665A] text-sm max-w-sm">
              {activeTab === 'all'
                ? 'Your platform is running smoothly. Alerts will appear here when triggered.'
                : `No ${activeTab} alerts available.`}
            </p>
            <button onClick={() => setModalOpen(true)}
              className="mt-4 px-5 py-2 bg-[#008F5A] text-white text-sm font-bold rounded-xl hover:bg-[#006B4F]">
              Add First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(alert => {
              const catStyle = CAT_COLORS[alert.category] || CAT_COLORS.system;
              const sevStyle = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;
              const CatIcon = catStyle.Icon;
              return (
                <AnimatePresence key={alert.id}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      alert.read ? 'bg-white border-[#F0F7F0]' : 'bg-[#FAFCF8] border-[#D5EFD5] shadow-sm'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${catStyle.bg}`}>
                      <CatIcon className={`w-5 h-5 ${catStyle.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-[14px] ${alert.read ? 'text-[#45665A]' : 'text-[#004D3C]'}`}>
                            {alert.title}
                          </p>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-[#008F5A] flex-shrink-0" />
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${sevStyle.pill}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#789187] whitespace-nowrap flex-shrink-0">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#45665A] mt-1 leading-relaxed">{alert.message}</p>
                      <div className="flex gap-3 mt-2">
                        {!alert.read && (
                          <button onClick={() => markRead(alert.id)}
                            className="text-[11px] text-[#008F5A] font-semibold hover:underline flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mark Read
                          </button>
                        )}
                        <button onClick={() => deleteAlert(alert.id)}
                          className="text-[11px] text-red-500 font-semibold hover:underline flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </div>
        )}
      </AdminCard>

      <AddAlertModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={addAlert} />
    </div>
  );
};

export default AlertsNotifications;

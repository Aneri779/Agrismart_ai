import React, { useState, useEffect, useCallback } from 'react';
import {
  Droplet, CheckCircle2, Calendar, Plus, X, ChevronDown, ChevronUp,
  BarChart2, Loader2, AlertTriangle, Thermometer, CloudRain, Info
} from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

const STATUS_STYLES = {
  Scheduled: 'bg-blue-100 text-blue-600',
  Active:    'bg-green-100 text-green-600',
  Pending:   'bg-amber-100 text-amber-600',
  Completed: 'bg-gray-100 text-gray-500',
};

// ─── Recommendation Banner ───────────────────────────────────────────────────
const RecommendationBanner = () => {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    apiClient.get('/farmer/irrigation/recommendation', { params: { soil_moisture: 'medium' } })
      .then(data => { setRec(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-[#F5FAF1] border border-[#D5EFD5] animate-pulse">
        <Loader2 className="w-5 h-5 text-[#008F5A] animate-spin" />
        <span className="text-sm text-[#45665A]">Loading live weather recommendation…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <span className="text-sm text-amber-700">Live weather data unavailable — recommendation requires a live reading.</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#E8F6E6] to-[#F5FAF1] border border-[#D5EFD5] shadow-sm space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#DDF3E2] flex items-center justify-center flex-shrink-0">
          <Droplet className="w-6 h-6 text-[#008F5A]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-[#004D3C]">{rec.title}</p>
            <span className="px-2.5 py-0.5 rounded-full bg-[#008F5A]/10 text-[#008F5A] text-[10px] font-bold border border-[#008F5A]/20">
              Rule-based recommendation
            </span>
          </div>
          <p className="text-[13px] text-[#45665A] leading-relaxed">{rec.reason}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-[11px] font-semibold text-[#45665A]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-500" />{rec.context.temperature}°C
            </span>
            <span className="flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-blue-500" />Rain {rec.context.rainProbability}%
            </span>
            {rec.durationHours > 0 && (
              <span className="flex items-center gap-1">
                <Droplet className="w-3 h-3 text-[#008F5A]" />{rec.waterAmountLiters.toLocaleString()} L · {rec.durationHours} hrs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible "How this works" panel */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#45665A] hover:text-[#004D3C] transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        How this recommendation works
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/70 rounded-xl p-4 text-[12px] text-[#45665A] space-y-1.5 border border-[#D5EFD5]">
              <p className="font-bold text-[#004D3C] mb-2">Four decision thresholds (applied in order):</p>
              <p>① <strong>Rain probability ≥ 60%</strong> → <em>Delay irrigation</em> — let the forecast rain do the work.</p>
              <p>② <strong>Soil moisture = High AND rain &lt; 60%</strong> → <em>No irrigation needed</em> — soil is adequately saturated.</p>
              <p>③ <strong>Soil moisture = Low OR temperature ≥ 35°C</strong> → <em>Increase irrigation</em> (3.5 hrs / 15,000 L) — water stress risk.</p>
              <p>④ <strong>Otherwise</strong> → <em>Moderate irrigation</em> (2 hrs / 10,000 L) — standard maintenance watering.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Completion Modal ────────────────────────────────────────────────────────
const CompleteModal = ({ isOpen, onClose, onConfirm }) => {
  const [actualLiters, setActualLiters] = useState('');
  const [durationHours, setDurationHours] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(Number(actualLiters), Number(durationHours));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        className="absolute inset-0 bg-[#004D3C]/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-[#004D3C] mb-1">Mark as Completed</h2>
        <p className="text-xs text-[#45665A] mb-5">Enter actual usage to record real resource data.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Actual Liters Used</label>
            <input type="number" value={actualLiters} onChange={e => setActualLiters(e.target.value)} required
              placeholder="e.g. 12000"
              className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Duration (hours)</label>
            <input type="number" step="0.5" value={durationHours} onChange={e => setDurationHours(e.target.value)} required
              placeholder="e.g. 2.5"
              className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#45665A] bg-[#F5FAF1] border border-[#EAF8E9]">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F] shadow">
              Confirm Completed
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Add Schedule Modal ──────────────────────────────────────────────────────
const AddScheduleModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ farm: '', date: '', water: '', crop: '', status: 'Scheduled' });
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.farm.trim() || !form.date) return;
    onSave(form);
    setForm({ farm: '', date: '', water: '', crop: '', status: 'Scheduled' });
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
        <h2 className="text-xl font-bold text-[#004D3C] mb-6">Add Irrigation Schedule</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Farm / Field</label>
              <input value={form.farm} onChange={e => setForm(f => ({ ...f, farm: e.target.value }))}
                placeholder="e.g. Farm #1" required
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Crop</label>
              <input value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                placeholder="e.g. Tomato"
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Recommended Water (L)</label>
              <input type="number" value={form.water} onChange={e => setForm(f => ({ ...f, water: e.target.value }))}
                placeholder="e.g. 12000"
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#183F34] mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008F5A]">
                {['Scheduled', 'Active', 'Pending', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#45665A] bg-[#F5FAF1] border border-[#EAF8E9]">Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F] shadow">Add Schedule</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Water Usage Summary Card ────────────────────────────────────────────────
const UsageSummaryCard = ({ refreshKey }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/admin/irrigation/usage-summary', { params: { days: 30 } })
      .then(data => { setSummary(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#D5EFD5] shadow-sm animate-pulse">
        <div className="h-4 bg-[#EAF8E9] rounded w-1/3 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#F5FAF1] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const isEmpty = summary.cyclesCompleted === 0;

  return (
    <AdminCard>
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-5 h-5 text-[#008F5A]" />
        <h3 className="text-[15px] font-bold text-[#004D3C]">Water Resource Usage (Last 30 Days)</h3>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 bg-[#EAF8E9] rounded-full flex items-center justify-center mb-3">
            <Droplet className="w-7 h-7 text-[#008F5A]" />
          </div>
          <p className="text-[#004D3C] font-bold mb-1">No completed irrigation cycles yet</p>
          <p className="text-[#45665A] text-sm max-w-sm">
            Water usage will appear here once schedule entries are marked Completed with actual liters recorded.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Water Used (30d)', value: `${summary.totalLitersUsed.toLocaleString()} L` },
              { label: 'Irrigation Cycles Completed', value: summary.cyclesCompleted },
              { label: 'Total Hours Run', value: `${summary.totalHoursRun} hrs` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F5FAF1] border border-[#EAF8E9] rounded-2xl p-4">
                <div className="text-[11px] font-semibold text-[#45665A] uppercase mb-1">{label}</div>
                <div className="text-xl font-bold text-[#004D3C] font-sora">{value}</div>
              </div>
            ))}
          </div>

          {/* Variance badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#45665A]">vs AI Recommendation:</span>
            {summary.variancePercent === null ? (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">No recommendation baseline yet</span>
            ) : summary.variancePercent <= 0 ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                {Math.abs(summary.variancePercent)}% below AI-recommended usage
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">
                {summary.variancePercent}% above AI-recommended usage
              </span>
            )}
          </div>

          {/* Daily bar chart (simple inline bars) */}
          {summary.dailySeries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#45665A] uppercase mb-3">Daily Water Usage</h4>
              <div className="flex items-end gap-1.5 h-20">
                {(() => {
                  const max = Math.max(...summary.dailySeries.map(d => d.liters), 1);
                  return summary.dailySeries.map(d => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.liters.toLocaleString()} L`}>
                      <div
                        className="w-full bg-[#008F5A] rounded-t-sm transition-all"
                        style={{ height: `${(d.liters / max) * 64}px` }}
                      />
                      <span className="text-[9px] text-[#789187]">{d.date.slice(5)}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Per-crop breakdown */}
          {summary.byCrop.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#45665A] uppercase mb-3">By Crop</h4>
              <div className="space-y-2">
                {summary.byCrop.map(({ crop, liters }) => (
                  <div key={crop} className="flex items-center justify-between text-sm">
                    <span className="text-[#183F34] font-medium">{crop}</span>
                    <span className="font-bold text-[#004D3C]">{liters.toLocaleString()} L</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminCard>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const IrrigationSystem = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState(null); // { id }
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);

  const fetchSchedule = useCallback(() => {
    setLoading(true);
    apiClient.get('/admin/irrigation')
      .then(data => { setSchedule(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const addSchedule = async (form) => {
    try {
      const newRow = await apiClient.post('/admin/irrigation', {
        farm: form.farm,
        crop: form.crop,
        date: form.date,
        recommendedLiters: Number(form.water) || 0,
        status: form.status,
      });
      setSchedule(prev => [newRow, ...prev]);
      setModalOpen(false);
    } catch (e) {
      console.error('Failed to add schedule', e);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'Completed') {
      setCompleteModal({ id });
      return;
    }
    try {
      const updated = await apiClient.patch(`/admin/irrigation/${id}`, { status: newStatus });
      setSchedule(prev => prev.map(s => s.id === id ? updated : s));
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleCompleteConfirm = async (actualLiters, durationHours) => {
    const { id } = completeModal;
    setCompleteModal(null);
    try {
      const updated = await apiClient.patch(`/admin/irrigation/${id}`, {
        status: 'Completed',
        actualLiters,
        durationHours,
      });
      setSchedule(prev => prev.map(s => s.id === id ? updated : s));
      setUsageRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Failed to complete entry', e);
    }
  };

  const deleteItem = async (id) => {
    try {
      await apiClient.delete(`/admin/irrigation/${id}`);
      setSchedule(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Failed to delete entry', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Recommendation Banner */}
      <RecommendationBanner />

      {/* Schedule Table */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#004D3C]">Irrigation Schedule</h3>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#008F5A] hover:bg-[#006B4F] text-white text-[13px] font-bold rounded-full shadow-md">
          <Plus className="w-3.5 h-3.5" /> Add Schedule
        </button>
      </div>

      <AdminCard>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[#45665A]">
            <Loader2 className="w-5 h-5 animate-spin text-[#008F5A]" />
            <span className="text-sm">Loading schedule…</span>
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#EAF8E9] rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#008F5A]" />
            </div>
            <p className="text-[#004D3C] font-bold text-lg mb-1">No irrigation schedules</p>
            <p className="text-[#45665A] text-sm max-w-sm mb-4">Create your first irrigation schedule to start tracking real water usage.</p>
            <button onClick={() => setModalOpen(true)}
              className="px-5 py-2 bg-[#008F5A] text-white text-sm font-bold rounded-xl hover:bg-[#006B4F]">
              Add First Schedule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAF8E9] text-[11px] uppercase tracking-wider text-[#45665A]">
                  <th className="py-3.5 px-4 font-semibold">Farm / Field</th>
                  <th className="py-3.5 px-4 font-semibold">Crop</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Recommended (L)</th>
                  <th className="py-3.5 px-4 font-semibold">Actual (L)</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {schedule.map(item => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-[#F7FBF5] hover:bg-[#FAFCF8] transition-colors">
                      <td className="py-3.5 px-4 text-[14px] font-bold text-[#004D3C]">{item.farm}</td>
                      <td className="py-3.5 px-4 text-[13px] text-[#45665A]">{item.crop || '—'}</td>
                      <td className="py-3.5 px-4 text-[13px] text-[#45665A]">{item.scheduledDate || '—'}</td>
                      <td className="py-3.5 px-4 text-[13px] font-semibold text-[#004D3C]">
                        {item.recommendedLiters ? Number(item.recommendedLiters).toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[13px] font-semibold text-[#087A4B]">
                        {item.status === 'Completed' && item.actualLiters
                          ? Number(item.actualLiters).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[item.status] || STATUS_STYLES.Scheduled}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <select value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value)}
                          className="text-[11px] border border-[#EAF8E9] rounded-lg px-2 py-1 outline-none focus:border-[#008F5A]">
                          {['Scheduled', 'Active', 'Pending', 'Completed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => deleteItem(item.id)}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Water Resource Usage Summary */}
      <UsageSummaryCard refreshKey={usageRefreshKey} />

      <AddScheduleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={addSchedule} />
      <CompleteModal
        isOpen={!!completeModal}
        onClose={() => setCompleteModal(null)}
        onConfirm={handleCompleteConfirm}
      />
    </div>
  );
};

export default IrrigationSystem;


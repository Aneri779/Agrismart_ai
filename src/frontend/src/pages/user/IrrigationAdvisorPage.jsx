import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { CROPS_DATA } from '../../services/smartAgronomyEngine';
import {
  Droplet, Calendar, Info, CloudRain, CheckCircle2, Clock,
  AlertTriangle, RefreshCw, Plus, Zap, CheckSquare, Loader2,
  Thermometer, Wind
} from 'lucide-react';
import { historyApi } from '../../api/history.api';
import apiClient from '../../api/client';

export const IrrigationAdvisorPage = () => {
  // ── Farmer inputs ──────────────────────────────────────────────────────────
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Cotton');
  const [growthStage, setGrowthStage] = useState('Flowering');
  const [soilType, setSoilType] = useState('Loamy');
  const [soilMoisture, setSoilMoisture] = useState('medium'); // low | medium | high

  // ── Auto-fill from latest scan ─────────────────────────────────────────────
  useEffect(() => {
    historyApi.getScans()
      .then(scans => {
        if (scans && scans.length > 0) {
          const lastCrop = scans[0].crop;
          if (CROPS_DATA[lastCrop]) {
             setSelectedCrop(lastCrop);
             setGrowthStage(CROPS_DATA[lastCrop].stages[0] || 'Vegetative');
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Remote state ───────────────────────────────────────────────────────────
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(true);

  const [completedLog, setCompletedLog] = useState([]);
  const [logLoading, setLogLoading] = useState(true);

  const [usageSummary, setUsageSummary] = useState(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [irrigateLoading, setIrrigateLoading] = useState(false);
  const [irrigateSuccess, setIrrigateSuccess] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // ── Fetch live weather on mount ────────────────────────────────────────────
  useEffect(() => {
    setWeatherLoading(true);
    apiClient.get('/farmer/weather')
      .then(data => { setWeather(data); setWeatherLoading(false); })
      .catch(() => { setWeatherError(true); setWeatherLoading(false); });
  }, []);

  // ── Fetch recommendation whenever soilMoisture or selectedCrop changes ────
  useEffect(() => {
    setRecLoading(true);
    apiClient.get('/farmer/irrigation/recommendation', { params: { soil_moisture: soilMoisture, crop: selectedCrop } })
      .then(data => { setRecommendation(data); setRecLoading(false); })
      .catch(() => setRecLoading(false));
  }, [soilMoisture, selectedCrop]);

  // ── Fetch completed log ────────────────────────────────────────────────────
  const fetchLog = useCallback(() => {
    setLogLoading(true);
    apiClient.get('/admin/irrigation')
      .then(data => {
        setCompletedLog(data.filter(r => r.status === 'Completed'));
        setLogLoading(false);
      })
      .catch(() => setLogLoading(false));
  }, []);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  // ── Fetch monthly usage summary ────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/admin/irrigation/usage-summary', { params: { days: 30 } })
      .then(data => setUsageSummary(data))
      .catch(() => {});
  }, [irrigateSuccess]);

  // ── "Irrigate Now" — writes a real completed log row ──────────────────────
  const handleIrrigateNow = async () => {
    if (!recommendation) return;
    const farm = selectedFarm.trim() || 'My Farm';
    const today = new Date().toISOString().slice(0, 10);
    setIrrigateLoading(true);
    try {
      await apiClient.post('/admin/irrigation', {
        farm,
        crop: selectedCrop,
        date: today,
        recommendedLiters: recommendation.waterAmountLiters,
        actualLiters: recommendation.waterAmountLiters,
        durationHours: recommendation.durationHours,
        status: 'Completed',
        reason: recommendation.reason,
        triggeredBy: 'manual',
      });
      setIrrigateSuccess(true);
      setTimeout(() => setIrrigateSuccess(false), 4000);
      fetchLog();
    } catch (e) {
      console.error('Irrigate Now failed', e);
    } finally {
      setIrrigateLoading(false);
    }
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    // Simple: create a Scheduled entry with the chosen date
    const farm = selectedFarm.trim() || 'My Farm';
    apiClient.post('/admin/irrigation', {
      farm,
      crop: selectedCrop,
      date: newScheduleDate,
      recommendedLiters: recommendation?.waterAmountLiters || 0,
      status: 'Scheduled',
      reason: recommendation?.reason,
    }).catch(console.error);
    setShowScheduleModal(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">

          {/* ── Header Bar ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#063F2F] font-sora">Smart Irrigation Advisor</h1>
                <span className="bg-[#E8F6E6] text-[#087A4B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Weather-Integrated Engine</span>
              </div>
              <p className="text-[#45665A] text-sm mt-1">
                Precision water decision logic combining soil moisture, crop stage & live weather.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleIrrigateNow}
                disabled={irrigateLoading || !recommendation}
                className="bg-[#087A4B] hover:bg-[#063F2F] disabled:opacity-50 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                {irrigateLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Zap className="w-4 h-4 text-yellow-300" />}
                Irrigate Now
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-[#FAFCF7] hover:bg-[#EEF7EA] text-[#087A4B] border border-[#D5E8D5] px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Set Schedule
              </button>
            </div>
          </div>

          {/* ── Monthly Usage Strip ── */}
          {usageSummary && (
            <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-[#D5E8D5] flex flex-wrap gap-6 items-center">
              <span className="text-xs font-bold text-[#789187] uppercase tracking-wider">Your Water Usage This Month</span>
              {usageSummary.cyclesCompleted === 0 ? (
                <span className="text-xs text-[#45665A]">No completed irrigation cycles logged yet.</span>
              ) : (
                <>
                  <div>
                    <span className="text-xs text-[#789187]">Total Used</span>
                    <div className="font-bold text-[#063F2F]">{usageSummary.totalLitersUsed.toLocaleString()} L</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#789187]">Cycles Completed</span>
                    <div className="font-bold text-[#063F2F]">{usageSummary.cyclesCompleted}</div>
                  </div>
                  {usageSummary.variancePercent !== null && (
                    <div>
                      <span className="text-xs text-[#789187]">vs Recommendation</span>
                      <div className={`font-bold text-sm ${usageSummary.variancePercent <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {usageSummary.variancePercent <= 0
                          ? `${Math.abs(usageSummary.variancePercent)}% below`
                          : `${usageSummary.variancePercent}% above`}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Success Notification */}
          {irrigateSuccess && (
            <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-yellow-300" />
                <span className="font-bold">Irrigation cycle logged successfully!</span>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Saved to database</span>
            </div>
          )}

          {/* ── Farm Inputs Card ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
            <div className="flex items-center justify-between mb-4 border-b border-[#F0FAEE] pb-3">
              <h3 className="font-bold text-[#063F2F] font-sora flex items-center gap-2 text-base">
                Farm Inputs & Environmental Conditions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Farm Name — free-text (no fake preset options) */}
              <div>
                <label className="text-xs font-bold text-[#789187] block mb-1">Farm / Field Name</label>
                <input
                  type="text"
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  placeholder="e.g. North Field"
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl p-2.5 text-xs font-bold text-[#063F2F] focus:outline-none focus:border-[#087A4B]"
                />
              </div>

              {/* Crop Select */}
              <div>
                <label className="text-xs font-bold text-[#789187] block mb-1">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setGrowthStage(CROPS_DATA[e.target.value]?.stages[0] || 'Vegetative');
                  }}
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl p-2.5 text-xs font-bold text-[#063F2F] focus:outline-none"
                >
                  {Object.keys(CROPS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Growth Stage */}
              <div>
                <label className="text-xs font-bold text-[#789187] block mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl p-2.5 text-xs font-bold text-[#063F2F] focus:outline-none"
                >
                  {CROPS_DATA[selectedCrop]?.stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Soil Moisture — farmer-entered band (Low/Medium/High), matches backend API */}
              <div>
                <label className="text-xs font-bold text-[#789187] block mb-1">Soil Moisture</label>
                <select
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(e.target.value)}
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl p-2.5 text-xs font-bold text-[#063F2F] focus:outline-none"
                >
                  <option value="low">Low (needs water)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (saturated)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Main Analysis: Recommendation + Weather ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recommendation Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-[#D5E8D5] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[#789187] uppercase tracking-wider">Recommendation Analysis</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#D5E8D5] text-[#45665A]">Rule-based</span>
                </div>

                {recLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-[#EAF8E9] rounded w-2/3" />
                    <div className="h-4 bg-[#F5FAF1] rounded w-full" />
                  </div>
                ) : recommendation ? (
                  <>
                    <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-3">{recommendation.title}</h2>
                    <div className="bg-[#FAFCF7] rounded-2xl p-5 border border-[#D5E8D5] mb-6">
                      <p className="text-sm text-[#183F34] leading-relaxed font-medium">"{recommendation.reason}"</p>
                    </div>

                    {recommendation.title !== 'Delay irrigation' && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#087A4B] mb-3 flex items-center gap-1.5">
                          <Info className="w-4 h-4" /> Decision Rule Applied
                        </h4>
                        <div className="bg-[#FAFCF7] border border-[#F0FAEE] rounded-xl p-3 text-xs text-[#35544A] font-medium">
                          Soil moisture = <strong>{soilMoisture}</strong> · Rain probability = <strong>{recommendation.context.rainProbability}%</strong> · Temperature = <strong>{recommendation.context.temperature}°C</strong>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Could not load recommendation.
                  </div>
                )}
              </div>

              {/* Metrics */}
              {recommendation && !recLoading && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#F0FAEE] mt-6">
                  {[
                    { label: 'Water Amount', value: recommendation.waterAmountLiters >= 0 ? `${recommendation.waterAmountLiters.toLocaleString()} L` : '—' },
                    { label: 'Est. Duration', value: recommendation.durationHours >= 0 ? `${recommendation.durationHours} hrs` : '—' },
                    { label: 'Soil Moisture Input', value: soilMoisture.charAt(0).toUpperCase() + soilMoisture.slice(1) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#FAFCF7] p-4 rounded-2xl border border-[#D5E8D5]">
                      <div className="text-[11px] text-[#789187] font-semibold uppercase">{label}</div>
                      <div className="text-lg font-bold text-[#063F2F] font-sora mt-1">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Weather Panel */}
            <div className="bg-[#063F2F] rounded-3xl p-7 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#087A4B] opacity-20 rounded-full blur-3xl" />

              <div>
                <h3 className="text-lg font-bold font-sora mb-6 flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-400" /> Live Weather
                </h3>

                {weatherLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-5 bg-white/10 rounded" />)}
                  </div>
                ) : weatherError ? (
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Live weather unavailable.
                  </div>
                ) : weather ? (
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs text-[#B7E6C4] mb-1">{weather.location}</div>
                      <div className="text-3xl font-bold font-sora">{weather.temperature}°C</div>
                      <div className="text-sm text-[#B7E6C4] mt-1">{weather.condition}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-xs text-[#B7E6C4] flex items-center gap-1"><Droplet className="w-3 h-3" />Humidity</span>
                        <span className="text-xl font-bold font-sora">{weather.humidity}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#B7E6C4] flex items-center gap-1"><CloudRain className="w-3 h-3" />Rain Chance</span>
                        <span className="text-xl font-bold font-sora">{weather.rainProbability}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#B7E6C4] flex items-center gap-1"><Wind className="w-3 h-3" />Wind</span>
                        <span className="text-xl font-bold font-sora">{weather.windSpeed} km/h</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#B7E6C4] flex items-center gap-1"><Thermometer className="w-3 h-3" />Rainfall</span>
                        <span className="text-xl font-bold font-sora">{weather.rainfall} mm</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="pt-6 border-t border-white/10 text-xs text-[#B7E6C4]">
                Live data from Open-Meteo API.
              </div>
            </div>

          </div>

          {/* ── Completed Irrigation Log ── */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#D5E8D5]">
            <h3 className="text-base font-bold text-[#063F2F] font-sora mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#087A4B]" /> Completed Irrigation Log
            </h3>

            {logLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2].map(i => <div key={i} className="h-14 bg-[#F5FAF1] rounded-2xl" />)}
              </div>
            ) : completedLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Droplet className="w-8 h-8 text-[#D5E8D5] mb-2" />
                <p className="text-[#45665A] text-sm">No completed irrigation cycles yet. Click "Irrigate Now" or mark a schedule as Completed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedLog.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFCF7] border border-[#F0FAEE]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F6E6] flex items-center justify-center text-[#087A4B]">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#063F2F] text-sm">
                          {log.farm}{log.crop ? ` · ${log.crop}` : ''}
                        </div>
                        <div className="text-xs text-[#789187]">
                          {log.actualLiters ? `${Number(log.actualLiters).toLocaleString()} L` : '—'} ·{' '}
                          {log.durationHours ? `${log.durationHours} hrs` : '—'} ·{' '}
                          {log.method} ·{' '}
                          {log.createdAt ? log.createdAt.slice(0, 10) : '—'}
                        </div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-[#D5E8D5]">
            <h3 className="text-lg font-bold text-[#063F2F] font-sora mb-4">Set Custom Irrigation Schedule</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#789187] block mb-1">Target Date</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  required
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl p-3 text-xs font-bold text-[#063F2F] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#EEF7EA] rounded-xl text-xs text-[#087A4B] font-medium">
                ⚡ This schedule will use the current live weather recommendation ({recommendation?.title || '…'}).
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#087A4B] text-white font-bold py-3 rounded-xl text-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


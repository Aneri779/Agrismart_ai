import React, { useState, useEffect } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { Leaf, Droplet, Sun, Wind, Sprout, TrendingUp, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/client';

const BREAKDOWN_ICONS = {
  'Crop Health': Sprout,
  'Water Efficiency': Droplet,
  'Resource Use': Sun,
  'Environmental Impact': Wind,
};
const BREAKDOWN_COLORS = {
  'Crop Health': 'bg-green-500',
  'Water Efficiency': 'bg-blue-500',
  'Resource Use': 'bg-yellow-500',
  'Environmental Impact': 'bg-teal-500',
};

const scoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Improvement';
};

export const SustainabilityPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient.get('/farmer/sustainability')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-6">

          <div className="flex justify-between items-center bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
            <div>
              <h1 className="text-2xl font-bold text-[#063F2F] font-sora">Sustainability Score</h1>
              <p className="text-[#45665A] text-sm mt-1">A greener farm is a stronger farm.</p>
            </div>
            <div className="text-sm text-[#789187] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35A866]" />
              {data?.generatedAt
                ? `Updated: ${new Date(data.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
                : 'Loading…'}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-[#45665A]">
              <Loader2 className="w-6 h-6 animate-spin text-[#35A866]" />
              <span>Calculating sustainability score from your farm data…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-24 gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <span>Could not load sustainability data. Please refresh.</span>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Empty state when no scans exist yet */}
              {data.scansAnalyzed === 0 && (
                <div className="bg-white rounded-3xl p-8 border border-[#D5E8D5] shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <Sprout className="w-12 h-12 text-[#D5E8D5]" />
                  <h2 className="text-lg font-bold text-[#063F2F]">No scan data yet</h2>
                  <p className="text-[#45665A] text-sm max-w-md">
                    Your sustainability score is calculated from real crop scans and completed irrigation cycles.
                    Scan your first crop to begin tracking your farm's health.
                  </p>
                  <p className="text-xs text-[#789187] italic">
                    Score shown below is a neutral baseline (50/100) — it will update as you add real data.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

                {/* Main Score Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5] flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative w-56 h-56 mb-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F3FAEF" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={data.score >= 70 ? '#35A866' : data.score >= 50 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * data.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-bold text-[#063F2F] font-sora">{data.score}</span>
                      <span className="text-sm text-[#789187] mt-1">/ 100</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-[#087A4B] mb-2 font-sora">
                    {scoreLabel(data.score)} <span className="text-2xl">↗</span>
                  </h2>
                  <p className="text-xs text-[#45665A] text-center">
                    Based on {data.scansAnalyzed} scan{data.scansAnalyzed !== 1 ? 's' : ''} and {data.cyclesCompleted} irrigation cycle{data.cyclesCompleted !== 1 ? 's' : ''} (last 30 days).
                  </p>
                </div>

                {/* Component Breakdown */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5]">
                  <h3 className="font-bold text-[#063F2F] font-sora mb-6 text-lg">Component Score</h3>
                  {data.breakdown.length === 0 ? (
                    <p className="text-[#45665A] text-sm">No breakdown available yet — scan your first crop to generate detailed scores.</p>
                  ) : (
                    <div className="space-y-6">
                      {data.breakdown.map(({ label, value, weight }) => {
                        const Icon = BREAKDOWN_ICONS[label] || Leaf;
                        const barColor = BREAKDOWN_COLORS[label] || 'bg-[#35A866]';
                        return (
                          <div key={label}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="flex items-center gap-2 text-sm font-bold text-[#183F34]">
                                <Icon className="w-4 h-4" /> {label}
                                <span className="text-[10px] text-[#789187] font-normal">({weight}% weight)</span>
                              </span>
                              <span className="font-bold text-[#063F2F] font-sora">{value}</span>
                            </div>
                            <div className="h-3 w-full bg-[#F3FAEF] rounded-full overflow-hidden">
                              <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Formula disclosure */}
                  <details className="mt-6 border-t border-[#F0FAEE] pt-4">
                    <summary className="text-xs font-semibold text-[#789187] cursor-pointer hover:text-[#063F2F]">
                      How is this score calculated?
                    </summary>
                    <div className="mt-3 text-xs text-[#45665A] space-y-1.5">
                      <p className="font-bold text-[#063F2F] mb-1">Weighted formula:</p>
                      <p>• <strong>Crop Health (35%)</strong> — ratio of healthy scans vs. 'Detected' scans</p>
                      <p>• <strong>Water Efficiency (30%)</strong> — how close actual irrigation matched AI recommendation (50 = neutral, higher = more efficient)</p>
                      <p>• <strong>Resource Use (20%)</strong> — consistent irrigation cycles logged in the last 30 days (10 cycles = 100)</p>
                      <p>• <strong>Environmental Impact (15%)</strong> — inverse of high/critical severity disease detections</p>
                      <p className="text-[#789187] mt-2">Score = (Crop Health × 0.35) + (Water Efficiency × 0.30) + (Resource Use × 0.20) + (Environmental Impact × 0.15)</p>
                    </div>
                  </details>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variance / Efficiency Signal */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5] flex items-center gap-6">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F3FAEF" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#087A4B" strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * data.score) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#063F2F]">{data.score}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#063F2F] font-sora text-sm mb-1">Real-time Calculated Score</h3>
                    {data.variancePercent !== null ? (
                      <p className={`text-xs font-bold px-2 py-0.5 rounded-md mt-2 w-fit ${data.variancePercent <= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        {data.variancePercent <= 0
                          ? `${Math.abs(data.variancePercent)}% below AI water recommendation`
                          : `${data.variancePercent}% above AI water recommendation`}
                      </p>
                    ) : (
                      <p className="text-xs text-[#789187] mt-2">Complete irrigation cycles to see water efficiency signal.</p>
                    )}
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="bg-[#063F2F] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white font-sora mb-4 text-sm">Improvement Suggestions</h3>
                    <ul className="space-y-2">
                      {data.score < 80 && (
                        <li className="flex items-start gap-2 text-xs text-[#B7E6C4]">
                          <CheckCircle2 className="w-4 h-4 text-[#35A866] shrink-0" /> Optimize irrigation schedule to match AI recommendations
                        </li>
                      )}
                      {data.cropHealthIndex < 70 && (
                        <li className="flex items-start gap-2 text-xs text-[#B7E6C4]">
                          <CheckCircle2 className="w-4 h-4 text-[#35A866] shrink-0" /> Scan more crops to improve crop health detection coverage
                        </li>
                      )}
                      {data.resourceUseIndex < 60 && (
                        <li className="flex items-start gap-2 text-xs text-[#B7E6C4]">
                          <CheckCircle2 className="w-4 h-4 text-[#35A866] shrink-0" /> Log more completed irrigation cycles for better resource tracking
                        </li>
                      )}
                      {data.score >= 80 && (
                        <li className="flex items-start gap-2 text-xs text-[#B7E6C4]">
                          <CheckCircle2 className="w-4 h-4 text-[#35A866] shrink-0" /> Excellent farm management — keep it up!
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};


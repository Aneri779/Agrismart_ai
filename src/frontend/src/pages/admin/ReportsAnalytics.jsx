import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Sprout, AlertTriangle, Users, Download } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { motion } from 'framer-motion';

const REPORT_TYPES = ['Crop Report', 'Disease Report', 'Weather Report', 'Yield Report'];
const DATE_RANGES = ['Today', 'Week', 'Month', 'Year'];

/* Simple bar chart built with divs */
const BarChart = ({ data, colorClass = 'bg-[#008F5A]' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40 mt-4">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-[10px] font-bold text-[#004D3C]">{item.value}</span>
          <motion.div
            initial={{ height: 0 }} animate={{ height: `${(item.value / max) * 100}%` }}
            transition={{ delay: i * 0.06, type: 'spring', damping: 20 }}
            className={`w-full rounded-t-xl ${colorClass} min-h-[4px]`} />
          <span className="text-[10px] text-[#789187] font-medium text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

/* Donut segment (CSS conic-gradient) */
const DonutChart = ({ segments }) => {
  let offset = 0;
  const gradient = segments.map(s => {
    const start = offset;
    offset += s.pct;
    return `${s.color} ${start}% ${offset}%`;
  }).join(', ');
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{
        background: `conic-gradient(${gradient})`,
        padding: '2px',
      }}>
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
          <p className="text-lg font-bold text-[#004D3C]">{segments[0]?.pct || 0}%</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-4 w-full">
        {segments.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] text-[#45665A]">{s.label}</span>
            </div>
            <span className="text-[12px] font-bold text-[#004D3C]">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const REPORT_DATA = {
  'Crop Report': {
    barData: [
      { label: 'Tomato', value: 32 }, { label: 'Wheat', value: 28 }, { label: 'Rice', value: 21 },
      { label: 'Maize', value: 15 }, { label: 'Cotton', value: 12 }, { label: 'Soybean', value: 8 },
    ],
    donut: [
      { label: 'Healthy', pct: 78, count: 25, color: '#008F5A' },
      { label: 'At Risk', pct: 15, count: 5,  color: '#F59E0B' },
      { label: 'Diseased', pct: 7, count: 2,  color: '#EF4444' },
    ],
    summary: [
      { icon: Sprout, label: 'Total Crops Monitored', value: '32', color: 'text-green-600', bg: 'bg-green-50' },
      { icon: AlertTriangle, label: 'Most Common Disease', value: 'Early Blight', color: 'text-red-500', bg: 'bg-red-50' },
      { icon: TrendingUp, label: 'Avg Health Score', value: '82/100', color: 'text-blue-600', bg: 'bg-blue-50' },
    ],
  },
  'Disease Report': {
    barData: [
      { label: 'Early Blight', value: 12 }, { label: 'Leaf Rust', value: 9 }, { label: 'Mosaic', value: 7 },
      { label: 'Downy Mildew', value: 5 }, { label: 'Away Worm', value: 4 },
    ],
    donut: [
      { label: 'Resolved', pct: 65, count: 24, color: '#008F5A' },
      { label: 'Under Treatment', pct: 25, count: 9, color: '#F59E0B' },
      { label: 'Detected', pct: 10, count: 4, color: '#EF4444' },
    ],
    summary: [
      { icon: AlertTriangle, label: 'Total Detections', value: '37', color: 'text-red-500', bg: 'bg-red-50' },
      { icon: TrendingUp, label: 'Detection Accuracy', value: '94%', color: 'text-green-600', bg: 'bg-green-50' },
      { icon: Sprout, label: 'Crops Affected', value: '8', color: 'text-amber-600', bg: 'bg-amber-50' },
    ],
  },
  'Weather Report': {
    barData: [
      { label: 'Mon', value: 31 }, { label: 'Tue', value: 29 }, { label: 'Wed', value: 27 },
      { label: 'Thu', value: 33 }, { label: 'Fri', value: 32 }, { label: 'Sat', value: 28 }, { label: 'Sun', value: 30 },
    ],
    donut: [
      { label: 'Sunny', pct: 55, count: 4, color: '#F59E0B' },
      { label: 'Cloudy', pct: 28, count: 2, color: '#94A3B8' },
      { label: 'Rainy', pct: 17, count: 1, color: '#3B82F6' },
    ],
    summary: [
      { icon: TrendingUp, label: 'Avg Temp (°C)', value: '30.1°', color: 'text-amber-600', bg: 'bg-amber-50' },
      { icon: Sprout, label: 'Total Rainfall', value: '28 mm', color: 'text-blue-600', bg: 'bg-blue-50' },
      { icon: AlertTriangle, label: 'Weather Alerts', value: '2', color: 'text-red-500', bg: 'bg-red-50' },
    ],
  },
  'Yield Report': {
    barData: [
      { label: 'Tomato', value: 91 }, { label: 'Wheat', value: 88 }, { label: 'Rice', value: 85 },
      { label: 'Cotton', value: 79 }, { label: 'Maize', value: 92 },
    ],
    donut: [
      { label: 'Above Target', pct: 62, count: 20, color: '#008F5A' },
      { label: 'On Track', pct: 28, count: 9, color: '#3B82F6' },
      { label: 'Below Target', pct: 10, count: 3, color: '#EF4444' },
    ],
    summary: [
      { icon: TrendingUp, label: 'Avg Yield Score', value: '87%', color: 'text-green-600', bg: 'bg-green-50' },
      { icon: Sprout, label: 'Healthy Crops', value: '27', color: 'text-blue-600', bg: 'bg-blue-50' },
      { icon: AlertTriangle, label: 'Avg Yield (tons/ha)', value: '78%', color: 'text-amber-600', bg: 'bg-amber-50' },
    ],
  },
};

export const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState('Crop Report');
  const [dateRange, setDateRange] = useState('Month');
  const data = REPORT_DATA[reportType];

  const exportReport = () => {
    const content = `AgriSmart AI Report\n${reportType} — ${dateRange}\n\n` +
      data.barData.map(d => `${d.label}: ${d.value}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${reportType.replace(/ /g, '_')}_${dateRange}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map(rt => (
            <button key={rt} onClick={() => setReportType(rt)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                reportType === rt
                  ? 'bg-[#008F5A] text-white shadow-md'
                  : 'bg-white border border-[#EAF8E9] text-[#45665A] hover:bg-[#EAF8E9]'
              }`}>
              {rt}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="bg-white border border-[#EAF8E9] rounded-full px-5 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#EAF8E9] bg-white text-[13px] font-semibold text-[#45665A] hover:bg-[#EAF8E9] shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.summary.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <AdminCard className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-[#789187] font-semibold uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-bold text-[#004D3C]">{s.value}</p>
              </div>
            </AdminCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminCard>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-[#004D3C] text-[14px]">
                {reportType === 'Crop Report' ? 'Crop Distribution' :
                 reportType === 'Disease Report' ? 'Disease Frequency' :
                 reportType === 'Weather Report' ? 'Daily Temperature (°C)' : 'Yield by Crop (%)'}
              </p>
              <p className="text-[11px] text-[#789187] mt-0.5">{dateRange} overview</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#008F5A]" />
          </div>
          <BarChart data={data.barData} />
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-[#004D3C] text-[14px]">
                {reportType === 'Crop Report' ? 'Crop Health Distribution' :
                 reportType === 'Disease Report' ? 'Treatment Status' :
                 reportType === 'Weather Report' ? 'Weather Breakdown' : 'Yield Performance'}
              </p>
              <p className="text-[11px] text-[#789187] mt-0.5">Current snapshot</p>
            </div>
            <PieChart className="w-5 h-5 text-[#008F5A]" />
          </div>
          <div className="flex justify-center mt-4">
            <DonutChart segments={data.donut} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

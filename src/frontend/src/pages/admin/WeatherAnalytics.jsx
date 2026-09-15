import React, { useState } from 'react';
import { CloudRain, Thermometer, Droplet, Wind, Eye, Cloud, Sun, CloudSnow, Zap, MapPin, RefreshCw } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { motion } from 'framer-motion';

const FORECAST = [
  { day: 'Mon', high: 31, low: 23, icon: Sun,        rain: 5  },
  { day: 'Tue', high: 29, low: 21, icon: CloudRain,  rain: 72 },
  { day: 'Wed', high: 27, low: 20, icon: CloudRain,  rain: 60 },
  { day: 'Thu', high: 33, low: 24, icon: Sun,        rain: 8  },
  { day: 'Fri', high: 32, low: 23, icon: Cloud,      rain: 25 },
  { day: 'Sat', high: 28, low: 21, icon: CloudRain,  rain: 55 },
  { day: 'Sun', high: 30, low: 22, icon: Sun,        rain: 12 },
];

const METRICS = [
  { label: 'Humidity',    value: '72%',     icon: Droplet,      color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { label: 'Wind Speed',  value: '12 km/h', icon: Wind,         color: 'text-teal-500',   bg: 'bg-teal-50'   },
  { label: 'Visibility',  value: '8 km',    icon: Eye,          color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Rain (24h)',  value: '4 mm',    icon: CloudRain,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export const WeatherAnalytics = () => {
  const [location, setLocation] = useState('Ahmedabad, Gujarat');
  const [editLoc, setEditLoc] = useState(false);
  const [tempLoc, setTempLoc] = useState(location);
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  const handleLocSave = () => {
    setLocation(tempLoc);
    setEditLoc(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EAF8E9] rounded-xl flex items-center justify-center">
            <CloudRain className="w-5 h-5 text-[#008F5A]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#004D3C]">Weather Analytics</h2>
            {editLoc ? (
              <div className="flex items-center gap-2 mt-1">
                <input value={tempLoc} onChange={e => setTempLoc(e.target.value)}
                  className="border border-[#EAF8E9] rounded-lg px-3 py-1 text-xs outline-none focus:border-[#008F5A]" />
                <button onClick={handleLocSave} className="text-xs font-bold text-[#008F5A] hover:underline">Save</button>
                <button onClick={() => setEditLoc(false)} className="text-xs text-gray-400 hover:underline">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditLoc(true)} className="flex items-center gap-1 text-xs text-[#45665A] hover:text-[#008F5A] mt-0.5">
                <MapPin className="w-3 h-3" /> {location} <span className="text-[10px] text-[#789187]">(click to change)</span>
              </button>
            )}
          </div>
        </div>
        <button onClick={handleRefresh}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#EAF8E9] bg-white text-[13px] font-semibold text-[#45665A] hover:bg-[#EAF8E9] shadow-sm transition-colors`}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshed ? 'animate-spin text-[#008F5A]' : ''}`} />
          {refreshed ? 'Refreshed!' : 'Refresh'}
        </button>
      </div>

      {/* Current weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-1">
          <p className="text-[11px] font-bold text-[#45665A] uppercase tracking-wider mb-4">Current Weather</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Cloud className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-[#004D3C]">31°C</p>
              <p className="text-[13px] text-[#45665A] font-medium">Partly Cloudy</p>
              <p className="text-[11px] text-[#789187]">Feels like 34°C</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map(m => (
              <div key={m.label} className={`flex items-center gap-2 p-3 rounded-xl ${m.bg}`}>
                <m.icon className={`w-4 h-4 ${m.color} flex-shrink-0`} />
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">{m.label}</p>
                  <p className={`text-[13px] font-bold ${m.color}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[#EAF8E9] border border-[#D5EFD5]">
            <p className="text-[12px] font-bold text-[#004D3C] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#008F5A]" /> AI Weather Insight
            </p>
            <p className="text-[11px] text-[#45665A] mt-1">
              Rain is likely in the next 2 days. Consider delaying irrigation and harvesting vulnerable crops.
            </p>
          </div>
        </AdminCard>

        {/* 7-day forecast */}
        <AdminCard className="lg:col-span-2">
          <p className="text-[11px] font-bold text-[#45665A] uppercase tracking-wider mb-4">7-Day Forecast</p>
          <div className="grid grid-cols-7 gap-2">
            {FORECAST.map((day, i) => {
              const Icon = day.icon;
              const isRainy = day.rain > 40;
              return (
                <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-default ${
                    i === 0 ? 'bg-[#EAF8E9] border-[#D5EFD5] shadow-sm' : 'bg-white border-[#EAF8E9] hover:bg-[#F7FBF5]'
                  }`}>
                  <p className="text-[11px] font-bold text-[#45665A] mb-2">{day.day}</p>
                  <Icon className={`w-5 h-5 mb-2 ${isRainy ? 'text-blue-400' : 'text-amber-400'}`} />
                  <p className="text-[13px] font-bold text-[#004D3C]">{day.high}°</p>
                  <p className="text-[11px] text-[#789187]">{day.low}°</p>
                  <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${day.rain}%` }} />
                  </div>
                  <p className="text-[9px] text-blue-400 mt-1 font-bold">{day.rain}%</p>
                </motion.div>
              );
            })}
          </div>

          {/* Farm coverage note */}
          <div className="mt-4 pt-4 border-t border-[#EAF8E9]">
            <p className="text-[12px] font-bold text-[#004D3C] mb-2">Weather Coverage</p>
            <div className="flex flex-wrap gap-2">
              {['Farm #1 — Tomato', 'Farm #2 — Wheat', 'Farm #3 — Rice', 'Farm #4 — Cotton'].map((farm, i) => (
                <div key={farm} className="flex items-center gap-1.5 px-3 py-1 bg-[#F5FAF1] rounded-full border border-[#EAF8E9]">
                  <span className={`w-1.5 h-1.5 rounded-full ${i === 1 || i === 2 ? 'bg-amber-400' : 'bg-[#008F5A]'}`} />
                  <p className="text-[11px] text-[#45665A] font-medium">{farm}</p>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};

export default WeatherAnalytics;

import React, { useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { getSmartAgronomyAdvice, CROPS_DATA } from '../../services/smartAgronomyEngine';
import { 
  Sun, Cloud, CloudRain, Wind, Droplet, MapPin, AlertTriangle, 
  Calendar, Thermometer, Sunrise, Sunset, Activity, ShieldAlert,
  ArrowUpRight, CheckCircle2, Clock, Zap, Leaf
} from 'lucide-react';

export const WeatherPage = () => {
  const [selectedCrop, setSelectedCrop] = useState("Cotton");
  const [growthStage, setGrowthStage] = useState("Flowering");
  const [soilMoisture, setSoilMoisture] = useState(38);
  const [location, setLocation] = useState("Ahmedabad, Gujarat");

  // Forecast Data
  const forecast7Days = [
    { day: 'Today', tempHigh: 34, tempLow: 25, humidity: 72, rainProb: 80, rainMm: 22, condition: 'Thunderstorms Expected', icon: CloudRain },
    { day: 'Mon, 15 Sep', tempHigh: 31, tempLow: 24, humidity: 82, rainProb: 85, rainMm: 30, condition: 'Heavy Rain', icon: CloudRain },
    { day: 'Tue, 16 Sep', tempHigh: 32, tempLow: 24, humidity: 65, rainProb: 30, rainMm: 4, condition: 'Partly Cloudy', icon: Cloud },
    { day: 'Wed, 17 Sep', tempHigh: 35, tempLow: 26, humidity: 50, rainProb: 10, rainMm: 0, condition: 'Sunny & Hot', icon: Sun },
    { day: 'Thu, 18 Sep', tempHigh: 36, tempLow: 27, humidity: 45, rainProb: 5, rainMm: 0, condition: 'Heatwave Alert', icon: Sun },
    { day: 'Fri, 19 Sep', tempHigh: 33, tempLow: 25, humidity: 55, rainProb: 20, rainMm: 2, condition: 'Clear Skies', icon: Sun },
    { day: 'Sat, 20 Sep', tempHigh: 32, tempLow: 24, humidity: 60, rainProb: 40, rainMm: 8, condition: 'Scattered Showers', icon: CloudRain },
  ];

  const weatherData = {
    location,
    temperature: forecast7Days[0].tempHigh,
    humidity: forecast7Days[0].humidity,
    windSpeed: 14,
    rainProbability: forecast7Days[0].rainProb,
    rainfallExpected: forecast7Days[0].rainMm,
    condition: forecast7Days[0].condition
  };

  const advice = getSmartAgronomyAdvice({
    soilMoisture,
    crop: selectedCrop,
    growthStage,
    weatherData
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
          
          {/* ── Page Header & Farm Parameters Bar ── */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#063F2F] font-sora">Weather & Agronomy Intelligence</h1>
                <span className="bg-[#E8F6E6] text-[#087A4B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Live Radar</span>
              </div>
              <p className="text-[#45665A] text-sm mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#087A4B]" /> {location} • Real-time station feed
              </p>
            </div>

            {/* Parameter Inputs */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#FAFCF7] px-3 py-2 rounded-2xl border border-[#D5E8D5] flex items-center gap-2 text-xs">
                <span className="text-[#789187] font-semibold">Crop:</span>
                <select 
                  value={selectedCrop} 
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setGrowthStage(CROPS_DATA[e.target.value].stages[2] || CROPS_DATA[e.target.value].stages[0]);
                  }}
                  className="bg-transparent font-bold text-[#063F2F] focus:outline-none cursor-pointer"
                >
                  {Object.keys(CROPS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="bg-[#FAFCF7] px-3 py-2 rounded-2xl border border-[#D5E8D5] flex items-center gap-2 text-xs">
                <span className="text-[#789187] font-semibold">Stage:</span>
                <select 
                  value={growthStage} 
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="bg-transparent font-bold text-[#063F2F] focus:outline-none cursor-pointer"
                >
                  {CROPS_DATA[selectedCrop]?.stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="bg-[#FAFCF7] px-3.5 py-2 rounded-2xl border border-[#D5E8D5] flex items-center gap-3 text-xs">
                <span className="text-[#789187] font-semibold">Soil Moisture:</span>
                <input 
                  type="range" min="15" max="85" value={soilMoisture} 
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-20 accent-[#087A4B] cursor-pointer"
                />
                <span className="font-bold text-[#087A4B] text-sm w-8">{soilMoisture}%</span>
              </div>
            </div>
          </div>

          {/* ── Weather-Based Intelligence Banner (Requirement 1.B & 3) ── */}
          <div className={`rounded-3xl p-6 shadow-md border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all ${
            advice.status === 'DELAY IRRIGATION' ? 'bg-[#0F4C3A] text-white border-[#087A4B]' : 'bg-white text-[#123D31] border-[#D5E8D5]'
          }`}>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0">
                {advice.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${advice.statusBadge}`}>
                    {advice.status}
                  </span>
                  <span className="text-xs text-[#B7E6C4] font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> Weather-Irrigation Engine Output
                  </span>
                </div>
                <h2 className="text-xl font-bold font-sora text-white mb-2">{advice.headline}</h2>
                <p className="text-sm text-[#DDF1DD] max-w-3xl leading-relaxed">
                  "{advice.actionDetails}"
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-[200px]">
              <div className="text-xs text-[#B7E6C4] font-semibold mb-1">Rain Probability Today</div>
              <div className="text-3xl font-extrabold text-white font-sora">{weatherData.rainProbability}%</div>
              <div className="text-xs text-[#86EFAC] mt-1 font-bold">~{weatherData.rainfallExpected} mm expected</div>
            </div>
          </div>

          {/* ── Weather Analysis Overview Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Weather Card */}
            <div className="bg-[#087A4B] rounded-3xl p-7 shadow-sm text-white flex flex-col justify-between relative overflow-hidden min-h-[320px]">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-[#B7E6C4] uppercase">Current Conditions</span>
                    <h2 className="text-2xl font-bold font-sora mt-1">{weatherData.condition}</h2>
                  </div>
                  <Sun className="w-16 h-16 text-yellow-300 animate-pulse" />
                </div>
                <div className="text-6xl font-bold font-sora my-4">{weatherData.temperature}°<span className="text-3xl font-normal text-[#B7E6C4]">C</span></div>
              </div>

              {/* Detailed Metrics Bar */}
              <div className="grid grid-cols-4 gap-2 pt-5 border-t border-white/20 text-center text-xs">
                <div>
                  <Droplet className="w-4 h-4 text-[#B7E6C4] mx-auto mb-1" />
                  <div className="font-bold text-sm">{weatherData.humidity}%</div>
                  <div className="text-[10px] text-[#B7E6C4]">Humidity</div>
                </div>
                <div className="border-l border-white/20">
                  <Wind className="w-4 h-4 text-[#B7E6C4] mx-auto mb-1" />
                  <div className="font-bold text-sm">{weatherData.windSpeed} km/h</div>
                  <div className="text-[10px] text-[#B7E6C4]">Wind</div>
                </div>
                <div className="border-l border-white/20">
                  <CloudRain className="w-4 h-4 text-[#B7E6C4] mx-auto mb-1" />
                  <div className="font-bold text-sm">{weatherData.rainProbability}%</div>
                  <div className="text-[10px] text-[#B7E6C4]">Rain Chance</div>
                </div>
                <div className="border-l border-white/20">
                  <Thermometer className="w-4 h-4 text-[#B7E6C4] mx-auto mb-1" />
                  <div className="font-bold text-sm">36° / 24°</div>
                  <div className="text-[10px] text-[#B7E6C4]">High / Low</div>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-xs text-[#DDF1DD]">
                <span className="flex items-center gap-1.5"><Sunrise className="w-4 h-4 text-amber-300" /> Sunrise: 06:12 AM</span>
                <span className="flex items-center gap-1.5"><Sunset className="w-4 h-4 text-amber-400" /> Sunset: 06:48 PM</span>
              </div>
            </div>

            {/* 7-Day Weather Forecast */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-[#D5E8D5] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#063F2F] font-sora">7-Day Weather Forecast</h3>
                  <p className="text-xs text-[#789187]">Includes rain probability & temperature trends</p>
                </div>
                <span className="text-xs text-[#087A4B] font-bold flex items-center gap-1"><Calendar className="w-4 h-4" /> Next 7 Days</span>
              </div>

              <div className="space-y-3">
                {forecast7Days.map((day, i) => {
                  const Icon = day.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFCF7] border border-[#F0FAEE] hover:bg-[#EEF7EA] transition-colors">
                      <div className="w-28 font-bold text-[#183F34] text-sm">{day.day}</div>
                      
                      <div className="flex items-center gap-2 text-[#45665A] w-40">
                        <Icon className={`w-5 h-5 ${day.rainProb > 50 ? 'text-blue-500' : 'text-amber-500'}`} />
                        <span className="text-xs font-semibold">{day.condition}</span>
                      </div>

                      {/* Rain Probability Progress Bar */}
                      <div className="hidden sm:flex items-center gap-2 w-36">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${day.rainProb}%` }} />
                        </div>
                        <span className="text-xs text-blue-600 font-bold w-9 text-right">{day.rainProb}%</span>
                      </div>

                      <div className="font-bold text-[#063F2F] text-right text-sm">
                        {day.tempHigh}°C <span className="text-[#789187] font-normal text-xs ml-1">{day.tempLow}°C</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Weather Trends Charts (Requirement 1.A) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Temperature Trend Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#063F2F] font-sora flex items-center gap-2 text-base">
                  <Thermometer className="w-5 h-5 text-amber-500" /> Temperature Trend (°C)
                </h3>
                <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full">Peak: 36°C</span>
              </div>
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-[#FAFCF7] rounded-2xl border border-[#F0FAEE]">
                {forecast7Days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-[#063F2F]">{d.tempHigh}°</span>
                    <div 
                      className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${(d.tempHigh / 40) * 100}%` }}
                    />
                    <span className="text-[10px] text-[#789187] font-medium">{d.day.split(',')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rainfall & Probability Trend Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#063F2F] font-sora flex items-center gap-2 text-base">
                  <CloudRain className="w-5 h-5 text-blue-500" /> Rain Probability & Rainfall Trend
                </h3>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">Max: 85% Chance</span>
              </div>
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-[#FAFCF7] rounded-2xl border border-[#F0FAEE]">
                {forecast7Days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-blue-600">{d.rainProb}%</span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-400 to-sky-500 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${Math.max(d.rainProb, 10)}%` }}
                    />
                    <span className="text-[10px] text-[#789187] font-medium">{d.day.split(',')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Weather Alerts & Actionable Intelligence (Requirement 1.A & 1.B) ── */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#D5E8D5]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#063F2F] font-sora flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#087A4B]" /> Actionable Weather Alerts & Field Intelligence
                </h3>
                <p className="text-xs text-[#789187]">Automated risk assessments tailored to your {selectedCrop} crop</p>
              </div>
              <span className="bg-[#E8F6E6] text-[#087A4B] px-3 py-1 rounded-full text-xs font-bold">5 Active Advisories</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advice.weatherAlerts.map((alert, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#FAFCF7] border border-[#D5E8D5] flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{alert.icon}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8F6E6] text-[#087A4B]">
                        {alert.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#063F2F] text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-[#55665C] leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

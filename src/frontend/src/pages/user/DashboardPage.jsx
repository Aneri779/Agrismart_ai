import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { 
  ArrowRight, Droplet, Leaf, MessageSquare, History, 
  LayoutDashboard, ScanSearch, Send, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { historyApi } from '../../api/history.api';
import apiClient from '../../api/client';
import { weatherService } from '../../services/weatherService';
import { irrigationService } from '../../services/irrigationService';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState('');

  const [dashboardData, setDashboardData] = useState({
    lastScan: null,
    sustainability: null,
    irrigation: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all three data points concurrently
        const [history, sustain, weather] = await Promise.all([
          historyApi.getScans().catch(() => []),
          apiClient.get('/farmer/sustainability').catch(() => null),
          weatherService.getCurrentWeather(user?.location || 'Ahmedabad, Gujarat').catch(() => null)
        ]);

        const latestScan = history && history.length > 0 ? history[0] : null;
        
        let irrigation = null;
        if (weather) {
          irrigation = await irrigationService.getRecommendation(
            weather, 
            'medium', 
            latestScan?.crop || user?.cropType || 'Tomato'
          ).catch(() => null);
        }

        setDashboardData({
          lastScan: latestScan,
          sustainability: sustain,
          irrigation: {
            ...irrigation,
            weather
          }
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    if(chatInput.trim()) {
      navigate(`/assistant?q=${encodeURIComponent(chatInput)}`);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* ── Hero Card ── */}
          <div className="relative w-full h-[240px] rounded-2xl overflow-hidden shadow-sm border border-[#D5E8D5]">
            <img 
              src="/hero_farmer.jpg" 
              alt="Farmer in field" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#063F2F]/90 to-[#063F2F]/20" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-2 font-sora">Scan a New Leaf</h2>
              <p className="text-[#DDF1DD] mb-6 max-w-md">Get instant disease detection and crop health insights.</p>
              <button 
                onClick={() => navigate('/scan')}
                className="bg-[#35A866] hover:bg-[#087A4B] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 w-fit transition-colors shadow-lg"
              >
                Scan Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Quick Stats Grid ── */}
          {loading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-[#087A4B]" />
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Last Scan Card */}
              <div 
                onClick={() => dashboardData.lastScan ? navigate(`/results/${dashboardData.lastScan.id}`) : navigate('/scan')}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5E8D5] cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ScanSearch className="w-5 h-5 text-[#087A4B]" />
                  <h3 className="font-semibold text-[#183F34]">Last Scan</h3>
                </div>
                {dashboardData.lastScan ? (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {dashboardData.lastScan.imageUrl ? (
                           <img src={dashboardData.lastScan.imageUrl} alt={dashboardData.lastScan.crop} className="w-full h-full object-cover" />
                        ) : (
                           <Leaf className="w-8 h-8 m-4 text-[#A0B8AD]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#063F2F] text-lg leading-tight">{dashboardData.lastScan.crop}</p>
                        <p className="text-[#183F34] font-medium text-sm">{dashboardData.lastScan.disease}</p>
                        <p className="text-[#789187] text-xs mt-1">
                          {new Date(dashboardData.lastScan.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#F3FAEF] flex items-center justify-between">
                      {dashboardData.lastScan.status === 'Healthy' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wide uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Crop
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold tracking-wide uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" /> Disease Detected
                        </span>
                      )}
                      <span className="text-[#087A4B] text-sm font-semibold group-hover:underline">View Result &rarr;</span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-[#789187] text-sm">No scans found.</p>
                    <span className="text-[#087A4B] text-sm font-semibold mt-2 group-hover:underline">Scan your first crop &rarr;</span>
                  </div>
                )}
              </div>

              {/* Sustainability Score */}
              <div 
                onClick={() => navigate('/sustainability')}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5E8D5] cursor-pointer hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-[#087A4B]" />
                  <h3 className="font-semibold text-[#183F34]">Sustainability Score</h3>
                </div>
                <div className="flex items-center gap-6 justify-center flex-1">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F3FAEF" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke={dashboardData.sustainability?.score >= 70 ? '#35A866' : dashboardData.sustainability?.score >= 50 ? '#F59E0B' : '#EF4444'} 
                        strokeWidth="8" strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * (dashboardData.sustainability?.score || 50)) / 100} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#063F2F] font-sora">{dashboardData.sustainability?.score || 50}</span>
                      <span className="text-[10px] text-[#789187]">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${dashboardData.sustainability?.score >= 50 ? 'text-[#087A4B]' : 'text-amber-600'}`}>
                      {getScoreLabel(dashboardData.sustainability?.score || 50)} <span className="text-lg">↗</span>
                    </p>
                    <p className="text-[#789187] text-xs mt-1">Based on recent scans</p>
                  </div>
                </div>
              </div>

              {/* Weather + Irrigation Intelligence Widget */}
              <div 
                onClick={() => navigate('/irrigation')}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5E8D5] cursor-pointer hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-[#183F34]">Smart Irrigation Intelligence</h3>
                  </div>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Weather Integrated</span>
                </div>
                {dashboardData.irrigation?.weather ? (
                  <>
                    <div className="flex-1 flex flex-col justify-center my-2">
                      <p className="text-xl font-bold text-[#063F2F] font-sora mb-1.5">{dashboardData.irrigation.title}</p>
                      <div className="bg-[#EEF7EA] text-[#087A4B] px-3 py-2 rounded-xl text-xs border border-[#D5E8D5] font-medium leading-tight">
                        Moisture: <span className="font-bold">38%</span> • Rain Expected: <span className="font-bold">{dashboardData.irrigation.weather.rainProbability}% chance</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#F3FAEF] flex items-center justify-between text-xs">
                      <span className="text-[#789187] truncate mr-2">{dashboardData.irrigation.reason}</span>
                      <span className="text-[#087A4B] font-semibold group-hover:underline whitespace-nowrap">View Advisor &rarr;</span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-[#789187]">
                    Loading intelligence...
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── AI Assistant & Shortcuts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            
            {/* Assistant Preview */}
            <div className="bg-[#063F2F] rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#087A4B] opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg p-2">
                  <MessageSquare className="w-7 h-7 text-[#087A4B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 font-sora">Continue where you left off</h3>
                  <p className="text-[#B7E6C4] text-sm">Ask about your tomato crop, weather or irrigation needs...</p>
                </div>
              </div>

              <form onSubmit={handleAssistantSubmit} className="relative z-10 mt-6 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..." 
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 px-5 py-3.5 rounded-xl focus:outline-none focus:bg-white/20 transition-colors"
                />
                <button type="submit" className="bg-[#35A866] hover:bg-[#0A8F55] text-white px-5 rounded-xl flex items-center justify-center transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Quick Shortcuts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5E8D5]">
              <h3 className="font-bold text-[#183F34] mb-4">Quick Shortcuts</h3>
              <div className="space-y-3">
                <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F3FAEF] border border-transparent hover:border-[#D5E8D5] transition-colors text-left text-[#123D31] font-medium text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F6E6] flex items-center justify-center text-[#087A4B]"><LayoutDashboard className="w-4 h-4" /></div>
                  Dashboard
                </button>
                <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F3FAEF] border border-transparent hover:border-[#D5E8D5] transition-colors text-left text-[#123D31] font-medium text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F6E6] flex items-center justify-center text-[#087A4B]"><History className="w-4 h-4" /></div>
                  History
                </button>
                <button onClick={() => navigate('/sustainability')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F3FAEF] border border-transparent hover:border-[#D5E8D5] transition-colors text-left text-[#123D31] font-medium text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F6E6] flex items-center justify-center text-[#087A4B]"><Leaf className="w-4 h-4" /></div>
                  Sustainability
                </button>
                <button onClick={() => navigate('/assistant')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F3FAEF] border border-transparent hover:border-[#D5E8D5] transition-colors text-left text-[#123D31] font-medium text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F6E6] flex items-center justify-center text-[#087A4B]"><MessageSquare className="w-4 h-4" /></div>
                  AI Assistant
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};


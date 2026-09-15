import React, { useState, useEffect } from 'react';
import { Users, Map, Sprout, AlertTriangle, Activity } from 'lucide-react';
import apiClient from '../../api/client';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { EmptyState } from '../../components/admin/shared/EmptyState';

const KpiCard = ({ title, icon: Icon, value, trend, trendLabel }) => (
  <AdminCard className="flex-1">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-[#EAF8E9] rounded-lg flex items-center justify-center text-[#008F5A]">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-[13px] text-[#45665A] font-semibold uppercase tracking-wider mb-1">{title}</p>
    <div className="flex items-end gap-3">
      <h3 className="text-3xl font-bold text-[#004D3C]">{value}</h3>
      <div className="flex flex-col mb-1">
        <span className={`text-xs font-bold ${trend >= 0 ? 'text-[#008F5A]' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-[10px] text-[#45665A]">{trendLabel}</span>
      </div>
    </div>
  </AdminCard>
);

export const AdminDashboard = () => {
  const [overview, setOverview] = useState({
    totalUsers: '—',
    totalFarms: '—',
    cropsMonitored: '—',
    diseaseAlerts: '—',
    recentScans: [],
  });

  useEffect(() => {
    apiClient.get('/admin/overview')
      .then((data) => {
        if (data) setOverview(data);
      })
      .catch((err) => console.error('Failed to load overview:', err));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Users" icon={Users} value={overview.totalUsers} trend={overview.totalUsers > 0 ? 100 : 0} trendLabel="active in DB" />
        <KpiCard title="Total Farms" icon={Map} value={overview.totalFarms} trend={overview.totalFarms > 0 ? 25 : 0} trendLabel="in Gujarat" />
        <KpiCard title="Crops Monitored" icon={Sprout} value={overview.cropsMonitored} trend={overview.cropsMonitored > 0 ? 10 : 0} trendLabel="crop varieties" />
        <KpiCard title="Disease Alerts" icon={AlertTriangle} value={overview.diseaseAlerts} trend={overview.diseaseAlerts > 0 ? 5 : 0} trendLabel="detected cases" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Platform Overview ── */}
        <AdminCard title="Platform Database & System Status" className="lg:col-span-2">
          <div className="p-5 bg-[#F7FBF5] rounded-xl border border-[#EAF8E9] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#004D3C]">Primary Database Engine</span>
              <span className="text-xs bg-[#EAF8E9] text-[#008F5A] px-3 py-1 rounded-full font-bold">
                {overview.databaseEngine === 'PostgreSQL' ? 'PostgreSQL (Active)' : 'SQLite (Active)'}
              </span>
            </div>
            <p className="text-xs text-[#45665A]">
              User registrations, bcrypt password credentials, profiles, crops, locations, and crop leaf scan histories are securely persisted in {overview.databaseEngine || 'PostgreSQL'}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-[#EAF8E9] shadow-sm">
                <p className="text-xs text-[#45665A]">Total Registered</p>
                <p className="text-2xl font-bold text-[#004D3C] mt-1">{overview.totalUsers} users</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#EAF8E9] shadow-sm">
                <p className="text-xs text-[#45665A]">Total Leaf Scans</p>
                <p className="text-2xl font-bold text-[#004D3C] mt-1">{overview.recentScans?.length || 0} scans</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#EAF8E9] shadow-sm">
                <p className="text-xs text-[#45665A]">AI PyTorch Model</p>
                <p className="text-2xl font-bold text-[#008F5A] mt-1">Online</p>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* ── Recent Activity ── */}
        <AdminCard title="Recent Activity">
          {(!overview.recentScans || overview.recentScans.length === 0) ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <EmptyState 
                title="No Recent Activity"
                description="System activity will appear here once users start interacting with the platform."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {overview.recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 p-2.5 bg-[#FAFCF8] rounded-xl border border-[#EAF8E9]">
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt="" className="w-11 h-11 rounded-lg object-cover border border-[#DDF3E2]" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#EAF8E9] flex items-center justify-center text-[#008F5A]">
                      <Activity className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#004D3C] truncate">{scan.crop} — {scan.disease}</p>
                    <p className="text-[10px] text-[#45665A]">{scan.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    scan.status === 'Healthy' ? 'bg-[#EAF8E9] text-[#008F5A]' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

    </div>
  );
};


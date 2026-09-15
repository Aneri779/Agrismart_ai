import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const AdminTopbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const getHeaderContent = () => {
    const path = location.pathname;
    
    if (path.includes('dashboard')) return {
      title: 'Welcome back, Admin',
      subtitle: 'Here\'s what\'s happening with your AgriSmart AI platform today.'
    };
    if (path.includes('users')) return {
      title: 'User Management',
      subtitle: 'Manage farmers, view details, and track activity.'
    };
    if (path.includes('crops')) return {
      title: 'Crop Management',
      subtitle: 'Manage crops, varieties, and monitor cultivation data.'
    };
    if (path.includes('weather')) return {
      title: 'Weather Analytics',
      subtitle: 'Live weather, forecast and climate insights for better decisions.'
    };
    if (path.includes('irrigation')) return {
      title: 'Irrigation System',
      subtitle: 'Get smart irrigation recommendations based on crop, soil and weather.'
    };
    if (path.includes('reports')) return {
      title: 'Reports & Analytics',
      subtitle: 'View detailed reports and insights for better decision-making.'
    };
    if (path.includes('alerts')) return {
      title: 'Alerts & Notifications',
      subtitle: 'Stay updated with important alerts and system notifications.'
    };
    if (path.includes('logs')) return {
      title: 'System Logs',
      subtitle: 'Track system activities, errors and user actions.'
    };
    if (path.includes('settings')) return {
      title: 'Settings',
      subtitle: 'Manage your platform settings and preferences.'
    };
    return { title: 'Admin Dashboard', subtitle: '' };
  };

  const header = getHeaderContent();

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <header className="h-[90px] bg-white flex items-center justify-between px-8 sticky top-0 z-30 shrink-0 border-b border-[#EAF8E9]">
      
      {/* ── Title Area ── */}
      <div>
        <h1 className="text-[24px] font-bold text-[#004D3C] tracking-tight font-sora">{header.title}</h1>
        {header.subtitle && (
          <p className="text-[13px] text-[#45665A] mt-1">{header.subtitle}</p>
        )}
      </div>

      {/* ── Actions Area ── */}
      <div className="flex items-center gap-6">
        
        {/* Search */}
        <div className="hidden md:flex items-center bg-[#F7FBF5] border border-[#EAF8E9] rounded-full px-4 py-2 w-64 focus-within:border-[#008F5A] focus-within:bg-white transition-colors shadow-sm">
          <Search className="w-4 h-4 text-[#008F5A] mr-2" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-[13px] text-[#004D3C] w-full placeholder-[#008F5A]/50"
          />
        </div>

        {/* Date / Time */}
        <div className="hidden lg:flex items-center gap-2 text-[12px] text-[#45665A] font-medium bg-[#FAFCF8] px-3 py-1.5 rounded-full border border-[#EAF8E9]">
          <span className="w-2 h-2 rounded-full bg-[#008F5A]"></span>
          <span>{formattedDate}</span>
        </div>

        {/* Notification */}
        <Link to="/admin/alerts" className="relative p-2 text-[#008F5A] hover:bg-[#EAF8E9] rounded-full transition-colors block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-[#EAF8E9] pl-6 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-[#008F5A] overflow-hidden border-2 border-[#DDF3E2]">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=008F5A&color=fff`} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-[#004D3C] group-hover:text-[#008F5A] transition-colors">{user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

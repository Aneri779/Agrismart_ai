import React from 'react';
import { MapPin, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getHeaderContent = () => {
    const path = location.pathname;
    const fullName = user?.name || 'User';
    
    if (path.includes('dashboard')) return {
      title: `Good Morning, ${fullName} 👋`,
      subtitle: 'Healthy crops. Happy farmers. Sustainable tomorrow.'
    };
    if (path.includes('scan')) return {
      title: 'Scan Your Crop',
      subtitle: 'Upload a photo of the affected leaf or crop and let AI do the rest.'
    };
    if (path.includes('history')) return {
      title: 'Scan History',
      subtitle: 'View and manage your past scans and results.'
    };
    if (path.includes('assistant')) return {
      title: 'AI Farmer Assistant',
      subtitle: 'Ask anything about your crops, diseases, weather or farming tips.'
    };
    if (path.includes('sustainability')) return {
      title: 'Sustainability Score',
      subtitle: 'A greener farm is a stronger farm.'
    };
    if (path.includes('settings')) return {
      title: 'My Farm Profile',
      subtitle: 'Manage your farm details and preferences.'
    };
    if (path.includes('about')) return {
      title: 'About AgriSmart AI',
      subtitle: 'Transparent AI. Reliable results. For a better tomorrow.'
    };
    if (path.includes('results')) return {
      title: 'Scan Results',
      subtitle: '',
      back: true
    };
    return { title: 'Dashboard', subtitle: '' };
  };

  const header = getHeaderContent();

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <header className="h-[90px] bg-[#FAFCF7] flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        {header.back && (
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#45665A] hover:text-[#063F2F] font-medium transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}
        {!header.back && (
          <div>
            <h1 className="text-[28px] font-bold text-[#063F2F] tracking-tight font-sora">{header.title}</h1>
            {header.subtitle && (
              <p className="text-[13px] text-[#45665A] mt-0.5">{header.subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-[13px] text-[#45665A] font-medium mr-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#087A4B]" />
            <span>{user?.location || 'Location Not Set'}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#D5E8D5] pl-6">
            <span className="w-2 h-2 rounded-full bg-[#087A4B]"></span>
            <span>{formattedDate}</span>
          </div>
        </div>



        <div className="w-10 h-10 rounded-full bg-[#087A4B] overflow-hidden border-2 border-[#D5E8D5]">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=087A4B&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

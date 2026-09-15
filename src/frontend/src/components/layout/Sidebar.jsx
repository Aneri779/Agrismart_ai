import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Scan, FileText, LayoutDashboard, History, MessageSquare, 
  LeafyGreen, Info, UserCircle, LogOut, CloudSun, Droplet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../shared/ConfirmModal';
import { useState } from 'react';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Weather Analysis', icon: CloudSun, path: '/weather' },
    { name: 'Irrigation Analysis', icon: Droplet, path: '/irrigation' },
    { name: 'Scan Crop', icon: Scan, path: '/scan' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/assistant' },
    { name: 'Sustainability', icon: LeafyGreen, path: '/sustainability' },
    { name: 'My Profile', icon: UserCircle, path: '/settings' },
  ];

  return (
    <div className="w-[245px] flex-shrink-0 flex flex-col h-screen sticky top-0" style={{ background: '#063F2F' }}>
      
      {/* ── Logo ── */}
      <div className="p-6 flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#087A4B" />
          <path d="M20 8C20 8 10 14 10 22C10 27.52 14.48 32 20 32C25.52 32 30 27.52 30 22C30 14 20 8 20 8Z" fill="#4CAF63" />
          <path d="M20 32V20M20 20L15 16M20 20L25 16" stroke="#B7E6C4" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2" fill="#DCF3E3" />
        </svg>
        <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
          AgriSmart <span style={{ color: '#86EFAC' }}>AI</span>
        </span>
      </div>


      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Determine if active. Special rule: /results matches /results/...
          const isActive = item.path === '/dashboard' 
            ? location.pathname === '/dashboard' 
            : location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#087A4B] text-white shadow-md' 
                  : 'text-[#DDF1DD]/70 hover:bg-[#087A4B]/40 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DDF1DD]/70 group-hover:text-white'}`} />
              <span className="text-[13px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Actions ── */}
      <div className="p-4 border-t border-[#149B5C]/30 space-y-1">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full transition-colors group"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[13px] font-medium">Log Out</span>
        </button>
      </div>

      {/* ── Botanical Leaf Cluster ── */}
      <div className="relative h-28 flex-shrink-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 245 112" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 left-0 w-full h-full">
          {/* Back large leaf */}
          <path d="M40 112 C40 112 0 80 0 50 C0 25 18 8 40 8 C62 8 80 25 80 50 C80 80 40 112 40 112Z"
            fill="#4CAF63" opacity="0.10"/>
          <path d="M40 112 L40 50" stroke="#87C99A" strokeWidth="1.2" opacity="0.15"/>
          <path d="M40 80 L20 60 M40 80 L60 60" stroke="#87C99A" strokeWidth="0.8" opacity="0.12"/>
          {/* Center leaf */}
          <path d="M110 112 C110 112 75 85 75 58 C75 36 90 20 110 20 C130 20 145 36 145 58 C145 85 110 112 110 112Z"
            fill="#2E8B4F" opacity="0.13"/>
          <path d="M110 112 L110 55" stroke="#6BBF82" strokeWidth="1.5" opacity="0.18"/>
          <path d="M110 85 L88 65 M110 85 L132 65" stroke="#6BBF82" strokeWidth="0.9" opacity="0.13"/>
          <path d="M110 65 L94 50 M110 65 L126 50" stroke="#6BBF82" strokeWidth="0.7" opacity="0.1"/>
          {/* Right leaf */}
          <path d="M185 112 C185 112 155 90 155 68 C155 48 168 35 185 35 C202 35 215 48 215 68 C215 90 185 112 185 112Z"
            fill="#149B5C" opacity="0.09"/>
          <path d="M185 112 L185 65" stroke="#7DD09A" strokeWidth="1" opacity="0.13"/>
          {/* Far right small leaf */}
          <path d="M235 112 C235 112 215 98 215 84 C215 73 223 65 235 65 C247 65 255 73 255 84 C255 98 235 112 235 112Z"
            fill="#4CAF63" opacity="0.07"/>
        </svg>
      </div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

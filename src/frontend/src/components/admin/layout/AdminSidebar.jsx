import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Sprout, CloudRain, Droplet, 
  BarChart3, Bell, ScrollText, Settings, LogOut 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ConfirmModal } from '../../shared/ConfirmModal';
import { useState } from 'react';

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Crop Management', icon: Sprout, path: '/admin/crops' },
    { name: 'Weather Analytics', icon: CloudRain, path: '/admin/weather' },
    { name: 'Irrigation System', icon: Droplet, path: '/admin/irrigation' },
    { name: 'Reports & Analytics', icon: BarChart3, path: '/admin/reports' },
    { name: 'Alerts & Notifications', icon: Bell, path: '/admin/alerts' },
    { name: 'System Logs', icon: ScrollText, path: '/admin/logs' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col h-screen sticky top-0" style={{ background: '#004D3C' }}>
      
      {/* ── Logo ── */}
      <div className="p-6 flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#087A4B" />
          <path d="M20 8C20 8 10 14 10 22C10 27.52 14.48 32 20 32C25.52 32 30 27.52 30 22C30 14 20 8 20 8Z" fill="#4CAF63" />
          <path d="M20 32V20M20 20L15 16M20 20L25 16" stroke="#B7E6C4" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2" fill="#DCF3E3" />
        </svg>
        <div>
          <span className="block font-bold text-lg tracking-tight text-white leading-tight font-sora">
            AgriSmart AI
          </span>
          <span className="block text-[11px] text-[#DDF3E2]/80 uppercase tracking-wider font-semibold">
            Admin Panel
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#008F5A] text-white shadow-md' 
                  : 'text-[#DDF3E2]/70 hover:bg-[#005B45] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DDF3E2]/70 group-hover:text-white'}`} />
              <span className="text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Admin Profile & Logout ── */}
      <div className="p-4 border-t border-[#005B45]">
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
        <svg viewBox="0 0 260 112" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 left-0 w-full h-full">
          <path d="M45 112 C45 112 5 80 5 50 C5 25 23 8 45 8 C67 8 85 25 85 50 C85 80 45 112 45 112Z"
            fill="#4CAF63" opacity="0.12"/>
          <path d="M45 112 L45 50" stroke="#87C99A" strokeWidth="1.2" opacity="0.18"/>
          <path d="M45 82 L25 62 M45 82 L65 62" stroke="#87C99A" strokeWidth="0.8" opacity="0.14"/>
          <path d="M120 112 C120 112 82 83 82 56 C82 33 98 18 120 18 C142 18 158 33 158 56 C158 83 120 112 120 112Z"
            fill="#2E8B4F" opacity="0.15"/>
          <path d="M120 112 L120 54" stroke="#6BBF82" strokeWidth="1.6" opacity="0.20"/>
          <path d="M120 86 L98 66 M120 86 L142 66" stroke="#6BBF82" strokeWidth="1" opacity="0.15"/>
          <path d="M120 66 L104 52 M120 66 L136 52" stroke="#6BBF82" strokeWidth="0.8" opacity="0.12"/>
          <path d="M198 112 C198 112 165 88 165 64 C165 44 178 30 198 30 C218 30 231 44 231 64 C231 88 198 112 198 112Z"
            fill="#149B5C" opacity="0.11"/>
          <path d="M198 112 L198 62" stroke="#7DD09A" strokeWidth="1.1" opacity="0.16"/>
          <path d="M248 112 C248 112 228 97 228 82 C228 70 237 62 248 62 C259 62 268 70 268 82 C268 97 248 112 248 112Z"
            fill="#4CAF63" opacity="0.08"/>
        </svg>
      </div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

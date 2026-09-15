import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF8] text-[#004D3C] font-sans">
      
      {/* ── Sidebar ── */}
      <AdminSidebar />
      
      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        
        {/* ── Topbar ── */}
        <AdminTopbar />
        
        {/* ── Page Content ── */}
        <main className="p-8 w-full">
          <Outlet />
        </main>
        
      </div>
      
    </div>
  );
};

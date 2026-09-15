import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Cloud, HardDrive, Save, Camera } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { EmptyState } from '../../components/admin/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('General Settings');
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin',
    email: user?.email || 'admin@agrismart.ai',
    password: '',
    avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=008F5A&color=fff`
  });

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar
    });
    alert('Settings saved successfully!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: url });
    }
  };

  const tabs = [
    { name: 'General Settings', icon: Settings },
    { name: 'Security', icon: Shield },
    { name: 'Notification Settings', icon: Bell },
    { name: 'Database', icon: Database },
    { name: 'API Integration', icon: Cloud },
    { name: 'Backup & Restore', icon: HardDrive }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
      
      {/* ── Settings Navigation ── */}
      <div className="space-y-1">
        {tabs.map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left text-[13px] ${
              activeTab === tab.name 
                ? 'bg-[#008F5A] text-white shadow-md' 
                : 'text-[#45665A] hover:bg-[#EAF8E9] hover:text-[#008F5A]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.name}
          </button>
        ))}
      </div>

      {/* ── Settings Content ── */}
      <AdminCard title={activeTab} className="min-h-[500px]">
        
        {activeTab === 'General Settings' && (
          <div className="space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-20 h-20 rounded-full border-4 border-[#EAF8E9] overflow-hidden bg-gray-100 group">
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Edit Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#004D3C]">Profile Photo</h3>
                <p className="text-xs text-[#45665A] mt-1">Upload a new photo to update your avatar.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#183F34] mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-[#004D3C] focus:outline-none focus:border-[#008F5A]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#183F34] mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-[#004D3C] focus:outline-none focus:border-[#008F5A]" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#183F34] mb-1.5">Change Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password (leave blank to keep current)"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 text-[#004D3C] focus:outline-none focus:border-[#008F5A]" 
                />
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#EAF8E9] flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-[#008F5A] hover:bg-[#006B4F] font-semibold transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Database' && (
          <div className="flex-1 flex flex-col justify-center py-12">
            <EmptyState 
              icon={Database}
              title="Database connection is not configured."
              description="A remote database cluster is required to persist users, crops, and telemetry data securely."
              action={<button className="mt-4 px-6 py-2 bg-[#008F5A] text-white rounded-lg font-bold">Configure Cluster</button>}
            />
          </div>
        )}

        {activeTab === 'API Integration' && (
          <div className="flex-1 flex flex-col justify-center py-12">
            <EmptyState 
              icon={Cloud}
              title="API Integration"
              description="API connection will be configured when a backend service is connected. Currently operating in frontend-only mode."
            />
          </div>
        )}

        {activeTab !== 'General Settings' && activeTab !== 'Database' && activeTab !== 'API Integration' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#789187]">
            <p>This configuration panel will be activated soon.</p>
          </div>
        )}

      </AdminCard>
    </div>
  );
};

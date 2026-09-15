import React from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { useAuth } from '../../context/AuthContext';
import { Save, User, MapPin, Map, Sprout, Bell, Shield, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmName: user?.farmName || (user?.name ? `${user.name.split(' ')[0]}'s Farm` : ""),
    location: user?.location || '',
    totalArea: user?.totalArea || '',
    soilType: user?.soilType || '',
    avatar: user?.avatar || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUser(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
            
            {/* Sidebar Navigation inside settings */}
            <div className="space-y-2">
              {[
                { name: 'Personal Details', icon: User },
                { name: 'Farm Information', icon: MapPin },
                { name: 'Crops & Preferences', icon: Sprout },
                { name: 'Notifications', icon: Bell },
                { name: 'Privacy & Security', icon: Shield }
              ].map(tab => (
                <button 
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium shadow-sm transition-colors text-left text-sm ${
                    activeTab === tab.name 
                      ? 'bg-[#087A4B] text-white' 
                      : 'text-[#45665A] hover:bg-[#F3FAEF] hover:text-[#087A4B] bg-transparent shadow-none'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.name}
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-[#D5E8D5]">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-left text-sm">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5] flex flex-col">
              
              {activeTab === 'Personal Details' && (
                <>
                  <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-1">Personal Details</h2>
                  <p className="text-[#789187] text-sm mb-8">Update your personal information and profile picture.</p>

                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#F3FAEF]">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#E8F6E6] flex items-center justify-center text-[#087A4B] overflow-hidden border-2 border-[#D5E8D5]">
                        <img 
                          src={formData.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=087A4B&color=fff&size=128`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-[#087A4B] text-white rounded-full flex items-center justify-center hover:bg-[#064D38] transition-colors border-2 border-white shadow-sm"
                        title="Change Picture"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Role</label>
                      <input type="text" value="Farmer" disabled className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#789187] focus:outline-none cursor-not-allowed" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Farm Information' && (
                <>
                  <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-1">Farm Details</h2>
                  <p className="text-[#789187] text-sm mb-6">Manage your primary farm location.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Farm Name</label>
                      <input type="text" name="farmName" value={formData.farmName} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Total Farm Area (Acres)</label>
                      <input type="number" name="totalArea" value={formData.totalArea} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#183F34] mb-1.5">Default Soil Type</label>
                      <select name="soilType" value={formData.soilType} onChange={handleInputChange} className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-4 py-2.5 text-[#123D31] focus:outline-none focus:border-[#087A4B]">
                        <option>Loamy Soil</option>
                        <option>Clay</option>
                        <option>Sandy</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab !== 'Personal Details' && activeTab !== 'Farm Information' && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#789187]">
                  <h3 className="text-lg font-bold text-[#183F34] mb-2">{activeTab}</h3>
                  <p>This section is under construction.</p>
                </div>
              )}

              <div className="pt-6 border-t border-[#F3FAEF] flex items-center justify-between mt-auto">
                {saveSuccess ? (
                  <span className="text-[#35A866] font-bold text-sm bg-[#E8F6E6] px-4 py-2 rounded-lg">Profile updated successfully!</span>
                ) : <span />}
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-[#087A4B] hover:bg-[#064D38] font-semibold transition-colors">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

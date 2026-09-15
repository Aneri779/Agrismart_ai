import React, { useState, useEffect } from 'react';
import { Search, Plus, Sprout, Trash2 } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import { EmptyState } from '../../components/admin/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'agrismart_crops';

const AddCropModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', variety: '', area: '', status: 'Growing', health: 'Good'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#004D3C]/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-[#004D3C] mb-6 font-sora">Add New Crop</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Crop Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Variety</label>
              <input type="text" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Area (Hectares)</label>
              <input type="number" step="0.1" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]">
                <option>Growing</option>
                <option>Harvested</option>
                <option>Planted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Health</label>
              <select value={formData.health} onChange={e => setFormData({...formData, health: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]">
                <option>Good</option>
                <option>Moderate</option>
                <option>Poor</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#45665A] bg-[#FAFCF8] border border-[#EAF8E9] hover:bg-[#F1FAEF]">Cancel</button>
          <button onClick={() => { onSave(formData); onClose(); }} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F]">Add Crop</button>
        </div>
      </motion.div>
    </div>
  );
};

export const CropManagement = () => {
  const [crops, setCrops] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
  }, [crops]);

  const addCrop = (c) => setCrops(prev => [{ ...c, id: Date.now() }, ...prev]);
  const deleteCrop = (id) => setCrops(prev => prev.filter(c => c.id !== id));

  const filtered = crops.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.variety?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* ── Controls ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 w-full md:w-80 shadow-sm focus-within:border-[#008F5A]">
          <Search className="w-4 h-4 text-[#008F5A] mr-2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop or variety..." className="bg-transparent border-none outline-none text-[13px] text-[#004D3C] w-full" />
        </div>
        <div className="flex gap-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            <option>All</option>
            <option>Growing</option>
            <option>Harvested</option>
            <option>Planted</option>
          </select>
          <button onClick={() => setModalOpen(true)} className="bg-[#008F5A] hover:bg-[#006B4F] text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Add Crop
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <AdminCard>
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Sprout}
            title={crops.length === 0 ? 'No crop records available.' : 'No crops match your filters.'}
            description={crops.length === 0 ? 'Add your first crop record to start monitoring.' : 'Try adjusting your search.'}
            action={crops.length === 0 ? <button onClick={() => setModalOpen(true)} className="text-[#008F5A] font-bold hover:underline">Add Crop</button> : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAF8E9] text-[12px] uppercase tracking-wider text-[#45665A]">
                  <th className="py-4 px-4 font-semibold">Crop Name</th>
                  <th className="py-4 px-4 font-semibold">Variety</th>
                  <th className="py-4 px-4 font-semibold">Area (Hectares)</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Health</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-[#F7FBF5] hover:bg-[#FAFCF8] transition-colors">
                    <td className="py-4 px-4 text-[14px] font-bold text-[#004D3C]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF8E9] flex items-center justify-center text-[#008F5A] flex-shrink-0">
                          <Sprout className="w-4 h-4"/>
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#45665A]">{c.variety}</td>
                    <td className="py-4 px-4 text-[13px] text-[#45665A]">{c.area}</td>
                    <td className="py-4 px-4 text-[13px] font-medium text-[#008F5A]">{c.status}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        c.health === 'Good' ? 'bg-green-100 text-green-700' :
                        c.health === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                      }`}>{c.health}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => deleteCrop(c.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 px-4 py-2 text-[12px] text-[#789187]">
              Showing {filtered.length} of {crops.length} crops
            </div>
          </div>
        )}
      </AdminCard>

      <AddCropModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={addCrop} />
    </div>
  );
};

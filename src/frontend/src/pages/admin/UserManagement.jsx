import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, MoreVertical, Trash2 } from 'lucide-react';
import { AdminCard } from '../../components/admin/shared/AdminCard';
import apiClient from '../../api/client';
import { EmptyState } from '../../components/admin/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', location: '', role: 'Farmer', status: 'Active'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#004D3C]/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-[#004D3C] mb-6 font-sora">Add New User</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]">
                <option>Farmer</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#183F34] mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#FAFCF8] border border-[#EAF8E9] rounded-xl px-4 py-2.5 outline-none focus:border-[#008F5A]">
                <option>Active</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#45665A] bg-[#FAFCF8] border border-[#EAF8E9] hover:bg-[#F1FAEF]">Cancel</button>
          <button onClick={() => { onSave({...formData}); onClose(); }} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#008F5A] hover:bg-[#006B4F]">Save User</button>
        </div>
      </motion.div>
    </div>
  );
};

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchUsers = () => {
    apiClient.get('/admin/users')
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (u) => {
    try {
      const created = await apiClient.post('/admin/users', u);
      if (created && created.id) {
        setUsers((prev) => [created, ...prev]);
      } else {
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to add user:', e);
      fetchUsers();
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleStatus = (id) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Pending' : 'Active' } : u
      )
    );

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });


  return (
    <div className="space-y-6">
      
      {/* ── Controls ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 w-full md:w-80 shadow-sm focus-within:border-[#008F5A]">
          <Search className="w-4 h-4 text-[#008F5A] mr-2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name, email or phone..." className="bg-transparent border-none outline-none text-[13px] text-[#004D3C] w-full" />
        </div>
        <div className="flex gap-4">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            <option>All Roles</option>
            <option>Farmer</option>
            <option>Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-[#EAF8E9] rounded-full px-4 py-2.5 text-[13px] text-[#45665A] shadow-sm outline-none focus:border-[#008F5A]">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
          <button onClick={() => setModalOpen(true)} className="bg-[#008F5A] hover:bg-[#006B4F] text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <AdminCard>
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Users}
            title={users.length === 0 ? 'No users available yet.' : 'No users match your filters.'}
            description={users.length === 0 ? 'Add your first user to begin managing the platform.' : 'Try adjusting your search or filters.'}
            action={users.length === 0 ? <button onClick={() => setModalOpen(true)} className="text-[#008F5A] font-bold hover:underline">Add User</button> : null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAF8E9] text-[12px] uppercase tracking-wider text-[#45665A]">
                  <th className="py-4 px-4 font-semibold">ID</th>
                  <th className="py-4 px-4 font-semibold">Name</th>
                  <th className="py-4 px-4 font-semibold">Email</th>
                  <th className="py-4 px-4 font-semibold">Phone</th>
                  <th className="py-4 px-4 font-semibold">Location</th>
                  <th className="py-4 px-4 font-semibold">Role</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#F7FBF5] hover:bg-[#FAFCF8] transition-colors">
                    <td className="py-4 px-4 text-[12px] text-[#789187] font-mono">{u.id}</td>
                    <td className="py-4 px-4 text-[14px] font-bold text-[#004D3C]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#DDF3E2] overflow-hidden flex-shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=DDF3E2&color=008F5A`} alt="" />
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] text-[#45665A]">{u.email}</td>
                    <td className="py-4 px-4 text-[13px] text-[#45665A]">{u.phone}</td>
                    <td className="py-4 px-4 text-[13px] text-[#45665A]">{u.location}</td>
                    <td className="py-4 px-4 text-[13px] font-medium text-[#008F5A]">{u.role}</td>
                    <td className="py-4 px-4">
                      <button onClick={() => toggleStatus(u.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          u.status === 'Active' ? 'bg-[#EAF8E9] text-[#008F5A] hover:bg-[#D5EFD5]' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                        }`}>
                        {u.status}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => deleteUser(u.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 px-4 py-2 text-[12px] text-[#789187]">
              Showing {filtered.length} of {users.length} users
            </div>
          </div>
        )}
      </AdminCard>

      <AddUserModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={addUser} />
    </div>
  );
};

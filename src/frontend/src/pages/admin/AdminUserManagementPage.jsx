import React from 'react';
import { motion } from 'framer-motion';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { fadeUp } from '../../lib/motion';

export const AdminUserManagementPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-1">
      {/* Assuming AdminSidebar is exported or we reuse a layout component. For brevity, skipped in this snippet but implied. */}
      <div className="w-64 bg-brand-900 text-surface-2 flex flex-col h-screen sticky top-0 px-4 py-6 border-r border-brand-700">
          <span className="font-sora font-bold text-xl text-surface-0 px-2 mb-6">Admin Panel</span>
          <div className="space-y-2">
            <div className="px-4 py-3 text-surface-2 hover:bg-brand-700 rounded-lg cursor-pointer">Dashboard</div>
            <div className="px-4 py-3 rounded-lg bg-brand-500/20 text-brand-200 border-l-4 border-brand-500 font-medium">User Management</div>
          </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-sora font-bold text-ink-900">User Management</h2>
              <p className="text-ink-600">Manage farmer and admin accounts.</p>
            </div>
            <Button>+ Add User</Button>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-border flex gap-4 bg-surface-0">
                <input type="text" placeholder="Search users..." className="px-4 py-2 bg-surface-1 border border-border rounded-md text-sm focus:outline-none w-64" />
                <select className="px-4 py-2 bg-surface-1 border border-border rounded-md text-sm"><option>All Roles</option></select>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-1 text-ink-600 text-sm border-b border-border">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4].map(i => (
                    <tr key={i} className="border-b border-border hover:bg-surface-1/50 transition-colors">
                      <td className="p-4 font-medium text-ink-900">Ramesh Patel</td>
                      <td className="p-4 text-ink-600">Gujarat, IN</td>
                      <td className="p-4 text-ink-900">Farmer</td>
                      <td className="p-4"><Badge variant="success">Active</Badge></td>
                      <td className="p-4 text-right text-brand-500 font-medium cursor-pointer">Edit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminUserManagementPage;

import React from 'react';
import { motion } from 'framer-motion';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { fadeUp } from '../../lib/motion';

export const AdminCropManagementPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-1">
      {/* AdminSidebar implied */}
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        <main className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-sora font-bold text-ink-900">Crop Management</h2>
              <p className="text-ink-600">Platform-wide crop taxonomy and health aggregates.</p>
            </div>
            <button className="bg-brand-500 text-white px-4 py-2 rounded-md font-medium">+ Add Crop</button>
          </div>
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Card className="p-0 overflow-hidden">
               <div className="p-4 border-b border-border flex gap-4 bg-surface-0">
                <input type="text" placeholder="Search crops..." className="px-4 py-2 bg-surface-1 border border-border rounded-md text-sm w-64 focus:outline-none" />
                <select className="px-4 py-2 bg-surface-1 border border-border rounded-md text-sm"><option>All Status</option></select>
              </div>
              <table className="w-full text-left">
                <thead className="bg-surface-1 border-b border-border">
                  <tr>
                    <th className="p-4 font-medium text-ink-600">Crop Name</th>
                    <th className="p-4 font-medium text-ink-600">Variety</th>
                    <th className="p-4 font-medium text-ink-600">Total Area (ha)</th>
                    <th className="p-4 font-medium text-ink-600">Agg. Health</th>
                    <th className="p-4 font-medium text-ink-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-surface-1/50">
                    <td className="p-4 font-medium">Tomato</td>
                    <td className="p-4 text-ink-600">Roma</td>
                    <td className="p-4 text-ink-600">1,250</td>
                    <td className="p-4"><Badge variant="warning">Moderate</Badge></td>
                    <td className="p-4 text-right text-brand-500 font-medium cursor-pointer">Edit</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
export default AdminCropManagementPage;

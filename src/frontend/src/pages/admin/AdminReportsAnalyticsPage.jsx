import React from 'react';
import { motion } from 'framer-motion';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/shared/Card';
import { fadeUp } from '../../lib/motion';

export const AdminReportsAnalyticsPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-1">
      {/* AdminSidebar implied */}
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        <main className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-sora font-bold text-ink-900">Reports & Analytics</h2>
              <p className="text-ink-600">Deep dive into platform data and disease trends.</p>
            </div>
            <input type="date" className="px-4 py-2 border border-border rounded-md bg-surface-0" />
          </div>

          <div className="flex gap-4 border-b border-border">
            <button className="px-4 py-2 border-b-2 border-brand-500 text-brand-700 font-medium">Crop Report</button>
            <button className="px-4 py-2 text-ink-600 hover:text-ink-900 font-medium">Disease Report</button>
            <button className="px-4 py-2 text-ink-600 hover:text-ink-900 font-medium">Yield Report</button>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center"><p className="text-ink-600">Total Crops</p><p className="text-2xl font-bold text-ink-900">2,450</p></Card>
            <Card className="text-center"><p className="text-ink-600">Diseased</p><p className="text-2xl font-bold text-danger">312</p></Card>
            <Card className="text-center"><p className="text-ink-600">Healthy</p><p className="text-2xl font-bold text-success">2,138</p></Card>
            <Card className="text-center"><p className="text-ink-600">Avg. Yield</p><p className="text-2xl font-bold text-info">+12%</p></Card>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="h-64 flex items-center justify-center bg-surface-0">
               <span className="text-ink-300">Crop Health Distribution Ring Chart</span>
            </Card>
            <Card className="h-64 flex items-center justify-center bg-surface-0">
               <span className="text-ink-300">Top Crops by Yield Bar Chart</span>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
export default AdminReportsAnalyticsPage;

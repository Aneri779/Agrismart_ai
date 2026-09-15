import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/shared/Card';
import { AnimatedCounter } from '../../components/shared/AnimatedCounter';
import { Button } from '../../components/shared/Button';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Users, Droplet, Sprout, ShieldAlert, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminOverviewApi } from '../../api/adminOverview.api';

const AdminSidebar = () => (
  <div className="w-64 bg-brand-900 text-surface-2 flex flex-col h-screen sticky top-0">
    <div className="p-6 flex items-center gap-3">
      <span className="font-sora font-bold text-xl text-surface-0">Admin Panel</span>
    </div>
    <nav className="flex-1 px-4 py-6 space-y-2">
      <Link to="/admin" className="block px-4 py-3 rounded-lg bg-brand-500/20 text-brand-200 border-l-4 border-brand-500 font-medium">Dashboard</Link>
      <Link to="/admin/users" className="block px-4 py-3 text-surface-2 hover:bg-brand-700 rounded-lg cursor-pointer">User Management</Link>
      <Link to="/admin/crops" className="block px-4 py-3 text-surface-2 hover:bg-brand-700 rounded-lg cursor-pointer">Crop Management</Link>
      <Link to="/admin/reports" className="block px-4 py-3 text-surface-2 hover:bg-brand-700 rounded-lg cursor-pointer">Reports & Analytics</Link>
    </nav>
    <div className="p-4 border-t border-brand-700 text-sm text-center">
      <Link to="/" className="text-brand-400 hover:text-brand-300">Exit Admin</Link>
    </div>
  </div>
);

export const AdminOverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await adminOverviewApi.getOverview();
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Unable to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOverview();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-1">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="mb-4">
            <h2 className="text-2xl font-sora font-bold text-ink-900">Platform Overview</h2>
            <p className="text-ink-600">Overall system performance and key metrics.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-ink-600 font-medium">Loading platform metrics...</p>
            </div>
          ) : error ? (
             <div className="p-8 text-center bg-danger/10 text-danger rounded-xl font-medium">
               {error}
               <br/>
               <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-danger text-danger hover:bg-danger/20">Retry</Button>
             </div>
          ) : !data ? (
             <div className="p-8 text-center bg-surface-2 rounded-xl text-ink-600 font-medium">No platform data available.</div>
          ) : (
            <>
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  { label: 'Total Users', val: data.totalUsers || 0, icon: Users, color: 'text-brand-500', bg: 'bg-brand-50' },
                  { label: 'Total Farms', val: data.totalFarms || 0, icon: Sprout, color: 'text-success', bg: 'bg-success/10' },
                  { label: 'Crops Monitored', val: data.cropsMonitored || 0, icon: Droplet, color: 'text-info', bg: 'bg-info/10' },
                  { label: 'System Alerts', val: data.systemAlerts || 0, icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10' }
                ].map((kpi, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="flex items-center gap-4">
                      <div className={`p-4 rounded-full ${kpi.bg}`}>
                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-ink-600 font-medium text-sm">{kpi.label}</p>
                        <AnimatedCounter from={0} to={kpi.val} className="text-2xl font-sora font-bold text-ink-900" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg border-b border-border pb-4">Platform Usage Trend</h3>
                  <div className="h-64 flex items-center justify-center bg-surface-1 border border-dashed border-border rounded-lg">
                    <span className="text-ink-300">Recharts Line Chart (Awaiting actual timeline data)</span>
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="font-semibold text-lg border-b border-border pb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {data.activities?.length > 0 ? data.activities.map((act, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-ink-900">{act.title}</p>
                          <p className="text-ink-600">{act.desc}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-ink-600 text-sm">No recent activity.</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOverviewPage;

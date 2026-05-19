import { useEffect, useState } from 'react';
import api from '../../api/axios';
import gsap from 'gsap';
import UserTable from '../../components/admin/UserTable';
import HiringRegistry from './HiringRegistry'; 
import CategoryManager from './CategoryManager';
import PlatformSettings from './PlatformSettings';
import { Tabs } from 'antd';
import { 
  BarChartOutlined, 
  TeamOutlined, 
  SafetyCertificateOutlined,
  SyncOutlined,
  AppstoreOutlined,
  SettingOutlined
} from '@ant-design/icons';
import {message} from 'antd'

interface DashboardStats {
  total_users: number;
  pending: number;
  approved: number;
  trashed: number;
  workers: number;
  employers: number;
  active_hires: number; // New metric
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState([]);
  const [hires, setHires] = useState([]); // Hiring Registry data
  const [loading, setLoading] = useState(true);

  const fetchHires = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/manage-hires/`);
      const data = res.data.results || res.data;
      setHires(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch hires:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes, hiresRes] = await Promise.all([
        api.get(`/admin/manage-users/stats/`),
        api.get(`/admin/manage-users/`),
        api.get(`/admin/manage-hires/`) // Endpoint for the registry
      ]);
      
      setStats(statsRes.data);
      
      const uData = usersRes.data.results || usersRes.data;
      setUsers(Array.isArray(uData) ? uData : []);
      
      const hData = hiresRes.data.results || hiresRes.data;
      setHires(Array.isArray(hData) ? hData : []);
      
      gsap.from(".stat-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      });
    } catch (err) {
      console.error("Dashboard sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050b14]">
        <SyncOutlined spin className="text-4xl text-cyan-500 mb-4" />
        <div className="text-cyan-500 font-mono tracking-widest animate-pulse">INITIALIZING SYSTEM OVERVIEW...</div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-2 sm:p-6 lg:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400 text-sm sm:text-base">Marketplace health and user verification nexus</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 sm:px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all w-full sm:w-auto text-center"
        >
          SYNC DATABASE
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          title="Active Engagements" 
          value={stats?.active_hires || 0} 
          trend="Live" 
          icon="🤝" 
          color="text-emerald-400" 
        />
        <StatCard 
          title="Pending Review" 
          value={stats?.pending || 0} 
          trend="Action Required" 
          icon="⚖️" 
          color="text-amber-400" 
        />
        <StatCard 
          title="Verified Workers" 
          value={stats?.workers || 0} 
          trend="Market Ready" 
          icon="🛡️" 
          color="text-cyan-400" 
        />
        <StatCard 
          title="Total Employers" 
          value={stats?.employers || 0} 
          trend="Registered" 
          icon="🏢" 
          color="text-purple-400" 
        />
      </div>

      {/* Main Content Tabs */}
      <div className="dashboard-card bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden">
        <Tabs 
          defaultActiveKey="1" 
          className="admin-tabs" 
          tabBarStyle={{ padding: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}
          items={[
            {
              key: '1',
              label: <span className="flex items-center gap-2"><TeamOutlined />Member Directory</span>,
              children: (
                <div className="p-3 sm:p-6 overflow-x-auto">
                  <UserTable users={users} />
                </div>
              ),
            },
            {
              key: '2',
              label: <span className="flex items-center gap-2"><SafetyCertificateOutlined />Hiring Registry</span>,
              children: (
                <div className="p-3 sm:p-6 overflow-x-auto">
                  <HiringRegistry hires={hires} loading={false} refreshData={fetchHires} />
                </div>
              ),
            },
            {
              key: '3',
              label: <span className="flex items-center gap-2"><BarChartOutlined />Platform Alerts</span>,
              children: (
                <div className="p-3 sm:p-6 space-y-4 max-w-2xl">
                  {stats && stats.pending > 0 && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Verification Queue</p>
                          <p className="text-sm text-slate-300 mt-1">{stats.pending} users are awaiting identity verification.</p>
                      </div>
                      <button className="text-xs font-bold text-amber-500 underline">Resolve Now</button>
                    </div>
                  )}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Startup Tip</p>
                      <p className="text-sm text-slate-300 mt-1">Payments are currently handled offline. Use the Hiring Registry to monitor if users are following through with their engagements.</p>
                  </div>
                </div>
              ),
            },
            {
              key: '4',
              label: <span className="flex items-center gap-2"><AppstoreOutlined />Categories</span>,
              children: (
                <div className="p-3 sm:p-6">
                  <CategoryManager />
                </div>
              ),
            },
            {
              key: '5',
              label: <span className="flex items-center gap-2"><SettingOutlined />System Settings</span>,
              children: (
                <div className="p-3 sm:p-10">
                  <PlatformSettings />
                </div>
              ),
            },
          ]}
        />
      </div>

      <style>{`
        .admin-tabs .ant-tabs-nav { overflow-x: auto !important; }
        .admin-tabs .ant-tabs-tab { color: #64748b !important; padding: 12px 0 !important; font-weight: 600 !important; font-size: 11px !important; white-space: nowrap; }
        .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #22d3ee !important; }
        .admin-tabs .ant-tabs-ink-bar { background: #22d3ee !important; }
        @media (min-width: 640px) {
          .admin-tabs .ant-tabs-tab { padding: 16px 0 !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, color }: any) => (
  <div className="stat-card p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-cyan-500/20 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 tracking-tighter ${color}`}>{trend}</span>
    </div>
    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</h4>
    <p className="text-3xl font-bold text-white mt-1 leading-none">{value}</p>
  </div>
);

export default Dashboard;
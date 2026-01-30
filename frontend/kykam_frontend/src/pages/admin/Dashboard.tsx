import { useEffect, useState } from 'react';
import axios from 'axios';
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

const { TabPane } = Tabs;

interface DashboardStats {
  total_users: number;
  pending: number;
  approved: number;
  trashed: number;
  workers: number;
  employers: number;
  active_hires: number; // New metric
}

const API = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState([]);
  const [hires, setHires] = useState([]); // Hiring Registry data
  const [loading, setLoading] = useState(true);

  const fetchHires = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      message.error("Session expired. Please log in again.");
      return;
    }
    const config = {
      headers: { Authorization: `Token ${token}` },
    };
  setLoading(true);
  const res = await axios.get(`'${API}/api/admin/manage-hires/'`, config);
  setHires(res.data);
  setLoading(false);
};

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      
      const [statsRes, usersRes, hiresRes] = await Promise.all([
        axios.get(`${API}/api/admin/manage-users/stats/`, { headers }),
        axios.get(`${API}/api/admin/manage-users/`, { headers }),
        axios.get(`${API}/api/admin/manage-hires/`, { headers }) // Endpoint for the registry
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setHires(hiresRes.data);
      
      gsap.from(".stat-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      });
    } catch (err) {
      console.log("Dashboard sync error:", err);
      
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
    <div className="space-y-8 p-6 lg:p-0">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400">Marketplace health and user verification nexus</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
        >
          SYNC DATABASE
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="dashboard-card bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
        <Tabs defaultActiveKey="1" className="admin-tabs" tabBarStyle={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <TabPane 
            tab={<span className="flex items-center gap-2"><TeamOutlined />Member Directory</span>} 
            key="1"
          >
            <div className="p-6">
               <UserTable users={users} />
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span className="flex items-center gap-2"><SafetyCertificateOutlined />Hiring Registry</span>} 
            key="2"
          >
            <div className="p-6">
              <HiringRegistry hires={hires} loading={false} refreshData={fetchHires} />
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span className="flex items-center gap-2"><BarChartOutlined />Platform Alerts</span>} 
            key="3"
          >
            <div className="p-6 space-y-4 max-w-2xl">
                {stats && stats.pending > 0 && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex justify-between items-center">
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
          </TabPane>
          <TabPane 
            tab={<span className="flex items-center gap-2"><AppstoreOutlined />Categories</span>} 
            key="4"
          >
            <div className="p-6">
              <CategoryManager />
            </div>
          </TabPane>
          <TabPane 
          tab={<span className="flex items-center gap-2"><SettingOutlined />System Settings</span>} 
          key="5"
        >
          <div className="p-10">
            <PlatformSettings />
          </div>
        </TabPane>
        </Tabs>
      </div>

      <style>{`
        .admin-tabs .ant-tabs-tab { color: #64748b !important; padding: 16px 0 !important; font-weight: 600 !important; font-size: 12px !important; }
        .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #22d3ee !important; }
        .admin-tabs .ant-tabs-ink-bar { background: #22d3ee !important; }
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
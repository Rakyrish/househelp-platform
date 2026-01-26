import { useEffect, useState } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import UserTable from '../../components/admin/UserTable';

interface DashboardStats {
  total_users: number;
  pending: number;
  approved: number;
  trashed: number;
  workers: number;
  employers: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        // Fetch stats and user list in parallel
        const [statsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/manage-users/stats/', { headers }),
          axios.get('http://localhost:8000/api/admin/manage-users/', { headers })
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        
        // Trigger Animations
        gsap.from(".stat-card", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out"
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-cyan-500 animate-pulse">Loading System Overview...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">System Overview</h2>
          <p className="text-slate-400">Real-time status of your agency operations</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all">
          DOWNLOAD REPORT
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workers" 
          value={stats?.workers || 0} 
          trend="Active" 
          icon="🏠" 
          color="text-cyan-400" 
        />
        <StatCard 
          title="Pending Review" 
          value={stats?.pending || 0} 
          trend="Urgent" 
          icon="⚖️" 
          color="text-amber-400" 
        />
        <StatCard 
          title="Total Employers" 
          value={stats?.employers || 0} 
          trend="Registered" 
          icon="🏢" 
          color="text-purple-400" 
        />
        <StatCard 
          title="Trash Bin" 
          value={stats?.trashed || 0} 
          trend="Archived" 
          icon="🗑️" 
          color="text-slate-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main User Management Table */}
        <div className="lg:col-span-3 dashboard-card p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Member Directory</h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          
          <UserTable users={users} />
        </div>
        
        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <div className="dashboard-card p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="font-bold mb-4 text-sm text-slate-200">System Alerts</h3>
            <div className="space-y-3">
               {stats && stats.pending > 0 && (
                 <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                   <p className="text-[10px] text-amber-500 font-bold uppercase">Action Required</p>
                   <p className="text-xs text-amber-200/70 mt-1">{stats.pending } users waiting for ID verification.</p>
                 </div>
               )}
               <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                 <p className="text-[10px] text-blue-500 font-bold uppercase">Data Tip</p>
                 <p className="text-xs text-blue-200/70 mt-1">Review trashed accounts monthly to save database space.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, color }: any) => (
  <div className="stat-card p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-cyan-500/20 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 tracking-tighter ${color}`}>{trend}</span>
    </div>
    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</h4>
    <p className="text-3xl font-bold text-white mt-1">{value}</p>
  </div>
);

export default Dashboard;
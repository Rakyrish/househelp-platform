import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/admin/notifications/');
      setUnreadCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: '📊' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
    { 
      name: 'Payment Verification', 
      path: '/admin/payments', 
      icon: '💳',
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#050b14] border-b border-white/5 md:hidden">
        <h1 className="text-base font-bold text-white">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {sidebarOpen ? <CloseOutlined className="text-lg" /> : <MenuOutlined className="text-lg" />}
        </button>
      </div>

      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50
          w-64 border-r border-white/5 bg-[#050b14] p-6 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Househelp System
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                isActive(item.path)
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>{item.icon}</span>
                <span className="text-sm font-semibold">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg"
        >
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 pt-18 md:pt-8 md:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: '📊' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
  ];

  const handleLogout = () => {
    console.log('Logout clicked'); // check HMR console
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#050b14] p-6 flex flex-col">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Househelp System gcycyt
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${
                isActive(item.path)
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
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
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

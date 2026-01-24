import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from './StatusBadge';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  status: string | null;
  date_joined: string;
  last_login: string | null;
  is_deleted: boolean;
}

const UserTable = ({ users }: { users: User[] }) => {
  const navigate = useNavigate();
  
  // States for Filtering
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'employer'>('all');
  const [showTrash, setShowTrash] = useState(false);

  // --- HELPER: Time Ago Logic ---
  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

 // DEBUGGING: Check your data in the F12 console
  console.log("Raw Users from Backend:", users);

  const filteredUsers = users.filter(user => {
    // Treat null/undefined/false as active. Only true is trash.
    const isActuallyDeleted = user.is_deleted === true; 
    
    const matchesTrashView = isActuallyDeleted === showTrash;
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    
    return matchesTrashView && matchesRole;
  });

  console.log(`Filtered Users (ShowTrash: ${showTrash}):`, filteredUsers);

  // --- ACTIONS ---
  const handleAction = async (action: string, id: number, message: string) => {
    if (!window.confirm(message)) return;
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/admin/manage-users/${id}/${action}/`;
    
    try {
      if (action === 'permanent_erase') {
        await axios.delete(url, { headers: { Authorization: `Token ${token}` } });
      } else {
        await axios.post(url, {}, { headers: { Authorization: `Token ${token}` } });
      }
      window.location.reload();
    } catch (err) {
      alert(`Action ${action} failed.`);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* TOOLBAR: Filters & Trash Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
          {(['all', 'worker', 'employer'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setRoleFilter(type)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                roleFilter === type ? 'bg-cyan-500 text-[#050b14]' : 'text-slate-500 hover:text-white'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowTrash(!showTrash)}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
            showTrash 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
        >
          {showTrash ? "← Back to Active" : "🗑️ View Trash Bin"}
        </button>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Activity</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const displayName = (user.first_name || user.last_name) 
                ? `${user.first_name} ${user.last_name}`.trim() 
                : user.username;

              return (
                <tr key={user.id} className="bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                  <td className="px-4 py-4 rounded-l-xl border-y border-l border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 border border-white/5">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200 capitalize">{displayName}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-y border-white/5 text-xs text-slate-400 capitalize">
                    {user.role}
                  </td>
                  <td className="px-4 py-4 border-y border-white/5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-4 border-y border-white/5">
                    <div className="text-xs text-slate-300">{formatTimeAgo(user.last_login)}</div>
                    <div className="text-[9px] text-slate-600">Joined {new Date(user.date_joined).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-4 rounded-r-xl border-y border-r border-white/5 text-right">
                    <div className="flex justify-end gap-2">
                      {!showTrash ? (
                        <>
                          <button onClick={() => handleAction('logout_user', user.id, "Force logout this user?")} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg" title="Logout User">🚪</button>
                          <button onClick={() => navigate(`/admin/verify/${user.id}`)} className="text-[10px] font-bold uppercase px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black">Manage</button>
                          <button onClick={() => handleAction('trash_user', user.id, "Move to trash?")} className="p-2 bg-white/5 text-slate-500 hover:text-red-400 rounded-lg" title="Trash">🗑️</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleAction('restore_user', user.id, "Restore this user?")} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg" title="Restore">🔄</button>
                          <button onClick={() => handleAction('permanent_erase', user.id, "☢️ PERMANENT DELETE: This cannot be undone!")} className="p-2 bg-red-600 text-white rounded-lg" title="Erase Forever">🔥</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-20 text-slate-600 text-xs italic">No members found in this category.</div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
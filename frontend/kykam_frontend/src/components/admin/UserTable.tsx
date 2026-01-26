import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Descriptions, Badge, Button, Divider, Avatar } from 'antd';
import { 
  EyeOutlined, 
  SafetyCertificateOutlined, 
  LogoutOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  FireOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import StatusBadge from './StatusBadge';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'worker' | 'employer';
  status: string | null;
  date_joined: string;
  last_login: string | null;
  is_deleted: boolean;
  is_verified: boolean;
  location?: string;
  phone?: string;
  worker_type?: string;
  expected_salary?: string | number;
  family_size?: number;
  id_number?: string;
  age?: string;
}

const UserTable = ({ users }: { users: User[] }) => {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'employer'>('all');
  const [showTrash, setShowTrash] = useState(false);
  const [previewUser, setPreviewUser] = useState<User | null>(null);

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

  const filteredUsers = users.filter(user => {
    const isActuallyDeleted = user.is_deleted === true;
    const matchesTrashView = isActuallyDeleted === showTrash;
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    return matchesTrashView && matchesRole;
  });

  const handleAction = async (action: string, id: number, confirmMsg: string) => {
    if (!window.confirm(confirmMsg)) return;
    const token = localStorage.getItem('token');
    const url = `${API}/api/admin/manage-users/${id}/${action}/`;
    
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
      {/* TOOLBAR */}
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
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPreviewUser(user)}>
                      <Avatar className="bg-slate-800 text-cyan-400 border border-white/5 group-hover:border-cyan-500/50">
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
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
                          <button onClick={() => setPreviewUser(user)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg"><EyeOutlined /></button>
                          <button onClick={() => handleAction('logout_user', user.id, "Force logout?")} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg"><LogoutOutlined /></button>
                          <button onClick={() => navigate(`/admin/verify/${user.id}`)} className="text-[10px] font-bold uppercase px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black">Manage</button>
                          <button onClick={() => handleAction('trash_user', user.id, "Trash?")} className="p-2 bg-white/5 text-slate-500 hover:text-red-400 rounded-lg"><DeleteOutlined /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleAction('restore_user', user.id, "Restore?")} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ReloadOutlined /></button>
                          <button onClick={() => handleAction('permanent_erase', user.id, "Erase Forever?")} className="p-2 bg-red-600 text-white rounded-lg"><FireOutlined /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* QUICK LOOK MODAL */}
      <Modal
        open={!!previewUser}
        onCancel={() => setPreviewUser(null)}
        footer={null}
        width={550}
        centered
        className="admin-modal"
        styles={{ body: { backgroundColor: '#0f172a', padding: 0, borderRadius: '24px', overflow: 'hidden' } }}
      >
        {previewUser && (
          <div className="text-slate-200">
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl font-bold text-cyan-400">
                    {previewUser.first_name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{previewUser.first_name} {previewUser.last_name}</h2>
                    <div className="flex gap-2">
                      <Badge status={previewUser.is_verified ? "success" : "warning"} text={<span className="text-slate-400 text-[10px] font-bold uppercase">{previewUser.role}</span>} />
                      {previewUser.is_verified && <SafetyCertificateOutlined className="text-cyan-400" />}
                    </div>
                  </div>
                </div>
                <Button type="primary" className="bg-cyan-500 border-none h-10 px-6 rounded-xl font-bold text-[#050b14]" onClick={() => navigate(`/admin/verify/${previewUser.id}`)}>Audit Full Docs</Button>
              </div>
            </div>

            <div className="p-8">
              <Descriptions column={2} layout="vertical">
                <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Contact Information</span>}>
                  <div className="space-y-1">
                    <p className="m-0 text-sm">{previewUser.email}</p>
                    <p className="m-0 text-xs text-slate-400">{previewUser.phone || 'No phone added'}</p>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Location</span>}>
                  <p className="m-0 text-sm capitalize flex items-center gap-2"><EnvironmentOutlined className="text-cyan-500" /> {previewUser.location || 'Unknown'}</p>
                </Descriptions.Item>

                <Descriptions.Item span={2}><Divider className="border-white/5 my-2" /></Descriptions.Item>

                {previewUser.role === 'worker' ? (
                  <>
                    <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Specialization</span>}>
                      <span className="text-cyan-400 font-bold capitalize">{previewUser.worker_type?.replace('_', ' ')}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Expected Salary</span>}>
                      <span className="text-slate-200">KSh {previewUser.expected_salary?.toLocaleString() || 'N/A'}</span>
                    </Descriptions.Item>
                  </>
                ) : (
                  <>
                    <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Household Size</span>}>
                      <span className="text-slate-200">{previewUser.family_size || 0} Members</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Government ID</span>}>
                      <span className="text-slate-200">{previewUser.id_number || 'Pending'}</span>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>

              <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Registration Data</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  UID: {previewUser.id.toString().padStart(5, '0')} | Joined: {new Date(previewUser.date_joined).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserTable;
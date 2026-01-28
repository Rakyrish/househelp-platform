import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Modal, Descriptions, Badge, Button, Divider, Avatar, Form, 
  Input,  message, Alert // Added Alert here
} from 'antd';
import { 
  EyeOutlined,
  LogoutOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  FireOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  MailOutlined
} from '@ant-design/icons';
import axios from 'axios';
import StatusBadge from './StatusBadge';
import api from '../../api/axios';


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
  
  // Modals State
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [form] = Form.useForm();

  const handleOpenResetModal = (userId: number) => {
    setSelectedUserId(userId);
    setIsResetModalOpen(true);
  };

  const handlePasswordReset = async (values: any) => {
    try {
      await api.post(`/admin/users/${selectedUserId}/reset-password/`, {
        password: values.password
      });
      message.success("User password has been force-reset successfully");
      setIsResetModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error("Failed to reset password.");
    }
  };

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
      message.success(`Action completed successfully`);
      window.location.reload();
    } catch (err) {
      message.error(`Action failed.`);
    }
  };

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
                      <Avatar className="bg-slate-800 text-cyan-400 border border-white/5">
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
                          <button onClick={() => handleOpenResetModal(user.id)} className="p-2 bg-white/5 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg"><KeyOutlined /></button>
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

      {/* MODAL: RESET PASSWORD */}
      <Modal
        title={<span className="text-white font-bold">Force Reset User Password</span>}
        open={isResetModalOpen}
        onCancel={() => { setIsResetModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Update Password"
        okButtonProps={{ className: "bg-cyan-500 text-black border-none font-bold" }}
        cancelButtonProps={{ className: "border-white/10 text-slate-400" }}
        centered
        styles={{ 
            body: { backgroundColor: '#0f172a' }, // Changed 'content' to 'body'
            header: { backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)' } 
        }}
      >
        <div className="py-4">
          <Alert 
            className="mb-6 bg-amber-500/10 border-amber-500/20 text-amber-200"
            message="Critical Action"
            description="Overrides current credentials immediately."
            type="warning"
            showIcon
          />
          <Form form={form} layout="vertical" onFinish={handlePasswordReset}>
            <Form.Item
              name="password"
              label={<span className="text-slate-300">New Password</span>}
              rules={[{ required: true, message: 'Required' }, { min: 6, message: 'Min 6 chars' }]}
            >
              <Input.Password className="bg-slate-900 border-white/10 text-white" />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* QUICK LOOK MODAL */}
      <Modal
        open={!!previewUser}
        onCancel={() => setPreviewUser(null)}
        footer={null}
        width={550}
        centered
        styles={{ body: { backgroundColor: '#0f172a', padding: 0, overflow: 'hidden' } }}
      >
        {previewUser && (
          <div className="text-slate-200">
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl font-bold text-cyan-400">
                    {previewUser.first_name ? previewUser.first_name[0] : '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white m-0">{previewUser.first_name} {previewUser.last_name}</h2>
                    <Badge status={previewUser.is_verified ? "success" : "warning"} text={<span className="text-slate-400 text-[10px] uppercase font-bold">{previewUser.role}</span>} />
                  </div>
                </div>
                <Button type="primary" onClick={() => navigate(`/admin/verify/${previewUser.id}`)}>Audit Full Docs</Button>
              </div>
            </div>

            <div className="p-8">
              <Descriptions column={2} layout="vertical">
                <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold">Contact</span>}>
                  <p className="m-0 text-sm"><MailOutlined className="mr-2" />{previewUser.email}</p>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold">Location</span>}>
                  <p className="m-0 text-sm capitalize"><EnvironmentOutlined className="mr-2" /> {previewUser.location || 'Unknown'}</p>
                </Descriptions.Item>
                <Descriptions.Item span={2}><Divider className="border-white/5 my-2" /></Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 text-[10px] uppercase font-bold">Specialization/ID</span>}>
                  <span className="text-cyan-400 font-bold">{previewUser.worker_type || previewUser.id_number || 'N/A'}</span>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserTable;
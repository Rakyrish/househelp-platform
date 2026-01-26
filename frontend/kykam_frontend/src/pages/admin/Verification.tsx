import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DocumentPreview from '../../components/admin/DocumentPreview';
import RejectionModal from '../../components/admin/RejectionModal';
import { message, Tag, Space, Button, Divider } from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  HomeOutlined
} from '@ant-design/icons';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const VerificationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/admin/manage-users/${userId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setUser(res.data);
      } catch (error) {
        message.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/admin/manage-users/${userId}/approve_worker/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      message.success("Account successfully verified!");
      navigate('/admin/users');
    } catch (err) {
      message.error("Approval failed");
    }
  };

  const handleReject = async (reasons: string[], comment: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/admin/manage-users/${userId}/reject_worker/`, 
        { reasons, comment }, 
        { headers: { Authorization: `Token ${token}` } }
      );
      message.warning("Application rejected");
      setIsModalOpen(false);
      navigate('/admin/users');
    } catch (err) {
      message.error("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-cyan-400 font-mono bg-[#050b14] min-h-screen">INITIALIZING AUDIT...</div>;
  if (!user) return <div className="p-10 text-red-400 bg-[#050b14] min-h-screen">ENTITY NOT FOUND.</div>;

  const isWorker = user.role === 'worker';

  return (
    <div className="min-h-screen bg-[#050b14] p-4 lg:p-8">
      {/* HEADER */}
      <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/users')}
              className="bg-white/5 border-white/10 text-white h-12 w-12 rounded-2xl hover:bg-white/10"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white capitalize m-0">{user.first_name} {user.last_name}</h1>
                <Tag color={isWorker ? "cyan" : "purple"} className="rounded-lg border-none font-bold px-3">{user.role.toUpperCase()}</Tag>
                {user.is_verified && <CheckCircleOutlined className="text-emerald-400 text-xl" />}
              </div>
              <p className="text-slate-500 font-mono text-xs mt-1">{user.email} • Joined {new Date(user.date_joined).toLocaleDateString()}</p>
            </div>
          </div>

          <Space size="middle">
            <Button 
              danger 
              size="large" 
              className="rounded-2xl h-12 px-8 font-bold" 
              onClick={() => setIsModalOpen(true)}
              icon={<CloseCircleOutlined />}
            >
              Reject Application
            </Button>
            <Button 
              type="primary" 
              size="large" 
              className="bg-cyan-500 border-none rounded-2xl h-12 px-8 font-bold text-[#050b14]" 
              onClick={handleApprove}
              icon={<CheckCircleOutlined />}
            >
              Confirm Verification
            </Button>
          </Space>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR DATA */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white/[0.03] p-6 rounded-3xl border border-white/5">
            <h3 className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <UserOutlined /> Personal Metrics
            </h3>
            <div className="space-y-6">
              <DetailItem label="Full Name" value={`${user.first_name} ${user.last_name}`} isCapitalized />
              <DetailItem label="Contact Number" value={user.phone} />
              <DetailItem label="Government ID" value={user.id_number} />
              <DetailItem label="Current Location" value={user.location} isCapitalized />
              <DetailItem label="Age" value={user.age} />
              
            </div>
          </section>

          {isWorker ? (
            <section className="bg-white/[0.03] p-6 rounded-3xl border border-white/5">
              <h3 className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <IdcardOutlined /> Professional Data
              </h3>
              <div className="space-y-6">
                <DetailItem label="Worker Type" value={user.worker_type} isCapitalized />
                <DetailItem label="Salary Expectation" value={`KSh ${user.expected_salary}`} />
                <Divider className="border-white/5 m-0" />
                <DetailItem label="Next of Kin" value={user.kin_name} isCapitalized />
                <DetailItem label="Kin Contact" value={user.kin_phone} />
              </div>
            </section>
          ) : (
            <section className="bg-white/[0.03] p-6 rounded-3xl border border-white/5">
              <h3 className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <HomeOutlined /> Household Metrics
              </h3>
              <div className="space-y-6">
                <DetailItem label="Household Size" value={`${user.family_size} Members`} />
                <DetailItem label="Address" value={user.location} isCapitalized />
                <DetailItem label="Salary" value={user.salary} />
              </div>
            </section>
          )}
        </div>

        {/* DOCUMENTS VIEWPORT */}
        <div className="lg:col-span-3">
          {isWorker ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[600px]">
                <DocumentPreview url={user.id_photo_front} title="ID Card Front" type="National Identity" />
                <DocumentPreview url={user.id_photo_back} title="ID Card Back" type="National Identity" />
              </div>
              <div className="h-[700px]">
                <DocumentPreview url={user.passport_img} title="Passport Photo" type="Verification Image" />
              </div>
            </div>
          ) : (
            <div className="h-[800px]">
              <DocumentPreview url={user.id_photo_front} title="Employer ID" type="Verification Document" />
            </div>
          )}
        </div>
      </div>

      <RejectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleReject} 
        userName={user.first_name} 
      />
    </div>
  );
};

const DetailItem = ({ label, value, isCapitalized }: { label: string, value: string | number, isCapitalized?: boolean }) => (
  <div>
    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
    <p className={`text-sm text-slate-200 m-0 ${isCapitalized ? 'capitalize' : ''}`}>
      {value || <span className="text-slate-700 italic">Data Not Available</span>}
    </p>
  </div>
);

export default VerificationPage;
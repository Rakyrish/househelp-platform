import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, Tag, Row, Col, Avatar, Button, Spin, Progress, Alert, Tabs, Badge, Typography, Space,  Empty
} from "antd";
import {
  CheckCircleFilled, ExclamationCircleFilled, 
  UserOutlined, EnvironmentOutlined, EditOutlined,
  DollarCircleOutlined, ToolOutlined, SafetyCertificateOutlined,
  PhoneOutlined, LockOutlined
} from "@ant-design/icons";

// --- CUSTOM IMPORTS ---
import api from "../../api/axios"; 
import { useAuth } from "../../context/AuthContext";
import EditProfileDrawer from "./EditProfileDrawer";
import AccountSettings from "./AccountSettings";
import WorkerRequests from "./WorkerRequests";

const { Title, Text } = Typography;
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const WorkerDashboard = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_BASE}${path}`;
  };

  const fetchInvites = useCallback(async () => {
    try {
      const res = await api.get('worker-requests/my_invites/');
      setInvites(res.data);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('worker/dashboard/profile_status/');
      setProfile(res.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Interceptor handles the redirect, but we stop loading here
        return;
      }
      setError(err.response?.status === 404 ? "Profile data missing." : "Network Error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchInvites();
    }
  }, [token, fetchProfile, fetchInvites]);

  // Logic for profile completion score
  const completionScore = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.passport_img) score += 25;
    if (profile.id_photo_front && profile.id_photo_back) score += 25;
    if (profile.kin_name && profile.kin_phone) score += 25;
    if (profile.location && profile.expected_salary && profile.worker_type) score += 25;
    return score;
  }, [profile]);

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc]">
      <Spin size="large" />
      <Text className="mt-4 text-slate-500 font-medium animate-pulse">Synchronizing your dashboard...</Text>
    </div>
  );

  if (error) return <Alert message="Error" description={error} type="error" showIcon className="m-8" />;

  const tabItems = [
    {
      key: '1',
      label: 'Overview',
      children: (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16} className="space-y-6">
              {profile.status === "rejected" ? (
                <Alert
                  message={<span className="font-bold text-red-800">Verification Rejected</span>}
                  description={profile.rejection_feedback || "Please update your documents."}
                  type="error"
                  showIcon
                  action={<Button size="small" danger onClick={() => setIsDrawerVisible(true)}>Fix Now</Button>}
                  className="rounded-2xl shadow-sm border-none bg-red-50"
                />
              ) : !profile.is_verified && (
                <Alert
                  title="Verification Pending"
                  description="Our team is currently reviewing your documents."
                  type="info"
                  showIcon
                  className="rounded-2xl shadow-sm border-none bg-blue-50 text-blue-800"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickStat icon={<ToolOutlined className="text-blue-500" />} label="Job Role" value={profile.worker_type?.replace("_", " ") || "Not Set"} bgColor="bg-blue-50" />
                <QuickStat icon={<DollarCircleOutlined className="text-emerald-500" />} label="Exp. Salary" value={`Ksh ${profile.expected_salary || "0"}`} bgColor="bg-emerald-50" />
                <QuickStat icon={<EnvironmentOutlined className="text-orange-500" />} label="Location" value={profile.location || "Not Set"} bgColor="bg-orange-50" />
              </div>

              <Card 
                className="rounded-3xl border-none shadow-sm"
                title={<span className="font-bold text-slate-800">Professional Bio</span>}
                extra={<Button type="link" icon={<EditOutlined />} onClick={() => setIsDrawerVisible(true)}>Edit</Button>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Text className="text-slate-500 text-sm leading-relaxed">Experience: {profile.experience || "No experience summary provided yet."} years</Text>
                    <div className="flex gap-2">
                      <Tag className="rounded-full px-4 border-none bg-blue-100 text-blue-600 font-bold">Open to Work</Tag>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-bold block mb-2 uppercase tracking-wider">Emergency Contact</Text>
                    <Title level={5} className="!m-0 text-slate-700">{profile.kin_name || "---"}</Title>
                    <Text className="text-slate-500 italic"><PhoneOutlined className="mr-1"/> {profile.kin_phone || "No phone added"}</Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="rounded-3xl border-none shadow-sm text-center sticky top-6 bg-white">
                <Progress 
                  type="circle" 
                  percent={completionScore} 
                  strokeWidth={10}
                  strokeColor={{ '0%': '#3b82f6', '100%': '#10b981' }} 
                />
                <Title level={4} className="!mt-4">Profile Strength</Title>
                <Text className="text-slate-400 text-sm px-4 block">A complete profile increases your chances of getting hired.</Text>
                
                <div className="mt-8 text-left space-y-4 px-2">
                  <StrengthItem label="Passport Photo" done={!!profile.passport_img} />
                  <StrengthItem label="Identity Documents" done={!!profile.id_photo_front && !!profile.id_photo_back} />
                  <StrengthItem label="Next of Kin Info" done={!!profile.kin_name} />
                  <StrengthItem label="Work Preferences" done={!!profile.worker_type && !!profile.expected_salary} />
                </div>

                <Button 
                  block type="primary" size="large" icon={<EditOutlined />}
                  onClick={() => setIsDrawerVisible(true)}
                  className="mt-8 h-12 rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-100"
                >
                  Complete Profile
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <Badge count={invites.filter((i:any)=>i.status === 'pending').length} offset={[12, 0]}>
          <span className="px-2">Job Invites</span>
        </Badge>
      ),
      children: completionScore < 100 ? (
        <div className="py-20 text-center bg-white rounded-3xl mt-6 shadow-sm border border-slate-100">
          <Empty
            image={<LockOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            description={
              <div className="space-y-2">
                <Text strong className="text-lg block">Job Invites are Locked</Text>
                <Text className="text-slate-400">Complete your profile to 100% and get verified to see invitations from employers.</Text>
              </div>
            }
          >
            <Button type="primary" onClick={() => setIsDrawerVisible(true)}>Finish Profile Now</Button>
          </Empty>
        </div>
      ) : (
        <WorkerRequests />
      )
    },
    {
      key: '3',
      label: 'Security & Settings',
      children: <AccountSettings />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar size={96} src={getFullUrl(profile.passport_img)} icon={<UserOutlined />} className="border-4 border-slate-50 shadow-xl" />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                  <SafetyCertificateOutlined className="text-[12px]" />
                </div>
              )}
            </div>
            <div>
              <Title level={2} className="!m-0 !font-black text-slate-800">Hi, {profile.first_name || 'Worker'}!</Title>
            
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <Button onClick={() => logout()} className="rounded-xl border-slate-200">Logout</Button>
             <Tag color={profile.is_verified ? "success" : "processing"} className="px-6 py-2 rounded-2xl font-black border-none text-[10px] tracking-widest uppercase flex items-center">
                {profile.is_verified ? "Verified Professional" : "Verification Pending"}
             </Tag>
          </div>
        </header>

        <style>{`
          .worker-tabs .ant-tabs-nav:before { border-bottom: none !important; }
          .worker-tabs .ant-tabs-tab { border-radius: 12px !important; margin-right: 8px !important; transition: all 0.2s; }
          .worker-tabs .ant-tabs-tab-active { background: #3b82f6 !important; }
          .worker-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: white !important; }
          .worker-tabs .ant-tabs-ink-bar { display: none !important; }
        `}</style>

        <Tabs items={tabItems} size="large" className="worker-tabs" />
      </div>

      <EditProfileDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        initialData={profile}
        onUpdate={() => {
          fetchProfile();
          fetchInvites();
        }}
      />
    </div>
  );
};

// Sub-components for cleaner code
const StrengthItem = ({ label, done }: { label: string, done: boolean }) => (
  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
    <span className={`text-[13px] ${done ? 'text-slate-700' : 'text-slate-300'}`}>{label}</span>
    {done ? <CheckCircleFilled className="text-emerald-500" /> : <ExclamationCircleFilled className="text-amber-400" />}
  </div>
);

const QuickStat = ({ icon, label, value, bgColor }: any) => (
  <Card className="rounded-2xl border-none shadow-sm transition-all hover:shadow-md">
    <Space align="center">
      <div className={`p-3 ${bgColor} rounded-xl`}>{icon}</div>
      <div>
        <Text className="text-[10px] text-slate-400 font-bold uppercase block">{label}</Text>
        <Text strong className="capitalize text-slate-700">{value}</Text>
      </div>
    </Space>
  </Card>
);

export default WorkerDashboard;
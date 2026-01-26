import { useState, useEffect, useCallback } from "react";
import {
  Card, Tag, Row, Col, Avatar, Button, Spin, Progress, Alert, Tabs, Badge, Typography, Space,
} from "antd";
import {
  CheckCircleFilled, ExclamationCircleFilled, 
  UserOutlined, EnvironmentOutlined, EditOutlined,
  DollarCircleOutlined, ToolOutlined, SafetyCertificateOutlined,
  PhoneOutlined, 
} from "@ant-design/icons";
import axios from "axios";
import EditProfileDrawer from "./EditProfileDrawer";
import AccountSettings from "./AccountSettings";
import WorkerRequests from "./WorkerRequests";

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const WorkerDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API}${path}`;
  };

  const fetchInvites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Using the more specific endpoint
      const res = await axios.get(`${API}/api/worker-requests/my_invites/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setInvites(res.data);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API}/api/worker/dashboard/profile_status/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setProfile(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Profile data missing." : "Network Error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchInvites();
  }, [fetchProfile, fetchInvites]);

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.passport_img) score += 25;
    if (profile.id_photo_front) score += 25;
    if (profile.kin_name) score += 25;
    if (profile.location && profile.expected_salary) score += 25;
    return score;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc]">
      <Spin size="large" />
      <Text className="mt-4 text-slate-500 font-medium animate-pulse">Synchronizing your dashboard...</Text>
    </div>
  );

  const tabItems = [
    {
      key: '1',
      label: 'Overview',
      children: (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16} className="space-y-6">
              
              {/* Status Notifications */}
              {profile.status === "rejected" ? (
                <Alert
                  message={<span className="font-bold">Verification Update</span>}
                  description={profile.rejection_feedback || "Please check your documents and try again."}
                  type="error"
                  showIcon
                  action={<Button size="small" danger onClick={() => setIsDrawerVisible(true)}>Fix Now</Button>}
                  className="rounded-2xl shadow-sm border-none bg-red-50"
                />
              ) : !profile.is_verified && (
                <Alert
                  message="Review in Progress"
                  description="Hang tight! Our team is verifying your documents."
                  type="info"
                  showIcon
                  className="rounded-2xl shadow-sm border-none bg-blue-50 text-blue-800"
                />
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-none shadow-sm transition-transform hover:-translate-y-1">
                  <Space align="center">
                    <div className="p-3 bg-blue-50 rounded-xl"><ToolOutlined className="text-blue-500" /></div>
                    <div>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase block">Job Role</Text>
                      <Text strong className="capitalize">{profile.worker_type?.replace("_", " ") || "Not Set"}</Text>
                    </div>
                  </Space>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm transition-transform hover:-translate-y-1">
                  <Space align="center">
                    <div className="p-3 bg-emerald-50 rounded-xl"><DollarCircleOutlined className="text-emerald-500" /></div>
                    <div>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase block">Exp. Salary</Text>
                      <Text strong>Ksh {profile.expected_salary || "0"}</Text>
                    </div>
                  </Space>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm transition-transform hover:-translate-y-1">
                  <Space align="center">
                    <div className="p-3 bg-orange-50 rounded-xl"><EnvironmentOutlined className="text-orange-500" /></div>
                    <div>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase block">Location</Text>
                      <Text strong className="capitalize">{profile.location || "Not Set"}</Text>
                    </div>
                  </Space>
                </Card>
              </div>

              {/* Bio & Details */}
              <Card 
                className="rounded-3xl border-none shadow-sm"
                title={<span className="font-bold text-slate-800">Professional Profile</span>}
                extra={<Button type="link" icon={<EditOutlined />} onClick={() => setIsDrawerVisible(true)}>Update Profile</Button>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Text className="text-slate-400 text-xs font-bold block mb-1">EXPERIENCE</Text>
                      <Text className="text-slate-700">{profile.experience || "Update your experience level"}</Text>
                    </div>
                    <div className="flex gap-2">
                      <Tag className="rounded-full px-4 border-none bg-blue-100 text-blue-600 font-bold">Open to Work</Tag>
                      {profile.is_verified && <Tag className="rounded-full px-4 border-none bg-amber-100 text-amber-600 font-bold">Verified Talent</Tag>}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-bold block mb-2 uppercase">Emergency Contact</Text>
                    <Title level={5} className="!m-0">{profile.kin_name || "---"}</Title>
                    <Text className="text-slate-500 italic"><PhoneOutlined className="mr-1"/> {profile.kin_phone || "No phone added"}</Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Sidebar Stats */}
            <Col xs={24} lg={8}>
              <Card className="rounded-3xl border-none shadow-sm text-center sticky top-6 bg-gradient-to-br from-white to-slate-50">
                <Progress 
                  type="circle" 
                  percent={calculateCompletion()} 
                  strokeWidth={10}
                  strokeColor={{ '0%': '#3b82f6', '100%': '#10b981' }} 
                />
                <Title level={4} className="!mt-4">Profile Strength</Title>
                <Text className="text-slate-500 text-sm px-4 block">Complete profiles attract more employers.</Text>
                
                <div className="mt-8 text-left space-y-4 px-2">
                  <StrengthItem label="Passport Photo" done={!!profile.passport_img} />
                  <StrengthItem label="Identity Cards" done={!!profile.id_photo_front && !!profile.id_photo_back} />
                  <StrengthItem label="Contact Details" done={!!profile.kin_name} />
                  <StrengthItem label="Work Preferences" done={!!profile.worker_type && !!profile.expected_salary} />
                </div>

                <Button 
                  block 
                  type="primary" 
                  size="large" 
                  icon={<EditOutlined />}
                  onClick={() => setIsDrawerVisible(true)}
                  className="mt-8 h-12 rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-100"
                >
                  Complete Now
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
      children: <WorkerRequests />
    },
    {
      key: '3',
      label: 'Account Settings',
      children: <AccountSettings />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Branding Section */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar 
                size={96} 
                src={getFullUrl(profile.passport_img)} 
                icon={<UserOutlined />} 
                className="border-4 border-white shadow-xl bg-slate-100" 
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                  <SafetyCertificateOutlined className="text-[12px]" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Title level={2} className="!m-0 !font-black text-slate-800">
                  Hi, {profile.first_name || 'Worker'}!
                </Title>
              </div>
              <Text className="text-slate-400 font-medium text-base">Your profile is currently <span className="text-blue-500">Live</span></Text>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0">
             <Tag 
                color={profile.is_verified ? "success" : profile.status === "rejected" ? "error" : "processing"} 
                className="px-6 py-2 rounded-2xl font-black border-none text-[11px] tracking-widest uppercase"
              >
                {profile.is_verified ? "Verified Professional" : profile.status || "Under Review"}
              </Tag>
          </div>
        </header>

        {/* Custom Styling for Ant Design Tabs */}
        <style>{`
          .worker-tabs .ant-tabs-nav:before { border-bottom: none !important; }
          .worker-tabs .ant-tabs-tab { 
            background: transparent !important; 
            border: none !important; 
            margin-right: 8px !important;
            padding: 10px 20px !important;
            border-radius: 14px !important;
            transition: all 0.3s;
          }
          .worker-tabs .ant-tabs-tab-active { 
            background: white !important; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
          }
          .worker-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #2563eb !important;
            font-weight: 700 !important;
          }
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
          setIsDrawerVisible(false);
        }}
      />
    </div>
  );
};

const StrengthItem = ({ label, done }: { label: string, done: boolean }) => (
  <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
    <span className={`text-[13px] ${done ? 'text-slate-700 font-medium' : 'text-slate-300 italic'}`}>{label}</span>
    {done ? (
      <CheckCircleFilled className="text-emerald-500" />
    ) : (
      <ExclamationCircleFilled className="text-amber-400 animate-pulse" />
    )}
  </div>
);

export default WorkerDashboard;
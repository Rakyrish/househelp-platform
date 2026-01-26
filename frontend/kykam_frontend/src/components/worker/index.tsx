import  { useState, useEffect, useCallback } from "react";
import {
  Card, Tag, Row, Col, Avatar, Button, Spin, Progress, Alert, Tabs, Badge
} from "antd";
import {
  CheckCircleFilled, ExclamationCircleFilled, 
  UserOutlined, EnvironmentOutlined,  EditOutlined
} from "@ant-design/icons";
import axios from "axios";
import EditProfileDrawer from "./EditProfileDrawer";
import AccountSettings from "./AccountSettings";
import WorkerRequests from "./WorkerRequests";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const WorkerDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);

  // Helper to ensure image URLs are absolute
  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API}${path}`;
  };

  const fetchInvites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/worker/dashboard/job_invites/`, {
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
      setError(err.response?.status === 404 ? "Profile endpoint missing." : "Network Error.");
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
    if (profile.passport_img) score += 20;
    if (profile.id_photo_front) score += 20;
    if (profile.kin_name && profile.kin_phone) score += 20;
    if (profile.location) score += 20;
    if (profile.experience && profile.experience !== "none") score += 20;
    return score;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc]">
      <Spin size="large" />
      <p className="mt-4 text-slate-500 font-medium">Synchronizing Dashboard...</p>
    </div>
  );

  const tabItems = [
    {
      key: '1',
      label: 'Overview',
      children: (
        <Row gutter={[24, 24]} className="mt-4">
          <Col xs={24} lg={16} className="space-y-6">
            {/* Conditional Status Banner */}
            {profile.status === "rejected" ? (
              <Alert
                message="Action Required: Profile Rejected"
                description={profile.rejection_feedback || "Please update your documents to be reconsidered."}
                type="error"
                showIcon
                action={<Button danger onClick={() => setIsDrawerVisible(true)}>Fix Profile</Button>}
                className="rounded-2xl border-red-100"
              />
            ) : !profile.is_verified && (
              <Alert
                message="Verification in Progress"
                description="Our admins are reviewing your details. This usually takes 24 hours."
                type="info"
                showIcon
                className="rounded-2xl border-blue-100"
              />
            )}
           <p color="red" >{error}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Role</p>
                <h3 className="text-lg font-bold capitalize text-slate-700">{profile.worker_type?.replace("_", " ") || "---"}</h3>
              </Card>
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Salary</p>
                <h3 className="text-lg font-bold text-slate-700">Ksh {profile.expected_salary || "0"}</h3>
              </Card>
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Location</p>
                <h3 className="text-lg font-bold capitalize text-slate-700">{profile.location || "---"}</h3>
              </Card>
            </div>

            <Card title={<span className="text-sm">Profile Details</span>} className="rounded-2xl border-none shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-slate-500 text-sm mb-3">Your profile is visible to employers searching in your area.</p>
                  <div className="flex flex-wrap gap-2">
                    <Tag icon={<EnvironmentOutlined />} className="rounded-md">{profile.location || "Location Not Set"}</Tag>
                    <Tag color="cyan" className="rounded-md">Experience: {profile.experience || "Not Set"}</Tag>
                  </div>
                </div>
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => setIsDrawerVisible(true)}
                  className="rounded-xl h-12 px-8 font-bold bg-slate-900 text-white hover:!bg-slate-800"
                >
                  Edit Profile
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={<span className="text-sm">Profile Strength</span>} className="rounded-2xl border-none shadow-sm text-center">
              <Progress 
                type="circle" 
                percent={calculateCompletion()} 
                strokeColor={{ '0%': '#f3a82f', '100%': '#ffc107' }} 
              />
              <p className="mt-6 text-slate-500 text-xs">Complete profiles are 3x more likely to be hired.</p>
              
              <div className="mt-6 text-left space-y-3">
                <StrengthItem label="Passport Photo" done={!!profile.passport_img} />
                <StrengthItem label="ID Documents" done={!!profile.id_photo_front && !!profile.id_photo_back} />
                <StrengthItem label="Next of Kin" done={!!profile.kin_name} />
                <StrengthItem label="Job Preferences" done={!!profile.worker_type && !!profile.expected_salary} />
              </div>
            </Card>
          </Col>
        </Row>
      )
    },
    {
  key: '2',
  label: <span>Job Invites <Badge count={invites.length} /></span>,
  children: <WorkerRequests />
},

    {
      key: '3',
      label: 'Account',
      children: <AccountSettings />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <Avatar 
              size={90} 
              src={getFullUrl(profile.passport_img)} 
              icon={<UserOutlined />} 
              className="border-4 border-slate-50 shadow-inner" 
            />
            <div>
              <h1 className="text-2xl font-black text-slate-800">Hi, {profile.first_name || 'Worker'}!</h1>
              <p className="text-slate-400 font-medium">Manage your profile and applications</p>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <Tag 
              color={profile.is_verified ? "success" : profile.status === "rejected" ? "error" : "processing"} 
              className="px-6 py-2 rounded-xl font-bold border-none"
            >
              {profile.is_verified ? "VERIFIED ACCOUNT" : profile.status?.toUpperCase() || "PENDING REVIEW"}
            </Tag>
          </div>
        </header>

        <Tabs items={tabItems} size="large" className="worker-tabs" />
      </div>

      <EditProfileDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        initialData={profile}
        onUpdate={() => {
          fetchProfile();
          setIsDrawerVisible(false);
        }}
      />
    </div>
  );
};

const StrengthItem = ({ label, done }: { label: string, done: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs ${done ? 'text-slate-700' : 'text-slate-300 italic'}`}>{label}</span>
    {done ? <CheckCircleFilled className="text-emerald-500" /> : <ExclamationCircleFilled className="text-slate-200" />}
  </div>
);

export default WorkerDashboard;
import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import {
  Card, Tag, Row, Col, Avatar, Button, Spin, Progress, Alert, Tabs, Badge, Typography, Space, Empty, message
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

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackLabel?: string },
  { hasError: boolean; error: any }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message={`${this.props.fallbackLabel || "Component"} failed to load`}
          description={
            <div>
              <p className="text-sm text-red-600 font-mono mt-1">
                {String(this.state.error)}
              </p>
              <Button
                size="small"
                danger
                className="mt-3"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Retry
              </Button>
            </div>
          }
          showIcon
          className="rounded-2xl mt-6"
        />
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_BASE}${path}`;
  };

  const fetchInvites = useCallback(async () => {
    try {
      const res = await api.get("worker-requests/my_invites/");
      setInvites(res.data);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("worker/dashboard/profile_status/");
      setProfile(res.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(
        err.response?.status === 404 ? "Profile data missing." : "Network Error."
      );
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchInvites();
    }
  }, [token, fetchProfile, fetchInvites]);

  // Handle active auto-logout timer for under_review users
  useEffect(() => {
    if (
      profile?.verification_status === "under_review" &&
      profile?.payment_submitted_at
    ) {
      const expiryTime =
        new Date(profile.payment_submitted_at).getTime() + 10 * 60 * 1000;
      const remainingMs = expiryTime - Date.now();

      if (remainingMs <= 0) {
        message.error("Session expired. Account still under review.");
        logout();
        return;
      }

      setTimeLeft(Math.ceil(remainingMs / 1000));

      const formatMins = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, "0")}`;
      };

      message.warning({
        content: `Your account is under review. You will be logged out in ${formatMins(Math.ceil(remainingMs / 1000))} if not verified.`,
        duration: 5,
        className: "mt-12",
      });

      const tick = setInterval(() => {
        const newRemaining = expiryTime - Date.now();
        if (newRemaining <= 0) {
          clearInterval(tick);
          message.error("Session expired. Account still under review.");
          logout();
        } else {
          setTimeLeft(Math.ceil(newRemaining / 1000));
        }
      }, 1000);

      const interval = setInterval(() => {
        fetchProfile();
      }, 10000);

      return () => {
        clearInterval(tick);
        clearInterval(interval);
      };
    }

    setTimeLeft(null);
  }, [
    profile?.verification_status,
    profile?.payment_submitted_at,
    fetchProfile,
    logout,
  ]);

  const completionScore = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.passport_img) score += 25;
    if (profile.id_photo_front && profile.id_photo_back) score += 25;
    if (profile.kin_name && profile.kin_phone) score += 25;
    if (profile.location && profile.expected_salary && profile.worker_type)
      score += 25;
    return score;
  }, [profile]);

  // Pending invites count — computed once and shared across tabs that need it
  const pendingInvitesCount = useMemo(
    () => invites.filter((i: any) => i.status === "pending").length,
    [invites]
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc]">
        <Spin size="large" />
        <Text className="mt-4 text-slate-500 font-medium animate-pulse">
          Synchronizing your dashboard...
        </Text>
      </div>
    );

  if (error)
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="m-8"
      />
    );

  const tabItems = [
    {
      key: "1",
      label: (
        <Badge count={pendingInvitesCount} offset={[12, 0]}>
          <span className="px-2">Overview</span>
        </Badge>
      ),
      children: (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16} className="space-y-6">
              {profile.verification_status === "under_review" ? (
                <Alert
                  message={
                    <span className="font-bold text-amber-800">
                      Account Under Review
                    </span>
                  }
                  description={`Your payment is under review. You have limited time access — session expires in ${timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : "--:--"
                    }.`}
                  type="warning"
                  showIcon
                  className="rounded-2xl shadow-sm border-none bg-amber-50 animate-bounce"
                />
              ) : profile.status === "rejected" ? (
                <Alert
                  message={
                    <span className="font-bold text-red-800">
                      Verification Rejected
                    </span>
                  }
                  description={
                    profile.rejection_feedback ||
                    "Please update your documents."
                  }
                  type="error"
                  showIcon
                  action={
                    <Button
                      size="small"
                      danger
                      onClick={() => setIsDrawerVisible(true)}
                    >
                      Fix Now
                    </Button>
                  }
                  className="rounded-2xl shadow-sm border-none bg-red-50"
                />
              ) : (
                !profile.is_verified && (
                  <Alert
                    message="Verification Pending"
                    description="Our team is currently reviewing your documents."
                    type="info"
                    showIcon
                    className="rounded-2xl shadow-sm border-none bg-blue-50 text-blue-800"
                  />
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickStat
                  icon={<ToolOutlined className="text-blue-500" />}
                  label="Job Role"
                  value={profile.worker_type?.replace("_", " ") || "Not Set"}
                  bgColor="bg-blue-50"
                />
                <QuickStat
                  icon={<DollarCircleOutlined className="text-emerald-500" />}
                  label="Exp. Salary"
                  value={`Ksh ${profile.expected_salary || "0"}`}
                  bgColor="bg-emerald-50"
                />
                <QuickStat
                  icon={<EnvironmentOutlined className="text-orange-500" />}
                  label="Location"
                  value={profile.location || "Not Set"}
                  bgColor="bg-orange-50"
                />
              </div>

              <Card
                className="rounded-3xl border-none shadow-sm"
                title={
                  <span className="font-bold text-slate-800">
                    Professional Bio
                  </span>
                }
                extra={
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setIsDrawerVisible(true)}
                  >
                    Edit
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Text className="text-slate-500 text-sm leading-relaxed">
                      Experience: {profile.experience || "No experience summary provided yet."} years
                    </Text>
                    <div className="flex gap-2">
                      <Tag className="rounded-full px-4 border-none bg-blue-100 text-blue-600 font-bold">
                        Open to Work
                      </Tag>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-bold block mb-2 uppercase tracking-wider">
                      Emergency Contact
                    </Text>
                    <Title level={5} className="!m-0 text-slate-700">
                      {profile.kin_name || "---"}
                    </Title>
                    <Text className="text-slate-500 italic">
                      <PhoneOutlined className="mr-1" />
                      {profile.kin_phone || "No phone added"}
                    </Text>
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
                  strokeColor={{ "0%": "#3b82f6", "100%": "#10b981" }}
                />
                <Title level={4} className="!mt-4">
                  Profile Strength
                </Title>
                <Text className="text-slate-400 text-sm px-4 block">
                  A complete profile increases your chances of getting hired.
                </Text>

                <div className="mt-8 text-left space-y-4 px-2">
                  <StrengthItem
                    label="Passport Photo"
                    done={!!profile.passport_img}
                  />
                  <StrengthItem
                    label="Identity Documents"
                    done={
                      !!profile.id_photo_front && !!profile.id_photo_back
                    }
                  />
                  <StrengthItem
                    label="Next of Kin Info"
                    done={!!profile.kin_name}
                  />
                  <StrengthItem
                    label="Work Preferences"
                    done={
                      !!profile.worker_type && !!profile.expected_salary
                    }
                  />
                </div>

                <Button
                  block
                  type="primary"
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setIsDrawerVisible(true)}
                  className="mt-8 h-12 rounded-xl bg-[#f3a82f] border-none font-bold shadow-lg shadow-orange-200 hover:bg-[#e69815] hover:scale-[1.02] transition-all"
                >
                  Complete Profile
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      // FIX: Only this tab shows pending invite badge (was duplicated on all 3 tabs before)
      label: (
        <Badge count={pendingInvitesCount} offset={[12, 0]}>
          <span className="px-2">Job Invites</span>
        </Badge>
      ),
      children:
        completionScore < 100 ? (
          // Profile incomplete — show lock screen
          <div className="py-20 text-center bg-white rounded-3xl mt-6 shadow-sm border border-slate-100">
            <Empty
              image={
                <LockOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />
              }
              description={
                <div className="space-y-2">
                  <Text strong className="text-lg block">
                    Job Invites are Locked
                  </Text>
                  <Text className="text-slate-400">
                    Complete your profile to 100% and get verified to see
                    invitations from employers.
                  </Text>
                  {/* FIX: Show current score so user knows exactly what's missing */}
                  <Text className="text-orange-400 font-bold block text-sm">
                    Current score: {completionScore}% — need 100%
                  </Text>
                </div>
              }
            >
              <Button
                type="primary"
                onClick={() => setIsDrawerVisible(true)}
              >
                Finish Profile Now
              </Button>
            </Empty>
          </div>
        ) : (
          // Profile complete — render WorkerRequests inside an error boundary
          // FIX: ErrorBoundary prevents a crash inside WorkerRequests from causing a white page
          <div className="mt-6">
            <ErrorBoundary fallbackLabel="Job Invites">
              <WorkerRequests />
            </ErrorBoundary>
          </div>
        ),
    },
    {
      key: "3",
      // FIX: Removed incorrect pending invite badge from Settings tab
      label: <span className="px-2">Security & Settings</span>,
      children: (
        <ErrorBoundary fallbackLabel="Account Settings">
          <AccountSettings />
        </ErrorBoundary>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 sm:mb-10 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[#f3a82f] to-[#f97316] p-5 sm:p-8 md:px-12 rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-orange-500/20 text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>

          <div className="flex items-center gap-4 sm:gap-6 z-10">
            <div className="relative flex-shrink-0">
              <Avatar
                size={72}
                src={getFullUrl(profile.passport_img)}
                icon={<UserOutlined />}
                className="border-4 border-white/80 shadow-2xl bg-white text-[#f3a82f]"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <SafetyCertificateOutlined className="text-[12px]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Title
                level={3}
                className="!m-0 !font-black !text-white drop-shadow-sm !text-xl sm:!text-2xl"
              >
                Hi, {profile.first_name || "Worker"}!
              </Title>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2 sm:gap-3 z-10 w-full md:w-auto justify-center md:justify-end">
            <Button
              onClick={() => logout()}
              ghost
              className="rounded-xl border-white/50 text-white hover:!bg-white hover:!text-orange-500 font-semibold px-4 sm:px-6"
            >
              Logout
            </Button>
            <Tag
              color={profile.is_verified ? "success" : "default"}
              className={`px-3 sm:px-6 py-2 rounded-2xl font-black border-none text-[9px] sm:text-[10px] tracking-widest uppercase flex items-center shadow-sm ${!profile.is_verified && "bg-white/20 text-white"
                }`}
            >
              {profile.is_verified ? "Verified Professional" : "Verification Pending"}
            </Tag>
          </div>
        </header>

        <style>{`
          .worker-tabs .ant-tabs-nav { overflow-x: auto !important; }
          .worker-tabs .ant-tabs-nav:before { border-bottom: none !important; }
          .worker-tabs .ant-tabs-tab { border-radius: 12px !important; margin-right: 6px !important; transition: all 0.3s; background: white; border: 1px solid #f1f5f9; color: #64748b; font-weight: 600; white-space: nowrap; font-size: 13px;}
          .worker-tabs .ant-tabs-tab:hover { color: #f3a82f !important; border-color: #f3a82f !important; }
          .worker-tabs .ant-tabs-tab-active { background: #f3a82f !important; border-color: #f3a82f !important; box-shadow: 0 4px 14px 0 rgba(243, 168, 47, 0.39); }
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const StrengthItem = ({ label, done }: { label: string; done: boolean }) => (
  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
    <span className={`text-[13px] ${done ? "text-slate-700" : "text-slate-300"}`}>
      {label}
    </span>
    {done ? (
      <CheckCircleFilled className="text-emerald-500" />
    ) : (
      <ExclamationCircleFilled className="text-amber-400" />
    )}
  </div>
);

const QuickStat = ({ icon, label, value, bgColor }: any) => (
  <Card className="rounded-2xl border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-default">
    <Space align="center" className="w-full">
      <div className={`p-4 ${bgColor} rounded-2xl text-xl shadow-inner`}>
        {icon}
      </div>
      <div className="ml-2">
        <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block leading-tight">
          {label}
        </Text>
        <Text
          strong
          className="capitalize text-slate-800 text-lg leading-tight block truncate max-w-[120px]"
        >
          {value}
        </Text>
      </div>
    </Space>
  </Card>
);

export default WorkerDashboard;
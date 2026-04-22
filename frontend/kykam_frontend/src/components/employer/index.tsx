import { useState, useEffect, useCallback } from "react";
import {
  Layout, Row, Col, Card, Statistic, Input, Select, Slider, Tag,
  Button, Avatar, Drawer, Empty, message, Tabs, Badge, Alert
} from "antd";
import {
  UserOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined,
  HistoryOutlined, SendOutlined, SafetyCertificateOutlined,
  InfoCircleOutlined, EnvironmentOutlined,
} from "@ant-design/icons";
import EmployerHires from "./EmployerHires";
import AccountSettings from "./AccountSettings";
import api from "../../api/axios";

const { Content } = Layout;
const { Option } = Select;

interface WorkerRecord {
  id: number;
  first_name: string;
  last_name: string;
  worker_type?: string | null;
  location?: string | null;
  experience?: string | null;
  expected_salary?: string | null;
  passport_img?: string | null;
  status?: string | null;
  is_available: boolean;
  age?: string | null;
}

interface EmployerStats {
  total_sent: number;
  accepted: number;
}

const formatWorkerType = (workerType?: string | null) =>
  (workerType ?? "general_househelp").replace(/_/g, " ").toUpperCase();

const EmployerDashboard = () => {
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployerStats>({ total_sent: 0, accepted: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [salaryRange, setSalaryRange] = useState([0, 100000]);

  const normalizeCollection = (payload: unknown) => {
    if (Array.isArray(payload)) return payload;
    if (
      typeof payload === "object" &&
      payload !== null &&
      "results" in payload &&
      Array.isArray((payload as { results?: unknown[] }).results)
    ) {
      return (payload as { results: WorkerRecord[] }).results;
    }
    return [];
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [workerRes, statsRes] = await Promise.all([
        api.get("/workers/", {
          params: {
            search: search || undefined,
            worker_type: category !== "all" ? category : undefined,
            min_salary: salaryRange[0] > 0 ? salaryRange[0] : undefined,
            max_salary: salaryRange[1] < 100000 ? salaryRange[1] : undefined,
          },
        }),
        api.get("/employer-dashboard/stats/"),
      ]);

      const workerPayload = normalizeCollection(workerRes.data) as WorkerRecord[];
      console.debug("Employer dashboard workers response:", workerRes.data);
      setWorkers(workerPayload);

      setStats({
        total_sent: Number(statsRes.data?.total_sent ?? 0),
        accepted: Number(statsRes.data?.accepted ?? 0),
      });
    } catch (err: any) {
      setWorkers([]);
      setStats({ total_sent: 0, accepted: 0 });
      const nextError =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to load employer dashboard data.";
      setError(nextError);
      message.error(nextError);
    } finally {
      setLoading(false);
    }
  }, [search, category, salaryRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleHireRequest = async (workerId: number, name: string) => {
    try {
      await api.post(`/workers/${workerId}/hire/`, {});
      message.success(`Hire request sent to ${name}!`);
      void fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || "Request failed");
    }
  };

  const tabItems = [
    { key: "1", label: (<span><SearchOutlined /> Find Workers</span>) },
    { key: "2", label: (<span><HistoryOutlined /> My Hires</span>) },
    { key: "3", label: "Security & Settings" },
  ];

  const renderWorkerDirectory = () => (
    <>
      {error ? (
        <Alert
          type="error"
          showIcon
          className="mb-6 rounded-2xl"
          message="Dashboard sync failed"
          description={error}
        />
      ) : null}

      <Alert
        className="mb-6 rounded-2xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-white shadow-lg animate-pulse-slow"
        message={
          <div className="flex items-center gap-4 py-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-20"></div>
              <div className="relative bg-red-600 p-3 rounded-xl shadow-md">
                <SafetyCertificateOutlined className="text-white text-2xl" />
              </div>
            </div>

            <div>
              <h4 className="m-0 font-black text-orange-900 text-base uppercase tracking-tight">
                Priority Hiring Tip
              </h4>
              <p className="m-0 text-slate-700 text-sm leading-relaxed">
                Workers with the <span className="bg-orange-200 px-1 rounded text-orange-900 font-bold italic">VERIFIED</span> badge have cleared background checks.
                <br />
                <span className="font-bold text-red-600">80% faster response time!</span>
              </p>
            </div>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by name..."
          className="h-12 rounded-xl border-none shadow-sm flex-1"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          icon={<FilterOutlined />}
          className="h-12 px-6 rounded-xl font-bold border-none shadow-sm bg-white text-slate-600"
          onClick={() => setIsFilterOpen(true)}
        >
          Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 italic">Updating listings...</div>
      ) : workers.length === 0 ? (
        <Card className="rounded-3xl border-none shadow-sm">
          <Empty description="No workers available right now." />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {workers.map((worker) => (
            <Col xs={24} sm={12} lg={6} key={worker.id}>
              <Badge.Ribbon
                text={
                  worker.status === "approved"
                    ? (worker.is_available ? "Available Now" : "Currently Busy")
                    : "Pending Verification"
                }
                color={worker.status === "approved" && worker.is_available ? "green" : "red"}
              >
                <Card
                  hoverable
                  className={`rounded-3xl border-none shadow-sm overflow-hidden ${!worker.is_available ? "bg-slate-50" : "bg-white"}`}
                  styles={{ body: { padding: "24px" } }}
                >
                  <div className="mb-4">
                    {worker.status === "approved" ? (
                      <Tag
                        icon={<SafetyCertificateOutlined />}
                        color="success"
                        className="rounded-full border-none px-3 py-1 text-[10px]"
                      >
                        VERIFIED PROFESSIONAL
                      </Tag>
                    ) : (
                      <Tag
                        icon={<InfoCircleOutlined />}
                        color="default"
                        className="rounded-full border-none px-3 py-1 text-[10px]"
                      >
                        VETTING IN PROGRESS
                      </Tag>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      size={80}
                      src={worker.passport_img}
                      icon={<UserOutlined />}
                      className={`border-4 border-slate-50 shadow-sm ${!worker.is_available ? "grayscale" : ""}`}
                    />

                    <h3 className={`mt-4 mb-1 font-bold text-base capitalize ${!worker.is_available ? "text-slate-400" : "text-slate-800"}`}>
                      {worker.first_name} {worker.last_name}
                    </h3>

                    <Tag color="orange" className="rounded-full px-3 border-none font-bold text-[10px] mb-4">
                      {formatWorkerType(worker.worker_type)}
                    </Tag>

                    <div className="w-full space-y-3 mb-6 text-xs text-slate-600">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-slate-400">Location</span>
                        <span className="font-semibold">
                          <EnvironmentOutlined className="text-orange-500" />{" "}
                          {worker.location || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-slate-400">Experience</span>
                        <span className="font-semibold">
                          <HistoryOutlined className="text-blue-500" />{" "}
                          {worker.experience || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="text-slate-400">Expected</span>
                        <span className="text-emerald-600 font-bold text-sm">
                          KSh {worker.expected_salary || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Age</span>
                        <span className="font-semibold">
                          {worker.age || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <Button
                      block
                      type="primary"
                      disabled={!worker.is_available}
                      className={!worker.is_available ? "bg-slate-200 border-none text-slate-400" : "bg-slate-900 border-none h-10 rounded-xl"}
                      onClick={() => handleHireRequest(worker.id, worker.first_name)}
                    >
                      {worker.is_available ? "Hire Now" : "Currently Busy"}
                    </Button>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}
    </>
  );

  const renderActiveTab = () => {
    if (activeTab === "2") return <EmployerHires />;
    if (activeTab === "3") return <AccountSettings />;
    return renderWorkerDirectory();
  };

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      <Content className="p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Employer Dashboard</h1>
              <p className="text-slate-500 text-sm sm:text-base">Find and manage your professional helpers.</p>
            </div>
          </header>

          <Row gutter={[20, 20]} className="mb-8">
            <Col xs={12} md={6}>
              <Card className="rounded-2xl border-none shadow-sm">
                <Statistic title="Sent" value={stats.total_sent} prefix={<SendOutlined className="text-blue-500" />} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="rounded-2xl border-none shadow-sm">
                <Statistic title="Accepted" value={stats.accepted} prefix={<CheckCircleOutlined className="text-emerald-500" />} />
              </Card>
            </Col>
          </Row>

          <Tabs
            activeKey={activeTab}
            items={tabItems}
            className="employer-tabs"
            onChange={setActiveTab}
          />

          {renderActiveTab()}
        </div>
      </Content>

      <Drawer title="Filters" onClose={() => setIsFilterOpen(false)} open={isFilterOpen}>
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            <Select value={category} className="w-full mt-2" onChange={setCategory}>
              <Option value="all">All Roles</Option>
              <Option value="nanny">Nanny</Option>
              <Option value="cook">Cook</Option>
              <Option value="house_cleaner"> House Cleaner</Option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Monthly Salary</label>
            <Slider range value={salaryRange} min={0} max={100000} step={1000} onChange={(v) => setSalaryRange(v as [number, number])} />
          </div>
          <Button block type="primary" className="bg-orange-500 border-none h-11 rounded-xl" onClick={() => setIsFilterOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
};

export default EmployerDashboard;

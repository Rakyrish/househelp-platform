import { useState, useEffect, useCallback } from "react";
import {
  Layout, Row, Col, Card, Statistic, Input, Select, Slider, Tag,
  Button, Avatar, Drawer, message, Tabs, Badge,Alert
} from "antd";
import {
  UserOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined,
  HistoryOutlined, SendOutlined, SafetyCertificateOutlined,
  InfoCircleOutlined, EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import EmployerHires from "./EmployerHires";
import AccountSettings from "./AccountSettings";

const { Content } = Layout;
const { Option } = Select;
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const EmployerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_sent: 0, accepted: 0 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [salaryRange, setSalaryRange] = useState([0, 100000]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Token ${token}` };

      // 1. Fetch Workers with active query params
      const workerRes = await axios.get(`${API}/api/workers/`, {
        headers,
        // params: {
        //   search: search || undefined,
        //   worker_type: category !== 'all' ? category : undefined,
        //   min_salary: salaryRange[0],
        //   max_salary: salaryRange[1],
        // }
      });    
      setWorkers(workerRes.data);

      // 2. Fetch Stats
      const statsRes = await axios.get(`${API}/api/employer-dashboard/stats/`, {
        headers,
      });
      setStats(statsRes.data);
    } catch (err: any) {
      message.error("Failed to sync dashboard");
    } finally {
      setLoading(false);
    }
  }, [search, category, salaryRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHireRequest = async (workerId: number, name: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/workers/${workerId}/hire/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      message.success(`Hire request sent to ${name}!`);
      fetchData(); // Refresh to update availability status immediately
    } catch (err: any) {
      message.error(err.response?.data?.error || "Request failed");
    }
  };

  const tabItems = [
    {
      key: "1",
      label: (<span><SearchOutlined /> Find Workers</span>),
      children: (
        <>
        {/* Advice Banner for Employers */}
          <Alert
            className="mb-8 rounded-2xl border-none bg-indigo-50"
            message={
              <div className="flex items-center gap-3 py-1">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <SafetyCertificateOutlined className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="m-0 font-bold text-indigo-900">Priority Hiring Tip</h4>
                  <p className="m-0 text-indigo-700 text-xs">
                    Workers with the <span className="font-black text-indigo-900">VERIFIED</span> badge have undergone mandatory ID background checks. 
                    They are 80% more likely to respond to your requests within 2 hours.
                  </p>
                </div>
              </div>
            }
            type="info"
          />
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name..."
              className="h-12 rounded-xl border-none shadow-sm flex-1"
              allowClear
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
          ) : (
            <Row gutter={[24, 24]}>
              {workers.map((worker: any) => (
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
                      className={`rounded-3xl border-none shadow-sm overflow-hidden ${!worker.is_available ? 'bg-slate-50' : 'bg-white'}`}
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
                          className={`border-4 border-slate-50 shadow-sm ${!worker.is_available ? 'grayscale' : ''}`}
                        />

                        <h3 className={`mt-4 mb-1 font-bold text-base capitalize ${!worker.is_available ? 'text-slate-400' : 'text-slate-800'}`}>
                          {worker.first_name} {worker.last_name}
                        </h3>

                        <Tag color="orange" className="rounded-full px-3 border-none font-bold text-[10px] mb-4">
                          {worker.worker_type?.replace("_", " ").toUpperCase()}
                        </Tag>

                        <div className="w-full space-y-3 mb-6 text-xs text-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Location</span>
                          <span className="font-semibold">
                            <EnvironmentOutlined className="text-orange-500" />{" "}
                            {worker.location}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Experience</span>
                          <span className="font-semibold">
                            <HistoryOutlined className="text-blue-500" />{" "}
                            {worker.experience || 0} yrs
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Expected</span>
                          <span className="text-emerald-600 font-bold text-sm">
                            KSh {worker.expected_salary?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Age</span>
                          <span className="font-semibold">
                            {worker.age} Years
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
      ),
    },
    {
      key: "2",
      label: (<span><HistoryOutlined /> My Hires</span>),
      // IMPORTANT: Pass fetchData here so releasing a worker updates the list
      children: <EmployerHires  />,
    },
    {
      key: "3",
      label: 'Security & Settings',
      // IMPORTANT: Pass fetchData here so releasing a worker updates the list
      children: <AccountSettings  />,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      <Content className="p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Employer Dashboard</h1>
              <p className="text-slate-500">Find and manage your professional helpers.</p>
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

          <Tabs items={tabItems} className="employer-tabs" />
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
            <Slider range value={salaryRange} min={0} max={100} step={1} onChange={(v) => setSalaryRange(v as [number, number])} />
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
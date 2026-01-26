import { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Statistic, Input, Select, Slider, Tag, Button, Avatar, Empty, Drawer, Badge, message  } from 'antd';
import { 
  UserOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined, 
  EnvironmentOutlined, HistoryOutlined, SendOutlined, SafetyCertificateOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { Option } = Select;
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EmployerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_sent: 0, accepted: 0 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [salaryRange, setSalaryRange] = useState([5000, 50000]);
  const [experience, setExperience] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [search, category, salaryRange, experience]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      // 1. Fetch Workers with active filters
      const workerRes = await axios.get(`${API}/api/workers/`, {
        headers,
        // params: { 
        //   search, 
        //   worker_type: category !== 'all' ? category : undefined,
        //   min_salary: salaryRange[0],
        //   max_salary: salaryRange[1],
        //   experience: experience || undefined
        // }
      });
      setWorkers(workerRes.data);

      // 2. Fetch Stats
      const statsRes = await axios.get(`${API}/api/employer-dashboard/stats/`, { headers });
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("Fetch Error:", err.response?.data);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleHireRequest = async (workerId: number, name: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/workers/${workerId}/hire/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      message.success(`Hire request sent to ${name}!`);
      fetchData(); 
    } catch (err: any) {
      message.error(err.response?.data?.error || "Request failed");
    }
  };

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      <Content className="p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 m-0">Employer Dashboard</h1>
                <p className="text-slate-500">Find and connect with verified professionals.</p>
            </div>
            <Badge count={workers.length} overflowCount={999} color="#6366f1">
                <Tag color="blue" className="m-0 px-3 py-1 rounded-full border-none font-medium">Available Workers</Tag>
            </Badge>
          </div>

          {/* Stats Section */}
          <Row gutter={[24, 24]} className="mb-10">
            <Col xs={24} md={8}>
              <Card className="rounded-2xl border-none shadow-sm" styles={{ body: { padding: '20px' } }}>
                <Statistic 
                  title="Requests Sent" 
                  value={stats.total_sent} 
                  prefix={<SendOutlined className="text-blue-500" />} 
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="rounded-2xl border-none shadow-sm" styles={{ body: { padding: '20px' } }}>
                <Statistic 
                  title="Accepted Hires" 
                  value={stats.accepted} 
                  styles={{ content: { color: '#10b981' } }}
                  prefix={<CheckCircleOutlined />} 
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-r from-slate-800 to-slate-700" styles={{ body: { padding: '20px' } }}>
                <div className="text-white">
                  <p className="opacity-70 m-0 text-xs">Membership</p>
                  <h3 className="text-lg font-bold m-0 uppercase tracking-wider text-orange-400">Standard Access</h3>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input 
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name, skills or location..."
              className="h-12 rounded-xl border-none shadow-sm flex-1"
              allowClear
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button 
              icon={<FilterOutlined />} 
              className="h-12 px-6 rounded-xl font-bold border-none shadow-sm bg-white text-slate-600 hover:text-orange-500"
              onClick={() => setIsFilterOpen(true)}
            >
              Advanced Filters
            </Button>
          </div>

          {/* Workers Grid */}
          {loading ? (
            <div className="text-center py-20 font-mono text-slate-400 italic">Searching database...</div>
          ) : (
            <Row gutter={[24, 24]}>
              {workers.map((worker: any) => (
                <Col xs={24} sm={12} lg={6} key={worker.id}>
                  <Card 
                    hoverable 
                    className="rounded-3xl border-none shadow-sm overflow-hidden group h-full"
                    styles={{ body: { padding: '24px' } }}
                  >
                    {/* Status Ribbon */}
                    <div className="mb-4">
                        {worker.status === 'approved' ? (
                            <Tag icon={<SafetyCertificateOutlined />} color="success" className="rounded-full border-none px-3 py-1 text-[10px]">
                                VERIFIED PROFESSIONAL
                            </Tag>
                        ) : (
                            <Tag icon={<InfoCircleOutlined />} color="default" className="rounded-full border-none px-3 py-1 text-[10px]">
                                VETTING IN PROGRESS
                            </Tag>
                        )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <Badge dot={worker.is_verified} offset={[-5, 5]} color="#10b981">
                        <Avatar size={80} src={worker.passport_img} icon={<UserOutlined />} className="border-4 border-slate-50 shadow-inner" />
                      </Badge>
                      
                      <h3 className="mt-4 mb-1 font-bold text-slate-800 text-base capitalize">
                        {worker.first_name} {worker.last_name}
                      </h3>
                      
                      <Tag color="orange" className="rounded-full px-3 border-none font-bold text-[10px] mb-4">
                        {worker.worker_type?.replace('_', ' ').toUpperCase()}
                      </Tag>

                      <div className="w-full space-y-3 mb-6 text-xs text-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Location</span>
                          <span className="font-semibold"><EnvironmentOutlined className="text-orange-500" /> {worker.location}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Experience</span>
                          <span className="font-semibold"><HistoryOutlined className="text-blue-500" /> {worker.experience || 0} yrs</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-slate-400">Expected</span>
                          <span className="text-emerald-600 font-bold text-sm">KSh {worker.expected_salary?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Age</span>
                          <span className="font-semibold">{worker.age} Years</span>
                        </div>
                      </div>

                      <Button 
                        block 
                        type="primary" 
                        size="large"
                        className="bg-slate-900 border-none rounded-xl font-bold group-hover:bg-orange-500 transition-all duration-300 transform group-hover:scale-105"
                        onClick={() => handleHireRequest(worker.id, worker.first_name)}
                      >
                        Send Hire Request
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {!loading && workers.length === 0 && (
            <div className="bg-white rounded-3xl p-20 shadow-sm text-center">
                <Empty description="No professionals match your current filters." />
                <Button type="link" onClick={() => {setCategory('all'); setSalaryRange([5000, 50000]); setSearch('');}}>Clear all filters</Button>
            </div>
          )}
        </div>
      </Content>

      <Drawer
        title={<span className="text-slate-800 font-bold">Refine Your Search</span>}
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        styles={{ body: { backgroundColor: '#f8fafc' } }}
        width={320}
      >
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-4">Worker Category</label>
            <Select value={category} className="w-full h-10 rounded-lg" onChange={(v) => setCategory(v)}>
              <Option value="all">All Roles</Option>
              <Option value="nanny">Nanny</Option>
              <Option value="cook">Cook</Option>
              <Option value="cleaner">Cleaner</Option>
              <Option value="gardener">Gardener</Option>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-4">Min Experience (Years)</label>
            <Select placeholder="Any Experience" className="w-full h-10" allowClear onChange={(v) => setExperience(v)}>
              <Option value={1}>1+ Years</Option>
              <Option value={3}>3+ Years</Option>
              <Option value={5}>5+ Years</Option>
              <Option value={10}>10+ Years</Option>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-4">Monthly Salary (KSh)</label>
            <Slider 
              range 
              value={salaryRange} 
              min={0} 
              max={100000} 
              step={1000}
              onChange={(v) => setSalaryRange(v as [number, number])}
              styles={{ track: { background: '#f97316' }, handle: { borderColor: '#f97316' } }}
            />
            <div className="flex justify-between text-xs font-bold mt-2 text-slate-500">
              <span>KSh {salaryRange[0].toLocaleString()}</span>
              <span>KSh {salaryRange[1].toLocaleString()}</span>
            </div>
          </div>

          <Button 
            block 
            type="primary" 
            size="large"
            className="bg-orange-500 h-12 rounded-xl font-bold border-none shadow-lg shadow-orange-200"
            onClick={() => setIsFilterOpen(false)}
          >
            Show Results
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
};

export default EmployerDashboard;
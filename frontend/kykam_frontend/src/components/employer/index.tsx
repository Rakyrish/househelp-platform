import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Spin, Row, Col, Statistic, Empty } from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  UsergroupAddOutlined, 
  HistoryOutlined,
  HomeOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Employer = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate()

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/users/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerData();
  }, []);

  if (loading) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hello, {user?.full_name?.split(' ')[0]}! 👋</h1>
            <p className="text-slate-500">Manage your home services and find trusted help.</p>
          </div>
          <Button 
            type="primary" 
            size="large" 
            icon={<SearchOutlined />}
            className="bg-[#f3a82f] hover:bg-orange-600 border-none rounded-lg h-12 px-6"
            onClick={() => Navigate('/dashboard/workerDir')  }
          >
            Find a Worker
          </Button>
        </div>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title="Active Bookings" 
                value={0} 
                prefix={<HistoryOutlined className="text-blue-500" />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title="Verified Workers Available" 
                value={124} 
                prefix={<SafetyCertificateOutlined className="text-green-500" />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm">
              <Statistic 
                title="Family Size" 
                value={user?.family_size || 0} 
                prefix={<UsergroupAddOutlined className="text-orange-500" />} 
              />
            </Card>
          </Col>
        </Row>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card title="Your Recent Requests" className="shadow-sm rounded-xl">
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="You haven't made any booking requests yet."
              >
                <Button type="default" className="border-[#f3a82f] text-[#f3a82f]">View Catalog</Button>
              </Empty>
            </Card>

            <Card title="Browse Categories" className="shadow-sm rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {['Nanny', 'Cleaner', 'Chef', 'Gardener', 'Elderly Care', 'Driver'].map((cat) => (
                  <div key={cat} className="p-4 border border-slate-100 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer text-center">
                    <p className="font-semibold text-slate-700">{cat}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Info Panel */}
          <div className="space-y-8">
            <Card title="Profile Summary" className="shadow-sm rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <HomeOutlined />
                  <span>{user?.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircleOutlined className="text-green-500" />
                  <span>Account Verified</span>
                </div>
                <hr className="border-slate-100" />
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Requirement</p>
                  <p className="text-sm font-medium text-slate-700 mt-1 capitalize">
                    Seeking: {user?.worker_type?.replace('_', ' ')}
                  </p>
                </div>
                <Button block className="mt-4 rounded-lg">Edit Preferences</Button>
              </div>
            </Card>

            <div className="bg-[#1e293b] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-lg font-bold">Trust & Safety</h3>
                  <p className="text-slate-400 text-sm mt-2">All Kykam workers undergo a mandatory 3-step vetting process including physical verification.</p>
                  <Button type="link" className="text-[#f3a82f] p-0 mt-4">Learn more →</Button>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10">
                  <SafetyCertificateOutlined style={{ fontSize: '100px' }} />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Employer;
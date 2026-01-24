import React, { useState, useEffect } from 'react';

// Removed the first declaration of Employer
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
const accent = '#f3a82f';

interface User {
  full_name?: string;
  family_size?: number;
  location?: string;
  worker_type?: string;
}

const Employer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ===== Top Header ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome back, {user?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your household services and trusted workers.
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            className="rounded-xl h-12 px-8 border-none"
            style={{ backgroundColor: accent }}
            onClick={() => navigate('/dashboard/workerDir')}
          >
            Find a Worker
          </Button>
        </div>

        {/* ===== Stats Overview ===== */}
        <Row gutter={[24, 24]} className="mb-12">
          <Col xs={24} sm={8}>
            <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all">
              <Statistic
                title="Active Bookings"
                value={0}
                prefix={<HistoryOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all">
              <Statistic
                title="Verified Workers"
                value={124}
                prefix={<SafetyCertificateOutlined className="text-green-500" />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all">
              <Statistic
                title="Family Size"
                value={user?.family_size || 0}
                prefix={<UsergroupAddOutlined className="text-orange-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* ===== Main Layout ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ===== Main Column ===== */}
          <div className="lg:col-span-2 space-y-10">

            {/* Recent Requests */}
            <Card 
              title={<span className="font-semibold">Your Recent Requests</span>} 
              className="rounded-2xl shadow-sm"
            >
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="You haven't made any booking requests yet."
              >
                <Button 
                  className="rounded-lg"
                  style={{ borderColor: accent, color: accent }}
                >
                  View Catalog
                </Button>
              </Empty>
            </Card>

            {/* Categories */}
            <Card 
              title={<span className="font-semibold">Browse Categories</span>} 
              className="rounded-2xl shadow-sm"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {['Nanny', 'Cleaner', 'Chef', 'Gardener', 'Elderly Care', 'Driver'].map((cat) => (
                  <div
                    key={cat}
                    className="p-5 border border-slate-100 rounded-xl text-center cursor-pointer
                               hover:border-orange-200 hover:bg-orange-50 transition-all"
                  >
                    <p className="font-medium text-slate-700">{cat}</p>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* ===== Side Column ===== */}
          <div className="space-y-10">

            {/* Profile Summary */}
            <Card 
              title={<span className="font-semibold">Profile Summary</span>} 
              className="rounded-2xl shadow-sm"
            >
              <div className="space-y-5">

                <div className="flex items-center gap-3 text-slate-600">
                  <HomeOutlined />
                  <span>{user?.location || 'Location not set'}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircleOutlined className="text-green-500" />
                  <span>Account Verified</span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Requirement</p>
                  <p className="text-sm font-medium text-slate-700 mt-1 capitalize">
                    Seeking: {user?.worker_type?.replace('_', ' ')}
                  </p>
                </div>

                <Button block className="rounded-xl h-11">
                  Edit Preferences
                </Button>
              </div>
            </Card>

            {/* Trust & Safety */}
            <div
              className="p-7 rounded-2xl shadow-lg relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1e293b, #020617)' }}
            >
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white">Trust & Safety</h3>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  All Kykam workers undergo a mandatory 3-step vetting process including
                  background checks and physical verification.
                </p>

                <Button
                  type="link"
                  className="p-0 mt-4"
                  style={{ color: accent }}
                >
                  Learn more →
                </Button>
              </div>

              <div className="absolute -right-6 -bottom-6 opacity-10">
                <SafetyCertificateOutlined style={{ fontSize: '120px', color: 'white' }} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Employer;

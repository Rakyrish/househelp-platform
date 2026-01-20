import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Spin, message, Tabs, Progress, Avatar } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const Worker: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetches profile data from your Django backend
        const res = await api.get('/users/profile/');
        setUser(res.data);
      } catch (e: any) {
        console.error("Profile Load Error:", e);
        message.error(e.response?.data?.detail || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center flex-col gap-4">
        <Spin size="large" />
        <p className="text-slate-500 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP BANNER */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar size={80} icon={<UserOutlined />} className="bg-orange-100 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Hello, {user?.full_name || 'Worker'}!</h1>
              <p className="text-slate-500">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
            {user?.is_verified ? (
              <Tag color="success" className="rounded-full px-4 py-1 font-medium border-none shadow-sm">
                <CheckCircleOutlined /> Fully Verified
              </Tag>
            ) : (
              <Tag color="warning" className="rounded-full px-4 py-1 font-medium border-none shadow-sm">
                <ClockCircleOutlined /> Pending Verification
              </Tag>
            )}
          </div>
        </div>

        {/* ACTIONABLE NOTIFICATION BAR */}
        {!user?.is_verified ? (
          <div className="mb-8 bg-white border-l-4 border-orange-500 shadow-sm p-5 rounded-r-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full shrink-0">
                <SafetyCertificateOutlined className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Verification in Progress</h3>
                <p className="text-sm text-slate-500">
                  Our vetting team will call you at <span className="font-semibold text-slate-700">{user?.phone}</span> for a physical interview.
                </p>
              </div>
            </div>
            <Button type="primary" className="bg-orange-600 hover:bg-orange-700 border-none h-10 px-6 rounded-lg">
              View Requirements
            </Button>
          </div>
        ) : (
          <div className="mb-8 bg-green-50 border-l-4 border-green-500 shadow-sm p-5 rounded-r-xl">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full shrink-0">
                <CheckCircleOutlined className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">You are Battle-Ready!</h3>
                <p className="text-sm text-green-700">Your profile is now visible to employers. Keep your phone nearby for job alerts.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Profile Completion" className="shadow-sm rounded-xl border-none">
              <Progress 
                percent={user?.is_verified ? 100 : 65} 
                strokeColor={user?.is_verified ? "#52c41a" : "#f3a82f"} 
                status="active" 
              />
              <p className="text-xs text-gray-500 mt-4 italic">
                <BulbOutlined className="text-orange-400" /> Tip: Workers with complete profiles get hired 3x faster.
              </p>
            </Card>

            <Card title="Quick Stats" className="shadow-sm rounded-xl border-none">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><DollarOutlined /> Total Earned</span>
                  <span className="font-bold text-green-600 text-lg">KES 0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><HistoryOutlined /> Jobs Done</span>
                  <span className="font-bold text-slate-700 text-lg">0</span>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm rounded-xl border-none">
              <Tabs 
                defaultActiveKey="1" 
                className="custom-tabs"
                items={[
                  {
                    key: '1',
                    label: 'Overview',
                    children: (
                      <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p>
                            <p className="font-medium text-slate-700 flex items-center gap-2">
                              <EnvironmentOutlined className="text-orange-500" /> {user?.location || 'Not Set'}
                            </p>
                          </div>
                          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Service Category</p>
                            <p className="font-medium text-slate-700 capitalize">
                                {user?.worker_type?.replace('_', ' ') || 'General Help'}
                            </p>
                          </div>
                        </div>
                        
                        {!user?.is_verified && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <BulbOutlined className="text-blue-500 text-lg mt-1" />
                            <div>
                                <h4 className="text-blue-800 font-bold mb-1">Physical Vetting</h4>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                  Our team needs to verify your identity. Visit us at the {user?.location || 'Main'} Office 
                                  Monday to Friday (8 AM - 4 PM).
                                </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: '2',
                    label: 'Next of Kin',
                    children: (
                      <div className="pt-2">
                         <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Primary Contact</p>
                            <p className="font-bold text-slate-700 text-lg mb-1">{user?.kin_name || 'N/A'}</p>
                            <p className="text-slate-500 flex items-center gap-2 uppercase text-xs">
                              {user?.kin_relationship} • {user?.kin_phone}
                            </p>
                         </div>
                      </div>
                    ),
                  },
                ]} 
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Worker;
import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Spin, message } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/* =======================
   Types
======================= */
interface WorkerProfile {
  full_name?: string;
  phone?: string;
  id_number?: string;
  location?: string;
  worker_type?: string;
  is_verified?: boolean;

  kin_name?: string;
  kin_relationship?: string;
  kin_phone?: string;
}

/* =======================
   Component
======================= */
const Worker: React.FC = () => {
  const [user, setUser] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWorkerData = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get<WorkerProfile>(
          `${API}/users/profile/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (error) {
        message.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.full_name || 'Worker'}!
            </h1>
            <p className="text-gray-500">
              Manage your profile and job applications.
            </p>
          </div>

          <div className="flex gap-2">
            {user?.is_verified ? (
              <Tag
                color="success"
                icon={<CheckCircleOutlined />}
                className="px-4 py-1 text-sm rounded-full"
              >
                Verified Account
              </Tag>
            ) : (
              <Tag
                color="warning"
                icon={<ClockCircleOutlined />}
                className="px-4 py-1 text-sm rounded-full"
              >
                Verification Pending
              </Tag>
            )}
          </div>
        </div>

        {/* Verification Warning */}
        {!user?.is_verified && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-center">
              <ClockCircleOutlined className="text-amber-400 text-xl" />
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Your account is currently under review. Our team will contact
                  you at <b>{user?.phone}</b> for a physical interview before you
                  can start receiving jobs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <UserOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Role</p>
                <p className="text-lg font-bold capitalize">
                  {user?.worker_type?.replace('_', ' ') || 'General Help'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <DollarOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-lg font-bold text-gray-800">
                  KES 0.00
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <EnvironmentOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Primary Location</p>
                <p className="text-lg font-bold">
                  {user?.location || 'Not set'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <Card
            title="Profile Details"
            extra={<Button type="link">Edit</Button>}
            className="shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-500 flex items-center gap-2">
                  <PhoneOutlined /> Phone
                </span>
                <span className="font-medium">{user?.phone}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-500 flex items-center gap-2">
                  <UserOutlined /> ID Number
                </span>
                <span className="font-medium text-gray-700">
                  {user?.id_number}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Next of Kin
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">
                    {user?.kin_name} ({user?.kin_relationship})
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.kin_phone}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Job History */}
          <Card title="Job History" className="shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-300 mb-4 text-5xl">📋</div>
              <h3 className="text-gray-600 font-medium">
                No jobs assigned yet
              </h3>
              <p className="text-gray-400 text-sm max-w-[250px]">
                Once you are verified, jobs in {user?.location} will appear here.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Worker;

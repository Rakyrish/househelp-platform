import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Modal,
  Form,
  Input,
  message,
  Progress,
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  HistoryOutlined,
  BellOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Worker: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mocked advanced data (replace with backend later)
  const [stats] = useState({
    totalEarned: 0,
    jobsDone: 0,
  });

  const [jobHistory] = useState([
    { id: 1, title: 'House Cleaning', date: '2025-01-10', amount: 1500, status: 'Completed' },
    { id: 2, title: 'Gardening', date: '2025-01-05', amount: 1000, status: 'Completed' },
  ]);

  const [availableJobs] = useState([
    { id: 1, title: 'Nanny Needed', location: 'Nairobi', pay: 2000 },
    { id: 2, title: 'Cook Needed', location: 'Kiambu', pay: 1800 },
  ]);

  const [editOpen, setEditOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile/');
        setUser(res.data);
      } catch (e: any) {
        console.error('Profile Load Error:', e);
        message.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  const profileFields = ['full_name', 'phone', 'location', 'worker_type', 'kin_name'];
  const completed = profileFields.filter((f) => user?.[f]).length;
  const completionPercent = Math.round((completed / profileFields.length) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {user?.full_name || 'Worker'}
            </h1>
            <p className="text-slate-500">Manage your jobs and profile.</p>
          </div>

          <div className="flex gap-3">
            <Button icon={<BellOutlined />} />
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
            <Button
              danger
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user?.is_verified ? (
              <>
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <span className="font-medium text-green-700">Fully Verified</span>
              </>
            ) : (
              <>
                <ClockCircleOutlined className="text-orange-500 text-xl" />
                <span className="font-medium text-orange-700">Pending Verification</span>
              </>
            )}
          </div>
          <Tag color={user?.is_verified ? 'green' : 'orange'}>
            {user?.is_verified ? 'Ready for Jobs' : 'Verification in Progress'}
          </Tag>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic title="Total Earned" value={stats.totalEarned} prefix={<DollarOutlined />} suffix="KES" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic title="Jobs Done" value={stats.jobsDone} prefix={<HistoryOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic title="Profile Completion" value={completionPercent} suffix="%" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic title="Account Status" value={user?.is_verified ? 'Verified' : 'Pending'} />
            </Card>
          </Col>
        </Row>

        {/* Profile Completion */}
        <Card title="Profile Completion" className="rounded-2xl shadow-sm">
          <Progress percent={completionPercent} status="active" />
          <p className="text-xs text-slate-500 mt-2">
            Complete your profile to get more job opportunities.
          </p>
        </Card>

        <Row gutter={[24, 24]}>

          {/* Job History */}
          <Col xs={24} lg={12}>
            <Card title="Job History" className="rounded-2xl shadow-sm">
              <List
                dataSource={jobHistory}
                locale={{ emptyText: 'No jobs completed yet' }}
                renderItem={(job: any) => (
                  <List.Item
                    actions={[
                      <Tag color="green">{job.status}</Tag>,
                    ]}
                  >
                    <List.Item.Meta
                      title={job.title}
                      description={`${job.date} • KES ${job.amount}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Available Jobs */}
          <Col xs={24} lg={12}>
            <Card title="Available Jobs" className="rounded-2xl shadow-sm">
              <List
                dataSource={availableJobs}
                locale={{ emptyText: 'No available jobs now' }}
                renderItem={(job: any) => (
                  <List.Item
                    actions={[
                      <Button type="primary" size="small">
                        Apply
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={job.title}
                      description={`${job.location} • KES ${job.pay}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

        </Row>

      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        title="Edit Profile"
        onCancel={() => setEditOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={user}
          onFinish={(values) => {
            console.log('Updated profile (mock):', values);
            message.success('Profile updated (mock)');
            setEditOpen(false);
          }}
        >
          <Form.Item label="Full Name" name="full_name">
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Location" name="location">
            <Input />
          </Form.Item>

          <Form.Item label="Worker Type" name="worker_type">
            <Input placeholder="e.g. cleaner, nanny" />
          </Form.Item>

          <Form.Item label="Next of Kin Name" name="kin_name">
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Worker;

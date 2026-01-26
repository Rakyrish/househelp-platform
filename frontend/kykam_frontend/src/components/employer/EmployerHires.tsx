import { useState, useEffect } from 'react';
import { 
  Table, Tag, Button, Card, message, Typography, 
  Space, Popconfirm, Avatar, Empty
} from 'antd';
import { 
  PhoneOutlined, ClockCircleOutlined, UserOutlined, 
  CloseCircleOutlined, DeleteOutlined, 
  UnlockOutlined, CheckCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EmployerHires = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/employer-dashboard/my_requests/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setData(res.data);
    } catch (err) {
      message.error("Failed to load your request history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleDelete = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/employer-dashboard/${bookingId}/remove_history/`, {
        headers: { Authorization: `Token ${token}` }
      });
      message.success("Record removed from history");
      fetchMyRequests(); 
    } catch (err: any) {
      message.error(err.response?.data?.error || "Could not remove record");
    }
  };

  const handleRelease = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/employer-dashboard/${bookingId}/release_worker/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      message.success("Professional released successfully");
      fetchMyRequests();
    } catch (err: any) {
      message.error("Failed to release worker");
    }
  };

  const columns = [
    {
      title: 'Professional',
      key: 'worker',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Avatar 
            size={48} 
            src={record.passport_img} 
            icon={<UserOutlined />} 
            className="border-2 border-white shadow-sm bg-slate-100" 
          />
          <div className="flex flex-col">
            <Text strong className="text-slate-700 capitalize text-sm leading-tight">
              {record.worker_name}
            </Text>
            <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
              {record.worker_type?.replace('_', ' ')}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string, label: string, icon: any }> = {
          accepted: { color: 'success', label: 'Active Hire', icon: <CheckCircleOutlined /> },
          pending: { color: 'processing', label: 'Awaiting Response', icon: <ClockCircleOutlined /> },
          declined: { color: 'error', label: 'Declined', icon: <CloseCircleOutlined /> },
          completed: { color: 'default', label: 'Completed', icon: <CheckCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: 'default', label: status, icon: null };
        return (
          <Tag color={config.color} icon={config.icon} className="rounded-full border-none px-3 font-bold text-[11px]">
            {config.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Initiated',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <div className="flex flex-col">
          <Text className="text-xs font-semibold text-slate-600">
            {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
          <Text className="text-[10px] text-slate-400">
            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'right' as const,
      render: (record: any) => (
        <Space>
          {record.status === 'accepted' ? (
            <>
              <Button 
                type="primary" 
                icon={<PhoneOutlined />} 
                className="bg-emerald-500 border-none rounded-xl font-bold shadow-md shadow-emerald-100 hover:!bg-emerald-600"
                onClick={() => window.open(`tel:${record.worker_phone}`)}
              >
                Call {record.worker_phone.split(' ')[0]}
              </Button>
              
              <Popconfirm
                title="Complete Job?"
                description="This will release the professional for other employers."
                onConfirm={() => handleRelease(record.id)}
                okText="Release"
                cancelText="Cancel"
                okButtonProps={{ className: 'bg-blue-600' }}
              >
                <Button 
                  icon={<UnlockOutlined />} 
                  className="rounded-xl border-slate-200 text-slate-500 hover:text-blue-500"
                >
                  Release
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Remove from history?"
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              okType="danger"
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card 
        className="rounded-[2.5rem] border-none shadow-sm overflow-hidden"
        styles={{ body: { padding: '2rem' } }}
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <Title level={4} className="!m-0 !font-black text-slate-800">History & Management</Title>
            <Text className="text-slate-400">Track and manage your current professional engagements.</Text>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchMyRequests}
            loading={loading}
            className="rounded-2xl border-slate-100 h-12 px-6 font-bold text-slate-500 shadow-sm"
          >
            Refresh
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading} 
          rowKey="id"
          pagination={{ pageSize: 6, hideOnSinglePage: true }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hiring history found" className="py-12" /> }}
          className="custom-management-table"
        />
      </Card>

      <style>{`
        .custom-management-table .ant-table { background: transparent !important; }
        .custom-management-table .ant-table-thead > tr > th { 
          background: #f8fafc !important; 
          color: #94a3b8 !important; 
          text-transform: uppercase !important; 
          font-size: 10px !important; 
          letter-spacing: 0.1em !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .custom-management-table .ant-table-tbody > tr > td { border-bottom: 1px solid #f8fafc !important; padding: 16px !important; }
        .custom-management-table .ant-table-row:hover > td { background: #fdfdfd !important; }
      `}</style>
    </div>
  );
};

export default EmployerHires;
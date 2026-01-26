import { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, message, Typography, Badge } from 'antd';
import { PhoneOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EmployerHires = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/employer-dashboard/my_requests/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setData(res.data);
    } catch (err) {
      message.error("Failed to load your request history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyRequests(); }, []);

  const columns = [
    {
      title: 'Professional',
      dataIndex: 'worker_name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-slate-400" />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        // let color = status === 'accepted' ? 'emerald' : status === 'pending' ? 'blue' : 'gray';
        return (
          <Badge 
            status={status === 'accepted' ? 'success' : status === 'pending' ? 'processing' : 'default'} 
            text={<span className="capitalize font-medium">{status}</span>} 
          />
        );
      },
    },
    {
      title: 'Sent On',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <Text type="secondary" className="text-xs">
          <ClockCircleOutlined /> {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Contact Info',
      key: 'action',
      render: (record: any) => (
        record.status === 'accepted' ? (
          <Button 
            type="primary" 
            icon={<PhoneOutlined />} 
            size="small"
            className="bg-emerald-500 border-none rounded-lg"
            onClick={() => window.open(`tel:${record.worker_phone}`)}
          >
            {record.worker_phone}
          </Button>
        ) : (
          <Tag color="default" className="border-none bg-slate-100 text-slate-400">Locked</Tag>
        )
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <div className="mb-6">
          <Title level={4} className="m-0">Request History</Title>
          <Text type="secondary">Track the workers you've contacted and get their details once they accept.</Text>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading} 
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default EmployerHires;
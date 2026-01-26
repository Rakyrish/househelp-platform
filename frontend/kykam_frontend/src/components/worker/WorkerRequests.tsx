import { useState, useEffect } from 'react';
import { Card, Button, List, Avatar, message, Empty, Badge, Typography, Space, Divider } from 'antd';
import { 
  CheckOutlined, CloseOutlined, UserOutlined, 
  HomeOutlined, PhoneOutlined, DollarOutlined, 
  TeamOutlined, CalendarOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const WorkerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/worker-requests/my_invites/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      message.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleResponse = async (id: number, status: 'accepted' | 'declined') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/worker-requests/${id}/respond_to_request/`, 
        { status },
        { headers: { Authorization: `Token ${token}` } }
      );
      message.success(`Request ${status} successfully`);
      fetchRequests(); 
    } catch (err) {
      message.error("Action failed");
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <Title level={2} className="!mb-1 !font-black text-slate-800">Job Invites</Title>
            <Text className="text-slate-500 text-base">You have <span className="text-orange-600 font-bold">{requests.filter((r:any) => r.status === 'pending').length}</span> new opportunities waiting.</Text>
          </div>
          <Button onClick={fetchRequests} type="text" className="text-blue-600 font-semibold hover:bg-blue-50">Refresh</Button>
        </div>
        
        <List
          loading={loading}
          dataSource={requests}
          locale={{ 
            emptyText: <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span className="text-slate-400">No job requests at the moment.</span>} 
            /> 
          }}
          renderItem={(req: any) => (
            <Card 
              key={req.id} 
              className={`mb-6 rounded-3xl border-none shadow-sm transition-all hover:shadow-md overflow-hidden ${req.status === 'accepted' ? 'ring-2 ring-emerald-500/20' : ''}`}
              styles={{ body: { padding: '0' } }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <Avatar 
                      size={64} 
                      src={req.employer_image}
                      icon={<UserOutlined />} 
                      className="bg-orange-100 text-orange-600 border-2 border-white shadow-sm" 
                    />
                    <div>
                      <Title level={4} className="!m-0 !font-bold text-slate-800">
                        {req.employer_name}
                      </Title>
                      <Space split={<Divider type="vertical" />} className="text-slate-400 text-xs mt-1">
                         <span className="flex items-center gap-1"><HomeOutlined /> {req.location || 'Remote'}</span>
                         <span className="flex items-center gap-1"><CalendarOutlined /> {new Date().toLocaleDateString()}</span>
                      </Space>
                    </div>
                  </div>
                  <Badge 
                    className="mt-1"
                    status={req.status === 'accepted' ? 'success' : req.status === 'pending' ? 'processing' : 'default'} 
                    text={<Text strong className="uppercase text-[10px] tracking-widest text-slate-400">{req.status}</Text>} 
                  />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
                  <div className="flex flex-col">
                    <Text className="text-[10px] uppercase text-slate-400 font-bold">Offer Salary</Text>
                    <Text strong className="text-emerald-600"><DollarOutlined /> KSh {req.salary?.toLocaleString()}</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] uppercase text-slate-400 font-bold">Family Size</Text>
                    <Text strong><TeamOutlined /> {req.family_size || 'N/A'} Persons</Text>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex gap-3">
                  {req.status === 'pending' ? (
                    <>
                      <Button 
                        block
                        type="primary"
                        icon={<CheckOutlined />} 
                        className="bg-emerald-500 hover:!bg-emerald-600 border-none rounded-xl h-12 font-bold shadow-lg shadow-emerald-200"
                        onClick={() => handleResponse(req.id, 'accepted')}
                      >
                        Accept Offer
                      </Button>
                      <Button 
                        danger 
                        icon={<CloseOutlined />} 
                        className="rounded-xl h-12 px-8 font-bold border-slate-200 hover:bg-red-50"
                        onClick={() => handleResponse(req.id, 'declined')}
                      >
                        Decline
                      </Button>
                    </>
                  ) : req.status === 'accepted' ? (
                    <Button 
                      block
                      type="primary"
                      icon={<PhoneOutlined />}
                      className="h-12 rounded-xl bg-blue-600 hover:!bg-blue-700 font-bold border-none shadow-lg shadow-blue-200"
                      onClick={() => window.open(`tel:${req.employer_phone}`)}
                    >
                      Call Employer Now ({req.employer_phone || 'undefined'})
                    </Button>
                  ) : (
                    <Button block disabled className="h-12 rounded-xl border-dashed">
                      Request was {req.status}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Decorative Footer for accepted items */}
              {req.status === 'accepted' && (
                <div className="bg-emerald-50 px-6 py-2 text-center text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                  You are currently hired for this position
                </div>
              )}
            </Card>
          )}
        />
      </div>
    </div>
  );
};

export default WorkerRequests;
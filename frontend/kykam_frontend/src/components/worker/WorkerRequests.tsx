import { useState, useEffect } from 'react';
import { Card, Button, Tag, List, Avatar, message, Empty, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const WorkerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      // UPDATED: Added /my_invites/ to match the ViewSet action
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
      // UPDATED: matches @action(detail=True) respond_to_request in views.py
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Job Invites</h2>
        <p className="text-slate-500">Respond to employers who want to hire you.</p>
      </div>
      
      <List
        loading={loading}
        dataSource={requests}
        locale={{ emptyText: <Empty description="No job requests yet. Keep your profile updated!" /> }}
        renderItem={(req: any) => (
          <Card key={req.id} className="mb-4 rounded-2xl shadow-sm border-none overflow-hidden" styles={{ body: { padding: '20px' } }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar size={64} icon={<UserOutlined />} className="bg-orange-100 text-orange-600" />
                <div>
                  <h4 className="text-lg font-bold m-0 text-slate-800">
                    {req.employer_name}
                  </h4>
                  <div className="flex gap-4 text-slate-500 text-xs mt-1">
                    <span><HomeOutlined /> {req.location || 'Location not set'}</span>
                    <Badge 
                        status={req.status === 'accepted' ? 'success' : req.status === 'pending' ? 'processing' : 'default'} 
                        text={<span className="capitalize">{req.status}</span>} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {req.status === 'pending' ? (
                  <>
                    <Button 
                      icon={<CheckOutlined />} 
                      className="bg-emerald-500 text-white border-none rounded-xl h-10 px-6 font-bold hover:bg-emerald-600"
                      onClick={() => handleResponse(req.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button 
                      danger 
                      icon={<CloseOutlined />} 
                      className="rounded-xl h-10 px-6 font-bold border-slate-200"
                      onClick={() => handleResponse(req.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </>
                ) : req.status === 'accepted' ? (
                  <Button 
                    type="primary"
                    icon={<PhoneOutlined />}
                    className="h-10 rounded-xl bg-blue-600 font-bold border-none"
                    onClick={() => window.open(`tel:${req.employer_phone}`)}
                  >
                    Call Employer
                  </Button>
                ) : (
                  <Tag color="default" className="rounded-full px-4 py-1 border-none">Request {req.status}</Tag>
                )}
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default WorkerRequests;
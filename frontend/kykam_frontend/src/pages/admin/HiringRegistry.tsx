import { useState } from 'react';
import { Table, Tag, Space, Button, Input, message, Popconfirm, Tooltip } from 'antd';
import { 
  SearchOutlined, 
  SafetyOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios'; // Or your custom api instance

interface HireRecord {
  id: number;
  employer_name: string;
  worker_name: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  worker_type: string;
}

const HiringRegistry = ({ hires = [], loading, refreshData }: { 
  hires: HireRecord[], 
  loading: boolean,
  refreshData: () => void 
}) => {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  

  const filteredData = hires.filter(record => 
    record.employer_name.toLowerCase().includes(searchText.toLowerCase()) ||
    record.worker_name.toLowerCase().includes(searchText.toLowerCase()) ||
    record.id.toString().includes(searchText)
  );

const handleAdminAction = async (id: number, action: 'approve' | 'withdraw' | 'complete') => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      message.error("Session expired. Please log in again.");
      return;
    }

    const config = {
      headers: { Authorization: `Token ${token}` },
    };

    setActionLoading(id);

    try {
      if (action === 'withdraw') {
        await axios.delete(`/api/admin/manage-hires/${id}/withdraw_request/`, config);
        message.success("Engagement removed from registry.");
      } else {
        const statusMap = { approve: 'accepted', complete: 'completed' };
        await axios.post(
          `/api/admin/manage-hires/${id}/force_action/`, 
          { status: statusMap[action] }, 
          config
        );
        message.success(`Status updated to ${statusMap[action]}`);
      }
      
      // TRIGGER STATE UPDATE: This tells the parent component to re-fetch the list
      // so that the specific row's status tag updates instantly.
      await refreshData(); 

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Action unauthorized or server error.";
      message.error(errorMsg);
      console.error("Debug Admin Action:", err.response);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      title: 'Registry ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <span className="font-mono text-cyan-500">#{id.toString().padStart(4, '0')}</span>,
    },
    {
      title: 'The Connection (Employer → Worker)',
      key: 'connection',
      render: (_: any, record: HireRecord) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{record.employer_name}</span>
            <span className="text-blue-600 text-[10px] italic">requested</span>
            <span className="text-cyan-400 font-bold">{record.worker_name}</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            Category: {record.worker_type?.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'date',
      render: (date: string) => (
        <div className="text-xs text-slate-400">
          <HistoryOutlined className="mr-1" />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Current Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'gold',
          accepted: 'cyan',
          completed: 'blue',
          declined: 'red'
        };
        return (
          <Tag color={colors[status]} className="rounded-md border-none px-3 font-bold text-[10px] uppercase">
            {status === 'accepted' ? 'Active Engagement' : status}
          </Tag>
        );
      },
    },
    {
      title: 'Admin Interference',
      key: 'interference',
      align: 'right' as const,
      render: (record: HireRecord) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Force Accept on behalf of Worker">
                <Button 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading === record.id}
                  className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white"
                  onClick={() => handleAdminAction(record.id, 'approve')}
                >
                  Approve
                </Button>
              </Tooltip>

              <Popconfirm
                title="Withdraw this request?"
                description="This will delete the request from both users' dashboards."
                onConfirm={() => handleAdminAction(record.id, 'withdraw')}
                okText="Yes, Withdraw"
                cancelText="No"
              >
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                  loading={actionLoading === record.id}
                >
                  Withdraw
                </Button>
              </Popconfirm>
            </>
          )}

          {record.status === 'accepted' && (
            <Button 
              size="small" 
              icon={<CloseCircleOutlined />}
              className="text-slate-400 border-slate-700"
              onClick={() => handleAdminAction(record.id, 'complete')}
            >
              Force Complete
            </Button>
          )}

          <Button 
            size="small" 
            type="text" 
            icon={<InfoCircleOutlined />} 
            className="text-slate-500"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="dashboard-card p-6 bg-white/[0.02] border border-white/5 rounded-2xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <SafetyOutlined className="text-cyan-400" /> Hiring Registry & Dispatch
          </h3>
          <p className="text-xs text-slate-500">Monitor and manually manage professional-employer connections</p>
        </div>
        <Input 
          prefix={<SearchOutlined className="text-slate-500" />} 
          placeholder="Search employer, worker or ID..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-[300px] bg-white/5 border-white/10 text-white rounded-xl h-10"
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 8, showSizeChanger: false }}
        className="admin-custom-table"
        locale={{ emptyText: <span className="text-slate-500">No transactions found</span> }}
      />

      <style>{`
        .admin-custom-table .ant-table { background: transparent !important; color: #94a3b8 !important; }
        .admin-custom-table .ant-table-thead > tr > th { 
          background: rgba(255,255,255,0.03) !important; 
          color: #64748b !important; 
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          font-size: 10px;
          text-transform: uppercase;
        }
        .admin-custom-table .ant-table-tbody > tr > td { 
          border-bottom: 1px solid rgba(255,255,255,0.03) !important; 
        }
        .admin-custom-table .ant-table-row:hover > td { 
          background: rgba(255,255,255,0.02) !important; 
        }
        .ant-popover-inner { background: #1e293b !important; border: 1px solid #334155; }
        .ant-popover-message-title { color: white !important; }
      `}</style>
    </div>
  );
};

export default HiringRegistry;
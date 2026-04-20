import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  List,
  Avatar,
  message,
  Empty,
  Typography,
  Tag,
  Space,
  Spin,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import api from '../../api/axios'

const { Title, Text } = Typography


const statusColor: Record<string, string> = {
  pending: 'processing',
  accepted: 'success',
  declined: 'default',
}

const normalizeToArray = (data: any): any[] => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  if (data && Array.isArray(data.data)) return data.data
  console.warn('[WorkerRequests] Unexpected API shape — defaulting to []', data)
  return []
}

const WorkerRequests = () => {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('worker-requests/my_invites/')
      setRequests(normalizeToArray(res.data))
      console.log('the data is ', res.data);

    } catch (err: any) {
      console.error('[WorkerRequests] fetch error:', err)
      message.error('Failed to load requests')
      setRequests([]) // FIX: ensure state stays an array even on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleResponse = async (
    id: number,
    status: 'accepted' | 'declined'
  ) => {
    setActionLoading(id)
    try {
      const res = await api.post(`worker-requests/${id}/respond_to_request/`, {
        status,
      })

      message.success(`Request ${status}`)
      fetchRequests()
    } catch (err: any) {
      console.error('[WorkerRequests] respond error:', err)
      message.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  // FIX: guard with Array.isArray before calling .filter()
  const safeRequests = Array.isArray(requests) ? requests : []
  const pendingCount = safeRequests.filter(r => r.status === 'pending').length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-orange-50 to-amber-50 p-8 shadow-sm border border-orange-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Title level={2} className="!mb-1 !font-extrabold text-slate-800">
                Job Invitations
              </Title>
              <Text className="text-slate-600 text-base">
                You have{' '}
                <span className="font-bold text-[#f3a82f] bg-orange-100 px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>{' '}
                pending {pendingCount === 1 ? 'request' : 'requests'}
              </Text>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRequests}
              loading={loading}
              size="large"
              className="rounded-xl font-semibold border-orange-200 text-orange-600 hover:!text-orange-700 hover:!border-orange-400"
            >
              Refresh List
            </Button>
          </div>
        </div>

        {/* LIST */}
        <List
          loading={loading}
          dataSource={safeRequests}  // FIX: use safeRequests, never raw requests
          locale={{
            emptyText: (
              <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm text-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-slate-500 font-medium text-lg">
                      No job invites yet
                    </span>
                  }
                />
              </div>
            ),
          }}
          renderItem={(req: any) => (
            <Card
              key={req.id}
              className="mb-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f3a82f]/10 overflow-hidden relative"
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <Avatar
                    size={64}
                    src={req.passport_img}
                    icon={<UserOutlined />}
                    className="bg-orange-100 text-orange-600 shadow-inner"
                  />
                  <div>
                    <Title level={4} className="!mb-0">
                      {req.employer_name}
                    </Title>
                    <Space size="middle" className="text-slate-500 text-sm">
                      <span>
                        <HomeOutlined /> {req.location || 'Remote'}
                      </span>
                      <span>
                        <CalendarOutlined /> {req.start_date || 'Flexible'}
                      </span>
                    </Space>
                  </div>
                </div>

                <Tag
                  color={statusColor[req.status] ?? 'default'}
                  className="rounded-full px-4 py-1 font-bold uppercase text-xs"
                >
                  {req.status}
                </Tag>
              </div>

              {/* INFO GRID */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4">
                <InfoItem
                  label="Salary"
                  value={`KSh ${req.salary?.toLocaleString() ?? 'N/A'}`}
                  icon={<DollarOutlined />}
                  highlight
                />
                <InfoItem
                  label="Family Size"
                  value={`${req.family_size ?? 'N/A'} persons`}
                  icon={<TeamOutlined />}
                />
                <InfoItem
                  label="Start Date"
                  value={req.start_date || 'Not stated'}
                  icon={<CalendarOutlined />}
                />
                <InfoItem
                  label="⚠ Requirements"
                  value={req.requirements || 'Not stated'}
                  className={
                    req.requirements
                      ? 'bg-red-50 border border-red-200 rounded-xl p-3 text-red-700'
                      : 'opacity-50'
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">
                {req.status === 'pending' && (
                  <>
                    <Button
                      block
                      type="primary"
                      size="large"
                      icon={<CheckOutlined />}
                      loading={actionLoading === req.id}
                      className="rounded-xl bg-emerald-500 hover:!bg-emerald-600 font-bold border-none"
                      onClick={() => handleResponse(req.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      block
                      danger
                      size="large"
                      icon={<CloseOutlined />}
                      loading={actionLoading === req.id}
                      className="rounded-xl font-bold"
                      onClick={() => handleResponse(req.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </>
                )}

                {req.status === 'accepted' && (
                  <Button
                    block
                    type="primary"
                    size="large"
                    icon={<PhoneOutlined />}
                    className="rounded-xl bg-blue-600 hover:!bg-blue-700 font-bold border-none"
                    onClick={() => window.open(`tel:${req.employer_phone}`)}
                  >
                    Call Employer ({req.employer_phone})
                  </Button>
                )}

                {req.status === 'declined' && (
                  <Button block disabled size="large">
                    Request Declined
                  </Button>
                )}
              </div>
            </Card>
          )}
        />
      </div>
    </div>
  )
}

// ─── Sub-component ────────────────────────────────────────────────────────────
const InfoItem = ({
  label,
  value,
  icon,
  highlight = false,
  className = '',
}: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <Text className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
      {label}
    </Text>
    <Text
      strong
      className={`flex items-center gap-1 ${highlight ? 'text-emerald-600' : ''}`}
    >
      {icon} {value}
    </Text>
  </div>
)

export default WorkerRequests
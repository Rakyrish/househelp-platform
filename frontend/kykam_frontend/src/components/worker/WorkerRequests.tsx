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
import axios from 'axios'

const { Title, Text } = Typography
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const statusColor: Record<string, string> = {
  pending: 'processing',
  accepted: 'success',
  declined: 'default',
}

const WorkerRequests = () => {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API}/api/worker-requests/my_invites/`, {
        headers: { Authorization: `Token ${token}` },
      })
      setRequests(res.data)
    } catch {
      message.error('Failed to load requests')
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
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API}/api/worker-requests/${id}/respond_to_request/`,
        { status },
        { headers: { Authorization: `Token ${token}` } }
      )
      message.success(`Request ${status}`)
      fetchRequests()
    } catch {
      message.error('Action failed')
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-10 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-1 !font-extrabold">
                Job Invitations
              </Title>
              <Text type="secondary">
                You have{' '}
                <span className="font-bold text-orange-600">
                  {pendingCount}
                </span>{' '}
                pending requests
              </Text>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRequests}
              className="rounded-xl font-semibold"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* LIST */}
        <List
          loading={loading}
          dataSource={requests}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No job invites yet"
              />
            ),
          }}
          renderItem={(req: any) => (
            <Card
              key={req.id}
              className="mb-6 rounded-3xl border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              bodyStyle={{ padding: 24 }}
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <Avatar
                    size={64}
                    src={req.employer_image}
                    icon={<UserOutlined />}
                    className="bg-orange-100 text-orange-600"
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
                        <CalendarOutlined />{' '}
                        {req.start_date || 'Flexible'}
                      </span>
                    </Space>
                  </div>
                </div>

                <Tag
                  color={statusColor[req.status]}
                  className="rounded-full px-4 py-1 font-bold uppercase text-xs"
                >
                  {req.status}
                </Tag>
              </div>

              {/* INFO */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4">
                <InfoItem
                  label="Salary"
                  value={`KSh ${req.salary?.toLocaleString()}`}
                  icon={<DollarOutlined />}
                  highlight
                />
                <InfoItem
                  label="Family Size"
                  value={`${req.family_size || 'N/A'} persons`}
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
                      className="rounded-xl bg-emerald-500 hover:!bg-emerald-600 font-bold"
                      onClick={() =>
                        handleResponse(req.id, 'accepted')
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      block
                      danger
                      size="large"
                      icon={<CloseOutlined />}
                      className="rounded-xl font-bold"
                      onClick={() =>
                        handleResponse(req.id, 'declined')
                      }
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
                    className="rounded-xl bg-blue-600 hover:!bg-blue-700 font-bold"
                    onClick={() =>
                      window.open(`tel:${req.employer_phone}`)
                    }
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

const InfoItem = ({
  label,
  value,
  icon,
  highlight = false,
}: any) => (
  <div className="flex flex-col gap-1">
    <Text className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
      {label}
    </Text>
    <Text
      strong
      className={`flex items-center gap-1 ${
        highlight ? 'text-emerald-600' : ''
      }`}
    >
      {icon} {value}
    </Text>
  </div>
)

export default WorkerRequests

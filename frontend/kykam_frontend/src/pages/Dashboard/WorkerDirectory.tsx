import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Card,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Button,
  Spin,
  message,
  Modal,
  Empty,
} from 'antd'
import {
  EnvironmentOutlined,
  UserOutlined,
  VerifiedOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { Search } = Input
const { Option } = Select

const API = import.meta.env.VITE_API_BASE_URL || 'https://kykamagencies.co.ke'

const getFullUrl = (path?: string) =>
  path?.startsWith('http') ? path : path ? `${API}${path}` : undefined

const WorkerDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // URL-synced state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  )
  const [category, setCategory] = useState(
    searchParams.get('type') || 'all'
  )

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const res = await axios.get(`${API}/api/workers/`, {
        headers: {
          Authorization: `Token ${token}`, // change to Bearer if using JWT
        },
        params: {
          worker_type: category !== 'all' ? category : undefined,
          search: searchTerm || undefined,
        },
      })

      setWorkers(res.data)
    } catch (err) {
      message.error('Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  // 🔁 Sync filters → URL
  useEffect(() => {
    setSearchParams({
      search: searchTerm || '',
      type: category,
    })
  }, [searchTerm, category])

  // ⏳ Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchWorkers, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, category])

  const handleHireRequest = (worker: any) => {
    Modal.confirm({
      title: `Hire ${worker.first_name}?`,
      content: `Send a request to ${worker.first_name}. They will see your profile once they accept.`,
      okText: 'Send Request',
      okButtonProps: { className: 'bg-[#f3a82f] border-none' },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token')
          await axios.post(
            `${API}/api/bookings/create/`,
            { worker_id: worker.id },
            {
              headers: { Authorization: `Token ${token}` },
            }
          )
          message.success(`Request sent to ${worker.first_name}!`)
        } catch (err: any) {
          message.error(
            err.response?.data?.error || 'Failed to send request'
          )
        }
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Find Trusted Help
          </h1>
          <p className="text-slate-500">
            Verified professionals for your home.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <Search
            placeholder="Search name or location..."
            allowClear
            enterButton
            className="md:w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={setSearchTerm}
          />

          <Select
            value={category}
            className="w-full md:w-48"
            onChange={setCategory}
          >
            <Option value="all">All Categories</Option>
            <Option value="nanny">Nannies</Option>
            <Option value="house_cleaner">Cleaners</Option>
            <Option value="cook">Chefs</Option>
            <Option value="gardener">Gardeners</Option>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : workers.length === 0 ? (
          <Empty description="No workers found matching your filters." />
        ) : (
          <Row gutter={[24, 24]}>
            {workers.map((worker) => (
              <Col xs={24} sm={12} lg={6} key={worker.id}>
                <Card
                  hoverable
                  className="rounded-2xl border-none shadow-sm overflow-hidden"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="h-24 bg-[#fef3c7]" />

                  <div className="px-6 pb-6 -mt-12 text-center">
                    <Avatar
                      size={100}
                      src={getFullUrl(worker.passport_img)}
                      icon={<UserOutlined />}
                      className="border-4 border-white shadow-md bg-white"
                    />

                    <h3 className="text-lg font-bold mt-3">
                      {worker.first_name}{' '}
                      {worker.is_verified && (
                        <VerifiedOutlined className="text-blue-500 ml-1" />
                      )}
                    </h3>

                    <p className="text-orange-500 font-medium text-sm mb-4 capitalize">
                      {worker.worker_type?.replace('_', ' ')}
                    </p>

                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-6">
                      <EnvironmentOutlined />
                      {worker.location || 'Nairobi'}
                    </div>

                    <Button
                      block
                      type="primary"
                      onClick={() => handleHireRequest(worker)}
                      className="bg-[#1e293b] border-none h-11 rounded-xl font-semibold"
                    >
                      Hire Request
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

export default WorkerDirectory

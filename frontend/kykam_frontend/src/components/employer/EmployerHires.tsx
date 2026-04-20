import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  message,
  Typography,
  Space,
  Popconfirm,
  Avatar,
  Empty,
  Alert,
} from "antd";
import {
  PhoneOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { CircleAlert } from "lucide-react";
import api from "../../api/axios";

const { Title, Text } = Typography;

interface HireRecord {
  id: number;
  worker_name: string;
  worker_type?: string | null;
  passport_img?: string | null;
  status: string;
  date: string;
  worker_phone?: string | null;
}

const EmployerHires = () => {
  const [data, setData] = useState<HireRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeCollection = (payload: unknown): HireRecord[] => {
    if (Array.isArray(payload)) return payload as HireRecord[];
    if (
      typeof payload === "object" &&
      payload !== null &&
      "results" in payload &&
      Array.isArray((payload as { results?: unknown[] }).results)
    ) {
      return (payload as { results: HireRecord[] }).results;
    }
    return [];
  };

  const formatDate = (date: string, options: Intl.DateTimeFormatOptions) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }
    return parsedDate.toLocaleDateString("en-GB", options);
  };

  const formatTime = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "--:--";
    }
    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/employer-dashboard/my_requests/");
      console.debug("Employer hires response:", res.data);
      setData(normalizeCollection(res.data));
    } catch (err: any) {
      const nextError =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to load your request history.";
      setError(nextError);
      message.error(nextError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyRequests();
  }, []);

  const handleDelete = async (bookingId: number) => {
    try {
      await api.delete(`/employer-dashboard/${bookingId}/remove_history/`);
      message.success("Record removed from history");
      void fetchMyRequests();
    } catch (err: any) {
      message.error(err.response?.data?.error || "Could not remove record");
    }
  };

  const handleRelease = async (bookingId: number) => {
    try {
      await api.post(`/employer-dashboard/${bookingId}/release_worker/`, {});
      message.success("Professional released successfully");
      void fetchMyRequests();
    } catch (err: any) {
      message.error("Failed to release worker");
    }
  };

  // Status Config Helper
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> =
      {
        accepted: {
          color: "success",
          label: "Active Hire",
          icon: <CheckCircleOutlined />,
        },
        pending: {
          color: "processing",
          label: "Awaiting Response",
          icon: <ClockCircleOutlined />,
        },
        declined: {
          color: "error",
          label: "Declined",
          icon: <CloseCircleOutlined />,
        },
        completed: {
          color: "default",
          label: "Completed",
          icon: <CheckCircleOutlined />,
        },
      };
    return configs[status] || { color: "default", label: status, icon: null };
  };

  const columns = [
    {
      title: "Professional",
      key: "worker",
      render: (_: unknown, record: HireRecord) => (
        <Space size="middle">
          <Avatar
            size={48}
            src={record.passport_img}
            icon={<UserOutlined />}
            className="border-2 border-white shadow-sm bg-slate-100"
          />
          <div className="flex flex-col">
            <Text
              strong
              className="text-slate-700 capitalize text-sm leading-tight"
            >
              {record.worker_name}
            </Text>
            <Text
              type="secondary"
              className="text-[10px] font-bold uppercase tracking-widest text-blue-500"
            >
              {record.worker_type?.replace("_", " ")}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            className="rounded-full border-none px-3 font-bold text-[11px]"
          >
            {config.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Initiated",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <div className="flex flex-col">
          <Text className="text-xs font-semibold text-slate-600">
            {formatDate(date, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text className="text-[10px] text-slate-400">
            {formatTime(date)}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: HireRecord) => (
        <Space>
          {record.status === "accepted" ? (
            <>
              <Button
                type="primary"
                icon={<PhoneOutlined />}
                className="bg-emerald-500 border-none rounded-xl font-bold shadow-md shadow-emerald-100 hover:!bg-emerald-600"
                onClick={() => window.open(`tel:${record.worker_phone}`)}
              >
                Call
              </Button>
              <Popconfirm
                title="Complete Job?"
                description="Release the professional?"
                onConfirm={() => handleRelease(record.id)}
                okText="Release"
                cancelText="Cancel"
              >
                <Button
                  icon={<UnlockOutlined />}
                  className="rounded-xl border-slate-200 text-slate-500"
                >
                  Release
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Remove?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-slate-300 hover:text-red-500"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card
        className="rounded-3xl md:rounded-[2.5rem] border-none shadow-xl overflow-hidden"
        styles={{ body: { padding: "1.5rem" } }}
      >
        {error ? (
          <Alert
            type="error"
            showIcon
            className="mb-6 rounded-2xl"
            message="Unable to load hires"
            description={error}
          />
        ) : null}

        {/* Advice Banner */}
    <Alert
  className="mb-6 rounded-2xl border-2  border-red-500 bg-white shadow-xl shadow-red-50 overflow-hidden relative"
  style={{ animationDuration: '10s' }}
  message={
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 py-2 px-1">
      {/* 1. Icon Section - Glassmorphism style with red icon */}
      <div className="flex-shrink-0 bg-white bg-opacity-50 backdrop-blur-sm p-2 rounded-full border border-red-200">
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
          <CircleAlert className="text-red-600 text-2xl md:text-3xl animate-bounce " />
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
          <h4 className="m-0 font-black text-red-700 text-base md:text-lg uppercase tracking-tight">
            Action Required: End of Contract
          </h4>
          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase">
            Mandatory
          </span>
        </div>
        
        <p className="m-0 text-slate-600 text-sm md:text-base leading-relaxed">
          When your professional's contract ends, you <span className="font-bold text-red-600">must</span> click 
          <span className="mx-2 px-3 py-1 bg-red-600 text-white rounded-lg font-black text-xs shadow-md inline-block transform hover:scale-105 transition-transform">
            RELEASE
          </span> 
          to finalize the record and help others in the Kykam community to get to the worker.
        </p>
      </div>

      {/* 3. Right-side decorative accent */}
      <div className="absolute right-0 top-0 h-full w-1.5 bg-red-600 hidden md:block" />
    </div>
  }
/>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Title
              level={3}
              className="!m-0 !font-black text-slate-800 tracking-tight"
            >
              Management
            </Title>
            <Text className="text-slate-400 text-sm">
              Monitor your current hires and history.
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void fetchMyRequests()}
            loading={loading}
            className="rounded-xl border-slate-200 h-10 px-4 font-bold text-slate-500 w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 6, hideOnSinglePage: true }}
            className="custom-management-table"
            locale={{ emptyText: <Empty description="No history found" /> }}
          />
        </div>

        {/* Mobile View (List of Cards) */}
        <div className="md:hidden flex flex-col gap-4">
          {loading ? (
            <div className="py-10 text-center text-slate-400">
              Loading records...
            </div>
          ) : data.length === 0 ? (
            <Empty description="No history found" />
          ) : (
            data.map((record) => {
              const config = getStatusConfig(record.status);
              return (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Space>
                      <Avatar
                        src={record.passport_img}
                        size={50}
                        className="border-2 border-white shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-slate-800 capitalize leading-tight">
                          {record.worker_name}
                        </div>
                        <div className="text-[10px] font-bold text-blue-500 uppercase">
                          {record.worker_type?.replace("_", " ")}
                        </div>
                      </div>
                    </Space>
                    <Tag
                      color={config.color}
                      className="rounded-full m-0 text-[10px] font-bold border-none"
                    >
                      {config.label}
                    </Tag>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      Request Date
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      {formatDate(record.date, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {record.status === "accepted" ? (
                      <>
                        <Button
                          block
                          type="primary"
                          icon={<PhoneOutlined />}
                          className="bg-emerald-500 border-none rounded-xl h-10 font-bold"
                          onClick={() =>
                            window.open(`tel:${record.worker_phone}`)
                          }
                        >
                          Call ({record.worker_phone})
                        </Button>
                        <Popconfirm
                          title="Release Professional?"
                          onConfirm={() => handleRelease(record.id)}
                        >
                          <Button
                            block
                            icon={<UnlockOutlined />}
                            className="rounded-xl h-10 border-slate-200"
                          >
                            Release
                          </Button>
                        </Popconfirm>
                      </>
                    ) : (
                      <Button
                        block
                        danger
                        type="dashed"
                        icon={<DeleteOutlined />}
                        className="rounded-xl h-10"
                        onClick={() => handleDelete(record.id)}
                      >
                        Remove History
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
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

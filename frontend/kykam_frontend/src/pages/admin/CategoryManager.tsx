import { useState, useEffect } from 'react';
import { Table, Button, Tag, Switch, Modal, Form, Input, message, Space } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  AppstoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();

  // Load Categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/admin/categories/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      message.error("Failed to load categories");
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Handle Visibility Toggle (Quick Action)
  const toggleVisibility = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/api/admin/categories/${id}/`, 
        { is_active: !currentStatus },
        { headers: { Authorization: `Token ${token}` }}
      );
      message.success("Category status updated");
      fetchCategories();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const columns = [
    {
      title: 'Icon & Name',
      key: 'name',
      render: (record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
             <span className="text-lg">{record.icon_emoji || '💼'}</span>
          </div>
          <div>
            <div className="text-white font-bold">{record.name}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{record.slug}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Total Workers',
      dataIndex: 'worker_count',
      key: 'count',
      render: (count: number) => <Tag color="blue">{count || 0} Professionals</Tag>
    },
    {
      title: 'Visibility',
      key: 'status',
      render: (record: any) => (
        <Space size="middle">
          <Switch 
            size="small"
            checked={record.is_active} 
            onChange={() => toggleVisibility(record.id, record.is_active)}
          />
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            {record.is_active ? <><EyeOutlined className="mr-1"/> Live</> : <><EyeInvisibleOutlined className="mr-1"/> Hidden</>}
          </span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined className="text-slate-400 hover:text-cyan-400" />} 
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {/* Add Delete Logic */}}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <AppstoreOutlined className="text-cyan-400" /> Service Taxonomy
          </h3>
          <p className="text-xs text-slate-500">Define what services are available for hire</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
          className="bg-cyan-600 border-none hover:bg-cyan-500 rounded-lg h-9"
        >
          Add Category
        </Button>
      </div>

      <Table 
        dataSource={categories} 
        columns={columns} 
        rowKey="id"
        pagination={false}
        className="admin-custom-table"
      />

      <Modal
        title={<span className="text-white">{editingCategory ? 'Edit Category' : 'Create New Category'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="cyber-modal"
      >
        <Form form={form} layout="vertical" onFinish={fetchCategories} className="pt-4">
          <Form.Item name="name" label="Display Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Electrician" className="bg-white/5 border-white/10 text-white" />
          </Form.Item>
          <Form.Item name="icon_emoji" label="Icon (Emoji)" tooltip="This appears on the mobile app">
            <Input placeholder="e.g. ⚡" className="bg-white/5 border-white/10 text-white" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="bg-white/5 border-white/10 text-white" />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)} className="border-white/10 text-slate-400">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-cyan-500 border-none">Save Category</Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        .cyber-modal .ant-modal-content { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); }
        .cyber-modal label { color: #94a3b8 !important; }
      `}</style>
    </div>
  );
};

export default CategoryManager;

import { Card, Form, Input, Button, Divider, Modal, message } from 'antd';
import { LockOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';

const AccountSettings = () => {
  const [form] = Form.useForm();
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleChangePassword = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/worker/dashboard/change_password/`, values, {
        headers: { Authorization: `Token ${token}` }
      });
      message.success("Password updated successfully!");
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to update password.");
    }
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: 'Are you absolutely sure?',
      icon: <WarningOutlined className="text-red-500" />,
      content: 'This will permanently delete your worker profile and you will no longer appear in search results for employers.',
      okText: 'Delete My Account',
      okType: 'danger',
      onOk: () => {
        // API call to delete account
        message.loading("Closing account...");
      },
    });
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Security & Privacy</h3>
        <p className="text-slate-500 text-sm">Update your password to keep your account safe.</p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleChangePassword}>
        <Form.Item 
          name="old_password" 
          label="Current Password" 
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item 
          name="new_password" 
          label="New Password" 
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Password must be at least 8 characters' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Button type="primary" htmlType="submit" className="bg-[#f3a82f] border-none rounded-lg">
          Update Password
        </Button>
      </Form>

      <Divider className="my-8" />

      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
        <h4 className="text-red-800 font-bold mb-1">Danger Zone</h4>
        <p className="text-red-600 text-sm mb-4">
          Permanently delete your account and all associated job history. This action cannot be undone.
        </p>
        <Button danger type="dashed" onClick={confirmDelete}>
          Delete Account
        </Button>
      </div>
    </Card>
  );
};

export default AccountSettings;
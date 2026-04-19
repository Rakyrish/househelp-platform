
import { Card, Form, Input, Button, Divider, Modal, message } from 'antd';
import { LockOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';

const AccountSettings = () => {
  const [form] = Form.useForm();
  const API = import.meta.env.VITE_API_BASE_URL;

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
    content: (
      <div className="text-slate-600">
        This will deactivate your account.
        <br />
        You will be logged out immediately and your profile will no longer be visible.
      </div>
    ),
    okText: 'Yes, deactivate my account',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        const token = localStorage.getItem('token');

        message.loading({ content: 'Closing account...', key: 'delete' });

        await axios.patch(
          `${API}/api/account/deactivate/`,
          {},
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        localStorage.removeItem('token');

        message.success({
          content: 'Account deactivated successfully',
          key: 'delete',
        });

        // Redirect after delete
        window.location.href = '/login';
      } catch (err: any) {
        message.error(
          err.response?.data?.error || 'Failed to deactivate account'
        );
      }
    },
  });
};


  return (
    <Card className="rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2 sm:p-6 mb-8 mt-2">
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-slate-800">Security & Privacy</h3>
        <p className="text-slate-500 text-base mt-2">Update your password regularly to keep your Kykam account secure.</p>
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

        <Button type="primary" size="large" htmlType="submit" className="bg-[#f3a82f] hover:!bg-[#e69815] border-none rounded-xl font-bold shadow-lg shadow-orange-500/20 px-8 mt-2">
          Update Password
        </Button>
      </Form>

      <Divider className="my-10 border-slate-200" />

      <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <WarningOutlined className="text-red-500 text-2xl" />
          <h4 className="text-red-800 font-extrabold text-xl m-0">Danger Zone</h4>
        </div>
        <p className="text-red-600 text-base mb-6">
          Permanently delete your account and all associated job history. This action cannot be undone.
        </p>
        <Button danger type="dashed" size="large" className="rounded-xl font-bold hover:!bg-red-100 px-6" onClick={confirmDelete}>
          Delete My Account
        </Button>
      </div>
    </Card>
  );
};

export default AccountSettings;
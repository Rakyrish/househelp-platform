import { useState, useEffect } from 'react';
import { Form, Input, Switch, Button, Divider, message, Alert } from 'antd';
import { 
  LockOutlined, 
  ThunderboltOutlined, 
  NotificationOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;
const PlatformSettings = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form] = Form.useForm();

  // 1. FETCH CURRENT SETTINGS ON LOAD
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API}/api/admin-panel/platform-settings/`);
        form.setFieldsValue(data);
      } catch (err) {
        message.error("Could not load current system status.");
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, [form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Use relative path to leverage Vite Proxy
      await axios.post(`${API}/api/admin-panel/platform-settings/`, values, {
        headers: { Authorization: `Token ${token}` }
      });
      message.success("Platform configuration deployed live!");
    } catch (err) {
      message.error("Failed to update system settings. Check Admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center text-slate-500">Loading Control Panel...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Alert
        message={<span className="font-bold text-amber-500">Live Production Control..</span>}
        description="Changes made here affect all users in real-time. Toggling Maintenance Mode will redirect all non-admin users to the evolution screen."
        type="warning"
        showIcon
        className="bg-amber-500/5 border-amber-500/20 text-slate-400 rounded-2xl"
      />

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Security & Access */}
          <section className="space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4">
              <LockOutlined className="text-cyan-400" /> Access Control
            </h3>
            
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:border-cyan-500/30 transition-all">
              <div>
                <p className="text-white text-sm font-bold m-0">Maintenance Mode</p>
                <p className="text-[10px] text-slate-500 m-0">Redirect users to evolution page</p>
              </div>
              <Form.Item name="maintenance_mode" valuePropName="checked" noStyle>
                <Switch className="bg-slate-700" />
              </Form.Item>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:border-cyan-500/30 transition-all">
              <div>
                <p className="text-white text-sm font-bold m-0">Open Registrations</p>
                <p className="text-[10px] text-slate-500 m-0">Allow new professionals/employers</p>
              </div>
              <Form.Item name="allow_new_registrations" valuePropName="checked" noStyle>
                <Switch className="bg-slate-700" />
              </Form.Item>
            </div>
          </section>

          {/* Contact & Support */}
          <section className="space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4">
              <NotificationOutlined className="text-purple-400" /> Global Metadata
            </h3>
            
            {/* NEW: BROADCAST MESSAGE FIELD */}
            <Form.Item 
              name="broadcast_message" 
              label={<span className="text-slate-400 text-xs">Maintenance Broadcast (Visible to Users)</span>}
            >
              <Input.TextArea 
                placeholder="e.g. Upgrading M-Pesa gateway. Back in 30 mins."
                className="bg-white/5 border-white/10 text-white rounded-xl" 
                rows={2} 
              />
            </Form.Item>

            <Form.Item name="support_email" label={<span className="text-slate-400 text-xs">Admin Contact Email</span>}>
              <Input className="bg-white/5 border-white/10 text-white h-11 rounded-xl" />
            </Form.Item>
          </section>
        </div>

        <Divider className="border-white/5 my-10" />

        {/* Startup Specifics */}
        <section className="bg-cyan-500/5 border border-cyan-500/10 p-8 rounded-3xl mb-8">
          <h3 className="text-white font-bold flex items-center gap-2 mb-2">
            <GlobalOutlined className="text-cyan-400" /> Startup Launch Mode
          </h3>
          <p className="text-xs text-slate-400 mb-6">Phase: **Seed/Beta**. Payments handled offline (KSh).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Worker Limit</p>
                <p className="text-lg text-white font-bold">Unlimited</p>
             </div>
             <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Platform Region</p>
                <p className="text-lg text-white font-bold">Kenya (KSh)</p>
             </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<ThunderboltOutlined />}
            className="bg-cyan-500 border-none h-12 px-10 rounded-2xl font-bold text-[#050b14] hover:scale-105 transition-transform"
          >
            Deploy Settings
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PlatformSettings;
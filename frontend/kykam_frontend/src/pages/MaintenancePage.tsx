import { Typography, Button, Space } from 'antd';
import { 
  SettingOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message }: MaintenancePageProps) => {
  
  // Check if an admin is trying to access while the system is locked
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  const handleReload = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white-400 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full z-10">
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl text-center">
          
          {/* Animated Status Icon */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-black/40 border border-amber-500/30 p-5 rounded-full">
              <SettingOutlined className="text-4xl text-amber-500" spin />
            </div>
          </div>

          <Title level={2} className="text-white !mb-2 !font-bold">
            System Evolution
          </Title>
          
          <Paragraph className="text-slate-400 text-sm mb-8 leading-relaxed">
            The marketplace is currently undergoing scheduled maintenance to improve our professional dispatch services.
          </Paragraph>

          {/* Dynamic Broadcast Message Box */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl mb-8">
            <Text className="text-[10px] text-amber-500/50 uppercase font-black tracking-[0.2em] block mb-2">
              Broadcast
            </Text>
            <Text className="text-slate-200 italic font-medium">
              "{message || "Optimizing registry performance. We'll be back online shortly."}"
            </Text>
          </div>

          <Space direction="vertical" className="w-full" size="middle">
            <Button 
              type="primary" 
              icon={<LoadingOutlined />}
              onClick={handleReload}
              className="w-full bg-cyan-500 border-none h-12 rounded-xl font-bold text-[#050b14] hover:scale-[1.02] transition-transform"
            >
              Check Status
            </Button>

          </Space>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
            <GlobalOutlined className="text-xs" />
            {/* <span className="text-[10px] uppercase tracking-widest font-bold">Region: Kenya (KSh)</span> */}
          </div>
          <Text className="text-[10px] text-slate-700 uppercase tracking-tighter">
            &copy; 2026 KYKAM PLATFORM MANAGEMENT • ALL RIGHTS RESERVED
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
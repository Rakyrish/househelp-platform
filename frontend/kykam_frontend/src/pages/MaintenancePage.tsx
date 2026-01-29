import { Typography, Button, Space } from 'antd';
import { 
  SettingOutlined, 
  GlobalOutlined, 
  LoadingOutlined,
  MailOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface MaintenancePageProps {
  message?: string;
  support_email?: string; // Defined from your backend
}

const MaintenancePage = ({ message, support_email = "support@kykam.com" }: MaintenancePageProps) => {
  
  const handleReload = () => {
    window.location.href = '/';
  };

  return (
    // FIXED: Changed to a deep, professional midnight navy/black
    <div className="min-h-screen bg-[#fff] flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-200">
      
      {/* Soft Ambient Glows - purely for depth, not "hellish" colors */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[130px] rounded-full" />

      <div className="max-w-md w-full z-10">
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center">
          
          {/* Status Icon with soft amber glow */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-slate-800 border border-slate-700 p-5 rounded-3xl shadow-inner">
              <SettingOutlined className="text-4xl text-amber-500" spin />
            </div>
          </div>

          <Title level={2} className="!text-white !mb-2 !font-black tracking-tight">
            System Upgrade
          </Title>
          
          <Paragraph className="text-slate-400 text-sm mb-8 leading-relaxed">
            KYKAM is currently fine-tuning its engines. We’re upgrading our infrastructure to serve you better.
          </Paragraph>

          {/* Broadcast Message Box */}
          <div className="bg-white/[1] border border-white/5 p-5 rounded-2xl mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
                <ThunderboltOutlined className="text-amber-500 text-xs" />
                <Text className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
                    Live Update
                </Text>
            </div>
            <Text className="text-slate-200 italic font-medium block">Message From Admin:
           <span style={{color: "GrayText"}} > "{message || "Optimizing dispatch services and professional registry."}"</span>  
            </Text>
          </div>

          <Space direction="vertical" className="w-full" size="middle">
            <Button 
              type="primary" 
              icon={<LoadingOutlined />}
              onClick={handleReload}
              className="w-full bg-cyan-600 border-none h-14 rounded-2xl font-bold text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20"
            >
              Check Status
            </Button>

            {/* Support Email Integration */}
            <div className="mt-4 pt-6 border-t border-white/5">
              <Text className="text-slate-500 text-[11px] block mb-1">Reach our technical team:</Text>
              <a 
                href={`mailto:${support_email}`} 
                className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <MailOutlined className="text-sm" />
                <span className="font-semibold tracking-wide">{support_email}</span>
              </a>
            </div>
          </Space>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center opacity-40">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <GlobalOutlined className="text-xs" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Network Status: Optimizing</span>
          </div>
          <Text className="text-[9px] text-slate-500 uppercase tracking-tighter">
            &copy; 2026 KYKAM PLATFORM • ALL SYSTEMS SECURED
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
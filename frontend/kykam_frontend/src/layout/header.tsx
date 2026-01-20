import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, Popover, List, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const Header = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 1. Notifications State must be INSIDE the component
  const [notifications] = useState([
    { id: 1, text: "Welcome to Kykam! Complete your profile.", read: false },
    { id: 2, text: "Verification tip: Upload a clear ID photo.", read: false }
  ]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const PRIMARY_COLOR = "#f3a82f";
  const DARK_BG = "#1e293b";
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);

  // 2. Content for the notification dropdown
  const notificationContent = (
    <List
      size="small"
      className="w-64"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item className="cursor-pointer hover:bg-gray-50 p-3">
          <Typography.Text className="text-xs text-gray-600">
            {item.text}
          </Typography.Text>
        </List.Item>
      )}
    />
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setOpenLogin(false);
      }
      if (registerRef.current && !registerRef.current.contains(event.target as Node)) {
        setOpenRegister(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenLogin(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 mb-1 w-full px-6 md:px-10 h-[70px] flex items-center justify-between shadow-lg border-b-2" 
            style={{ backgroundColor: DARK_BG, borderColor: PRIMARY_COLOR }}>
      
      {/* Logo */}
      <div className="flex items-center gap-3 justify-start ml-[-20px] cursor-pointer" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="Kykam Logo" className="h-[45px] w-[45px] rounded" />
        <h1 className="text-2xl md:text-3xl font-bold flex flex-col md:flex-row md:items-baseline" style={{ color: PRIMARY_COLOR }}>
          Kykam
          <sub className="text-white text-xs md:text-sm font-normal ml-1">Househelp connect</sub>
        </h1>
      </div>

      {/* Mobile Toggle */}
      <button className="md:hidden text-white text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={`
        fixed md:static top-[70px] left-0 w-full md:w-auto
        flex flex-col md:flex-row items-center gap-6 md:gap-8
        p-10 md:p-0 transition-all duration-300 ease-in
        ${isMenuOpen ? 'bg-[#1e293b] translate-x-0 z-50' : 'hidden md:flex translate-x-full md:translate-x-0'}
      `}>
        <a href="/" className="text-white hover:text-[#f3a82f] transition-colors font-medium">Home</a>
        <a href="/about" className="text-white hover:text-[#f3a82f] transition-colors font-medium">About</a>
        
        {!user ? (
          <>
            {/* Login Dropdown */}
            <div className="relative" ref={loginRef}>
              <button onClick={() => { setOpenLogin(!openLogin); setOpenRegister(false); }} className="text-[#f3a82f] font-medium flex items-center gap-1 cursor-pointer">
                Login {openLogin ? '▴' : '▾'}
              </button>
              {openLogin && (
                <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-lg shadow-2xl py-2 z-[100]">
                  <a onClick={() => { navigate('/login/employer'); setOpenLogin(false); }} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer">As Employer</a>
                  <div className="border-t border-gray-100" />
                  <a onClick={() => { navigate('/login/worker'); setOpenLogin(false); }} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer">As Worker</a>
                </div>
              )}
            </div>

            {/* Register Dropdown */}
            <div className="relative" ref={registerRef}>
              <button onClick={() => { setOpenRegister(!openRegister); setOpenLogin(false); }}
                className="px-5 py-2 rounded-md font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: PRIMARY_COLOR, color: DARK_BG }}>
                Register {openRegister ? '▴' : '▾'}
              </button>
              {openRegister && (
                <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-lg shadow-2xl py-2 z-[100]">
                  <a onClick={() => { navigate('/register/employer'); setOpenRegister(false); }} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer">As Employer</a>
                  <div className="border-t border-gray-100" />
                  <a onClick={() => { navigate('/register/worker'); setOpenRegister(false); }} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer">As Worker</a>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Logged In UI */
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            

            <button onClick={() => navigate(user.role === 'worker' ? '/dashboard/worker' : '/dashboard/employer')}
                className="text-white hover:text-[#f3a82f] transition-colors font-medium border-l border-gray-600 pl-4">
                Dashboard
            </button>
            <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm italic">Hi, {user.name}</span>
                <div className="mr-2">
              <Popover content={notificationContent} title="Notifications" trigger="click" placement="bottomRight">
                <Badge count={notifications.length} size="small">
                  <BellOutlined className="text-xl text-white cursor-pointer hover:text-[#f3a82f] transition-colors" />
                </Badge>
              </Popover>
            </div>
                <button onClick={handleLogout}
                    className="px-4 py-1.5 border-2 border-[#f3a82f] text-[#f3a82f] rounded-md font-bold hover:bg-[#f3a82f] hover:text-white transition-all">
                    Logout
                </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
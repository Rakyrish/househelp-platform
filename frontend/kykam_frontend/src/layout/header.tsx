import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Badge, Popover, List, Typography } from "antd";
import {
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

const Header = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [notifications] = useState([
    { id: 1, text: "Welcome to Kykam! Complete your profile.", read: false },
    { id: 2, text: "Verification tip: Upload a clear ID photo.", read: false },
  ]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const PRIMARY_COLOR = "#f3a82f";
  const DARK_BG = "#1e293b";
 
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);

  const notificationContent = (
    <List
      size="small"
      className="w-72"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item className="cursor-pointer hover:bg-orange-50 transition-colors p-3 border-b last:border-b-0">
          <div className="flex flex-col gap-1">
            <Typography.Text className="text-sm text-gray-800">
              {item.text}
            </Typography.Text>
            <span className="text-[10px] text-gray-400 uppercase font-bold">
              Just now
            </span>
          </div>
        </List.Item>
      )}
    />
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (loginRef.current && !loginRef.current.contains(target)) {
        setOpenLogin(false);
      }
      if (registerRef.current && !registerRef.current.contains(target)) {
        setOpenRegister(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenLogin(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const NavLink = ({ href, children }) => (
    <a
      href={href}
      className="text-gray-100 hover:text-[#f3a82f] transition-all duration-300 font-medium text-lg md:text-base"
    >
      {children}
    </a>
  );

  return (
    <header
      className="sticky top-0 z-50 mb-0.5 w-full px-4 md:px-10 h-[70px] flex items-center justify-between shadow-xl"
      style={{
        backgroundColor: DARK_BG,
        borderBottom: `3px solid ${PRIMARY_COLOR}`,
      }}
    >
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/")}
      >
        <div className="overflow-hidden rounded-lg border border-gray-700">
          <img
            src="/logo.png"
            alt="Kykam Logo"
            className="h-[45px] w-[45px] transition-transform group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: PRIMARY_COLOR }}
          >
            KYKAM
          </h1>
          <span className="text-white text-[10px] uppercase tracking-widest font-light opacity-80">
            Househelp Connect
          </span>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <CloseOutlined className="text-xl" />
        ) : (
          <MenuOutlined className="text-xl" />
        )}
      </button>

      {/* Backdrop for Mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation Menu */}
      <nav
        className={`
        fixed md:static top-0 right-0 h-[60%] md:h-auto w-[60%] md:w-auto
        flex flex-col md:flex-row items-center gap-8 md:gap-8
        p-12 md:p-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMenuOpen ? "translate-x-0 bg-[#1e293b]" : "translate-x-full md:translate-x-0 bg-transparent"}
        z-50
      `}
      >
        {/* Mobile-only Close Header */}
        <div
          className="md:hidden absolute top-5 right-5 text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          <CloseOutlined className="text-xl" />
        </div>

        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About</NavLink>

        {!user ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Login Dropdown */}
            <div className="relative" ref={loginRef}>
              <button
                onClick={() => {
                  setOpenLogin(!openLogin);
                  setOpenRegister(false);
        
                }}
                className="text-white hover:text-[#f3a82f] font-semibold flex items-center gap-2 transition-colors"
              >
                Login{" "}
                <CaretDownOutlined
                  className={`text-xs transition-transform ${openLogin ? "rotate-180" : ""}`}
                />
              </button>
              {openLogin && (
                <div className="absolute top-full right-0 md:left-0 mt-4 w-48 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      navigate("/login/employer");
                      setOpenLogin(false);
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
                  >
                    As Employer
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => {
                      navigate("/login/worker");
                      setOpenLogin(false);
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
                  >
                    As Worker
                  </button>
                </div>
              )}
            </div>

            {/* Register Button */}
            <div className="relative" ref={registerRef}>
              <button
                onClick={() => {
                  setOpenRegister(!openRegister);
                  setOpenLogin(false);
                }}
                className="px-6 py-2.5 rounded-full font-bold shadow-lg transform active:scale-95 transition-all hover:brightness-110"
                style={{ backgroundColor: PRIMARY_COLOR, color: DARK_BG }}
              >
                Register <CaretDownOutlined className="text-xs ml-1" />
              </button>
              {openRegister && (
                <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-xl shadow-2xl overflow-hidden">
                  <button
                    onClick={() => {
                      navigate("/register/employer");
                      setOpenRegister(false);
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                  >
                    As Employer
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => {
                      navigate("/register/worker");
                      setOpenRegister(false);
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                  >
                    As Worker
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged In UI */
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-px w-10 bg-gray-600 md:h-8 md:w-px" />

            <div className="flex items-center gap-4">
              {user.role === "worker" && 
              <Popover
                content={notificationContent}
                title={<span className="font-bold">Notifications</span>}
                trigger="click"
                placement="bottomRight"
              >
                <Badge
                  count={notifications.length}
                  offset={[-2, 5]}
                  size="small"
                  color="#f3a82f"
                >
                  <BellOutlined className="text-2xl text-white cursor-pointer hover:text-[#f3a82f] transition-colors" />
                </Badge>
              </Popover>
              }
              

              <div className="flex flex-row items-end gap-1 whitespace-nowrap flex ">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Welcome
                </span>
                <span className="text-white text-sm font-medium">
                 {" "} {user.name}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(
                  user.role === "worker"
                    ? "/dashboard/worker"
                    : "/dashboard/employer",
                )
              }
              className="text-white hover:text-[#f3a82f] font-medium transition-colors"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="px-5 py-1.5 border-2 border-[#f3a82f] text-[#f3a82f] rounded-full font-bold hover:bg-[#f3a82f] hover:text-[#1e293b] transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

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
  // FIX: separate open state for desktop vs mobile dropdowns
  const [openLoginDesktop, setOpenLoginDesktop] = useState(false);
  const [openRegisterDesktop, setOpenRegisterDesktop] = useState(false);
  const [openLoginMobile, setOpenLoginMobile] = useState(false);
  const [openRegisterMobile, setOpenRegisterMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [notifications] = useState([
    { id: 1, text: "Welcome to Kykam! Complete your profile.", read: false },
    { id: 2, text: "Verification tip: Upload a clear ID photo.", read: false },
  ]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const PRIMARY_COLOR = "#f3a82f";
  const DARK_BG = "#1e293b";

  // FIX: separate refs for desktop and mobile
  const loginDesktopRef = useRef<HTMLDivElement>(null);
  const registerDesktopRef = useRef<HTMLDivElement>(null);
  const loginMobileRef = useRef<HTMLDivElement>(null);
  const registerMobileRef = useRef<HTMLDivElement>(null);

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

      // Desktop click-outside
      if (loginDesktopRef.current && !loginDesktopRef.current.contains(target)) {
        setOpenLoginDesktop(false);
      }
      if (registerDesktopRef.current && !registerDesktopRef.current.contains(target)) {
        setOpenRegisterDesktop(false);
      }

      // Mobile click-outside
      if (loginMobileRef.current && !loginMobileRef.current.contains(target)) {
        setOpenLoginMobile(false);
      }
      if (registerMobileRef.current && !registerMobileRef.current.contains(target)) {
        setOpenRegisterMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenLoginDesktop(false);
    setOpenLoginMobile(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-gray-100 hover:text-[#f3a82f] transition-all duration-300 font-medium text-lg md:text-base"
    >
      {children}
    </a>
  );

  // FIX: desktop auth buttons — use desktop state + refs
  const renderDesktopAuthButtons = () => (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Login Dropdown — Desktop */}
      <div className="relative" ref={loginDesktopRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenLoginDesktop((v) => !v);
            setOpenRegisterDesktop(false);
          }}
          className="text-white hover:text-[#f3a82f] font-semibold flex items-center gap-2 transition-colors"
        >
          Login{" "}
          <CaretDownOutlined
            className={`transition-transform text-xs ${openLoginDesktop ? "rotate-180" : ""}`}
          />
        </button>
        {openLoginDesktop && (
          <div className="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            <button
              onClick={() => {
                navigate("/login/employer");
                setOpenLoginDesktop(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
            >
              As Employer
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => {
                navigate("/login/worker");
                setOpenLoginDesktop(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
            >
              As Worker
            </button>
          </div>
        )}
      </div>

      {/* Register Dropdown — Desktop */}
      <div className="relative" ref={registerDesktopRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenRegisterDesktop((v) => !v);
            setOpenLoginDesktop(false);
          }}
          className="rounded-full font-bold shadow-lg transform active:scale-95 transition-all hover:brightness-110 flex items-center justify-center px-6 py-2.5"
          style={{ backgroundColor: PRIMARY_COLOR, color: DARK_BG }}
        >
          Register <CaretDownOutlined className="text-xs ml-1" />
        </button>
        {openRegisterDesktop && (
          <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
            <button
              onClick={() => {
                navigate("/register/employer");
                setOpenRegisterDesktop(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              As Employer
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => {
                navigate("/register/worker");
                setOpenRegisterDesktop(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              As Worker
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // FIX: mobile auth buttons — use separate mobile state + refs, proper z-index
  const renderMobileAuthButtons = () => (
    <div className="flex flex-row items-center gap-3">
      {/* Login Dropdown — Mobile */}
      <div className="relative" ref={loginMobileRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenLoginMobile((v) => !v);
            setOpenRegisterMobile(false);
          }}
          className="text-white hover:text-[#f3a82f] font-semibold flex items-center gap-1 transition-colors text-sm"
        >
          Login{" "}
          <CaretDownOutlined
            className={`transition-transform text-[10px] ${openLoginMobile ? "rotate-180" : ""}`}
          />
        </button>
        {openLoginMobile && (
          <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-xl shadow-2xl overflow-hidden z-[9999]">
            <button
              onClick={() => {
                navigate("/login/employer");
                setOpenLoginMobile(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
            >
              As Employer
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => {
                navigate("/login/worker");
                setOpenLoginMobile(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] transition-colors"
            >
              As Worker
            </button>
          </div>
        )}
      </div>

      {/* Register Dropdown — Mobile */}
      <div className="relative" ref={registerMobileRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenRegisterMobile((v) => !v);
            setOpenLoginMobile(false);
          }}
          className="rounded-full font-bold shadow-lg transform active:scale-95 transition-all hover:brightness-110 flex items-center justify-center px-4 py-1.5 text-xs"
          style={{ backgroundColor: PRIMARY_COLOR, color: DARK_BG }}
        >
          Register <CaretDownOutlined className="text-[10px] ml-1" />
        </button>
        {openRegisterMobile && (
          <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-xl shadow-2xl overflow-hidden z-[9999]">
            <button
              onClick={() => {
                navigate("/register/employer");
                setOpenRegisterMobile(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              As Employer
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => {
                navigate("/register/worker");
                setOpenRegisterMobile(false);
              }}
              className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              As Worker
            </button>
          </div>
        )}
      </div>
    </div>
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
          <span className="text-white text-[10px] uppercase tracking-widest font-light opacity-80 md:block hidden">
            Househelp Connect
          </span>
        </div>
      </div>

      {/* Mobile Right Section */}
      <div className="md:hidden">
        {user ? (
          // Logged-in mobile: show hamburger
          <button
            className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <CloseOutlined className="text-xl" />
            ) : (
              <MenuOutlined className="text-xl" />
            )}
          </button>
        ) : (
          // FIX: not-logged-in mobile: use isolated mobile auth buttons
          renderMobileAuthButtons()
        )}
      </div>

      {/* Backdrop for Mobile */}
      {isMenuOpen && user && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation */}
      <nav
        className={`
          ${!user ? "hidden md:flex" : isMenuOpen ? "flex translate-x-0" : "hidden md:flex md:translate-x-0"}
          fixed md:static top-0 right-0 h-[100dvh] md:h-auto w-3/4 sm:w-1/2 md:w-auto
          flex-col md:flex-row items-center gap-6 md:gap-8
          pt-20 pb-10 px-8 md:p-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isMenuOpen ? "bg-[#1e293b]" : "bg-transparent"}
          z-50 overflow-y-auto md:overflow-visible
        `}
      >
        {/* Mobile-only Close Button */}
        <div
          className="md:hidden absolute top-5 right-5 text-white cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        >
          <CloseOutlined className="text-xl" />
        </div>

        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About</NavLink>

        {!user ? (
          // FIX: desktop nav uses isolated desktop auth buttons
          renderDesktopAuthButtons()
        ) : (
          /* Logged In UI */
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-px w-10 bg-gray-600 md:h-8 md:w-px" />

            <div className="flex items-center gap-4">
              {user.role === "worker" && (
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
              )}

              <div className="flex flex-row items-end gap-1 whitespace-nowrap">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  Welcome
                </span>
                <span className="text-white text-sm font-medium">
                  {" "}{user.name}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(
                  user.role === "worker"
                    ? "/worker/dashboard"
                    : "/employer/dashboard"
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
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile toggle

  const PRIMARY_COLOR = "#f3a82f";
  const DARK_BG = "#1e293b";
  const navigate = useNavigate();

 
const loginRef = useRef<HTMLDivElement>(null);
const registerRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full px-6 md:px-10 h-[70px] flex items-center justify-between shadow-lg border-b-2" 
            style={{ backgroundColor: DARK_BG, borderColor: PRIMARY_COLOR }}>
      
      {/* Logo Section */}
      <div className="flex items-center gap-3 justify-start ml-[-20px]" onClick={() => navigate('/')}  >
        <img src="/logo.png" alt="Kykam Logo" className="h-[45px] w-[45px] rounded" />
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: PRIMARY_COLOR, fontSize: '2.5rem' }}>
        Kykam
        <sub className="text-white text-sm font-normal ml-1">
          Househelp connect
        </sub>
      </h1>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white text-2xl"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* Navigation - Responsive Logic */}
      <nav className={`
        fixed md:static top-[70px] left-0 w-full md:w-auto
        flex flex-col md:flex-row items-center gap-6 md:gap-8
        p-10 md:p-0 transition-all duration-300 ease-in
        ${isMenuOpen ? 'bg-[#1e293b] translate-x-0' : 'hidden md:flex translate-x-full md:translate-x-0'}
      `}>
        <a href="/" className="text-white hover:text-[#f3a82f] transition-colors font-medium">Home</a>
        <a href="/about" className="text-white hover:text-[#f3a82f] transition-colors font-medium">About</a>
        <a href="/services" className="text-white hover:text-[#f3a82f] transition-colors font-medium">Services</a>

       {/* Login Dropdown */}
        <div className="relative" ref={loginRef}>
          <button 
            onClick={() => {
                setOpenLogin(!openLogin);
                setOpenRegister(false); // Close other if open
            }} 
            className="text-[#f3a82f] font-medium flex items-center gap-1 cursor-pointer"
          >
            Login {openLogin ? '▴' : '▾'}
          </button>

          {openLogin && (
            <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-lg shadow-2xl py-2 z-[100] animate-in fade-in zoom-in duration-200">
              <a href="/login/employer" className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f]">As Employer</a>
              <div className="border-t border-gray-100" />
              <a href="/login/worker" className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f]">As Worker</a>
            </div>
          )}
        </div>

        {/* Register Dropdown */}
        <div className="relative" ref={registerRef}>
          <button 
            onClick={() => {
                setOpenRegister(!openRegister);
                setOpenLogin(false); 
            }}
            className="px-5 py-2 rounded-md font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: PRIMARY_COLOR, color: DARK_BG }}
          >
            Register {openRegister ? '▴' : '▾'}
          </button>

          {openRegister && (
            <div className="absolute top-full right-0 mt-3 w-44 bg-white rounded-lg shadow-2xl py-2 z-[100] animate-in fade-in zoom-in duration-200">
              <a onClick={() => navigate('register/employer')} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] cursor-pointer">As Employer</a>
              <div className="border-t border-gray-100" />
              <a onClick={() => navigate('register/worker')} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#f3a82f] cursor-pointer">As Worker</a>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
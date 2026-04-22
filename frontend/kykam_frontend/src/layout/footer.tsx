const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t-4 border-amber-500 py-10 px-4 md:py-16 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Brand Identity */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Kykam Agencies</h2>
          <p className="text-sm leading-relaxed">
            Connecting Kenyan homes with verified professionals. 
            We ensure safety and integrity in every hire.
          </p>
        </div>

        {/* Column 2: Quick Navigation */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-5">Platform</h4>
          <ul className="space-y-3">
            <li><a href="/workers" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Find a Worker</a></li>
            <li><a href="/register/worker" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Join as a Worker</a></li>
            <li><a href="/categories" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Job Categories</a></li>
          </ul>
        </div>

        {/* Column 3: Support & Legal */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-5">Support</h4>
          <ul className="space-y-3">
            <li><a href="/contact" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Contact Support</a></li>
            <li><a href="/privacy" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="text-slate-300 text-sm hover:text-[#f3a82f] transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Column 4: Direct Contact */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-5">Reach Out</h4>
          <p className="text-sm mb-2.5">
            📧 <a href="mailto:Kykamagency1@gmail.com" className="text-[#f3a82f] hover:underline transition-colors">Kykamagency1@gmail.com</a>
          </p>
          <p className="text-sm mb-3">
            🟢 <a href="https://wa.me/254794029089" target="_blank" rel="noreferrer" className="text-[#f3a82f] hover:underline transition-colors">WhatsApp</a>
          </p>
          <p className="text-sm mb-3">
            🎵 <a href="https://www.tiktok.com/@shirojohn" target="_blank" rel="noreferrer" className="text-[#f3a82f] hover:underline transition-colors">TikTok</a>
          </p>
          <p className="text-sm mb-2.5">📍 Nairobi, Kenya</p>
          <div className="mt-4">
            <a
              href="/contact"
              className="inline-block bg-[#f3a82f] text-slate-900 px-4 py-2 rounded font-bold text-sm hover:brightness-110 transition-all active:scale-95"
            >
              SEND A MESSAGE
            </a>
          </div>
        </div>
      </div>

      <hr className="border-0 border-t border-slate-800 my-10" />

      <div className="text-center text-sm">
        <p>© {currentYear} Kykam Agencies Kenya. Licensed & Verified.</p>
        <p className="mt-1 opacity-60">Serving all 47 Counties with Pride.</p>
      </div>
    </footer>
  );
};

export default Footer;
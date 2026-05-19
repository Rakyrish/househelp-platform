import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Kykam Agencies</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Visual */}
      <div className="mb-8">
        <div className="text-8xl font-black text-[#f3a82f] leading-none">404</div>
        <div className="text-2xl font-bold text-slate-800 mt-2">Page Not Found</div>
      </div>

      {/* Message */}
      <p className="text-slate-500 text-base max-w-md leading-relaxed mb-8">
        The page you're looking for doesn't exist or may have been moved.
        Let's get you back on track.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#f3a82f] text-white font-bold rounded-xl hover:bg-[#d98e1a] transition-all shadow-lg shadow-orange-200"
        >
          ← Back to Home
        </Link>
        <Link
          to="/register/employer"
          className="inline-flex items-center justify-center px-8 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Find a Househelp
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-slate-400">
        <Link to="/services" className="hover:text-[#f3a82f] transition-colors">Services</Link>
        <Link to="/about" className="hover:text-[#f3a82f] transition-colors">About Us</Link>
        <Link to="/contact" className="hover:text-[#f3a82f] transition-colors">Contact</Link>
        <Link to="/register/worker" className="hover:text-[#f3a82f] transition-colors">Register as Worker</Link>
      </div>
    </div>
    </>
  );
};

export default NotFound;

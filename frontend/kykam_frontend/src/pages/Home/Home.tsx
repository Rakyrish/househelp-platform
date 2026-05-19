import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Lazy-load below-fold sections for better LCP and bundle splitting
const Why      = lazy(() => import('./why'));
const Services = lazy(() => import('./services'));
const HowItWorks = lazy(() => import('./HowItWorks'));
const About    = lazy(() => import('./about'));

// Lightweight skeleton for lazy-loaded sections
const SectionSkeleton = () => (
  <div className="animate-pulse py-16 px-4">
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-6 bg-slate-200 rounded-full w-1/3 mx-auto" />
      <div className="h-4 bg-slate-100 rounded-full w-2/3 mx-auto" />
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="bg-gray-50">

      {/* ── SEO HEAD ─────────────────────────────────────────────── */}
      <Helmet>
        <title>Kykam Agencies — Find Verified Househelps, Nannies &amp; Domestic Workers in Kenya</title>
        <meta name="description" content="Kenya's trusted domestic worker marketplace. Connect with background-checked househelps, nannies, cooks, house cleaners and gardeners across all 47 counties. Free for employers." />
        <link rel="canonical" href="https://kykamagencies.co.ke/" />
        <meta property="og:title" content="Kykam Agencies — Find Verified Househelps in Kenya" />
        <meta property="og:description" content="Connect with background-checked domestic workers across all 47 counties. Free for employers. Workers join from KES 99." />
        <meta property="og:url" content="https://kykamagencies.co.ke/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does Kykam verify domestic workers?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Every worker submits a National ID (front and back), passport photo, and next-of-kin information. Our team manually reviews each submission before granting full access."
              }
            },
            {
              "@type": "Question",
              "name": "How much does it cost to hire through Kykam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Kykam is completely free for employers. Workers pay a one-time registration fee of KES 99 via M-Pesa to get verified and listed."
              }
            },
            {
              "@type": "Question",
              "name": "Can I find a nanny in Nairobi through Kykam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Kykam has verified nannies, housemaids, cooks, and cleaners available across Nairobi and all 47 counties of Kenya."
              }
            },
            {
              "@type": "Question",
              "name": "How long does worker verification take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Worker profiles are typically reviewed and approved within 24 hours of payment submission."
              }
            }
          ]
        })}</script>
      </Helmet>

      {/* ── 1. HERO SECTION ──────────────────────────────────────── */}
      <section
        className="relative flex flex-col justify-center items-center text-white text-center px-4 min-h-[85vh] md:h-[85vh]"
        aria-label="Hero — Find verified domestic workers in Kenya"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/pic2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Hidden accessible H1 description for SEO while image covers it */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 max-w-[900px] leading-tight px-2">
          Find Verified Househelps Across <span className="text-[#f3a82f]">Kenya</span>.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white font-semibold lg:text-2xl mb-4 max-w-[800px] opacity-90 leading-relaxed px-4">
          Connecting families from all 47 counties with background-checked, professional domestic workers.
          Your safety is our priority — from Nairobi to every corner of Kenya.
        </p>

        {/* Fee disclosure — critical for worker conversion & trust */}
        <p className="text-sm text-white/70 mb-8">
          ✅ Free for employers &nbsp;·&nbsp; Workers join from <strong className="text-[#f3a82f]">KES 99</strong> (M-Pesa)
        </p>

        {/* CTA Buttons — fixed to navigate to REGISTER not login */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none">

          <Link
            to="/register/employer"
            className="w-full sm:w-auto bg-[#f3a82f] text-white px-10 h-16 flex items-center justify-center rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Find a Househelp — Free
          </Link>

          <Link
            to="/register/worker"
            className="w-full sm:w-auto bg-white text-gray-900 px-10 h-16 flex items-center justify-center rounded-xl font-bold text-lg border-2 border-transparent gap-3 hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Register as Worker</span>
          </Link>
        </div>

        {/* Already registered — micro CTA */}
        <p className="mt-5 text-sm text-white/60">
          Already registered?{' '}
          <Link to="/login/employer" className="underline hover:text-white transition-colors">Employer login</Link>
          {' '}or{' '}
          <Link to="/login/worker" className="underline hover:text-white transition-colors">Worker login</Link>
        </p>
      </section>

      {/* ── 2. TRUST SIGNALS BAR ─────────────────────────────────── */}
      <div className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-300">
          <span>🛡️ <strong className="text-white">ID Verified</strong> Workers</span>
          <span>📋 <strong className="text-white">Background</strong> Traceable</span>
          <span>💰 <strong className="text-white">M-Pesa</strong> Secured Payments</span>
          <span>📍 <strong className="text-white">All 47 Counties</strong> Covered</span>
          <span>✅ <strong className="text-white">Free</strong> for Employers</span>
        </div>
      </div>

      {/* ── 3. BELOW-FOLD SECTIONS (lazy loaded) ─────────────────── */}
      <div className="space-y-0">
        <Suspense fallback={<SectionSkeleton />}>
          <Why />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
      </div>

    </div>
  );
};

export default Home;
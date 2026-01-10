
export default function Services() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-24 px-4">
      
    
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl text-center">
        
        {/* Header */}
        <span className="text-sm font-bold uppercase tracking-widest text-amber-500">
          What we offer
        </span>

        <h2 className="mt-3 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Our Specialized Services
        </h2>

        <div className="mx-auto mt-5 h-1 w-16 rounded bg-amber-500"></div>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          We provide a secure and reliable bridge between verified professional
          househelps and Kenyan households.
        </p>

        {/* Services Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🛡️
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              Worker Verification
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Rigorous vetting using National ID and Police Clearance to give
              families peace of mind.
            </p>
          </div>

          {/* Card */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🌍
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              47-County Coverage
            </h3>
            <p className="text-slate-600 leading-relaxed">
              From Lamu to Turkana, we connect employers and domestic workers
              across all of Kenya.
            </p>
          </div>

          {/* Card */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              📱
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              Smart Matching
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Communicate directly, discuss expectations, experience, and terms
              transparently before hiring.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <a
            href="/register/employer"
            className="rounded-full bg-amber-500 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 hover:shadow-xl"
          >
            Find a Househelp
          </a>

          <a
            href="/register/worker"
            className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-10 py-4 text-lg font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Look for a Job
          </a>
        </div>
      </div>
    </section>
  );
}

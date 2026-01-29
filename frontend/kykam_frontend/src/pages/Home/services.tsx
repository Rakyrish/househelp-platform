export default function Services() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-24 px-4">
      
      {/* Visual Background Accents */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl text-center">
        
        {/* Header */}
        <span className="text-sm font-bold uppercase tracking-widest text-amber-500">
          The Kykam Advantage
        </span>

        <h2 className="mt-3 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Our Specialized Services
        </h2>

        <div className="mx-auto mt-5 h-1 w-16 rounded bg-amber-500"></div>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          We provide a secure and transparent bridge between verified professionals 
          and Kenyan households, ensuring integrity in every placement.
        </p>

        {/* Services Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Vetting */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🛡️
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              Rigorous Verification
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We manually vet workers using National IDs and personal traceability 
              to ensure your home remains a safe sanctuary.
            </p>
          </div>

          {/* Card 2: Nationwide */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🌍
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              47-County Network
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Whether you are in Nairobi, Kisumu, or Lamu, our platform connects 
              talent and opportunity across the entire republic.
            </p>
          </div>

          {/* Card 3: Direct Matching */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🤝
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
              Direct Placement
            </h3>
            <p className="text-slate-600 leading-relaxed">
              No middleman fees. Communicate directly via WhatsApp or our platform 
              to discuss salary, expectations, and start dates.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <a
            href="/register/employer"
            className="w-full sm:w-auto rounded-full bg-amber-500 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 hover:shadow-xl text-center"
          >
            Hire a Professional
          </a>

          <a
            href="/register/worker"
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border-2 border-slate-200 bg-white px-10 py-4 text-lg font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
            Join as a Worker
          </a>
        </div>
      </div>
    </section>
  );
}
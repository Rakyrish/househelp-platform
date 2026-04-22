function Services() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 px-4 sm:px-6 md:py-24">

      {/* Visual Background Accents */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl text-center">

        {/* Header */}
        <span className="text-sm font-bold uppercase tracking-widest text-amber-500">
          The Kykam Advantage
        </span>

        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 md:text-5xl">
          Our Specialized Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-14">

          {/* Card 1: Vetting */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🛡️
            </div>
            <h3 className="text-slate-900 mb-3 text-lg md:text-xl font-bold">Find Your Match</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Browse through our vetted professionals and filter by location, skill, and expected salary.
            </p>
          </div>

          {/* Card 2: Nationwide */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🌍
            </div>
            <h3 className="text-slate-900 mb-3 text-lg md:text-xl font-bold">Hire Directly</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Connect with the worker immediately. No middleman, no hidden placement fees.
            </p>
          </div>

          {/* Card 3: Direct Matching */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🤝
            </div>
            <h3 className="text-slate-900 mb-3 text-lg md:text-xl font-bold">Ongoing Support</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Our team is always on standby to assist with contract mediation or replacement needs.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Services;

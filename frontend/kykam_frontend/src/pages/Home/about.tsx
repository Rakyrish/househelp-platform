function About() {
  return (
    <section className="font-sans bg-white py-16 px-6 md:py-24 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16 text-left">
        
        {/* The Story Side */}
        <div className="flex-1 w-full lg:w-3/5">
          <span className="text-[#f3a82f] font-bold uppercase tracking-wider text-sm">
            Our Story
          </span>
          <h2 className="text-3xl md:text-5xl text-slate-900 mt-2 mb-6 font-extrabold">
            About <span className="text-[#f3a82f]">Kykam</span>
          </h2>
          
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
            Kykam was born out of a simple need: <strong className="text-slate-900">Trust</strong>. 
            In Kenya, finding reliable domestic help often relies on informal word-of-mouth, 
            which can be unpredictable and risky for both employers and workers.
          </p>
          
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Our mission is to <strong className="text-slate-900">formalize</strong> the domestic work 
            industry in Kenya. We provide a professional bridge where integrity meets opportunity. 
            By verifying every profile, we ensure domestic workers find dignified, safe environments, 
            and Kenyan families find the peace of mind they deserve.
          </p>
        </div>

        {/* The Vision Side */}
        <div className="flex-1 w-full lg:w-2/5 bg-[#f3a82f] p-8 md:p-12 rounded-3xl text-slate-900 flex flex-col justify-center shadow-2xl shadow-orange-500/30">
          <h4 className="text-2xl md:text-3xl font-extrabold mb-6 border-b-2 border-slate-900/10 pb-3 inline-block">
            Our Vision
          </h4>
          <p className="text-base md:text-xl leading-relaxed font-medium italic">
            "To become Kenya's most trusted partner in household management, 
            fostering a culture of respect, safety, and security for every home 
            and worker across all 47 counties."
          </p>
          <div className="mt-8 text-5xl opacity-20">
            🇰🇪
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;
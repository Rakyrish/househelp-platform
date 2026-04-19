function HowItWorks() {
  return (
    <section className="font-sans bg-amber-50/50 py-16 px-6 md:py-24 text-center">
      <h2 className="text-3xl md:text-4xl text-slate-900 mb-3 font-extrabold px-2">
        Getting Started is Easy
      </h2>
      <p className="text-slate-500 mb-12 md:mb-16 text-base md:text-lg max-w-2xl mx-auto px-4">
        Your journey to a professional partnership starts here.
      </p>

      <div className="max-w-3xl mx-auto text-left relative px-4 md:px-0">
        {/* Connecting Line (hidden on very small screens, responsive left margin) */}
        <div className="hidden sm:block absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-[#f3a82f] opacity-30 z-0"></div>

        {/* Step 1 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-12 relative z-10 text-center sm:text-left">
          <div className="min-w-[52px] h-[52px] bg-[#f3a82f] text-slate-900 rounded-full flex items-center justify-center sm:mr-8 mb-4 sm:mb-0 font-extrabold text-xl shadow-[0_0_0_8px_rgba(243,168,47,0.1)]">
            1
          </div>
          <div className="pt-0 sm:pt-2">
            <h4 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
              Create Your Profile
            </h4>
            <p className="text-slate-600 text-base leading-relaxed">
              Sign up quickly using your phone number. Tell us if you're a family looking for help or a professional seeking your next opportunity.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-12 relative z-10 text-center sm:text-left">
          <div className="min-w-[52px] h-[52px] bg-[#f3a82f] text-slate-900 rounded-full flex items-center justify-center sm:mr-8 mb-4 sm:mb-0 font-extrabold text-xl shadow-[0_0_0_8px_rgba(243,168,47,0.1)]">
            2
          </div>
          <div className="pt-0 sm:pt-2">
            <h4 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
              Fast Verification
            </h4>
            <p className="text-slate-600 text-base leading-relaxed">
              Workers securely upload their National ID and documents. Our team manually reviews every profile to maintain the highest safety standards in Kenya.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-12 relative z-10 text-center sm:text-left">
          <div className="min-w-[52px] h-[52px] bg-[#f3a82f] text-slate-900 rounded-full flex items-center justify-center sm:mr-8 mb-4 sm:mb-0 font-extrabold text-xl shadow-[0_0_0_8px_rgba(243,168,47,0.1)]">
            3
          </div>
          <div className="pt-0 sm:pt-2">
            <h4 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
              Connect & Start
            </h4>
            <p className="text-slate-600 text-base leading-relaxed">
              Browse verified matches, communicate directly, and secure a professional placement with total peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
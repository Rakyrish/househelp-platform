import { ShieldCheck, Map, HandCoins } from 'lucide-react';

function Why() {
  return (
    <section className="py-16 px-4 sm:px-6 md:py-24 text-center bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-[42px] text-slate-900 mb-4 font-extrabold leading-tight">
          Why Choose <span className="text-[#f3a82f]">Kykam?</span>
        </h2>
        <p className="text-slate-500 text-base md:text-lg max-w-[700px] mx-auto mb-12 md:mb-16 leading-relaxed">
          We are more than an agency; we are a community built on security, transparency, and mutual respect.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Safety */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="mb-6 bg-orange-50 w-20 h-20 flex items-center justify-center rounded-2xl text-[#f3a82f]">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 mb-3 text-xl md:text-[22px] font-bold">Fully Verified</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-[15px]">
              We vet workers using National ID, Next of Kin data, and Good Conduct images to ensure your family's absolute safety.
            </p>
          </div>

          {/* Card 2: Coverage */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="mb-6 bg-orange-50 w-20 h-20 flex items-center justify-center rounded-2xl text-[#f3a82f]">
              <Map size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 mb-3 text-xl md:text-[22px] font-bold">Nationwide Reach</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-[15px]">
              From the heart of Nairobi to Nakuru, Kisumu, and Mombasa—Kykam brings professional service to every corner of Kenya.
            </p>
          </div>

          {/* Card 3: Fairness */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="mb-6 bg-orange-50 w-20 h-20 flex items-center justify-center rounded-2xl text-[#f3a82f]">
              <HandCoins size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-900 mb-3 text-xl md:text-[22px] font-bold">Direct & Fair</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-[15px]">
              We eliminate exploitative middlemen. Workers earn fair wages, and employers enjoy clear, honest communication.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Why;
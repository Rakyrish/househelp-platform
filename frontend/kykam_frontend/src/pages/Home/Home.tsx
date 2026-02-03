import { useNavigate } from 'react-router-dom';
import About from './about';
import Why from './why';
import Services from './services';
import HowItWorks from './HowItWorks';

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-gray-50">
      
      {/* 1. HERO SECTION */}
      <section 
        className="relative flex flex-col justify-center items-center text-white text-center px-4 min-h-[85vh] md:h-[85vh]"
        style={{
          // ✅ FIX: Clean, high-quality image without watermarks
          // ✅ FIX: Stronger overlay (0.7) to make the text readable against light backgrounds
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1570318885/photo/the-concept-of-cleaning-services-for-premises.jpg?s=612x612&w=0&k=20&c=hy3mucMJ-E-kjj5AU4m_T2qcxbbFloqe5zn40JCf7lU=')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 max-w-[900px] leading-tight">
          Empowering Homes Across <span className="text-[#f3a82f]">Kenya</span>.
        </h1>

        <p className="text-lg md:text-xl text-[#fff font-bold lg:text-2xl mb-10 max-w-[800px] opacity-90 leading-relaxed">
          Connecting families from the 47 counties with verified, professional househelps. 
          Your safety is our priority, from Nairobi to the furthest corner of Kenya.
        </p>

        {/* Actions Container */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-md sm:max-w-none">
          
          <a 
            onClick={() => navigate('/login/employer')}
            className="w-full sm:w-auto bg-[#f3a82f] text-white px-10 h-16 flex items-center justify-center rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Find a Househelp
          </a>

          <a 
            onClick={() => navigate('/login/worker')}
            className="w-full sm:w-auto bg-white text-gray-900 px-10 h-16 flex items-center justify-center rounded-xl font-bold text-lg border-2 border-transparent flex gap-3 hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
          >
            <svg 
              width={22} 
              height={22} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Look for a Job</span>
          </a>
        </div>
      </section>

      {/* Trust Signals, Services, etc. */}
      {/* Ensure these components also use responsive padding! */}
      <div className="space-y-12 md:space-y-20">
        <Why />
        <Services />
        <HowItWorks />
        <About />
      </div>

    </div>
  );
};

export default Home;
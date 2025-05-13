import React from 'react';
import mainBg from '../assets/images/IMG-20250204-WA0005.jpg';
import deal1 from '../assets/images/deal (1).jpg';
import deal2 from '../assets/images/deal (2).jpg';
import deal3 from '../assets/images/deal (3).jpg';

const Home = () => {
  return (
    <div className="px-10">
      {/* Hero Section */}
      <div className="w-full">
        <img src={mainBg} alt="Main Background" className="w-full object-contain  h-full" />
      </div>

      {/* Deals Section */}
      <section className="mb-10 mt-30  space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">🔥 Top Deals for You</h2>

        {/* First Row - 1 Full Width Deal */}
        <div className="relative w-full h-[300px] overflow-hidden rounded-2xl shadow-lg">
          <img src={deal1} alt="Deal 1" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h3 className="text-white text-2xl md:text-4xl font-semibold">Biggest Sale of the Month!</h3>
          </div>
        </div>

        {/* Second Row - 2 Side by Side Deals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal 2 */}
          <div className="relative h-[250px] overflow-hidden rounded-2xl shadow-lg">
            <img src={deal2} alt="Deal 2" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h3 className="text-white text-xl md:text-2xl font-medium">50% Off on Accessories</h3>
            </div>
          </div>

          {/* Deal 3 */}
          <div className="relative h-[250px] overflow-hidden rounded-2xl shadow-lg">
            <img src={deal3} alt="Deal 3" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h3 className="text-white text-xl md:text-2xl font-medium">Buy 1 Get 1 Free</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

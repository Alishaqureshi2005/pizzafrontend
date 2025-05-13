import React, { useContext } from 'react';
import { FaMotorcycle, FaStore } from 'react-icons/fa';
import { AppContext } from '../context/DeliveryContext';

const Header = () => {
  const { openDelivery ,openPickup} = useContext(AppContext);

  return (
    <div className="sticky top-20 z-10 flex justify-center">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 
        rounded-full shadow-xl px-4 py-2 flex gap-4 items-center">
        
        <button
          onClick={openDelivery}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 cursor-pointer"
        >
          <FaMotorcycle />
          Delivery
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-white/30 text-black backdrop-blur-sm rounded-full hover:bg-white/50 transition-all duration-300 cursor-pointer" onClick={openPickup}>
          <FaStore />
          Pick Up
        </button>
      </div>
    </div>
  );
};

export default Header;

// Sidebar.jsx
import React, { useEffect } from 'react';
import { FaHome, FaList, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AuthButtons, NavLinks } from './Navlinks';

const Sidebar = ({ isOpen, closeSidebar }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && closeSidebar();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeSidebar]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-red-800/95 backdrop-blur-xl z-50 shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">PizzaHouse</h2>
          <button
            onClick={closeSidebar}
            className="text-2xl text-white p-2 hover:text-red-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="p-6">
          <NavLinks mobile={true} closeSidebar={closeSidebar} />
          <div className="mt-8 pt-6 border-t border-white/10">
            <AuthButtons />
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
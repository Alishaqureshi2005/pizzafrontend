import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaShoppingCart, FaClipboardList, FaSignOutAlt, FaPizzaSlice, FaPrint, FaStore, FaBars, FaTimes } from 'react-icons/fa';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/admin', icon: <FaHome />, text: 'Dashboard' },
    { to: '/admin/orders', icon: <FaClipboardList />, text: 'Orders' },
    { to: '/admin/menu', icon: <FaShoppingCart />, text: 'Menu Management' },
    { to: '/admin/restaurants', icon: <FaStore />, text: 'Restaurants' },
    { to: '/admin/printer', icon: <FaPrint />, text: 'Printer Settings' },
    { to: '/admin/delivery-zones', icon: <FaPizzaSlice />, text: 'Delivery Zones' },
  ];

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <FaPizzaSlice className="text-2xl" />
              <span className="font-bold text-xl">PizzaWorld Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-red-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Logout Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;

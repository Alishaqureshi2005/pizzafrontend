import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaShoppingCart, FaClipboardList, FaSignOutAlt, FaPizzaSlice, FaPrint, FaStore, FaBars, FaTimes, FaPlus } from 'react-icons/fa';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsManagementDropdownOpen(false);
  };

  const toggleManagementDropdown = () => {
    setIsManagementDropdownOpen(!isManagementDropdownOpen);
  };

  const navLinks = [
    { to: '/admin', icon: <FaHome />, text: 'Dashboard' },
    { to: '/admin/orders', icon: <FaClipboardList />, text: 'Orders' },
  ];

  const managementLinks = [
    { to: '/admin/menu', icon: <FaShoppingCart />, text: 'Menu Management' },
    { to: '/admin/restaurants', icon: <FaStore />, text: 'Restaurants' },
    { to: '/admin/printer', icon: <FaPrint />, text: 'Printer Settings' },
    { to: '/admin/delivery-zones', icon: <FaPizzaSlice />, text: 'Delivery Zones' },
    { to: '/admin/items', icon: <FaPlus />, text: 'Item Management' },
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
                onClick={() => setIsManagementDropdownOpen(false)}
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}

            {/* Management Dropdown */}
            <div className="relative">
              <button
                onClick={toggleManagementDropdown}
                className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <FaStore />
                <span>Management</span>
                <svg
                  className={`ml-1 h-5 w-5 transform transition-transform ${isManagementDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isManagementDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  onMouseLeave={() => setIsManagementDropdownOpen(false)}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    {managementLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-900 flex items-center space-x-2"
                        role="menuitem"
                        onClick={() => setIsManagementDropdownOpen(false)}
                      >
                        {link.icon}
                        <span>{link.text}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              {managementLinks.map((link) => (
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

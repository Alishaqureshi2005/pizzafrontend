import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaShoppingCart, FaClipboardList, FaSignOutAlt, FaPizzaSlice, FaPrint } from 'react-icons/fa';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaHome />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaClipboardList />
              <span>Orders</span>
            </Link>
            <Link
              to="/admin/menu"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaShoppingCart />
              <span>Menu Management</span>
            </Link>
            <Link
              to="/admin/printer"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaPrint />
              <span>Printer Settings</span>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 
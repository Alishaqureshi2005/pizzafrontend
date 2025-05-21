// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaShoppingCart, FaUser, FaSignOutAlt, FaHistory } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className={`sticky w-full top-0 z-40 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-red-800/95" : "backdrop-blur-lg bg-red-700/90"}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-white font-logo hover:text-red-100 transition-colors">
            PizzaHouse
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Main Navigation */}
            <Link to="/" className="text-white hover:text-red-100 transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-white hover:text-red-100 transition-colors">
              Menu
            </Link>
            <Link to="/bestonlineservice" className="text-white hover:text-red-100 transition-colors">
              Best Online Service
            </Link>
            <Link to="/order" className="text-white hover:text-red-100 transition-colors">
              Order
            </Link>

            {/* Authentication Menu */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="text-white hover:text-red-100 transition-colors flex items-center relative"
                >
                  <FaShoppingCart className="mr-2" />
                  Cart
                  {cart && cart.items && cart.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/order-history"
                  className="text-white hover:text-red-100 transition-colors flex items-center"
                >
                  <FaHistory className="mr-2" />
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-100 transition-colors flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-red-100 transition-colors flex items-center"
                >
                  <FaUser className="mr-2" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-2xl text-white p-2 hover:text-red-100 transition-colors"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-red-800/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-4">
              {/* Main Navigation */}
              <Link
                to="/"
                className="text-white hover:text-red-100 transition-colors text-xl py-2"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="text-white hover:text-red-100 transition-colors text-xl py-2"
                onClick={() => setIsOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/bestonlineservice"
                className="text-white hover:text-red-100 transition-colors text-xl py-2"
                onClick={() => setIsOpen(false)}
              >
                Best Online Service
              </Link>
              <Link
                to="/order"
                className="text-white hover:text-red-100 transition-colors text-xl py-2"
                onClick={() => setIsOpen(false)}
              >
                Order
              </Link>

              {/* Authentication Menu */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="text-white hover:text-red-100 transition-colors flex items-center text-xl py-2 relative"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaShoppingCart className="mr-2" />
                    Cart
                    {cart && cart.items && cart.items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cart.items.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/order-history"
                    className="text-white hover:text-red-100 transition-colors flex items-center text-xl py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaHistory className="mr-2" />
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-red-100 transition-colors flex items-center text-xl py-2"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-red-100 transition-colors flex items-center text-xl py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors text-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { AuthButtons, NavLinks } from "./Navlinks";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`sticky w-full top-0 z-40 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-red-800/95" : "backdrop-blur-lg bg-red-700/90"}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-white font-logo hover:text-red-100 transition-colors">
            PizzaHouse
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <NavLinks mobile={false} closeSidebar={closeSidebar} />
            <AuthButtons />
          </div>

          <button
            onClick={toggleSidebar}
            className="lg:hidden text-2xl text-white p-2 hover:text-red-100 transition-colors"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
    </>
  );
};


export default Navbar;
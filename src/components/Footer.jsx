import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-10 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold">YOURSTORE</h2>
        <p className="text-sm text-gray-500 mb-6">Create. Inspire. Deliver.</p>

        {/* Navigation Links */}
        <ul className="flex justify-center gap-6 mb-6 font-medium text-sm">
          <li className="hover:text-black cursor-pointer transition">Home</li>
          <li className="hover:text-black cursor-pointer transition">Shop</li>
          <li className="hover:text-black cursor-pointer transition">Categories</li>
          <li className="hover:text-black cursor-pointer transition">Deals</li>
          <li className="hover:text-black cursor-pointer transition">Contact</li>
        </ul>

        {/* Social Icons */}
        <div className="flex justify-center gap-4 text-gray-600 text-lg mb-6">
          <a href="#"><FaFacebookF className="hover:text-blue-600 transition" /></a>
          <a href="#"><FaTwitter className="hover:text-blue-400 transition" /></a>
          <a href="#"><FaInstagram className="hover:text-pink-500 transition" /></a>
          <a href="#"><FaLinkedinIn className="hover:text-blue-700 transition" /></a>
        </div>

        {/* Bottom Text */}
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} YOURSTORE. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

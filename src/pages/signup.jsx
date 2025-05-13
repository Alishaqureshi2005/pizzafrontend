import React from 'react';
import { FaGoogle, FaFacebookF, FaPizzaSlice } from 'react-icons/fa';

const Signup = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-yellow-200">
        <div className="flex items-center justify-center mb-4">
          <FaPizzaSlice className="text-4xl text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Join PizzaWorld 🍕
        </h2>

        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Sign Up & Get a Slice!
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or sign up with</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <div className="flex justify-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition">
            <FaGoogle className="text-xl text-red-500" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-100 transition">
            <FaFacebookF className="text-xl text-blue-600" />
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already part of the pizza party?{' '}
          <a href="#" className="text-red-500 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

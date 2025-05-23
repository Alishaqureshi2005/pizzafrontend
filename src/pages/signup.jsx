import React, { useState } from 'react';
import { FaGoogle, FaFacebookF, FaPizzaSlice, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Send all form data including confirmPassword
      await register(formData);
      navigate('/');
    } catch (err) {
      if (err.response?.errors) {
        // Handle validation errors from the backend
        const errorMessages = err.response.errors.map(error => error.message).join(', ');
        setError(errorMessages);
      } else {
        setError(err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-yellow-200">
        <div className="flex items-center justify-center mb-4">
          <FaPizzaSlice className="text-4xl text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Join PizzaWorld 🍕
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="+1234567890"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="••••••••"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="••••••••"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
          <Link to="/login" className="text-red-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

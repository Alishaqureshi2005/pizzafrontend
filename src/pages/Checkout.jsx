import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import { handleApiError } from '../utils/errorHandler';
import { validateOrderForm } from '../utils/validation';
import { FaMapMarkerAlt } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, total, deliveryFee, subtotal } = location.state || { cartItems: [], total: 0, deliveryFee: 0, subtotal: 0 };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    orderType: 'pickup'
  });

  const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
          toast.success('Location obtained successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          toast.error('Failed to get location. Please enter your address manually.');
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Validate form
    const errors = validateOrderForm(formData, formData.orderType);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          toppings: item.toppings,
          specialInstructions: item.specialInstructions
        })),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        total: {
          subtotal: subtotal,
          deliveryFee: formData.orderType === 'delivery' ? deliveryFee : 0,
          total: formData.orderType === 'delivery' ? total : subtotal
        }
      };

      // Add delivery address only if order type is delivery
      if (formData.orderType === 'delivery') {
        if (!coordinates) {
          toast.error('Please get your location or enter address manually');
          setIsSubmitting(false);
          return;
        }

        orderData.deliveryAddress = {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          coordinates: coordinates
        };
      }

      // Create the order
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Please add items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {formData.orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>€{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>€{(formData.orderType === 'delivery' ? total : subtotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : ''}`}
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.phone ? 'border-red-500' : ''}`}
              />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <select
                name="orderType"
                value={formData.orderType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {formData.orderType === 'delivery' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`flex-1 p-2 border rounded ${formErrors.address ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                        isGettingLocation ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Get current location"
                    >
                      <FaMapMarkerAlt />
                    </button>
                  </div>
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                  {coordinates && (
                    <p className="text-sm text-gray-600 mt-1">
                      Location obtained: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors.city ? 'border-red-500' : ''}`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors.zipCode ? 'border-red-500' : ''}`}
                    />
                    {formErrors.zipCode && <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGettingLocation}
              className={`w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors ${
                (isSubmitting || isGettingLocation) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 
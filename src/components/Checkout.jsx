import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { deliveryService } from '../services/deliveryService';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import Delivery from './Delivery';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [orderType, setOrderType] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    // Calculate total amount including delivery fee
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(subtotal + deliveryFee);
  }, [cart, deliveryFee]);

  const handleDeliveryConfirm = async (details) => {
    setDeliveryDetails(details);
    setDeliveryFee(details.zone?.deliveryFee || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (orderType === 'delivery' && !deliveryDetails) {
      toast.error('Please select a delivery location');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization
        })),
        totalPrice: totalAmount,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryDetails : null,
        deliveryZone: orderType === 'delivery' ? deliveryDetails.zone : null,
        deliveryCharge: deliveryFee
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data._id}`);
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Type
        </label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>
      </div>

      {/* Delivery Section */}
      {orderType === 'delivery' && (
        <div className="mb-6">
          <Delivery onConfirm={handleDeliveryConfirm} />
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        {cart.items.map((item) => (
          <div key={item._id} className="flex justify-between mb-2">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t border-gray-200 my-2 pt-2">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
          </div>
          
          {orderType === 'delivery' && (
            <div className="flex justify-between mb-2">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || (orderType === 'delivery' && !deliveryDetails)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout; 
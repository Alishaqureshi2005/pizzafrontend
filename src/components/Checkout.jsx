import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { deliveryService } from '../services/deliveryService';
import { orderService } from '../services/orderService';
import { FaMapMarkerAlt, FaShoppingCart, FaCreditCard } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    coordinates: null,
    zone: null,
    timeSlot: '',
    isOutOfZone: false
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderType, setOrderType] = useState('delivery');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showDeliveryForm, setShowDeliveryForm] = useState(true);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
  }, [cart, navigate]);

  const handleDeliveryDetailsChange = async (details) => {
    setDeliveryDetails(details);
    
    if (details.coordinates && details.zone) {
      try {
        const response = await deliveryService.checkAvailability({
          latitude: details.coordinates.latitude,
          longitude: details.coordinates.longitude,
          orderAmount: cart.totalPrice
        });

        if (response.success) {
          setDeliveryFee(response.data.zone.deliveryFee);
          setAvailableTimeSlots(response.data.availableSlots || []);
        } else {
          toast.error(response.message || 'Error checking delivery availability');
        }
      } catch (error) {
        toast.error('Error checking delivery availability');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization
        })),
        totalPrice: cart.totalPrice + (orderType === 'delivery' ? deliveryFee : 0),
        deliveryAddress: orderType === 'delivery' ? deliveryDetails : null,
        paymentMethod,
        orderType,
        deliveryCharge: orderType === 'delivery' ? deliveryFee : 0,
        deliveryZone: orderType === 'delivery' ? deliveryDetails.zone : null
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data._id}`);
      } else {
        toast.error(response.message || 'Error creating order');
      }
    } catch (error) {
      toast.error('Error creating order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`flex-1 py-2 px-4 rounded ${
              orderType === 'delivery'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FaMapMarkerAlt className="inline mr-2" />
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setOrderType('pickup')}
            className={`flex-1 py-2 px-4 rounded ${
              orderType === 'pickup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FaShoppingCart className="inline mr-2" />
            Pickup
          </button>
        </div>
      </div>

      {orderType === 'delivery' && (
        <div className="mb-6">
          <DeliveryForm
            onDeliveryDetailsChange={handleDeliveryDetailsChange}
            availableTimeSlots={availableTimeSlots}
            deliveryDetails={deliveryDetails}
          />
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 py-2 px-4 rounded ${
              paymentMethod === 'cash'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cash on Delivery
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 rounded ${
              paymentMethod === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FaCreditCard className="inline mr-2" />
            Card Payment
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.product._id} className="flex justify-between">
              <span>
                {item.quantity}x {item.product.name}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>
                ${(cart.totalPrice + (orderType === 'delivery' ? deliveryFee : 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || (orderType === 'delivery' && !deliveryDetails.zone)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout; 
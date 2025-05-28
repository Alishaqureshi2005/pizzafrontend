import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/adminApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders();
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
        setError('Unexpected data format from server.');
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await orderApi.deleteOrder(orderId);
      if (response?.data?.success) {
        toast.success('Order deleted successfully');
        // Refresh orders list
        fetchOrders();
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-200 text-green-800';
      case 'processing':
        return 'bg-yellow-200 text-yellow-800';
      case 'pending':
        return 'bg-blue-200 text-blue-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading Orders...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Orders</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">No Orders Yet</h1>
            <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">Your Orders</h1>
        
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order._id}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete Order"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {order.items.map(item => (
                    <li key={item._id || item.product?._id}>
                      {item.quantity}x {item.product?.title || 'Product'} - €{(parseFloat(item.price) * item.quantity)?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {order.deliveryAddress && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Delivery Address:</h3>
                  <p className="text-gray-600 text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                    {order.deliveryAddress.country}
                  </p>
                </div>
              )}

              {order.paymentMethod && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Payment Method:</h3>
                  <p className="text-gray-600 text-sm capitalize">{order.paymentMethod}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-red-600">€{order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Order;

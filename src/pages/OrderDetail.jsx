import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import { FaSpinner, FaCheck, FaTimes, FaClock, FaTruck, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch order details');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'preparing':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'ready':
        return <FaCheck className="text-green-500" />;
      case 'delivering':
        return <FaTruck className="text-blue-500" />;
      case 'delivered':
        return <FaCheck className="text-green-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivering':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft />
        <span>Back to Orders</span>
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
            <p className="text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="capitalize font-medium">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Order Type and Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Order Type</h3>
            <p className="capitalize">{order.orderType}</p>
          </div>
          {order.orderType === 'delivery' && (
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-red-500" />
                <p>{order.deliveryAddress.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  {item.customization && (
                    <p className="text-sm text-gray-500">
                      Customization: {item.customization}
                    </p>
                  )}
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(order.totalPrice - order.deliveryCharge).toFixed(2)}</span>
            </div>
            {order.orderType === 'delivery' && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Order Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheck className="text-green-500" />
            </div>
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          {order.status !== 'pending' && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaSpinner className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
          {['preparing', 'ready', 'delivering', 'delivered'].includes(order.status) && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaSpinner className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Preparing Order</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
          {['ready', 'delivering', 'delivered'].includes(order.status) && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheck className="text-green-500" />
              </div>
              <div>
                <p className="font-medium">Order Ready</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
          {['delivering', 'delivered'].includes(order.status) && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaTruck className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Out for Delivery</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
          {order.status === 'delivered' && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheck className="text-green-500" />
              </div>
              <div>
                <p className="font-medium">Delivered</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
          {order.status === 'cancelled' && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <FaTimes className="text-red-500" />
              </div>
              <div>
                <p className="font-medium">Order Cancelled</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 
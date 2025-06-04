import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import OrderReceipt from '../components/OrderReceipt';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Error fetching order details');
      toast.error(error.message || 'Error fetching order details');
      
      // Handle specific error cases
      if (error.message === 'Please login to view order details' || 
          error.message === 'You do not have permission to view this order') {
        navigate('/login');
      } else if (error.message === 'Order not found') {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
      setOrder(updatedOrder);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handlePrintOrder = () => {
    setShowReceipt(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order #{order._id}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`mt-2 md:mt-0 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-6">
          {/* Order Type and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <p className="font-medium capitalize">{order.orderType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium capitalize">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Delivery Details */}
          {order.orderType === 'delivery' && order.deliveryAddress && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                    {order.deliveryAddress.country}
                  </p>
                </div>
                {order.deliveryCharge > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Delivery Fee</p>
                    <p className="font-medium">€{order.deliveryCharge.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mr-4">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.product?.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      {item.customization && (
                        <p className="text-sm text-gray-600">
                          Customization: {item.customization}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>€{order.totalPrice.toFixed(2)}</span>
              </div>
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>€{order.deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>€{order.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handlePrintOrder}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPrint /> Print Order
        </button>
      </div>

      {showReceipt && (
        <OrderReceipt
          order={order}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails; 
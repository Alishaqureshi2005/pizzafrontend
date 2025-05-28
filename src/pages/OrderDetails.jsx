import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { orderApi } from '../services/adminApi';
import { printerService } from '../services/printerService';
import OrderReceipt from '../components/OrderReceipt';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(orderId);
      if (response?.data?.success) {
        setOrder(response.data.data);
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, newStatus);
      if (response?.data?.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast.success('Order status updated successfully');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePrintOrder = async () => {
    try {
      await printerService.printOrder(order);
      toast.success('Order printed successfully');
    } catch (error) {
      console.error('Error printing order:', error);
      toast.error('Failed to print order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 mx-auto"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex gap-4">
            <button
              onClick={handlePrintOrder}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPrint /> Print Order
            </button>
            <button
              onClick={() => setShowReceipt(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <FaEdit /> View Receipt
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order Number</label>
                  <p className="mt-1">#{order._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order Date</label>
                  <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 capitalize">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1">{order.user?.name || 'Guest'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1">{order.user?.email || 'N/A'}</p>
                </div>
                {order.deliveryAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Delivery Address</label>
                    <p className="mt-1">
                      {order.deliveryAddress.street}<br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                      {order.deliveryAddress.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-4 border-b last:border-b-0">
                <div>
                  <h3 className="font-medium">{item.product?.title || 'Product'}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                    {item.size && ` • Size: ${item.size}`}
                    {item.crust && ` • Crust: ${item.crust}`}
                    {item.toppings?.length > 0 && ` • Toppings: ${item.toppings.map(t => t.name).join(', ')}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">€{item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span>€{order.total?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Delivery Fee</span>
                <span>€{order.total?.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-lg font-bold">
                <span>Total</span>
                <span>€{order.total?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
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
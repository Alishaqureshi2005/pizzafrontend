import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPrint, FaTrash } from 'react-icons/fa';
import { fetchOrder, updateOrderStatus, deleteOrder } from '../store/slices/orderSlice';
import { useAuth } from '../context/AuthContext';

const OrderDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    dispatch(fetchOrder(orderId));
  }, [dispatch, orderId]);

  const fetchOrderDetails = async () => {
    try {
      await dispatch(fetchOrder(orderId)).unwrap();
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order details');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId: orderId, status: newStatus })).unwrap();
      toast.success('Order status updated successfully');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handlePrintOrder = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const handleDeleteOrder = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(orderId)).unwrap();
        toast.success('Order deleted successfully');
        navigate('/admin/orders');
      } catch (error) {
        toast.error(error.message || 'Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchOrderDetails}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p>Order not found</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>
        <div className="flex space-x-4">
          <button
            onClick={handlePrintOrder}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
          {isAdmin && (
            <button
              onClick={handleDeleteOrder}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">#{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {isAdmin ? (
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className={`${getStatusColor(order.status)} rounded-full px-3 py-1 text-sm font-semibold mt-1`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <p className={`${getStatusColor(order.status)} rounded-full px-3 py-1 text-sm font-semibold mt-1 inline-block`}>
                    {order.status || 'pending'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Type</p>
                <p className="font-medium capitalize">{order.orderType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.user?.email || 'N/A'}</p>
              </div>
              {order.deliveryAddress && (
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium">
                    {order.deliveryAddress.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product?.title || 'Product'}
                      </div>
                      {item.customization && (
                        <div className="text-sm text-gray-500">
                          {item.customization.size && <span>Size: {item.customization.size}</span>}
                          {item.customization.toppings && item.customization.toppings.length > 0 && (
                            <span> | Toppings: {item.customization.toppings.join(', ')}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="font-medium">${order.totalPrice?.toFixed(2) || '0.00'}</div>
            </div>
            {order.deliveryCharge > 0 && (
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-600">Delivery Charge</div>
                <div className="font-medium">${order.deliveryCharge?.toFixed(2) || '0.00'}</div>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 text-lg font-bold">
              <div>Total</div>
              <div>${order.finalPrice?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 
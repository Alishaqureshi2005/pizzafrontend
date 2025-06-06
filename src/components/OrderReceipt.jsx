import React from 'react';
import { FaTimes } from 'react-icons/fa';

const OrderReceipt = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          {/* Restaurant Info */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-red-600">Pizza House</h1>
            <p className="text-gray-600">123 Main Street, City</p>
            <p className="text-gray-600">Phone: (123) 456-7890</p>
          </div>

          {/* Order Info */}
          <div className="border-t border-b py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order #</p>
                <p className="font-medium">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Type</p>
                <p className="font-medium capitalize">{order.orderType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p>{order.user?.name || 'N/A'}</p>
            <p>{order.user?.email || 'N/A'}</p>
            {order.orderType === 'delivery' && (
              <p>{formatAddress(order.deliveryAddress)}</p>
            )}
          </div>

          {/* Order Items */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product?.title || 'Product'}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x ${item.price.toFixed(2)}
                      {item.customization && (
                        <span>
                          {item.customization.size && ` | Size: ${item.customization.size}`}
                          {item.customization.toppings && item.customization.toppings.length > 0 && 
                            ` | Toppings: ${item.customization.toppings.join(', ')}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            {order.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>${order.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${order.finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium capitalize">{order.paymentMethod}</p>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-6">
            <p className="text-gray-600">Thank you for your order!</p>
            <p className="text-sm text-gray-500">Please keep this receipt for your records</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt; 
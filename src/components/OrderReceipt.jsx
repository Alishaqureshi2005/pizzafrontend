import React, { useRef } from 'react';

const OrderReceipt = ({ order, onClose }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const newWindow = window.open('', '', 'height=600,width=800');
    newWindow.document.write('<html><head><title>Order Receipt</title>');
    newWindow.document.write('<style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} h2{color:#dc2626;}</style>');
    newWindow.document.write('</head><body>');
    newWindow.document.write(printContents);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <div ref={receiptRef}>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Receipt</h2>

          <div className="mb-4">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Customer:</strong> {order.user?.name || order.customerInfo?.name || 'Guest'} ({order.user?.email || order.customerInfo?.email || 'N/A'})</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Order Type:</strong> {order.orderType}</p>

            {order.orderType === 'delivery' && order.deliveryAddress && (
              <div className="mt-2">
                <p><strong>Delivery Address:</strong></p>
                <p>{order.deliveryAddress.address}</p>
              </div>
            )}
          </div>

          <hr className="mb-4" />

          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="border-b pb-2">
                <p><strong>{item.quantity}x</strong> {item.product?.title || 'Item'}</p>
                {item.customization?.size && (
                  <p className="text-sm text-gray-600">Size: {item.customization.size}</p>
                )}
                {item.customization?.toppings?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Toppings: {item.customization.toppings.join(', ')}
                  </p>
                )}
                {item.customization?.specialInstructions && (
                  <p className="text-sm text-gray-600">Notes: {item.customization.specialInstructions}</p>
                )}
                <p className="text-sm text-gray-600">€{item.price.toFixed(2)} each</p>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div>
            <p><strong>Subtotal:</strong> €{(order.totalPrice || 0).toFixed(2)}</p>
            <p><strong>Delivery Fee:</strong> €{(order.deliveryCharge || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> €{(order.finalPrice || 0).toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;

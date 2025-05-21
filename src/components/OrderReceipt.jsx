import React from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';

const OrderReceipt = ({ order, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - PizzaHouse</title>
          <style>
            @media print {
              * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
              }
              html, body {
                width: 80mm !important;
                min-width: 80mm !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                overflow: hidden !important;
                background: white !important;
                box-sizing: border-box;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
              }
              #receipt-content > div {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
                width: 100% !important;
                box-sizing: border-box;
              }
              #receipt-content > div:last-child {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 5px !important;
                padding: 2px 0 !important;
              }
              .receipt-header h1 {
                font-size: 16px;
                font-weight: bold;
                margin: 0 !important;
                padding: 0 !important;
              }
              .receipt-header p {
                margin: 1px 0 !important;
                font-size: 11px;
              }
              .receipt-section {
                margin: 3px 0 !important;
                padding: 2px 0 !important;
                border-bottom: 1px dashed #000;
              }
              .receipt-section h3 {
                font-size: 12px;
                font-weight: bold;
                margin: 0 0 2px 0 !important;
              }
              .receipt-item {
                display: flex;
                justify-content: space-between;
                margin: 1px 0 !important;
                font-size: 11px;
                padding: 0 2px !important;
                width: 100% !important;
              }
              .receipt-item span:first-child {
                margin-right: 5px !important;
              }
              .receipt-item span:last-child {
                text-align: right;
                min-width: 45px;
              }
              .receipt-total {
                font-weight: bold;
                margin-top: 2px !important;
                font-size: 12px;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 5px !important;
                font-size: 11px;
                padding: 2px 0 !important;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 2px 0 !important;
              }
              .text-center {
                text-align: center;
              }
              .text-right {
                text-align: right;
              }
              .text-bold {
                font-weight: bold;
              }
              @page {
                size: 80mm auto;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Order Receipt</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaPrint className="text-lg" />
              <span>Print</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div id="receipt-content" className="space-y-4">
            {/* Restaurant Header */}
            <div className="text-center border-b pb-4 receipt-header">
              <h1>PIZZAHOUSE</h1>
              <p>123 Pizza Street, Foodville</p>
              <p>Tel: (123) 456-7890</p>
              <p>www.pizzahouse.com</p>
            </div>

            {/* Order Info */}
            <div className="border-b pb-4 receipt-section">
              <div className="receipt-item">
                <span>Order #:</span>
                <span>{order._id}</span>
              </div>
              <div className="receipt-item">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="receipt-item">
                <span>Status:</span>
                <span>{order.status}</span>
              </div>
              <div className="receipt-item">
                <span>Payment:</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b pb-4 receipt-section">
              <h3>CUSTOMER INFORMATION</h3>
              <div className="receipt-item">
                <span>Name:</span>
                <span>{order.user?.name}</span>
              </div>
              <div className="receipt-item">
                <span>Email:</span>
                <span>{order.user?.email}</span>
              </div>
              <div className="receipt-item">
                <span>Address:</span>
                <span>{formatAddress(order.deliveryAddress)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b pb-4 receipt-section">
              <h3>ORDER ITEMS</h3>
              {order.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <span>{item.quantity}x {item.product?.title || 'Product'}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-b pb-4 receipt-section">
              <div className="receipt-item">
                <span>Subtotal:</span>
                <span>€{order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="receipt-item">
                <span>Delivery Fee:</span>
                <span>€2.50</span>
              </div>
              <div className="divider"></div>
              <div className="receipt-item receipt-total">
                <span>TOTAL:</span>
                <span>€{(order.totalPrice + 2.50).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 receipt-footer">
              <p>Thank you for choosing PizzaHouse!</p>
              <p>Please come again!</p>
              <div className="divider"></div>
              <p>This is a computer generated receipt</p>
              <p>No signature required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt; 
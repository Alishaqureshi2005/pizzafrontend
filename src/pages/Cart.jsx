import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  fetchCart,
  removeFromCart,
  updateCartItem,
  clearCart
} from '../store/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, deliveryFee, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleCheckout = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      navigate('/order');
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading Cart...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Cart</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => dispatch(fetchCart())}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some delicious items to your cart!</p>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {items.map((item) => {
                const itemName = item.name || item.product?.name || 'Product';
                const itemPrice = parseFloat(item.price) || 0;
                const itemQuantity = parseInt(item.quantity) || 1;
                const itemId = item._id || item.id;

                return (
                  <div
                    key={itemId}
                    className="p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {itemName}
                        </h3>
                        {item.size && (
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                        )}
                        {item.crust && (
                          <p className="text-sm text-gray-600">Crust: {item.crust}</p>
                        )}
                        {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Toppings: {item.toppings.map(t => t.name || t).join(', ')}
                          </p>
                        )}
                        {Array.isArray(item.extraItems) && item.extraItems.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Extras: {item.extraItems.map(e => e.name || e).join(', ')}
                          </p>
                        )}
                        <p className="text-red-600 font-semibold mt-2">
                          €{itemPrice.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId, quantity: itemQuantity - 1 }))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={loading || itemQuantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <span className="px-3 py-1">{itemQuantity}</span>
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId, quantity: itemQuantity + 1 }))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={loading}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => dispatch(removeFromCart(itemId))}
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>€{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total</span>
                    <span>€{(total + deliveryFee).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 
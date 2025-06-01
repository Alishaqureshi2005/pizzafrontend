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
    loadCart();
  }, [dispatch]);

  const loadCart = async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart. Please try again.');
    }
  };

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        return;
      }
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity. Please try again.');
      loadCart();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!items || items.length === 0) {
        toast.error('Your cart is empty.');
        return;
      }

      // Calculate total
      const cartTotal = items.reduce((total, item) => {
        return total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      }, 0);

      if (isNaN(cartTotal) || cartTotal <= 0) {
        toast.error('Invalid cart total. Please try again.');
        return;
      }

      // Refresh the cart data before proceeding
      const cartData = await dispatch(fetchCart()).unwrap();
      if (!cartData || !cartData.data || !cartData.data.items || cartData.data.items.length === 0) {
        toast.error('Failed to fetch cart data');
        return;
      }

      // Navigate to order page
      navigate('/order', {
        state: {
          cartData: {
            items: cartData.data.items.map(item => ({
              ...item,
              price: parseFloat(item.price) || 0,
              quantity: parseInt(item.quantity) || 1
            })),
            cartId: cartData.data._id,
            total: cartTotal,
            subtotal: cartTotal,
            deliveryFee: deliveryFee,
            itemCount: cartData.data.items.length,
            user: cartData.data.user
          }
        }
      });
    } catch (error) {
      console.error('Error proceeding to order:', error);
      toast.error('Failed to proceed to order. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
      loadCart();
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
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
              onClick={loadCart}
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
            disabled={loading}
          >
            <FaTrash />
            Clear Cart
          </button>
        </div>
        
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
                            onClick={() => handleQuantityUpdate(itemId, itemQuantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={loading || itemQuantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <span className="px-3 py-1">{itemQuantity}</span>
                          <button
                            onClick={() => handleQuantityUpdate(itemId, itemQuantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={loading}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(itemId)}
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
                  onClick={handlePlaceOrder}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Place Order
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

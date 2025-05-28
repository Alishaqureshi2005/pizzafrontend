import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartApi } from '../services/cartApi';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState(() => {
    const savedCart = localStorage.getItem('localCart');
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  });
  const [apiCart, setApiCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('localCart', JSON.stringify(localCart));
  }, [localCart]);

  const addToCart = async (itemData) => {
    try {
      const response = await cartApi.addToCart(itemData);
      const updatedCart = { items: response.data?.items || [response.data] };
      setApiCart(updatedCart);
      setLocalCart(updatedCart);
      toast.success('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      console.log('Removing item from cart:', productId);
      const response = await cartApi.removeFromCart(productId);
      console.log('Remove from cart response:', response);

      if (response.success && response.data) {
        const updatedCart = {
          items: response.data.items || [],
          _id: response.data._id,
          user: response.data.user,
          totalPrice: response.data.total || response.data.totalPrice
        };
        
        // Update both local and API cart states
        setApiCart(updatedCart);
        setLocalCart(updatedCart);
        
        // Update localStorage
        if (!isAuthenticated) {
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
        }
        
        toast.success('Item removed from cart');
        return response;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error removing from cart:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      // If we get a 403, the user might need to re-authenticate
      if (error.response?.status === 403) {
        toast.error('Please log in again to update your cart');
      } else {
        toast.error(error.message || 'Failed to remove item from cart');
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartApi.updateCartItem(productId, quantity);
      const updatedCart = { items: response.data?.items || [] };
      setApiCart(updatedCart);
      setLocalCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      const emptyCart = { items: [] };
      setApiCart(emptyCart);
      setLocalCart(emptyCart);
      localStorage.removeItem('localCart');
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    const cart = isAuthenticated ? apiCart : localCart;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    const currentCart = isAuthenticated ? apiCart : localCart;
    return currentCart.items.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  };

  const value = {
    cart: isAuthenticated ? apiCart : localCart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
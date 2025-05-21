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

  // Sync with API when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      syncCartWithAPI();
    }
  }, [isAuthenticated, user]);

  const syncCartWithAPI = async () => {
    try {
      setLoading(true);
      // Get cart from API
      const apiCartData = await cartApi.getCart();
      
      // Merge local cart with API cart
      const mergedCart = mergeCarts(localCart, apiCartData);
      
      // Update API cart
      const syncedCart = await cartApi.syncCart(mergedCart);
      
      // Update local state
      setApiCart(syncedCart);
      setLocalCart(syncedCart);
      
      // Clear local storage
      localStorage.removeItem('localCart');
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast.error('Failed to sync cart with account');
    } finally {
      setLoading(false);
    }
  };

  const mergeCarts = (localCart, apiCart) => {
    // Ensure we have arrays to work with
    const apiCartItems = Array.isArray(apiCart) ? apiCart : 
                        (apiCart?.items && Array.isArray(apiCart.items)) ? apiCart.items : 
                        (apiCart?.data && Array.isArray(apiCart.data)) ? apiCart.data : [];
    
    const localCartItems = Array.isArray(localCart) ? localCart : 
                          (localCart?.items && Array.isArray(localCart.items)) ? localCart.items : [];
    
    const merged = [...apiCartItems];
    
    localCartItems.forEach(localItem => {
      const existingItem = merged.find(item => 
        (item.productId === localItem.productId) || 
        (item._id === localItem.productId) ||
        (item.id === localItem.productId)
      );
      
      if (existingItem) {
        existingItem.quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });
    
    return { items: merged };
  };

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
      const response = await cartApi.removeFromCart(productId);
      const updatedCart = { items: response.data?.items || [] };
      setApiCart(updatedCart);
      setLocalCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
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
    const cart = isAuthenticated ? apiCart : localCart;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart: isAuthenticated ? apiCart : localCart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    syncCartWithAPI
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
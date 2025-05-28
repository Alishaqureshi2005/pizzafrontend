import api from './api';

const cartService = {
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (cartItem) => {
    try {
      // Validate cart item before sending
      if (!cartItem || !cartItem.productId) {
        throw new Error('Invalid cart item: Product ID is required');
      }

      // Ensure quantity is a number and at least 1
      const quantity = parseInt(cartItem.quantity) || 1;
      
      // Prepare the cart item data
      const itemData = {
        productId: cartItem.productId,
        quantity: quantity,
        price: parseFloat(cartItem.price) || 0,
        name: cartItem.name,
        size: cartItem.size,
        crust: cartItem.crust,
        toppings: cartItem.toppings || [],
        extraItems: cartItem.extraItems || [],
        specialInstructions: cartItem.specialInstructions || ''
      };

      console.log('Adding item to cart:', itemData);
      
      const response = await api.post('/cart/items', itemData);
      console.log('Add to cart response:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const response = await api.put(`/cart/items/${itemId}`, { 
        quantity: parseInt(quantity) || 1
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default cartService; 
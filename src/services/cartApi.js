import api from './api'; // Assuming your base api instance is exported from api.js

export const cartApi = {
  // @route   GET /api/cart
  // @access  Private
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error.response?.data || error.message);
      throw error;
    }
  },

  // @route   POST /api/cart/items
  // @access  Private
  addToCart: async (itemData) => {
    try {
      // Validate required fields
      if (!itemData.productId) {
        throw new Error('Product ID is required');
      }

      if (!itemData.size || !itemData.crust) {
        throw new Error('Size and crust are required');
      }

      // Log the incoming data
      console.log('Incoming cart item data:', JSON.stringify(itemData, null, 2));

      // Send data directly as it's already in the correct format
      const requestData = {
        productId: itemData.productId,
        quantity: itemData.quantity || 1,
        size: itemData.size,
        crust: itemData.crust,
        toppings: itemData.toppings || [],
        extraItems: itemData.extraItems || [],
        specialInstructions: itemData.specialInstructions || '',
        price: itemData.price
      };

      console.log('Sending to API:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/cart/items', requestData);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('Error adding item to cart:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        requestData: error.config?.data
      });
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Product not found. Please try again with a valid product.');
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid request data';
        throw new Error(errorMessage);
      }

      if (error.response?.status === 500) {
        const serverError = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        console.error('Server error details:', error.response.data);
        throw new Error(`Server error: ${serverError}`);
      }

      // If no specific error message is available
      throw new Error(error.response?.data?.message || error.message || 'Failed to add item to cart');
    }
  },

  // @route   PUT /api/cart/items/:itemId
  // @access  Private
  updateCartItem: async (itemId, itemData) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity: itemData.quantity,
        customization: {
          size: itemData.size,
          crust: itemData.crust,
          toppings: itemData.toppings,
          extraItems: itemData.extraItems,
          specialInstructions: itemData.specialInstructions
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error.response?.data || error.message);
      throw error;
    }
  },

  // @route   DELETE /api/cart/items/:itemId
  // @access  Private
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error.response?.data || error.message);
      throw error;
    }
  },

  // @route   DELETE /api/cart
  // @access  Private
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      throw error;
    }
  },

  // @route   PUT /api/cart/sync
  // @access  Private
  syncCart: async (cartData) => {
    try {
      const response = await api.put('/cart/sync', cartData);
      return response.data;
    } catch (error) {
      console.error('Error syncing cart:', error.response?.data || error.message);
      // If sync fails, return the cart data as is
      return { items: cartData.items || [] };
    }
  }
}; 
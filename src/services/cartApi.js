import api from './api'; // Assuming your base api instance is exported from api.js

export const cartApi = {
  // @route   GET /api/cart
  // @access  Private
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response;
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
      if (!itemData.productId || !itemData.size || !itemData.crust) {
        throw new Error('Product ID, size, and crust are required');
      }

      // Format the request data to match the backend API
      const requestData = {
        productId: itemData.productId,
        size: itemData.size.toLowerCase(),
        crust: itemData.crust.toLowerCase(),
        toppings: itemData.toppings?.map(topping => ({
          id: topping.id,
          name: topping.name,
          price: Number(topping.price),
          quantity: Number(topping.quantity) || 0
        })) || [],
        extraItems: itemData.extraItems?.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity) || 0
        })) || [],
        specialInstructions: itemData.specialInstructions || '',
        quantity: Number(itemData.quantity) || 1
      };

      console.log('Sending cart request:', JSON.stringify(requestData, null, 2));

      const response = await api.post('/cart/items', requestData);
      console.log('Cart API Response:', response.data);

      return response;
    } catch (error) {
      console.error('Error adding item to cart:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Please log in to add items to cart');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request data');
      }

      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to add item to cart'
      );
    }
  },

  // @route   PUT /api/cart/items/:itemId
  // @access  Private
  updateCartItem: async (itemId, itemData) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity: Number(itemData.quantity) || 1
      });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error.response?.data || error.message);
      throw error;
    }
  },

  // @route   DELETE /api/cart/items/:itemId
  // @access  Private
  removeFromCart: async (itemId) => {
    try {
      if (!itemId) {
        throw new Error('Item ID is required');
      }
      console.log('Removing item with ID:', itemId);
      const response = await api.delete(`/cart/items/${itemId}`);
      console.log('Remove response:', response.data);
      return response;
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
      return response;
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      throw error;
    }
  }
}; 
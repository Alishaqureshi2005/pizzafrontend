import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const productService = {
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      console.log('Raw API Response:', response.data);

      // Check if response has the expected structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // If response is not in expected format, try to handle it
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // If response is an object with data property
      if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error in getProduct:', error);
      throw error;
    }
  },

  getAllCategories: async () => {
    try {
      return await api.get('/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  getAllToppings: async () => {
    try {
      const response = await api.get('/toppings');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching toppings:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  getAllExtraItems: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.extraType) params.append('extraType', filters.extraType);
      
      const response = await api.get(`/extras?${params.toString()}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching extra items:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await api.get('/products/search', { params: { query } });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search products');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error.response?.data || error;
    }
  },

  getPopularProducts: async () => {
    try {
      return await api.get('/products/popular');
    } catch (error) {
      console.error('Error fetching popular products:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  getSpecialOffers: async () => {
    try {
      return await api.get('/products/special-offers');
    } catch (error) {
      console.error('Error fetching special offers:', error);
      return { success: false, data: [], message: error.message };
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get single category
  getCategory: async (id) => {
    try {
      const response = await api.get(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Get all extra items
  getExtraItems: async () => {
    try {
      const response = await api.get('/extras');
      return response.data;
    } catch (error) {
      console.error('Error fetching extra items:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get extra items by category
  getExtraItemsByCategory: async (category) => {
    try {
      const response = await api.get(`/extras/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching extra items by category:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Search pizzas
  searchPizzas: async (query) => {
    const response = await api.get('/products/pizzas/search', {
      params: { query }
    });
    return response.data;
  },

  // Get pizzas by category
  getPizzasByCategory: async (categoryId) => {
    const response = await api.get(`/products/categories/${categoryId}/pizzas`);
    return response.data;
  },

  // Get popular pizzas
  getPopularPizzas: async () => {
    const response = await api.get('/products/pizzas/popular');
    return response.data;
  },

  // Get toppings by type
  getToppingsByType: async (type) => {
    try {
      const response = await api.get(`/toppings/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching toppings by type:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get popular toppings
  getPopularToppings: async () => {
    try {
      const response = await api.get('/toppings/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular toppings:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get vegetarian toppings
  getVegetarianToppings: async () => {
    try {
      const response = await api.get('/toppings/vegetarian');
      return response.data;
    } catch (error) {
      console.error('Error fetching vegetarian toppings:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch products by category');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error.response?.data || error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch featured products');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error.response?.data || error;
    }
  }
}; 
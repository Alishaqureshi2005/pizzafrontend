import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { productService } from '../services/productService';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productService.getAllProducts();
      console.log('Fetched categories:', data);

      // Ensure we have valid data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      // Filter out categories with no items
      const validCategories = data.filter(category => 
        category && 
        Array.isArray(category.items) && 
        category.items.length > 0
      );

      console.log('Valid categories:', validCategories);
      setCategories(validCategories);

      // Flatten all items for display
      const allItems = validCategories.reduce((acc, category) => {
        const categoryItems = category.items.map(item => ({
          ...item,
          categoryName: category.name,
          categoryId: category._id
        }));
        return [...acc, ...categoryItems];
      }, []);

      console.log('All items:', allItems);
      setMenuData(allItems);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.info('Please log in to add items to the cart.');
      navigate('/login', { state: { from: '/menu' } });
      return;
    }

    // Direct navigation to customization page
    navigate(`/pizza-customization/${item._id}`, {
      state: {
        pizza: {
          ...item,
          customization: item.customization || {
            sizes: [],
            crusts: [],
            maxToppings: 5,
            maxExtraItems: 3
          }
        }
      }
    });
  };

  // Filter items based on search query and category
  const filteredItems = menuData.filter(item => {
    const matchesSearch = searchQuery === '' || 
                         (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading Menu...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Menu</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Our Menu</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our delicious selection of handcrafted pizzas, made with the finest ingredients
            and baked to perfection in our traditional wood-fired oven.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          <div className="relative min-w-[300px] max-w-xl">
            <input
              type="text"
              placeholder="Search our menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 text-gray-700 placeholder-gray-500 shadow-sm"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch className="w-5 h-5" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-nowrap custom-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-200 font-medium ${
                activeCategory === 'all'
                  ? 'bg-red-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category._id)}
                className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-200 font-medium ${
                  activeCategory === category._id
                    ? 'bg-red-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={item.image || '/images/placeholder.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full">
                  €{(item.basePrice || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-red-600 mb-2">{item.categoryName}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                {item.customization?.sizes && item.customization.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Available Sizes:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.customization.sizes.map(size => (
                        <span key={size._id || size.name} className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {size.name}: €{((item.basePrice || 0) * (size.priceMultiplier || 1)).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex cursor-pointer items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  {item.customization ? 'Customize & Add to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {loading ? 'Loading menu items...' : 
               error ? 'Error loading menu items. Please try again.' :
               'No items found in this category. Please check back later.'}
            </p>
            {error && (
              <button
                onClick={fetchProducts}
                className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

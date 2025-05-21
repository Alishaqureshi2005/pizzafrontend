import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { productService } from '../services/productService';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [extraItems, setExtraItems] = useState([]);
  const [toppings, setToppings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuResponse, extraItemsResponse, toppingsResponse] = await Promise.all([
          productService.getAllProducts(),
          productService.getExtraItems(),
          productService.getAllToppings()
        ]);

        if (menuResponse?.success && Array.isArray(menuResponse.data)) {
          const transformedData = menuResponse.data.map(category => ({
            ...category,
            items: category.items.map(item => {
              const basePrice = parseFloat(item.price) || 0;
              return {
                ...item,
                price: basePrice,
                sizes: [
                  { id: 'small', name: 'Small', price: basePrice * 0.8 },
                  { id: 'medium', name: 'Medium', price: basePrice },
                  { id: 'large', name: 'Large', price: basePrice * 1.2 }
                ]
              };
            })
          }));
          setMenuData(transformedData);
        }

        if (extraItemsResponse?.success) {
          setExtraItems(extraItemsResponse.data);
        }

        if (toppingsResponse?.success) {
          setToppings(toppingsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.info('Please log in to add items to the cart.');
      return;
    }

    setSelectedPizza(item);
    setShowCustomizationModal(true);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleCustomizationConfirm = () => {
    if (!selectedSize) {
      toast.warning('Please select a size before proceeding');
      return;
    }
    setShowCustomizationModal(false);
    navigate(`/pizza-customization/${selectedPizza._id}`, {
      state: {
        selectedSize,
        pizza: selectedPizza
      }
    });
  };

  const handleCustomizationCancel = () => {
    setShowCustomizationModal(false);
    setSelectedPizza(null);
    setSelectedSize(null);
  };

  // Flatten items from all categories for filtering and display
  const allItems = Array.isArray(menuData) ? menuData.reduce((acc, category) => {
    if (category && Array.isArray(category.items)) {
      return acc.concat(category.items);
    }
    return acc;
  }, []) : [];

  // Filter items based on active category and search query
  const filteredItems = allItems.filter(item => {
    if (!item) return false;
    
    const matchesCategory = activeCategory === 'all' || 
                          (item.category && item.category === activeCategory);
    const matchesSearch = searchQuery === '' || 
                         (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Derive categories for filter buttons from fetched data
  const categoriesForFilter = [
    { _id: 'all', name: 'All Pizzas' },
    ...(Array.isArray(menuData) ? menuData.map(category => ({
      _id: category?._id || '',
      name: category?.name || 'Unnamed Category'
    })) : [])
  ];

  if (loading) {
    return <div className="text-center py-8">Loading menu...</div>;
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search pizzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categoriesForFilter.map(category => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category._id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category._id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-red-50'
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
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full">
                  From ${(item.sizes?.[0]?.price || item.price || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Available Sizes:</p>
                  <div className="flex gap-2 mt-1">
                    {(item.sizes || []).map(size => (
                      <span key={size.id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {size.name}: ${(size.price || 0).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex cursor-pointer items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Customize & Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No pizzas found matching your criteria.</p>
          </div>
        )}

        {/* Customization Modal */}
        {showCustomizationModal && selectedPizza && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Customize Your Pizza</h3>
                <button
                  onClick={handleCustomizationCancel}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Pizza Details */}
                <div>
                  <div className="relative rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedPizza.image}
                      alt={selectedPizza.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h4 className="text-xl font-semibold text-white">{selectedPizza.name}</h4>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedPizza.description}</p>
                  
                  {/* Size Selection */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="font-medium text-gray-800 mb-3">Choose Your Size</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedPizza.sizes.map(size => (
                        <button
                          key={size.id}
                          onClick={() => handleSizeSelect(size)}
                          className={`p-3 rounded-lg border transition-all text-center ${
                            selectedSize?.id === size.id
                              ? 'bg-red-50 border-red-500 shadow-md'
                              : 'bg-white border-gray-200 hover:border-red-500 hover:shadow-md'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{size.name}</div>
                          <div className="text-sm text-red-600">${size.price.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                    {!selectedSize && (
                      <p className="text-sm text-red-500 mt-2">Please select a size to continue</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Customization Options */}
                <div>
                  {/* Available Toppings */}
                  {toppings.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-800 mb-3">Available Toppings</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {toppings.slice(0, 6).map(topping => (
                          <div
                            key={topping._id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              id={`topping-${topping._id}`}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <label
                              htmlFor={`topping-${topping._id}`}
                              className="text-sm text-gray-700"
                            >
                              {topping.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {toppings.length > 6 && (
                        <button className="text-sm text-red-600 hover:text-red-700 mt-2">
                          View all {toppings.length} toppings
                        </button>
                      )}
                    </div>
                  )}

                  {/* Extra Items */}
                  {extraItems.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-800 mb-3">Available Extras</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {extraItems.slice(0, 4).map(item => (
                          <div
                            key={item._id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              id={`extra-${item._id}`}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <label
                              htmlFor={`extra-${item._id}`}
                              className="text-sm text-gray-700"
                            >
                              {item.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {extraItems.length > 4 && (
                        <button className="text-sm text-red-600 hover:text-red-700 mt-2">
                          View all {extraItems.length} extras
                        </button>
                      )}
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-800 mb-3">Special Instructions</h5>
                    <textarea
                      placeholder="Add any special instructions for your pizza..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleCustomizationCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomizationConfirm}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedSize
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedSize}
                >
                  {selectedSize ? 'Proceed to Customization' : 'Select a Size to Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

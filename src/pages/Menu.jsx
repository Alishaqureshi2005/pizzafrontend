import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { productService } from '../services/productService';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
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
        
        // Fetch menu items
        const menuResponse = await productService.getAllProducts();
        console.log('Menu Response:', menuResponse);

        if (menuResponse?.success && Array.isArray(menuResponse.data)) {
          // Extract categories and their items
          const categoriesWithItems = menuResponse.data.map(category => ({
            _id: category._id,
            name: category.name,
            description: category.description,
            items: category.items || []
          }));

          // Set categories for the filter buttons
          setCategories(categoriesWithItems);

          // Flatten all items for display
          const allItems = categoriesWithItems.reduce((acc, category) => {
            return acc.concat(category.items.map(item => ({
              ...item,
              categoryId: category._id,
              categoryName: category.name
            })));
          }, []);

          console.log('Processed Menu Items:', allItems);
          setMenuData(allItems);
        } else {
          console.error('Invalid menu response format:', menuResponse);
          toast.error('Failed to load menu data');
          setMenuData([]);
        }

        // Only fetch these if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          const [extraItemsResponse, toppingsResponse] = await Promise.all([
            productService.getExtraItems(),
            productService.getAllToppings()
          ]);

        if (extraItemsResponse?.success) {
            setExtraItems(extraItemsResponse.data || []);
        }

        if (toppingsResponse?.success && Array.isArray(toppingsResponse.data)) {
          setToppings(toppingsResponse.data);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load menu data');
        setMenuData([]);
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
      navigate('/login', { state: { from: '/menu' } });
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

    // Get the customization data from the selected pizza
    const customization = selectedPizza?.customization || {
      sizes: [],
      crusts: [],
      maxToppings: 5,
      maxExtraItems: 3
    };

    navigate(`/pizza-customization/${selectedPizza._id}`, {
      state: {
        selectedSize,
        pizza: {
          ...selectedPizza,
          customization
        }
      }
    });
  };

  const handleCustomizationCancel = () => {
    setShowCustomizationModal(false);
    setSelectedPizza(null);
    setSelectedSize(null);
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
                  ${(item.basePrice || 0).toFixed(2)}
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
                          {size.name}: ${((item.basePrice || 0) * (size.priceMultiplier || 1)).toFixed(2)}
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
            <p className="text-gray-600 text-lg">No items found matching your criteria.</p>
          </div>
        )}

        {/* Customization Modal */}
        {showCustomizationModal && selectedPizza && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedPizza.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedPizza.description}</p>
                </div>
                <button
                  onClick={handleCustomizationCancel}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Pizza Image and Size Selection */}
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
                    <img
                      src={selectedPizza.image || '/images/placeholder.jpg'}
                      alt={selectedPizza.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  {/* Size Selection */}
                  {selectedPizza.customization?.sizes && selectedPizza.customization.sizes.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-xl mb-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Choose Your Size</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedPizza.customization.sizes.map((size) => (
                          <button
                            key={size._id || size.name}
                            onClick={() => handleSizeSelect(size)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedSize?._id === size._id
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-gray-200 hover:border-red-300'
                            }`}
                          >
                            <div className="text-lg font-medium">{size.name}</div>
                            <div className="text-red-600 font-semibold mt-1">
                              ${((selectedPizza.basePrice || 0) * (size.priceMultiplier || 1)).toFixed(2)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Base Price Info */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Base Price:</span>
                      <span className="text-lg font-semibold text-red-600">
                        ${(selectedPizza.basePrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Action Buttons */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleCustomizationCancel}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomizationConfirm}
                    disabled={!selectedSize && selectedPizza.customization?.sizes?.length > 0}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      selectedSize || !selectedPizza.customization?.sizes?.length
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedPizza.customization?.sizes?.length > 0 
                      ? selectedSize 
                        ? 'Proceed to Customization' 
                        : 'Select a Size'
                      : 'Add to Cart'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

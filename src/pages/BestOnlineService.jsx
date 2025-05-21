import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { productApi } from '../services/adminApi';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

const BestOnlineService = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const toggleSection = (categoryId) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getProducts();
        if (response?.data?.success && Array.isArray(response.data.data)) {
          setMenuData(response.data.data);
          const initialExpandedState = response.data.data.reduce((acc, category) => {
            acc[category._id] = true;
            return acc;
          }, {});
          setExpandedSections(initialExpandedState);
        } else {
          setMenuData([]);
          setError('Unexpected data format from server.');
        }
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setMenuData([]);
        setError(err.message || 'Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const filteredMenuData = menuData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  const finalFilteredMenuData = activeCategory === 'all'
    ? filteredMenuData
    : filteredMenuData.filter(category => category._id === activeCategory);

  const handleAddToCart = (item) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.info('Please log in to add items to the cart.');
      return;
    }

    addToCart({
      id: item._id,
      title: item.title,
      content: item.content,
      price: parseFloat(item.price),
      image: item.image
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading menu...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Bestel Online Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ontdek ons heerlijke menu en bestel direct online. Snelle service en verse ingrediënten!
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Zoek in het menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          <button
            key="all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            All Pizzas
          </button>
          {menuData.map((category) => (
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

        <div className="space-y-8">
          {finalFilteredMenuData.map((section) => (
            <div key={section.category} className="bg-white rounded-xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <div>
                  <h2 className="text-xl font-semibold">{section.name}</h2>
                  <p className="text-sm text-red-100">{section.description}</p>
                </div>
                {expandedSections[section._id] ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {expandedSections[section._id] && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {item.img && (
                          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <img
                              src={`${API_URL}/uploads/${item.image}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                            €{parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{item.content}</p>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart />
                          Bestellen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredMenuData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Geen items gevonden die overeenkomen met je zoekopdracht.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestOnlineService;


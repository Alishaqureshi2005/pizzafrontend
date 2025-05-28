import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { addItemToCart } from '../store/slices/cartSlice';
import SizeSelector from '../components/pizza-customization/SizeSelector';
import CrustSelector from '../components/pizza-customization/CrustSelector';
import ToppingSelector from '../components/pizza-customization/ToppingSelector';
import ExtraItemsSelector from '../components/pizza-customization/ExtraItemsSelector';
import PriceSummary from '../components/pizza-customization/PriceSummary';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
`;

const CustomizationSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SpecialInstructions = styled.div`
  margin-top: 2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  margin-top: 0.5rem;
`;

const PizzaCustomization = () => {
  const navigate = useNavigate();
  const params = useParams();
  const productId = params.id;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCrust, setSelectedCrust] = useState('');
  const [toppingsByCategory, setToppingsByCategory] = useState({});
  const [extraItemsByCategory, setExtraItemsByCategory] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [pizzaDetails, setPizzaDetails] = useState(null);

  // Log the current URL and params when component mounts
  useEffect(() => {
    console.log('Current URL:', window.location.pathname);
    console.log('URL Params:', params);
    console.log('Product ID from params:', productId);
  }, [params, productId]);

  // Separate useEffect for product ID validation
  useEffect(() => {
    if (!productId) {
      console.error('No product ID found in URL');
      console.log('Current URL path:', window.location.pathname);
      console.log('Expected URL format: /pizza-customization/:id');
      toast.error('Invalid product selection');
      navigate('/menu');
      return;
    }
    console.log('Valid product ID found:', productId);
  }, [productId, navigate]);

  // Separate useEffect for fetching customization options
  useEffect(() => {
    if (productId) {
      console.log('Fetching customization options for product:', productId);
      fetchCustomizationOptions();
    }
  }, [productId]);

  const fetchCustomizationOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Default data in case API is not available
      const defaultData = {
        sizes: [
          { name: 'Small', price: 8.99, category: 'Size' },
          { name: 'Medium', price: 10.99, category: 'Size' },
          { name: 'Large', price: 12.99, category: 'Size' }
        ],
        crusts: [
          { name: 'Classic', price: 0, category: 'Crust' },
          { name: 'Thin', price: 0, category: 'Crust' },
          { name: 'Thick', price: 1.99, category: 'Crust' }
        ],
        toppings: [
          { id: 1, name: 'Pepperoni', price: 1.99, type: 'meat', calories: 120, isVegetarian: false },
          { id: 2, name: 'Mushrooms', price: 1.49, type: 'vegetable', calories: 30, isVegetarian: true },
          { id: 3, name: 'Onions', price: 1.49, type: 'vegetable', calories: 25, isVegetarian: true },
          { id: 4, name: 'Sausage', price: 1.99, type: 'meat', calories: 150, isVegetarian: false },
          { id: 5, name: 'Bacon', price: 1.99, type: 'meat', calories: 140, isVegetarian: false },
          { id: 6, name: 'Extra Cheese', price: 1.49, type: 'cheese', calories: 100, isVegetarian: true }
        ],
        extraItems: [
          { id: 1, name: 'Garlic Bread', price: 3.99, category: 'Sides' },
          { id: 2, name: 'Chicken Wings', price: 6.99, category: 'Sides' },
          { id: 3, name: 'Soft Drink', price: 1.99, category: 'Drinks' }
        ]
      };

      try {
        console.log('Attempting to fetch customization options...');
        
        // Log the API URLs being called
        const apiUrls = {
          sizes: `${API_URL}/pizza/sizes`,
          crusts: `${API_URL}/pizza/crusts`,
          toppings: `${API_URL}/toppings`,
          extraItems: `${API_URL}/pizza/extra-items`
        };
        console.log('API URLs:', apiUrls);

        // Try to fetch from API with proper error handling
        const [sizesRes, crustsRes, toppingsRes, extraItemsRes] = await Promise.all([
          fetch(`${API_URL}/pizza/sizes/${productId}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }).then(async res => {
            console.log('Sizes API Response:', {
              status: res.status,
              statusText: res.statusText,
              headers: Object.fromEntries(res.headers.entries())
            });
            
            let data;
            if (!res.ok) {
              // If product-specific sizes fail, try fetching default sizes
              console.log('Falling back to default sizes...');
              const defaultRes = await fetch(`${API_URL}/pizza/sizes`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });
              
              if (!defaultRes.ok) {
                console.error('Failed to fetch both product-specific and default sizes');
                return defaultData.sizes;
              }
              
              data = await defaultRes.json();
            } else {
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn('Sizes API returned non-JSON response:', contentType);
              return defaultData.sizes;
            }
              data = await res.json();
            }
            
            console.log('Sizes Data:', data);
            return data.success && data.sizes ? data.sizes : defaultData.sizes;
          }),
          fetch(`${API_URL}/pizza/crusts`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }).then(async res => {
            console.log('Crusts API Response:', {
              status: res.status,
              statusText: res.statusText,
              headers: Object.fromEntries(res.headers.entries())
            });
            if (!res.ok) throw new Error(`Failed to fetch crusts: ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn('Crusts API returned non-JSON response:', contentType);
              return defaultData.crusts;
            }
            const data = await res.json();
            console.log('Crusts Data:', data);
            return data;
          }),
          fetch(`${API_URL}/toppings`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }).then(async res => {
            console.log('Toppings API Response:', {
              status: res.status,
              statusText: res.statusText,
              headers: Object.fromEntries(res.headers.entries()),
              url: res.url
            });
            if (!res.ok) throw new Error(`Failed to fetch toppings: ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn('Toppings API returned non-JSON response:', contentType);
              return defaultData.toppings;
            }
            const data = await res.json();
            console.log('Toppings Data:', data);
            return data;
          }),
          fetch(`${API_URL}/pizza/extra-items`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }).then(async res => {
            console.log('Extra Items API Response:', {
              status: res.status,
              statusText: res.statusText,
              headers: Object.fromEntries(res.headers.entries())
            });
            if (!res.ok) throw new Error(`Failed to fetch extra items: ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn('Extra Items API returned non-JSON response:', contentType);
              return defaultData.extraItems;
            }
            const data = await res.json();
            console.log('Extra Items Data:', data);
            return data;
          })
        ]);

        console.log('All API Responses:', {
          sizes: sizesRes,
          crusts: crustsRes,
          toppings: toppingsRes,
          extraItems: extraItemsRes
        });

        // Update state with API data
        if (Array.isArray(sizesRes)) {
          setSizes(sizesRes);
          if (sizesRes.length > 0) setSelectedSize(sizesRes[0].name);
        } else if (sizesRes && sizesRes.sizes && Array.isArray(sizesRes.sizes)) {
          setSizes(sizesRes.sizes);
          if (sizesRes.sizes.length > 0) setSelectedSize(sizesRes.sizes[0].name);
        }
        if (Array.isArray(crustsRes)) {
          setCrusts(crustsRes);
          if (crustsRes.length > 0) setSelectedCrust(crustsRes[0].name);
        }
        if (toppingsRes && toppingsRes.success && Array.isArray(toppingsRes.data)) {
          const groupedToppings = toppingsRes.data.reduce((acc, topping) => {
            // Ensure each topping has a unique ID and proper initial state
            const toppingWithId = {
              ...topping,
              id: topping._id || topping.id || `topping-${Date.now()}-${Math.random()}`, // Ensure unique ID
              quantity: 0,
              category: topping.category || topping.type || 'Other'
            };
            
            const category = toppingWithId.category;
            if (!acc[category]) {
              acc[category] = [];
            }
            
            // Check if this topping is already in the category
            const existingIndex = acc[category].findIndex(t => 
              t.name === toppingWithId.name || 
              (t.id && t.id === toppingWithId.id) || 
              (t._id && t._id === toppingWithId._id)
            );
            
            if (existingIndex === -1) {
              // Only add if not already present
              acc[category].push(toppingWithId);
            }
            
            return acc;
          }, {});
          
          console.log('Initialized toppings:', groupedToppings);
          setToppingsByCategory(groupedToppings);
        } else if (Array.isArray(toppingsRes)) {
          // Handle case where API returns direct array
          const groupedToppings = toppingsRes.reduce((acc, topping) => {
            const toppingWithId = {
              ...topping, 
              id: topping._id || topping.id || `topping-${Date.now()}-${Math.random()}`,
              quantity: 0,
              category: topping.category || topping.type || 'Other'
            };
            
            const category = toppingWithId.category;
            if (!acc[category]) {
              acc[category] = [];
            }
            
            // Check if this topping is already in the category
            const existingIndex = acc[category].findIndex(t => 
              t.name === toppingWithId.name || 
              (t.id && t.id === toppingWithId.id) || 
              (t._id && t._id === toppingWithId._id)
            );
            
            if (existingIndex === -1) {
              // Only add if not already present
              acc[category].push(toppingWithId);
            }
            
            return acc;
          }, {});
          
          console.log('Initialized toppings:', groupedToppings);
          setToppingsByCategory(groupedToppings);
        }
        if (Array.isArray(extraItemsRes)) {
          const groupedExtraItems = extraItemsRes.reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push({ ...item, quantity: 0 });
            return acc;
          }, {});
          setExtraItemsByCategory(groupedExtraItems);
        }

      } catch (apiError) {
        console.error('API Error Details:', {
          message: apiError.message,
          stack: apiError.stack,
          name: apiError.name
        });
        // Use default data if API calls fail
        setSizes(defaultData.sizes);
        setCrusts(defaultData.crusts);
        setSelectedSize(defaultData.sizes[0].name);
        setSelectedCrust(defaultData.crusts[0].name);
        
        const groupedToppings = defaultData.toppings.reduce((acc, topping) => {
          const category = topping.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push({ ...topping, quantity: 0 });
          return acc;
        }, {});
        setToppingsByCategory(groupedToppings);

        const groupedExtraItems = defaultData.extraItems.reduce((acc, item) => {
          const category = item.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push({ ...item, quantity: 0 });
          return acc;
        }, {});
        setExtraItemsByCategory(groupedExtraItems);
        
        toast.warning('Using default customization options');
      }
    } catch (err) {
      console.error('Error in fetchCustomizationOptions:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError('Failed to load customization options. Please try again later.');
      toast.error('Failed to load customization options');
    } finally {
      setLoading(false);
    }
  };

  const handleToppingQuantityChange = (toppingId, change) => {
    console.log('Attempting to update topping:', { toppingId, change });
    
    setToppingsByCategory(prev => {
      // Create a new state object
      const newState = {};
      let updated = false;

      // Iterate through each category
      for (const [category, toppings] of Object.entries(prev)) {
        // Create a new array for this category
        newState[category] = toppings.map(topping => {
          // Only update the specific topping that matches the ID
          if ((topping.id === toppingId || topping._id === toppingId) && !updated) {
            updated = true; // Mark as updated to prevent multiple updates
            const newQuantity = Math.max(0, (topping.quantity || 0) + change);
            console.log(`Updating ${topping.name} quantity from ${topping.quantity} to ${newQuantity}`);
            return {
              ...topping,
              quantity: newQuantity
            };
          }
          // Return unchanged topping
          return topping;
        });
      }

      return newState;
    });
  };

  const handleExtraItemQuantityChange = (itemId, change) => {
    setExtraItemsByCategory(prev => {
      const newItems = { ...prev };
      Object.keys(newItems).forEach(category => {
        newItems[category] = newItems[category].map(item => {
          if (item.id === itemId) {
      return {
              ...item,
              quantity: Math.max(0, (item.quantity || 0) + change)
      };
          }
          return item;
        });
      });
      return newItems;
    });
  };

  const calculateTotal = () => {
    let total = 0;

    // Add base price from selected size
    const selectedSizeObj = sizes.find(s => s.name === selectedSize);
    if (selectedSizeObj) {
      total += selectedSizeObj.price || 0;
    }

    // Add crust price
    const selectedCrustObj = crusts.find(c => c.name === selectedCrust);
    if (selectedCrustObj) {
      total += selectedCrustObj.price || 0;
    }

    // Add toppings
    Object.values(toppingsByCategory).forEach(toppings => {
      toppings.forEach(topping => {
        if (topping.quantity > 0) {
          total += (topping.price || 0) * topping.quantity;
        }
      });
    });

    // Add extra items
    Object.values(extraItemsByCategory).forEach(items => {
      items.forEach(item => {
        if (item.quantity > 0) {
          total += (item.price || 0) * item.quantity;
        }
      });
    });

    return total;
  };

  const calculateToppingsTotal = () => {
    return Object.values(toppingsByCategory)
      .flat()
      .reduce((total, topping) => total + ((topping.price || 0) * (topping.quantity || 0)), 0);
  };

  const calculateExtraItemsTotal = () => {
    return Object.values(extraItemsByCategory)
      .flat()
      .reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  };

  const calculateBasePrice = () => {
    let basePrice = 0;
    
    // Add size price
    const selectedSizeObj = sizes.find(s => s.name === selectedSize);
    if (selectedSizeObj) {
      basePrice += selectedSizeObj.price || 0;
    }

    // Add crust price
    const selectedCrustObj = crusts.find(c => c.name === selectedCrust);
    if (selectedCrustObj) {
      basePrice += selectedCrustObj.price || 0;
    }

    return basePrice;
  };

  // Add validation function
  const validateSelections = () => {
    if (!selectedSize) {
      toast.error('Please select a pizza size');
      return false;
    }
    if (!selectedCrust) {
      toast.error('Please select a crust type');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      // Validate selections first
      if (!validateSelections()) {
        setIsAddingToCart(false);
        return;
      }

      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      // Get selected toppings with quantity > 0
      const selectedToppings = Object.values(toppingsByCategory)
        .flat()
        .filter(topping => topping.quantity > 0)
        .map(topping => ({
            id: topping.id || topping._id,
            name: topping.name,
            price: Number(topping.price),
          quantity: Number(topping.quantity)
        }));

      // Get selected extra items with quantity > 0
      const selectedExtras = Object.values(extraItemsByCategory)
        .flat()
        .filter(item => item.quantity > 0)
        .map(item => ({
            id: item.id || item._id,
            name: item.name,
            price: Number(item.price),
          quantity: Number(item.quantity)
        }));

      // Get the selected size and crust objects for price calculation
      const selectedSizeObj = sizes.find(s => s.name.toLowerCase() === selectedSize.toLowerCase());
      const selectedCrustObj = crusts.find(c => c.name.toLowerCase() === selectedCrust.toLowerCase());

      if (!selectedSizeObj || !selectedCrustObj) {
        throw new Error('Invalid size or crust selection');
      }

      // Create cart item payload
      const cartPayload = {
        productId,
        size: selectedSize.toLowerCase(),
        crust: selectedCrust.toLowerCase(),
        toppings: selectedToppings,
        extraItems: selectedExtras,
        specialInstructions: specialInstructions || '',
        quantity: 1,
        basePrice: selectedSizeObj.price,
        crustPrice: selectedCrustObj.price || 0,
        price: calculateTotal()
      };

      console.log('Sending cart request:', cartPayload);

      // First verify if the product exists
      const productResponse = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!productResponse.ok) {
        throw new Error('Product not found or no longer available');
      }

      // Send request to backend
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartPayload)
      });
      
      const data = await response.json();
       console.log(data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      toast.success('Pizza added to cart!');
      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.message || 'Failed to add pizza to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      <Title>Order Customization</Title>
      <Content>
        <CustomizationSection>
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
          />
          <CrustSelector
            crusts={crusts}
            selectedCrust={selectedCrust}
            onCrustSelect={setSelectedCrust}
          />
          <ToppingSelector
            toppingsByCategory={toppingsByCategory}
            onToppingQuantityChange={handleToppingQuantityChange}
          />
          <ExtraItemsSelector
            extraItemsByCategory={extraItemsByCategory}
            onExtraItemQuantityChange={handleExtraItemQuantityChange}
          />
          <SpecialInstructions>
            <h2>Special Instructions</h2>
            <TextArea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special instructions for your pizza?"
            />
          </SpecialInstructions>
        </CustomizationSection>
        <PriceSummary
          basePrice={calculateBasePrice()}
          toppingsTotal={calculateToppingsTotal()}
          extraItemsTotal={calculateExtraItemsTotal()}
          totalPrice={calculateTotal()}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
      </Content>
    </Container>
  );
};

export default PizzaCustomization; 
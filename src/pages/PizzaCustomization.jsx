import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { addToCart } from '../store/slices/cartSlice';
import { productService } from '../services/productService';
import cartService from '../services/cartService';
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
   @media (max-width: 768px) {
   grid-template-columns: 1fr ;
   }
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
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);

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

  // Add useEffect to fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await productService.getProduct(productId);
        setProduct(response);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchCustomizationOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch the product details to get its customization options
      const productResponse = await productService.getProduct(productId);
      console.log('Product details:', productResponse);

      if (!productResponse || !productResponse.customization) {
        throw new Error('Product customization data not found');
      }

      const productCustomization = productResponse.customization;
      console.log('Product customization:', productCustomization);

      // Use the product's customization data
      if (productCustomization.sizes) {
        setSizes(productCustomization.sizes);
        if (productCustomization.sizes.length > 0) {
          setSelectedSize(productCustomization.sizes[0].name);
        }
      }

      if (productCustomization.crusts) {
        setCrusts(productCustomization.crusts);
        if (productCustomization.crusts.length > 0) {
          setSelectedCrust(productCustomization.crusts[0].name);
        }
      }

      // Fetch toppings
      try {
        const toppingsResponse = await fetch(`${API_URL}/toppings`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
        });

        if (!toppingsResponse.ok) {
          throw new Error(`Failed to fetch toppings: ${toppingsResponse.status}`);
        }

        const toppingsData = await toppingsResponse.json();
        console.log('Toppings Data:', toppingsData);

        if (toppingsData && Array.isArray(toppingsData)) {
          const groupedToppings = toppingsData.reduce((acc, topping) => {
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
            
            const existingIndex = acc[category].findIndex(t => 
              t.name === toppingWithId.name || 
              (t.id && t.id === toppingWithId.id) || 
              (t._id && t._id === toppingWithId._id)
            );
            
            if (existingIndex === -1) {
              acc[category].push(toppingWithId);
            }
            
            return acc;
          }, {});
          
          console.log('Initialized toppings:', groupedToppings);
          setToppingsByCategory(groupedToppings);
        }
      } catch (toppingsError) {
        console.error('Error fetching toppings:', toppingsError);
        toast.warning('Failed to load toppings. Some options may be limited.');
      }

      // Fetch extra items
      try {
        const extraItemsResponse = await fetch(`${API_URL}/pizza/extra-items`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!extraItemsResponse.ok) {
          throw new Error(`Failed to fetch extra items: ${extraItemsResponse.status}`);
        }

        const extraItemsData = await extraItemsResponse.json();
        console.log('Extra Items Data:', extraItemsData);

        if (extraItemsData && Array.isArray(extraItemsData)) {
          const groupedExtraItems = extraItemsData.reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push({ ...item, quantity: 0 });
            return acc;
          }, {});
          setExtraItemsByCategory(groupedExtraItems);
        }
      } catch (extraItemsError) {
        console.error('Error fetching extra items:', extraItemsError);
        toast.warning('Failed to load extra items. Some options may be limited.');
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

      // Validate required selections
      if (!validateSelections()) {
        setIsAddingToCart(false);
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
      const selectedExtraItems = Object.values(extraItemsByCategory)
        .flat()
        .filter(item => item.quantity > 0)
        .map(item => ({
          id: item.id || item._id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity)
        }));

      // Prepare cart item data
      const cartItem = {
        productId: productId,
        size: selectedSize,
        crust: selectedCrust,
        toppings: selectedToppings,
        extraItems: selectedExtraItems,
        quantity: quantity,
        specialInstructions: specialInstructions || ''
      };

      console.log('Adding to cart:', cartItem);

      // Dispatch the addToCart action
      const result = await dispatch(addToCart(cartItem)).unwrap();
      
      if (result.success) {
        toast.success('Added to cart successfully!');
        navigate('/cart');
      } else {
        throw new Error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Handle specific error cases
      if (error.message.includes('not found') || error.message.includes('no longer available')) {
        toast.error('This product is no longer available. Please try another item.');
        navigate('/menu');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to add items to your cart');
        navigate('/login', { state: { from: '/menu' } });
      } else {
        toast.error(error.message || 'Failed to add to cart. Please try again.');
      }
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
          customization={(() => {
            // Create a safe customization object
            const safeCustomization = {
              size: selectedSize || '',
              crust: selectedCrust || '',
              toppings: [],
              extraItems: [],
              specialInstructions: specialInstructions || ''
            };

            // Safely process toppings
            if (toppingsByCategory) {
              safeCustomization.toppings = Object.values(toppingsByCategory)
                .flat()
                .filter(topping => topping && typeof topping === 'object' && topping.quantity > 0)
                .map(topping => ({
                  name: String(topping.name || ''),
                  quantity: Number(topping.quantity || 0)
                }));
            }

            // Safely process extra items
            if (extraItemsByCategory) {
              safeCustomization.extraItems = Object.values(extraItemsByCategory)
                .flat()
                .filter(item => item && typeof item === 'object' && item.quantity > 0)
                .map(item => ({
                  name: String(item.name || ''),
                  quantity: Number(item.quantity || 0)
                }));
            }

            return safeCustomization;
          })()}
        />
      </Content>
    </Container>
  );
};

export default PizzaCustomization; 
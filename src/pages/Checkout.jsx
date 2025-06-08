import React, { useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
// import { deliveryZoneService } from '../services/deliveryZoneService';
import { validateOrderForm } from '../utils/validation';
import { FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa';
import { locationService } from '../services/locationService';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import restaurantService from '../services/restaurantService';
import getDistanceFromLatLonInKm from '../utils/distance';
import {
  fetchDeliveryZones
} from '../store/slices/deliveryZoneSlice';
import { useDispatch, useSelector } from 'react-redux';
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
};
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, total: initialTotal, subtotal } = location.state || { cartItems: [], total: 0, subtotal: 0 };
  const [deliveryFee, setDeliveryFee] = useState(0);
const [closestZone, setClosestZone] = useState(null);
const [total, setTotal] = useState(initialTotal);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    orderType: 'pickup',
    selectedTimeSlot: null,
    notes: '',
    tax: 0,
    discount: 0
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { zones, error } = useSelector((state) => state.deliveryZones);
  useEffect(() => {
    dispatch(fetchDeliveryZones());
  }, [dispatch]);
  
    useEffect(() => {
      if (error) {
        toast.error(error);
      }
    }, [error]);
    useEffect(() => {
  if (closestZone) {
      setDeliveryFee(closestZone.deliveryFee)
  } else {
      setDeliveryFee(0)
  }
}, [closestZone]);
  // const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
   const [position, setPosition] = useState(
      formData.coordinates ? 
      [formData.coordinates.latitude, formData.coordinates.longitude] : 
      [0,0] // Default to Mithi coordinates
    );
    const [searchAddress, setSearchAddress] = useState('');

  // Update total calculation when delivery fee changes
  useEffect(() => {
    if (formData.orderType === 'delivery') {
      const newTotal = subtotal + deliveryFee;
      setTotal(newTotal);
    } else {
      setTotal(subtotal);
    }
  }, [deliveryFee, formData.orderType, subtotal]);

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    setLoading(true);
    try {
      let searchQuery = searchAddress;
      if (!searchQuery.toLowerCase().includes('pakistan')) {
        searchQuery += ', Pakistan';
      }
      if (!searchQuery.toLowerCase().includes('hyderabad')) {
        searchQuery += ', Hyderabad';
      }

      const result = await locationService.convertAddressToCoordinates(searchQuery);
      
      if (!result.success) {
        toast.error(result.error || 'Location not found');
        return;
      }

      const { coordinates, address, area } = result.data;
      const restaurantLocation = await restaurantService.getAllRestaurants();
      setPosition([coordinates.latitude, coordinates.longitude]);
      const distance = getDistanceFromLatLonInKm(
        restaurantLocation.data[0].coordinates.latitude,
        restaurantLocation.data[0].coordinates.longitude,
        coordinates.latitude,
        coordinates.longitude
      );

      const matchingZones = zones.filter(zone => distance >= zone.distance);
      const newClosestZone = matchingZones.length > 0
        ? matchingZones.reduce((prev, curr) =>
            curr.distance > prev.distance ? curr : prev
          )
        : null;
      
      setClosestZone(newClosestZone);
      setDeliveryFee(newClosestZone ? newClosestZone.deliveryFee : 0);

      // Update form data with address and area
      setFormData(prev => ({
        ...prev,
        address,
        city: area, // Set the area as the city
      }));

      toast.success('Location found! You can adjust it by clicking on the map.');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Could not find the location. Please try again or use the map.');
    } finally {
      setLoading(false);
    }
  };
  
  // const getCurrentLocation = () => {
  //   setIsGettingLocation(true);
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const coords = {
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude
  //         };
  //         setCoordinates(coords);
  //         setIsGettingLocation(false);
  //       },
  //       (error) => {
  //         console.error('Error getting location:', error);
  //         setIsGettingLocation(false);
  //         toast.error('Failed to get location. Please enter your address manually.');
  //       }
  //     );
  //   } else {
  //     setIsGettingLocation(false);
  //     toast.error('Geolocation is not supported by your browser');
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // const handleTimeSlotSelect = (slot) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     selectedTimeSlot: slot
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
    setIsSubmitting(true);
    setFormErrors({});

    // Log form data for debugging
    console.log('Form Data:', formData);
    console.log('Order Type:', formData.orderType);
    console.log('Cart Items:', cartItems);
    console.log('Subtotal:', subtotal);
    console.log('Total:', total);

    // Validate form
    const errors = validateOrderForm(formData, formData.orderType);
    console.log('Validation Errors:', errors);
    
    if (Object.keys(errors).length > 0) {
      console.log('Form validation failed');
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Preparing order data...');
      // Calculate final price
      const finalPrice = formData.orderType === 'delivery' ? subtotal + deliveryFee : subtotal;
      console.log('Final Price:', finalPrice);

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          customization: {
            size: item.size,
            toppings: item.toppings,
            specialInstructions: item.specialInstructions
          }
        })),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        finalPrice: finalPrice,
        total: {
          subtotal: subtotal,
          deliveryFee: formData.orderType === 'delivery' ? deliveryFee : 0,
          total: finalPrice
        },
        tax: formData.tax || 0,
        discount: formData.discount || 0,
        notes: formData.notes || ''
      };

      // Add delivery specific data if order type is delivery
      if (formData.orderType === 'delivery') {
        if (!formData.address || !formData.city) {
          throw new Error('Delivery address and area are required for delivery orders');
        }

        // Extract area from the full address
        const addressParts = formData.address.split(',');
        const area = addressParts.find(part => 
          part.trim().toLowerCase().includes('colony') || 
          part.trim().toLowerCase().includes('area') ||
          part.trim().toLowerCase().includes('sector')
        )?.trim() || formData.city;

        orderData.deliveryAddress = {
          address: formData.address,
          area: area,
          coordinates: {
            latitude: position[0],
            longitude: position[1]
          }
        };
        orderData.deliveryCharge = deliveryFee;
        orderData.deliveryZone = closestZone._id; // Send only the ObjectId
        orderData.estimatedDeliveryTime = new Date(Date.now() + 45 * 60000);
      }

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      // Create the order
      const response = await orderService.createOrder(orderData);
      console.log('Order response:', response);
      
      if (response.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Failed to place order. Please try again.');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('Unable to connect to the server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast.error(error.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
 const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Please add items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Order Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b text-sm sm:text-base">
              <span className="flex-1 pr-2">{item.name} x {item.quantity}</span>
              <span className="whitespace-nowrap">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600 text-sm sm:text-base">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {formData.orderType === 'delivery' && (
              <>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Delivery Fee</span>
                  <span>€{deliveryFee.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-base sm:text-lg">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Information</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {formErrors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {formErrors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {formErrors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <select
                name="orderType"
                value={formData.orderType}
                onChange={handleInputChange}
                className="w-full p-2 text-sm sm:text-base border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {formData.orderType === 'delivery' && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Location
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for restaurant location"
                        className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                    >
                      <FaMapMarkerAlt />
                      {loading ? 'Searching...' : 'Find'}
                    </button>
                  </div>
                </div>

                <div className="h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    name='address'
                    value={formData.address}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={2}
                    readOnly
                    placeholder="Address will appear here when you select a location on the map"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Area will be filled automatically"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions or notes for your order"
                className="w-full p-2 border rounded text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-sm sm:text-base"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 
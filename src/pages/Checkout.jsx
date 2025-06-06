 import React, { useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
// import { deliveryZoneService } from '../services/deliveryZoneService';
import { validateOrderForm } from '../utils/validation';
import { FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa';
import { locationService } from '../services/locationService';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

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
  const { cartItems, total, deliveryFee, subtotal } = location.state || { cartItems: [], total: 0, deliveryFee: 0, subtotal: 0 };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    orderType: 'pickup',
    selectedTimeSlot: null
  });

  // const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  // const [deliveryFee, setDeliveryFee] = useState(initialDeliveryFee);
  // const [isOutOfZone, setIsOutOfZone] = useState(false);
  // const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  // const [selectedZone, setSelectedZone] = useState(null);
  // const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);

  // useEffect(() => {

  //   if (formData.orderType === 'delivery' && coordinates) {
  //     checkDeliveryAvailability();
  //   }
  // }, [coordinates, formData.orderType]);
   const [position, setPosition] = useState(
      formData.coordinates ? 
      [formData.coordinates.latitude, formData.coordinates.longitude] : 
      [0,0] // Default to Mithi coordinates

    );
     const [loading, setLoading] = useState(false);
    const [searchAddress, setSearchAddress] = useState('');
 const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address to search');

      return;
    }

    setLoading(true);
    try {
      // Add Pakistan and Hyderabad to the search query if not present
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

      const { coordinates, address, area, addressDetails } = result.data;
      setPosition([coordinates.latitude, coordinates.longitude]);
      
      setFormData(prev => ({
        ...prev,
        address,
        area,
        city: addressDetails?.city || 'Hyderabad',
        district: addressDetails?.district || 'Sindh',
        province: addressDetails?.state || 'Sindh',
        country: addressDetails?.country || 'Pakistan',
        coordinates
      }));
      
      toast.success('Location found! You can adjust it by clicking on the map.');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Could not find the location. Please try again or use the map.');
    } finally {
      setLoading(false);
    }
  };
  // const checkDeliveryAvailability = async () => {
  //   try {
  //     const result = await deliveryZoneService.checkDeliveryAvailability(
  //       coordinates.latitude,
  //       coordinates.longitude,
  //       subtotal
  //     );

  //     if (result.success) {
  //       const { zone, availableSlots } = result.data;
  //       setSelectedZone(zone);
  //       setDeliveryFee(zone.deliveryFee);
  //       setMinimumOrderAmount(zone.minimumOrderAmount);
  //       setAvailableTimeSlots(availableSlots);
  //       setIsOutOfZone(false);

  //       // Check minimum order amount
  //       if (subtotal < zone.minimumOrderAmount) {
  //         toast.warning(`Minimum order amount is €${zone.minimumOrderAmount}`);
  //       }
  //     } else {
  //       setIsOutOfZone(true);
  //       setSelectedZone(null);
  //       setAvailableTimeSlots([]);
  //       toast.warning(result.message || 'Location is outside our delivery zones');
  //     }
  //   } catch (error) {
  //     console.error('Error checking delivery availability:', error);
  //     toast.error('Failed to check delivery availability');
  //   }
  // };

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

  const handleTimeSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      selectedTimeSlot: slot
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Validate form
    const errors = validateOrderForm(formData, formData.orderType);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Validate minimum order amount for delivery
    // // if (formData.orderType === 'delivery' && subtotal < minimumOrderAmount) {
    // //   toast.error(`Minimum order amount is €${minimumOrderAmount}`);
    // //   setIsSubmitting(false);
    //   return;
    // }

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          toppings: item.toppings,
          specialInstructions: item.specialInstructions
        })),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        total: {
          subtotal: subtotal,
          deliveryFee: formData.orderType === 'delivery' ? deliveryFee : 0,
          total: formData.orderType === 'delivery' ? total + deliveryFee : subtotal
        }
      };

      // Add delivery address and time slot if order type is delivery
       if (formData.orderType === 'delivery') {
      //   if (!coordinates) {
      //     toast.error('Please get your location or enter address manually');
      //     setIsSubmitting(false);
      //     return;
      //   }

        if (!formData.selectedTimeSlot) {
          toast.error('Please select a delivery time slot');
          setIsSubmitting(false);
          return;
        }

        orderData.deliveryAddress = {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          // coordinates: coordinates
        };
        // orderData.deliveryZone = selectedZone.id;
        orderData.timeSlot = formData.selectedTimeSlot;
      }

      // Create the order
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {formData.orderType === 'delivery' && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>€{deliveryFee.toFixed(2)}</span>
                  {/* {isOutOfZone && (
                    <span className="text-red-500 text-sm">
                      (Out of delivery zone)
                    </span>
                  )} */}
                </div>
                {/* {minimumOrderAmount > 0 && (
                  <div className="text-sm text-gray-500">
                    Minimum order amount: €{minimumOrderAmount.toFixed(2)}
                  </div>
                )} */}
              </>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>€{(formData.orderType === 'delivery' ? total + deliveryFee : subtotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : ''}`}
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${formErrors.phone ? 'border-red-500' : ''}`}
              />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <select
                name="orderType"
                value={formData.orderType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {formData.orderType === 'delivery' && (
              <>
                {/* <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`flex-1 p-2 border rounded ${formErrors.address ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                        isGettingLocation ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Get current location"
                    >
                      <FaMapMarkerAlt />
                    </button>
                  </div>
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                  {coordinates && (
                    <p className="text-sm text-gray-600 mt-1">
                      Location obtained: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </p>
                  )}
                </div> */}

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors.city ? 'border-red-500' : ''}`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${formErrors.zipCode ? 'border-red-500' : ''}`}
                    />
                    {formErrors.zipCode && <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div> */}
  <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Location
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for restaurant location"
                    className="w-full border border-gray-300 rounded pl-10 pr-3 py-2"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaMapMarkerAlt />
                  {loading ? 'Searching...' : 'Find'}
                </button>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
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
                value={formData.address}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
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
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                placeholder="Area will be filled automatically"
              />
            </div>
          </div>
        
                {/* Time Slots */}
                {/* {availableTimeSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleTimeSlotSelect(slot)}
                          className={`p-2 border rounded text-sm ${
                            formData.selectedTimeSlot?.id === slot.id
                              ? 'bg-blue-100 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <FaClock className="inline mr-1" />
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )} */}
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            {/* <button
              type="submit"
              disabled={isSubmitting || isGettingLocation || (formData.orderType === 'delivery' && (isOutOfZone || !formData.selectedTimeSlot))}
              className={`w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors ${
                (isSubmitting || isGettingLocation || (formData.orderType === 'delivery' && (isOutOfZone || !formData.selectedTimeSlot))) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button> */}
              <button
              type="submit"
              disabled={isSubmitting || (formData.orderType === 'delivery' && ( !formData.selectedTimeSlot))}
              className={`w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors ${
                (isSubmitting || (formData.orderType === 'delivery' && ( !formData.selectedTimeSlot))) ? 'opacity-50 cursor-not-allowed' : ''
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
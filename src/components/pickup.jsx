import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaStore, FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import restaurantService from '../services/restaurantService';
import { toast } from 'react-toastify';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const currentDay = daysOfWeek[new Date().getDay()];

const Pickup = ({ onConfirm }) => {
  const { isPickupOpen, closePickup, setSelectedPickupLocation } = useContext(AppContext);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([24.7337, 69.7967]); // Default to Mithi coordinates

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurants();
      
      if (response.success && Array.isArray(response.data)) {
        setRestaurants(response.data);
        if (response.data.length > 0) {
          const firstRestaurant = response.data[0];
          if (firstRestaurant.coordinates) {
            setMapCenter([
              firstRestaurant.coordinates.latitude,
              firstRestaurant.coordinates.longitude
            ]);
          }
        }
      } else {
        toast.error('Failed to load restaurant locations');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurant locations');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = async (e) => {
    const restaurant = restaurants.find(r => r._id === e.target.value);
    setSelectedRestaurant(restaurant);
    setSelectedTimeSlot('');
    
    if (restaurant) {
      try {
        setLoading(true);
        
        // Check if restaurant is open today
        const todayHours = restaurant.operatingHours?.[currentDay];
        if (!todayHours || !todayHours.open || !todayHours.close) {
          toast.warning('This restaurant is closed today');
          setTimeSlots([]);
          return;
        }
        
        const response = await restaurantService.getTimeSlots(restaurant);
        if (response.success && Array.isArray(response.data)) {
          setTimeSlots(response.data);
        } else {
          setTimeSlots([]);
          toast.warning(response.message || 'No pickup time slots available');
        }
        
        // Update map center
        if (restaurant.coordinates) {
          setMapCenter([
            restaurant.coordinates.latitude,
            restaurant.coordinates.longitude
          ]);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to fetch time slots');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRestaurant || !selectedTimeSlot) {
      toast.error('Please select a restaurant and time slot');
      return;
    }
    const details = {
      restaurant: selectedRestaurant,
      timeSlot: selectedTimeSlot
    };
    setSelectedPickupLocation(details);
    if (onConfirm) onConfirm(details);
    toast.success('Pickup location confirmed!');
    closePickup();
  };

  const formatAddress = (restaurant) => {
    const parts = [];
    if (restaurant.branchName) parts.push(restaurant.branchName);
    if (restaurant.address) parts.push(restaurant.address);
    if (restaurant.city) parts.push(restaurant.city);
    if (restaurant.district) parts.push(restaurant.district);
    if (restaurant.province) parts.push(restaurant.province);
    return parts.join(', ');
  };

  if (!isPickupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Choose a Pickup Location</h2>
        <div>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            onChange={handleRestaurantChange}
            value={selectedRestaurant?._id || ''}
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name} - {restaurant.branchName || restaurant.city}
              </option>
            ))}
          </select>

          {selectedRestaurant && (
            <div className="mb-4 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-lg mb-2">{selectedRestaurant.name}</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><FaStore className="inline mr-2" />{selectedRestaurant.branchName}</p>
                <p><FaMapMarkerAlt className="inline mr-2" />{formatAddress(selectedRestaurant)}</p>
                {selectedRestaurant.contactNumber && (
                  <p><FaPhone className="inline mr-2" />{selectedRestaurant.contactNumber}</p>
                )}
                <div>
                  <p className="font-medium mb-1"><FaClock className="inline mr-2" />Operating Hours:</p>
                  <div className="grid grid-cols-2 gap-2 pl-6">
                    {daysOfWeek.map((day) => {
                      const hours = selectedRestaurant.operatingHours?.[day];
                      const isToday = day === currentDay;
                      return (
                        <div 
                          key={day} 
                          className={`${isToday ? 'font-semibold text-green-600' : ''}`}
                        >
                          <span className="capitalize">{day}: </span>
                          {hours?.open && hours?.close ? (
                            <span>{selectedRestaurant.formattedHours[day].open} - {selectedRestaurant.formattedHours[day].close}</span>
                          ) : (
                            <span className="text-red-500">Closed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-[300px] mb-4">
                <MapContainer
              center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full rounded"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
              {restaurants.map(restaurant => (
                restaurant.coordinates && (
                  <Marker
                    key={restaurant._id}
                    position={[
                      restaurant.coordinates.latitude,
                      restaurant.coordinates.longitude
                    ]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p>{restaurant.branchName}</p>
                        <p>{formatAddress(restaurant)}</p>
                        {restaurant.operatingHours?.[currentDay] && (
                          <p className="mt-1">
                            Today: {restaurant.formattedHours[currentDay]?.open} - {restaurant.formattedHours[currentDay]?.close}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
                </MapContainer>
              </div>

          {selectedRestaurant && timeSlots.length > 0 && (
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
              >
              <option value="">Select Pickup Time</option>
                {timeSlots.map((slot, index) => (
                  <option key={index} value={`${slot.start}-${slot.end}`}>
                    {slot.start} - {slot.end}
                  </option>
                ))}
              </select>
          )}

          {selectedRestaurant && timeSlots.length === 0 && (
            <div className="mb-4 text-yellow-600 text-sm">
              No pickup time slots available for today
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closePickup}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedRestaurant || !selectedTimeSlot}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              <FaStore className="inline mr-2" />
              {loading ? 'Processing...' : 'Confirm Pickup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pickup;

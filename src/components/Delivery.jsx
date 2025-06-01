import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa'; // Icon for the map marker and location button
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import { deliveryService } from '../services/deliveryService';
import { toast } from 'react-toastify';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import LocationPermissionDialog from './LocationPermissionDialog';
import { restaurantService } from '../services/restaurantService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition, zones, setLocation }) => {
  const map = useMapEvents({
    async click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      map.flyTo(e.latlng, map.getZoom());
      
      // Reverse geocode the clicked location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?` +
          `format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`
        );
        const data = await response.json();
        if (data.display_name) {
          setLocation(data.display_name);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return (
    <>
      {position && <Marker position={position} />}
      {zones.map((zone) => (
        <Circle
          key={zone._id}
          center={[zone.coordinates.latitude, zone.coordinates.longitude]}
          radius={zone.radius * 1000} // Convert km to meters
          pathOptions={{
            color: '#ff6b6b',
            fillColor: '#ff6b6b',
            fillOpacity: 0.1,
          }}
        />
      ))}
    </>
  );
};

const Delivery = ({ onConfirm, initialAddress, initialCity, initialZipCode }) => {
  const { isDeliveryOpen, closeDelivery } = useContext(AppContext);
  const [location, setLocation] = useState(initialAddress || '');
  const [position, setPosition] = useState(null);
  const [availableZones, setAvailableZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [initialMapCenter, setInitialMapCenter] = useState([24.7337, 69.7967]); // Default to Mithi coordinates
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [regions, setRegions] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    console.log('Delivery component mounted');
    console.log('Initial props:', { initialAddress, initialCity, initialZipCode });
    fetchRegionsAndRestaurants();
    requestLocation();
  }, []);

  const fetchRegionsAndRestaurants = async () => {
    try {
      console.log('Fetching regions and restaurants...');
      const response = await restaurantService.getAllRestaurantsWithRegions();
      console.log('Regions and restaurants response:', response);
      
      if (response.success && response.regions) {
        setRegions(response.regions);
        setAvailableCities(Object.values(response.regions.cities));
        
        // Set initial map center to overall region center
        if (response.regions.overall?.center) {
          console.log('Setting initial map center:', response.regions.overall.center);
          setInitialMapCenter([
            response.regions.overall.center.latitude,
            response.regions.overall.center.longitude
          ]);
        }
      }
    } catch (error) {
      console.error('Error in fetchRegionsAndRestaurants:', error);
      toast.error('Failed to fetch restaurant regions');
    }
  };

  const handleCitySelect = async (cityName) => {
    try {
      console.log('City selected:', cityName);
      const response = await restaurantService.getRestaurantsByCity(cityName);
      console.log('City restaurants response:', response);
      
      if (response.success && response.region) {
        setSelectedCity(response.region);
        
        // Update map center to city center
        if (response.region.center) {
          console.log('Updating map center to city center:', response.region.center);
          setInitialMapCenter([
            response.region.center.latitude,
            response.region.center.longitude
          ]);
        }
      }
    } catch (error) {
      console.error('Error in handleCitySelect:', error);
      toast.error('Failed to fetch restaurants for selected city');
    }
  };

  const requestLocation = () => {
    console.log('Requesting user location...');
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Got user location:', position.coords);
            const newPosition = [position.coords.latitude, position.coords.longitude];
            
            // Validate if the location is within any service area
            console.log('Validating location...');
            const validationResponse = await restaurantService.validateLocation(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('Location validation response:', validationResponse);

            if (!validationResponse.success) {
              console.log('Location outside service areas');
              toast.error('Your current location is outside our service areas. Please enter an address in a supported city.');
              setLocationPermissionDenied(true);
              return;
            }

            setPosition(newPosition);
            setLocationPermissionDenied(false);
            setIsUpdatingLocation(false);
            
            // Try to get address from coordinates using reverse geocoding
            console.log('Reverse geocoding location...');
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            console.log('Reverse geocoding response:', data);
            
            if (data.display_name) {
              setLocation(data.display_name);
            }
            
            // Find nearest restaurant
            console.log('Finding nearest restaurant...');
            const nearestRestaurantResponse = await restaurantService.findNearestRestaurant(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('Nearest restaurant response:', nearestRestaurantResponse);

            if (nearestRestaurantResponse.success && nearestRestaurantResponse.data) {
              const nearestRestaurant = nearestRestaurantResponse.data;
              
              // Check delivery availability
              console.log('Checking delivery availability...');
              const availabilityResponse = await deliveryService.checkAvailability({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                orderAmount: 0
              });
              console.log('Delivery availability response:', availabilityResponse);

              if (availabilityResponse.success && availabilityResponse.data?.zone) {
                const zoneId = availabilityResponse.data.zone._id;
                setSelectedZone(zoneId);
                
                // Fetch time slots for the zone
                console.log('Fetching time slots for zone:', zoneId);
                const { availableSlots } = await deliveryService.getTimeSlots(zoneId);
                setTimeSlots(availableSlots || []);
                
                toast.success(`Location found! Nearest restaurant: ${nearestRestaurant.name} (${nearestRestaurant.distance} km away)`);
              } else {
                toast.warning('This location might be outside our delivery zones. Please check the available zones on the map.');
              }
            } else {
              toast.error('Could not find a nearby restaurant. Please try another location.');
            }
          } catch (error) {
            console.error('Error processing location:', error);
            toast.error(error.message || 'Error processing your location. Please try again or enter your address manually.');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermissionDenied(true);
          setLoading(false);
          setIsUpdatingLocation(false);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('Location permission denied');
              toast.warning('Location access denied. Please enter your address manually or click the location button to try again.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('Location information unavailable');
              toast.error('Location information is unavailable. Please enter your address manually.');
              break;
            case error.TIMEOUT:
              console.log('Location request timed out');
              toast.error('Location request timed out. Please enter your address manually.');
              break;
            default:
              console.log('Unknown geolocation error');
              toast.error('An error occurred while getting your location. Please enter your address manually.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not supported');
      toast.warning('Geolocation is not supported by your browser. Please enter your address manually.');
    }
  };

  const handleLocationButtonClick = () => {
    setIsUpdatingLocation(true);
    setShowPermissionDialog(true);
  };

  const handleAllowLocation = () => {
    setShowPermissionDialog(false);
    requestLocation();
  };

  const handleDenyLocation = () => {
    setShowPermissionDialog(false);
    setLocationPermissionDenied(true);
    setIsUpdatingLocation(false);
    toast.info('You can still enter your address manually or try again later.');
  };

  const handleLocationChange = async (e) => {
    const newAddress = e.target.value;
    setLocation(newAddress);
    
    // Only geocode the address without any service area validation
    if (newAddress) {
      try {
        const searchQuery = newAddress.includes(initialCity) 
          ? newAddress 
          : `${newAddress}, ${initialCity}, Pakistan`;
        
        const encodedAddress = encodeURIComponent(searchQuery);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodedAddress}&` +
          `countrycodes=pk&` +
          `limit=1&` +
          `addressdetails=1`
        );

        if (!response.ok) {
          throw new Error('Failed to connect to geocoding service');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const coordinates = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          };
          setPosition([coordinates.latitude, coordinates.longitude]);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position || !location) {
      toast.error('Please select a valid delivery location');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Now we check service area only when submitting
      const validationResponse = await restaurantService.validateLocation(
        position[0],
        position[1]
      );

      if (!validationResponse.success) {
        toast.error('This location is outside our service areas. Please select a different address.');
        return;
      }

      // Check delivery availability
      const availabilityResponse = await deliveryService.checkAvailability({
        latitude: position[0],
        longitude: position[1],
        orderAmount: 0
      });

      console.log('Delivery availability response:', availabilityResponse);

      if (!availabilityResponse.success) {
        // Try to find the nearest zone
        const nearestZone = await deliveryService.getNearestDeliveryZone({
          latitude: position[0],
          longitude: position[1]
        });

        if (nearestZone) {
          console.log('Found nearest zone:', nearestZone);
          const deliveryDetails = {
            address: location,
            coordinates: {
              latitude: position[0],
              longitude: position[1]
            },
            zone: nearestZone,
            timeSlot: selectedTimeSlot,
            isOutOfZone: true
          };

          onConfirm(deliveryDetails);
          toast.warning('Location is outside regular delivery zones. Additional delivery charges may apply.');
          return;
        }

        toast.error('Delivery is not available at this location');
        return;
      }

      const deliveryDetails = {
        address: location,
        coordinates: {
          latitude: position[0],
          longitude: position[1]
        },
        zone: availabilityResponse.data.zone,
        timeSlot: selectedTimeSlot,
        isOutOfZone: false
      };

      console.log('Submitting delivery details:', deliveryDetails);
      onConfirm(deliveryDetails);
      toast.success('Delivery location confirmed!');
    } catch (error) {
      console.error('Error confirming delivery location:', error);
      setError('Failed to confirm delivery location. Please try again.');
      toast.error('Failed to confirm delivery location');
    } finally {
      setLoading(false);
    }
  };

  if (!isDeliveryOpen) return null;

  return (
    <>
      {showPermissionDialog && (
        <LocationPermissionDialog
          onAllow={handleAllowLocation}
          onDeny={handleDenyLocation}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[600px] shadow-lg max-h-[90vh] overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Select Your Location</h2>

          {/* City Selection */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Select City</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedCity?.name || ''}
              onChange={(e) => handleCitySelect(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a city</option>
              {availableCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name} ({city.restaurants.length} restaurants)
                </option>
              ))}
            </select>
          </div>

          {/* Order Type Selection */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Order Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={loading}
            >
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {orderType === 'Delivery' && (
            <div>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  placeholder="Enter your address"
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleLocationButtonClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  title={isUpdatingLocation ? "Updating location..." : "Use my current location"}
                  disabled={isUpdatingLocation}
                >
                  <FaLocationArrow className={isUpdatingLocation ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Restaurant Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchRestaurants(e.target.value);
                    }}
                    placeholder="Search for restaurants..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurants List */}
              {restaurants.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto">
                  <h3 className="font-semibold mb-2">Nearby Restaurants</h3>
                  <div className="space-y-2">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant._id}
                        className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (restaurant.location) {
                            setPosition([restaurant.location.latitude, restaurant.location.longitude]);
                            setLocation(restaurant.address || restaurant.name);
                            toast.info(`Selected ${restaurant.name} (${restaurant.distanceFromCenter} km from center)`);
                          }
                        }}
                      >
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-gray-600">
                          {restaurant.address}
                          {restaurant.distanceFromCenter && (
                            <span className="ml-2">({restaurant.distanceFromCenter} km from center)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {locationPermissionDenied && (
                <div className="text-yellow-600 text-sm mb-4">
                  Location access denied. Please enter your address manually or click the location button to try again.
                </div>
              )}
              
              {isUpdatingLocation && (
                <div className="text-blue-600 text-sm mb-4">
                  Updating your location...
                </div>
              )}
              
              <div className="h-[400px] mb-4 relative">
                <MapContainer
                  center={initialMapCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full rounded"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker 
                    position={position} 
                    setPosition={setPosition}
                    zones={availableZones}
                    setLocation={setLocation}
                  />
                  {/* Add restaurant markers */}
                  {restaurants.map((restaurant) => (
                    restaurant.location && (
                      <Marker
                        key={restaurant._id}
                        position={[restaurant.location.latitude, restaurant.location.longitude]}
                        eventHandlers={{
                          click: () => {
                            setPosition([restaurant.location.latitude, restaurant.location.longitude]);
                            setLocation(restaurant.address || restaurant.name);
                            toast.info(`Selected ${restaurant.name}`);
                          }
                        }}
                      />
                    )
                  ))}
                </MapContainer>
                
                {/* Zone Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow z-[1000]">
                  <div className="text-sm font-semibold mb-2">Delivery Zones</div>
                  {availableZones.map((zone) => (
                    <div key={zone._id} className="text-xs flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <span>{zone.name} - ${zone.baseDeliveryFee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone Selection with Detailed Information */}
              <div className="mb-4 bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Zone</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Delivery Zone</option>
                  {availableZones.map(zone => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                
                {selectedZone && (
                  <div className="text-sm text-gray-600">
                    {availableZones.find(z => z._id === selectedZone)?.description}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>Base Delivery Fee: ${availableZones.find(z => z._id === selectedZone)?.baseDeliveryFee}</div>
                      <div>Min. Order: ${availableZones.find(z => z._id === selectedZone)?.minimumOrderAmount}</div>
                      <div>Max Delivery Time: {availableZones.find(z => z._id === selectedZone)?.maximumDeliveryTime} min</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slot Selection */}
              {selectedZone && Array.isArray(timeSlots) && timeSlots.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Time</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((slot, index) => {
                      const startTime = slot?.startTime || slot?.start;
                      const endTime = slot?.endTime || slot?.end;
                      const displayTime = `${startTime} - ${endTime}`;
                      
                      return (
                        <option key={slot?.id || index} value={slot?.id || `${startTime}-${endTime}`}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {selectedZone && Array.isArray(timeSlots) && timeSlots.length === 0 && !loading && (
                <div className="text-yellow-600 text-sm mb-4">
                  No delivery time slots available for this zone. Please try another zone or contact support.
                </div>
              )}

              <div className="mb-4 font-semibold">
                Delivery Fee: {deliveryFee === 0 ? 'Free Delivery' : `$${deliveryFee.toFixed(2)}`}
              </div>

              {nearestRestaurant && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Nearest Restaurant</h3>
                  <p className="text-sm text-blue-600">
                    {nearestRestaurant.name} - {nearestRestaurant.distance} km away
                  </p>
                  {!nearestRestaurant.isWithinServiceArea && (
                    <p className="text-sm text-yellow-600 mt-1">
                      Note: This location is outside our regular delivery area. Additional charges may apply.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="text-red-600 mb-4">
                  {error}
                </div>
              )}

              {loading && (
                <div className="text-blue-600 mb-4">
                  Loading...
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeDelivery}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <FaMapMarkerAlt className="inline mr-2" />
                  {loading ? 'Checking...' : 'Confirm Location'}
                </button>
              </div>
            </div>
          )}

          {orderType === 'Pickup' && (
            <div className="mb-4">
              <p>Pickup selected. No delivery fee.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Delivery;

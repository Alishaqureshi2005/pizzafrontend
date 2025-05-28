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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition, zones, setLocation }) => {
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
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

const Delivery = ({ onConfirm }) => {
  const { isDeliveryOpen, closeDelivery, setDeliveryAddress, orderType, setOrderType, deliveryFee, updateDeliveryFee } = useContext(AppContext);
  const [location, setLocation] = useState('');
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

  useEffect(() => {
    fetchDeliveryZones();
    // Try to get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Silently fail and use default center
        }
      );
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const newPosition = [position.coords.latitude, position.coords.longitude];
            setPosition(newPosition);
            setLocationPermissionDenied(false);
            
            // Try to get address from coordinates using reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              setLocation(data.display_name);
            }
            
            // Automatically check delivery availability for this location
            const availabilityResponse = await deliveryService.checkAvailability({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              orderAmount: 0
            });

            if (availabilityResponse.success && availabilityResponse.data?.zone) {
              // If location is in a delivery zone, auto-select it
              const zoneId = availabilityResponse.data.zone._id;
              setSelectedZone(zoneId);
              
              // Fetch time slots for the zone
              const { availableSlots } = await deliveryService.getTimeSlots(zoneId);
              setTimeSlots(availableSlots || []);
              
              toast.success('Location found! Please select a delivery time.');
            } else {
              toast.warning('This location might be outside our delivery zones. Please check the available zones on the map.');
            }
          } catch (error) {
            console.error('Error processing location:', error);
            toast.error('Error processing your location. Please try again or enter your address manually.');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermissionDenied(true);
          setLoading(false);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.warning('Location access denied. Please enter your address manually or click the location button to try again.');
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error('Location information is unavailable. Please enter your address manually.');
              break;
            case error.TIMEOUT:
              toast.error('Location request timed out. Please enter your address manually.');
              break;
            default:
              toast.error('An error occurred while getting your location. Please enter your address manually.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0
        }
      );
    } else {
      toast.warning('Geolocation is not supported by your browser. Please enter your address manually.');
    }
  };

  const handleLocationButtonClick = () => {
    setShowPermissionDialog(true);
  };

  const handleAllowLocation = () => {
    setShowPermissionDialog(false);
    requestLocation();
  };

  const handleDenyLocation = () => {
    setShowPermissionDialog(false);
    setLocationPermissionDenied(true);
    toast.info('You can still enter your address manually or try again later.');
  };

  const fetchDeliveryZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getDeliveryZones();
      
      if (response && Array.isArray(response)) {
        setAvailableZones(response);
        // Set initial map center to first zone if available
        if (response.length > 0 && response[0].coordinates) {
          setInitialMapCenter([
            response[0].coordinates.latitude,
            response[0].coordinates.longitude
          ]);
        }
      } else {
        console.error('Invalid zones data received:', response);
        setError('Failed to load delivery zones');
        toast.error('Failed to load delivery zones');
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      setError('Failed to fetch delivery zones');
      toast.error('Failed to fetch delivery zones');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const geocodeAddress = async (address) => {
    try {
      // Add country/region bias to improve search results
      const searchQuery = `${address}, Sindh, Pakistan`;
      const encodedAddress = encodeURIComponent(searchQuery);
      
      // Add additional parameters to improve search accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodedAddress}&` +
        `countrycodes=pk&` + // Limit to Pakistan
        `limit=1&` +
        `addressdetails=1&` + // Get detailed address information
        `viewbox=68.9,24.2,70.5,25.2` // Bounding box around Mithi region
      );

      if (!response.ok) {
        throw new Error('Failed to connect to geocoding service');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast.error('Address not found. Please try a more specific address or use the map.');
        return null;
      }

      const result = data[0];
      const coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };

      // Verify the coordinates are within a reasonable range for the Mithi region
      if (coordinates.latitude < 24.2 || coordinates.latitude > 25.2 ||
          coordinates.longitude < 68.9 || coordinates.longitude > 70.5) {
        toast.error('Address is outside our service area. Please enter an address in the Mithi region.');
        return null;
      }

      return coordinates;
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Could not find the address. Please try again or use the map to select your location.');
      return null;
    }
  };

  const handleZoneSelect = async (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setTimeSlots([]); // Reset time slots when zone changes
    setSelectedTimeSlot(''); // Reset selected time slot

    if (zoneId) {
      try {
        setLoading(true);
        const response = await deliveryService.getTimeSlots(zoneId);
        const slots = response?.availableSlots || [];
        
        if (Array.isArray(slots) && slots.length > 0) {
          setTimeSlots(slots);
          // Update delivery fee based on selected zone's delivery charge
          const selectedZoneObj = availableZones?.find(zone => zone?._id === zoneId);
          if (selectedZoneObj) {
            updateDeliveryFee(selectedZoneObj.baseDeliveryFee || selectedZoneObj.deliveryCharge || 0);
          }
        } else {
          setTimeSlots([]);
          toast.warning('No delivery time slots available for this zone');
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to fetch time slots');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset delivery fee if no zone selected
      updateDeliveryFee(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Make sure we have either position or location
      if (!position && !location) {
        toast.error('Please select a location or enter an address');
        setLoading(false);
        return;
      }

      let coordinates = null;
      
      if (position) {
        // Handle both array and object formats of position
        if (Array.isArray(position)) {
          coordinates = {
            latitude: Number(position[0]),
            longitude: Number(position[1])
          };
        } else {
          coordinates = {
            latitude: Number(position.lat),
            longitude: Number(position.lng)
          };
        }
      } else if (location) {
        // If we have a text address, geocode it
        coordinates = await geocodeAddress(location);
        if (!coordinates) {
          toast.error('Could not find coordinates for the entered address');
          setLoading(false);
          return;
        }
      }

      // Validate coordinates
      if (!coordinates || 
          coordinates.latitude === undefined || 
          coordinates.longitude === undefined ||
          isNaN(coordinates.latitude) || 
          isNaN(coordinates.longitude)) {
        toast.error('Invalid location coordinates');
        setLoading(false);
        return;
      }

      // Ensure coordinates are numbers and properly formatted
      const validCoordinates = {
        latitude: Number(coordinates.latitude),
        longitude: Number(coordinates.longitude)
      };

      // Additional validation for coordinate ranges
      if (validCoordinates.latitude < -90 || validCoordinates.latitude > 90 ||
          validCoordinates.longitude < -180 || validCoordinates.longitude > 180) {
        toast.error('Invalid coordinate ranges');
        setLoading(false);
        return;
      }

      console.log('Checking availability with coordinates:', validCoordinates);

      const response = await deliveryService.checkAvailability({
        latitude: validCoordinates.latitude,
        longitude: validCoordinates.longitude,
        orderAmount: 0
      });

      if (response.success && response.data?.zone) {
        const details = {
          coordinates: validCoordinates,
          address: location || 'Selected Location',
          zone: response.data.zone,
          timeSlot: selectedTimeSlot
        };
        setDeliveryAddress(details);
        updateDeliveryFee(response.data.zone.baseDeliveryFee || 0);
        if (onConfirm) onConfirm(details);
        toast.success('Delivery location confirmed!');
        closeDelivery();
      } else {
        toast.error(response.message || 'Delivery is not available at this location');
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      toast.error(error.message || 'Failed to check delivery availability');
      setError(error.message || 'Failed to check delivery availability');
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
                  title="Use my location"
                >
                  <FaLocationArrow />
                </button>
              </div>
              
              {locationPermissionDenied && (
                <div className="text-yellow-600 text-sm mb-4">
                  Location access denied. Please enter your address manually or click the location button to try again.
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
                  onChange={handleZoneSelect}
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

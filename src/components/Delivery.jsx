import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa'; // Icon for the map marker and location button
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const Delivery = () => {
  const { isDeliveryOpen, closeDelivery, setDeliveryAddress } = useContext(AppContext);
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

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
          setLocationPermissionDenied(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermissionDenied(true);
          
          // Show different messages based on the error code
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
          timeout: 5000,
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
      const zones = await deliveryService.getDeliveryZones();
      if (Array.isArray(zones)) {
        setAvailableZones(zones);
      } else {
        console.error('Invalid zones data received:', zones);
        setError('Invalid delivery zones data received');
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

  const handleZoneSelect = async (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setTimeSlots([]); // Reset time slots when zone changes
    setSelectedTimeSlot(''); // Reset selected time slot

    if (zoneId) {
      try {
        setLoading(true);
        const { availableSlots } = await deliveryService.getTimeSlots(zoneId);
        if (Array.isArray(availableSlots)) {
          setTimeSlots(availableSlots);
        } else {
          console.error('Invalid time slots data received:', availableSlots);
          toast.error('Failed to load time slots');
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to fetch time slots');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position && !location) {
      toast.error('Please select a location');
      return;
    }

    if (!selectedZone) {
      toast.error('Please select a delivery zone');
      return;
    }

    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const coordinates = position ? {
        latitude: position[0],
        longitude: position[1]
      } : null;

      const response = await deliveryService.checkDeliveryAvailability(
        coordinates,
        0 // Initial check without order amount
      );

      if (response.isAvailable) {
        setDeliveryAddress({
          coordinates,
          address: location,
          zone: response.zone,
          timeSlot: selectedTimeSlot
        });
        toast.success('Delivery location confirmed!');
        closeDelivery();
      } else {
        toast.error(response.message || 'Delivery is not available at this location');
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      toast.error('Failed to check delivery availability');
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
        <div className="bg-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Select Your Location</h2>
          <form onSubmit={handleSubmit}>
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
            
            <div className="h-64 mb-4">
              <MapContainer
                center={position || [51.505, -0.09]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full rounded"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <select
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={selectedZone}
              onChange={handleZoneSelect}
              disabled={loading}
            >
              <option value="">Select Delivery Zone</option>
              {Array.isArray(availableZones) && availableZones.map(zone => (
                <option key={zone._id} value={zone._id}>
                  {zone.name} - ${zone.deliveryCharge} delivery fee
                </option>
              ))}
            </select>

            {selectedZone && (
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Time Slot</option>
                {Array.isArray(timeSlots) && timeSlots.map((slot, index) => (
                  <option key={index} value={`${slot.start}-${slot.end}`}>
                    {slot.start} - {slot.end}
                  </option>
                ))}
              </select>
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
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaMapMarkerAlt className="inline mr-2" />
                {loading ? 'Checking...' : 'Confirm Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Delivery;

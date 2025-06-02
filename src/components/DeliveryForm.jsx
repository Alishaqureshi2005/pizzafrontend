import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { deliveryService } from '../services/deliveryService';

const LocationMarker = ({ position, setPosition, setLocation }) => {
  const map = useMapEvents({
    async click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      map.flyTo(e.latlng, map.getZoom());
      
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

  return position ? <Marker position={position} /> : null;
};

const DeliveryForm = ({ onDeliveryDetailsChange, availableTimeSlots, deliveryDetails }) => {
  const [position, setPosition] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialMapCenter, setInitialMapCenter] = useState(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const newPosition = [position.coords.latitude, position.coords.longitude];
            setPosition(newPosition);
            setInitialMapCenter(newPosition);
            
            // Try to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              setLocation(data.display_name);
              checkDeliveryAvailability(newPosition, data.display_name);
            }
          } catch (error) {
            console.error('Error processing location:', error);
            toast.error('Error processing your location');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoading(false);
          toast.warning('Please enter your address manually or try again');
        }
      );
    }
  };

  const checkDeliveryAvailability = async (coordinates, address) => {
    try {
      const response = await deliveryService.checkAvailability({
        latitude: coordinates[0],
        longitude: coordinates[1]
      });

      if (response.success) {
        onDeliveryDetailsChange({
          address,
          coordinates: {
            latitude: coordinates[0],
            longitude: coordinates[1]
          },
          zone: response.data.zone,
          timeSlot: '',
          isOutOfZone: false
        });
      } else {
        toast.error(response.message || 'Delivery not available at this location');
      }
    } catch (error) {
      toast.error('Error checking delivery availability');
    }
  };

  const handleLocationChange = async (e) => {
    const newAddress = e.target.value;
    setLocation(newAddress);
    
    if (newAddress) {
      try {
        const encodedAddress = encodeURIComponent(newAddress);
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
          const coordinates = [parseFloat(result.lat), parseFloat(result.lon)];
          setPosition(coordinates);
          checkDeliveryAvailability(coordinates, newAddress);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  const handleTimeSlotChange = (e) => {
    onDeliveryDetailsChange({
      ...deliveryDetails,
      timeSlot: e.target.value
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="Enter your delivery address"
          className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={requestLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
          disabled={loading}
        >
          <FaLocationArrow className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="h-[300px] relative">
        {initialMapCenter && (
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
              setLocation={setLocation}
            />
          </MapContainer>
        )}
      </div>

      {deliveryDetails.zone && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Delivery Zone</h3>
          <p className="text-sm text-blue-600">
            {deliveryDetails.zone.name} - Delivery Fee: ${deliveryDetails.zone.deliveryFee}
          </p>
          {deliveryDetails.isOutOfZone && (
            <p className="text-sm text-yellow-600 mt-1">
              Note: This location is outside our regular delivery area. Additional charges may apply.
            </p>
          )}
        </div>
      )}

      {availableTimeSlots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Delivery Time
          </label>
          <select
            value={deliveryDetails.timeSlot}
            onChange={handleTimeSlotChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select a time slot</option>
            {availableTimeSlots.map((slot, index) => (
              <option key={index} value={slot.id || `${slot.startTime}-${slot.endTime}`}>
                {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DeliveryForm; 
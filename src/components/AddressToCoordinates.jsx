import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
};

const AddressToCoordinates = ({ onCoordinatesSelect }) => {
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState([24.7337, 69.7967]); // Default to Mithi
  const [loading, setLoading] = useState(false);

  const geocodeAddress = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setLoading(true);
    try {
      const searchQuery = `${address}, Sindh, Pakistan`;
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
      
      if (!data || data.length === 0) {
        toast.error('Address not found. Please try a more specific address or use the map.');
        return;
      }

      const result = data[0];
      const coordinates = [parseFloat(result.lat), parseFloat(result.lon)];
      
      setPosition(coordinates);
      if (onCoordinatesSelect) {
        onCoordinatesSelect({
          latitude: coordinates[0],
          longitude: coordinates[1],
          formattedAddress: result.display_name
        });
      }
      toast.success('Location found! You can adjust it by clicking on the map.');
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Could not find the address. Please try again or use the map to select location.');
    } finally {
      setLoading(false);
    }
  };

  const handlePositionSelect = (newPosition) => {
    setPosition(newPosition);
    // Get address for the selected location (reverse geocoding)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${newPosition[0]}&lon=${newPosition[1]}`
    )
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          setAddress(data.display_name);
          if (onCoordinatesSelect) {
            onCoordinatesSelect({
              latitude: newPosition[0],
              longitude: newPosition[1],
              formattedAddress: data.display_name
            });
          }
        }
      })
      .catch(error => {
        console.error('Reverse geocoding error:', error);
        if (onCoordinatesSelect) {
          onCoordinatesSelect({
            latitude: newPosition[0],
            longitude: newPosition[1]
          });
        }
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      geocodeAddress();
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for address or click on map"
              className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={geocodeAddress}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaMapMarkerAlt />
            {loading ? 'Searching...' : 'Find'}
          </button>
        </div>
      </div>

      <div className="h-[400px] rounded overflow-hidden border border-gray-300">
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
          <LocationMarker position={position} setPosition={handlePositionSelect} />
        </MapContainer>
      </div>
    </div>
  );
};

export default AddressToCoordinates; 
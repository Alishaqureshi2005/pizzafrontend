import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Icon for the map marker

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

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

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const Delivery = () => {
  const { isDeliveryOpen, closeDelivery } = useContext(AppContext);
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = position ? `Lat: ${position[0]}, Lng: ${position[1]}` : location;
    alert(`Location submitted: ${loc}`);
    closeDelivery();
  };

  if (!isDeliveryOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Select Your Location</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Or enter your location"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeDelivery}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaMapMarkerAlt className="inline mr-2" />
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Delivery;

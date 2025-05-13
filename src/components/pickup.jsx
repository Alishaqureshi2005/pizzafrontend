import React, { useState, useContext } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaStore } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

const pickupLocations = [
  {
    name: 'Downtown Store',
    coordinates: [51.505, -0.09],
  },
  {
    name: 'Uptown Outlet',
    coordinates: [51.515, -0.1],
  },
  {
    name: 'Mall Branch',
    coordinates: [51.51, -0.08],
  },
];

const Pickup = () => {
  const { isPickupOpen, closePickup } = useContext(AppContext);
  const [selectedLocation, setSelectedLocation] = useState(pickupLocations[0]);

  const handleChange = (e) => {
    const selected = pickupLocations.find(loc => loc.name === e.target.value);
    setSelectedLocation(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Pickup selected: ${selectedLocation.name}`);
    closePickup();
  };

  if (!isPickupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Choose a Pickup Location</h2>
        <form onSubmit={handleSubmit}>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            onChange={handleChange}
            value={selectedLocation.name}
          >
            {pickupLocations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
          <div className="h-64 mb-4">
            <MapContainer
              center={selectedLocation.coordinates}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full rounded"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedLocation.coordinates} />
            </MapContainer>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closePickup}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <FaStore className="inline mr-2" />
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pickup;

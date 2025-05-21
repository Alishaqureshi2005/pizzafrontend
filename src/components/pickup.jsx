import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/DeliveryContext';
import { FaStore } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { deliveryService } from '../services/deliveryService';
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

const Pickup = () => {
  const { isPickupOpen, closePickup, setSelectedPickupLocation } = useContext(AppContext);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPickupLocations();
  }, []);

  const fetchPickupLocations = async () => {
    try {
      const zones = await deliveryService.getDeliveryZones();
      // Filter zones that are available for pickup
      const pickupZones = zones.filter(zone => zone.isAvailable);
      setPickupLocations(pickupZones);
      if (pickupZones.length > 0) {
        setSelectedLocation(pickupZones[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch pickup locations');
    }
  };

  const handleLocationChange = async (e) => {
    const location = pickupLocations.find(loc => loc._id === e.target.value);
    setSelectedLocation(location);
    if (location) {
      try {
        const { availableSlots } = await deliveryService.getTimeSlots(location._id);
        setTimeSlots(availableSlots);
      } catch (error) {
        toast.error('Failed to fetch time slots');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation || !selectedTimeSlot) {
      toast.error('Please select a location and time slot');
      return;
    }

    setSelectedPickupLocation({
      location: selectedLocation,
      timeSlot: selectedTimeSlot
    });
    toast.success('Pickup location confirmed!');
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
            onChange={handleLocationChange}
            value={selectedLocation?._id || ''}
          >
            <option value="">Select a location</option>
            {pickupLocations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>

          {selectedLocation && (
            <>
              <div className="h-64 mb-4">
                <MapContainer
                  center={selectedLocation.coordinates.coordinates}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full rounded"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={selectedLocation.coordinates.coordinates} />
                </MapContainer>
              </div>

              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map((slot, index) => (
                  <option key={index} value={`${slot.start}-${slot.end}`}>
                    {slot.start} - {slot.end}
                  </option>
                ))}
              </select>
            </>
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              <FaStore className="inline mr-2" />
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pickup;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { locationService } from '../services/locationService';
import 'leaflet/dist/leaflet.css';
import OperatingHoursForm from './OperatingHoursForm';

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
};

const RestaurantLocationForm = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    branchName: initialData?.branchName || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    province: initialData?.province || '',
    country: initialData?.country || '',
    contactNumber: initialData?.contactNumber || '',
    coordinates: initialData?.coordinates || null,
    operatingHours: initialData?.operatingHours || {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    }
  });

  const [position, setPosition] = useState(
    formData.coordinates ? 
    [formData.coordinates.latitude, formData.coordinates.longitude] : 
    [24.7337, 69.7967] // Default to Mithi coordinates
  );

  const [loading, setLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        branchName: initialData.branchName || '',
        address: initialData.address || '',
        city: initialData.city || '',
        district: initialData.district || '',
        province: initialData.province || '',
        country: initialData.country || '',
        contactNumber: initialData.contactNumber || '',
        coordinates: initialData.coordinates || null,
        operatingHours: initialData.operatingHours || {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' }
        }
      });
      if (initialData.coordinates) {
        setPosition([initialData.coordinates.latitude, initialData.coordinates.longitude]);
      }
    }
  }, [initialData]);

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    setLoading(true);
    try {
      const result = await locationService.convertAddressToCoordinates(searchAddress);
      
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
        city: addressDetails?.city || '',
        district: addressDetails?.district || '',
        province: addressDetails?.state || '',
        country: addressDetails?.country || '',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOperatingHoursChange = (newHours) => {
    setFormData(prev => ({
        ...prev,
      operatingHours: newHours
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'branchName', 'address', 'city', 'district', 'province', 'country', 'contactNumber'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate operating hours
    const hasValidHours = Object.values(formData.operatingHours).some(
      day => day.open && day.close
    );
    
    if (!hasValidHours) {
      alert('Please set operating hours for at least one day');
        return;
      }

    // Validate coordinates
    if (!position) {
      alert('Please select a location on the map');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      coordinates: {
        latitude: position[0],
        longitude: position[1]
      }
    };

    onSave(submitData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
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
        </div>

        <OperatingHoursForm
          operatingHours={formData.operatingHours}
          onChange={handleOperatingHoursChange}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {initialData ? 'Update Restaurant' : 'Create Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantLocationForm; 
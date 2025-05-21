import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminDeliveryZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zone: 'A',
    deliveryCharge: 0,
    minimumOrderAmount: 0,
    estimatedDeliveryTime: 30,
    isAvailable: true,
    coordinates: {
      type: 'Point',
      coordinates: [0, 0]
    },
    postalCodes: [''],
    timeSlots: [
      {
        day: 'monday',
        slots: [{ start: '09:00', end: '10:00' }]
      }
    ]
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const data = await deliveryService.getDeliveryZones();
      setZones(data);
    } catch (error) {
      toast.error('Failed to fetch delivery zones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoordinateChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        coordinates: prev.coordinates.coordinates.map((coord, i) => 
          i === index ? parseFloat(value) : coord
        )
      }
    }));
  };

  const handlePostalCodeChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      postalCodes: prev.postalCodes.map((code, i) => 
        i === index ? value : code
      )
    }));
  };

  const addPostalCode = () => {
    setFormData(prev => ({
      ...prev,
      postalCodes: [...prev.postalCodes, '']
    }));
  };

  const removePostalCode = (index) => {
    setFormData(prev => ({
      ...prev,
      postalCodes: prev.postalCodes.filter((_, i) => i !== index)
    }));
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((day, i) => 
        i === dayIndex ? {
          ...day,
          slots: day.slots.map((slot, j) => 
            j === slotIndex ? { ...slot, [field]: value } : slot
          )
        } : day
      )
    }));
  };

  const addTimeSlot = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((day, i) => 
        i === dayIndex ? {
          ...day,
          slots: [...day.slots, { start: '09:00', end: '10:00' }]
        } : day
      )
    }));
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((day, i) => 
        i === dayIndex ? {
          ...day,
          slots: day.slots.filter((_, j) => j !== slotIndex)
        } : day
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await deliveryService.updateDeliveryZone(editingZone._id, formData);
        toast.success('Delivery zone updated successfully');
      } else {
        await deliveryService.createDeliveryZone(formData);
        toast.success('Delivery zone created successfully');
      }
      setShowForm(false);
      setEditingZone(null);
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save delivery zone');
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData(zone);
    setShowForm(true);
  };

  const handleDelete = async (zoneId) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      try {
        await deliveryService.deleteDeliveryZone(zoneId);
        toast.success('Delivery zone deleted successfully');
        fetchZones();
      } catch (error) {
        toast.error('Failed to delete delivery zone');
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Zones Management</h1>
        <button
          onClick={() => {
            setEditingZone(null);
            setFormData({
              name: '',
              description: '',
              zone: 'A',
              deliveryCharge: 0,
              minimumOrderAmount: 0,
              estimatedDeliveryTime: 30,
              isAvailable: true,
              coordinates: {
                type: 'Point',
                coordinates: [0, 0]
              },
              postalCodes: [''],
              timeSlots: [
                {
                  day: 'monday',
                  slots: [{ start: '09:00', end: '10:00' }]
                }
              ]
            });
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Zone
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Zone Type</label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Delivery Charge</label>
                  <input
                    type="number"
                    name="deliveryCharge"
                    value={formData.deliveryCharge}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Minimum Order Amount</label>
                  <input
                    type="number"
                    name="minimumOrderAmount"
                    value={formData.minimumOrderAmount}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Estimated Delivery Time (minutes)</label>
                  <input
                    type="number"
                    name="estimatedDeliveryTime"
                    value={formData.estimatedDeliveryTime}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Coordinates</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.coordinates.coordinates[0]}
                      onChange={(e) => handleCoordinateChange(0, e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Longitude"
                      step="0.000001"
                      required
                    />
                    <input
                      type="number"
                      value={formData.coordinates.coordinates[1]}
                      onChange={(e) => handleCoordinateChange(1, e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Latitude"
                      step="0.000001"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows="3"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Postal Codes</label>
                {formData.postalCodes.map((code, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => handlePostalCodeChange(index, e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Postal Code"
                      pattern="^\d{5}(-\d{4})?$"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removePostalCode(index)}
                      className="bg-red-600 text-white px-3 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPostalCode}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Postal Code
                </button>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Time Slots</label>
                {formData.timeSlots.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-4">
                    <h3 className="font-semibold capitalize">{day.day}</h3>
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex gap-2 mb-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'start', e.target.value)}
                          className="border rounded p-2"
                          required
                        />
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'end', e.target.value)}
                          className="border rounded p-2"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          className="bg-red-600 text-white px-3 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(dayIndex)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Time Slot
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingZone(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{zone.name}</h3>
                <p className="text-sm text-gray-600">Zone {zone.zone}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(zone)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(zone._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="text-sm mb-2">{zone.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Delivery Charge:</span>
                <span className="ml-2">${zone.deliveryCharge}</span>
              </div>
              <div>
                <span className="font-semibold">Min Order:</span>
                <span className="ml-2">${zone.minimumOrderAmount}</span>
              </div>
              <div>
                <span className="font-semibold">Delivery Time:</span>
                <span className="ml-2">{zone.estimatedDeliveryTime} mins</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 ${zone.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {zone.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDeliveryZones; 
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone
} from '../store/slices/deliveryZoneSlice';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminDeliveryZones = () => {
  const dispatch = useDispatch();
  const { zones, loading, error } = useSelector((state) => state.deliveryZones);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    distance: '',
    deliveryFee: '',
    estimatedTime: ''
  });

  useEffect(() => {
    dispatch(fetchDeliveryZones());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const zoneData = {
        name: formData.name,
        distance: parseFloat(formData.distance),
        deliveryFee: parseFloat(formData.deliveryFee),
        estimatedTime: parseInt(formData.estimatedTime),
      };

      if (editingZone) {
        await dispatch(updateDeliveryZone({
          zoneId: editingZone._id,
          zoneData
        })).unwrap();
        toast.success('Delivery zone updated successfully');
      } else {
        await dispatch(createDeliveryZone(zoneData)).unwrap();
        toast.success('Delivery zone created successfully');
      }
      setIsModalOpen(false);
      setEditingZone(null);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name || '',
      distance: (zone.radius || 0).toString(),
      deliveryFee: (zone.deliveryFee || 0).toString(),
      estimatedTime: (zone.estimatedTime || 30).toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (zoneId) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      try {
        await dispatch(deleteDeliveryZone(zoneId)).unwrap();
        toast.success('Delivery zone deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete delivery zone');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      distance: '',
      deliveryFee: '',
      estimatedTime: ''
    });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Zone Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingZone(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaPlus className="inline mr-2" />
          Add New Zone
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            return (
              <div
                key={zone._id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <h2 className="text-xl font-semibold mb-2">{zone.name}</h2>
                <p className="text-gray-600 mb-1">Distance: {zone.distance || 0} km</p>
                <p className="text-gray-600 mb-1">Delivery Fee: €{zone.deliveryFee || 0}</p>
                <p className="text-gray-600 mb-1">Estimated Time: {zone.estimatedTime || 30} min</p>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <FaEdit className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(zone._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    <FaTrash className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                  <input
                    type="number"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Fee (€)</label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Time (minutes)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingZone(null);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingZone ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryZones;

import React, { useState, useEffect } from 'react';
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
    minimumOrderPrice: '',
    estimatedTime: '',
    isActive: true
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const zoneData = {
      ...formData,
      distance: parseFloat(formData.distance),
      deliveryFee: parseFloat(formData.deliveryFee),
      minimumOrderPrice: parseFloat(formData.minimumOrderPrice),
      estimatedTime: parseInt(formData.estimatedTime)
    };

    try {
      if (editingZone) {
        await dispatch(updateDeliveryZone({ id: editingZone._id, zoneData })).unwrap();
        toast.success('Delivery zone updated successfully');
      } else {
        await dispatch(createDeliveryZone(zoneData)).unwrap();
        toast.success('Delivery zone created successfully');
      }
      setIsModalOpen(false);
      setEditingZone(null);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save delivery zone');
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      distance: zone.distance.toString(),
      deliveryFee: zone.deliveryFee.toString(),
      minimumOrderPrice: zone.minimumOrderPrice.toString(),
      estimatedTime: zone.estimatedTime.toString(),
      isActive: zone.isActive
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
      minimumOrderPrice: '',
      estimatedTime: '',
      isActive: true
    });
    setEditingZone(null);
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingZone ? 'Edit Delivery Zone' : 'Create New Delivery Zone'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Fee (€)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Price (€)
              </label>
              <input
                type="number"
                name="minimumOrderPrice"
                value={formData.minimumOrderPrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Time (minutes)
              </label>
              <input
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min="0"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {editingZone && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zone Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min. Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {zones.map((zone) => (
              <tr key={zone._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {zone.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {zone.distance} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  €{zone.deliveryFee.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  €{zone.minimumOrderPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {zone.estimatedTime} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(zone._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDeliveryZones;

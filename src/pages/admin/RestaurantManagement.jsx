import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../../store/slices/restaurantSlice';
import RestaurantLocationForm from '../../components/RestaurantLocationForm';

const RestaurantManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { restaurants, loading, error } = useSelector((state) => state.restaurants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/login');
      return;
    }
    dispatch(fetchRestaurants());
  }, [dispatch, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      if (error === 'Authentication required') {
        toast.error('Please login to continue');
        navigate('/login');
      } else {
        toast.error(error);
      }
    }
  }, [error, navigate]);

  const handleSave = async (formData) => {
    try {
      if (!isAuthenticated) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      if (editingRestaurant) {
        await dispatch(updateRestaurant({
          restaurantId: editingRestaurant._id,
          updateData: formData
        })).unwrap();
        toast.success('Restaurant updated successfully');
      } else {
        await dispatch(createRestaurant(formData)).unwrap();
        toast.success('Restaurant created successfully');
      }
      setIsModalOpen(false);
      setEditingRestaurant(null);
    } catch (error) {
      if (error.message === 'Authentication required') {
        toast.error('Please login to continue');
        navigate('/login');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    }
  };

  const handleEdit = (restaurant) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleDelete = async (restaurantId) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await dispatch(deleteRestaurant(restaurantId)).unwrap();
        toast.success('Restaurant deleted successfully');
      } catch (error) {
        if (error.message === 'Authentication required') {
          toast.error('Please login to continue');
          navigate('/login');
        } else {
          toast.error(error.message || 'Failed to delete restaurant');
        }
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Management</h1>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.error('Please login to continue');
              navigate('/login');
              return;
            }
            setEditingRestaurant(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Restaurant
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-1">{restaurant.branchName}</p>
              <p className="text-gray-600 mb-1">{restaurant.address}</p>
              <p className="text-gray-600 mb-1">{restaurant.city}, {restaurant.district}</p>
              <p className="text-gray-600 mb-1">{restaurant.province}, {restaurant.country}</p>
              <p className="text-gray-600 mb-3">{restaurant.contactNumber}</p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(restaurant)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(restaurant._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </h2>
            <RestaurantLocationForm 
              onSave={handleSave}
              initialData={editingRestaurant}
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRestaurant(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement; 
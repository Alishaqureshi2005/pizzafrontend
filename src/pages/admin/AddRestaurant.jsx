import React from 'react';
import { toast } from 'react-toastify';
import RestaurantLocationForm from '../../components/RestaurantLocationForm';

const AddRestaurant = () => {
  const handleSave = async (restaurantData) => {
    try {
      // The restaurantData now includes coordinates:
      // {
      //   name: "Restaurant Name",
      //   address: "Full address",
      //   area: "Area Name",
      //   coordinates: {
      //     latitude: 24.7337,
      //     longitude: 69.7967
      //   },
      //   description: "Description",
      //   phone: "1234567890",
      //   openingHours: "09:00",
      //   closingHours: "22:00"
      // }

      // Here you would send the data to your backend API
      // The backend can use the coordinates for:
      // 1. Delivery zone calculations
      // 2. Distance calculations
      // 3. Map display
      // 4. Location-based services
      
      console.log('Saving restaurant with coordinates:', restaurantData);
      
      // Example API call (replace with your actual API endpoint)
      // const response = await axios.post('/api/restaurants', restaurantData);
      
      toast.success('Restaurant added successfully!');
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to add restaurant. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Restaurant</h1>
      <RestaurantLocationForm onSave={handleSave} />
    </div>
  );
};

export default AddRestaurant; 
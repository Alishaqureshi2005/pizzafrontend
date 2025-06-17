export const validateOrderForm = (formData, orderType) => {
  const errors = {};

  // Basic validation for all orders
  if (!formData.name?.trim()) errors.name = 'Name is required';
  if (!formData.email?.trim()) errors.email = 'Email is required';
  if (!formData.phone?.trim()) errors.phone = 'Phone is required';

  // Additional validation for delivery orders
  if (orderType === 'delivery') {
    if (!formData.address?.trim()) errors.address = 'Address is required';
    if (!formData.area?.trim()) errors.area = 'Area is required';
    // Removed zipCode requirement as it's not used in the backend
  }

  return errors;
}; 
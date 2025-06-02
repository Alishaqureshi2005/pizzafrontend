export const validateOrderForm = (formData, orderType) => {
  const errors = {};

  if (!formData.name) errors.name = 'Name is required';
  if (!formData.email) errors.email = 'Email is required';
  if (!formData.phone) errors.phone = 'Phone is required';

  if (orderType === 'delivery') {
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.zipCode) errors.zipCode = 'ZIP Code is required';
  }

  return errors;
}; 
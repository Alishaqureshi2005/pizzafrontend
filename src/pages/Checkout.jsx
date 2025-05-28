import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { clearCart, setDeliveryFee, setDeliveryZoneValid, setTimeSlot, fetchCart } from '../store/slices/cartSlice';
import { addOrder } from '../store/slices/orderSlice';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Delivery from '../components/Delivery';
import { deliveryService } from '../services/deliveryService';
import { checkDeliveryAvailability } from '../store/slices/cartSlice';
import Pickup from '../components/pickup';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrderSummary = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  position: sticky;
  top: 2rem;
`;

const DeliveryZoneInfo = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e0e0e0;

  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .zone-details {
    font-size: 0.9rem;
    color: #666;
    
    div {
      margin: 0.3rem 0;
      display: flex;
      justify-content: space-between;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #ff6b6b;
  }
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ff5252;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
`;

const DeliveryZoneMessage = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: ${props => props.isValid ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isValid ? '#155724' : '#721c24'};
`;

const TimeSlotSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #ff6b6b;
  }
`;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeliveryZoneValid, setIsDeliveryZoneValid] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [deliveryZone, setDeliveryZone] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderType, setOrderType] = useState('Delivery');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [pickupDetails, setPickupDetails] = useState(null);

  // Dynamic validation schema
  const validationSchema = React.useMemo(() => Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    address: orderType === 'Delivery' ? Yup.string().required('Address is required') : Yup.string(),
    city: orderType === 'Delivery' ? Yup.string().required('City is required') : Yup.string(),
    zipCode: orderType === 'Delivery' ? Yup.string().required('ZIP code is required') : Yup.string(),
    deliveryInstructions: Yup.string(),
  }), [orderType]);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Check authentication
        if (!isAuthenticated) {
          toast.error('Please log in to proceed with checkout');
          navigate('/login', { state: { from: '/checkout' } });
          return;
        }

        setIsProcessing(true);
        const storedCheckoutData = localStorage.getItem('checkoutData');
        if (!storedCheckoutData) {
          toast.error('No checkout data found');
          navigate('/cart');
          return;
        }
        const parsedCheckoutData = JSON.parse(storedCheckoutData);
        if (!parsedCheckoutData.items || parsedCheckoutData.items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCheckoutData(parsedCheckoutData);
        setOrderType(parsedCheckoutData.orderType || 'Delivery');
        if ((parsedCheckoutData.orderType || 'Delivery') === 'Pickup') {
          setIsDeliveryZoneValid(true); // No delivery zone needed for pickup
        } else {
          // Delivery zone logic
          try {
            const response = await orderService.getDeliveryZones();
            if (response.success && Array.isArray(response.data) && response.data.length > 0) {
              setDeliveryZone(response.data[0]);
            } else {
              toast.error('No delivery zones available');
            }
          } catch (zoneError) {
            if (zoneError.response?.status === 403) {
              toast.error('Please log in again to continue');
              navigate('/login', { state: { from: '/checkout' } });
            } else {
              toast.error('Failed to fetch delivery zones');
            }
          }
        }
      } catch (error) {
        toast.error('Failed to initialize checkout. Please try again.');
        navigate('/cart');
      } finally {
        setIsProcessing(false);
      }
    };
    initializeCheckout();
  }, [dispatch, navigate, isAuthenticated]);

  const handleAddressChange = async (address, setFieldValue, values) => {
    try {
      // Show loading state while checking delivery availability
      setIsProcessing(true);
      
      // Calculate cart total for minimum order check
      const cartTotal = checkoutData?.total || 0;
      
      // Get coordinates from address using geocoding service
      // For now, using dummy coordinates - you should implement proper geocoding
      const coordinates = {
        latitude: 40.730610,
        longitude: -73.935242
      };

      // Use the new delivery zone checking functionality
      const result = await dispatch(checkDeliveryAvailability({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })).unwrap();

      if (!result.success) {
        toast.error(result.message || 'Delivery is not available at this location');
        setIsDeliveryZoneValid(false);
        setTimeSlots([]);
        setSelectedTimeSlot('');
        return;
      }

      setIsDeliveryZoneValid(true);
      dispatch(setDeliveryZoneValid(true));
      
      if (result.data.zone) {
        setDeliveryZone(result.data.zone);
        dispatch(setDeliveryFee(result.data.deliveryFee));

        // Update estimated delivery time
        if (result.data.estimatedTime) {
          toast.info(`Estimated delivery time: ${result.data.estimatedTime} minutes`);
        }

        // Check if there's a minimum order requirement
        if (cartTotal < result.data.zone.minimumOrderAmount) {
          toast.error(`Minimum order amount for this area is €${result.data.zone.minimumOrderAmount}`);
          setIsDeliveryZoneValid(false);
          return;
        }

        // Get available time slots for the zone
        try {
          const timeSlotResponse = await orderService.getDeliveryTimeSlots(result.data.zone._id);
          if (timeSlotResponse.success && Array.isArray(timeSlotResponse.data)) {
            setTimeSlots(timeSlotResponse.data);
            if (timeSlotResponse.data.length > 0) {
              setSelectedTimeSlot(timeSlotResponse.data[0].id);
              dispatch(setTimeSlot(timeSlotResponse.data[0]));
            }
          }
        } catch (timeSlotError) {
          console.error('Error fetching time slots:', timeSlotError);
          toast.error('Failed to fetch delivery time slots');
        }
      }
      
      // Update form values with formatted address if provided
      if (setFieldValue && result.data.address) {
        setFieldValue('address', result.data.address.street || address);
        setFieldValue('city', result.data.address.city || values.city);
        setFieldValue('zipCode', result.data.address.zipCode || values.zipCode);
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      toast.error('Failed to check delivery availability');
      setIsDeliveryZoneValid(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (orderType === 'Delivery') {
        if (!deliveryDetails || !deliveryDetails.coordinates || typeof deliveryDetails.coordinates.latitude !== 'number' || typeof deliveryDetails.coordinates.longitude !== 'number') {
          toast.error('Please confirm your delivery address and location.');
          return;
        }
      }
      setIsProcessing(true);
      const storedCheckoutData = localStorage.getItem('checkoutData');
      if (!storedCheckoutData) {
        throw new Error('No checkout data found');
      }
      const checkoutData = JSON.parse(storedCheckoutData);
      if (!checkoutData.items || checkoutData.items.length === 0) {
        throw new Error('Cart is empty');
      }
      // Prepare order data
      const orderData = {
        cartId: checkoutData.cartId,
        orderType: orderType.toLowerCase(),
        items: checkoutData.items.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          size: item.size,
          crust: item.crust,
          toppings: item.toppings || [],
          extraItems: item.extraItems || [],
          specialInstructions: item.specialInstructions || ''
        })),
        totalPrice: parseFloat(checkoutData.total) || 0,
        deliveryCharge: orderType === 'Delivery' ? parseFloat(deliveryDetails?.zone?.deliveryCharge) || 0 : 0,
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone
        },
        deliveryAddress: orderType === 'Delivery' ? {
          street: deliveryDetails?.address,
          coordinates: deliveryDetails?.coordinates,
          deliveryInstructions: values.deliveryInstructions || ''
        } : {},
        deliveryZone: orderType === 'Delivery' ? deliveryDetails?.zone?._id : null,
        timeSlot: orderType === 'Delivery' ? deliveryDetails?.timeSlot : pickupDetails?.timeSlot,
        pickupLocation: orderType === 'Pickup' ? pickupDetails?.restaurant : null,
        paymentMethod: 'card',
        status: 'pending'
      };

      // Create order
      const order = await orderService.createOrder(orderData);
      
      if (!order || !order.success) {
        throw new Error(order?.message || 'Failed to create order');
      }

      // Only clear cart and checkout data after successful order creation
      try {
        await dispatch(clearCart()).unwrap();
        localStorage.removeItem('checkoutData');
        
        // Add order to Redux store
        dispatch(addOrder(order.data));
        
        toast.success('Order placed successfully!');
        navigate(`/order-tracking/${order.data._id}`);
      } catch (clearError) {
        console.error('Error clearing cart:', clearError);
        // Still navigate to order tracking even if cart clearing fails
        // The cart will be refreshed on next visit
        navigate(`/order-tracking/${order.data._id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMessage);
      
      // If there's a specific error about delivery zone or time slot
      if (errorMessage.includes('delivery') || errorMessage.includes('time slot')) {
        setIsDeliveryZoneValid(false);
      }
    } finally {
      setIsProcessing(false);
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>Checkout</Title>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold', marginRight: 12 }}>Order Type:</label>
        <select
          value={orderType}
          onChange={e => {
            setOrderType(e.target.value);
            if (e.target.value === 'Pickup') {
              setIsDeliveryZoneValid(true);
            } else {
              setIsDeliveryZoneValid(false);
            }
          }}
          style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="Delivery">Delivery</option>
          <option value="Pickup">Pickup</option>
        </select>
      </div>
      <CheckoutGrid>
        <FormSection>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              zipCode: '',
              deliveryInstructions: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, dirty, isValid, values, setFieldValue }) => (
              <Form>
                {/* Only show address fields for Delivery */}
                <FormGroup>
                  <Label>First Name</Label>
                  <Input type="text" name="firstName" />
                  <ErrorMessage name="firstName" component={ErrorText} />
                </FormGroup>
                <FormGroup>
                  <Label>Last Name</Label>
                  <Input type="text" name="lastName" />
                  <ErrorMessage name="lastName" component={ErrorText} />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input type="email" name="email" />
                  <ErrorMessage name="email" component={ErrorText} />
                </FormGroup>
                <FormGroup>
                  <Label>Phone</Label>
                  <Input type="tel" name="phone" />
                  <ErrorMessage name="phone" component={ErrorText} />
                </FormGroup>
                {orderType === 'Delivery' && (
                  <>
                    <FormGroup>
                      <Label>Address</Label>
                      <Input 
                        type="text" 
                        name="address"
                        onBlur={(e) => handleAddressChange(e.target.value, setFieldValue, values)}
                        onChange={(e) => {
                          setFieldValue('address', e.target.value);
                          setIsDeliveryZoneValid(false);
                          setTimeSlots([]);
                          setSelectedTimeSlot('');
                        }}
                      />
                      <ErrorMessage name="address" component={ErrorText} />
                    </FormGroup>
                    <FormGroup>
                      <Label>City</Label>
                      <Input type="text" name="city" />
                      <ErrorMessage name="city" component={ErrorText} />
                    </FormGroup>
                    <FormGroup>
                      <Label>ZIP Code</Label>
                      <Input type="text" name="zipCode" />
                      <ErrorMessage name="zipCode" component={ErrorText} />
                    </FormGroup>
                  </>
                )}
                {orderType === 'Delivery' && isDeliveryZoneValid && timeSlots.length > 0 && (
                  <FormGroup>
                    <Label>Select Delivery Time</Label>
                    <TimeSlotSelect
                      value={selectedTimeSlot}
                      onChange={(e) => {
                        setSelectedTimeSlot(e.target.value);
                        dispatch(setTimeSlot(e.target.value));
                      }}
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot.id || slot._id} value={slot.id || slot._id}>
                          {new Date(slot.time).toLocaleTimeString()}
                        </option>
                      ))}
                    </TimeSlotSelect>
                  </FormGroup>
                )}
                <FormGroup>
                  <Label>Delivery Instructions (Optional)</Label>
                  <Input
                    as="textarea"
                    name="deliveryInstructions"
                    rows="3"
                  />
                  <ErrorMessage name="deliveryInstructions" component={ErrorText} />
                </FormGroup>
                {orderType === 'Delivery' && (
                  <Delivery onConfirm={setDeliveryDetails} />
                )}
                {orderType === 'Pickup' && (
                  <Pickup onConfirm={setPickupDetails} />
                )}
                {console.log('isValid:', isValid, 'deliveryDetails:', deliveryDetails, 'pickupDetails:', pickupDetails, 'orderType:', orderType)}
                <Button 
                  type="submit" 
                  disabled={
                    isSubmitting || 
                    isProcessing || 
                    (orderType === 'Delivery' && (!deliveryDetails || !deliveryDetails.coordinates || typeof deliveryDetails.coordinates.latitude !== 'number' || typeof deliveryDetails.coordinates.longitude !== 'number')) ||
                    !isValid
                  }
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </Form>
            )}
          </Formik>
        </FormSection>
        <OrderSummary>
          <Title>Order Summary</Title>
          {checkoutData && checkoutData.items && checkoutData.items.length > 0 ? (
            <>
              {checkoutData.items.map(item => (
                <OrderItem key={item.id || item.productId || item._id}>
                  <div>
                    <div>{item.name || 'Custom Pizza'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Size: {item.size}, Crust: {item.crust}
                      {item.toppings && item.toppings.length > 0 && (
                        <div>Toppings: {item.toppings.map(t => t.name).join(', ')}</div>
                      )}
                      {item.extraItems && item.extraItems.length > 0 && (
                        <div>Extras: {item.extraItems.map(e => e.name).join(', ')}</div>
                      )}
                    </div>
                  </div>
                  <div>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                </OrderItem>
              ))}
              {orderType === 'Delivery' && deliveryZone && isDeliveryZoneValid && (
                <DeliveryZoneInfo>
                  <h3>Delivery Information</h3>
                  <div className="zone-details">
                    <div>
                      <span>Zone:</span>
                      <span>{deliveryZone.name}</span>
                    </div>
                    <div>
                      <span>Delivery Fee:</span>
                      <span>${deliveryZone.deliveryFee?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div>
                      <span>Estimated Time:</span>
                      <span>{deliveryZone.estimatedTime} minutes</span>
                    </div>
                    {deliveryZone.minimumOrderAmount && (
                      <div>
                        <span>Minimum Order:</span>
                        <span>${deliveryZone.minimumOrderAmount?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </DeliveryZoneInfo>
              )}
              <OrderItem>
                <div>Subtotal</div>
                <div>${((checkoutData.total || 0) - (orderType === 'Delivery' ? (checkoutData.deliveryFee || 0) : 0)).toFixed(2)}</div>
              </OrderItem>
              {orderType === 'Delivery' && (
                <OrderItem>
                  <div>Delivery Fee</div>
                  <div>${(checkoutData.deliveryFee || 0).toFixed(2)}</div>
                </OrderItem>
              )}
              <OrderItem style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                <div>Total</div>
                <div>${(checkoutData.total || 0).toFixed(2)}</div>
              </OrderItem>
            </>
          ) : (
            <div className="text-center text-gray-500">
              No items in cart. Please add some items before checkout.
            </div>
          )}
        </OrderSummary>
      </CheckoutGrid>
    </Container>
  );
};

export default Checkout;

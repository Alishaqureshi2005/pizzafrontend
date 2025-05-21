import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { clearCart } from '../store/slices/cartSlice';
import { addOrder } from '../store/slices/orderSlice';
import { orderService } from '../services/orderService';
import { cartApi } from '../services/cartApi';

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

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  zipCode: Yup.string().required('ZIP code is required'),
  deliveryInstructions: Yup.string(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeliveryZoneValid, setIsDeliveryZoneValid] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [deliveryZone, setDeliveryZone] = useState(null);

  useEffect(() => {
    const checkDeliveryZones = async () => {
      try {
        const zones = await orderService.getDeliveryZones();
        setDeliveryZone(zones[0]); // For now, just use the first zone
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
      }
    };

    checkDeliveryZones();
  }, []);

  const handleAddressChange = async (address) => {
    try {
      const result = await orderService.checkDeliveryAvailability(address);
      setIsDeliveryZoneValid(result.isAvailable);
      if (result.isAvailable && result.zoneId) {
        const slots = await orderService.getTimeSlots(result.zoneId, new Date());
        setTimeSlots(slots);
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      setIsDeliveryZoneValid(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!isDeliveryZoneValid) {
      toast.error('Delivery is not available in your area');
      return;
    }

    if (!selectedTimeSlot) {
      toast.error('Please select a delivery time slot');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: cart.items,
        total: cart.total,
        deliveryInfo: {
          ...values,
          timeSlot: selectedTimeSlot,
          zoneId: deliveryZone.id
        },
        status: 'pending'
      };

      const order = await orderService.createOrder(orderData);
      dispatch(addOrder(order));
      await handleClearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-tracking/${order.id}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Error placing order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <Container>
      <Title>Checkout</Title>
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
            {({ isSubmitting, values }) => (
              <Form>
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

                <FormGroup>
                  <Label>Address</Label>
                  <Input 
                    type="text" 
                    name="address"
                    onBlur={(e) => handleAddressChange(e.target.value)}
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

                {isDeliveryZoneValid && (
                  <FormGroup>
                    <Label>Select Delivery Time</Label>
                    <TimeSlotSelect
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
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

                <DeliveryZoneMessage isValid={isDeliveryZoneValid}>
                  {isDeliveryZoneValid
                    ? 'Delivery is available in your area!'
                    : 'Please enter your address to check delivery availability'}
                </DeliveryZoneMessage>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || isProcessing || !isDeliveryZoneValid || !selectedTimeSlot}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </Form>
            )}
          </Formik>
        </FormSection>

        <OrderSummary>
          <Title>Order Summary</Title>
          {cart.items.map(item => (
            <OrderItem key={item.id}>
              <div>
                <div>{item.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {item.size}, {item.crust}
                </div>
              </div>
              <div>${(item.price * item.quantity).toFixed(2)}</div>
            </OrderItem>
          ))}
          <OrderItem>
            <div>Subtotal</div>
            <div>${(cart.total - cart.deliveryFee).toFixed(2)}</div>
          </OrderItem>
          <OrderItem>
            <div>Delivery Fee</div>
            <div>${cart.deliveryFee.toFixed(2)}</div>
          </OrderItem>
          <OrderItem style={{ borderBottom: 'none', fontWeight: 'bold' }}>
            <div>Total</div>
            <div>${cart.total.toFixed(2)}</div>
          </OrderItem>
        </OrderSummary>
      </CheckoutGrid>
    </Container>
  );
};

export default Checkout; 
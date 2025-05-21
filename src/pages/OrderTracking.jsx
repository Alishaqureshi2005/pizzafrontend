import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const TrackingCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const StatusTimeline = styled.div`
  position: relative;
  margin: 2rem 0;
  padding-left: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ddd;
  }
`;

const StatusItem = styled.div`
  position: relative;
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: -2.5rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: ${props => props.active ? '#ff6b6b' : '#ddd'};
    border: 2px solid white;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusTitle = styled.h3`
  color: ${props => props.active ? '#ff6b6b' : '#666'};
  margin-bottom: 0.5rem;
`;

const StatusTime = styled.p`
  color: #999;
  font-size: 0.875rem;
  margin: 0;
`;

const OrderDetails = styled.div`
  margin-top: 2rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const DeliveryInfo = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`;

const DeliveryInfoItem = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DeliveryInfoLabel = styled.span`
  font-weight: bold;
  color: #666;
  margin-right: 0.5rem;
`;

const EstimatedDelivery = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
  color: #666;
`;

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const [orderData, trackingData] = await Promise.all([
          orderService.getOrderById(orderId),
          orderService.getOrderTracking(orderId)
        ]);
        setOrder(orderData);
        setTracking(trackingData);
      } catch (error) {
        toast.error('Failed to fetch order details');
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!order) {
    return <Container>Order not found</Container>;
  }

  const getStatusTimeline = () => {
    const statuses = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'confirmed', label: 'Order Confirmed' },
      { key: 'preparing', label: 'Preparing Your Order' },
      { key: 'ready', label: 'Ready for Delivery' },
      { key: 'delivering', label: 'On the Way' },
      { key: 'delivered', label: 'Delivered' }
    ];

    const currentStatusIndex = statuses.findIndex(s => s.key === order.status);

    return statuses.map((status, index) => (
      <StatusItem key={status.key} active={index <= currentStatusIndex}>
        <StatusTitle active={index <= currentStatusIndex}>
          {status.label}
        </StatusTitle>
        {index <= currentStatusIndex && (
          <StatusTime>
            {tracking?.statusUpdates?.[status.key] || 'Just now'}
          </StatusTime>
        )}
      </StatusItem>
    ));
  };

  return (
    <Container>
      <Title>Track Your Order</Title>
      <TrackingCard>
        <StatusTimeline>
          {getStatusTimeline()}
        </StatusTimeline>

        <OrderDetails>
          <h2>Order Details</h2>
          {order.items.map(item => (
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
            <div>${(order.total - order.deliveryFee).toFixed(2)}</div>
          </OrderItem>
          <OrderItem>
            <div>Delivery Fee</div>
            <div>${order.deliveryFee.toFixed(2)}</div>
          </OrderItem>
          <OrderItem style={{ fontWeight: 'bold' }}>
            <div>Total</div>
            <div>${order.total.toFixed(2)}</div>
          </OrderItem>
        </OrderDetails>

        <DeliveryInfo>
          <h2>Delivery Information</h2>
          <DeliveryInfoItem>
            <DeliveryInfoLabel>Address:</DeliveryInfoLabel>
            {order.deliveryInfo.address}
          </DeliveryInfoItem>
          <DeliveryInfoItem>
            <DeliveryInfoLabel>City:</DeliveryInfoLabel>
            {order.deliveryInfo.city}
          </DeliveryInfoItem>
          <DeliveryInfoItem>
            <DeliveryInfoLabel>ZIP Code:</DeliveryInfoLabel>
            {order.deliveryInfo.zipCode}
          </DeliveryInfoItem>
          {order.deliveryInfo.deliveryInstructions && (
            <DeliveryInfoItem>
              <DeliveryInfoLabel>Delivery Instructions:</DeliveryInfoLabel>
              {order.deliveryInfo.deliveryInstructions}
            </DeliveryInfoItem>
          )}
          {tracking?.estimatedDeliveryTime && (
            <EstimatedDelivery>
              Estimated Delivery Time: {new Date(tracking.estimatedDeliveryTime).toLocaleTimeString()}
            </EstimatedDelivery>
          )}
        </DeliveryInfo>
      </TrackingCard>
    </Container>
  );
};

export default OrderTracking; 
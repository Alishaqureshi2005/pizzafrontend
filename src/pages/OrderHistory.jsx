import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import { FaTrash } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #ff6b6b;
  }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const OrderNumber = styled.div`
  font-weight: bold;
  color: #333;
`;

const OrderDate = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const OrderStatus = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'confirmed': return '#cce5ff';
      case 'preparing': return '#d4edda';
      case 'ready': return '#d1ecf1';
      case 'delivering': return '#e2e3e5';
      case 'delivered': return '#d4edda';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'confirmed': return '#004085';
      case 'preparing': return '#155724';
      case 'ready': return '#0c5460';
      case 'delivering': return '#383d41';
      case 'delivered': return '#155724';
      case 'cancelled': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const OrderItems = styled.div`
  margin-bottom: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
`;

const OrderTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #333;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #c82333;
  }

  &:disabled {
    color: #dc354580;
    cursor: not-allowed;
  }
`;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderHistory(filters);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch order history');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleDeleteOrder = async (orderId, e) => {
    e.stopPropagation(); // Prevent triggering the order click
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setDeletingOrderId(orderId);
        await orderService.deleteOrder(orderId);
        setOrders(orders.filter(order => order.id !== orderId));
        toast.success('Order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      } finally {
        setDeletingOrderId(null);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading your order history...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Order History</Title>
      
      <Filters>
        <FilterSelect
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivering">Delivering</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>

        <FilterSelect
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
        >
          <option value="date">Sort by Date</option>
          <option value="total">Sort by Total</option>
          <option value="status">Sort by Status</option>
        </FilterSelect>

        <FilterSelect
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleFilterChange}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </FilterSelect>
      </Filters>

      {orders.length === 0 ? (
        <EmptyState>
          <h2>No orders found</h2>
          <p>Start ordering your favorite pizzas!</p>
        </EmptyState>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} onClick={() => handleOrderClick(order.id)}>
            <OrderHeader>
              <OrderNumber>Order #{order.id}</OrderNumber>
              <div className="flex items-center space-x-4">
                <OrderDate>
                  {new Date(order.createdAt).toLocaleDateString()}
                </OrderDate>
                <OrderStatus status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </OrderStatus>
                <DeleteButton
                  onClick={(e) => handleDeleteOrder(order.id, e)}
                  disabled={deletingOrderId === order.id}
                  title="Delete Order"
                >
                  <FaTrash />
                </DeleteButton>
              </div>
            </OrderHeader>

            <OrderItems>
              {order.items.map((item, index) => (
                <OrderItem key={index}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </OrderItem>
              ))}
            </OrderItems>

            <OrderTotal>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </OrderTotal>
          </OrderCard>
        ))
      )}
    </Container>
  );
};

export default OrderHistory; 
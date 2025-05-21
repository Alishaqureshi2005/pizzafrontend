import React from 'react';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
`;

const TotalRow = styled(PriceRow)`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
`;

const AddToCartButton = styled.button`
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

const PriceSummary = ({ 
  basePrice, 
  toppingsTotal, 
  extraItemsTotal, 
  totalPrice, 
  onAddToCart, 
  isAddingToCart 
}) => (
  <SummaryContainer>
    <Title>Price Summary</Title>
    <PriceRow>
      <span>Base Price:</span>
      <span>${basePrice.toFixed(2)}</span>
    </PriceRow>
    <PriceRow>
      <span>Toppings:</span>
      <span>${toppingsTotal.toFixed(2)}</span>
    </PriceRow>
    <PriceRow>
      <span>Extra Items:</span>
      <span>${extraItemsTotal.toFixed(2)}</span>
    </PriceRow>
    <TotalRow>
      <span>Total:</span>
      <span>${totalPrice.toFixed(2)}</span>
    </TotalRow>
    <AddToCartButton 
      onClick={onAddToCart} 
      disabled={isAddingToCart}
    >
      {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
    </AddToCartButton>
  </SummaryContainer>
);

export default PriceSummary; 
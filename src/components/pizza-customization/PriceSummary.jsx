import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
`;

const TotalRow = styled(PriceRow)`
  font-weight: bold;
  color: #333;
  font-size: 1.2rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
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
  transition: background 0.2s;

  &:hover {
    background: #ff5252;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CustomizationDetails = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
`;

const DetailRow = styled.div`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const PriceSummary = ({
  basePrice,
  toppingsTotal,
  extraItemsTotal,
  totalPrice,
  onAddToCart,
  isAddingToCart,
  customization
}) => {
  const renderCustomizationDetails = () => {
    if (!customization || typeof customization !== 'object') return null;

    // Ensure all properties are of the correct type
    const safeCustomization = {
      size: String(customization.size || ''),
      crust: String(customization.crust || ''),
      toppings: Array.isArray(customization.toppings) ? customization.toppings : [],
      extraItems: Array.isArray(customization.extraItems) ? customization.extraItems : [],
      specialInstructions: String(customization.specialInstructions || '')
    };

    return (
      <CustomizationDetails>
        {safeCustomization.size && (
          <DetailRow>
            <strong>Size:</strong> {safeCustomization.size}
          </DetailRow>
        )}
        {safeCustomization.crust && (
          <DetailRow>
            <strong>Crust:</strong> {safeCustomization.crust}
          </DetailRow>
        )}
        {safeCustomization.toppings.length > 0 && (
          <DetailRow>
            <strong>Toppings:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {safeCustomization.toppings.map((topping, index) => (
                <li key={index}>
                  {String(topping?.name || 'Unknown')} x{Number(topping?.quantity || 0)}
                </li>
              ))}
            </ul>
          </DetailRow>
        )}
        {safeCustomization.extraItems.length > 0 && (
          <DetailRow>
            <strong>Extra Items:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
              {safeCustomization.extraItems.map((item, index) => (
                <li key={index}>
                  {String(item?.name || 'Unknown')} x{Number(item?.quantity || 0)}
                </li>
              ))}
            </ul>
          </DetailRow>
        )}
        {safeCustomization.specialInstructions && (
          <DetailRow>
            <strong>Special Instructions:</strong> {safeCustomization.specialInstructions}
          </DetailRow>
        )}
      </CustomizationDetails>
    );
  };

  return (
    <Container>
      <Title>Order Summary</Title>
      {renderCustomizationDetails()}
      <PriceRow>
        <span>Base Price</span>
        <span>€{basePrice.toFixed(2)}</span>
      </PriceRow>
      <PriceRow>
        <span>Toppings</span>
        <span>€{toppingsTotal.toFixed(2)}</span>
      </PriceRow>
      <PriceRow>
        <span>Extra Items</span>
        <span>€{extraItemsTotal.toFixed(2)}</span>
      </PriceRow>
      <TotalRow>
        <span>Total</span>
        <span>€{totalPrice.toFixed(2)}</span>
      </TotalRow>
      <Button onClick={onAddToCart} disabled={isAddingToCart}>
        {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
      </Button>
    </Container>
  );
};

export default PriceSummary; 
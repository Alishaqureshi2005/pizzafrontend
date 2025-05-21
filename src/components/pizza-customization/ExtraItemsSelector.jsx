import React from 'react';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Category = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #666;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const ItemName = styled.span`
  flex: 1;
`;

const ItemPrice = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #333;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  min-width: 24px;
  text-align: center;
`;

const ExtraItemsSelector = ({ extraItemsByCategory, onExtraItemQuantityChange }) => (
  <Section>
    <Title>Add Extra Items</Title>
    {Object.entries(extraItemsByCategory).map(([category, items]) => (
      <Category key={category}>
        <CategoryTitle>{category}</CategoryTitle>
        <ItemGrid>
          {items.map(item => (
            <ItemCard key={item.id}>
              <ItemName>{item.name}</ItemName>
              <ItemPrice>${(item.price || 0).toFixed(2)}</ItemPrice>
              <QuantityControl>
                <QuantityButton
                  onClick={() => onExtraItemQuantityChange(item.id, -1)}
                  disabled={!item.quantity}
                >
                  -
                </QuantityButton>
                <Quantity>{item.quantity || 0}</Quantity>
                <QuantityButton
                  onClick={() => onExtraItemQuantityChange(item.id, 1)}
                >
                  +
                </QuantityButton>
              </QuantityControl>
            </ItemCard>
          ))}
        </ItemGrid>
      </Category>
    ))}
  </Section>
);

export default ExtraItemsSelector; 
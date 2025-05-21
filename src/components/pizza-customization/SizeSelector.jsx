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

const OptionGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Option = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#ff6b6b' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.selected ? '#ff6b6b' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff6b6b;
  }
`;

const SizeSelector = ({ sizes, selectedSize, onSizeSelect }) => (
  <Section>
    <Title>Choose Size</Title>
    <OptionGroup>
      {sizes.map(size => (
        <Option
          key={size.name}
          selected={selectedSize === size.name}
          onClick={() => onSizeSelect(size.name)}
        >
          {size.name} (+${(size.price || 0).toFixed(2)})
        </Option>
      ))}
    </OptionGroup>
  </Section>
);

export default SizeSelector; 
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Content = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Financials: React.FC = () => {
  return (
    <Container>
      <Title>Financials</Title>
      <Content>
        <p>
          Financial management dashboard coming soon. This section will include:
        </p>
        <ul>
          <li>Budget tracking</li>
          <li>Expense management</li>
          <li>Revenue tracking</li>
          <li>Financial reports</li>
          <li>Invoicing</li>
        </ul>
      </Content>
    </Container>
  );
};

export default Financials;

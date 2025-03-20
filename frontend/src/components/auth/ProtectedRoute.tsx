import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(107, 61, 223, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #6b3ddf;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 40px 0;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading)
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;

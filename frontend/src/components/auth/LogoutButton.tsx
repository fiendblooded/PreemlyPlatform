import { useAuth0 } from "@auth0/auth0-react";
import { styled } from "styled-components";
const StyledButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #121212;
  background: linear-gradient(90deg, #007b8b, #9c00df, #ffd524, #3049f8);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(90deg, #3049f8, #ffd524, #9c00df, #007b8b);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }
`;

const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  return (
    <StyledButton
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </StyledButton>
  );
};

export default LogoutButton;

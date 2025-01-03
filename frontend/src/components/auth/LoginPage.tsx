import { useAuth0 } from "@auth0/auth0-react";
import styled, { keyframes } from "styled-components";

const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #121212; /* Dark background */
  padding-right: 80px;
`;

const StyledButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #121212;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #ffd716;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }
`;
const Title = styled.div`
  font-size: 32px;
  font-weight: 600;
  margin-top: 10px;
`;
const spin = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`;

// Styled container with the spin animation
const SpinningContainer = styled.div`
  width: 161px; /* Set the width */
  height: 161px; /* Set the height */

  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${spin} 8s linear infinite; /* Apply the spin animation */
`;

const LoginPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <LoginContainer>
      <SpinningContainer>
        <svg
          width="161"
          height="161"
          viewBox="0 0 161 161"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M80.4297 149.077C118.186 149.077 148.793 118.469 148.793 80.7129C148.793 42.9567 118.186 12.3493 80.4297 12.3493C42.6735 12.3493 12.0661 42.9567 12.0661 80.7129C12.0661 118.469 42.6735 149.077 80.4297 149.077ZM80.4297 160.713C124.612 160.713 160.43 124.896 160.43 80.7129C160.43 36.5301 124.612 0.712891 80.4297 0.712891C36.2469 0.712891 0.429688 36.5301 0.429688 80.7129C0.429688 124.896 36.2469 160.713 80.4297 160.713Z"
            fill="url(#paint0_radial_414_482)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M75.2619 30.3477C77.2701 25.8919 83.5971 25.8919 85.6053 30.3477L86.873 33.1604C93.9883 48.9473 103.183 63.7115 114.213 77.0603L116.052 79.2856C117.785 81.3829 117.785 84.4151 116.052 86.5124L114.213 88.7376C103.183 102.086 93.9883 116.851 86.873 132.638L85.6053 135.45C83.5971 139.906 77.2701 139.906 75.2619 135.45L73.9942 132.638C66.879 116.851 57.684 102.086 46.654 88.7376L44.8153 86.5124C43.0824 84.4151 43.0824 81.3829 44.8153 79.2856L46.654 77.0603C57.6841 63.7115 66.879 48.9473 73.9942 33.1604L75.2619 30.3477ZM80.4336 43.3868C73.5171 57.4841 64.996 70.7432 55.0354 82.899C64.996 95.0548 73.5171 108.314 80.4336 122.411C87.3501 108.314 95.8712 95.0548 105.832 82.899C95.8712 70.7432 87.3501 57.4841 80.4336 43.3868Z"
            fill="url(#paint1_radial_414_482)"
          />
          <defs>
            <radialGradient
              id="paint0_radial_414_482"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(0.429688 80.7129) scale(160 204.996)"
            >
              <stop stopColor="#007B8B" />
              <stop offset="0.33" stopColor="#9C00DF" />
              <stop offset="0.66" stopColor="#FFD524" />
              <stop offset="1" stopColor="#3049F8" />
            </radialGradient>
            <radialGradient
              id="paint1_radial_414_482"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(48.4336 82.899) scale(64 132.316)"
            >
              <stop stopColor="#007B8B" />
              <stop offset="0.33" stopColor="#9C00DF" />
              <stop offset="0.66" stopColor="#FFD524" />
              <stop offset="1" stopColor="#3049F8" />
            </radialGradient>
          </defs>
        </svg>
      </SpinningContainer>
      <Title>Welcome to Preemly</Title>
      <StyledButton
        onClick={() =>
          loginWithRedirect({
            authorizationParams: {
              audience: "https://api.preemly.eu",
              scope: "read:events write:events",
              prompt: "consent", // Force showing the consent screen
            },
          })
        }
      >
        Log In
      </StyledButton>
    </LoginContainer>
  );
};

export default LoginPage;

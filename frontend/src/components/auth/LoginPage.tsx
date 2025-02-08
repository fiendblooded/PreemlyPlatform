import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
const audience = import.meta.env.VITE_APP_AUDIENCE;

const LoginContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
      ellipse at center,
      rgba(255, 215, 22, 0.3) 0%,
      rgba(255, 255, 255, 0) 70%
    ),
    /* Gold */
      radial-gradient(
        ellipse at center,
        rgba(255, 138, 0, 0.3) 0%,
        rgba(255, 255, 255, 0) 70%
      ),
    /* Orange */
      radial-gradient(
        ellipse at center,
        rgba(128, 0, 255, 0.3) 0%,
        rgba(255, 255, 255, 0) 70%
      )
      /* Purple/Violet */ #fff;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-size: 900px 900px, 900px 900px, 900px 900px;
  background-attachment: fixed;
  animation: bganimation 30s infinite;
  color: #121212;
  font-family: Axiforma, sans-serif;

  @keyframes bganimation {
    0% {
      background-position: -100% -100%, 200% 200%, -100% 200%, 200% -100%;
    }
    50% {
      background-position: 150% 100%, -200% 100%, 100% 0%, 0% 100%;
    }
    100% {
      background-position: -100% -100%, 200% 200%, -100% 200%, 200% -100%;
    }
  }
`;

const LoginBox = styled.div`
  width: 25%;
  padding: 40px;
  background-color: #181818;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const Logo = styled.div`
  width: 160px;
  height: 160px;
  margin-bottom: 20px;

  border-radius: 50%;
  background-image: url("placeholder.svg"); /* Replace with your logo path */
  background-size: cover;
  background-position: center;
`;

const Title = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: white;
  position: relative;

  .scribble {
    position: relative;
    background-color: transparent;
    color: #ffd716;

    &::after {
      content: "";
      position: absolute;
      bottom: -10%;
      left: 0;
      height: 30%;
      width: 100%;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='247' height='22' fill='none'%3E%3Cmask id='a' width='246' height='23' x='0' y='1' maskUnits='userSpaceOnUse' style='mask-type:alpha'%3E%3Cpath fill='%23D9D9D9' d='M0 1h246v23H0z'/%3E%3C/mask%3E%3Cg mask='url(%23a)'%3E%3Cpath fill='%2300a661' d='M.225 13.987c40.77-3.247 81.218-6.304 122.486-5.61 40.217.68 80.07 3.493 119.823 8.284 4.828.577 4.966-4.727.193-5.301-40.597-4.886-82.029-7.082-123.059-6.436-39.896.627-80.713 2.548-119.53 8.822-.233.04-.132.263.087.25v-.009z'/%3E%3C/g%3E%3C/svg%3E");
      mask-repeat: no-repeat;
      mask-size: 95%;
      background-image: linear-gradient(
        to right,
        currentcolor 40%,
        transparent 50%
      );
      background-repeat: no-repeat;
      animation: background-size-animate 1.5s ease-in-out both;
      background-size: 300%;
    }
  }
`;

const Description = styled.p`
  font-size: 1.1em;
  color: #bbbbbb;
  margin-bottom: 30px;
  line-height: 1.5;
`;
const StyledButton = styled.div`
  width: 100%;
  max-width: 240px;
  padding: 14px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #ff8a00, #ffd716, #ff8a00);
  background-size: 200% 200%;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 8px 20px rgba(255, 138, 0, 0.4);
  animation: gradient-bling 4s ease infinite;

  &:hover {
    background: linear-gradient(135deg, #ffd716, #ff8a00, #ffd716);
    background-size: 200% 200%;
    box-shadow: 0 10px 25px rgba(255, 138, 0, 0.6),
      0 0 8px rgba(255, 215, 22, 0.4);
    transform: scale(1.03);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 5px 15px rgba(255, 138, 0, 0.3);
  }

  &:focus {
    outline: none;
  }

  @keyframes gradient-bling {
    0% {
      background-position: 0% 50%;
    }
    60% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const LoginPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <LoginContainer>
      <LoginBox>
        <Logo>
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M80 148.364C117.756 148.364 148.364 117.756 148.364 80C148.364 42.2438 117.756 11.6364 80 11.6364C42.2438 11.6364 11.6364 42.2438 11.6364 80C11.6364 117.756 42.2438 148.364 80 148.364ZM80 160C124.183 160 160 124.183 160 80C160 35.8172 124.183 0 80 0C35.8172 0 0 35.8172 0 80C0 124.183 35.8172 160 80 160Z"
              fill="white"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M74.844 29.706C76.8468 25.249 83.1567 25.249 85.1595 29.706L86.4238 32.5196C93.5198 48.311 102.69 63.0794 113.69 76.4321L115.524 78.658C117.252 80.7558 117.252 83.7889 115.524 85.8868L113.69 88.1127C102.69 101.465 93.5198 116.234 86.4238 132.025L85.1595 134.839C83.1567 139.296 76.8468 139.296 74.844 134.839L73.5798 132.025C66.4838 116.234 57.3137 101.465 46.3135 88.1127L44.4798 85.8868C42.7515 83.7889 42.7515 80.7558 44.4798 78.658L46.3135 76.4321C57.3137 63.0794 66.4838 48.311 73.5798 32.5196L74.844 29.706ZM80.0018 42.7489C73.104 56.8502 64.6059 70.1131 54.6722 82.2724C64.6059 94.4317 73.104 107.695 80.0018 121.796C86.8995 107.695 95.3976 94.4317 105.331 82.2724C95.3976 70.1131 86.8995 56.8502 80.0018 42.7489Z"
              fill="white"
            />
          </svg>
        </Logo>
        <Title>
          Welcome to <span className="scribble">Preemly</span>
        </Title>
        <Description>
          Preemly is your go-to solution for seamless event management. We’re
          currently in <b>pre-release beta</b> and excited to have you on board.
          Thanks for helping us shape the future of event planning!
        </Description>
        <StyledButton
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                audience: audience,
                scope: "read:events write:events",
                prompt: "consent",
              },
            })
          }
        >
          Start
        </StyledButton>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;

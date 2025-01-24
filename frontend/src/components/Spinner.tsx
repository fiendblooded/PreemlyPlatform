import React from "react";
import styled, { keyframes, css } from "styled-components";

// Keyframes for the spinner animation
const loader7Before = keyframes`
  0%, 100% {
    transform: none;
  }
  25% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(-100%) translateY(-100%);
  }
  75% {
    transform: translateY(-100%);
  }
`;

const loader7After = keyframes`
  0%, 100% {
    transform: none;
  }
  25% {
    transform: translateX(100%);
  }
  50% {
    transform: translateX(100%) translateY(100%);
  }
  75% {
    transform: translateY(100%);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Fade-out keyframes
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Styled component for the spinner container
const LoaderContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  animation: ${({ isVisible }) =>
      isVisible
        ? css`
            ${fadeIn} 0.5s ease-in-out
          `
        : css`
            ${fadeOut} 0.5s ease-in-out
          `}
    forwards;
`;

// Styled component for the loader
const Loader = styled.div`
  --color: #00aef0;
  --size-square: 3vmin;

  position: relative;
  width: var(--size-square);
  height: var(--size-square);

  &::before,
  &::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    width: var(--size-square);
    height: var(--size-square);
    background-color: var(--color);
  }

  &::before {
    animation: ${loader7Before} 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
  }

  &::after {
    animation: ${loader7After} 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
  }
`;

// Spinner component
interface SpinnerProps {
  isVisible: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ isVisible }) => {
  return (
    <LoaderContainer isVisible={isVisible}>
      <Loader />
    </LoaderContainer>
  );
};

export default Spinner;

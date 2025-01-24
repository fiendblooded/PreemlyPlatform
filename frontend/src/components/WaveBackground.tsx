import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframes for the wave animation
const waves = keyframes`
  to {
    background-position: 1600px 130%, 3150px 130%, 5300px 130%;
  }
`;

// Fullscreen container for the background
const FullscreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1; /* Push behind all other content */
  background-color: transparent; /* Base background color */
  overflow: hidden; /* Prevent overflow from the wave animations */
  pointer-events: none;
`;

// Background waves
const AnimatedWaves = styled.div`
  position: absolute;
  bottom: 0; /* Waves start at the bottom */
  width: 100%;
  height: 40%;

  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    width: 200%;
    height: 100%;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='198'%3e%3cdefs%3e%3clinearGradient id='a' x1='50%25' x2='50%25' y1='-10.959%25' y2='100%25'%3e%3cstop stop-color='%2300aeff' stop-opacity='.25' offset='0%25'/%3e%3cstop stop-color='%23006cc4' offset='100%25'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath fill='url(%23a)' fill-rule='evenodd' d='M.005 121C311 121 409.898-.25 811 0c400 0 500 121 789 121v77H0s.005-48 .005-77z'/%3e%3c/svg%3e"),
      url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='198'%3e%3cdefs%3e%3clinearGradient id='a' x1='50%25' x2='50%25' y1='-10.959%25' y2='100%25'%3e%3cstop stop-color='%2300aeff' stop-opacity='.25' offset='0%25'/%3e%3cstop stop-color='%23006cc4' offset='100%25'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath fill='url(%23a)' fill-rule='evenodd' d='M.005 121C311 121 409.898-.25 811 0c400 0 500 121 789 121v77H0s.005-48 .005-77z'/%3e%3c/svg%3e"),
      url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='198'%3e%3cdefs%3e%3clinearGradient id='a' x1='50%25' x2='50%25' y1='-10.959%25' y2='100%25'%3e%3cstop stop-color='%2300aeff' stop-opacity='.25' offset='0%25'/%3e%3cstop stop-color='%23006cc4' offset='100%25'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath fill='url(%23a)' fill-rule='evenodd' d='M.005 121C311 121 409.898-.25 811 0c400 0 500 121 789 121v77H0s.005-48 .005-77z'/%3e%3c/svg%3e");
    background-repeat: repeat-x;
    background-size: 1600px 50%;
    background-position: 0 130%, -50px 130%, 500px 130%;
    animation: ${waves} 40s linear infinite;
  }
`;

const WaveBackground: React.FC = () => {
  return (
    <FullscreenContainer>
      <AnimatedWaves />
    </FullscreenContainer>
  );
};

export default WaveBackground;

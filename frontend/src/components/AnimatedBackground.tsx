import React from "react";
import styled, { keyframes } from "styled-components";
import VideoSource from "../assets/welcomevideo.mp4";

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const FullscreenContainer = styled.div`
  font-family: "Axiforma", sans-serif;
  background-color: #f2f2f3;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: absolute;
  z-index: 100503052340504360;
  opacity: 0; /* Start hidden */
  animation: ${fadeIn} 1.5s forwards; /* Appear animation */
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const AnimatedBackground: React.FC = () => {
  return (
    <FullscreenContainer>
      <StyledVideo src={VideoSource} autoPlay muted loop playsInline />
    </FullscreenContainer>
  );
};

export default AnimatedBackground;

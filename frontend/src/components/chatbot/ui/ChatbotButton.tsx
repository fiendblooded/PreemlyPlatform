import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import ChatbotWindow from "./ChatbotWindow";

// Pulse animation for hover effect
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(192, 84, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(192, 84, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(192, 84, 255, 0);
  }
`;

// Gradient animation
const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled button
const Button = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background: linear-gradient(
    90deg,
    #5e83fb,
    #c054ff,
    #ea5cbe,
    #c054ff,
    #5e83fb
  );
  background-size: 300% 100%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 999;
  animation: ${gradientMove} 15s ease infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(192, 84, 255, 0.3);
    animation: ${pulse} 1.5s infinite;
  }

  &:active {
    transform: translateY(1px);
  }
`;

// Chat icon SVG
const ChatIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Close icon SVG
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={toggleChat} aria-label="Toggle chat">
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Button>
      {isOpen && <ChatbotWindow onClose={closeChat} />}
    </>
  );
};

export default ChatbotButton;

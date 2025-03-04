import React, { useState, KeyboardEvent } from "react";
import styled, { keyframes, css } from "styled-components";

// Animation for the gradient movement
const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 16px 16px;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  background-color: white;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: black;
  &:focus {
    box-shadow: 0 1px 3px rgba(182, 56, 174, 0.3);
  }

  &::placeholder {
    color: #aaaaaa;
  }
`;

const SendButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-left: 8px;
  border: none;
  background: ${({ isActive }) =>
    isActive
      ? "linear-gradient(90deg, #5e83fb, #c054ff, #ea5cbe, #c054ff, #5e83fb)"
      : "#E0E0E0"};
  background-size: ${({ isActive }) => (isActive ? "200% 100%" : "auto")};
  cursor: ${({ isActive }) => (isActive ? "pointer" : "default")};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
  transition: all 0.2s ease;
  animation: ${({ isActive }) =>
    isActive
      ? css`
          ${gradientMove} 3s linear infinite
        `
      : "none"};

  &:hover {
    opacity: ${({ isActive }) => (isActive ? 0.9 : 0.7)};
  }
`;

interface ChatbotInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

const ChatbotInput: React.FC<ChatbotInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <InputContainer>
      <StyledInput
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Chat message input"
      />
      <SendButton
        isActive={!!message.trim()}
        onClick={handleSend}
        disabled={!message.trim()}
        aria-label="Send message"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SendButton>
    </InputContainer>
  );
};

export default ChatbotInput;

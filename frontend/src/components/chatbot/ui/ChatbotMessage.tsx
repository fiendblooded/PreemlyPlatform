import React from "react";
import styled from "styled-components";

// Message types
export enum MessageType {
  USER = "user",
  BOT = "bot",
  SYSTEM = "system",
}

// Button option type for interactive messages
export interface ButtonOption {
  text: string;
  value: string;
  action?: string;
  primary?: boolean;
}

// Message container with different styling based on message type
const MessageContainer = styled.div<{ type: MessageType }>`
  display: flex;
  flex-direction: ${({ type }) =>
    type === MessageType.USER ? "row-reverse" : "row"};
  margin-bottom: 16px;
  max-width: 100%;
`;

const Avatar = styled.div<{ type: MessageType }>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ type }) =>
    type === MessageType.USER ? "0 0 0 8px" : "0 8px 0 0"};
  background: ${({ type }) =>
    type === MessageType.USER
      ? "#4A90E2"
      : type === MessageType.BOT
      ? "linear-gradient(90deg, #5e83fb, #c054ff, #ea5cbe)"
      : "#6E6E6E"};
  flex-shrink: 0;
`;

const MessageBubble = styled.div<{ type: MessageType }>`
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  background-color: ${({ type }) =>
    type === MessageType.USER
      ? "#4A90E2"
      : type === MessageType.SYSTEM
      ? "#6E6E6E"
      : "#F0F0F0"};
  color: ${({ type }) => (type === MessageType.BOT ? "#333" : "#FFF")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const Timestamp = styled.div`
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  text-align: right;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 16px;
  border: none;
  background: ${({ primary }) =>
    primary ? "linear-gradient(90deg, #5e83fb, #c054ff, #ea5cbe)" : "#f0f0f0"};
  color: ${({ primary }) => (primary ? "white" : "#333")};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
`;

// Props interface
interface ChatbotMessageProps {
  message: string;
  type: MessageType;
  timestamp?: Date;
  options?: ButtonOption[];
  onOptionClick?: (option: ButtonOption) => void;
}

const ChatbotMessage: React.FC<ChatbotMessageProps> = ({
  message,
  type,
  timestamp,
  options,
  onOptionClick,
}) => {
  // Format timestamp if provided
  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <MessageContainer type={type}>
      <Avatar type={type}>
        {type === MessageType.USER ? (
          // User avatar icon
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Bot avatar icon
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Avatar>
      <div>
        <MessageBubble type={type}>
          {message}
          {options && options.length > 0 && (
            <ButtonsContainer>
              {options.map((option, index) => (
                <ActionButton
                  key={index}
                  primary={option.primary}
                  onClick={() => onOptionClick && onOptionClick(option)}
                >
                  {option.text}
                </ActionButton>
              ))}
            </ButtonsContainer>
          )}
        </MessageBubble>
        {timestamp && <Timestamp>{formattedTime}</Timestamp>}
      </div>
    </MessageContainer>
  );
};

export default ChatbotMessage;

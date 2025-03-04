import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import ChatbotMessage, { MessageType, ButtonOption } from "./ChatbotMessage";
import ChatbotInput from "./ChatbotInput";
import { sendMessage } from "../../../services/chatbotService";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../../../components/auth/useAxiosWithAuth";

// Container for the entire chatbot window
const WindowContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
`;

// Gradient animation for the header
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

// Header with title and close button
const Header = styled.div`
  background: linear-gradient(
    90deg,
    #5e83fb,
    #c054ff,
    #ea5cbe,
    #c054ff,
    #5e83fb
  );
  background-size: 300% 100%;
  animation: ${gradientMove} 15s ease infinite;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

// Toggle switch for AI/Guided mode
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ToggleLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: rgba(255, 255, 255, 0.8);
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.4s;
  border-radius: 10px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

// Messages container with scrolling
const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c054ff;
    border-radius: 3px;
  }
`;

// Loading animation
const loadingDotAnimation = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #f0f0f0;
  align-self: flex-start;
  margin-bottom: 16px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #c054ff;
  border-radius: 50%;
  margin: 0 3px;
  animation: ${loadingDotAnimation} 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

// Mode badge
const ModeBadge = styled.span`
  font-size: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
`;

// Props interface
interface ChatbotWindowProps {
  onClose: () => void;
}

// Message interface
interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  options?: ButtonOption[];
}

// Function to generate a unique ID
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ onClose }) => {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Navigation hook
  const navigate = useNavigate();
  // State for session ID
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  // State for AI mode
  const [useAI, setUseAI] = useState<boolean>(true);
  // Get authenticated axios instance at the component level
  const axiosInstance = useAxiosWithAuth();

  // Function to add a message
  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Function to handle sending a message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateUniqueId("user"),
      content: text,
      type: MessageType.USER,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Show loading
    setIsLoading(true);

    try {
      // Send message to chatbot service using the axios instance from the component
      const response = await sendMessage(
        {
          message: text,
          sessionId,
          useAI,
        },
        axiosInstance
      );

      // Update session ID
      setSessionId(response.sessionId);

      // Handle special actions
      if (
        response.action === "NAVIGATE_TO_EVENT" &&
        response.data &&
        "eventId" in response.data &&
        typeof response.data.eventId === "string"
      ) {
        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
        };
        addMessage(botMessage);

        // Wait a moment before navigating
        setTimeout(() => {
          const eventId = response.data?.eventId as string;
          navigate(`/events/${eventId}`);
        }, 2000);
      } else {
        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
          options: response.options,
        };
        addMessage(botMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueId("system"),
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
        type: MessageType.SYSTEM,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      // Hide loading
      setIsLoading(false);
    }
  };

  // Function to handle button option click
  const handleOptionClick = async (option: ButtonOption) => {
    try {
      // Show loading
      setIsLoading(true);

      // Send action to chatbot service using the axios instance from the component
      const response = await sendMessage(
        {
          message: option.text,
          action: option.action,
          actionValue: option.value,
          sessionId,
          useAI,
        },
        axiosInstance
      );

      // Update session ID
      setSessionId(response.sessionId);

      // Handle special actions
      if (
        response.action === "NAVIGATE_TO_EVENT" &&
        response.data &&
        "eventId" in response.data &&
        typeof response.data.eventId === "string"
      ) {
        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
        };
        addMessage(botMessage);

        // Wait a moment before navigating
        setTimeout(() => {
          const eventId = response.data?.eventId as string;
          navigate(`/events/${eventId}`);
          // Close the chatbot window after navigation
          onClose();
        }, 2000);
      } else if (option.action === "TOGGLE_MODE") {
        // Toggle AI mode
        setUseAI(!useAI);

        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
          options: response.options,
        };
        addMessage(botMessage);
      } else {
        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
          options: response.options,
        };
        addMessage(botMessage);
      }
    } catch (error) {
      console.error("Error handling option click:", error);
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueId("system"),
        content:
          "Sorry, I'm having trouble processing your request. Please try again later.",
        type: MessageType.SYSTEM,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      // Hide loading
      setIsLoading(false);
    }
  };

  // Function to handle toggle change
  const handleToggleChange = async (newMode: boolean) => {
    setUseAI(newMode);

    if (sessionId) {
      setIsLoading(true);

      try {
        // Send toggle action to chatbot service using the axios instance from the component
        const response = await sendMessage(
          {
            message: "",
            action: "TOGGLE_MODE",
            sessionId,
            useAI: newMode,
          },
          axiosInstance
        );

        // Update session ID
        setSessionId(response.sessionId);

        // Add bot message
        const botMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
          options: response.options,
        };
        addMessage(botMessage);
      } catch (error) {
        console.error("Error toggling mode:", error);
        // Add error message
        const errorMessage: Message = {
          id: generateUniqueId("system"),
          content: "Sorry, I couldn't switch modes. Please try again.",
          type: MessageType.SYSTEM,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } finally {
        // Hide loading
        setIsLoading(false);
      }
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chat
  const initializeChat = async () => {
    if (!sessionId) {
      setIsLoading(true);
      try {
        // Get initial message using the axios instance from the component
        const response = await sendMessage(
          { message: "", useAI },
          axiosInstance
        );
        setSessionId(response.sessionId);

        // Add welcome message
        const welcomeMessage: Message = {
          id: generateUniqueId("bot"),
          content: response.message,
          type: MessageType.BOT,
          timestamp: new Date(),
          options: response.options,
        };
        addMessage(welcomeMessage);
      } catch (error) {
        console.error("Error initializing chat:", error);
        // Add error message
        const errorMessage: Message = {
          id: generateUniqueId("system"),
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
          type: MessageType.SYSTEM,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initialize chat on first render
  useEffect(() => {
    initializeChat();
  }, []);

  return (
    <WindowContainer>
      <Header>
        <HeaderTitle>
          Preembot Assistant
          {/* <ModeBadge>{useAI ? "AI Mode" : "Guided Mode"}</ModeBadge> */}
        </HeaderTitle>
        <HeaderControls>
          <ToggleContainer>
            <ToggleLabel>Guided</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={useAI}
                onChange={(e) => handleToggleChange(e.target.checked)}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <ToggleLabel>AI</ToggleLabel>
          </ToggleContainer>
          <CloseButton onClick={onClose}>×</CloseButton>
        </HeaderControls>
      </Header>
      <MessagesContainer>
        {messages.map((message) => (
          <ChatbotMessage
            key={message.id}
            message={message.content}
            type={message.type}
            timestamp={message.timestamp}
            options={message.options}
            onOptionClick={handleOptionClick}
          />
        ))}
        {isLoading && (
          <LoadingContainer>
            <Dot />
            <Dot />
            <Dot />
          </LoadingContainer>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <ChatbotInput
        onSendMessage={handleSendMessage}
        placeholder="Type your message..."
      />
    </WindowContainer>
  );
};

export default ChatbotWindow;

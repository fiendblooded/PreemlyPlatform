import { useState } from "react";
import styled, { keyframes } from "styled-components";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 70px;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
`;

const ToastMessage = styled.div<{ isExiting: boolean; type: ToastType }>`
  background-color: #323232; /* Dark background */
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  border: 5px solid;
  border-color: ${({ type }) =>
    type === ToastType.SUCCESS
      ? "#4CAF50"
      : type === ToastType.ERROR
      ? "#F44336"
      : "#2196F3"};
  animation: ${({ isExiting }) => (isExiting ? fadeOut : fadeIn)} 0.3s forwards;
`;

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  const addToast = (message: string, type: ToastType = ToastType.INFO) => {
    const id = ++toastId;
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      return newToasts.length > 10 ? newToasts.slice(1) : newToasts;
    });

    if (!isExiting) {
      setTimeout(() => {
        setIsExiting(true);

        setTimeout(() => {
          setToasts([]);
          setIsExiting(false);
        }, 300); // Delay for fade-out animation
      }, 5000); // Toast duration for all
    }
  };

  const Toasts = () => (
    <ToastContainer>
      {toasts.map(({ id, message, type }) => (
        <ToastMessage key={id} isExiting={isExiting} type={type}>
          {message}
        </ToastMessage>
      ))}
    </ToastContainer>
  );

  return { addToast, Toasts };
};

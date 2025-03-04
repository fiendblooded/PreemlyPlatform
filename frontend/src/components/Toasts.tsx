import { useState } from "react";
import styled, { keyframes, css } from "styled-components";

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
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
`;

const ToastMessage = styled.div<{ isExiting: boolean; type: ToastType }>`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  color: #2c2c2c;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  font-weight: 500;
  min-width: 300px;
  max-width: 400px;
  border-left: 4px solid;
  border-left-color: ${({ type }) =>
    type === ToastType.SUCCESS
      ? "rgb(107, 61, 223)"
      : type === ToastType.ERROR
      ? "#dc3545"
      : "#00aef0"};
  animation: ${({ isExiting }) =>
    isExiting
      ? css`
          ${fadeOut} 0.3s forwards
        `
      : css`
          ${fadeIn} 0.3s forwards
        `};

  svg {
    width: 20px;
    height: 20px;
    color: ${({ type }) =>
      type === ToastType.SUCCESS
        ? "rgb(107, 61, 223)"
        : type === ToastType.ERROR
        ? "#dc3545"
        : "#00aef0"};
  }
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
          {type === ToastType.SUCCESS && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {type === ToastType.ERROR && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {type === ToastType.INFO && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {message}
        </ToastMessage>
      ))}
    </ToastContainer>
  );

  return { addToast, Toasts };
};

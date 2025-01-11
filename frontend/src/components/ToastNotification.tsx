import styled from "styled-components";

const ToastWrapper = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #9370db; /* Purple gradient */
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
  z-index: 1000; /* Ensure it stays above other elements */
`;

interface ToastNotificationProps {
  message: string | null;
  visible: boolean;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  visible,
}) => {
  if (!message) return null;

  return <ToastWrapper visible={visible}>{message}</ToastWrapper>;
};

export default ToastNotification;

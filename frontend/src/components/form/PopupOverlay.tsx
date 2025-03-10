import React from "react";
import styled from "styled-components";

const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
  display: ${(props) => (props.visible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PopupContent = styled.div`
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface PopupOverlayProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupOverlay: React.FC<PopupOverlayProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Overlay
      visible={visible}
      onClick={() => {
        onClose();
      }}
    >
      <PopupContent>{children}</PopupContent>
    </Overlay>
  );
};

export default PopupOverlay;

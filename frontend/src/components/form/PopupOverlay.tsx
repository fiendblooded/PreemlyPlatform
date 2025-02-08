import React from "react";
import styled from "styled-components";

const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
  display: ${(props) => (props.visible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PopupContent = styled.div`
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px; /* Set a max-width to control layout on larger screens */

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
    <Overlay visible={visible} onClick={onClose}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        {children}
      </PopupContent>
    </Overlay>
  );
};

export default PopupOverlay;

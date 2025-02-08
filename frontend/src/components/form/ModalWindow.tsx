import React from "react";
import styled from "styled-components";
import PopupOverlay from "./PopupOverlay";

const QuestionText = styled.p`
  font-size: 1.2rem;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  color: #fff;

  &:first-child {
    background-color: #4caf50;
  }

  &:first-child:hover {
    background-color: #388e3c;
  }

  &:last-child {
    background-color: #e7514c;
  }

  &:last-child:hover {
    background-color: #c62828;
  }
`;

interface ModalWindowProps {
  visible: boolean;
  question: string;
  answerOne: {
    name: string;
    onClick: () => void;
  };
  answerTwo: {
    name: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const ModalWindow: React.FC<ModalWindowProps> = ({
  visible,
  question,
  answerOne,
  answerTwo,
  onClose,
}) => {
  return (
    <PopupOverlay visible={visible} onClose={onClose}>
      <QuestionText>{question}</QuestionText>
      <ButtonContainer>
        <ModalButton onClick={answerOne.onClick}>{answerOne.name}</ModalButton>
        <ModalButton onClick={answerTwo.onClick}>{answerTwo.name}</ModalButton>
      </ButtonContainer>
    </PopupOverlay>
  );
};

export default ModalWindow;

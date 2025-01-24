import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const DropdownContainer = styled.div`
  position: relative;
  width: 320px;
`;

const DropdownHeader = styled.div`
  padding: 12px;
  font-size: 1rem;
  background-color: #1e1e2f;
  color: #f5f5f5;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: #6c63ff;
  }

  &:focus {
    outline: none;
    border-color: #6c63ff;
    box-shadow: 0 0 6px rgba(108, 99, 255, 0.7);
  }
`;

const DropdownList = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #1e1e2f;
  color: #f5f5f5;
  border: 2px solid #4a4a6a;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 100;
`;

const DropdownListItem = styled.div`
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2a2768;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #4a4a6a;
  }
`;

const CaretIcon = styled.span<{ isOpen?: boolean }>`
  margin-left: 10px;
  border: solid #f5f5f5;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 5px;
  transform: rotate(45deg);
  transition: transform 0.3s ease;

  ${(props) => props.isOpen && `transform: rotate(-135deg);`}
`;

interface DropdownProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if the user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownHeader onClick={() => setIsOpen(!isOpen)}>
        {selected || "Select an option"}
        <CaretIcon isOpen={isOpen} />
      </DropdownHeader>
      <DropdownList isOpen={isOpen}>
        {options.map((option, index) => (
          <DropdownListItem
            key={index}
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </DropdownListItem>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default Dropdown;

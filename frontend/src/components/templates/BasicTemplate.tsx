import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SearchIcon } from "../Events";
import ManualQR from "../../manualqr.png";
// Colors from Preemly's design system
const COLORS = {
  primary: "#8E66EE",
  primaryHover: "#B499F7",
  secondary: "#F4C430",
  secondaryHover: "#FFC107",
  neutralBg: "#F5F5F5",
  neutralText: "#1A1A1A",
  border: "#D9D9D9",
  inputBg: "#FFFFFF",
  inputBorder: "#A3A3A3",
  danger: "#DC3D4B",
  toggleOff: "#3B3B3B", // Background when toggle is off
  toggleOn: "#68D5FF", // Light blue when toggle is on
  darkBg: "#1E1E1E", // Dark mode background
};

// 🏗️ Layout Container (Flex-Row)
const TemplateContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 24px;
  background: ${COLORS.neutralBg};
  color: ${COLORS.neutralText};
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;

// 📩 Left: Preview Section
const PreviewSection = styled.div`
  width: 20%;
  height: 50%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: ${COLORS.inputBg};
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 🛠️ Right: Controls Section
const ControlsSection = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: ${COLORS.darkBg};
  color: white;
  border-radius: 12px;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TextInput = styled.input`
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 90%;
  font-family: Axiforma, sans-serif;
  font-size: 16px;

  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
  }
`;

// Toggle Switch
const ToggleContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  width: 90%;
  gap: 12px;
  padding: 10px;
  background: ${COLORS.toggleOff};
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;

  ${({ active }: { active: boolean }) =>
    active &&
    `
      background: ${COLORS.toggleOn};
      color: white;
    `}

  &:hover {
    opacity: 0.9;
  }
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: black;
`;

const QRCode = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 6px;
  margin-top: 12px;
`;

const BlockDescription = styled.p`
  font-size: 12px;
  color: ${COLORS.neutralText};
  opacity: 0.8;
  margin-top: 4px;
`;

const Button = styled.button`
  margin-top: 16px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  background: ${COLORS.secondary};
  color: ${COLORS.neutralText};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  width: 100%;
  &:hover {
    background: ${COLORS.secondaryHover};
  }
`;

// 🌟 React Component
const EventTemplate: React.FC<{
  onSave: (html: string) => void;
  eventTitle: string;
  eventDescription: string;
  guestName: string;
  QRCodeImg: string;
}> = ({ onSave, eventTitle, eventDescription, guestName, QRCodeImg }) => {
  const [emailTitle, setEmailTitle] = useState(eventTitle);
  const [description, setDescription] = useState(eventDescription);
  const [blocks, setBlocks] = useState<{ [key: string]: boolean }>({
    schedule: true,
    dining: true,
    parking: true,
  });

  const [blockDescriptions, setBlockDescriptions] = useState({
    schedule: "Plan your event schedule easily.",
    dining: "Check out available dining options.",
    parking: "Find the best parking spots.",
  });

  const toggleBlock = (block: keyof typeof blocks) => {
    setBlocks((prev) => ({ ...prev, [block]: !prev[block] }));
  };

  useEffect(() => {
    const generateEmailHtml = () => {
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black; width: 100%; max-width: 600px;">
          <h2 style="text-align: center; font-size: 24px;">Welcome to ${emailTitle}, ${guestName}</h2>
          <p>{{date+time}}</p>
          <p>${description}</p>
          <div style="text-align: center; background: #f5f5f5; padding: 12px; border-radius: 8px;">
            <img src="${QRCodeImg}" alt="QR Code" style="width: 150px; height: 150px;" />
          </div>
          ${blocks.schedule ? `<p>${blockDescriptions.schedule}</p>` : ""}
          ${blocks.dining ? `<p>${blockDescriptions.dining}</p>` : ""}
          ${blocks.parking ? `<p>${blockDescriptions.parking}</p>` : ""}
        </div>
      `;
    };
    onSave(generateEmailHtml());
  }, [
    emailTitle,
    description,
    blocks,
    blockDescriptions,
    guestName,
    QRCodeImg,
    onSave,
  ]);

  return (
    <TemplateContainer>
      {/* 📩 Left: Live Preview */}
      <PreviewSection>
        <h2>{emailTitle}</h2>
        <p>{description}</p>
        <QRCode src={ManualQR} alt="QR Code" />
        {blocks.schedule && (
          <>
            <p>📅 Event Schedule</p>
            <BlockDescription>{blockDescriptions.schedule}</BlockDescription>
          </>
        )}
        {blocks.dining && (
          <>
            <p>🍽️ Dining Options</p>
            <BlockDescription>{blockDescriptions.dining}</BlockDescription>
          </>
        )}
        {blocks.parking && (
          <>
            <p>🚗 Parking Information</p>
            <BlockDescription>{blockDescriptions.parking}</BlockDescription>
          </>
        )}
      </PreviewSection>

      {/* 🛠️ Right: Controls */}
      <ControlsSection>
        <SectionTitle>Edit Email</SectionTitle>
        <TextInput
          value={emailTitle}
          onChange={(e) => setEmailTitle(e.target.value)}
          placeholder="Enter event title"
        />
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
        />

        <SectionTitle>Additional sections</SectionTitle>
        {Object.keys(blocks).map((block) => (
          <ToggleContainer
            key={block}
            active={blocks[block]}
            onClick={() => toggleBlock(block as keyof typeof blocks)}
          >
            <SearchIcon /> {/* Placeholder icon, replace with actual */}
            <ToggleLabel>
              {block.charAt(0).toUpperCase() + block.slice(1)}
            </ToggleLabel>
          </ToggleContainer>
        ))}

        <Button onClick={() => onSave(emailTitle)}>Save</Button>
      </ControlsSection>
    </TemplateContainer>
  );
};

export default EventTemplate;

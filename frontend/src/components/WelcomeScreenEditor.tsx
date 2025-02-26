import React, { useState } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { PrimaryButton } from "./EventGuestsEditor";

// Styled components
const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 16px;
  width: calc(90% - 32px);
  margin: 20px auto;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: stretch;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Form = styled.div`
  display: flex;
  width: 35%;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #f8f9fc;
  border-radius: 12px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Preview = styled.div<{
  backgroundcolor: string;
  textcolor: string;
}>`
  flex: 1;
  min-height: 400px;
  display: flex;
  font-size: 32px;
  font-weight: 600;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: ${(props) => props.backgroundcolor};
  color: ${(props) => props.textcolor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 12px;
  display: block;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const ThemeButton = styled.button<{
  bgColor: string;
  textColor: string;
  isSelected: boolean;
}>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 3px solid ${(props) => (props.isSelected ? "#6b3ddf" : "transparent")};
  box-shadow: ${(props) =>
    props.isSelected
      ? "0 4px 8px rgba(107, 61, 223, 0.3)"
      : "0 2px 4px rgba(0, 0, 0, 0.1)"};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      ${(props) => props.bgColor} 0%,
      ${(props) => props.bgColor} 50%,
      ${(props) => props.textColor} 50%,
      ${(props) => props.textColor} 100%
    );
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ToggleLabel = styled.span`
  font-weight: 500;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ToggleSwitch = styled.input.attrs({ type: "checkbox" })`
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: #ccc;
  border-radius: 10px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:checked {
    background-color: rgb(107, 61, 223);
  }

  &::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;

    ${(props) =>
      props.checked &&
      `
      left: 22px;
    `}
  }
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 20px;
  color: #2c2c2c;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: rgb(107, 61, 223);
  }
`;

// Helper function to calculate luminance for contrast
const getLuminance = (hexColor: string) => {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

interface Event {
  _id: string;
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
  };
}

// Define color themes with good contrast
const colorThemes = [
  { name: "Blue & White", bgColor: "#1E88E5", textColor: "#FFFFFF" },
  { name: "Dark Green & Yellow", bgColor: "#1B5E20", textColor: "#FFEB3B" },
  { name: "Purple & White", bgColor: "#2A2768", textColor: "#FFFFFF" },
  { name: "Dark & Light", bgColor: "#212121", textColor: "#F5F5F5" },
  { name: "Teal & White", bgColor: "#00897B", textColor: "#FFFFFF" },
  { name: "Orange & Black", bgColor: "#FF9800", textColor: "#212121" },
  { name: "Red & White", bgColor: "#D32F2F", textColor: "#FFFFFF" },
];

// Component
const WelcomeScreenEditor: React.FC<{ event: Event; refetch: () => void }> = ({
  event,
  refetch,
}) => {
  const axiosInstance = useAxiosWithAuth();

  const [backgroundColor, setBackgroundColor] = useState(
    event.welcomeScreenParams.backgroundColor
  );
  const [textColor, setTextColor] = useState(
    event.welcomeScreenParams.textColor
  );
  const [isManualCheckin, setManualCheckin] = useState(
    event.welcomeScreenParams.isManualCheckin
  );
  const [isGdpr, setGdpr] = useState(event.welcomeScreenParams.isGdpr);
  const [isUpdating, setIsUpdating] = useState(false);

  // Find the selected theme index
  const selectedThemeIndex = colorThemes.findIndex(
    (theme) =>
      theme.bgColor === backgroundColor && theme.textColor === textColor
  );

  const handleThemeSelect = (bgColor: string, textColor: string) => {
    setBackgroundColor(bgColor);
    setTextColor(textColor);
  };

  const handleSaveLocation = async () => {
    setIsUpdating(true);

    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        welcomeScreenParams: {
          backgroundColor,
          textColor,
          isManualCheckin,
          isGdpr,
          videoUrl: "",
        },
      });
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location.");
    } finally {
      setIsUpdating(false);
    }

    refetch();
  };

  return (
    <Container>
      <SectionTitle>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 16V8M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Welcome Screen Settings
      </SectionTitle>
      <ContentContainer>
        <Preview backgroundcolor={backgroundColor} textcolor={textColor}>
          Welcome, User1
        </Preview>
        <Form>
          <div>
            <Label>Choose a Theme</Label>
            <ThemeGrid>
              {colorThemes.map((theme, index) => (
                <ThemeButton
                  key={index}
                  bgColor={theme.bgColor}
                  textColor={theme.textColor}
                  isSelected={
                    theme.bgColor === backgroundColor &&
                    theme.textColor === textColor
                  }
                  onClick={() =>
                    handleThemeSelect(theme.bgColor, theme.textColor)
                  }
                  title={theme.name}
                />
              ))}
            </ThemeGrid>
          </div>

          <ToggleContainer>
            <ToggleLabel>Manual Check-in</ToggleLabel>
            <ToggleSwitch
              checked={isManualCheckin}
              onChange={() => setManualCheckin(!isManualCheckin)}
            />
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>GDPR Compliance</ToggleLabel>
            <ToggleSwitch checked={isGdpr} onChange={() => setGdpr(!isGdpr)} />
          </ToggleContainer>
          <PrimaryButton
            onClick={handleSaveLocation}
            disabled={
              isUpdating ||
              (event.welcomeScreenParams.backgroundColor === backgroundColor &&
                event.welcomeScreenParams.textColor === textColor &&
                event.welcomeScreenParams.isManualCheckin === isManualCheckin &&
                event.welcomeScreenParams.isGdpr === isGdpr)
            }
          >
            {isUpdating ? "Saving..." : "Save"}
          </PrimaryButton>
        </Form>
      </ContentContainer>
    </Container>
  );
};

export default WelcomeScreenEditor;

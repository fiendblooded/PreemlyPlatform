import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { PrimaryButton } from "./EventDetail";

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
  justify-content: space-between;
`;

const Form = styled.div`
  display: flex;
  width: 30%;
  flex-direction: column;
  gap: 16px;
  color: black;
  margin-bottom: 10px;
  align-items: center;
`;
const Preview = styled.div<{ backgroundcolor: string; textcolor: string }>`
  width: 65%;
  height: 340px;
  display: flex;
  font-size: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: ${(props) => props.backgroundcolor};
  color: ${(props) => props.textcolor};
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ColorCircle = styled.div<{ color: string }>`
  width: 90%;
  height: 36px;
  border-radius: 4px;
  background-color: ${(props) => props.color};
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ColorOptionsPanel = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 8px;
  z-index: 10403603460346;
`;

const OptionCircle = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: ${(props) => props.color};
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const ToggleContainer = styled.div`
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const ToggleLabel = styled.span`
  font-weight: bold;
`;

const ToggleSwitch = styled.input.attrs({ type: "checkbox" })`
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

interface Event {
  _id: string;
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
  };
}

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

  const [showBgColorOptions, setShowBgColorOptions] = useState(false);
  const [showTextColorOptions, setShowTextColorOptions] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

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

  const predefinedColors = [
    "#00aef0",
    "#2A2768",
    "#ffffff",
    "#f5c542",
    "#6b3ddf",
  ];

  const predefinedTextColors = [
    "#000000",
    "#2A2768",
    "#ffffff",
    "#f5c542",
    "#6b3ddf",
  ];

  return (
    <Container>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: "10px",
          display: "flex",
          alignItems: "end",
          lineHeight: "24px",
          color: "black",
        }}
      >
        Welcome Screen Settings
      </div>
      <ContentContainer>
        <Preview backgroundcolor={backgroundColor} textcolor={textColor}>
          Welcome, User1
        </Preview>
        <Form>
          <ToggleContainer>
            <Label>Background Color</Label>
            <ColorCircle
              color={backgroundColor}
              onClick={() => setShowBgColorOptions(!showBgColorOptions)}
            >
              {" "}
              {showBgColorOptions && (
                <ColorOptionsPanel>
                  {predefinedColors.map((color) => (
                    <OptionCircle
                      key={color}
                      color={color}
                      onClick={() => {
                        setBackgroundColor(color);
                        setShowBgColorOptions(false);
                      }}
                    />
                  ))}
                </ColorOptionsPanel>
              )}
            </ColorCircle>
          </ToggleContainer>

          <ToggleContainer>
            <Label>Text Color</Label>
            <ColorCircle
              color={textColor}
              onClick={() => setShowTextColorOptions(!showTextColorOptions)}
            >
              {showTextColorOptions && (
                <ColorOptionsPanel>
                  {predefinedTextColors.map((color) => (
                    <OptionCircle
                      key={color}
                      color={color}
                      onClick={() => {
                        setTextColor(color);
                        setShowTextColorOptions(false);
                      }}
                    />
                  ))}
                </ColorOptionsPanel>
              )}
            </ColorCircle>
          </ToggleContainer>

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

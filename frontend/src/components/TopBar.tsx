import React, { useState } from "react";
import styled from "styled-components";
import UserProfile from "./auth/UserProfile";
import { useNavigate } from "react-router-dom";
import EventForm from "./form/EventForm";

// Modern color palette to match sidebar and Events page
const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  shadow: "rgba(0, 0, 0, 0.05)",
};

const TopBarContainer = styled.div`
  width: -webkit-fill-available;
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
  justify-content: space-between;
  background-color: ${colors.backgroundLight};
  padding: 0 32px;
  border-bottom: 1px solid ${colors.borderLight};
  box-shadow: 0 1px 8px ${colors.shadow};
  font-family: "Inter", Axiforma, sans-serif;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  padding: 0;
  letter-spacing: -0.3px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AddEventButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: linear-gradient(
    135deg,
    ${colors.primary} 0%,
    ${colors.primaryHover} 100%
  );
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const ButtonText = styled.div`
  margin: auto 0;
  height: 100%;
  letter-spacing: 0.2px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.backgroundSecondary};
    color: ${colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(-2px);
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

interface TopBarProps {
  sectionTitle: string;
  showBackButton?: boolean; // Optional boolean for showing the back button
}

const TopBar: React.FC<TopBarProps> = ({ sectionTitle, showBackButton }) => {
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  return (
    <TopBarContainer>
      <TitleContainer>
        {showBackButton && (
          <BackButton onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </BackButton>
        )}
        <Title>{sectionTitle}</Title>
      </TitleContainer>
      <RightSection>
        <AddEventButton onClick={() => setIsPopupVisible(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 14.1667V7.5M13.3333 10.8342L6.66667 10.8333M5.83333 2.5V4.16667M14.1667 2.5V4.16667M5.16667 17.5H14.8333C15.7668 17.5 16.2335 17.5 16.59 17.3183C16.9036 17.1586 17.1586 16.9036 17.3183 16.59C17.5 16.2335 17.5 15.7668 17.5 14.8333V6.83333C17.5 5.89991 17.5 5.4332 17.3183 5.07668C17.1586 4.76308 16.9036 4.50811 16.59 4.34832C16.2335 4.16667 15.7668 4.16667 14.8333 4.16667H5.16667C4.23325 4.16667 3.76654 4.16667 3.41002 4.34832C3.09641 4.50811 2.84144 4.76308 2.68166 5.07668C2.5 5.4332 2.5 5.89991 2.5 6.83333V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5Z"
              stroke="currentcolor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <ButtonText>Add event</ButtonText>
        </AddEventButton>
        <UserProfile />
      </RightSection>
      {isPopupVisible && (
        <EventForm
          onClose={() => setIsPopupVisible(false)} // Close popup when done
        />
      )}
    </TopBarContainer>
  );
};

export default TopBar;

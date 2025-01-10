import React from "react";
import styled from "styled-components";
import UserProfile from "./auth/UserProfile";
import { useNavigate } from "react-router-dom";

const TopBarContainer = styled.div`
  width: -webkit-fill-available;
  position: fixed;
  display: flex;
  align-items: center;
  height: 64px;
  justify-content: space-between;
  background-color: white; /* Updated to match the dark background */
  padding: 0px 10px;
  border-bottom: 1.5px solid rgb(205, 205, 205); /* Subtle border for separation */
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  padding-left: 18px;
  color: black; /* White text for visibility */
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UpgradeButton = styled.button`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  text-align: center;
  width: 180px;
  padding: 5px 10px;
  padding-top: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #0b0e13; /* Dark text for contrast */
  background-color: #fcd535; /* Matches the yellow accent color */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  line-height: 24px;
  &:hover {
    background-color: #e6bf30; /* Slightly darker shade for hover */
  }
`;
const ButtonText = styled.div`
  margin: auto 0;
  height: 100%;
`;
const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: black;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface TopBarProps {
  sectionTitle: string;
  showBackButton?: boolean; // Optional boolean for showing the back button
}

const TopBar: React.FC<TopBarProps> = ({ sectionTitle, showBackButton }) => {
  const navigate = useNavigate();
  return (
    <TopBarContainer>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
      </div>
      <RightSection>
        <UpgradeButton onClick={() => navigate("/events/create-new-event")}>
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
        </UpgradeButton>
        <UserProfile />
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;

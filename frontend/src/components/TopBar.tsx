import React from "react";
import styled from "styled-components";
import UserProfile from "./auth/UserProfile";

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 80px;
  justify-content: space-between;
  background-color: #0b0e13; /* Updated to match the dark background */
  padding: 0px 10px;
  border-bottom: 1px solid #333333; /* Subtle border for separation */
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  padding-left: 18px;
  color: #ffffff; /* White text for visibility */
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UpgradeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  width: 180px;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 500;
  color: #0b0e13; /* Dark text for contrast */
  background-color: #fcd535; /* Matches the yellow accent color */
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #e6bf30; /* Slightly darker shade for hover */
  }
`;

const IconButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background-color: #333333; /* Matches the menu's hover color */
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background-color: #444444; /* Slightly lighter hover effect */
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfileImage = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
`;

const ProfileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff; /* White text for better visibility */
`;

interface TopBarProps {
  sectionTitle: string;
}

const TopBar: React.FC<TopBarProps> = ({ sectionTitle }) => {
  return (
    <TopBarContainer>
      <Title>{sectionTitle}</Title>
      <RightSection>
        <UpgradeButton>Upgrade Now</UpgradeButton>
        <UserProfile />
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;

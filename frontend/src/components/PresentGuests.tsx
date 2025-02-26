import React from "react";
import styled from "styled-components";
import { Guest } from "../types";

type Props = {
  guests: Guest[];
};

const colors = ["#FF6F61", "#6B5B95", "#88B04B"];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const GuestContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const GuestCircle = styled.div<{ isRemaining?: boolean; bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ isRemaining, bgColor }) =>
    isRemaining ? "rgba(255, 255, 255, 0.8)" : bgColor || "#007bff"};
  color: ${({ isRemaining }) => (isRemaining ? "#292768" : "#fff")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  border: ${({ isRemaining }) => (isRemaining ? "1px solid #6c757d" : "none")};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Description = styled.div`
  display: flex;
  font-size: 15px;
  margin-top: 12px;
  font-style: italic;
  justify-content: center;
  text-align: center;
  line-height: 1.4;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
`;

const PresentGuests: React.FC<Props> = ({ guests }) => {
  // Limit to the first 5 guests for displaying initials
  const displayedGuests = guests.slice(0, 3);

  // Get initials from the guests' full names
  const guestInitials = displayedGuests.map((guest) => {
    const names = guest.fullName.split(" ");
    return names.map((name) => name[0]).join("");
  });

  // Extract first names for description
  const firstNames = guests
    .slice(0, 3)
    .map((guest) => guest.fullName.split(" ")[0]);

  // Calculate remaining guests count (if any)
  const totalRemainingCount = guests.length - firstNames.length;

  return (
    <Container>
      <Title>Present Guests</Title>
      <GuestContainer>
        {guestInitials.map((initials, index) => (
          <GuestCircle key={index} bgColor={colors[index % colors.length]}>
            {initials}
          </GuestCircle>
        ))}

        {guests.length > 3 && (
          <GuestCircle isRemaining>+{guests.length - 3}</GuestCircle>
        )}
      </GuestContainer>
      <Description>
        {firstNames.length > 0 &&
          `${firstNames.join(", ")} ${
            totalRemainingCount > 0
              ? `and ${totalRemainingCount} more are present`
              : `${firstNames.length === 1 ? "is" : "are"} present`
          }`}
        {firstNames.length === 0 &&
          `No one is present yet out of ${guests.length} guests`}
      </Description>
    </Container>
  );
};

export default PresentGuests;

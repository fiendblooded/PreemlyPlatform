import React from "react";
import styled from "styled-components";
import { Guest } from "../types";

type Props = {
  guests: Guest[];
};

const colors = ["#FF6F61", "#6B5B95", "#88B04B"];

const GuestCircle = styled.div<{ isRemaining?: boolean; bgColor?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ isRemaining, bgColor }) =>
    isRemaining ? "#FFFFFF" : bgColor || "#007bff"};
  color: ${({ isRemaining }) => (isRemaining ? "#292768" : "#fff")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: bold;
  border: ${({ isRemaining }) => (isRemaining ? "1px solid #6c757d" : "none")};
`;

const GuestContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px;
`;
const Description = styled.div`
  display: flex;
  color: white;
  font-size: 14px;
  margin-top: 10px;
  font-style: italic;
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
        {firstNames.length === 0 && "No one is present yet"}
      </Description>
    </Container>
  );
};

export default PresentGuests;

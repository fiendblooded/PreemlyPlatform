import styled, { keyframes } from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";
import EventForm from "./form/EventForm";
import { useState } from "react";

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

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled.div`
  margin-top: 16px;
  height: 100%;
  padding: 0;
`;

const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  & > * {
    animation: ${fadeInRight} 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  & > *:nth-child(1) {
    animation-delay: 0.1s;
  }
  & > *:nth-child(2) {
    animation-delay: 0.15s;
  }
  & > *:nth-child(3) {
    animation-delay: 0.2s;
  }
  & > *:nth-child(4) {
    animation-delay: 0.25s;
  }
  & > *:nth-child(5) {
    animation-delay: 0.3s;
  }
  & > *:nth-child(n + 6) {
    animation-delay: 0.35s;
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(100, 116, 139, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(100, 116, 139, 0.3);
  }
`;

export const MessageContainer = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 64px auto;
  padding: 36px;
  text-align: center;
  background: ${colors.backgroundLight};
  border-radius: 12px;
  box-shadow: 0 4px 20px ${colors.shadow};
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 16px;
  color: ${colors.textSecondary};
  line-height: 1.6;
  font-family: "Inter", Axiforma, sans-serif;
`;

export const CreateLink = styled.a`
  color: ${colors.primary};
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: -1px;
    left: 0;
    background-color: ${colors.primary};
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: ${colors.primaryHover};

    &::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
`;

interface EventListProps {
  events: Event[];
  isFilterQueue: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, isFilterQueue }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  return (
    <Wrapper>
      {events.length === 0 ? (
        <>
          {isFilterQueue ? (
            <MessageContainer>
              You don't have any events yet. <br />
              Click{" "}
              <CreateLink onClick={() => setIsPopupVisible(true)}>
                here
              </CreateLink>{" "}
              to create your first event!
            </MessageContainer>
          ) : (
            <MessageContainer>
              No events found. Try changing filter parameters.
            </MessageContainer>
          )}
        </>
      ) : (
        <ListWrapper>
          {events.map((event) => (
            <EventComponent key={event._id} event={event} />
          ))}
        </ListWrapper>
      )}
      {isPopupVisible && (
        <EventForm
          onClose={() => setIsPopupVisible(false)} // Close popup when done
        />
      )}
    </Wrapper>
  );
};

export default EventList;

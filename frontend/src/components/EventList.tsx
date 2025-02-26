import styled, { keyframes } from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";
import EventForm from "./form/EventForm";
import { useState } from "react";

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
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
  margin-top: 32px;
  height: 100%;
  padding: 0 24px;
`;
const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  & > * {
    animation: ${fadeInRight} 0.4s ease-out backwards;
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

  // overflow-y: auto;
  @media (max-width: 900px) {
    grid-template-columns: repeat(
      3,
      1fr
    ); /* 4 cards per row on medium screens */
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(
      2,
      1fr
    ); /* 2 cards per row on small screens */
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr; /* Full-width cards on very small screens */
  }
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: #d3d3d3 #f5f5f5; /* Scrollbar thumb and track colors */

  &::-webkit-scrollbar {
    width: 8px; /* Scrollbar width */
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5; /* Light background for the track */
    border-radius: 4px; /* Rounded corners */
  }

  &::-webkit-scrollbar-thumb {
    background: #d3d3d3; /* Light grey thumb */
    border-radius: 4px; /* Rounded corners */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #b0b0b0; /* Darker grey on hover */
  }
`;

export const MessageContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 64px auto;
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;

  font-size: 16px;
  color: #666;
  line-height: 1.6;
`;

export const CreateLink = styled.a`
  color: rgb(107, 61, 223);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: rgb(87, 41, 203);
    text-decoration: underline;
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

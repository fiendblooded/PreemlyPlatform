import styled from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";
import EventForm from "./form/EventForm";
import { useState } from "react";

const Wrapper = styled.div`
  margin-top: 20px;
  height: 100%;
`;
const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 equal columns */
  gap: 6% 2%; /* Adjust as needed */

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

const EmptyMessage = styled.div`
  color: black;
  font-size: 1.3rem;
  text-align: center;
  display: flex;
  flex-direction: column;

  a {
    color: purple;
    text-decoration: underline;
  }
`;
export const MessageContainer = styled.div`
  width: 40%;
  margin: auto;
  justify-content: center;
  align-items: center;
  text-align: center;

  font-family: Axiforma, sans-serif;
  font-size: 18px;
  color: #555;
`;

export const CreateLink = styled.a`
  color: #007bff;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  &:hover {
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

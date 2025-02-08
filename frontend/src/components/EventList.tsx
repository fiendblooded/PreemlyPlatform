import styled from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";
import EventForm from "./form/EventForm";
import { useState } from "react";

const Wrapper = styled.div`
  margin-top: 20px;
`;
const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 50px;
  row-gap: 50px; /* Fixed vertical gap between rows */
  width: 100%; /* Ensures the grid spans the full container width */
  padding-bottom: 40px;
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
}
const EventList: React.FC<EventListProps> = ({ events }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  return (
    <Wrapper>
      {events.length === 0 ? (
        <MessageContainer>
          You don't have any events yet. <br />
          Click{" "}
          <CreateLink onClick={() => setIsPopupVisible(true)}>
            here
          </CreateLink>{" "}
          to create your first event!
        </MessageContainer>
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

import styled from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";

const Wrapper = styled.div`
  margin-top: 20px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 55px;
`;

const EmptyMessage = styled.p`
  color: #bbb;
  font-size: 1rem;
  text-align: center;
`;
interface EventListProps {
  events: Event[];
}
const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <Wrapper>
      {events.length === 0 ? (
        <EmptyMessage>No events found.</EmptyMessage>
      ) : (
        <ListWrapper>
          {events.map((event) => (
            <EventComponent key={event._id} event={event} />
          ))}
        </ListWrapper>
      )}
    </Wrapper>
  );
};

export default EventList;

import { useState } from "react";
import styled from "styled-components";
import { Event } from "../types";
import EventComponent from "./EventComponent";

const Wrapper = styled.div`
  margin-top: 20px;
`;

const SearchInput = styled.input`
  width: 99%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 1rem;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #121212;
  color: #f5f5f5;

  &:focus {
    outline: none;
    border-color: #9370db; /* Purple */
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 55px;
  margin-top: 20px;
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents =
    events?.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <Wrapper>
      <SearchInput
        type="text"
        placeholder="Search for an event..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {filteredEvents.length === 0 ? (
        <EmptyMessage>No events found.</EmptyMessage>
      ) : (
        <ListWrapper>
          {filteredEvents.map((event) => (
            <EventComponent key={event._id} event={event} />
          ))}
        </ListWrapper>
      )}
    </Wrapper>
  );
};

export default EventList;

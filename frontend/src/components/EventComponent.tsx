import styled from "styled-components";
import { Event } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

interface EventProps {
  event: Event;
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px; /* Adjust to control the card size */
  height: 400px; /* Adjust height for the poster */
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #121212;
  color: #f5f5f5;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: #0c0c14;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  &:active {
    border-color: #f4c430;
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 180px; /* Fixed height for the poster */
  object-fit: cover; /* Maintain aspect ratio and crop if needed */
  border-radius: 8px;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  color: #f4c430; /* Yellow */
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const Description = styled.p`
  color: #bbb;
  font-size: 0.9rem;
  margin-bottom: 15px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit to 3 lines */
  -webkit-box-orient: vertical;
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GuestCount = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #f5f5f5;

  svg {
    margin-right: 5px;
    color: #9370db; /* Purple */
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EventComponent: React.FC<EventProps> = ({ event }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Card
      onClick={() =>
        navigate(`/events/${event._id}`, {
          state: { from: location.pathname },
        })
      }
    >
      {event.poster ? (
        <Poster src={event.poster} alt={`${event.title} Poster`} />
      ) : (
        <Poster
          src="https://via.placeholder.com/300x180?text=No+Poster"
          alt="No Poster Available"
        />
      )}
      <Title>{event.title}</Title>
      <Description>{event.description}</Description>
      <InfoBar>
        <GuestCount>
          🧑 {event.guests.length}{" "}
          {event.guests.length > 1 ? "Guests" : "Guest"}
        </GuestCount>
      </InfoBar>
    </Card>
  );
};

export default EventComponent;

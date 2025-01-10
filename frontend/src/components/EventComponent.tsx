import styled from "styled-components";
import { Event } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

interface EventProps {
  event: Event;
}

const Card = styled.div<{ isPublished: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px; /* Adjust to control the card size */
  height: 400px; /* Adjust height for the poster */
  // border: 1px solid rgb(214, 214, 214);
  border-top: 4px solid ${(props) => (props.isPublished ? "#83d4b7" : "grey")};
  border-radius: 4px;
  background-color: #ffffff;
  color: #f5f5f5;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  &:active {
    border-color: #f4c430;
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 150px; /* Fixed height for the poster */
  object-fit: cover; /* Maintain aspect ratio and crop if needed */
  border-radius: 8px;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  color: black; /* Yellow */
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const Description = styled.p`
  color: rgb(102, 102, 102);
  font-size: 0.9rem;
  margin-bottom: 15px;
  flex-grow: 1;
  margin-top: 0px;
  overflow-y: auto; /* Use auto instead of scroll */
  max-height: 130px;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit to 3 lines */
  -webkit-box-orient: vertical;

  /* Scrollbar styling */
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

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1.5px solid rgb(205, 205, 205); /* Subtle border for separation */
`;

const GuestCount = styled.div`
  display: flex;
  align-items: center;
  line-height: 100px;
  font-size: 0.9rem;
  color: black;
  height: 30px;

  svg {
    padding-bottom: 6px;
    margin-right: 5px;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EventComponent: React.FC<EventProps> = ({ event }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Card
      isPublished={!!event.poster}
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 20V18C13 15.2386 10.7614 13 8 13C5.23858 13 3 15.2386 3 18V20H13ZM13 20H21V19C21 16.0545 18.7614 14 16 14C14.5867 14 13.3103 14.6255 12.4009 15.6311M11 7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7C5 5.34315 6.34315 4 8 4C9.65685 4 11 5.34315 11 7ZM18 9C18 10.1046 17.1046 11 16 11C14.8954 11 14 10.1046 14 9C14 7.89543 14.8954 7 16 7C17.1046 7 18 7.89543 18 9Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {event.guests.length} {event.guests.length != 1 ? "Guests" : "Guest"}
        </GuestCount>
        <GuestCount>{new Date(event.date).toLocaleString()}</GuestCount>
      </InfoBar>
    </Card>
  );
};

export default EventComponent;

import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Event } from "../types";
import EventList from "./EventList";
import { useNavigate } from "react-router-dom";
import { CTAButton, MenuButtonText } from "./SideBar";

const PageWrapper = styled.div`
  padding: 0px 20px;
`;

export const Header = styled.h1`
  color: black; /* Purple */
  display: flex;
  justify-content: space-between;
`;

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/events");

      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <PageWrapper>
      <Header>
        Events
        <CTAButton onClick={() => navigate("/events/create-new-event")}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 14.1667V7.5M13.3333 10.8342L6.66667 10.8333M5.83333 2.5V4.16667M14.1667 2.5V4.16667M5.16667 17.5H14.8333C15.7668 17.5 16.2335 17.5 16.59 17.3183C16.9036 17.1586 17.1586 16.9036 17.3183 16.59C17.5 16.2335 17.5 15.7668 17.5 14.8333V6.83333C17.5 5.89991 17.5 5.4332 17.3183 5.07668C17.1586 4.76308 16.9036 4.50811 16.59 4.34832C16.2335 4.16667 15.7668 4.16667 14.8333 4.16667H5.16667C4.23325 4.16667 3.76654 4.16667 3.41002 4.34832C3.09641 4.50811 2.84144 4.76308 2.68166 5.07668C2.5 5.4332 2.5 5.89991 2.5 6.83333V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5Z"
              stroke="currentcolor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <MenuButtonText>Add event</MenuButtonText>
        </CTAButton>
      </Header>

      <EventList events={events} />
    </PageWrapper>
  );
};

export default Events;

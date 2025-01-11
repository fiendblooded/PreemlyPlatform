import { useState, useEffect } from "react";
import styled from "styled-components";
import { Event } from "../types";
import EventList from "./EventList";
import { useNavigate } from "react-router-dom";
import { CTAButton, MenuButtonText } from "./SideBar";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import useAuthSetup from "../useAuthSetup";
import TopBar from "./TopBar";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const ContentWrapper = styled.div`
  padding: 0px 25px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.h1`
  color: #061c3a; /* Purple */
  display: flex;
  font-size: 32px;
  justify-content: space-between;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 300px;
  width: 100%;
`;
const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border-left-color: #f4c430;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
const SearchInput = styled.input`
  width: 300px;
  height: 30px;
  padding: 10px;

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
const EventsCount = styled.div`
  font-size: 24px;
  color: blue;
  padding-bottom: 8px;
`;
const Title = styled.div``;

const Events: React.FC = () => {
  useAuthSetup();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const axiosInstance = useAxiosWithAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axiosInstance.get(`/events`);
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents =
    events?.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  console.log({ events });

  return (
    <PageWrapper>
      <TopBar sectionTitle="Events" />
      <ContentWrapper>
        <Header>
          Your events <EventsCount>({filteredEvents.length})</EventsCount>
          <SearchInput
            type="text"
            placeholder="Search for an event..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
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

        {loading ? (
          <SpinnerContainer>
            <Spinner />{" "}
          </SpinnerContainer>
        ) : (
          <EventList events={filteredEvents} />
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Events;

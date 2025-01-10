import { useState, useEffect } from "react";
import styled from "styled-components";
import { Event } from "../types";
import EventList from "./EventList";
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

export const Header = styled.div`
  margin-top: 20px;
  color: #061c3a; /* Purple */
  display: flex;
  font-size: 28px;
  justify-content: space-between;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 300px;
  width: 100%;
`;
export const Spinner = styled.div`
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
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  max-width: 400px;
`;

export const SearchIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: rgb(137, 137, 137);
  margin-right: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  &:focus {
  }
  &::placeholder {
    color: #aaa;
  }
`;

export const ActiveStatusContainer = styled.div<{ isDetail?: boolean }>`
  margin: 0px;
  margin-top: 80px;
  display: flex;
  ${(props) => props.isDetail && "width: 70%; margin: 20px auto;"}
  gap: 20px;
  border-bottom: 1.5px solid rgb(205, 205, 205); /* Subtle border for separation */
`;
export const ActiveStatusButton = styled.div<{
  isActive: boolean;
  marginLeft?: number;
}>`
  color: ${(props) => (props.isActive ? "black" : "rgb(167, 167, 167)")};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: ${(props) =>
    props.marginLeft != undefined ? props.marginLeft : 28}px;
  border-bottom: 2px solid
    ${(props) => (props.isActive ? "#e6bf30" : "transparent")};

  /* Add smooth transition */
  transition: color 0.3s ease, border-bottom-color 0.3s ease;

  &:hover {
    color: ${(props) => (props.isActive ? "black" : "grey")};
    border-bottom: 2px solid ${(props) => (props.isActive ? "#e6bf30" : "grey")};
  }
`;

const Events: React.FC = () => {
  useAuthSetup();
  const [activeStatus, setActiveStatus] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const axiosInstance = useAxiosWithAuth();
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
        (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        !!event.poster === activeStatus
    ) || [];

  return (
    <PageWrapper>
      <TopBar sectionTitle="Events" />
      <ActiveStatusContainer>
        <ActiveStatusButton
          isActive={activeStatus}
          onClick={() => setActiveStatus(true)}
        >
          Active Events
        </ActiveStatusButton>
        <ActiveStatusButton
          isActive={!activeStatus}
          onClick={() => setActiveStatus(false)}
        >
          Past Events
        </ActiveStatusButton>
      </ActiveStatusContainer>
      <ContentWrapper>
        <Header>
          {filteredEvents.length} {activeStatus ? "Active" : "Past"} event
          {(filteredEvents.length > 1 || filteredEvents.length === 0) && "s"}
          <SearchContainer>
            <SearchIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="rgb(137, 137, 137)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />

            {searchQuery != "" && (
              <svg
                onClick={() => {
                  setSearchQuery("");
                }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 9L15 15M15 9L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="rgb(137, 137, 137)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
          </SearchContainer>
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

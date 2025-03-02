import { useState, useEffect } from "react";
import styled from "styled-components";
import { Event } from "../types";
import EventList from "./EventList";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import useAuthSetup from "../useAuthSetup";
import TopBar from "./TopBar";
import { useAuth0 } from "@auth0/auth0-react";
import { getDateTimeStatus } from "../common/common";
import { useNavigate, useParams } from "react-router-dom";
import EventDetail from "./EventDetail";
import PopupOverlay from "./form/PopupOverlay";

// Modern color palette to match sidebar but with light theme
const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  yellow: "#e6bf30",
  green: "#2a9134",
  blue: "#4F46E5",
  gray: "#64748B",
  shadow: "rgba(0, 0, 0, 0.05)",
};

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.backgroundLight};
  font-family: Axiforma, sans-serif;
`;

export const ContentWrapper = styled.div<{ marginTop?: number }>`
  margin-top: ${(props) => (props.marginTop ? `${props.marginTop}px` : "0px")};
  padding: 0px 32px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 140px);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.2);
    border-radius: 4px;
  }
`;

export const Header = styled.div`
  margin-top: 24px;
  height: 50px;
  color: ${colors.textPrimary};
  display: flex;
  font-size: 24px;
  font-weight: 600;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 20px;
  align-items: center;
  letter-spacing: -0.2px;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 300px;
  width: 100%;
`;

export const Spinner = styled.div`
  border: 4px solid rgba(99, 102, 241, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border-left-color: ${colors.primary};
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.backgroundSecondary};
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  padding: 10px 14px;
  width: calc(20% - 26px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${colors.shadow};

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`;

export const SearchIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: ${colors.textSecondary};
  margin-right: 10px;
  opacity: 0.7;
`;

const SearchInput = styled.input`
  font-family: Axiforma, sans-serif;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: ${colors.textPrimary};
  outline: none;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const ClearButton = styled.div`
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

export const ActiveStatusContainer = styled.div<{ isDetail?: boolean }>`
  margin: 0px;
  margin-top: 10px;
  display: flex;
  ${(props) => props.isDetail && "width: 90%; margin: 20px auto;"}
  gap: 24px;
  max-width: 100%;
  overflow: scroll;
  border-bottom: 1px solid ${colors.borderLight};
  padding: 0 32px 4px;

  /* Hide scrollbar for Webkit browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for Firefox */
  scrollbar-width: none;

  /* Hide scrollbar for IE and Edge */
  -ms-overflow-style: none;
`;

export const ActiveStatusButton = styled.div<{
  isActive: boolean;
  marginLeft?: number;
  borderColor?: string;
}>`
  display: flex;
  align-items: flex-end;
  color: ${(props) =>
    props.isActive ? colors.textPrimary : colors.textSecondary};
  font-size: 15px;
  font-weight: ${(props) => (props.isActive ? "600" : "500")};
  cursor: pointer;
  line-height: 20px;
  padding-bottom: 8px;
  gap: 4px;
  margin-left: ${(props) =>
    props.marginLeft != undefined ? props.marginLeft : 0}px;
  border-bottom: 2px solid
    ${(props) => (props.isActive ? props.borderColor : "transparent")};
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${(props) => props.borderColor};
    transform: scaleX(${(props) => (props.isActive ? 1 : 0)});
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.7;
  }

  &:hover {
    color: ${(props) => (props.isActive ? colors.textPrimary : colors.primary)};

    &::after {
      transform: scaleX(1);
      opacity: ${(props) => (props.isActive ? 1 : 0.3)};
    }
  }
`;

// Make sure the EventList container has room to grow
const EventListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(100, 116, 139, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const StatusCount = styled.span`
  font-weight: 600;
  color: ${colors.primary};
`;

const StatusText = styled.span`
  font-weight: 400;
`;

const Events: React.FC = () => {
  useAuthSetup();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth0();
  const { id } = useParams<{ id: string }>();
  const [activeStatus, setActiveStatus] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const axiosInstance = useAxiosWithAuth();
  const navigate = useNavigate();
  const fetchEvents = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axiosInstance.get(`/events`);
      console.log(response.data.data);
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
  //getDateTimeStatus(event?.date, event?.endDate);
  const filterEvents = (filterStatus: string, searchQuery: string) => {
    let filteredEvents = events;

    if (searchQuery != "") {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus === "All") {
      return filteredEvents;
    } else if (filterStatus === "Upcoming") {
      filteredEvents = filteredEvents.filter(
        (event) =>
          getDateTimeStatus(event?.date, event?.endDate).type === "Upcoming"
      );
    } else if (filterStatus === "Past") {
      filteredEvents = filteredEvents.filter(
        (event) =>
          getDateTimeStatus(event?.date, event?.endDate).type === "Past"
      );
    } else if (filterStatus === "Ongoing") {
      filteredEvents = filteredEvents.filter(
        (event) =>
          getDateTimeStatus(event?.date, event?.endDate).type === "Ongoing"
      );
    }
    return filteredEvents;
  };
  const filteredEvents = filterEvents(activeStatus, searchQuery);
  return (
    <>
      <PageWrapper>
        <TopBar sectionTitle="Events" />

        <ActiveStatusContainer>
          <ActiveStatusButton
            isActive={activeStatus === "All"}
            onClick={() => setActiveStatus("All")}
            borderColor={colors.yellow}
          >
            All Events
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={activeStatus === "Ongoing"}
            onClick={() => setActiveStatus("Ongoing")}
            borderColor={colors.green}
          >
            Ongoing
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={activeStatus === "Upcoming"}
            onClick={() => setActiveStatus("Upcoming")}
            borderColor={colors.blue}
          >
            Upcoming
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={activeStatus === "Past"}
            onClick={() => setActiveStatus("Past")}
            borderColor={colors.gray}
          >
            Past
          </ActiveStatusButton>
        </ActiveStatusContainer>
        <ContentWrapper>
          <Header>
            <>
              <div>
                <StatusCount>{filteredEvents.length}</StatusCount>{" "}
                <StatusText>
                  {activeStatus !== "All"
                    ? activeStatus.toLowerCase()
                    : "total"}{" "}
                  event
                  {(filteredEvents.length > 1 || filteredEvents.length === 0) &&
                    "s"}
                </StatusText>
              </div>
            </>
            <SearchContainer>
              <SearchIcon
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
              />

              {searchQuery !== "" && (
                <ClearButton onClick={() => setSearchQuery("")}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 9L15 15M15 9L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ClearButton>
              )}
            </SearchContainer>
          </Header>

          {loading ? (
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          ) : (
            <EventListContainer>
              <EventList
                events={filteredEvents}
                isFilterQueue={searchQuery === ""}
              />
            </EventListContainer>
          )}
        </ContentWrapper>
      </PageWrapper>
      {id && (
        <PopupOverlay visible={true} onClose={() => navigate("/events")}>
          <EventDetail />
        </PopupOverlay>
      )}
    </>
  );
};

export default Events;

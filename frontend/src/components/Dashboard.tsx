import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
import { PageWrapper, Spinner, SpinnerContainer } from "./Events";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Event } from "../types";
import { getDateTimeStatus, isTablet } from "../common/common";
import { useNavigate } from "react-router-dom";
import TaskList from "./TaskList";
import CalendarBox from "./CalendarBox";
import { MessageContainer, CreateLink } from "./EventList";
import EventForm from "./form/EventForm";

const DashboardContainer = styled.div<{ tabletMode: boolean }>`
  width: 100%;
  height: 100%;
  font-family: Axiforma, sans-serif;
  color: black;
  max-height: 100%;

  display: flex;
  flex-direction: column;
  ${(props) => !props.tabletMode && "justify-content: center;"}

  overflow-y: auto; /* Use auto instead of scroll */
  overflow-x: hidden;
  text-overflow: ellipsis;
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

const HeaderStats = styled.div<{ tabletMode: boolean }>`
  display: flex;
  flex-wrap: wrap; /* Allow wrapping */
  justify-content: space-between;
  margin: 0 auto;
  margin-bottom: 30px;
  width: calc(90% + 40px); /* Simplified from calc */
  gap: 16px;
  ${(props) => props.tabletMode && "margin-top: 20px;"}
`;

const StatBox = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  color: white;
  display: flex;
  flex-direction: row;
  padding: 20px;
  padding-left: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: calc(20% - 16px); /* Adjust for gap */
  font-weight: bold;
  align-items: center;

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    width: calc(25% - 12px); /* 4 items per row */
  }

  @media (max-width: 900px) {
    width: calc(50% - 60px); /* 2 items per row */
  }

  @media (max-width: 600px) {
    width: 100%; /* Full-width on small screens */
  }
`;

const StatBoxContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  margin: auto 0px;
  gap: 4px;
  margin-left: 12px;
  padding-top: 4px;
`;

const StatValue = styled.div`
  font-size: 20px;
  line-height: 24px;
`;

const StatTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
  color: white;
`;

const GraphSection = styled.div<{
  width: number;
  height?: number;
  noMargin?: boolean;
}>`
  width: ${(props) => props.width}%;
  ${(props) => !props.noMargin && "margin: 0px auto;"}

  height: ${(props) => (props.height ? props.height : "25")}%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
`;

const GraphTitle = styled.div`
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 8px;
`;

const ReelContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow-y: hidden;
  border-radius: 8px;
  white-space: nowrap;
  color: black;
  scroll-snap-type: x mandatory; /* Optional for smooth snapping */
`;

const EventBox = styled.div`
  flex: 0 0 22%; /* Each EventBox takes 22% of the width */
  height: 90%;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 10px;
  scroll-snap-align: start; /* Optional for snapping effect */
  border: 3px solid transparent;
  cursor: pointer;
  transition: ease all 0.3s;
  &: hover {
    border-color: #f4c430;
    background-color: rgb(255, 243, 206);
  }
`;

const EventPoster = styled.img`
  width: 100%;
  height: 150px; /* Fixed height for the poster */
  object-fit: cover; /* Maintain aspect ratio and crop if needed */
  border-radius: 8px;
  margin-bottom: 10px;
`;
const EventDetailWrapper = styled.div`
  width: 75%;
  height: 90%;
  margin: auto;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  overflow: hidden;

  /* Responsive style for tablet and mobile */
  @media (max-width: 1024px) {
    width: 100%;
    max-height: 100%;
    height: 100%;
  }
`;

const EventName = styled.div`
  max-width: 100%;
  color: black;
  // overflow: auto;
  // overflow-wrap: break-word;
  // flex-wrap: wrap;
  // text-overflow: ellipsis;
  flex-wrap: wrap;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const EventDate = styled.div`
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
`;

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 50%; /* Use 50% for a perfect circle */
  width: 56px; /* Example fixed width */
  height: 56px; /* Ensure height matches width */
`;
const GraphRow = styled.div`
  display: flex;
  margin: 0px auto;
  height: 54%;
  width: calc(90% + 40px);
  justify-content: space-between;
`;

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosWithAuth();
  const tabletMode = isTablet();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");
        setEvents(response.data.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const calculateStats = () => {
    if (events.length === 0) return null; // Return early if no events are loaded
    const upcomingEvents = events
      .filter(
        (currentEvent) =>
          getDateTimeStatus(currentEvent.date, currentEvent.endDate).type ===
          "Incoming"
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalEvents = events.length;
    const pastEvents = totalEvents - upcomingEvents.length;
    const totalGuests = events.reduce(
      (sum, event) => sum + event.guests.length,
      0
    );
    const checkedInGuests = events.reduce(
      (sum, event) =>
        sum + event.guests.filter((guest) => guest.attendance_status).length,
      0
    );

    return {
      totalEvents,
      upcomingEvents: upcomingEvents,
      pastEvents,
      totalGuests,
      checkedInGuests,
    };
  };

  const calculateAverageAttendance = () => {
    if (events.length === 0) return 0;

    const totalGuests = events.reduce(
      (sum, event) => sum + event.guests.length,
      0
    );
    const checkedInGuests = events.reduce(
      (sum, event) =>
        sum + event.guests.filter((guest) => guest.attendance_status).length,
      0
    );

    return totalGuests === 0
      ? 0
      : Math.round((checkedInGuests / totalGuests) * 100);
  };

  // Only calculate stats when not loading and events are available
  const stats = !loading ? calculateStats() : null;
  console.log({ stats });
  const averageAttendance = !loading ? calculateAverageAttendance() : 0;
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  return (
    <PageWrapper>
      <TopBar sectionTitle="Dashboard" />

      <EventDetailWrapper>
        {loading ? (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        ) : (
          <DashboardContainer tabletMode={tabletMode}>
            {/* <h1>Welcome back, Username 👋</h1> */}
            <HeaderStats tabletMode={tabletMode}>
              <StatBox color={"#4581FA"}>
                <SvgContainer>
                  <svg
                    width="37"
                    height="36"
                    viewBox="0 0 37 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.58203 13.5H31.582M13.582 22.5L16.582 25.5L22.582 19.5M10.582 4.5V7.5M25.582 4.5V7.5M9.38203 31.5H26.782C28.4622 31.5 29.3023 31.5 29.944 31.173C30.5085 30.8854 30.9674 30.4265 31.2551 29.862C31.582 29.2202 31.582 28.3802 31.582 26.7V12.3C31.582 10.6198 31.582 9.77976 31.2551 9.13803C30.9674 8.57354 30.5085 8.1146 29.944 7.82698C29.3023 7.5 28.4622 7.5 26.782 7.5H9.38203C7.70187 7.5 6.86179 7.5 6.22006 7.82698C5.65557 8.1146 5.19663 8.57354 4.90901 9.13803C4.58203 9.77976 4.58203 10.6198 4.58203 12.3V26.7C4.58203 28.3802 4.58203 29.2202 4.90901 29.862C5.19663 30.4265 5.65557 30.8854 6.22006 31.173C6.86179 31.5 7.70187 31.5 9.38203 31.5Z"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </SvgContainer>
                <StatBoxContent>
                  <StatValue>{stats?.totalEvents || 0}</StatValue>
                  <StatTitle>Events created</StatTitle>
                </StatBoxContent>
              </StatBox>
              <StatBox color={"#00BC8A"}>
                <SvgContainer>
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.00146 6H9.01647M4.75781 15C5.37557 13.2522 7.04243 12 9.00175 12C10.9611 12 12.6279 13.2522 13.2457 15M9.00146 22.5H9.01647M4.75781 31.5C5.37557 29.7522 7.04243 28.5 9.00175 28.5C10.9611 28.5 12.6279 29.7522 13.2457 31.5M20.4015 12.75H29.1015C29.9415 12.75 30.3616 12.75 30.6825 12.5865C30.9647 12.4427 31.1942 12.2132 31.338 11.931C31.5015 11.6101 31.5015 11.1901 31.5015 10.35V9.15C31.5015 8.30992 31.5015 7.88988 31.338 7.56901C31.1942 7.28677 30.9647 7.0573 30.6825 6.91349C30.3616 6.75 29.9415 6.75 29.1015 6.75H20.4015C19.5614 6.75 19.1413 6.75 18.8205 6.91349C18.5382 7.0573 18.3088 7.28677 18.165 7.56901C18.0015 7.88988 18.0015 8.30992 18.0015 9.15V10.35C18.0015 11.1901 18.0015 11.6101 18.165 11.931C18.3088 12.2132 18.5382 12.4427 18.8205 12.5865C19.1413 12.75 19.5614 12.75 20.4015 12.75ZM20.4015 29.25H29.1015C29.9415 29.25 30.3616 29.25 30.6825 29.0865C30.9647 28.9427 31.1942 28.7132 31.338 28.431C31.5015 28.1101 31.5015 27.6901 31.5015 26.85V25.65C31.5015 24.8099 31.5015 24.3899 31.338 24.069C31.1942 23.7868 30.9647 23.5573 30.6825 23.4135C30.3616 23.25 29.9415 23.25 29.1015 23.25H20.4015C19.5614 23.25 19.1413 23.25 18.8205 23.4135C18.5382 23.5573 18.3088 23.7868 18.165 24.069C18.0015 24.3899 18.0015 24.8099 18.0015 25.65V26.85C18.0015 27.6901 18.0015 28.1101 18.165 28.431C18.3088 28.7132 18.5382 28.9427 18.8205 29.0865C19.1413 29.25 19.5614 29.25 20.4015 29.25ZM10.5015 6C10.5015 6.82843 9.82989 7.5 9.00146 7.5C8.17304 7.5 7.50146 6.82843 7.50146 6C7.50146 5.17157 8.17304 4.5 9.00146 4.5C9.82989 4.5 10.5015 5.17157 10.5015 6ZM10.5015 22.5C10.5015 23.3284 9.82989 24 9.00146 24C8.17304 24 7.50146 23.3284 7.50146 22.5C7.50146 21.6716 8.17304 21 9.00146 21C9.82989 21 10.5015 21.6716 10.5015 22.5Z"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </SvgContainer>
                <StatBoxContent>
                  <StatValue>{stats?.totalGuests || 0}</StatValue>
                  <StatTitle>Guests invited</StatTitle>
                </StatBoxContent>
              </StatBox>
              <StatBox color={"#E30D8E"}>
                <SvgContainer>
                  <svg
                    width="37"
                    height="36"
                    viewBox="0 0 37 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.1694 13.5H18.1844M22.6694 28.5L25.6694 31.5L31.6694 25.5M13.9258 22.5C14.5435 20.7522 16.2104 19.5 18.1697 19.5C20.1291 19.5 21.7959 20.7522 22.4137 22.5M30.168 19.5V10.8C30.168 9.11984 30.168 8.27976 29.841 7.63803C29.5534 7.07354 29.0944 6.6146 28.5299 6.32698C27.8882 6 27.0481 6 25.368 6H10.968C9.28781 6 8.44773 6 7.806 6.32698C7.24151 6.6146 6.78257 7.07354 6.49495 7.63803C6.16797 8.27976 6.16797 9.11984 6.16797 10.8V25.2C6.16797 26.8802 6.16797 27.7202 6.49495 28.362C6.78257 28.9265 7.24151 29.3854 7.806 29.673C8.44773 30 9.28781 30 10.968 30H16.6694M19.6694 13.5C19.6694 14.3284 18.9979 15 18.1694 15C17.341 15 16.6694 14.3284 16.6694 13.5C16.6694 12.6716 17.341 12 18.1694 12C18.9979 12 19.6694 12.6716 19.6694 13.5Z"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </SvgContainer>
                <StatBoxContent>
                  <StatValue>{averageAttendance}%</StatValue>
                  <StatTitle>Average Attendance</StatTitle>
                </StatBoxContent>
              </StatBox>
              <StatBox color={"#8E7BFB"}>
                <SvgContainer>
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 10.5H18M22.5 22.5H24M12 16.5H24M12 24L13.5 25.5L16.5 22.5M10.8 31.5H25.2C26.8802 31.5 27.7202 31.5 28.362 31.173C28.9265 30.8854 29.3854 30.4265 29.673 29.862C30 29.2202 30 28.3802 30 26.7V9.3C30 7.61984 30 6.77976 29.673 6.13803C29.3854 5.57354 28.9265 5.1146 28.362 4.82698C27.7202 4.5 26.8802 4.5 25.2 4.5H10.8C9.11984 4.5 8.27976 4.5 7.63803 4.82698C7.07354 5.1146 6.6146 5.57354 6.32698 6.13803C6 6.77976 6 7.61984 6 9.3V26.7C6 28.3802 6 29.2202 6.32698 29.862C6.6146 30.4265 7.07354 30.8854 7.63803 31.173C8.27976 31.5 9.11984 31.5 10.8 31.5Z"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </SvgContainer>
                <StatBoxContent>
                  <StatValue>
                    {events.reduce(
                      (sum, event) =>
                        sum +
                        event.tasks.filter((task) => task.isCompleted).length,
                      0
                    )}

                    {" / "}
                    {events.reduce((sum, event) => sum + event.tasks.length, 0)}
                  </StatValue>
                  <StatTitle>Tasks completed/created</StatTitle>
                </StatBoxContent>
              </StatBox>
            </HeaderStats>
            <GraphSection width={90}>
              <GraphTitle>Upcoming Events</GraphTitle>
              {stats?.upcomingEvents.length ? (
                <ReelContainer>
                  {stats?.upcomingEvents.map((event, index) => (
                    <EventBox
                      key={index}
                      onClick={() => navigate(`./events/${event._id}`)}
                    >
                      <EventPoster
                        src={
                          event.poster || "https://via.placeholder.com/200x150"
                        }
                        alt={event.title}
                      />
                      <EventName>{event.title}</EventName>
                      <EventDate>
                        {new Date(event.date).toLocaleDateString()}
                      </EventDate>
                    </EventBox>
                  ))}
                </ReelContainer>
              ) : (
                <MessageContainer>
                  You don't have any events yet. <br />
                  Click{" "}
                  <CreateLink onClick={() => setIsPopupVisible(true)}>
                    here
                  </CreateLink>{" "}
                  to create your first event!
                </MessageContainer>
              )}
            </GraphSection>
            <GraphRow>
              <GraphSection width={67} height={90} noMargin>
                <GraphTitle>Event Calendar</GraphTitle>
                <CalendarBox events={events} />
              </GraphSection>
              <GraphSection width={25} height={90} noMargin>
                <TaskList events={events} />
              </GraphSection>
            </GraphRow>
          </DashboardContainer>
        )}
      </EventDetailWrapper>
      {isPopupVisible && (
        <EventForm
          onClose={() => setIsPopupVisible(false)} // Close popup when done
        />
      )}
    </PageWrapper>
  );
};

export default Dashboard;

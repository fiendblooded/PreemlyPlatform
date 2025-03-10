import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

import CalendarBox from "./CalendarBox";
import TaskList from "./TaskList";
import Spinner from "./Spinner";
import { isTablet, getDateTimeStatus, SvgSC } from "../common/common";
import EventForm from "./form/EventForm";

// Types
interface Event {
  _id: string;
  title: string;
  date: string;
  endDate: string;
  poster: string;
  guests: {
    _id: string;
    name: string;
    email: string;
    attendance_status: boolean;
  }[];
  tasks: {
    _id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string;
  }[];
}

// Add these new keyframe animations near the top with other styled components
const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-100px);
  }
  60% {
    opacity: 1;
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fc;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const DashboardContainer = styled.div<{ tabletMode: boolean }>`
  padding: ${(props) => (props.tabletMode ? "20px" : "30px")};
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #333;
    animation: ${fadeInDown} 0.6s ease-out;
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #666;
  font-size: 16px;
  line-height: 1.6;
`;

const CreateLink = styled.span`
  color: rgb(107, 61, 223);
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  padding: 0 1px;
  box-sizing: border-box;
  animation: ${bounceIn} 0.6s ease-out 0.3s both;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  box-sizing: border-box;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StatTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #666;
`;

const StatIconWrapper = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${(props) => `${props.color}15`};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    stroke: ${(props) => props.color};
    stroke-width: 2px;
  }
`;

const StatValueWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1;
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => (props.positive ? "#00BC8A" : "#E30D8E")};
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
    margin-right: 2px;
  }
`;

const DashboardSection = styled.div<{
  width: number;
  height?: number;
  noMargin?: boolean;
  delay?: number;
}>`
  width: ${(props) => props.width}%;
  ${(props) => !props.noMargin && "margin: 0 auto;"};
  height: ${(props) => (props.height ? props.height : "auto")};
  background-color: white;
  padding: 24px;
  box-sizing: border-box;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  animation: ${bounceIn} 0.6s ease-out ${(props) => props.delay || 0}s both;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;

  svg {
    margin-right: 8px;
    color: rgb(107, 61, 223);
  }
`;

const EventsCarousel = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  gap: 16px;
  padding: 4px 0 16px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
`;

const EventCard = styled.div`
  flex: 0 0 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: 1px solid #eee;
  scroll-snap-align: start;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    border-color: rgba(107, 61, 223, 0.3);
  }
`;

const EventPoster = styled.div<{ imageUrl: string }>`
  height: 140px;
  background-image: url(${(props) =>
    props.imageUrl || "https://via.placeholder.com/280x140"});
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }
`;

const EventDetails = styled.div`
  padding: 16px;
`;

const EventName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const EventDate = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    color: rgb(107, 61, 223);
  }
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;
  color: #666;
`;

const EventMetaItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;

  svg {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    color: #888;
  }
`;

const DashboardRow = styled.div`
  display: flex;
  margin-bottom: 24px;
  justify-content: space-between;
  @media (max-width: 1024px) {
    gap: 24px;
    flex-direction: column;
  }
`;

const ContentWrapper = styled.div<{ tabletMode: boolean }>`
  width: ${(props) => (props.tabletMode ? "100%" : "75%")};
  height: ${(props) => (props.tabletMode ? "100%" : "90%")};
  margin: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 100%;
    max-height: 100%;
    height: 100%;
  }
`;

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    background: white;
    font-family: inherit;

    .react-calendar__tile {
      padding: 1em 0.5em;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 4px;

      &--now {
        background: rgba(107, 61, 223, 0.1);
      }

      &--active {
        background: rgb(107, 61, 223) !important;
        color: white;
      }
    }

    .react-calendar__month-view__days__day--weekend {
      color: #d10000;
    }

    .react-calendar__navigation {
      margin-bottom: 1em;
      height: 40px;

      button {
        min-width: 40px;
        background: none;

        &:enabled:hover,
        &:enabled:focus {
          background-color: rgba(107, 61, 223, 0.1);
        }
      }
    }

    .react-calendar__month-view__weekdays {
      text-align: center;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 0.8em;
    }
  }
`;

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const axiosInstance = useAxiosWithAuth();
  const tabletMode = isTablet();
  const navigate = useNavigate();

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
    if (events.length === 0) return null;

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
      upcomingEvents,
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

  const stats = !loading ? calculateStats() : null;
  const averageAttendance = !loading ? calculateAverageAttendance() : 0;

  return (
    <PageWrapper>
      <TopBar sectionTitle="Dashboard" />

      <ContentWrapper tabletMode={tabletMode}>
        {loading ? (
          <SpinnerContainer>
            <Spinner isVisible={true} />
          </SpinnerContainer>
        ) : (
          <DashboardContainer tabletMode={tabletMode}>
            <h1>Welcome to your Dashboard</h1>

            <StatsGrid>
              <StatCard>
                <StatHeader>
                  <StatTitle>Events Created</StatTitle>
                  <StatIconWrapper color="#4581FA">
                    <SvgSC
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.8856 21 19.8284 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8284 3 18.8856 3 17V8.5C3 6.61438 3 5.67157 3.58579 5.08579C4.17157 4.5 5.11438 4.5 7 4.5H17C18.8856 4.5 19.8284 4.5 20.4142 5.08579C21 5.67157 21 6.61438 21 8.5Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </SvgSC>
                  </StatIconWrapper>
                </StatHeader>
                <StatValueWrapper>
                  <StatValue>{stats?.totalEvents || 0}</StatValue>
                  {stats && stats.totalEvents > 0 && (
                    <StatChange positive={true}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 19V5M5 12L12 5L19 12"
                          stroke="black"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      New
                    </StatChange>
                  )}
                </StatValueWrapper>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Guests Invited</StatTitle>
                  <StatIconWrapper color="#00BC8A">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 21C3 16.5817 6.58172 13 11 13H13C17.4183 13 21 16.5817 21 21"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </StatIconWrapper>
                </StatHeader>
                <StatValueWrapper>
                  <StatValue>{stats?.totalGuests || 0}</StatValue>
                  {stats && stats.checkedInGuests > 0 && (
                    <StatChange positive={true}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 19V5M5 12L12 5L19 12"
                          stroke="black"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {stats.checkedInGuests} checked in
                    </StatChange>
                  )}
                </StatValueWrapper>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Average Attendance</StatTitle>
                  <StatIconWrapper color="#E30D8E">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 8H8M16 16H8M9 20H15C16.8856 20 17.8284 20 18.4142 19.4142C19 18.8284 19 17.8856 19 16V8C19 6.11438 19 5.17157 18.4142 4.58579C17.8284 4 16.8856 4 15 4H9C7.11438 4 6.17157 4 5.58579 4.58579C5 5.17157 5 6.11438 5 8V16C5 17.8856 5 18.8284 5.58579 19.4142C6.17157 20 7.11438 20 9 20Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </StatIconWrapper>
                </StatHeader>
                <StatValueWrapper>
                  <StatValue>{averageAttendance}%</StatValue>
                  {averageAttendance > 0 && (
                    <StatChange positive={averageAttendance > 50}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {averageAttendance > 50 ? (
                          <path
                            d="M12 19V5M5 12L12 5L19 12"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <path
                            d="M12 5V19M19 12L12 19L5 12"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                      {averageAttendance > 50 ? "Good" : "Low"}
                    </StatChange>
                  )}
                </StatValueWrapper>
              </StatCard>

              <StatCard>
                <StatHeader>
                  <StatTitle>Tasks Completed</StatTitle>
                  <StatIconWrapper color="#8E7BFB">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 11L12 14L20 6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </StatIconWrapper>
                </StatHeader>
                <StatValueWrapper>
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
                  {events.length > 0 &&
                    events.reduce((sum, event) => sum + event.tasks.length, 0) >
                      0 && (
                      <StatChange
                        positive={
                          events.reduce(
                            (sum, event) =>
                              sum +
                              event.tasks.filter((task) => task.isCompleted)
                                .length,
                            0
                          ) /
                            events.reduce(
                              (sum, event) => sum + event.tasks.length,
                              0
                            ) >
                          0.5
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {events.reduce(
                            (sum, event) =>
                              sum +
                              event.tasks.filter((task) => task.isCompleted)
                                .length,
                            0
                          ) /
                            events.reduce(
                              (sum, event) => sum + event.tasks.length,
                              0
                            ) >
                          0.5 ? (
                            <path
                              d="M12 19V5M5 12L12 5L19 12"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          ) : (
                            <path
                              d="M12 5V19M19 12L12 19L5 12"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </svg>
                        {Math.round(
                          (events.reduce(
                            (sum, event) =>
                              sum +
                              event.tasks.filter((task) => task.isCompleted)
                                .length,
                            0
                          ) /
                            events.reduce(
                              (sum, event) => sum + event.tasks.length,
                              0
                            )) *
                            100
                        )}
                        %
                      </StatChange>
                    )}
                </StatValueWrapper>
              </StatCard>
            </StatsGrid>

            <DashboardSection width={100} delay={0.6}>
              <SectionTitle>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Upcoming Events
              </SectionTitle>

              {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                <EventsCarousel>
                  {stats.upcomingEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      onClick={() => navigate(`./events/${event._id}`)}
                    >
                      <EventPoster imageUrl={event.poster} />
                      <EventDetails>
                        <EventName>{event.title}</EventName>
                        <EventDate>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.8856 21 19.8284 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8284 3 18.8856 3 17V8.5C3 6.61438 3 5.67157 3.58579 5.08579C4.17157 4.5 5.11438 4.5 7 4.5H17C18.8856 4.5 19.8284 4.5 20.4142 5.08579C21 5.67157 21 6.61438 21 8.5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {new Date(event.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </EventDate>
                        <EventMeta>
                          <EventMetaItem>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M3 21C3 16.5817 6.58172 13 11 13H13C17.4183 13 21 16.5817 21 21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {event.guests.length} guests
                          </EventMetaItem>
                          <EventMetaItem>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 11L12 14L20 6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {
                              event.tasks.filter((task) => task.isCompleted)
                                .length
                            }
                            /{event.tasks.length}
                          </EventMetaItem>
                        </EventMeta>
                      </EventDetails>
                    </EventCard>
                  ))}
                </EventsCarousel>
              ) : (
                <MessageContainer>
                  You don't have any upcoming events yet. <br />
                  <CreateLink onClick={() => setIsPopupVisible(true)}>
                    Create your first event
                  </CreateLink>
                </MessageContainer>
              )}
            </DashboardSection>

            <DashboardRow>
              <DashboardSection
                width={tabletMode ? 100 : 65}
                height={400}
                noMargin
                delay={0.8}
              >
                <SectionTitle>
                  <SvgSC
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </SvgSC>
                  Event Calendar
                </SectionTitle>
                <CalendarWrapper>
                  <CalendarBox events={events} />
                </CalendarWrapper>
              </DashboardSection>

              <DashboardSection
                width={tabletMode ? 100 : 30}
                height={400}
                noMargin
                delay={0.9}
              >
                <SectionTitle>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 11L12 14L20 6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Tasks
                </SectionTitle>
                <TaskList
                  events={events.map((event) => ({
                    ...event,
                    tasks: event.tasks.map((task) => ({
                      ...task,
                      dueDate: new Date().toISOString(),
                    })),
                  }))}
                />
              </DashboardSection>
            </DashboardRow>
          </DashboardContainer>
        )}
      </ContentWrapper>

      {isPopupVisible && <EventForm onClose={() => setIsPopupVisible(false)} />}
    </PageWrapper>
  );
};

export default Dashboard;

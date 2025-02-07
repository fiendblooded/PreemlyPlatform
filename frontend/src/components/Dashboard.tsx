import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
import { PageWrapper } from "./Events";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Event } from "../types";
import { getDateTimeStatus } from "../common/common";

const DashboardContainer = styled.div`
  width: 100%;
  font-family: Axiforma, sans-serif;
  color: black;
  margin-top: 20px;
`;

const HeaderStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin: auto;
  margin-bottom: 30px;
  width: calc(90% + 40px);
`;
const BodyStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin: auto;
  margin-bottom: 30px;
  width: calc(90% + 40px);
`;

const StatBox = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 20%;
  font-weight: bold;
`;

const StatValue = styled.div`
  font-size: 24px;
  margin-top: 10px;
`;

const GraphSection = styled.div`
  width: 90%;
  margin: auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const GraphTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
`;

const PlaceholderGraph = styled.div`
  height: 300px;
  background-color: #eaeaea;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 18px;
`;

const ReelContainer = styled.div`
  width: 30%;
  height: 300px;
  overflow-x: auto;
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  color: black;
`;

const EventBox = styled.div`
  width: 200px;
  height: 280px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 10px;
`;

const EventPoster = styled.img`
  width: 100%;
  height: 150px; /* Fixed height for the poster */
  object-fit: cover; /* Maintain aspect ratio and crop if needed */
  border-radius: 8px;
  margin-bottom: 10px;
`;

const EventName = styled.div`
  max-width: 100%;
  overflow: hidden;
  overflow-wrap: break-word;
  flex-wrap: wrap;
  text-overflow: ellipsis;
  flex-wrap: wrap;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0px;
  text-align: center;
`;

const EventDate = styled.div`
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
`;

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosWithAuth();

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
  }, [axiosInstance]);

  const calculateStats = () => {
    if (events.length === 0) return null; // Return early if no events are loaded
    const upcomingEvents = events.filter(
      (currentEvent) =>
        getDateTimeStatus(currentEvent.date, currentEvent.endDate).type ===
        "Incoming"
    );
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
  return (
    <PageWrapper>
      <TopBar showBackButton sectionTitle="Dashboard" />
      <DashboardContainer>
        {/* <h1>Welcome back, Homer 👋</h1> */}
        <HeaderStats>
          <StatBox>
            Tickets Sold
            <StatValue>{stats?.totalEvents}</StatValue>
          </StatBox>
          <StatBox>
            Gross Sales
            <StatValue>{stats?.totalGuests}</StatValue>
          </StatBox>
          <StatBox>
            Page Views
            <StatValue>{averageAttendance}</StatValue>
          </StatBox>
          <StatBox>
            Orders Created
            <StatValue>{"4452"}</StatValue>
          </StatBox>
        </HeaderStats>
        <BodyStats>
          <ReelContainer>
            {stats?.upcomingEvents.map((event, index) => (
              <EventBox key={index}>
                <EventPoster
                  src={event.poster || "https://via.placeholder.com/200x150"}
                  alt={event.title}
                />
                <EventName>{event.title}</EventName>
                <EventDate>
                  {new Date(event.date).toLocaleDateString()}
                </EventDate>
              </EventBox>
            ))}
          </ReelContainer>
        </BodyStats>
        <GraphSection>
          <GraphTitle>Ticket Sales</GraphTitle>
          <PlaceholderGraph>Graph Placeholder</PlaceholderGraph>
        </GraphSection>

        <GraphSection>
          <GraphTitle>Revenue</GraphTitle>
          <PlaceholderGraph>Graph Placeholder</PlaceholderGraph>
        </GraphSection>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Dashboard;

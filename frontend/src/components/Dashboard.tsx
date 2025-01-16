import styled from "styled-components";
// import { Line } from "react-chartjs-2";
// import GaugeChart from "react-gauge-chart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Event } from "../types";
import { PageWrapper } from "./Events";
import TopBar from "./TopBar";
import { useState, useEffect } from "react";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
// import useAxiosWithAuth from "./auth/useAxiosWithAuth";
// import { Event } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ProjectsOverview = styled.div`
  margin-top: 80px;
  margin-left: 20px;
  width: 40%;
  height: 500px;
  background-color: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  color: black;
`;
const BlockTitle = styled.div`
  margin-top: 24px;
  margin-left: 24px;
  font-size: 20px;
  color: black;
  font-weight: 500;
`;
const Dashboard: React.FC = () => {
  // const [events, setEvents] = useState<Event[]>([]);
  // const [loading, setLoading] = useState(true);
  // const axiosInstance = useAxiosWithAuth();
  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const response = await axiosInstance.get("/events");
  //       setEvents(response.data);
  //     } catch (error) {
  //       console.error("Error fetching events:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEvents();
  // }, []);

  // const calculateStats = () => {
  //   const totalEvents = events.length;
  //   const upcomingEvents = events.filter(
  //     (event) => new Date(event.date) > new Date()
  //   ).length;
  //   const pastEvents = totalEvents - upcomingEvents;
  //   const totalGuests = events.reduce(
  //     (sum, event) => sum + event.guests.length,
  //     0
  //   );
  //   const checkedInGuests = events.reduce(
  //     (sum, event) =>
  //       sum + event.guests.filter((guest) => guest.attendance_status).length,
  //     0
  //   );

  //   return {
  //     totalEvents,
  //     upcomingEvents,
  //     pastEvents,
  //     totalGuests,
  //     checkedInGuests,
  //   };
  // };

  // const calculateAverageAttendance = () => {
  //   const totalGuests = events.reduce(
  //     (sum, event) => sum + event.guests.length,
  //     0
  //   );
  //   const checkedInGuests = events.reduce(
  //     (sum, event) =>
  //       sum + event.guests.filter((guest) => guest.attendance_status).length,
  //     0
  //   );
  //   return totalGuests === 0
  //     ? 0
  //     : Math.round((checkedInGuests / totalGuests) * 100);
  // };

  // // const generateEventDistributionGraphData = () => {
  // //   const dateCounts = events.reduce((acc, event) => {
  // //     const eventDate = new Date(event?.time || "").toLocaleDateString(
  // //       "en-US",
  // //       {
  // //         month: "short",
  // //         year: "numeric",
  // //       }
  // //     );
  // //     acc[eventDate] = (acc[eventDate] || 0) + 1;
  // //     return acc;
  // //   }, {});

  // //   return {
  // //     labels: Object.keys(dateCounts),
  // //     datasets: [
  // //       {
  // //         label: "Event Count",
  // //         data: Object.values(dateCounts),
  // //         fill: false,
  // //         borderColor: "#f4c430",
  // //         tension: 0.1,
  // //       },
  // //     ],
  // //   };
  // // };

  // const stats = calculateStats();
  // const averageAttendance = calculateAverageAttendance();

  return (
    <PageWrapper>
      <TopBar sectionTitle="Dashboard" />
      <ProjectsOverview>
        <BlockTitle>Events Summary</BlockTitle>
      </ProjectsOverview>
      <ProjectsOverview>
        <BlockTitle>Stats</BlockTitle>
        {/* <div>
          <div>
            <div>Total Events</div>
            <div>{stats.totalEvents}</div>
          </div>
          <div>
            <div>Upcoming Events</div>
            <div>{stats.upcomingEvents}</div>
          </div>
          <div>
            <div>Past Events</div>
            <div>{stats.pastEvents}</div>
          </div>
          <div>
            <div>Total Guests</div>
            <div>{stats.totalGuests}</div>
          </div>
          <div>
            <div>Checked-In Guests</div>
            <div>{stats.checkedInGuests}</div>
          </div>
        </div> */}
      </ProjectsOverview>
      {/* <h1>Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <GridContainer>
            <Card>
              <SmallTitle>Total Events</SmallTitle>
              <StatValue>{stats.totalEvents}</StatValue>
            </Card>
            <Card>
              <SmallTitle>Upcoming Events</SmallTitle>
              <StatValue>{stats.upcomingEvents}</StatValue>
            </Card>
            <Card>
              <SmallTitle>Past Events</SmallTitle>
              <StatValue>{stats.pastEvents}</StatValue>
            </Card>
            <Card>
              <SmallTitle>Total Guests</SmallTitle>
              <StatValue>{stats.totalGuests}</StatValue>
            </Card>
            <Card>
              <SmallTitle>Checked-In Guests</SmallTitle>
              <StatValue>{stats.checkedInGuests}</StatValue>
            </Card>
          </GridContainer>
          <Graphs>
            <GaugeContainer>
              <SmallTitle>Average Attendance</SmallTitle>
              <GaugeChart
                percent={averageAttendance / 100}
                colors={["#FF0000", "#FFFF00", "#00FF00"]}
                arcWidth={0.3}
                needleColor="#f5f5f5"
                textColor="#f5f5f5"
              />
              <StatValue>{averageAttendance}%</StatValue>
            </GaugeContainer>
            <GraphContainer>
              <SmallTitle>Event Distribution Over Time</SmallTitle>
              <Line
                data={generateEventDistributionGraphData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                  },
                }}
              />
            </GraphContainer>
          </Graphs>
        </>
      )} */}
    </PageWrapper>
  );
};

export default Dashboard;

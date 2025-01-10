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

const DashboardWrapper = styled.div`
  padding: 20px;
  background-color: #e9f0f2;
  color: #f5f5f5;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// const GridContainer = styled.div`
//   display: grid;
//   grid-template-columns: repeat(5, 1fr);
//   gap: 20px;
//   width: 100%;
//   max-width: 1200px;
// `;

// const Card = styled.div`
//   background-color: #1e1e2f;
//   border-radius: 8px;
//   padding: 20px;
//   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
//   text-align: center;
// `;

// const StatValue = styled.p`
//   font-size: 2rem;
//   color: #f4c430;
//   margin: 10px 0;
// `;

// const SmallTitle = styled.h4`
//   margin-bottom: 10px;
//   color: #f4c430;
// `;

// const GraphContainer = styled(Card)`
//   grid-column: span 2;
// `;

// const GaugeContainer = styled(Card)`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
// `;
// const Graphs = styled.div`
//   margin-top: 20px;
//   display: flex;
//   gap: 20px;
// `;

const Dashboard: React.FC = () => {
  // const [events, setEvents] = useState<Event[]>([]);
  // // const [loading, setLoading] = useState(true);
  // const axiosInstance = useAxiosWithAuth();
  // // useEffect(() => {
  // //   const fetchEvents = async () => {
  // //     try {
  // //       const response = await axiosInstance.get("http://localhost:3002/api/events");
  // //       setEvents(response.data);
  // //     } catch (error) {
  // //       console.error("Error fetching events:", error);
  // //     } finally {
  // //       setLoading(false);
  // //     }
  // //   };

  // //   fetchEvents();
  // // }, []);

  // // const calculateStats = () => {
  // //   const totalEvents = events.length;
  // //   const upcomingEvents = events.filter(
  // //     (event) => new Date(event.time) > new Date()
  // //   ).length;
  // //   const pastEvents = totalEvents - upcomingEvents;
  // //   const totalGuests = events.reduce(
  // //     (sum, event) => sum + event.guests.length,
  // //     0
  // //   );
  // //   const checkedInGuests = events.reduce(
  // //     (sum, event) =>
  // //       sum + event.guests.filter((guest) => guest.attendance_status).length,
  // //     0
  // //   );

  // //   return {
  // //     totalEvents,
  // //     upcomingEvents,
  // //     pastEvents,
  // //     totalGuests,
  // //     checkedInGuests,
  // //   };
  // // };

  // // const calculateAverageAttendance = () => {
  // //   const totalGuests = events.reduce(
  // //     (sum, event) => sum + event.guests.length,
  // //     0
  // //   );
  // //   const checkedInGuests = events.reduce(
  // //     (sum, event) =>
  // //       sum + event.guests.filter((guest) => guest.attendance_status).length,
  // //     0
  // //   );
  // //   return totalGuests === 0
  // //     ? 0
  // //     : Math.round((checkedInGuests / totalGuests) * 100);
  // // };

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

  // // const stats = calculateStats();
  // // const averageAttendance = calculateAverageAttendance();

  return (
    <DashboardWrapper>
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
    </DashboardWrapper>
  );
};

export default Dashboard;

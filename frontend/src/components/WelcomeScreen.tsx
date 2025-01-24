import { useEffect, useState } from "react";
import useWebSocket from "../useWebSocket";
import styled, { keyframes, css } from "styled-components";
import ScannerComponent from "./ScannerPage";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { useParams, useNavigate } from "react-router-dom";
import { Event, Guest } from "../types";
import Spinner from "./Spinner";
import Dropdown from "./Dropdown";
import WaveBackground from "./WaveBackground";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;
const BackButton = styled.button`
  position: absolute;
  top: 14px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.4s ease-in-out;

  &:hover {
    background-color: #00aef0;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
const WelcomeScreenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #2a2768;
  color: #f5f5f5;
  font-size: 2rem;
  font-family: Axiforma, sans-serif;
  flex-direction: column;
  overflow: hidden;
`;

const Title = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const SubTitle = styled.div`
  font-size: 24px;
  width: 35%;
  text-align: center;
  margin-bottom: 20px;
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: rgb(107, 61, 223);
  border: none;
  height: 50px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 19px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: rgb(155, 119, 249);
  }
  margin-top: 20px;
`;
const DateTimeSC = styled.div`
  font-size: 32px;
  color: rgb(207, 207, 207);
  margin-bottom: 20px;
`;
const Container = styled.div<{ isVisible: boolean }>`
  width: 80%;
  height: 80%;
  display: flex;
  margin: auto;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  animation: ${({ isVisible }) => (isVisible ? fadeIn : fadeOut)} 0.5s
    ease-in-out;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) =>
    isVisible ? "translateY(0)" : "translateY(-10px)"};
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
`;

const GuestDetailsContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  animation: ${({ isVisible }) => (isVisible ? fadeIn : fadeOut)} 0.5s
    ease-in-out;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) =>
    isVisible ? "translateY(0)" : "translateY(-10px)"};
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
`;
const GuestCountContainer = styled.div`
  border-radius: 100%;
  background-color: white;
  font-size: 24px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
`;

const wsUrl = import.meta.env.VITE_APP_WS_URL;

const WelcomeScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(true);
  const axiosInstance = useAxiosWithAuth();
  const message = useWebSocket(wsUrl);
  const [guest, setGuest] = useState<Guest | null>(null);

  // Simulate delayed unmount of the spinner
  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setShowSpinner(false), 500); // Match fade-out duration
      return () => clearTimeout(timeout); // Cleanup timeout
    } else {
      setShowSpinner(true); // Ensure spinner shows on loading start
    }
  }, [loading]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => {
    if (id) {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (guest) {
      // Start a 10-second timer when guest is set
      timeout = setTimeout(() => {
        setGuest(null);
      }, 10000); // 10 seconds
    }

    return () => {
      // Clear timeout if guest changes or component unmounts
      clearTimeout(timeout);
    };
  }, [guest]);

  const handleOpenEvent = () => {
    if (selectedEventId) {
      navigate(`/welcome/${selectedEventId}`);
    }
  };

  useEffect(() => {
    if (!id) {
      fetchEvents();
    } else {
      fetchEvent();
    }
  }, [id]);
  function formatDate(dateString: string) {
    const date = new Date(dateString); // Parse the ISO string into a Date object

    // Format the date components
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short", // Short weekday, e.g., "Wed"
      day: "2-digit", // Day of the month, e.g., "22"
      month: "short", // Short month, e.g., "Jan"
      hour: "2-digit", // Hour, e.g., "10"
      minute: "2-digit", // Minutes, e.g., "30"
    };

    // Return the formatted string
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  const guestsPresent = event?.guests.filter(
    (guest) => guest.attendance_status === true
  ).length;

  const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    "nevergonnagiveyouup"
  )}&size=150x150`;

  return (
    <WelcomeScreenWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {id ? "Back" : "Exit"}
      </BackButton>
      <WaveBackground />
      {showSpinner ? (
        <Spinner isVisible={loading} />
      ) : id ? (
        <>
          {guest ? (
            <GuestDetailsContainer isVisible={guest !== null}>
              <img src={qrCodeBase64} alt="" />
              <div>Welcome, {guest.fullName}</div>
              <div>{guest.email}</div>
            </GuestDetailsContainer>
          ) : (
            <Container isVisible={guest === null}>
              <Title>{event?.title || ""}</Title>
              <DateTimeSC>
                {event?.date ? formatDate(event.date) : ""}
              </DateTimeSC>

              <ScannerComponent setGuest={setGuest} />
              {/* <GuestCountContainer>+{guestsPresent}</GuestCountContainer> */}
              <SubTitle>Scan your invitation QR code to check-in</SubTitle>
            </Container>
          )}
        </>
      ) : (
        <>
          <svg
            width="120"
            height="120"
            viewBox="0 0 390 390"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M195 361.636C287.031 361.636 361.636 287.031 361.636 195C361.636 102.969 287.031 28.3636 195 28.3636C102.969 28.3636 28.3636 102.969 28.3636 195C28.3636 287.031 102.969 361.636 195 361.636ZM195 390C302.696 390 390 302.696 390 195C390 87.3045 302.696 0 195 0C87.3045 0 0 87.3045 0 195C0 302.696 87.3045 390 195 390Z"
              fill="#00AEF0"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M182.405 72.2336C187.3 61.3726 202.722 61.3727 207.617 72.2336L210.707 79.0897C228.051 117.57 250.463 153.558 277.349 186.096L281.831 191.52C286.055 196.632 286.055 204.023 281.831 209.135L277.349 214.559C250.463 247.097 228.051 283.085 210.707 321.565L207.617 328.421C202.722 339.282 187.3 339.282 182.405 328.421L179.315 321.565C161.972 283.085 139.559 247.097 112.673 214.559L108.191 209.135C103.967 204.023 103.967 196.632 108.191 191.52L112.673 186.096C139.559 153.558 161.972 117.57 179.315 79.0896L182.405 72.2336ZM195.011 104.016C178.152 138.379 157.382 170.698 133.103 200.327C157.382 229.957 178.152 262.276 195.011 296.638C211.87 262.276 232.64 229.957 256.919 200.327C232.64 170.698 211.87 138.379 195.011 104.016Z"
              fill="#00AEF0"
            />
          </svg>
          <Title>Preemly Event System</Title>
          <SubTitle>
            Welcome to the check-in screen! Please select your event from the
            dropdown menu below to begin the check-in process.
          </SubTitle>
          <DropdownContainer>
            <Dropdown
              options={events.map((event) => event.title)} // Pass event titles as options
              selected={
                selectedEventId
                  ? events.find((e) => e._id === selectedEventId)?.title || null
                  : null
              } // Ensure null fallback
              onSelect={(option) => {
                const selectedEvent = events.find(
                  (event) => event.title === option
                );
                if (selectedEvent) setSelectedEventId(selectedEvent._id); // Set selectedEventId
              }}
            />

            <Button onClick={handleOpenEvent} disabled={!selectedEventId}>
              Open
            </Button>
          </DropdownContainer>
        </>
      )}
    </WelcomeScreenWrapper>
  );
};

export default WelcomeScreen;

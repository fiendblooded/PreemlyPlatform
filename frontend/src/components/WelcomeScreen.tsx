import { useEffect, useState } from "react";
import useWebSocket from "../useWebSocket";
import styled, { keyframes } from "styled-components";
import ScannerComponent from "./ScannerPage";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { useParams, useNavigate } from "react-router-dom";
import { Event, Guest } from "../types";
import Spinner from "./Spinner";
import Dropdown from "./Dropdown";
import WaveBackground from "./WaveBackground";
import ManualQR from "../manualqr.png";
import PresentGuests from "./PresentGuests";
import React from "react";
import { ToastType, useToast } from "./Toasts";
import AnimatedBackground from "./AnimatedBackground";
import PreemlyLogo from "../logo.png";
import HacknimeLogo from "../hacknimelogo.png";
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
  z-index: 104025023002350;
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
  font-size: 2.1rem;
  font-weight: bold;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
  text-align: center;
`;

const SubTitle = styled.div`
  font-size: 1.2rem;
  width: 60%;
  margin-top: 10px;
  text-align: center;
`;

const MessageSC = styled.div`
  font-size: 1.3rem;
  text-align: center;
  margin-top: 10px;
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
  font-size: 20px;
  color: rgb(207, 207, 207);

  margin-top: -10px;
`;
const Container = styled.div<{ isVisible: boolean }>`
  width: 80%;
  height: 80%;
  display: flex;
  gap: 20px;
  margin: auto;
  flex-direction: row;
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

const GuestInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;
const ManualQRContainer = styled.img`
  width: 80%;
  border-radius: 8px;
`;
const WelcomeButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin: auto;
  margin-top: 10px;
  justify-content: center;
`;
const PrimaryWelcomeButton = styled.div`
  font-size: 18px;
  border-radius: 24px;
  padding: 14px 22px;
  background-color: #00aef0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  min-width: 160px;
  gap: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out; /* Add this line */
  &:hover {
    background-color: rgb(0, 119, 166);
  }
`;

const SecondaryWelcomeButton = styled.div`
  font-size: 16px;
  border-radius: 24px;
  padding: 12px 20px;
  border: 2px solid #00aef0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  min-width: 160px;
  cursor: pointer;
  &:hover {
    background-color: rgb(0, 119, 166);
  }
`;
const OrSC = styled.div`
  font-size: 18px;
  margin: 12px;
`;

const ManualInputSC = styled.input`
  margin: 20px 0;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #f9f9f9;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  font-family: Axiforma, sans-serif;
  font-size: 20px;

  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #00aef0;
    outline: none;
  }
`;
const LogosContainer = styled.div`
  width: 90%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center; /* Center vertically */
`;

const LogoContainer = styled.img`
  width: 40%; /* Each logo takes 40% width */
  height: auto; /* Auto height to maintain aspect ratio */
  object-fit: contain; /* Ensure the full image is shown without distortion */
  margin: 0 2%; /* Add some space between the images */
`;

const VerticalDelimiter = styled.div`
  height: 90%;
  width: 2px;
  background-color: white;
`;
const HorizontalDelimiter = styled.div`
  width: 90%;
  height: 1px;
  background-color: white;
`;

const GuestDetailsContainer = styled.div`
  width: 25%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffffff;
  background-color: #00aef0;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
`;
const ProgramContainer = styled.div`
  height: 100%;
  width: 50%;
  border-radius: 12px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
`;
const GuestWelcomeScreen = styled.div<{ isVisible: boolean }>`
  display: flex;
  width: 100%;
  height: 60%;
  margin: auto;
  justify-content: center;
  align-items: center;
  gap: 20px;
  animation: ${({ isVisible }) => (isVisible ? fadeIn : fadeOut)} 0.5s
    ease-in-out;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) =>
    isVisible ? "translateY(0)" : "translateY(-10px)"};
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
`;
const ScheduleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
`;
const ScheduleSection = styled.div`
  height: 25%;
  width: 90%;
  display: flex;
  font-size: 40px;
  justify-content: space-between;
  align-items: center;
`;
const ScheduleInfo = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
`;
const ScheduleSectionTitle = styled.div`
  font-weight: bold;
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
  const [isManualCheckInOpen, setManualCheckInOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setmanualEmail] = useState("");
  const { addToast, Toasts } = useToast();
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
  const addGuestManually = async () => {
    if (manualName && manualEmail) {
      try {
        // Make the POST request to create a new guest
        await axiosInstance.post(`/guests`, {
          fullName: manualName,
          email: manualEmail,
          age: 0,
          eventId: id, // Pass the event ID to associate the guest
          attendance_status: true,
        });
        // Refetch the updated event data and reset form
        setManualCheckInOpen(false);
        const guest: Guest = {
          _id: "000",
          fullName: manualName,
          email: manualEmail,
          attendance_status: true,
          age: 0,
        };
        setGuest(guest);
        setManualName(""); // Clear manual input (optional)
        setmanualEmail(""); // Clear manual input (optional)
        fetchEvent();
      } catch (error) {
        addToast(`Error saving guest: ${error}`, ToastType.ERROR);
      }
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (guest) {
      // Start a 10-second timer when guest is set
      timeout = setTimeout(() => {
        setGuest(null);
        fetchEvent();
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
  );

  const eventGuests = event?.guests.map((guest) => guest._id) || [];

  //BUBBLES
  const [showBubbles, setShowBubbles] = useState(false);
  let inactivityTimer: NodeJS.Timeout;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    setShowBubbles(false); // Reset to show the main content
    inactivityTimer = setTimeout(() => setShowBubbles(true), 45000); // Show bubbles after 45 seconds of inactivity
  };

  useEffect(() => {
    // Attach event listeners to detect user interaction
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    // Set the initial inactivity timer
    inactivityTimer = setTimeout(() => setShowBubbles(true), 45000);

    // Cleanup: Remove event listeners and clear timer on component unmount
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
    };
  }, []);
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
          {showBubbles && <AnimatedBackground />}

          {guest ? (
            <GuestWelcomeScreen isVisible={guest !== null}>
              <GuestDetailsContainer>
                <div>
                  <b>Let's hack it!</b>
                </div>
                <ManualQRContainer src={ManualQR} alt="" />

                <div style={{ fontSize: 36, textAlign: "center" }}>
                  <b>{guest.fullName}</b>
                </div>
                <LogosContainer>
                  <LogoContainer src={HacknimeLogo} width={200} />
                  <LogoContainer src={PreemlyLogo} />
                </LogosContainer>
              </GuestDetailsContainer>
              <VerticalDelimiter />
              <ProgramContainer>
                <Title>What's next?</Title>
                <ScheduleContainer>
                  <ScheduleSection>
                    <ScheduleInfo>
                      <ScheduleSectionTitle>Grand Opening</ScheduleSectionTitle>
                      <div></div>
                    </ScheduleInfo>
                    <div>9:00</div>
                  </ScheduleSection>
                  <HorizontalDelimiter />
                  <ScheduleSection>
                    <ScheduleInfo>
                      <ScheduleSectionTitle>
                        Explanation of the challenge
                      </ScheduleSectionTitle>
                      <div></div>
                    </ScheduleInfo>
                    <div>9:30</div>
                  </ScheduleSection>
                  <HorizontalDelimiter />
                  <ScheduleSection>
                    <ScheduleInfo>
                      <ScheduleSectionTitle>
                        Introduction of the mentors
                      </ScheduleSectionTitle>
                      <div></div>
                    </ScheduleInfo>
                    <div>9:50</div>
                  </ScheduleSection>
                  <HorizontalDelimiter />
                </ScheduleContainer>
              </ProgramContainer>
            </GuestWelcomeScreen>
          ) : (
            <Container isVisible={guest === null}>
              {isManualCheckInOpen ? (
                <GuestInfoContainer>
                  <Title>Manual Check-in</Title>

                  <ManualInputSC
                    placeholder="Name and surname"
                    value={manualName}
                    onChange={(event) => {
                      setManualName(event.target.value);
                      resetInactivityTimer();
                    }}
                  />

                  <ManualInputSC
                    placeholder="Email"
                    value={manualEmail}
                    onChange={(event) => {
                      setmanualEmail(event.target.value);
                      resetInactivityTimer();
                    }}
                  />

                  <WelcomeButtonsContainer>
                    <SecondaryWelcomeButton
                      onClick={() => {
                        setManualCheckInOpen(false);
                        resetInactivityTimer();
                      }}
                    >
                      Back
                    </SecondaryWelcomeButton>
                    <PrimaryWelcomeButton
                      onClick={() => {
                        addGuestManually();
                        resetInactivityTimer();
                      }}
                    >
                      Check-in
                    </PrimaryWelcomeButton>
                  </WelcomeButtonsContainer>
                </GuestInfoContainer>
              ) : (
                <>
                  <ScannerComponent
                    setGuest={setGuest}
                    eventGuests={eventGuests}
                  />

                  <GuestInfoContainer>
                    <Title>{event?.title || ""}</Title>
                    <DateTimeSC>
                      {event?.date ? formatDate(event.date) : ""}
                    </DateTimeSC>
                    <PresentGuests guests={guestsPresent || []} />
                    <MessageSC>
                      Scan your invitation QR code for check-in
                    </MessageSC>
                    {event?.welcomeScreenParams.isManualCheckin && (
                      <>
                        <OrSC>or</OrSC>
                        <WelcomeButtonsContainer>
                          <PrimaryWelcomeButton>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 21H6.2C5.0799 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H17.8C18.9201 5 19.4802 5 19.908 5.21799C20.2843 5.40973 20.5903 5.71569 20.782 6.09202C21 6.51984 21 7.0799 21 8.2V10M7 3V5M17 3V5M3 9H21M13.5 13.0001L7 13M10 17.0001L7 17M14 21L16.025 20.595C16.2015 20.5597 16.2898 20.542 16.3721 20.5097C16.4452 20.4811 16.5147 20.4439 16.579 20.399C16.6516 20.3484 16.7152 20.2848 16.8426 20.1574L21 16C21.5523 15.4477 21.5523 14.5523 21 14C20.4477 13.4477 19.5523 13.4477 19 14L14.8426 18.1574C14.7152 18.2848 14.6516 18.3484 14.601 18.421C14.5561 18.4853 14.5189 18.5548 14.4903 18.6279C14.458 18.7102 14.4403 18.7985 14.405 18.975L14 21Z"
                                stroke="white"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            <div
                              style={{ margin: "auto", marginTop: 2 }}
                              onClick={() => {
                                setManualCheckInOpen(true);
                                resetInactivityTimer();
                              }}
                            >
                              Manual Check-in
                            </div>
                          </PrimaryWelcomeButton>
                        </WelcomeButtonsContainer>
                      </>
                    )}
                  </GuestInfoContainer>
                </>
              )}
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
      <Toasts />
    </WelcomeScreenWrapper>
  );
};

export default WelcomeScreen;

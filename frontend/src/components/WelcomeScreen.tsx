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
// import AnimatedBackground from "./AnimatedBackground";
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
const BackButton = styled.button<{ color: string }>`
  position: absolute;
  top: 14px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => props.color};
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
const WelcomeScreenWrapper = styled.div<{
  backgroundColor?: string;
  textColor?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${(props) =>
    props.backgroundColor ? props.backgroundColor : "#2a2768"};
  color: ${(props) => (props.textColor ? props.textColor : "#f5f5f5")};
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
  margin: 10px auto 20px auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  opacity: 0.6;

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

const WelcomeButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin: auto;
  margin-top: 10px;
  justify-content: center;
`;
const PrimaryWelcomeButton = styled.button`
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

const wsUrl = import.meta.env.VITE_APP_WS_URL;

const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ManualCheckInIcon = () => (
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const ManualCheckInForm = ({
  manualName,
  setManualName,
  manualEmail,
  setManualEmail,
  phoneNumber,
  setPhoneNumber,
  onBack,
  onSubmit,
}: {
  manualName: string;
  setManualName: (value: string) => void;
  manualEmail: string;
  setManualEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) => (
  <GuestInfoContainer>
    <Title>Manual Check-in</Title>

    <InputGroup>
      <InputLabel>Full Name</InputLabel>
      <ManualInputSC
        placeholder="Enter your full name"
        value={manualName}
        onChange={(event) => setManualName(event.target.value)}
      />
    </InputGroup>

    <InputGroup>
      <InputLabel>Email Address</InputLabel>
      <ManualInputSC
        placeholder="Enter your email"
        type="email"
        value={manualEmail}
        onChange={(event) => setManualEmail(event.target.value)}
      />
    </InputGroup>

    <InputGroup>
      <InputLabel>Phone Number (Optional)</InputLabel>
      <ManualInputSC
        placeholder="Enter your phone number"
        type="tel"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
      />
    </InputGroup>

    <WelcomeButtonsContainer>
      <SecondaryWelcomeButton onClick={onBack}>
        <BackIcon />
        Back
      </SecondaryWelcomeButton>
      <PrimaryWelcomeButton
        onClick={onSubmit}
        disabled={!manualName || !manualEmail}
      >
        <CheckIcon />
        Check-in
      </PrimaryWelcomeButton>
    </WelcomeButtonsContainer>
  </GuestInfoContainer>
);

// New styled components
const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ManualInputSC = styled.input`
  margin: 0;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #f9f9f9;
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  font-family: Axiforma, sans-serif;
  font-size: 18px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00aef0;
    box-shadow: 0 0 0 3px rgba(0, 174, 240, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #aaa;
  }
`;

// Icons for buttons
const BackIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 13L9 17L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GuestWelcomeView = ({
  guest,
  event,
}: {
  guest: Guest;
  event: Event | null;
}) => (
  <GuestWelcomeScreen isVisible={true}>
    <WelcomeCard>
      <ConfettiEffect />

      {/* Event Logo */}
      {event?.poster && (
        <EventLogoContainer>
          <EventLogo src={event.poster} alt={`${event?.title} logo`} />
        </EventLogoContainer>
      )}

      <WelcomeContent>
        <WelcomeBanner>
          <span>Welcome</span>
        </WelcomeBanner>

        <GuestName>{guest.fullName}!</GuestName>

        <EventTitle>{event?.title}</EventTitle>

        {/* Date and Time */}
        {event?.date && (
          <EventDateTime>
            <CalendarIcon />
            {formatDate(event.date)}
            {event.endDate && ` - ${formatDate(event.endDate)}`}
          </EventDateTime>
        )}

        {/* Schedule Content */}
        {event?.emailParams?.scheduleSrc?.enabled &&
          event?.emailParams?.scheduleSrc?.content && (
            <ScheduleContent
              dangerouslySetInnerHTML={{
                __html: event.emailParams.scheduleSrc.content,
              }}
            />
          )}
      </WelcomeContent>

      {/* Preemly Logo */}
      <PreemlyLogoContainer>
        <PreemlyLogoImage src={PreemlyLogo} alt="Preemly" />
      </PreemlyLogoContainer>
    </WelcomeCard>
  </GuestWelcomeScreen>
);

// Confetti animation component
const ConfettiEffect = () => (
  <ConfettiContainer>
    {Array.from({ length: 50 }).map((_, i) => (
      <ConfettiPiece
        key={i}
        color={confettiColors[i % confettiColors.length]}
        size={Math.random() * 0.7 + 0.3}
        left={`${Math.random() * 100}%`}
        delay={Math.random() * 5}
      />
    ))}
  </ConfettiContainer>
);

// Confetti colors
const confettiColors = [
  "#00aef0",
  "#ff3e6c",
  "#ffcc00",
  "#7cff00",
  "#ff00cc",
  "#00ffcc",
  "#ff9900",
  "#9900ff",
];

// Animation keyframes
const confettiFall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled components
const GuestWelcomeScreen = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: ${({ isVisible }) => (isVisible ? fadeIn : fadeOut)} 0.5s
    ease-in-out forwards;
  z-index: 100;
  padding: 40px;
  overflow: hidden;
  position: relative;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{
  color: string;
  size: number;
  left: string;
  delay: number;
}>`
  position: absolute;
  top: -20px;
  left: ${(props) => props.left};
  width: ${(props) => props.size * 15}px;
  height: ${(props) => props.size * 15}px;
  background-color: ${(props) => props.color};
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation: ${confettiFall} ${(props) => 5 + props.delay}s linear infinite;
  animation-delay: ${(props) => props.delay}s;
  z-index: 10;
`;

const WelcomeCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
  padding-bottom: 70px; /* Space for the logo at bottom */
  border: 2px solid rgba(255, 255, 255, 0.1);
  z-index: 5;
`;

const EventLogoContainer = styled.div`
  width: 100%;
  max-height: 320px;

  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
`;

const EventLogo = styled.img`
  width: 100%;
  object-fit: cover;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
`;

const WelcomeContent = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WelcomeBanner = styled.div`
  font-size: 64px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 20px;
  position: relative;

  span {
    background: linear-gradient(90deg, #00aef0, #ff3e6c, #ffcc00, #00aef0);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
    display: inline-block;
    padding: 0 10px;
    text-shadow: 0 0 20px rgba(0, 174, 240, 0.5);
  }
`;

const GuestName = styled.div`
  font-size: 56px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
`;

const EventTitle = styled.div`
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
`;

const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "8px" }}
  >
    <path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EventDateTime = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 500;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ScheduleContent = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  font-size: 18px;
  line-height: 1.6;
  text-align: center;

  /* Style for HTML content that might come from the schedule */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 16px;
  }

  ul,
  ol {
    margin-bottom: 16px;
    padding-left: 24px;
    text-align: left;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
  }

  th,
  td {
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
  }

  th {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PreemlyLogoContainer = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const PreemlyLogoImage = styled.img`
  height: 56px;
  width: auto;
`;

const ScannerView = ({
  event,
  guestsPresent,
  eventGuests,
  setGuest,
  setManualCheckInOpen,
  formatDate,
}: {
  event: Event | null;
  guestsPresent: Guest[] | undefined;
  eventGuests: string[];
  setGuest: (guest: Guest | null) => void;
  setManualCheckInOpen: (open: boolean) => void;
  formatDate: (date: string) => string;
}) => (
  <>
    <ScannerComponent setGuest={setGuest} eventGuests={eventGuests} />

    <GuestInfoContainer>
      <Title>{event?.title || ""}</Title>
      <DateTimeSC>{event?.date ? formatDate(event.date) : ""}</DateTimeSC>
      <PresentGuests guests={guestsPresent || []} />
      <MessageSC>Scan your invitation QR code for check-in</MessageSC>
      {event?.welcomeScreenParams.isManualCheckin && (
        <>
          <OrSC>or</OrSC>
          <WelcomeButtonsContainer>
            <PrimaryWelcomeButton onClick={() => setManualCheckInOpen(true)}>
              <ManualCheckInIcon />
              <div style={{ margin: "auto", marginTop: 2 }}>
                Manual Check-in
              </div>
            </PrimaryWelcomeButton>
          </WelcomeButtonsContainer>
        </>
      )}
    </GuestInfoContainer>
  </>
);

const EventSelectionView = ({
  events,
  selectedEventId,
  setSelectedEventId,
  handleOpenEvent,
}: {
  events: Event[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  handleOpenEvent: () => void;
}) => (
  <>
    <svg
      width="120"
      height="120"
      viewBox="0 0 390 390"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M195 361.636C287.031 361.636 361.636 287.031 361.636 195C361.636 102.969 287.031 28.3636 195 28.3636C102.969 28.3636 28.3636 102.969 28.3636 195C28.3636 287.031 102.969 361.636 195 361.636ZM195 390C302.696 390 390 302.696 390 195C390 87.3045 302.696 0 195 0C87.3045 0 0 87.3045 0 195C0 302.696 87.3045 390 195 390Z"
        fill="#00AEF0"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M182.405 72.2336C187.3 61.3726 202.722 61.3727 207.617 72.2336L210.707 79.0897C228.051 117.57 250.463 153.558 277.349 186.096L281.831 191.52C286.055 196.632 286.055 204.023 281.831 209.135L277.349 214.559C250.463 247.097 228.051 283.085 210.707 321.565L207.617 328.421C202.722 339.282 187.3 339.282 182.405 328.421L179.315 321.565C161.972 283.085 139.559 247.097 112.673 214.559L108.191 209.135C103.967 204.023 103.967 196.632 108.191 191.52L112.673 186.096C139.559 153.558 161.972 117.57 179.315 79.0896L182.405 72.2336ZM195.011 104.016C178.152 138.379 157.382 170.698 133.103 200.327C157.382 229.957 178.152 262.276 195.011 296.638C211.87 262.276 232.64 229.957 256.919 200.327C232.64 170.698 211.87 138.379 195.011 104.016Z"
        fill="#00AEF0"
      />
    </svg>
    <Title>Preemly Event System</Title>
    <SubTitle>
      <div>Welcome to the check-in screen!</div>

      {events.length ? (
        "Please select your event from the dropdown menu below to begin the check-in process."
      ) : (
        <div>
          To access this feature, you need to{" "}
          <a href={"/events"} style={{ cursor: "pointer" }}>
            create an event
          </a>{" "}
          first.
        </div>
      )}
    </SubTitle>
    {events.length ? (
      <DropdownContainer>
        <Dropdown
          options={events.map((event) => event.title)}
          selected={
            selectedEventId
              ? events.find((e) => e._id === selectedEventId)?.title || null
              : null
          }
          onSelect={(option) => {
            const selectedEvent = events.find(
              (event) => event.title === option
            );
            if (selectedEvent) setSelectedEventId(selectedEvent._id);
          }}
        />

        <Button onClick={handleOpenEvent} disabled={!selectedEventId}>
          Open
        </Button>
      </DropdownContainer>
    ) : null}
  </>
);

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const { addToast, Toasts } = useToast();

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setShowSpinner(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setShowSpinner(true);
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
        await axiosInstance.post(`/guests`, {
          fullName: manualName,
          email: manualEmail,
          age: 0,
          phoneNumber: phoneNumber,
          eventId: id,
          attendance_status: true,
        });

        setManualCheckInOpen(false);
        const guest: Guest = {
          _id: "000",
          fullName: manualName,
          email: manualEmail,
          attendance_status: true,
          age: 0,
          phoneNumber: phoneNumber,
        };
        setGuest(guest);
        setManualName("");
        setmanualEmail("");
        setPhoneNumber("");
        fetchEvent();
      } catch (error) {
        addToast(`Error saving guest: ${error}`, ToastType.ERROR);
      }
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (guest) {
      timeout = setTimeout(() => {
        setGuest(null);
        fetchEvent();
      }, 10000);
    }

    return () => clearTimeout(timeout);
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

  const guestsPresent = event?.guests.filter(
    (guest) => guest.attendance_status === true
  );

  const eventGuests = event?.guests.map((guest) => guest._id) || [];

  return (
    <WelcomeScreenWrapper
      backgroundColor={event?.welcomeScreenParams.backgroundColor}
      textColor={event?.welcomeScreenParams.textColor}
    >
      <BackButton
        onClick={() => navigate(-1)}
        color={event?.welcomeScreenParams.textColor || "white"}
      >
        <BackArrowIcon />
        {id ? "Back" : "Exit"}
      </BackButton>

      <WaveBackground
        color={event?.welcomeScreenParams.textColor}
        isVisible={guest === null}
      />
      {/* <GuestWelcomeView
        guest={{
          _id: "000",
          fullName: "John Doe",
          email: "john.doe@example.com",
          attendance_status: true,
          age: 0,
          phoneNumber: "1234567890",
        }}
        event={event}
      /> */}
      {showSpinner ? (
        <Spinner isVisible={loading} />
      ) : id ? (
        <>
          {guest ? (
            <GuestWelcomeView guest={guest} event={event} />
          ) : (
            <Container isVisible={guest === null}>
              {isManualCheckInOpen ? (
                <ManualCheckInForm
                  manualName={manualName}
                  setManualName={setManualName}
                  manualEmail={manualEmail}
                  setManualEmail={setmanualEmail}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  onBack={() => setManualCheckInOpen(false)}
                  onSubmit={addGuestManually}
                />
              ) : (
                <ScannerView
                  event={event}
                  guestsPresent={guestsPresent}
                  eventGuests={eventGuests}
                  setGuest={setGuest}
                  setManualCheckInOpen={setManualCheckInOpen}
                  formatDate={formatDate}
                />
              )}
            </Container>
          )}
        </>
      ) : (
        <EventSelectionView
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          handleOpenEvent={handleOpenEvent}
        />
      )}

      <Toasts />
    </WelcomeScreenWrapper>
  );
};

export default WelcomeScreen;

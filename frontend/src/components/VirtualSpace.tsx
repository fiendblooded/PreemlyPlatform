import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event } from "../types";

// Modern color palette to match other components
const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  shadow: "rgba(0, 0, 0, 0.05)",
  error: "#EF4444",
  success: "#10B981",
  yellow: "#F59E0B",
  green: "#10B981",
};

const SpaceWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.backgroundSecondary};
  font-family: Axiforma, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-size: 16px;
`;

const HeaderCard = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 40vh;
  min-height: 250px;
  background-color: #000;
  background-image: ${(props) =>
    props.posterUrl ? `url(${props.posterUrl})` : "none"};
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 0;
  }
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px 24px;
  z-index: 1;
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-family: Axiforma, sans-serif;
  line-height: 1.2;
`;

const EventName = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 24px;
  margin: 0;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: Axiforma, sans-serif;
`;

const ContentSection = styled.div`
  padding: 32px 24px;
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  color: ${colors.textPrimary};
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  font-family: Axiforma, sans-serif;
`;

const ViewAllLink = styled.a`
  color: ${colors.primary};
  font-size: 18px;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 8px;
  background-color: rgba(99, 102, 241, 0.1);
  transition: all 0.2s ease;
  font-family: Axiforma, sans-serif;

  &:hover {
    background-color: rgba(99, 102, 241, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  margin-left: 24px;
  margin-bottom: 32px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 10px;
    width: 3px;
    background-color: ${colors.borderLight};
    z-index: 0;
  }
`;

const TimeMarker = styled.div`
  color: ${colors.textSecondary};
  font-size: 18px;
  font-weight: 600;
  margin-left: -24px;
  position: relative;
  z-index: 1;
  padding: 12px 0;
  font-family: Axiforma, sans-serif;
`;

const ScheduleCard = styled.div<{ isActive?: boolean }>`
  background-color: ${colors.backgroundLight};
  border-radius: 16px;
  box-shadow: 0 4px 16px ${colors.shadow};
  padding: 24px;
  margin: 12px 0 24px 32px;
  position: relative;
  transition: all 0.2s ease;
  border: 1px solid ${colors.borderLight};

  &::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${(props) =>
      props.isActive ? colors.green : colors.yellow};
    left: -40px;
    top: 24px;
    z-index: 1;
    border: 3px solid white;
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.isActive ? `${colors.green}30` : `${colors.yellow}30`};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${colors.shadow};
  }
`;

const SessionTitle = styled.h3`
  color: ${colors.textPrimary};
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  font-family: Axiforma, sans-serif;
`;

const SessionDetails = styled.p`
  color: ${colors.textSecondary};
  font-size: 18px;
  margin: 0;
  font-family: Axiforma, sans-serif;
  line-height: 1.5;
`;

const SessionIcon = styled.span`
  margin-right: 12px;
  font-size: 24px;
`;

const FeedbackSection = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px ${colors.shadow};
  border: 1px solid ${colors.borderLight};
  margin-top: 32px;
`;

const FeedbackLabel = styled.div`
  color: ${colors.textSecondary};
  font-size: 22px !important;
  margin-bottom: 24px;
`;

const FeedbackInput = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 16px 20px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-family: Axiforma, sans-serif;
  font-size: 24px;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};
  box-shadow: 0 2px 4px ${colors.shadow};
  margin-bottom: 8px;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.8;
  }

  &:hover {
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const NameInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-family: Axiforma, sans-serif;
  font-size: 24px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};
  margin-bottom: 24px;
  box-shadow: 0 2px 4px ${colors.shadow};

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.8;
  }

  &:hover {
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(
    135deg,
    ${colors.primary} 0%,
    ${colors.primaryHover} 100%
  );
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
  font-family: Axiforma, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  border-top-color: ${colors.primary};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: rgba(239, 68, 68, 0.1);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin: 32px;
  font-size: 20px;
  font-family: Axiforma, sans-serif;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${colors.success};
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: slideUp 0.3s ease forwards;
  z-index: 100;
  font-family: Axiforma, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  text-align: center;
  justify-content: center;

  &::before {
    content: "✓";
    font-weight: bold;
    font-size: 22px;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

// Sample schedule data
const sampleSchedule = [
  {
    id: 1,
    title: "Speakers Introduction",
    time: "08:00 - 09:00",
    location: "Main Hall",
    icon: "🎤",
  },
  {
    id: 2,
    title: "Group Photo Session",
    time: "10:00 - 11:00",
    location: "Auditorium 1",
    icon: "📷",
  },
  {
    id: 3,
    title: "Keynote Speech",
    time: "11:30 - 12:30",
    location: "Main Stage",
    icon: "🎯",
  },
  {
    id: 4,
    title: "Networking Lunch",
    time: "13:00 - 14:00",
    location: "Dining Hall",
    icon: "🍽️",
  },
];

const VirtualSpace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentTime] = useState(new Date());

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}`
        );
        setEvent(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          "Failed to load event details. The event may not exist or you may not have access."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestName(e.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter your feedback before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}/feedback`,
        {
          guestName: guestName.trim() || undefined,
          content: feedback.trim(),
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setFeedback("");
        setGuestName("");

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to check if a session is currently active
  const isSessionActive = (sessionTime: string) => {
    const [startStr, endStr] = sessionTime.split(" - ");
    const [startHour, startMin] = startStr.split(":").map(Number);
    const [endHour, endMin] = endStr.split(":").map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0);

    return currentTime >= sessionStart && currentTime <= sessionEnd;
  };

  if (loading) {
    return (
      <SpaceWrapper>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </SpaceWrapper>
    );
  }

  if (error || !event) {
    return (
      <SpaceWrapper>
        <ErrorMessage>
          {error || "Event not found. Please check the URL and try again."}
        </ErrorMessage>
      </SpaceWrapper>
    );
  }

  return (
    <SpaceWrapper>
      <HeaderCard posterUrl={event.poster || undefined}>
        <HeaderContent>
          <WelcomeText>Welcome!</WelcomeText>
          <EventName>
            This is your Virtual Space for the {event.title}
          </EventName>
        </HeaderContent>
      </HeaderCard>

      <ContentSection>
        <SectionHeader>
          <SectionTitle>Schedule</SectionTitle>
          {/* <ViewAllLink href="#">View all</ViewAllLink> */}
        </SectionHeader>

        <TimelineContainer>
          <TimeMarker>08:00</TimeMarker>
          <ScheduleCard isActive={isSessionActive(sampleSchedule[0].time)}>
            <SessionTitle>
              <SessionIcon>{sampleSchedule[0].icon}</SessionIcon>
              {sampleSchedule[0].title}
            </SessionTitle>
            <SessionDetails>
              {sampleSchedule[0].time} | {sampleSchedule[0].location}
            </SessionDetails>
          </ScheduleCard>

          <TimeMarker>09:00</TimeMarker>

          <TimeMarker>10:00</TimeMarker>
          <ScheduleCard isActive={isSessionActive(sampleSchedule[1].time)}>
            <SessionTitle>
              <SessionIcon>{sampleSchedule[1].icon}</SessionIcon>
              {sampleSchedule[1].title}
            </SessionTitle>
            <SessionDetails>
              {sampleSchedule[1].time} | {sampleSchedule[1].location}
            </SessionDetails>
          </ScheduleCard>

          <TimeMarker>11:00</TimeMarker>
          <ScheduleCard isActive={isSessionActive(sampleSchedule[2].time)}>
            <SessionTitle>
              <SessionIcon>{sampleSchedule[2].icon}</SessionIcon>
              {sampleSchedule[2].title}
            </SessionTitle>
            <SessionDetails>
              {sampleSchedule[2].time} | {sampleSchedule[2].location}
            </SessionDetails>
          </ScheduleCard>
        </TimelineContainer>

        <FeedbackSection>
          <SectionTitle>Feedback form</SectionTitle>
          <FeedbackLabel>
            Let us know what you liked or disliked about the event
          </FeedbackLabel>
          <NameInput
            value={guestName}
            onChange={handleGuestNameChange}
            placeholder="Your name (optional)"
          />
          <FeedbackInput
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Give us your thoughts here..."
          />
          <SubmitButton onClick={handleSubmitFeedback} disabled={submitting}>
            {submitting
              ? "Submitting..."
              : submitSuccess
              ? "Thank you!"
              : "Submit"}
          </SubmitButton>
        </FeedbackSection>
      </ContentSection>

      {submitSuccess && (
        <SuccessMessage>Feedback submitted successfully!</SuccessMessage>
      )}
    </SpaceWrapper>
  );
};

export default VirtualSpace;

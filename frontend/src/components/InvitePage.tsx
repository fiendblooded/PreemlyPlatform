import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event } from "../types/event";
import { Guest } from "../types";

// Design tokens for consistent styling
const colors = {
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  error: "#EF4444",
  errorLight: "#FEE2E2",
};

const designTokens = {
  borderRadius: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
  },
};

const InviteWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(135deg, ${colors.primaryLight} 0%, #ffffff 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  position: relative;
  overflow-y: auto;
  font-size: 16px;
  color: ${colors.textPrimary};
  scroll-behavior: smooth;
  padding: ${designTokens.spacing.lg} 0;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  width: 100%;
  background: ${colors.backgroundLight};
  border-radius: ${designTokens.borderRadius.lg};
  padding: ${designTokens.spacing.lg};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.lg};
  margin: ${designTokens.spacing.md} 0;
  position: relative;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${colors.primary} 0%,
      ${colors.primaryDark} 100%
    );
  }

  @media (max-width: ${designTokens.breakpoints.md}) {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    min-height: unset;
    padding: ${designTokens.spacing.md};
    background: ${colors.backgroundLight};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xl};
    margin: ${designTokens.spacing.lg} 0;
  }
`;

const EventPoster = styled.img`
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: ${designTokens.borderRadius.md};
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 40vh;
  object-fit: cover;
  border: 2px solid ${colors.primaryLight};
  box-sizing: border-box;

  @media (max-width: ${designTokens.breakpoints.md}) {
    border-radius: 0;
    max-height: 30vh;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    max-height: none;
  }
`;

const EventTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
  line-height: 1.2;
  position: relative;
  padding-bottom: ${designTokens.spacing.sm};
  box-sizing: border-box;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${colors.primary};
    border-radius: 2px;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 32px;
  }
`;

const EventDescription = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  line-height: 1.6;
  margin: 0;
  padding: 0 ${designTokens.spacing.md};
  box-sizing: border-box;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 18px;
  }
`;

const GuestName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  padding: ${designTokens.spacing.md} 0;
  background: ${colors.primaryLight};
  border-radius: ${designTokens.borderRadius.md};
  position: relative;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${designTokens.borderRadius.md};
    border: 1px solid ${colors.primary};
    opacity: 0.2;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 24px;
    padding: ${designTokens.spacing.lg} 0;
  }
`;

const QRCodeContainer = styled.div`
  background: ${colors.backgroundLight};
  padding: ${designTokens.spacing.md};
  border-radius: ${designTokens.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: inline-block;
  margin: 0 auto;
  width: 100%;
  max-width: 300px;
  border: 2px solid ${colors.primaryLight};
  position: relative;
  box-sizing: border-box;
  margin-bottom: ${designTokens.spacing.lg};
  &::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: ${designTokens.borderRadius.md};
    background: linear-gradient(
      45deg,
      ${colors.primary} 0%,
      ${colors.primaryDark} 100%
    );
    opacity: 0.1;
    z-index: -1;
  }

  @media (max-width: ${designTokens.breakpoints.md}) {
    max-width: 250px;
    padding: ${designTokens.spacing.sm};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    max-width: 400px;
    padding: ${designTokens.spacing.lg};
  }
`;

const QRCode = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const WelcomeMessage = styled.p`
  font-size: 18px;
  color: ${colors.textPrimary};
  margin: 0;
  font-weight: 500;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: ${designTokens.spacing.md};
  background: ${colors.backgroundSecondary};
  padding: ${designTokens.spacing.lg};
  text-align: center;
  box-sizing: border-box;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  border-top-color: ${colors.primary};
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textSecondary};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: ${colors.errorLight};
  padding: ${designTokens.spacing.lg};
  border-radius: ${designTokens.borderRadius.lg};
  text-align: center;
  margin: ${designTokens.spacing.lg};
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};
  box-sizing: border-box;

  &::before {
    content: "⚠️";
    font-size: 28px;
    margin-bottom: ${designTokens.spacing.sm};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin: ${designTokens.spacing.xl};
  }
`;

const InvitePage: React.FC = () => {
  const { eventId, guestId } = useParams<{
    eventId: string;
    guestId: string;
  }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set viewport meta tag for better mobile experience
    const metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
    document.head.appendChild(metaViewport);

    // Add status bar color for iOS
    const metaStatusBar = document.createElement("meta");
    metaStatusBar.name = "apple-mobile-web-app-status-bar-style";
    metaStatusBar.content = "black-translucent";
    document.head.appendChild(metaStatusBar);

    // Add web app capable meta for iOS
    const metaWebApp = document.createElement("meta");
    metaWebApp.name = "apple-mobile-web-app-capable";
    metaWebApp.content = "yes";
    document.head.appendChild(metaWebApp);

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching event with ID:", eventId);
        console.log("Fetching guest with ID:", guestId);

        // Get event details
        const eventResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`
        );
        console.log("Event response:", eventResponse.data);

        // Get guest details
        const guestResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/guests/${guestId}`
        );
        console.log("Guest response:", guestResponse.data);

        if (!eventResponse.data || !eventResponse.data.data) {
          throw new Error("Invalid event data received");
        }

        if (!guestResponse.data || !guestResponse.data.data) {
          throw new Error("Invalid guest data received");
        }

        setEvent(eventResponse.data.data);
        setGuest(guestResponse.data.data);
      } catch (error) {
        console.error("Detailed error:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error response:", error.response?.data);
          setError(
            error.response?.data?.message ||
              "Failed to load invitation. Please check the link and try again."
          );
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load invitation. Please check the link and try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId && guestId) {
      fetchData();
    }

    // Clean up meta tags on unmount
    return () => {
      document.head.removeChild(metaViewport);
      document.head.removeChild(metaStatusBar);
      document.head.removeChild(metaWebApp);
    };
  }, [eventId, guestId]);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your invitation...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !event || !guest) {
    return (
      <InviteWrapper>
        <ErrorMessage>
          {error ||
            "Invitation not found. Please check the link and try again."}
        </ErrorMessage>
      </InviteWrapper>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    guestId || ""
  )}&size=320x320&color=000000&bgcolor=FFFFFF`;

  return (
    <InviteWrapper>
      <ContentContainer>
        {event.poster && <EventPoster src={event.poster} alt={event.title} />}
        <EventTitle>{event.title}</EventTitle>
        <EventDescription>{event.description}</EventDescription>
        <GuestName>Welcome, {guest.fullName}!</GuestName>
        <WelcomeMessage>Show this QR code at the entrance</WelcomeMessage>
        <QRCodeContainer>
          <QRCode src={qrCodeUrl} alt="Your QR Code" />
        </QRCodeContainer>
      </ContentContainer>
    </InviteWrapper>
  );
};

export default InvitePage;

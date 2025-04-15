import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";
import { Event } from "../types/event";
import { getMailHtml, type ScheduleItem } from "../common/common";

// Define the EmailExtraModule type based on what's in common.ts
type EmailExtraModule = {
  enabled: boolean;
  content: string;
  items?: ScheduleItem[];
};

// Add global styles for background animation
const GlobalAnimationStyles = createGlobalStyle`
  @property --hue1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  
  @property --hue2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  
  @keyframes anim_bg {
    0% {
      --hue1: 0deg;
      --hue2: 300deg;
    }
  
    100% {
      --hue1: 360deg;
      --hue2: 660deg;
    }
  }
`;

// Modern color palette with gradients
const colors = {
  primary: "#4F46E5", // Indigo
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",
  primaryGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  secondary: "#EC4899", // Pink
  secondaryLight: "#FCE7F3",
  secondaryGradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
  accent: "#06B6D4", // Cyan
  accentLight: "#CFFAFE",
  accentGradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  success: "#10B981", // Green
  successLight: "#D1FAE5",
  successGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  error: "#EF4444", // Red
  errorLight: "#FEE2E2",
  warning: "#F59E0B", // Amber
  warningLight: "#FEF3C7",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  borderLight: "#E5E7EB",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  backgroundTertiary: "#F3F4F6",
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  glass: "rgba(255, 255, 255, 0.8)",
  glassCard: "rgba(255, 255, 255, 0.7)",
  darkGlass: "rgba(0, 0, 0, 0.7)",
  white: "#FFFFFF",
};

// Modern typography
const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Design tokens with improved desktop spacing
const designTokens = {
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  animation: {
    fast: "0.2s ease",
    medium: "0.3s ease",
    slow: "0.5s ease",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
};

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  position: relative;
  font-size: 16px;
  color: ${colors.textPrimary};
  overflow-x: hidden;

  /* Background animation */
  background-image: linear-gradient(
      in oklch longer hue to right,
      oklch(0.93 0.08 var(--hue1) / 50%),
      oklch(0.93 0.08 var(--hue2) / 50%)
    ),
    linear-gradient(
      in oklch longer hue to bottom,
      oklch(0.93 0.08 var(--hue1) / 50%),
      oklch(0.93 0.08 var(--hue2) / 50%)
    );
  background-size: 100% 100%;
  animation-name: anim_bg;
  animation-duration: 5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  /* Fallback background for browsers that don't support custom properties */
  @supports not (
    background:
      linear-gradient(
        in oklch longer hue to right,
        oklch(0.93 0.08 0deg / 50%),
        oklch(0.93 0.08 300deg / 50%)
      )
  ) {
    background-image: linear-gradient(to bottom, #f9fafb, #f3f4f8);
  }
`;

const ContentSection = styled.div`
  padding: 0 3rem;
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 3rem;
  padding-bottom: 3rem;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
`;

const EventContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  box-shadow: ${designTokens.shadows.xl};
  overflow: hidden;
  margin-bottom: 2rem;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.7);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 22px 45px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 992px) {
    flex-direction: column-reverse;
  }
`;

const EventDetailsSection = styled.div`
  flex: 1;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const EventPosterSection = styled.div`
  width: 400px;
  height: 400px;
  flex-shrink: 0;
  background-color: #000;
  position: relative;
  overflow: hidden;

  @media (max-width: 992px) {
    width: 100%;
    height: 300px;
  }
`;

const EventPoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
`;

const PosterOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: 1;
`;

const EventTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: ${fontWeights.bold};
  color: ${colors.textPrimary};
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const EventDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${colors.textSecondary};
  margin: 0;
  max-height: 170px;
  overflow-y: auto;
  padding-right: 6px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.12) rgba(0, 0, 0, 0.03);
`;

const EventMetaInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: ${colors.textPrimary};
  margin-top: 0.5rem;
  gap: 1.5rem;
`;

const EventMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EventDateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
`;

const EventLocationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
`;

const FormCard = styled.div`
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  box-shadow: ${designTokens.shadows.xl};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.7);
  transform: translateY(0);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 22px 45px rgba(0, 0, 0, 0.08);
  }
`;

const CardBody = styled.div`
  padding: 2.5rem;
  padding-top: 2rem;
`;

const FormTitle = styled.div`
  font-size: 1.75rem;
  font-weight: ${fontWeights.bold};
  margin-bottom: 1rem;
  color: ${colors.textPrimary};
  letter-spacing: -0.01em;
`;

const FormDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${colors.textSecondary};
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 0.95rem;
  font-weight: ${fontWeights.medium};
  margin-bottom: 0.5rem;
  transition: color 0.2s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 1.05rem;
  transition: all ${designTokens.animation.fast};
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  height: 50px;

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px ${colors.primaryLight};
  }

  &:hover:not(:focus) {
    border-color: #c0c5d0;
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: ${colors.errorLight};
  padding: 0.75rem 1rem;
  border-radius: ${designTokens.borderRadius.md};
  margin-top: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: "⚠️";
    font-size: 1.1rem;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 1.5rem 0;
  cursor: pointer;
  user-select: none;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: ${designTokens.borderRadius.md};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.backgroundTertiary};
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  appearance: none;
  background-color: ${colors.backgroundLight};
  border: 2px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.sm};
  transition: all ${designTokens.animation.fast};
  position: relative;
  flex-shrink: 0;

  &:checked {
    background-color: ${colors.primary};
    border-color: ${colors.primary};

    &::after {
      content: "";
      position: absolute;
      top: 25%;
      left: 40%;
      width: 25%;
      height: 50%;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-50%, -50%);
    }
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }
`;

const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: ${colors.textSecondary};
  cursor: pointer;
  line-height: 1.5;
  flex: 1;
  padding-top: 0.15rem;
`;

const SubmitButton = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${designTokens.animation.medium};
  margin-top: 1.75rem;
  box-shadow: ${designTokens.shadows.lg};
  height: 52px;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.xl};
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s ease;
  }

  &:hover:before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${designTokens.spacing.xl};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${colors.primaryLight};
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: ${designTokens.spacing.md};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textPrimary};
  font-size: 1.1rem;
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${designTokens.spacing.xl};
  text-align: center;
  background-color: ${colors.backgroundSecondary};
`;

const ErrorCard = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: ${designTokens.borderRadius.lg};
  box-shadow: ${designTokens.shadows.xl};
  padding: ${designTokens.spacing.xl};
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  border: 1px solid ${colors.errorLight};
`;

const ErrorTitle = styled.h2`
  color: ${colors.error};
  font-size: 2rem;
  margin-bottom: ${designTokens.spacing.lg};
  font-weight: ${fontWeights.bold};
`;

const ErrorMessageText = styled.p`
  color: ${colors.textPrimary};
  font-size: 1.2rem;
  margin-bottom: ${designTokens.spacing.xl};
  line-height: 1.6;
`;

const RetryButton = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: ${designTokens.spacing.md} ${designTokens.spacing.xl};
  font-size: 1.1rem;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  transition: all ${designTokens.animation.medium};
  box-shadow: ${designTokens.shadows.md};
  margin-top: ${designTokens.spacing.lg};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`;

// Helper function to format the date string
const formatEventDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Date to be announced";
  }
};

const GuestRegistrationDesktop: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gdprConsent: false,
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gdprConsent: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`
        );
        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          setError("Failed to load event details");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {
      fullName: "",
      email: "",
      phoneNumber: "",
      gdprConsent: "",
    };

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.gdprConsent) {
      errors.gdprConsent = "You must accept the GDPR consent";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/guests`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          gdpr_consent: formData.gdprConsent,
          eventId: eventId,
          attendance_status: false,
          age: 0,
          email_sent: false,
        }
      );

      if (response.data.success) {
        // Send the invitation email
        if (event) {
          await sendInvitationEmail(response.data.data, event);
        }

        // Redirect to invite page after successful registration
        navigate(`/invites/${eventId}/${response.data.data._id}`);
      } else {
        setRegistrationError(true);
      }
    } catch (err) {
      console.error("Error registering guest:", err);
      setRegistrationError(true);
    }
  };

  // Send invitation email to the newly registered guest
  const sendInvitationEmail = async (
    guest: {
      _id: string;
      email: string;
      fullName: string;
    },
    eventDetails: Event
  ) => {
    try {
      const qrContent = guest._id.toString();
      const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrContent
      )}&size=320x320&color=000000&bgcolor=FFFFFF`;

      const emails = [
        {
          recipient: guest.email.toLowerCase(),
          guestName: guest.fullName,
          qrCode: qrCodeBase64,
        },
      ];

      // Create schedule items safely - using type assertion at the parent level
      const scheduleModule = eventDetails.emailParams
        ?.scheduleSrc as unknown as EmailExtraModule;
      const scheduleItems = scheduleModule?.items || [];

      // Send the invitation email
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/mail`, {
        subject: `${eventDetails.title} - here's your ticket!`,
        htmlTemplate: getMailHtml(
          "{{guestName}}",
          "{{qrCode}}",
          eventDetails.title,
          eventDetails.poster || "",
          eventDetails.description,
          eventDetails.date,
          eventDetails.endDate,
          {
            enabled: eventDetails.emailParams?.parking?.enabled || false,
            content: eventDetails.emailParams?.parking?.content || "",
          } as EmailExtraModule,
          {
            enabled: scheduleModule?.enabled || false,
            content: scheduleModule?.content || "",
            items: scheduleItems,
          },
          {
            enabled: eventDetails.emailParams?.dining?.enabled || false,
            content: eventDetails.emailParams?.dining?.content || "",
          } as EmailExtraModule,
          eventDetails.location?.address || "",
          false,
          eventDetails.emailParams?.customHtmlTemplate?.enabled
            ? eventDetails.emailParams?.customHtmlTemplate.content
            : undefined,
          eventDetails.emailParams?.virtualSpace?.enabled
            ? `https://platform.preemly.eu/space/${eventDetails._id}`
            : undefined
        ),
        emails,
        eventId: eventDetails._id,
      });

      // Update the email_sent status to true
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/mail/update-status`,
        {
          guestIds: [guest._id],
        }
      );
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // We don't set registration error here as the guest is already registered
    }
  };

  const handleRetry = () => {
    setRegistrationError(false);
  };

  return (
    <>
      <GlobalAnimationStyles />
      <PageWrapper>
        <ContentSection>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading event details...</LoadingText>
            </LoadingContainer>
          ) : error || !event ? (
            <LoadingContainer>
              <LoadingText style={{ color: colors.error }}>{error}</LoadingText>
            </LoadingContainer>
          ) : registrationError ? (
            <ErrorContainer>
              <ErrorCard>
                <ErrorTitle>Registration Failed</ErrorTitle>
                <ErrorMessageText>
                  We're sorry, but we couldn't complete your registration at
                  this time. Please try again later or contact the event
                  organizer for assistance.
                </ErrorMessageText>
                <RetryButton onClick={handleRetry}>Try Again</RetryButton>
              </ErrorCard>
            </ErrorContainer>
          ) : (
            <>
              <EventContainer>
                <EventDetailsSection>
                  <EventTitle>{event.title}</EventTitle>
                  <EventDescription>
                    {event.description || "Join us for this exciting event!"}
                  </EventDescription>
                  <EventMetaInfo>
                    <EventMetaItem>
                      <EventDateIcon>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 2V6M8 2V6M3 10H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </EventDateIcon>
                      {formatEventDate(event.date)}
                    </EventMetaItem>
                    <EventMetaItem>
                      <EventLocationIcon>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </EventLocationIcon>
                      {event.location?.address || "Location to be announced"}
                    </EventMetaItem>
                  </EventMetaInfo>
                </EventDetailsSection>
                <EventPosterSection>
                  {event.poster && (
                    <EventPoster src={event.poster} alt={event.title} />
                  )}
                  <PosterOverlay />
                </EventPosterSection>
              </EventContainer>

              <FormCard>
                <CardBody>
                  <form onSubmit={handleSubmit}>
                    <FormTitle>Registration Form</FormTitle>
                    <FormDescription>
                      Please fill out the form below to register for the event.
                    </FormDescription>

                    <FormGroup>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                      {formErrors.fullName && (
                        <ErrorMessage>{formErrors.fullName}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                      {formErrors.email && (
                        <ErrorMessage>{formErrors.email}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="phoneNumber">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                      {formErrors.phoneNumber && (
                        <ErrorMessage>{formErrors.phoneNumber}</ErrorMessage>
                      )}
                    </FormGroup>

                    <CheckboxContainer>
                      <Checkbox
                        id="gdprConsent"
                        name="gdprConsent"
                        checked={formData.gdprConsent}
                        onChange={handleInputChange}
                      />
                      <CheckboxLabel htmlFor="gdprConsent">
                        I agree to the processing of my personal data in
                        accordance with GDPR
                      </CheckboxLabel>
                    </CheckboxContainer>
                    {formErrors.gdprConsent && (
                      <ErrorMessage>{formErrors.gdprConsent}</ErrorMessage>
                    )}

                    <SubmitButton type="submit">Register</SubmitButton>
                  </form>
                </CardBody>
              </FormCard>
            </>
          )}
        </ContentSection>
      </PageWrapper>
    </>
  );
};

export default GuestRegistrationDesktop;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event } from "../types/event";

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

// Design tokens with improved mobile spacing
const designTokens = {
  borderRadius: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
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
  // Add responsive breakpoints
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
  },
};

const SpaceWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.backgroundSecondary};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-size: 16px;
  color: ${colors.textPrimary};
  scroll-behavior: smooth;
  padding-bottom: env(safe-area-inset-bottom, 0);

  /* Mobile-first approach - base styles are for mobile */
  font-size: 16px;

  /* Then adjust for larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
  }
`;

const HeaderCard = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 35vh; /* Reduced height for mobile */
  min-height: 250px;
  background-color: #000;
  background-image: ${(props) =>
    props.posterUrl ? `url(${props.posterUrl})` : colors.primaryGradient};
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 0;
  }

  /* Modern curved bottom edge */
  &::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 24px;
    background: ${colors.backgroundSecondary};
    border-radius: 24px 24px 0 0;
    z-index: 1;
  }

  /* Increase height on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    height: 40vh;
    min-height: 280px;

    &::before {
      height: 32px;
      border-radius: 32px 32px 0 0;
    }
  }
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};

  /* Add more padding on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xxl} ${designTokens.spacing.xl};
  }
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 28px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  letter-spacing: -0.5px;

  /* Increase size on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 34px;
  }
`;

const EventName = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin: 0 0 ${designTokens.spacing.md};
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: ${fontWeights.medium};
  max-width: 100%;

  /* Adjust for larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 20px;
    margin: 0 0 ${designTokens.spacing.lg};
    max-width: 90%;
  }
`;

const ContentSection = styled.div`
  padding: ${designTokens.spacing.lg} ${designTokens.spacing.md};
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  margin-bottom: 32px;
  /* Add more padding on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
    max-width: 800px;
  }
`;

const Card = styled.div`
  background-color: ${colors.white};
  border-radius: ${designTokens.borderRadius.lg};
  box-shadow: ${designTokens.shadows.md};
  padding: ${designTokens.spacing.xl};
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xxl};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${designTokens.spacing.xl};
  width: 100%;
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  margin-bottom: ${designTokens.spacing.md};
  padding-left: ${designTokens.spacing.xs};

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 14px;
    margin-bottom: ${designTokens.spacing.sm};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 24px;
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 18px;
  transition: all ${designTokens.animation.fast};
  box-sizing: border-box;
  background-color: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};
  box-shadow: ${designTokens.shadows.sm};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  height: 72px;

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    background-color: ${colors.white};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
    padding: 20px 24px;
    height: 64px;
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: 14px;
  margin-top: ${designTokens.spacing.sm};
  padding-left: ${designTokens.spacing.xs};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: ${designTokens.spacing.lg} 0;
  cursor: pointer;
  user-select: none;
  padding: ${designTokens.spacing.md};
  border-radius: ${designTokens.borderRadius.md};
  transition: all ${designTokens.animation.fast};
  width: 100%;
  box-sizing: border-box;
  gap: ${designTokens.spacing.md};

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin: ${designTokens.spacing.xl} 0;
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: ${colors.primary};
  border-radius: ${designTokens.borderRadius.sm};
  border: 2px solid ${colors.borderLight};
  transition: all ${designTokens.animation.fast};

  &:checked {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${colors.textSecondary};
  cursor: pointer;
  line-height: 1.4;
  flex: 1;
  padding-top: 2px;
`;

const SubmitButton = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: ${designTokens.spacing.lg};
  font-size: 16px;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${designTokens.animation.medium};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  box-shadow: ${designTokens.shadows.md};
  position: relative;
  overflow: hidden;
  height: 48px;
  margin-top: ${designTokens.spacing.xl};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0)
    );
    opacity: 0;
    transition: opacity ${designTokens.animation.fast};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${designTokens.shadows.sm};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${designTokens.shadows.lg};

      &::before {
        opacity: 1;
      }
    }
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

const GuestRegistration: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        `${import.meta.env.VITE_API_BASE_URL}/events/${eventId}/guests`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          gdpr_consent: formData.gdprConsent,
        }
      );

      if (response.data.success) {
        // Redirect to invite page after successful registration
        navigate(`/invites/${eventId}/${response.data.data._id}`);
      } else {
        setError("Failed to register. Please try again.");
      }
    } catch (err) {
      console.error("Error registering guest:", err);
      setError("Failed to register. Please try again later.");
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading event details...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !event) {
    return (
      <LoadingContainer>
        <LoadingText style={{ color: colors.error }}>{error}</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <SpaceWrapper>
      <HeaderCard posterUrl={event.poster || undefined}>
        <HeaderContent>
          <WelcomeText>Register for the Event</WelcomeText>
          <EventName>{event.title}</EventName>
        </HeaderContent>
      </HeaderCard>

      <ContentSection>
        <Card>
          <form onSubmit={handleSubmit}>
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
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
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
                I agree to the processing of my personal data in accordance with
                GDPR
              </CheckboxLabel>
            </CheckboxContainer>
            {formErrors.gdprConsent && (
              <ErrorMessage>{formErrors.gdprConsent}</ErrorMessage>
            )}

            <SubmitButton type="submit">Register</SubmitButton>
          </form>
        </Card>
      </ContentSection>
    </SpaceWrapper>
  );
};

export default GuestRegistration;

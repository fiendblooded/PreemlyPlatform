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
  background-color: ${colors.backgroundSecondary};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  position: relative;
  font-size: 16px;
  color: ${colors.textPrimary};
  overflow-x: hidden;
  padding: ${designTokens.spacing.xl} 0;
`;

const ContentSection = styled.div`
  padding: 0 3rem;
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  max-width: 900px;
  display: flex;
  align-items: center;
  min-height: 100vh;
`;

const Card = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 1rem;
  box-shadow: ${designTokens.shadows.xl};
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const CardHeader = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 220px;
  background-color: #000;
  background-image: ${(props) =>
    props.posterUrl ? `url(${props.posterUrl})` : colors.primaryGradient};
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
      rgba(0, 0, 0, 0.3) 0%,
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
  padding: ${designTokens.spacing.xl};
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 30px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const CardBody = styled.div`
  padding: 2.25rem;
  padding-top: 1.75rem;
`;

const FormTitle = styled.div`
  font-size: 1.75rem;
  font-weight: ${fontWeights.bold};
  margin-bottom: 0.85rem;
  color: ${colors.textPrimary};
`;

const FormDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.25rem;
  color: ${colors.textSecondary};
  line-height: 1.4;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 1rem;
  font-weight: ${fontWeights.medium};
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem;
  border: 2px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 1.1rem;
  transition: all ${designTokens.animation.fast};
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-sizing: border-box;
  height: 46px;
  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: ${colors.errorLight};
  padding: ${designTokens.spacing.md};
  border-radius: ${designTokens.borderRadius.md};
  margin-top: ${designTokens.spacing.xs};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  &::before {
    content: "⚠️";
    font-size: 1.1rem;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 1rem 0;
  cursor: pointer;
  user-select: none;
  gap: ${designTokens.spacing.sm};
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 22px;
  height: 22px;
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
    box-shadow: 0 0 0 4px ${colors.primaryLight};
  }
`;

const CheckboxLabel = styled.label`
  font-size: 1.05rem;
  color: ${colors.textSecondary};
  cursor: pointer;
  line-height: 1.5;
  flex: 1;
`;

const SubmitButton = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: 0.85rem 1.5rem;
  font-size: 1.1rem;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${designTokens.animation.medium};
  margin-top: 1.25rem;
  box-shadow: ${designTokens.shadows.lg};
  height: 48px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.xl};
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
        }
      );

      if (response.data.success) {
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

  const handleRetry = () => {
    setRegistrationError(false);
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

  if (registrationError) {
    return (
      <ErrorContainer>
        <ErrorCard>
          <ErrorTitle>Registration Failed</ErrorTitle>
          <ErrorMessageText>
            We're sorry, but we couldn't complete your registration at this
            time. Please try again later or contact the event organizer for
            assistance.
          </ErrorMessageText>
          <RetryButton onClick={handleRetry}>Try Again</RetryButton>
        </ErrorCard>
      </ErrorContainer>
    );
  }

  return (
    <PageWrapper>
      <ContentSection>
        <Card>
          <CardHeader posterUrl={event.poster || undefined}>
            <HeaderContent>
              <WelcomeText>{event.title}</WelcomeText>
            </HeaderContent>
          </CardHeader>

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
                  I agree to the processing of my personal data in accordance
                  with GDPR
                </CheckboxLabel>
              </CheckboxContainer>
              {formErrors.gdprConsent && (
                <ErrorMessage>{formErrors.gdprConsent}</ErrorMessage>
              )}

              <SubmitButton type="submit">Register</SubmitButton>
            </form>
          </CardBody>
        </Card>
      </ContentSection>
    </PageWrapper>
  );
};

export default GuestRegistrationDesktop;

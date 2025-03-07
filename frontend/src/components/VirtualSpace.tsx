import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event } from "../types";

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
};

// Modern typography
const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Design tokens
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
`;

const HeaderCard = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 45vh;
  min-height: 280px;
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
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 0;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 40px;
    background: ${colors.backgroundSecondary};
    border-radius: 40px 40px 0 0;
    z-index: 1;
  }
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${designTokens.spacing.xxl} ${designTokens.spacing.xl};
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};

  @media (max-width: 480px) {
    padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  }
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 34px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const EventName = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  margin: 0 0 ${designTokens.spacing.lg};
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: ${fontWeights.medium};
  max-width: 90%;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: ${designTokens.spacing.md};
  }
`;

const ContentSection = styled.div`
  padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;

  @media (max-width: 480px) {
    padding: ${designTokens.spacing.lg} ${designTokens.spacing.md};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${designTokens.spacing.lg};
  padding: 0 ${designTokens.spacing.sm};

  @media (max-width: 480px) {
    margin-bottom: ${designTokens.spacing.md};
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.textPrimary};
  font-size: 24px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${colors.primaryGradient};
    border-radius: ${designTokens.borderRadius.full};
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

// Modern card with subtle shadow
const Card = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: ${designTokens.borderRadius.lg};
  box-shadow: ${designTokens.shadows.md};
  overflow: hidden;
  margin-bottom: ${designTokens.spacing.xl};
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: transform ${designTokens.animation.medium},
    box-shadow ${designTokens.animation.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.lg};
  }
`;

// Modern schedule container
const ScheduleContainer = styled.div`
  margin-bottom: ${designTokens.spacing.xl};
`;

// Modern schedule item
const ScheduleItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  padding: ${designTokens.spacing.lg};
  border-bottom: 1px solid ${colors.borderLight};
  position: relative;
  background-color: ${(props) =>
    props.isActive ? colors.primaryLight : colors.backgroundLight};
  transition: all ${designTokens.animation.fast};

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: ${colors.backgroundTertiary};
  }

  @media (max-width: 480px) {
    padding: ${designTokens.spacing.md};
    flex-wrap: wrap;
  }
`;

const ScheduleIconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${designTokens.borderRadius.md};
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${designTokens.spacing.lg};
  flex-shrink: 0;
  font-size: 22px;
  box-shadow: ${designTokens.shadows.sm};
  color: white;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-right: ${designTokens.spacing.md};
  }
`;

const ScheduleContent = styled.div`
  flex: 1;
  min-width: 0; // Ensures text truncation works properly
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.xs};
`;

const ScheduleTitle = styled.h3`
  color: ${colors.textPrimary};
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 16px;
    display: flex;
    flex-wrap: wrap;
    white-space: normal;
    align-items: center;
  }
`;

const ScheduleDescription = styled.p`
  color: ${colors.textSecondary};
  font-size: 15px;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 480px) {
    font-size: 14px;
    -webkit-line-clamp: 3;
  }
`;

const ScheduleDetails = styled.p`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin: ${designTokens.spacing.xs} 0 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  &::before {
    content: "📍";
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ScheduleTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  padding-left: ${designTokens.spacing.lg};
  min-width: 90px;

  @media (max-width: 480px) {
    padding-left: ${designTokens.spacing.md};
    min-width: 80px;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: ${designTokens.spacing.sm};
    margin-left: 0;
    padding-left: calc(
      40px + ${designTokens.spacing.md} + ${designTokens.spacing.xs}
    );
  }
`;

const ScheduleTime = styled.div`
  color: ${colors.primary};
  font-size: 15px;
  font-weight: ${fontWeights.medium};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const DateBadge = styled.div<{
  isToday?: boolean;
  isTomorrow?: boolean;
  isMultiDay?: boolean;
}>`
  font-size: 12px;
  font-weight: ${fontWeights.medium};
  padding: 3px 10px;
  border-radius: ${designTokens.borderRadius.full};
  margin-top: ${designTokens.spacing.sm};
  background-color: ${(props) =>
    props.isToday
      ? colors.primaryLight
      : props.isTomorrow
      ? colors.secondaryLight
      : props.isMultiDay
      ? colors.accentLight
      : colors.backgroundTertiary};
  color: ${(props) =>
    props.isToday
      ? colors.primary
      : props.isTomorrow
      ? colors.secondary
      : props.isMultiDay
      ? colors.accent
      : colors.textSecondary};

  @media (max-width: 480px) {
    margin-top: 0;
    font-size: 11px;
    padding: 2px 8px;
  }
`;

const MultiDayBadge = styled.span`
  font-size: 11px;
  font-weight: ${fontWeights.medium};
  padding: 2px 6px;
  border-radius: ${designTokens.borderRadius.sm};
  margin-left: ${designTokens.spacing.sm};
  background-color: ${colors.accentLight};
  color: ${colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 1px 5px;
    margin-left: ${designTokens.spacing.xs};
  }
`;

const TimeIcon = styled.span`
  margin-right: ${designTokens.spacing.xs};
  font-size: 14px;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: ${colors.primaryGradient};
  border-radius: 0 ${designTokens.borderRadius.sm}
    ${designTokens.borderRadius.sm} 0;
`;

// Modern form elements
const FormGroup = styled.div`
  margin-bottom: ${designTokens.spacing.lg};
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: ${fontWeights.medium};
  margin-bottom: ${designTokens.spacing.sm};
  padding-left: ${designTokens.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
  transition: all ${designTokens.animation.fast};
  box-sizing: border-box;
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-shadow: ${designTokens.shadows.sm};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 140px;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
  resize: none;
  transition: all ${designTokens.animation.fast};
  box-sizing: border-box;
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-shadow: ${designTokens.shadows.sm};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

// Modern button
const Button = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  font-size: 16px;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  transition: all ${designTokens.animation.medium};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  box-shadow: ${designTokens.shadows.md};
  position: relative;
  overflow: hidden;

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.lg};

    &::before {
      opacity: 1;
    }
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
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: ${designTokens.spacing.lg};
  background: ${colors.backgroundSecondary};
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  border-top-color: ${colors.primary};
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  box-shadow: ${designTokens.shadows.md};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textSecondary};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: ${colors.errorLight};
  padding: ${designTokens.spacing.lg};
  border-radius: ${designTokens.borderRadius.lg};
  text-align: center;
  margin: ${designTokens.spacing.xl};
  font-size: 16px;
  box-shadow: ${designTokens.shadows.md};
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};

  &::before {
    content: "⚠️";
    font-size: 28px;
    margin-bottom: ${designTokens.spacing.sm};
  }
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: ${designTokens.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.successGradient};
  color: white;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.xl};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  box-shadow: ${designTokens.shadows.lg};
  animation: slideUp 0.4s ${designTokens.animation.medium} forwards;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.sm};
  min-width: 280px;
  text-align: center;
  justify-content: center;

  &::before {
    content: "✓";
    font-weight: bold;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.2);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
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

// Add these new styled components
const EventInfoCard = styled.div`
  background: ${colors.glassCard};
  backdrop-filter: blur(10px);
  border-radius: ${designTokens.borderRadius.lg};
  padding: ${designTokens.spacing.lg};
  margin-bottom: ${designTokens.spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: ${designTokens.shadows.lg};
`;

const EventInfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${designTokens.spacing.md};
  gap: ${designTokens.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventInfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${designTokens.borderRadius.md};
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
`;

const EventInfoContent = styled.div`
  flex: 1;
`;

const EventInfoLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-bottom: 2px;
`;

const EventInfoValue = styled.div`
  font-size: 16px;
  color: ${colors.textPrimary};
  font-weight: ${fontWeights.medium};
`;

const SectionDivider = styled.div`
  height: 8px;
  margin: ${designTokens.spacing.xl} 0;
  background: ${colors.backgroundTertiary};
  border-radius: ${designTokens.borderRadius.full};
  width: 100%;
  opacity: 0.6;
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: ${designTokens.spacing.xl};
  color: ${colors.textSecondary};
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};

  &::before {
    content: "📅";
    font-size: 32px;
    margin-bottom: ${designTokens.spacing.sm};
  }
`;

// Define schedule item type
interface ScheduleItem {
  id: number;
  title: string;
  startDateTime: string; // ISO string format
  endDateTime: string; // ISO string format
  location: string;
  icon: string;
  description?: string;
  // Keep time field for backward compatibility, but it will be deprecated
  time?: string;
}

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

  // Schedule state - initialize with empty array
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}`
        );
        setEvent(response.data.data);

        // Use event's schedule items if available
        if (response.data.data.emailParams?.scheduleSrc?.items?.length > 0) {
          setSchedule(response.data.data.emailParams.scheduleSrc.items);
        }

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

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to check if a date is tomorrow
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Helper function to check if two dates are on the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Helper function to format date and time
  const formatTimeRange = (item: ScheduleItem) => {
    // If we have startDateTime and endDateTime, use them
    if (item.startDateTime && item.endDateTime) {
      const start = new Date(item.startDateTime);
      const end = new Date(item.endDateTime);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // If same day, just show time range
      if (isSameDay(start, end)) {
        return formatTime(start) + " - " + formatTime(end);
      }

      // If different days, show abbreviated format
      return formatTime(start) + " - " + formatTime(end);
    }

    // Fallback to time field for backward compatibility
    return item.time || "";
  };

  // Helper function to get date badge text
  const getDateBadgeText = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const sameDay = isSameDay(start, end);

    if (isToday(start)) {
      return sameDay ? "Today" : "Starts Today";
    }

    if (isTomorrow(start)) {
      return sameDay ? "Tomorrow" : "Starts Tomorrow";
    }

    // Return formatted date for other days
    const formattedDate = start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return sameDay ? formattedDate : `From ${formattedDate}`;
  };

  // Helper function to check if a session is currently active
  const isSessionActive = (sessionTime: string, item?: ScheduleItem) => {
    // If we have startDateTime and endDateTime, use them
    if (item && item.startDateTime && item.endDateTime) {
      const sessionStart = new Date(item.startDateTime);
      const sessionEnd = new Date(item.endDateTime);

      return currentTime >= sessionStart && currentTime <= sessionEnd;
    }

    // Legacy format handling
    if (!sessionTime) return false;

    try {
      // Extract start and end times
      const [start, end] = sessionTime.split(" - ");

      // Parse hours and minutes
      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);

      // Create Date objects for comparison
      const sessionStart = new Date();
      sessionStart.setHours(startHour, startMin, 0);

      const sessionEnd = new Date();
      sessionEnd.setHours(endHour, endMin, 0);

      return currentTime >= sessionStart && currentTime <= sessionEnd;
    } catch (error) {
      console.error("Error parsing session time:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <SpaceWrapper>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading your virtual space...</LoadingText>
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
          <EventName>This is your Virtual Space for {event.title}</EventName>
        </HeaderContent>
      </HeaderCard>

      <ContentSection>
        {/* Event Info Card */}
        <EventInfoCard>
          <EventInfoRow>
            <EventInfoIcon>📅</EventInfoIcon>
            <EventInfoContent>
              <EventInfoLabel>Event Date</EventInfoLabel>
              <EventInfoValue>
                {event.date
                  ? new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date not specified"}
              </EventInfoValue>
            </EventInfoContent>
          </EventInfoRow>

          {event.location && (
            <EventInfoRow>
              <EventInfoIcon>📍</EventInfoIcon>
              <EventInfoContent>
                <EventInfoLabel>Location</EventInfoLabel>
                <EventInfoValue>{event.location.address}</EventInfoValue>
              </EventInfoContent>
            </EventInfoRow>
          )}
        </EventInfoCard>

        <SectionHeader>
          <SectionTitle>Schedule</SectionTitle>
        </SectionHeader>

        <Card>
          <ScheduleContainer>
            {schedule.length === 0 ? (
              <EmptyStateMessage>
                No schedule items available for this event.
              </EmptyStateMessage>
            ) : (
              schedule.map((item) => {
                const start = new Date(item.startDateTime);
                const end = new Date(item.endDateTime);
                const sameDay = isSameDay(start, end);
                const isActive = isSessionActive(item.time || "", item);
                const isStartToday = isToday(start);
                const isStartTomorrow = isTomorrow(start);

                return (
                  <ScheduleItem key={item.id} isActive={isActive}>
                    {isActive && <ActiveIndicator />}
                    <ScheduleIconContainer>{item.icon}</ScheduleIconContainer>
                    <ScheduleContent>
                      <ScheduleTitle>
                        {item.title}
                        {!sameDay && <MultiDayBadge>Multi-day</MultiDayBadge>}
                      </ScheduleTitle>
                      {item.description && (
                        <ScheduleDescription>
                          {item.description}
                        </ScheduleDescription>
                      )}
                      <ScheduleDetails>{item.location}</ScheduleDetails>
                    </ScheduleContent>
                    <ScheduleTimeContainer>
                      <ScheduleTime>
                        <TimeIcon>🕒</TimeIcon>
                        {formatTimeRange(item)}
                      </ScheduleTime>
                      {item.startDateTime && (
                        <DateBadge
                          isToday={isStartToday}
                          isTomorrow={isStartTomorrow}
                          isMultiDay={!sameDay}
                        >
                          {getDateBadgeText(
                            item.startDateTime,
                            item.endDateTime
                          )}
                        </DateBadge>
                      )}
                    </ScheduleTimeContainer>
                  </ScheduleItem>
                );
              })
            )}
          </ScheduleContainer>
        </Card>

        <SectionDivider />

        <SectionHeader>
          <SectionTitle>Feedback</SectionTitle>
        </SectionHeader>

        <Card style={{ padding: `${designTokens.spacing.lg}` }}>
          <FormGroup>
            <Label>Your Name (optional)</Label>
            <Input
              value={guestName}
              onChange={handleGuestNameChange}
              placeholder="Enter your name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Your Feedback</Label>
            <TextArea
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder="Let us know what you liked or disliked about the event..."
            />
          </FormGroup>

          <Button onClick={handleSubmitFeedback} disabled={submitting}>
            {submitting
              ? "Submitting..."
              : submitSuccess
              ? "Thank you!"
              : "Submit Feedback"}
          </Button>
        </Card>
      </ContentSection>

      {submitSuccess && (
        <SuccessMessage>Feedback submitted successfully!</SuccessMessage>
      )}
    </SpaceWrapper>
  );
};

export default VirtualSpace;

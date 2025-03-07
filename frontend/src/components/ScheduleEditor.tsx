import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Event, ScheduleItem } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useNavigate } from "react-router-dom";

// Updated color palette with more vibrant, engaging colors
const colors = {
  primary: "#6366F1", // Modern indigo
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#06B6D4", // Cyan for accents
  accentLight: "#CFFAFE",
  textPrimary: "#1E293B", // Slate 800
  textSecondary: "#64748B", // Slate 500
  borderLight: "#E2E8F0", // Slate 200
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC", // Slate 50
  shadow: "rgba(0, 0, 0, 0.08)",
  success: "#10B981", // Emerald 500
  error: "#EF4444", // Red 500
  danger: "#EF4444", // Same as error
  warning: "#F59E0B", // Amber 500
  info: "#3B82F6", // Blue 500
  gray: "#94A3B8", // Slate 400
  grayLight: "#F1F5F9", // Slate 100
  blue: "#3B82F6", // Blue 500
  gradientStart: "#4F46E5",
  gradientEnd: "#7C3AED",
};

// Enhanced typography
const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Main container with consistent styling
const ScheduleWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px ${colors.shadow};
  overflow: hidden;
  font-family: Axiforma, sans-serif;
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid ${colors.borderLight};
  background-color: ${colors.backgroundLight};

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const ScheduleTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "📅";
    font-size: 24px;
  }

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  padding: 24px 32px;

  /* iPad in vertical orientation (portrait) */
  @media (max-width: 820px) and (min-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  /* iPad in horizontal orientation (landscape) */
  @media (max-width: 1180px) and (min-width: 1020px) {
    grid-template-columns: 1fr 320px;
    padding: 20px;
  }

  /* Smaller tablets and mobile */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

const ScheduleListSection = styled.div`
  flex: 1;
  width: 100%;

  /* Ensure content doesn't overflow on iPad */
  @media (max-width: 820px) {
    max-width: 100%;
    overflow-x: hidden;
  }
`;

const ScheduleFormSection = styled.div`
  width: 100%;

  @media (max-width: 1024px) {
    order: -1;
  }

  /* Ensure form doesn't overflow on iPad */
  @media (max-width: 820px) {
    max-width: 100%;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Axiforma, sans-serif;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: ${colors.textSecondary};
  background-color: ${colors.backgroundSecondary};
  border-radius: 8px;
  border: 1px dashed ${colors.borderLight};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.gray};
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
`;

const ScheduleItemCard = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 18px;
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${colors.shadow};
  position: relative;
  border: 1px solid ${colors.borderLight};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
    border-color: ${colors.primary};
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  /* Increase touch target size for iPad */
  @media (max-width: 1024px) {
    padding: 20px;
    margin-bottom: 14px;
  }
`;

const ScheduleIcon = styled.div`
  font-size: 24px;
  margin-right: 16px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${colors.gradientStart},
    ${colors.gradientEnd}
  );
  border-radius: 14px;
  box-shadow: 0 3px 6px ${colors.shadow};
  flex-shrink: 0;
  color: white;
`;

const ScheduleDetails = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ScheduleItemTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
`;

const ScheduleDescription = styled.div`
  font-size: 14px;
  margin: 0;
  color: ${colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`;

const ScheduleTime = styled.div`
  font-size: 14px;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  margin: 0;

  &::before {
    content: "🕒";
    font-size: 14px;
  }
`;

const ScheduleLocation = styled.div`
  font-size: 14px;
  margin: 0;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &::before {
    content: "📍";
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${ScheduleItemCard}:hover & {
    opacity: 1;
  }

  /* Always show buttons on touch devices */
  @media (max-width: 1024px) {
    opacity: 0.8;
  }
`;

const IconButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.backgroundLight};
  border: 1px solid ${colors.borderLight};
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  /* Larger touch targets for iPad */
  @media (max-width: 1024px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;
const EditButton = styled(IconButton)`
  color: ${colors.primary};

  &:hover {
    background-color: ${colors.primary};
    color: white;
    border-color: ${colors.blue};
  }
`;

const DeleteButton = styled(IconButton)`
  color: ${colors.danger};

  &:hover {
    background-color: ${colors.error};
    color: white;
    border-color: ${colors.error};
  }
`;

const FormContainer = styled.div`
  background-color: ${colors.backgroundLight};
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${colors.borderLight};
  box-shadow: 0 2px 4px ${colors.shadow};

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: ${fontWeights.medium};
  color: ${colors.textPrimary};
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;
  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const IconPreview = styled.span`
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: ${colors.primaryLight};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const EmojiPickerContainer = styled.div`
  position: relative;
  margin-top: 8px;
`;

const EmojiPickerWrapper = styled.div`
  position: fixed;
  z-index: 1000;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid ${colors.borderLight};
  overflow: hidden;
  width: 320px;
  background-color: white;

  /* Adjust width for iPad */
  @media (max-width: 820px) {
    width: 280px;
    left: 50% !important;
    transform: translateX(-50%);
  }

  /* Full width on smaller screens */
  @media (max-width: 480px) {
    width: 90%;
    max-width: 320px;
  }
`;

const EmojiPickerToggle = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  background-color: ${colors.backgroundLight};
  border: 1px solid ${colors.borderLight};
  border-radius: 6px;
  color: ${colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  justify-content: space-between;
  font-family: Axiforma, sans-serif;

  &:hover {
    background-color: ${colors.grayLight};
    border-color: ${colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  /* Larger touch targets for iPad */
  @media (max-width: 1024px) {
    padding: 14px 16px;
    font-size: 16px;
    border-radius: 8px;
  }
`;

const ToggleIconSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleText = styled.span`
  flex: 1;
  text-align: left;
  font-family: Axiforma, sans-serif;
`;

const ChevronIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 14px;
  color: ${colors.textSecondary};
  transition: transform 0.2s;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  background: linear-gradient(
    to right,
    ${colors.gradientStart},
    ${colors.gradientEnd}
  );
  color: white;
  font-weight: ${fontWeights.semibold};
  font-size: 16px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  min-width: 120px;
  max-width: fit-content;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const AddButton = styled(Button)`
  background-color: ${colors.primary};
  color: white;
  flex: 0 0 auto;

  &:hover {
    background-color: ${colors.primaryDark};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: none;
  background-color: ${colors.grayLight};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.borderLight};
  flex: 0 0 auto;

  &:hover {
    background-color: ${colors.borderLight};
  }
`;

const DateTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const DateTimeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DateTimeLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textPrimary};
  font-family: Axiforma, sans-serif;
`;

const FormattedDateTime = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 4px;
  font-family: Axiforma, sans-serif;
`;

// Add these styled components for date display
const ScheduleTimeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

const ScheduleDate = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;

  &::before {
    content: "📅";
    font-size: 13px;
  }
`;

const MultiDayBadge = styled.span`
  background-color: ${colors.primaryLight};
  color: ${colors.primary};
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TodayBadge = styled.span`
  background-color: rgba(16, 185, 129, 0.1); // Light green background
  color: ${colors.success};
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Define a type for the emoji object returned by emoji-mart
interface EmojiMartSelection {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

type Props = {
  event: Event;
  refetch: () => void;
};

// Initialize with default values that will be properly saved
const initializeDefaultDateTimes = () => {
  // Create dates with the current time and one hour later
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Format as ISO strings
  const startDateTime = now.toISOString();
  const endDateTime = oneHourLater.toISOString();

  console.log("Initialized default date times:", {
    startDateTime,
    endDateTime,
  });

  return { startDateTime, endDateTime };
};

// Add a helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

// Helper function to check if a date is tomorrow
const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

// Update the formatDate function to handle today and tomorrow
const formatDate = (dateString: string) => {
  try {
    if (!dateString) {
      console.warn("Empty date string passed to formatDate");
      return "Date not set";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date passed to formatDate:", dateString);
      return "Invalid date";
    }

    // Check if the date is today or tomorrow
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    }

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "Date error";
  }
};

const SpaceButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: ${fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.primaryDark};
  }

  svg {
    margin-right: 8px;
  }
`;

const CopyLinkButton = styled(SpaceButton)`
  background-color: ${colors.info};

  &:hover {
    background-color: ${colors.blue};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ScheduleEditor: React.FC<Props> = ({ event, refetch }) => {
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();
  const navigate = useNavigate();

  // Initialize schedule from event data or use default empty array
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    event.emailParams.scheduleSrc.items || []
  );

  // Get default date times
  const defaultDateTimes = initializeDefaultDateTimes();

  const [newScheduleItem, setNewScheduleItem] = useState<Partial<ScheduleItem>>(
    {
      title: "",
      startDateTime: defaultDateTimes.startDateTime,
      endDateTime: defaultDateTimes.endDateTime,
      location: "",
      icon: "🎤",
      description: "",
    }
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Update schedule when event changes
  useEffect(() => {
    setSchedule(event.emailParams.scheduleSrc.items || []);
  }, [event]);
  console.log(event.emailParams.scheduleSrc.items);
  // Helper functions for date/time formatting
  const formatTime = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn("Empty date string passed to formatTime");
        return "Time not set";
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date passed to formatTime:", dateString);
        return "Invalid time";
      }

      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error in formatTime:", error);
      return "Time error";
    }
  };

  const formatTimeRange = (startDateTime: string, endDateTime: string) => {
    try {
      // If either datetime is missing or empty, use default values
      if (
        !startDateTime ||
        !endDateTime ||
        startDateTime === "" ||
        endDateTime === ""
      ) {
        console.warn("Missing or empty date in formatTimeRange", {
          startDateTime,
          endDateTime,
        });

        // Use current time and one hour later as defaults
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        return `${formatTime(now.toISOString())} - ${formatTime(
          oneHourLater.toISOString()
        )}`;
      }

      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date in formatTimeRange", {
          startDateTime,
          endDateTime,
          startValid: !isNaN(start.getTime()),
          endValid: !isNaN(end.getTime()),
        });

        // Use current time and one hour later as defaults
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        return `${formatTime(now.toISOString())} - ${formatTime(
          oneHourLater.toISOString()
        )}`;
      }

      // Just return the time range - the date will be shown separately
      return `${formatTime(startDateTime)} - ${formatTime(endDateTime)}`;
    } catch (error) {
      console.error("Error in formatTimeRange:", error);

      // Use current time and one hour later as defaults
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      return `${formatTime(now.toISOString())} - ${formatTime(
        oneHourLater.toISOString()
      )}`;
    }
  };

  // Generate a time string for backward compatibility
  const generateTimeString = (startDateTime: string, endDateTime: string) => {
    try {
      if (!startDateTime || !endDateTime) {
        console.warn("Missing date in generateTimeString");
        return "";
      }

      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date in generateTimeString");
        return "";
      }

      const startTime = start.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const endTime = end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.error("Error in generateTimeString:", error);
      return "";
    }
  };

  // Save schedule to backend
  const saveScheduleToBackend = async (updatedSchedule: ScheduleItem[]) => {
    try {
      setIsProcessing(true);

      // Log the schedule before validation
      console.log(
        "Schedule before validation:",
        JSON.stringify(updatedSchedule)
      );

      // Ensure all datetime fields are properly formatted as ISO strings
      const validatedSchedule = updatedSchedule.map((item) => {
        // Validate startDateTime
        let startDateTime = item.startDateTime;
        let startDateValid = false;

        try {
          const startDate = new Date(startDateTime);
          startDateValid = !isNaN(startDate.getTime());

          if (!startDateValid) {
            console.warn(
              `Invalid startDateTime for item ${item.id}: ${startDateTime}`
            );
            startDateTime = new Date().toISOString();
          }
        } catch (error) {
          console.error(
            `Error validating startDateTime for item ${item.id}:`,
            error
          );
          startDateTime = new Date().toISOString();
        }

        // Validate endDateTime
        let endDateTime = item.endDateTime;
        let endDateValid = false;

        try {
          const endDate = new Date(endDateTime);
          endDateValid = !isNaN(endDate.getTime());

          if (!endDateValid) {
            console.warn(
              `Invalid endDateTime for item ${item.id}: ${endDateTime}`
            );
            // Default to 1 hour after start time
            const startDate = new Date(startDateTime);
            endDateTime = new Date(
              startDate.getTime() + 60 * 60 * 1000
            ).toISOString();
          }
        } catch (error) {
          console.error(
            `Error validating endDateTime for item ${item.id}:`,
            error
          );
          const startDate = new Date(startDateTime);
          endDateTime = new Date(
            startDate.getTime() + 60 * 60 * 1000
          ).toISOString();
        }

        // Generate time string for backward compatibility
        let timeString = "";
        try {
          timeString = generateTimeString(startDateTime, endDateTime);
        } catch (error) {
          console.error(
            `Error generating time string for item ${item.id}:`,
            error
          );
          timeString = "00:00 - 01:00"; // Fallback
        }

        return {
          ...item,
          startDateTime,
          endDateTime,
          time: timeString,
        };
      });

      // Log the validated schedule
      console.log("Validated schedule:", JSON.stringify(validatedSchedule));

      await axiosInstance.put(`/events/${event._id}`, {
        emailParams: {
          ...event.emailParams,
          scheduleSrc: {
            ...event.emailParams.scheduleSrc,
            items: validatedSchedule,
          },
        },
      });

      addToast("Schedule updated successfully", ToastType.SUCCESS);
      refetch(); // Refresh event data
    } catch (error) {
      console.error("Error saving schedule:", error);
      addToast("Failed to update schedule", ToastType.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle schedule form input changes
  const handleScheduleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setNewScheduleItem((prev) => ({ ...prev, [name]: value }));
  };

  // Add a helper function to format dates for datetime-local input
  const formatDateForInput = (dateString: string): string => {
    try {
      if (!dateString) {
        console.warn("Empty dateString in formatDateForInput");
        return new Date().toISOString().slice(0, 16);
      }

      const date = new Date(dateString);

      // Check if it's a valid date
      if (isNaN(date.getTime())) {
        console.warn(
          "Invalid date encountered in formatDateForInput:",
          dateString
        );
        // Return current date/time as fallback
        return new Date().toISOString().slice(0, 16);
      }

      // Format as YYYY-MM-DDThh:mm (required format for datetime-local)
      // Using direct methods to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log(`Formatted ${dateString} to ${formattedDate} for input`);

      return formattedDate;
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return new Date().toISOString().slice(0, 16);
    }
  };

  // Handle date/time changes
  const handleDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "startDateTime" | "endDateTime"
  ) => {
    const { value } = e.target;
    console.log(`DateTime input changed for ${field}: ${value}`);

    try {
      if (!value) {
        console.warn(`Empty value for ${field}`);
        // Set to default value instead of returning
        const defaultTimes = initializeDefaultDateTimes();
        setNewScheduleItem((prev) => ({
          ...prev,
          [field]:
            field === "startDateTime"
              ? defaultTimes.startDateTime
              : defaultTimes.endDateTime,
        }));
        return;
      }

      // For datetime-local inputs, we need to create a date that preserves the local time
      // The input value is in local time (YYYY-MM-DDThh:mm)
      const [datePart, timePart] = value.split("T");
      if (!datePart || !timePart) {
        console.warn(`Invalid datetime format for ${field}: ${value}`);
        return;
      }

      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      // Validate all parts
      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hours) ||
        isNaN(minutes) ||
        year < 2000 ||
        year > 2100 || // Reasonable year range
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        console.warn(`Invalid date/time components for ${field}:`, {
          year,
          month,
          day,
          hours,
          minutes,
        });
        return;
      }

      // Create a date in the local timezone
      const localDate = new Date();
      localDate.setFullYear(year);
      localDate.setMonth(month - 1); // Month is 0-indexed
      localDate.setDate(day);
      localDate.setHours(hours);
      localDate.setMinutes(minutes);
      localDate.setSeconds(0);
      localDate.setMilliseconds(0);

      // Validate the resulting date
      if (isNaN(localDate.getTime())) {
        console.warn(`Invalid date created for ${field}`);
        return;
      }

      // Convert to ISO string for storage
      const isoString = localDate.toISOString();

      console.log(`Setting ${field} to ${isoString} from input value ${value}`);

      // Update the item
      setNewScheduleItem((prev) => {
        const updated = {
          ...prev,
          [field]: isoString,
        };

        // If this is the start time and it's now after the end time, adjust the end time
        if (field === "startDateTime" && prev.endDateTime) {
          const endDate = new Date(prev.endDateTime);
          if (localDate >= endDate) {
            const newEndDate = new Date(localDate.getTime() + 60 * 60 * 1000);
            updated.endDateTime = newEndDate.toISOString();
            console.log(
              `Adjusted endDateTime to ${updated.endDateTime} to be after startDateTime`
            );
          }
        }

        return updated;
      });
    } catch (error) {
      console.error(`Error in handleDateTimeChange for ${field}:`, error);
      // Set to default value on error
      const defaultTimes = initializeDefaultDateTimes();
      setNewScheduleItem((prev) => ({
        ...prev,
        [field]:
          field === "startDateTime"
            ? defaultTimes.startDateTime
            : defaultTimes.endDateTime,
      }));
    }
  };

  // Add a function to ensure datetime picker opens
  const ensureDatePickerOpens = (e: React.MouseEvent<HTMLInputElement>) => {
    // Some browsers need an extra click to open the picker
    e.currentTarget.showPicker?.();
  };

  // Handle icon selection with proper typing
  const handleIconSelect = (emoji: EmojiMartSelection) => {
    setNewScheduleItem((prev) => ({ ...prev, icon: emoji.native }));
    setShowEmojiPicker(false);
  };

  // Position the emoji picker when it's shown
  useEffect(() => {
    if (showEmojiPicker && emojiButtonRef.current) {
      const buttonRect = emojiButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceRight = window.innerWidth - buttonRect.left;

      // Default position below the button
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;

      // If not enough space below, position above
      if (spaceBelow < 300 && buttonRect.top > 350) {
        top = buttonRect.top - 308; // 300px height + 8px margin
      }

      // If not enough space to the right, align with right edge
      if (spaceRight < 320) {
        left = Math.max(10, buttonRect.right - 320);
      }

      // For iPad in portrait mode, center the picker
      if (window.innerWidth <= 820 && window.innerWidth >= 768) {
        left = window.innerWidth / 2 - 140; // Half of the 280px width
      }

      setPickerPosition({ top, left });
    }
  }, [showEmojiPicker]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker && !target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Start editing an item
  const handleEditItem = (item: ScheduleItem) => {
    console.log("Editing item with data:", {
      id: item.id,
      title: item.title,
      startDateTime: item.startDateTime,
      endDateTime: item.endDateTime,
      location: item.location,
      icon: item.icon,
      description: item.description,
    });

    // Ensure we have valid datetime values
    let startDateTime = item.startDateTime;
    let endDateTime = item.endDateTime;

    // Validate the dates
    try {
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("Invalid dates in item being edited, using defaults");
        const defaultTimes = initializeDefaultDateTimes();
        startDateTime = defaultTimes.startDateTime;
        endDateTime = defaultTimes.endDateTime;
      }

      // Ensure end time is after start time
      if (endDate <= startDate) {
        console.warn("End time is before or equal to start time, fixing");
        const fixedEndDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        endDateTime = fixedEndDate.toISOString();
      }
    } catch (error) {
      console.error("Error validating dates in handleEditItem:", error);
      const defaultTimes = initializeDefaultDateTimes();
      startDateTime = defaultTimes.startDateTime;
      endDateTime = defaultTimes.endDateTime;
    }

    setNewScheduleItem({
      title: item.title,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      location: item.location,
      icon: item.icon,
      description: item.description || "",
    });

    setEditingItemId(item.id);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    const defaultTimes = initializeDefaultDateTimes();

    setNewScheduleItem({
      title: "",
      startDateTime: defaultTimes.startDateTime,
      endDateTime: defaultTimes.endDateTime,
      location: "",
      icon: "🎤",
      description: "",
    });
    setEditingItemId(null);
    setIsEditing(false);
  };

  // Add or update schedule item
  const handleAddOrUpdateScheduleItem = async () => {
    if (!newScheduleItem.title) {
      addToast("Please fill in all required fields", ToastType.ERROR);
      return;
    }

    console.log("Saving item with description:", newScheduleItem.description);

    // Ensure we have valid datetime values
    let startDateTime = newScheduleItem.startDateTime;
    let endDateTime = newScheduleItem.endDateTime;

    // If datetimes are missing, use default values
    if (!startDateTime || !endDateTime) {
      const defaultTimes = initializeDefaultDateTimes();
      startDateTime = defaultTimes.startDateTime;
      endDateTime = defaultTimes.endDateTime;
      console.log("Using default date times for missing values");
    }

    // Validate that dates are valid
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn("Invalid dates detected, using defaults instead");
      const defaultTimes = initializeDefaultDateTimes();
      startDateTime = defaultTimes.startDateTime;
      endDateTime = defaultTimes.endDateTime;
    }

    // Validate that end time is after start time
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      // Fix by setting end time to 1 hour after start time
      const start = new Date(startDateTime);
      endDateTime = new Date(start.getTime() + 60 * 60 * 1000).toISOString();
      console.log("Fixed end time to be after start time");
    }

    setIsProcessing(true);

    let updatedSchedule: ScheduleItem[];

    // Ensure we have valid ISO strings for the dates
    const validStartDateTime = new Date(startDateTime).toISOString();
    const validEndDateTime = new Date(endDateTime).toISOString();

    // Generate time string for backward compatibility
    const timeString = generateTimeString(validStartDateTime, validEndDateTime);

    if (isEditing && editingItemId !== null) {
      // Update existing item
      updatedSchedule = schedule.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              title: newScheduleItem.title || "",
              startDateTime: validStartDateTime,
              endDateTime: validEndDateTime,
              location: newScheduleItem.location || "",
              icon: newScheduleItem.icon || "🎤",
              description: newScheduleItem.description || "",
              time: timeString, // For backward compatibility
            }
          : item
      );
      addToast("Schedule item updated", ToastType.SUCCESS);
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: Date.now(),
        title: newScheduleItem.title || "",
        startDateTime: validStartDateTime,
        endDateTime: validEndDateTime,
        location: newScheduleItem.location || "",
        icon: newScheduleItem.icon || "🎤",
        description: newScheduleItem.description || "",
        time: timeString, // For backward compatibility
      };

      updatedSchedule = [...schedule, newItem];
      addToast("Schedule item added", ToastType.SUCCESS);
    }

    // Sort by start time
    updatedSchedule = updatedSchedule.sort((a, b) => {
      const aDate = new Date(a.startDateTime);
      const bDate = new Date(b.startDateTime);
      return aDate.getTime() - bDate.getTime();
    });

    // Save to backend
    await saveScheduleToBackend(updatedSchedule);

    // Reset form with proper default date times
    const defaultTimes = initializeDefaultDateTimes();
    setSchedule(updatedSchedule);
    setNewScheduleItem({
      title: "",
      startDateTime: defaultTimes.startDateTime,
      endDateTime: defaultTimes.endDateTime,
      location: "",
      icon: "🎤",
      description: "",
    });
    setEditingItemId(null);
    setIsEditing(false);
    setIsProcessing(false);
  };

  // Delete schedule item
  const handleDeleteScheduleItem = async (id: number) => {
    setIsProcessing(true);
    const updatedSchedule = schedule.filter((item) => item.id !== id);
    await saveScheduleToBackend(updatedSchedule);
    setSchedule(updatedSchedule);
    addToast("Schedule item removed", ToastType.INFO);

    // If we were editing this item, reset the form
    if (editingItemId === id) {
      handleCancelEdit();
    }
  };

  // Add a useEffect to update the time field when startDateTime or endDateTime changes
  useEffect(() => {
    if (newScheduleItem.startDateTime && newScheduleItem.endDateTime) {
      const timeString = generateTimeString(
        newScheduleItem.startDateTime,
        newScheduleItem.endDateTime
      );
      console.log(`Generated time string: ${timeString} from datetime values`);
    }
  }, [newScheduleItem.startDateTime, newScheduleItem.endDateTime]);

  const copyEventSpaceLink = () => {
    const url = `${window.location.origin}/space/${event._id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        addToast("Event space link copied to clipboard", ToastType.SUCCESS);
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        addToast("Failed to copy link", ToastType.ERROR);
      });
  };

  return (
    <ScheduleWrapper>
      <ScheduleHeader>
        <ScheduleTitle>Event Schedule</ScheduleTitle>
        <ButtonGroup>
          <SpaceButton
            onClick={() => navigate(`/space/${event._id}`)}
            title="Go to event space"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Go to Event Space
          </SpaceButton>
          <CopyLinkButton
            onClick={copyEventSpaceLink}
            title="Copy event space link to clipboard"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 3H11C9.89543 3 9 3.89543 9 5V13C9 14.1046 9.89543 15 11 15H19C20.1046 15 21 14.1046 21 13V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Copy Link
          </CopyLinkButton>
        </ButtonGroup>
      </ScheduleHeader>

      <ContentContainer>
        <ScheduleListSection>
          <SectionTitle>Schedule Items</SectionTitle>
          <ScheduleList>
            {schedule.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>📅</EmptyStateIcon>
                <EmptyStateText>
                  No schedule items yet. Add items using the form to create your
                  event schedule.
                </EmptyStateText>
              </EmptyState>
            ) : (
              // Sort schedule items by start date before rendering
              [...schedule]
                .sort((a, b) => {
                  const dateA = new Date(a.startDateTime);
                  const dateB = new Date(b.startDateTime);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((item) => {
                  const start = new Date(item.startDateTime);
                  const end = new Date(item.endDateTime);
                  const sameDay = isSameDay(start, end);
                  const isStartToday = isToday(start);

                  return (
                    <ScheduleItemCard
                      key={item.id}
                      onClick={() => !isProcessing && handleEditItem(item)}
                    >
                      <ScheduleIcon>{item.icon}</ScheduleIcon>
                      <ScheduleDetails>
                        <ScheduleItemTitle>
                          {item.title}
                          {!sameDay && <MultiDayBadge>Multi-day</MultiDayBadge>}
                          {isStartToday && <TodayBadge>Today</TodayBadge>}
                        </ScheduleItemTitle>
                        {item.description && (
                          <ScheduleDescription>
                            {item.description}
                          </ScheduleDescription>
                        )}
                        <ScheduleTimeGroup>
                          {sameDay ? (
                            <>
                              <ScheduleDate>
                                {formatDate(item.startDateTime)}
                              </ScheduleDate>
                              <ScheduleTime>
                                {formatTimeRange(
                                  item.startDateTime,
                                  item.endDateTime
                                )}
                              </ScheduleTime>
                            </>
                          ) : (
                            <>
                              <ScheduleDate>
                                {formatDate(item.startDateTime)} -{" "}
                                {formatDate(item.endDateTime)}
                              </ScheduleDate>
                              <ScheduleTime>
                                {formatTime(item.startDateTime)} -{" "}
                                {formatTime(item.endDateTime)}
                              </ScheduleTime>
                            </>
                          )}
                        </ScheduleTimeGroup>
                        <ScheduleLocation>{item.location}</ScheduleLocation>
                      </ScheduleDetails>
                      <ActionButtons>
                        <EditButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                          aria-label="Edit schedule item"
                          title="Edit this item"
                        >
                          ✏️
                        </EditButton>
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScheduleItem(item.id);
                          }}
                          aria-label="Delete schedule item"
                          title="Remove this item"
                          disabled={isProcessing}
                        >
                          ✕
                        </DeleteButton>
                      </ActionButtons>
                    </ScheduleItemCard>
                  );
                })
            )}
          </ScheduleList>
        </ScheduleListSection>

        <ScheduleFormSection>
          <FormContainer>
            <SectionTitle>
              {isEditing ? "Edit Schedule Item" : "Add New Item"}
            </SectionTitle>

            <FormGroup>
              <Label htmlFor="title">Title *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={newScheduleItem.title || ""}
                onChange={handleScheduleInputChange}
                placeholder="e.g., Keynote Speech"
                disabled={isProcessing}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={newScheduleItem.description || ""}
                onChange={handleScheduleInputChange}
                placeholder="e.g., A brief overview of the event's theme and goals"
                disabled={isProcessing}
              />
            </FormGroup>

            <FormGroup>
              <Label>Date & Time *</Label>
              <DateTimeContainer>
                <DateTimeGroup>
                  <DateTimeLabel htmlFor="startDateTime">Start</DateTimeLabel>
                  <Input
                    type="datetime-local"
                    id="startDateTime"
                    name="startDateTime"
                    value={formatDateForInput(
                      newScheduleItem.startDateTime || ""
                    )}
                    onChange={(e) => handleDateTimeChange(e, "startDateTime")}
                    onClick={ensureDatePickerOpens}
                    disabled={isProcessing}
                  />
                  <FormattedDateTime>
                    {formatDate(newScheduleItem.startDateTime || "")} at{" "}
                    {formatTime(newScheduleItem.startDateTime || "")}
                  </FormattedDateTime>
                </DateTimeGroup>

                <DateTimeGroup>
                  <DateTimeLabel htmlFor="endDateTime">End</DateTimeLabel>
                  <Input
                    type="datetime-local"
                    id="endDateTime"
                    name="endDateTime"
                    value={formatDateForInput(
                      newScheduleItem.endDateTime || ""
                    )}
                    onChange={(e) => handleDateTimeChange(e, "endDateTime")}
                    onClick={ensureDatePickerOpens}
                    disabled={isProcessing}
                  />
                  <FormattedDateTime>
                    {formatDate(newScheduleItem.endDateTime || "")} at{" "}
                    {formatTime(newScheduleItem.endDateTime || "")}
                  </FormattedDateTime>
                </DateTimeGroup>
              </DateTimeContainer>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                name="location"
                value={newScheduleItem.location || ""}
                onChange={handleScheduleInputChange}
                placeholder="e.g., Main Hall"
                disabled={isProcessing}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="icon">Icon</Label>
              <EmojiPickerContainer className="emoji-picker-container">
                <EmojiPickerToggle
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isProcessing}
                  ref={emojiButtonRef}
                >
                  <ToggleIconSection>
                    <IconPreview>{newScheduleItem.icon}</IconPreview>
                    <ToggleText>
                      {showEmojiPicker ? "Close" : "Select an emoji"}
                    </ToggleText>
                  </ToggleIconSection>
                  <ChevronIcon $isOpen={showEmojiPicker}>▼</ChevronIcon>
                </EmojiPickerToggle>

                {showEmojiPicker && (
                  <EmojiPickerWrapper
                    style={{
                      top: pickerPosition.top,
                      left: pickerPosition.left,
                    }}
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleIconSelect}
                      theme="light"
                      set="native"
                      autoFocus={true}
                      skinTonePosition="none"
                      previewPosition="none"
                    />
                  </EmojiPickerWrapper>
                )}
              </EmojiPickerContainer>
            </FormGroup>

            <ButtonContainer>
              {isEditing && (
                <CancelButton
                  onClick={handleCancelEdit}
                  disabled={isProcessing}
                >
                  Cancel
                </CancelButton>
              )}
              <AddButton
                onClick={handleAddOrUpdateScheduleItem}
                disabled={
                  isProcessing ||
                  !newScheduleItem.title ||
                  !newScheduleItem.startDateTime ||
                  !newScheduleItem.endDateTime
                }
              >
                {isProcessing
                  ? "Processing..."
                  : isEditing
                  ? "Update Item"
                  : "Add to Schedule"}
              </AddButton>
            </ButtonContainer>
          </FormContainer>
        </ScheduleFormSection>
      </ContentContainer>
      <Toasts />
    </ScheduleWrapper>
  );
};

export default ScheduleEditor;

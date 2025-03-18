import { useState, useRef } from "react";
import styled from "styled-components";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import useAuthSetup from "../../useAuthSetup";

import PopupOverlay from "./PopupOverlay";

// Modern color palette that matches with our other UI components
const colors = {
  primary: "#6B3DDF", // Purple that matches our EventDetail
  primaryHover: "#5F35C8",
  primaryLight: "rgba(107, 61, 223, 0.1)",
  textPrimary: "#191D23",
  textSecondary: "#5A6072",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  shadow: "rgba(0, 0, 0, 0.1)",
  error: "#DC2626",
  success: "#10B981",
  focusRing: "rgba(107, 61, 223, 0.2)",
};

const FormTitle = styled.h2`
  color: ${colors.textPrimary};
  text-align: center;
  margin-bottom: 12px;
  font-family: "Inter", Axiforma, sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
`;

const FormSubtitle = styled.p`
  color: ${colors.textSecondary};
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
  line-height: 20px;
  max-width: 400px;
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  font-family: "Inter", Axiforma, sans-serif;
`;

const FormSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textPrimary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RequiredMark = styled.span`
  color: ${colors.error};
  font-size: 14px;
  line-height: 0;
`;

const FormRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  background-color: ${colors.backgroundLight};
  font-size: 15px;
  font-family: "Inter", Axiforma, sans-serif;
  color: ${colors.textPrimary};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${colors.shadow};
  box-sizing: border-box;

  &:hover {
    border-color: rgba(107, 61, 223, 0.6);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${colors.focusRing};
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.7;
  }

  &:disabled {
    background-color: ${colors.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  background-color: ${colors.backgroundLight};
  font-size: 15px;
  font-family: "Inter", Axiforma, sans-serif;
  color: ${colors.textPrimary};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${colors.shadow};
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%235A6072' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;

  &:hover {
    border-color: rgba(107, 61, 223, 0.6);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${colors.focusRing};
  }
`;

const StatusMessage = styled.div<{ type: "success" | "error" }>`
  color: ${(props) =>
    props.type === "success" ? colors.success : colors.error};
  text-align: center;
  margin-top: 16px;
  font-family: "Inter", Axiforma, sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.type === "success"
      ? `rgba(16, 185, 129, 0.1)`
      : `rgba(220, 38, 38, 0.1)`};
  width: 100%;
`;

const PopupContent = styled.div`
  position: relative;
  background-color: ${colors.backgroundLight};
  padding: 40px;
  border-radius: 16px;
  width: 90%;
  max-width: 640px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  font-family: "Inter", Axiforma, sans-serif;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    padding: 24px;
    width: 95%;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: all 0.2s ease;

  &:hover {
    color: ${colors.textPrimary};
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const Button = styled.button<{
  variant: "primary" | "secondary";
  fullWidth?: boolean;
}>`
  background-color: ${(props) =>
    props.variant === "primary" ? colors.primary : "transparent"};
  color: ${(props) =>
    props.variant === "primary" ? "white" : colors.textSecondary};
  border: ${(props) =>
    props.variant === "primary" ? "none" : `1px solid ${colors.borderLight}`};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  max-width: ${(props) => (props.fullWidth ? "240px" : "none")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${colors.shadow};
    background-color: ${(props) =>
      props.variant === "primary"
        ? colors.primaryHover
        : colors.backgroundSecondary};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${(props) =>
      props.variant === "primary"
        ? `${colors.primary}80`
        : colors.backgroundSecondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const HintText = styled.p`
  color: ${colors.textSecondary};
  font-size: 13px;
  margin-top: 4px;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 16px;
`;

const LoaderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
    <path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface EventFormProps {
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Offline");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useAuthSetup();
  const navigate = useNavigate();
  const { user } = useAuth0();
  const formRef = useRef<HTMLFormElement>(null);

  const axiosInstance = useAxiosWithAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      // If endDate is set but startDate isn't, use endDate as startDate too
      let formattedStartDate = new Date().toISOString(); // Default to current date/time
      let formattedEndDate = undefined;

      if (startDate) {
        formattedStartDate = new Date(startDate).toISOString();
      }

      if (endDate) {
        formattedEndDate = new Date(endDate).toISOString();
        // If only end date is set, use it for start date too
        if (!startDate) {
          formattedStartDate = formattedEndDate;
        }
      }

      const response = await axiosInstance.post(`/events`, {
        title,
        description: "",
        ownerId: user?.sub || "random",
        poster: "",
        guests: [],
        date: formattedStartDate,
        endDate: formattedEndDate,
        eventType,
      });

      const eventId = response.data.message._id;
      setSuccess(true);

      // Reset form
      setTitle("");
      setEventType("Offline");
      setStartDate("");
      setEndDate("");

      // Redirect after short delay for user to see success message
      setTimeout(() => {
        navigate(`/events/${eventId}`);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupOverlay visible={true} onClose={onClose}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <FormTitle>Create New Event</FormTitle>
        <FormSubtitle>
          Fill in the basic details to get started. You can add more information
          later.
        </FormSubtitle>

        <FormContainer onSubmit={handleSubmit} ref={formRef}>
          <FormSection>
            <Label htmlFor="title">
              Event Title <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Annual Company Conference 2023"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </FormSection>

          <FormSection>
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              disabled={loading}
            >
              <option value="Offline">In-Person</option>
              <option value="Online">Virtual</option>
              <option value="Hybrid">Hybrid</option>
            </Select>
          </FormSection>

          <FormRow>
            <FormSection>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
              {!startDate && (
                <HintText>
                  Optional. Current date will be used if not specified.
                </HintText>
              )}
            </FormSection>

            <FormSection>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                disabled={loading}
              />
              {!endDate && (
                <HintText>Optional. Will match start date if not set.</HintText>
              )}
            </FormSection>
          </FormRow>

          {error && (
            <StatusMessage type="error">
              <ErrorIcon />
              {error}
            </StatusMessage>
          )}

          {success && (
            <StatusMessage type="success">
              <SuccessIcon />
              Event created successfully! Redirecting...
            </StatusMessage>
          )}

          <ButtonRow>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderIcon /> Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </ButtonRow>
        </FormContainer>
      </PopupContent>
    </PopupOverlay>
  );
};

export default EventForm;

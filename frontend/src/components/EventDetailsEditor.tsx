import { useEffect, useState } from "react";
import styled from "styled-components";
import { getDateRangeDetails } from "../common/common";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";

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
  yellow: "#FFD716",
  yellowHover: "#FFCC00",
  yellowShadow: "rgba(255, 215, 22, 0.3)",
};

const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90% !important;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
  gap: 20px;
  font-family: "Inter", Axiforma, sans-serif;
`;

export const StyledDatePickerWrapper = styled.div`
  color: ${colors.textPrimary};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  gap: 4px;

  .react-datepicker {
    font-size: 14px;
    background-color: ${colors.backgroundLight};
    color: ${colors.textPrimary};
    border: 1px solid ${colors.borderLight};
    border-radius: 8px;
    box-shadow: 0 4px 12px ${colors.shadow};
    padding: 8px;
    transition: all 0.2s ease;
    font-family: "Inter", Axiforma, sans-serif;
  }

  .react-datepicker__header {
    background-color: ${colors.backgroundSecondary};
    border-bottom: none;
    padding-top: 12px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .react-datepicker__day--selected {
    background-color: ${colors.primary};
    color: white;
    border-radius: 4px;
  }

  .react-datepicker__day:hover {
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 4px;
  }

  .react-datepicker__current-month {
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: 8px;
  }

  .react-datepicker__day-name {
    color: ${colors.textSecondary};
    font-weight: 500;
    margin-top: 4px;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__input-container input {
    background-color: ${colors.backgroundLight};
    border: 1px solid ${colors.borderLight};
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 500;
    color: ${colors.textPrimary};
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px ${colors.shadow};
    width: 140px;
    font-family: "Inter", Axiforma, sans-serif;

    &:hover {
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 4px 8px ${colors.shadow};
    }

    &:focus {
      border-color: ${colors.primary};
      outline: none;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    &::placeholder {
      color: ${colors.textSecondary};
      opacity: 0.6;
      font-weight: 400;
    }
  }
`;

const EventDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px ${colors.shadow};
  box-sizing: border-box;
  position: relative;
  border: 1px solid ${colors.borderLight};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 16px;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${colors.primary};
    opacity: 0.8;
  }
`;

const SectionContent = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: ${colors.textSecondary};
`;

const GuestActionsButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: ${colors.textSecondary};
  background-color: transparent;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
    color: ${colors.primary};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StyledTextarea = styled.textarea`
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  padding: 14px 16px;
  width: 100%;
  min-height: 120px;
  max-width: 100%;
  font-size: 15px;
  line-height: 1.6;
  box-sizing: border-box;
  font-family: "Inter", Axiforma, sans-serif;
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const EventTypeSelector = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background-color: ${colors.backgroundSecondary};
  border-radius: 12px;
  padding: 8px;
  margin-top: 8px;
`;

const SelectorOption = styled.label<{ selected: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: ${({ selected }) =>
    selected ? colors.textPrimary : colors.textSecondary};
  background-color: ${({ selected }) =>
    selected ? colors.yellow : "transparent"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ selected }) =>
    selected ? `0 4px 12px ${colors.yellowShadow}` : "none"};

  &:hover {
    background-color: ${({ selected }) =>
      selected ? colors.yellowHover : "rgba(0, 0, 0, 0.03)"};
    transform: ${({ selected }) => (selected ? "translateY(-2px)" : "none")};
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`;

const EventTypeIcon = styled.span`
  margin-right: 10px;
  font-size: 20px;
`;

const EmptyState = styled.div`
  color: ${colors.textSecondary};
  font-size: 15px;

  a {
    color: ${colors.primary};
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 1px;
      bottom: -1px;
      left: 0;
      background-color: ${colors.primary};
      transform: scaleX(0);
      transform-origin: bottom right;
      transition: transform 0.3s ease;
    }

    &:hover::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
`;

const DateTimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.textSecondary};

  svg {
    color: ${colors.primary};
    opacity: 0.7;
  }
`;

const EventTypeEditor: React.FC<{
  eventType: string;
  setEventType: (type: string) => void;
}> = ({ eventType, setEventType }) => {
  const options = [
    { value: "Offline", label: "In-person", icon: "🏢" },
    { value: "Online", label: "Online", icon: "💻" },
    { value: "Hybrid", label: "Hybrid", icon: "🌐" },
  ];

  return (
    <EventTypeSelector>
      {options.map((option) => (
        <SelectorOption
          key={option.value}
          selected={eventType === option.value}
        >
          <input
            type="radio"
            name="event-type"
            checked={eventType === option.value}
            onChange={() => setEventType(option.value)}
          />
          <EventTypeIcon>{option.icon}</EventTypeIcon>
          {option.label}
        </SelectorOption>
      ))}
    </EventTypeSelector>
  );
};

interface Event {
  _id: string;
  description: string;
  date: string | null;
  endDate: string | null;
  eventType: string;
}

const EventDetailsEditor: React.FC<{ event: Event; refetch: () => void }> = ({
  event,
  refetch,
}) => {
  const axiosInstance = useAxiosWithAuth();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [description, setDescription] = useState(event.description);
  const [startDate, setStartDate] = useState(new Date(event.date || ""));
  const [endDate, setEndDate] = useState(new Date(event.endDate || ""));
  const [eventType, setEventType] = useState(event.eventType);

  const updateDescription = async () => {
    await axiosInstance.put(`/events/${event._id}`, {
      ...event,
      description,
    });
    refetch();
    setIsEditingDescription(false);
  };

  const updateEventType = async () => {
    await axiosInstance.put(`/events/${event._id}`, {
      ...event,
      eventType,
    });
    refetch();
    setIsEditingDescription(false);
  };

  useEffect(() => {
    updateEventType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType]);

  const updateDateRange = async () => {
    await axiosInstance.put(`/events/${event._id}`, {
      ...event,
      date: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    refetch();
    setIsEditingDate(false);
  };

  return (
    <EventDetailsWrapper>
      <EventDetails>
        <EditButton onClick={() => setIsEditingDescription(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.4998 5.50067L18.3282 8.3291M13 21H21M3 21.0004L3.04745 20.6683C3.21536 19.4929 3.29932 18.9052 3.49029 18.3565C3.65975 17.8697 3.89124 17.4067 4.17906 16.979C4.50341 16.497 4.92319 16.0772 5.76274 15.2377L17.4107 3.58969C18.1918 2.80865 19.4581 2.80864 20.2392 3.58969C21.0202 4.37074 21.0202 5.63707 20.2392 6.41812L8.37744 18.2798C7.61579 19.0415 7.23497 19.4223 6.8012 19.7252C6.41618 19.994 6.00093 20.2167 5.56398 20.3887C5.07171 20.5824 4.54375 20.6889 3.48793 20.902L3 21.0004Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </EditButton>
        <SectionTitle>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          About this event
        </SectionTitle>
        {isEditingDescription ? (
          <>
            <StyledTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
            />
            <GuestActionsButtonsContainer>
              <PrimaryButton onClick={updateDescription}>Save</PrimaryButton>
              <SecondaryButton onClick={() => setIsEditingDescription(false)}>
                Cancel
              </SecondaryButton>
            </GuestActionsButtonsContainer>
          </>
        ) : event.description ? (
          <SectionContent>{event.description}</SectionContent>
        ) : (
          <EmptyState>
            No description provided. Click{" "}
            <a onClick={() => setIsEditingDescription(true)}>here</a> to edit.
          </EmptyState>
        )}
      </EventDetails>

      <EventDetails>
        <EditButton onClick={() => setIsEditingDate(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.4998 5.50067L18.3282 8.3291M13 21H21M3 21.0004L3.04745 20.6683C3.21536 19.4929 3.29932 18.9052 3.49029 18.3565C3.65975 17.8697 3.89124 17.4067 4.17906 16.979C4.50341 16.497 4.92319 16.0772 5.76274 15.2377L17.4107 3.58969C18.1918 2.80865 19.4581 2.80864 20.2392 3.58969C21.0202 4.37074 21.0202 5.63707 20.2392 6.41812L8.37744 18.2798C7.61579 19.0415 7.23497 19.4223 6.8012 19.7252C6.41618 19.994 6.00093 20.2167 5.56398 20.3887C5.07171 20.5824 4.54375 20.6889 3.48793 20.902L3 21.0004Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </EditButton>
        <SectionTitle>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.8856 21 19.8284 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8284 3 18.8856 3 17V8.5C3 6.61438 3 5.67157 3.58579 5.08579C4.17157 4.5 5.11438 4.5 7 4.5H17C18.8856 4.5 19.8284 4.5 20.4142 5.08579C21 5.67157 21 6.61438 21 8.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Date and time
        </SectionTitle>
        {isEditingDate ? (
          <div>
            <GuestActionsButtonsContainer>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date || new Date())}
                  placeholderText="Start date"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </StyledDatePickerWrapper>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date || new Date())}
                  placeholderText="End date"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </StyledDatePickerWrapper>
            </GuestActionsButtonsContainer>
            <GuestActionsButtonsContainer>
              <PrimaryButton onClick={updateDateRange}>Save</PrimaryButton>
              <SecondaryButton onClick={() => setIsEditingDate(false)}>
                Cancel
              </SecondaryButton>
            </GuestActionsButtonsContainer>
          </div>
        ) : (
          <DateTimeContainer>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {getDateRangeDetails(event.date || "", event.endDate || "")}
          </DateTimeContainer>
        )}
      </EventDetails>

      <EventDetails>
        <SectionTitle>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.5 19C9.5 20.1046 10.3954 21 11.5 21H12.5C13.6046 21 14.5 20.1046 14.5 19V5C14.5 3.89543 13.6046 3 12.5 3H11.5C10.3954 3 9.5 3.89543 9.5 5V19ZM9.5 19H7.5M9.5 19V12M7.5 19C6.39543 19 5.5 18.1046 5.5 17V14C5.5 12.8954 6.39543 12 7.5 12M7.5 19H3.5M7.5 19C6.39543 19 5.5 18.1046 5.5 17V14C5.5 12.8954 6.39543 12 7.5 12M3.5 19C2.39543 19 1.5 18.1046 1.5 17V16C1.5 14.8954 2.39543 14 3.5 14H7.5M3.5 19V14M14.5 19H16.5M14.5 19V5M14.5 5H16.5M16.5 19C17.6046 19 18.5 18.1046 18.5 17V14C18.5 12.8954 17.6046 12 16.5 12M16.5 19H20.5M16.5 19C17.6046 19 18.5 18.1046 18.5 17V14C18.5 12.8954 17.6046 12 16.5 12M20.5 19C21.6046 19 22.5 18.1046 22.5 17V16C22.5 14.8954 21.6046 14 20.5 14H16.5M20.5 19V14M16.5 5C17.6046 5 18.5 5.89543 18.5 7V10C18.5 11.1046 17.6046 12 16.5 12M16.5 5H20.5M20.5 5C21.6046 5 22.5 5.89543 22.5 7V8C22.5 9.10457 21.6046 10 20.5 10H16.5M20.5 5V10M16.5 10C17.6046 10 18.5 9.10457 18.5 8V7C18.5 5.89543 17.6046 5 16.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Event type
        </SectionTitle>
        <EventTypeEditor eventType={eventType} setEventType={setEventType} />
      </EventDetails>
    </EventDetailsWrapper>
  );
};

export default EventDetailsEditor;

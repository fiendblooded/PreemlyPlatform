import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getDateRangeDetails } from "../common/common";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";

const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90% !important;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
`;
export const StyledDatePickerWrapper = styled.div`
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  gap: 4px;
  .react-datepicker {
    font-size: 16px;
    background-color: #f9f9f9;
    color: black;
    border: 2px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 8px;
    transition: border-color 0.3s ease;
  }

  .react-datepicker__header {
    background-color: #f9f9f9;
    border-bottom: none;
  }

  .react-datepicker__day--selected {
    background-color: rgb(107, 61, 223);
    color: white;
  }

  .react-datepicker__day:hover {
    background-color: rgba(107, 61, 223, 0.2);
  }

  .react-datepicker__current-month {
    font-weight: bold;
    color: #333;
  }

  .react-datepicker__day-name {
    color: #555;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__input-container input {
    background-color: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      border-color: rgba(107, 61, 223, 0.6);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &:focus {
      border-color: rgb(107, 61, 223);
      outline: none;
      box-shadow: 0 4px 12px rgba(107, 61, 223, 0.3);
    }

    &::placeholder {
      color: #aaa;
      font-weight: 400;
    }
  }
`;

const EventDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
  background-color: white;
  color: black;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  position: relative;
`;
const GuestActionsButtonsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: start;
  margin-top: 6px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 28px;
  height: 28px;
  background-color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border: 1.5px solid rgb(102, 102, 102);
  color: rgb(102, 102, 102);
  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: rgb(102, 102, 102);
    color: white;
  }
`;

const StyledTextarea = styled.input`
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  max-width: 100%;
  margin-top: 10px;
  font-size: 16px;
  box-sizing: border-box;
  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
  }
`;
const EventTypeSelector = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background-color: #f7f7f7;
  border-radius: 12px;
  padding: 8px;
`;

const SelectorOption = styled.label<{ selected: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ selected }) => (selected ? "black" : "#555555")};
  background-color: ${({ selected }) => (selected ? "#ffd716" : "transparent")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ selected }) =>
    selected ? "0 4px 10px rgba(255, 215, 22, 0.3)" : "none"};

  &:hover {
    background-color: ${({ selected }) => (selected ? "#ffcc00" : "#eeeeee")};
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
  margin-right: 8px;
  font-size: 18px;
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
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </EditButton>
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: "4px" }}>
          About this event
        </div>
        {isEditingDescription ? (
          <>
            <StyledTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <GuestActionsButtonsContainer>
              <PrimaryButton onClick={updateDescription}>Save</PrimaryButton>
              <SecondaryButton onClick={() => setIsEditingDescription(false)}>
                Cancel
              </SecondaryButton>
            </GuestActionsButtonsContainer>
          </>
        ) : event.description ? (
          <div>{event.description}</div>
        ) : (
          <div style={{ color: "#8f8f8f" }}>
            No description provided. Click{" "}
            <a
              onClick={() => setIsEditingDescription(true)}
              style={{ cursor: "pointer" }}
            >
              here
            </a>{" "}
            to edit.
          </div>
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
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </EditButton>
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: "4px" }}>
          Date and time
        </div>
        {isEditingDate ? (
          <div>
            <GuestActionsButtonsContainer>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date || new Date())}
                />
              </StyledDatePickerWrapper>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date || new Date())}
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
          <div>
            {getDateRangeDetails(event.date || "", event.endDate || "")}
          </div>
        )}
      </EventDetails>
      <EventDetails>
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: "4px" }}>
          Event type
        </div>
        <EventTypeEditor eventType={eventType} setEventType={setEventType} />
      </EventDetails>
    </EventDetailsWrapper>
  );
};

export default EventDetailsEditor;

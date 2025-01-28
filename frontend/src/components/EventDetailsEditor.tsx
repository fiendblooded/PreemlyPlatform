import { useState } from "react";
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
  width: 70%;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
`;
const StyledDatePickerWrapper = styled.div`
  color: black;

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
    background-color: #f9f9f9;
    border: 2px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    color: black;
    &:focus {
      border-color: rgb(107, 61, 223);
      outline: none;
    }
  }
`;

const EventDetails = styled.div`
  flex: 1;
  margin-top: 20px;
  background-color: white;
  color: black;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
`;
const GuestActionsButtonsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: start;
  margin-top: 6px;
  margin-left: 2px;
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
  margin: auto;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 97%;

  margin-top: 10px;
  font-size: 16px;

  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
  }
`;

interface Event {
  _id: string;
  description: string;
  date: string | null;
  endDate: string | null;
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

  const updateDescription = async () => {
    await axiosInstance.put(`/events/${event._id}`, {
      ...event,
      description,
    });
    refetch();
    setIsEditingDescription(false);
  };

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
          <div>
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
          </div>
        ) : (
          <div>{event.description}</div>
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
        <div
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: "4px",
            display: "flex",
            alignItems: "end",
            lineHeight: "24px",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
              stroke="black"
              stroke-width="2"
              strokeLinecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div style={{ marginBottom: "-2px", marginLeft: "4px" }}>
            Date and Time
          </div>
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
    </EventDetailsWrapper>
  );
};

export default EventDetailsEditor;

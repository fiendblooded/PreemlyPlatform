import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getDateRangeDetails } from "../common/common";
const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
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
  return (
    <EventDetailsWrapper>
      <EventDetails>
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: "4px" }}>
          About this event
        </div>
        <div>{event.description}</div>
      </EventDetails>
      <EventDetails>
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
        <div>
          {getDateRangeDetails(event.date || "", new Date().toDateString())}
        </div>
      </EventDetails>
    </EventDetailsWrapper>
  );
};

export default EventDetailsEditor;

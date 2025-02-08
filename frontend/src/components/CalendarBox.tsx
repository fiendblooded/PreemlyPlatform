import React from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Event {
  title: string;
  date: string;
}

interface CalendarBoxProps {
  events: Event[];
}

const CalendarContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 95%;
  height: 100%$
  font-family: Axiforma, sans-serif;

  .react-calendar {
    width: 100%;
    border: none;
    font-size: 14px;
    button {
      background: none;
      border: none;
      padding: 10px;
      color: #333;
      cursor: pointer;
    }
    .react-calendar__tile {
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: relative;
    }
    .react-calendar__tile--active {
      background: #ffc107;
      color: white;
      border-radius: 8px;
    }
  }
`;

const EventBadge = styled.div`
  position: absolute;
  top: 5px;
  width: 90%;
  padding: 4px 6px;
  background-color: #ffc107;
  color: black;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CalendarBox: React.FC<CalendarBoxProps> = ({ events }) => {
  const eventDates = events.map((event) => new Date(event.date).toDateString());

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && eventDates.includes(date.toDateString())) {
      const event = events.find(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );
      return <EventBadge>{event?.title}</EventBadge>;
    }
    return null;
  };

  return (
    <CalendarContainer>
      <Calendar tileContent={tileContent} />
    </CalendarContainer>
  );
};

export default CalendarBox;

import styled from "styled-components";
import { Event } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getDateTimeStatus,
  isTablet,
  formatDateTime,
  SvgSC,
} from "../common/common";
import { PrimaryButton } from "./EventGuestsEditor";

interface EventProps {
  event: Event;
}

const Card = styled.div<{ color: string }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: auto;
  min-height: 300px;
  overflow: hidden;
  border: 1px solid #eee;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: ${(props) => props.color};
    border-radius: 12px 12px 0 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const PosterWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Poster = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
`;

const PosterPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 14px;
`;

const Title = styled.h3`
  color: #2c2c2c;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    min-width: 20px;
    width: 20px;
    height: 20px;
    color: #999;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const MetaLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  height: 42px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 16px;
  height: 100%;

  svg {
    width: 20px;
    height: 20px;
    color: #999;
  }
`;

const StatusBadge = styled.div<{ color: string; isOngoing: boolean }>`
  position: absolute;
  bottom: 14px;
  left: 6px;
  padding: 8px 16px;
  background-color: ${(props) => props.color};
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 8px ${(props) => props.color}40;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 1;

  ${(props) =>
    props.isOngoing &&
    `
    &::before {
      content: "";
      width: 8px;
      height: 8px;
      line-height: 15px;
      border-radius: 50%;
      background-color: white;
      animation: pulse 1.5s infinite;
    }
  `}

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const CheckInButton = styled(PrimaryButton)<{ tabletMode: boolean }>`
  padding: ${(props) => (props.tabletMode ? "12px" : "12px 24px")};
  width: ${(props) => (props.tabletMode ? "42px" : "auto")};
  min-width: ${(props) => (props.tabletMode ? "unset" : "auto")};
  height: 42px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6c5dd3;

  svg {
    width: 24px;
    height: 24px;
  }

  span {
    display: ${(props) => (props.tabletMode ? "none" : "inline")};
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EventComponent: React.FC<EventProps> = ({ event }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = getDateTimeStatus(event.date, event.endDate);
  const tabletMode = isTablet();

  return (
    <Card
      color={status.color}
      onClick={() => navigate(`${location.pathname}/${event._id}`)}
    >
      <PosterWrapper>
        {event.poster ? (
          <Poster src={event.poster} alt={event.title} />
        ) : (
          <PosterPlaceholder>No poster available</PosterPlaceholder>
        )}
        <StatusBadge color={status.color} isOngoing={status.type === "Ongoing"}>
          {status.type}
        </StatusBadge>
      </PosterWrapper>

      <Title>{event.title}</Title>

      <EventInfo>
        <InfoItem>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {event.location?.address || "No location set"}
        </InfoItem>
        <InfoItem>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDateTime(event.date)}
        </InfoItem>
      </EventInfo>

      <MetaInfo>
        <MetaLeft>
          <MetaItem>
            <SvgSC
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </SvgSC>
            {event.guests?.length || 0} guests
          </MetaItem>
        </MetaLeft>

        {status.type === "Ongoing" && (
          <CheckInButton
            tabletMode={tabletMode}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              navigate(`/welcome/${event._id}`);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 12H4.01M8 12H8.01M16 12H16.01M12 12H12.01M20 12H20.01M8.5 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V8.5M15.5 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.07989 20 7.2V8.5M20 15.5V16.8C20 17.9201 20 18.4802 19.782 18.908C19.5903 19.2843 19.2843 19.5903 18.908 19.782C18.4802 20 17.9201 20 16.8 20H15.5M4 15.5V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H8.5"
              />
            </svg>
            <span>Check in</span>
          </CheckInButton>
        )}
      </MetaInfo>
    </Card>
  );
};

export default EventComponent;

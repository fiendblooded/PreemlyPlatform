import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getDateRangeDetails } from "../common/common";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";
import PosterUploadModal from "./PosterUploadModal";

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
  gap: 24px;
  font-family: Axiforma, sans-serif;
  padding-bottom: 40px;
`;

export const StyledDatePickerWrapper = styled.div`
  color: ${colors.textPrimary};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  width: 100%;
  position: relative;

  svg {
    position: absolute;
    left: 14px;
    color: ${colors.primary};
  }

  .react-datepicker-wrapper {
    width: 100%;
  }

  /* This is the most important part - ensuring the popper is above everything */
  .react-datepicker-popper {
    position: absolute;
    z-index: 999999 !important;
  }

  .react-datepicker {
    font-size: 14px;
    background-color: ${colors.backgroundLight};
    color: ${colors.textPrimary};
    border: 1px solid ${colors.borderLight};
    border-radius: 12px;
    box-shadow: 0 8px 24px ${colors.shadow};
    padding: 12px;
    transition: all 0.3s ease;
    font-family: Axiforma, sans-serif;
  }

  .react-datepicker__header {
    background-color: ${colors.backgroundSecondary};
    border-bottom: none;
    padding-top: 12px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .react-datepicker__day--selected {
    background-color: ${colors.primary};
    color: white;
    border-radius: 6px;
  }

  .react-datepicker__day:hover {
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 6px;
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
    border-radius: 10px;
    padding: 12px 16px 12px 42px;
    font-size: 15px;
    font-weight: 500;
    color: ${colors.textPrimary};
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px ${colors.shadow};
    width: 100%;
    font-family: Axiforma, sans-serif;
    box-sizing: border-box;
    &:hover {
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 4px 12px ${colors.shadow};
    }

    &:focus {
      border-color: ${colors.primary};
      outline: none;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
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
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 20px ${colors.shadow};
  box-sizing: border-box;
  position: relative;
  border: 1px solid ${colors.borderLight};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 20px;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: ${colors.primary};
    opacity: 0.9;
  }
`;

const SectionContent = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: ${colors.textSecondary};
  white-space: pre-wrap;
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
  top: 24px;
  right: 24px;
  height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${colors.textSecondary};
  background-color: transparent;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;

  /* Text styling */
  font-size: 14px;
  font-weight: 500;

  /* Fixed initial width - crucial for smooth transition */
  width: 44px;

  svg {
    width: 20px;
    height: 20px;
    min-width: 20px;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  span {
    opacity: 0;
    width: 0;
    white-space: nowrap;
    transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.3s ease 0.15s,
      margin-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
    color: ${colors.primary};
    transform: translateY(-2px);
    width: 88px;
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.08);

    span {
      opacity: 1;
      width: 30px;
      margin-left: 6px;
    }

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledTextarea = styled.textarea`
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  padding: 16px 18px;
  width: 100%;
  min-height: 150px;
  max-width: 100%;
  font-size: 16px;
  line-height: 1.7;
  box-sizing: border-box;
  font-family: Axiforma, sans-serif;
  transition: all 0.3s ease;
  resize: vertical;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const EventTypeSelector = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background-color: ${colors.backgroundSecondary};
  border-radius: 16px;
  padding: 10px;
  margin-top: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid ${colors.borderLight};
  position: static;
  z-index: 1;
`;

const SelectorOption = styled.label<{ selected: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ selected }) =>
    selected ? colors.textPrimary : colors.textSecondary};
  background-color: ${({ selected }) =>
    selected ? colors.yellow : "transparent"};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ selected }) =>
    selected ? `0 6px 16px ${colors.yellowShadow}` : "none"};
  border: 1px solid
    ${({ selected }) => (selected ? colors.yellow : "transparent")};

  &:hover {
    background-color: ${({ selected }) =>
      selected ? colors.yellowHover : "rgba(0, 0, 0, 0.03)"};
    transform: ${({ selected }) =>
      selected ? "translateY(-3px)" : "translateY(-1px)"};
    box-shadow: ${({ selected }) =>
      selected
        ? `0 8px 20px ${colors.yellowShadow}`
        : "0 2px 8px rgba(0, 0, 0, 0.03)"};
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
  margin-right: 12px;
  font-size: 24px;
  transition: transform 0.3s ease;

  ${SelectorOption}:hover & {
    transform: scale(1.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: ${colors.textSecondary};
  background-color: ${colors.backgroundLight};
  border-radius: 8px;
  margin-top: 16px;

  p {
    margin-bottom: 16px;
  }

  a {
    color: ${colors.primary};
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: ${colors.primaryHover};
    }
  }
`;

const EmptyStateActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
`;

const DateTimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${colors.textSecondary};
  flex-wrap: wrap;
  font-size: 16px;
  background-color: ${colors.backgroundSecondary};
  padding: 14px 18px;
  border-radius: 10px;
  margin-top: 10px;
  border: 1px solid ${colors.borderLight};
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  svg {
    color: ${colors.primary};
    opacity: 0.8;
    width: 22px;
    height: 22px;
  }
`;

const DateTimeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateTimeInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const DateTimeLabel = styled.label`
  font-size: 15px;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 18px;
    height: 18px;
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
    <>
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
      <div
        style={{
          fontSize: "14px",
          color: colors.textSecondary,
          marginTop: "12px",
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Select the type of event you're organizing
      </div>
    </>
  );
};

interface Event {
  _id: string;
  description: string;
  date: string | null;
  endDate: string | null;
  eventType: string;
  poster: string | null;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    placeId?: string;
  };
}

// Import or define the AIButton component
const AIButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 20px;
  background: linear-gradient(
    90deg,
    #5e83fb,
    #c054ff,
    #ea5cbe,
    #c054ff,
    #5e83fb
  );
  background-size: 200% 100%;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(192, 84, 255, 0.3);
  animation: gradientMove 3s linear infinite;
  line-height: 24px;
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(192, 84, 255, 0.4);
    animation: gradientMove 1.5s linear infinite;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(192, 84, 255, 0.3);
  }

  &:disabled {
    background: linear-gradient(
      90deg,
      #5e83fb,
      #c054ff,
      #ea5cbe,
      #c054ff,
      #5e83fb
    );
    background-size: 200% 100%;
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    animation: gradientMove 3s linear infinite;
  }
`;

// Add a loading spinner component
const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Add an AI icon component
const AIIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.6385 19.6387C20.1064 20.1066 20.1098 20.8693 19.5976 21.2884C18.2657 22.3778 16.7112 23.1712 15.0376 23.6091C12.9766 24.1484 10.8093 24.1293 8.75816 23.5538C6.70705 22.9783 4.84611 21.8672 3.36652 20.3345C1.88693 18.8018 0.84202 16.9029 0.339136 14.8327C-0.163748 12.7626 -0.106478 10.5959 0.505062 8.55522C1.1166 6.51454 2.26037 4.67345 3.81886 3.22107C5.37735 1.76869 7.29439 0.75739 9.37304 0.291048C11.06 -0.0874224 12.8041 -0.0958826 14.4863 0.260427C15.1353 0.397894 15.4836 1.07846 15.2824 1.70927C15.0808 2.34126 14.4039 2.68214 13.7503 2.56094C12.4788 2.32512 11.1684 2.34792 9.89841 2.63284C8.23549 3.00591 6.70186 3.81496 5.45506 4.97686C4.20827 6.13876 3.29326 7.61163 2.80402 9.24418C2.31479 10.8767 2.26898 12.6101 2.67128 14.2662C3.07359 15.9223 3.90952 17.4414 5.09319 18.6676C6.27687 19.8937 7.76561 20.7827 9.4065 21.2431C11.0474 21.7035 12.7813 21.7187 14.43 21.2873C15.6895 20.9578 16.8646 20.3766 17.8864 19.5834C18.4109 19.1762 19.1691 19.1693 19.6385 19.6387ZM21.3347 4.45945C20.9176 3.94312 20.15 3.9421 19.6779 4.40882C19.2074 4.87404 19.2102 5.6276 19.6132 6.15228C20.839 7.748 21.5389 9.69801 21.5962 11.7295C21.6535 13.7613 21.0646 15.7479 19.9305 17.4103C19.5579 17.9565 19.5979 18.7088 20.0939 19.1468C20.5915 19.5861 21.3575 19.5421 21.7446 19.0035C23.2722 16.8779 24.0697 14.3003 23.9952 11.6618C23.9208 9.02362 22.9794 6.49538 21.3347 4.45945ZM12.6411 5.75815C12.3993 5.22787 11.6376 5.22786 11.3958 5.75815L11.2432 6.0929C10.3865 7.97173 9.27951 9.72884 7.95154 11.3175L7.73017 11.5823C7.52153 11.8319 7.52153 12.1928 7.73017 12.4424L7.95154 12.7072C9.27951 14.2959 10.3865 16.053 11.2432 17.9319L11.3958 18.2666C11.6376 18.7969 12.3993 18.7969 12.6411 18.2666L12.7937 17.9319C13.6504 16.053 14.7574 14.2959 16.0854 12.7072L16.3068 12.4424C16.5154 12.1928 16.5154 11.8319 16.3068 11.5823L16.0854 11.3175C14.7574 9.72884 13.6504 7.97173 12.7937 6.0929L12.6411 5.75815ZM17.9612 1.58272C17.3845 1.25284 16.6689 1.53027 16.3989 2.13631C16.1294 2.74097 16.4067 3.44295 16.9738 3.78616C17.1414 3.88756 17.3058 3.99407 17.4669 4.10554C18.0131 4.48354 18.7706 4.44916 19.2136 3.95485C19.6552 3.46211 19.6169 2.70013 19.0823 2.30958C18.7224 2.04666 18.3481 1.804 17.9612 1.58272Z"
      fill="white"
    />
  </svg>
);

// Hint icon component
const HintIcon = () => (
  <span
    style={{
      display: "inline-flex",
      verticalAlign: "middle",
      marginRight: "6px",
    }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const AIHint = styled.div`
  margin-top: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${colors.textSecondary};
  background-color: rgba(94, 131, 251, 0.08);
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 4px solid ${colors.primary};
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const PosterSection = styled(EventDetails)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px;
  overflow: hidden;
  position: relative;
`;

const PosterContent = styled.div`
  width: 100%;
  position: relative;
  margin-top: 16px;
`;

const PosterImage = styled.div<{ imageUrl: string }>`
  width: 100%;
  height: 600px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 8px 24px ${colors.shadow};
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  }

  /* Blurred background (full width) */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${(props) => props.imageUrl});
    background-size: cover;
    background-position: center;
    filter: blur(15px);
    transform: scale(1.1); /* Prevent blur edges */
    opacity: 0.7;
  }

  /* Main image container (centered at 70% width) */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    z-index: 2;
  }

  /* The actual main image */
  .poster-main-image {
    width: 70%;
    height: 90%;
    background-image: url(${(props) => props.imageUrl});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    z-index: 1;
    border-radius: 8px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
`;

const PosterPlaceholder = styled.div`
  width: 100%;
  height: 350px;
  border-radius: 12px;
  background-color: ${colors.backgroundSecondary};
  background-image: linear-gradient(
    45deg,
    #f8fafc 25%,
    #f1f5f9 25%,
    #f1f5f9 50%,
    #f8fafc 50%,
    #f8fafc 75%,
    #f1f5f9 75%,
    #f1f5f9 100%
  );
  background-size: 20px 20px;
  color: ${colors.textSecondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 16px ${colors.shadow};
  border: 2px dashed ${colors.borderLight};

  &:hover {
    background-color: ${colors.backgroundLight};
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    border-color: ${colors.primary}40;
  }
`;

const PosterIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: ${colors.backgroundLight};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: ${colors.primary};
  transition: all 0.3s ease;

  svg {
    width: 32px;
    height: 32px;
  }

  ${PosterPlaceholder}:hover & {
    transform: scale(1.1);
    background-color: ${colors.primary};
    color: white;
  }
`;

// Add location editor styled components
const AddressInput = styled.input`
  width: 100%;
  font-family: Axiforma, sans-serif;
  border-radius: 10px;
  background: ${colors.backgroundLight};
  font-size: 15px;
  height: 46px;
  color: ${colors.textPrimary};
  outline: none;
  margin-top: 16px;
  margin-bottom: 16px;
  border: 1px solid ${colors.borderLight};
  padding: 8px 16px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px ${colors.shadow};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const LocationInputGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const LocationInput = styled(AddressInput)`
  flex: 1;
  margin: 0;
`;

const LocationLabel = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const LocationActions = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 16px;
`;

// Add dialog components after the existing component definitions
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 28px;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;

  @keyframes slideUp {
    to {
      transform: translateY(0);
    }
  }

  .react-datepicker {
    font-size: 14px;
    background-color: ${colors.backgroundLight};
    color: ${colors.textPrimary};
    border: 1px solid ${colors.borderLight};
    border-radius: 12px;
    box-shadow: 0 8px 24px ${colors.shadow};
    padding: 12px;
    transition: all 0.3s ease;
    font-family: Axiforma, sans-serif;
    margin: 0 auto;
    width: calc(100% - 24px);
  }

  .react-datepicker__header {
    background-color: ${colors.backgroundSecondary};
    border-bottom: none;
    padding-top: 12px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .react-datepicker__month-container {
    width: 100%;
  }

  .react-datepicker__day-names,
  .react-datepicker__week {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }

  .react-datepicker__day--selected {
    background-color: ${colors.primary};
    color: white;
    border-radius: 6px;
  }

  .react-datepicker__day:hover {
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 6px;
  }

  .react-datepicker__current-month {
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: 8px;
    font-size: 15px;
  }

  .react-datepicker__day-name {
    color: ${colors.textSecondary};
    font-weight: 500;
    margin-top: 4px;
    width: 32px;
  }

  .react-datepicker__day {
    width: 32px;
    height: 32px;
    line-height: 32px;
    margin: 2px;
  }

  .react-datepicker__time-container {
    width: 100%;
    border-left: none;
  }

  .react-datepicker__time-container .react-datepicker__time {
    background-color: ${colors.backgroundLight};
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box {
    width: 100%;
    margin: 0;
  }

  .react-datepicker__time-list {
    height: 200px !important;
    overflow-y: auto;
    padding: 0;
  }

  .react-datepicker__time-list-item {
    padding: 8px 10px !important;
    height: auto !important;
    line-height: 1.2 !important;
  }

  .react-datepicker__time-list-item--selected {
    background-color: ${colors.primary} !important;
  }
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: ${colors.textPrimary};
  font-size: 20px;
  font-weight: 600;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

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
  const [isRewritingDescription, setIsRewritingDescription] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Add location state
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    address: event.location?.address || "",
    placeId: event.location?.placeId || "",
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Modify date picker implementation - add new states for date picker dialogs
  const [showStartDatePickerDialog, setShowStartDatePickerDialog] =
    useState(false);
  const [showEndDatePickerDialog, setShowEndDatePickerDialog] = useState(false);

  // Open/close handlers for date picker dialogs
  const openStartDatePickerDialog = () => setShowStartDatePickerDialog(true);
  const closeStartDatePickerDialog = () => setShowStartDatePickerDialog(false);
  const openEndDatePickerDialog = () => setShowEndDatePickerDialog(true);
  const closeEndDatePickerDialog = () => setShowEndDatePickerDialog(false);

  // Add location save handler
  const handleSaveLocation = async () => {
    setIsUpdatingLocation(true);

    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        location,
      });
      refetch();
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const updateDescription = async () => {
    await axiosInstance.put(`/events/${event._id}`, {
      ...event,
      description,
    });
    refetch();
    setIsEditingDescription(false);
  };

  const rewriteDescriptionWithAI = async () => {
    try {
      setIsRewritingDescription(true);
      const response = await axiosInstance.post("/events/rewrite-description", {
        description,
      });

      if (response.data.success && response.data.data?.description) {
        setDescription(response.data.data.description);
      }
    } catch (error) {
      console.error("Error rewriting description:", error);
    } finally {
      setIsRewritingDescription(false);
    }
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
      <PosterSection>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <SectionTitle>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12.5V6.5C2 5.39543 2.89543 4.5 4 4.5H20C21.1046 4.5 22 5.39543 22 6.5V17.5C22 18.6046 21.1046 19.5 20 19.5H4C2.89543 19.5 2 18.6046 2 17.5V12.5ZM2 12.5H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Event Poster
          </SectionTitle>
          <EditButton onClick={() => setModalOpen(true)}>
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
            <span>Edit</span>
          </EditButton>
        </div>

        <PosterContent>
          {event.poster ? (
            <PosterImage imageUrl={`${event.poster}`}>
              <div className="poster-main-image"></div>
            </PosterImage>
          ) : (
            <PosterPlaceholder onClick={() => setModalOpen(true)}>
              <PosterIcon>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 16L8.586 11.414C8.961 11.039 9.47 10.828 10 10.828C10.53 10.828 11.039 11.039 11.414 11.414L16 16M14 14L15.586 12.414C15.961 12.039 16.47 11.828 17 11.828C17.53 11.828 18.039 12.039 18.414 12.414L20 14M14 8H14.01M6 20H18C18.53 20 19.039 19.789 19.414 19.414C19.789 19.039 20 18.53 20 18V6C20 5.47 19.789 4.961 19.414 4.586C19.039 4.211 18.53 4 18 4H6C5.47 4 4.961 4.211 4.586 4.586C4.211 4.586 4 5.47 4 6V18C4 18.53 4.211 19.039 4.586 19.414C4.961 19.789 5.47 20 6 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PosterIcon>
              <div>Add an event poster</div>
              <div
                style={{
                  fontSize: "14px",
                  marginTop: "8px",
                  fontWeight: "normal",
                  opacity: 0.8,
                }}
              >
                Recommended size: 1200 × 630 pixels
              </div>
            </PosterPlaceholder>
          )}
        </PosterContent>
      </PosterSection>

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
              d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          About this event
        </SectionTitle>
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
          <span>Edit</span>
        </EditButton>
        {isEditingDescription ? (
          <>
            <StyledTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
            />
            {!description && (
              <AIHint>
                Write a basic description first, then use the "Enhance with AI"
                button to make it more engaging.
              </AIHint>
            )}
            {description && description.length > 0 && (
              <AIHint>
                <HintIcon />
                Click "Enhance with AI" to make your description more engaging
                and appealing to potential attendees.
              </AIHint>
            )}
            <GuestActionsButtonsContainer>
              <PrimaryButton
                onClick={updateDescription}
                disabled={!description}
              >
                Save
              </PrimaryButton>
              <AIButton
                onClick={rewriteDescriptionWithAI}
                disabled={isRewritingDescription || !description}
              >
                {isRewritingDescription ? (
                  <>
                    <LoadingSpinner /> Rewriting...
                  </>
                ) : (
                  <>
                    <AIIcon />
                    Enhance with AI
                  </>
                )}
              </AIButton>
              <SecondaryButton onClick={() => setIsEditingDescription(false)}>
                Cancel
              </SecondaryButton>
            </GuestActionsButtonsContainer>
          </>
        ) : event.description ? (
          <SectionContent>{event.description}</SectionContent>
        ) : (
          <EmptyState>
            <p>
              No description provided yet. Start by writing a brief description
              of your event, and you can enhance it with AI later.
            </p>
            <EmptyStateActions>
              <PrimaryButton
                onClick={() => setIsEditingDescription(true)}
                width={200}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Write Description
              </PrimaryButton>
            </EmptyStateActions>
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
          <span>Edit</span>
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
            <DateTimeGrid>
              <DateTimeInputGroup>
                <DateTimeLabel>Start Date & Time</DateTimeLabel>
                <StyledDatePickerWrapper>
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
                  <input
                    type="text"
                    value={startDate ? startDate.toLocaleString() : ""}
                    onClick={openStartDatePickerDialog}
                    readOnly
                    placeholder="Select start date and time"
                    style={{
                      backgroundColor: colors.backgroundLight,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: "10px",
                      padding: "12px 16px 12px 42px",
                      fontSize: "15px",
                      width: "100%",
                      fontFamily: "Axiforma, sans-serif",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  />
                </StyledDatePickerWrapper>
              </DateTimeInputGroup>

              <DateTimeInputGroup>
                <DateTimeLabel>End Date & Time</DateTimeLabel>
                <StyledDatePickerWrapper>
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
                  <input
                    type="text"
                    value={endDate ? endDate.toLocaleString() : ""}
                    onClick={openEndDatePickerDialog}
                    readOnly
                    placeholder="Select end date and time"
                    style={{
                      backgroundColor: colors.backgroundLight,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: "10px",
                      padding: "12px 16px 12px 42px",
                      fontSize: "15px",
                      width: "100%",
                      fontFamily: "Axiforma, sans-serif",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  />
                </StyledDatePickerWrapper>
              </DateTimeInputGroup>
            </DateTimeGrid>

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

        {/* Add location editor section */}
        {eventType !== "Online" && (
          <>
            <SectionTitle style={{ marginTop: "24px" }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.7 15C4.03377 15.6353 3 16.5205 3 17.4997C3 19.4329 7.02944 21 12 21C16.9706 21 21 19.4329 21 17.4997C21 16.5205 19.9662 15.6353 18.3 15M12 9H12.01M18 9C18 13.0637 13.5 15 12 18C10.5 15 6 13.0637 6 9C6 5.68629 8.68629 3 12 3C15.3137 3 18 5.68629 18 9ZM13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Event location
            </SectionTitle>
            <LocationInputGroup>
              <div style={{ flex: 1 }}>
                <LocationLabel>Address</LocationLabel>
                <LocationInput
                  type="text"
                  placeholder="Enter event address"
                  value={location.address}
                  onChange={(e) =>
                    setLocation({ ...location, address: e.target.value })
                  }
                />
              </div>
            </LocationInputGroup>
            <LocationActions>
              <PrimaryButton
                onClick={handleSaveLocation}
                disabled={
                  isUpdatingLocation ||
                  event.location?.address === location.address
                }
              >
                {isUpdatingLocation ? "Saving..." : "Save Location"}
              </PrimaryButton>
            </LocationActions>
          </>
        )}
      </EventDetails>

      {/* Add date picker dialogs */}
      {showStartDatePickerDialog && (
        <DialogOverlay onClick={closeStartDatePickerDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Select Start Date & Time</DialogTitle>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date || new Date());
                closeStartDatePickerDialog();
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
              fixedHeight
            />
            <DialogButtons>
              <SecondaryButton onClick={closeStartDatePickerDialog}>
                Cancel
              </SecondaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}

      {showEndDatePickerDialog && (
        <DialogOverlay onClick={closeEndDatePickerDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Select End Date & Time</DialogTitle>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date || new Date());
                closeEndDatePickerDialog();
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
              fixedHeight
            />
            <DialogButtons>
              <SecondaryButton onClick={closeEndDatePickerDialog}>
                Cancel
              </SecondaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}

      {isModalOpen && (
        <PosterUploadModal
          eventId={event._id}
          initialPoster={event.poster}
          onClose={() => setModalOpen(false)}
          onPosterUpdated={refetch}
        />
      )}
    </EventDetailsWrapper>
  );
};

export default EventDetailsEditor;

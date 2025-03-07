import React, { useState } from "react";
import styled from "styled-components";
import { Event, Feedback } from "../types";
import { format } from "date-fns";
import { useToast, ToastType } from "./Toasts";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { AIButton } from "./EventBudgetEditor";

const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  yellow: "#e6bf30",
  green: "#2a9134",
  blue: "#4F46E5",
  gray: "#64748B",
  shadow: "rgba(0, 0, 0, 0.05)",
};

// Styled components for the container
const FeedbackWrapper = styled.div`
  width: 90%;
  overflow: hidden;
  margin: 20px auto;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px 28px 0;
  flex-wrap: wrap;
`;

const FeedbackTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin: 0 28px 24px;
  padding-bottom: 2px;
`;

const Tab = styled.div<{ isActive: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  color: ${(props) => (props.isActive ? "#6b3ddf" : "#666")};
  border-bottom: 2px solid
    ${(props) => (props.isActive ? "#6b3ddf" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: #6b3ddf;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${(props) =>
      props.isActive ? "#6b3ddf" : "transparent"};
    transform: scaleX(${(props) => (props.isActive ? "1" : "0")});
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
    background-color: #6b3ddf;
  }
`;

const FeedbackContent = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 28px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border-left: 4px solid #6b3ddf;
  box-sizing: border-box;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:hover p::after {
    opacity: 1;
    width: 60px;
  }
`;

const FeedbackCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const GuestName = styled.h3`
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #6b3ddf;
  }
`;

const FeedbackDate = styled.span`
  color: #888;
  font-size: 14px;
  font-weight: 500;
`;

const FeedbackText = styled.p`
  color: #444;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  flex-grow: 1;
  position: relative;
  padding: 4px 0;

  &::first-letter {
    font-size: 18px;
    font-weight: 500;
    color: #6b3ddf;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #6b3ddf, transparent);
    opacity: 0;
    transition: opacity 0.3s ease, width 0.3s ease;
  }
`;

// Enhanced empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #6b7280;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;

  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

// Analysis styled components
const AnalysisContainer = styled.div`
  width: 100%;
  padding: 0 28px;
  box-sizing: border-box;
`;

// Modern dashboard-style layout with improved spacing
const AnalysisDashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  grid-column: 1 / -1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 16px;
`;

const AnalysisTitle = styled.h3`
  color: #333;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Enhanced card designs with more modern styling
const AnalysisCard = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 24px;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #6b3ddf, #8b5cf6);
    opacity: 0.8;
  }
`;

const OverviewCard = styled(AnalysisCard)`
  grid-column: 1 / -1;

  &::before {
    background: linear-gradient(90deg, #6b3ddf, #8b5cf6);
  }
`;

const StrengthCard = styled(AnalysisCard)`
  &::before {
    background: linear-gradient(90deg, #34d399, #10b981);
  }
`;

const WeaknessCard = styled(AnalysisCard)`
  &::before {
    background: linear-gradient(90deg, #f87171, #ef4444);
  }
`;

const SuggestionCard = styled(AnalysisCard)`
  &::before {
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
  }
`;

const CardTitle = styled.h3`
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

// Icon container for the purple boxes
const IconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6b3ddf, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

// Specific icon containers for each type
const StrengthIconContainer = styled(IconContainer)`
  background: linear-gradient(135deg, #10b981, #34d399);
`;

const WeaknessIconContainer = styled(IconContainer)`
  background: linear-gradient(135deg, #ef4444, #f87171);
`;

const SuggestionIconContainer = styled(IconContainer)`
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
`;

const CardContent = styled.p`
  color: #4b5563;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
`;

// Improved list styling
const ListItem = styled.li`
  margin-bottom: 14px;
  line-height: 1.6;
  position: relative;
  padding-left: 28px;
  color: #4b5563;

  &:last-child {
    margin-bottom: 0;
  }

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #6b3ddf;
  }
`;

// Improved sentiment indicator with animation
/* Commented out as it's not currently used
const SentimentIndicator = styled.div<{
  sentiment: "positive" | "neutral" | "negative";
}>`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  margin-top: 16px;
  background-color: ${(props) =>
    props.sentiment === "positive"
      ? "#10b981"
      : props.sentiment === "negative"
      ? "#ef4444"
      : "#f59e0b"};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 30%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;
*/

const LastUpdated = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 16px;
  text-align: right;
  grid-column: 1 / -1;
  font-style: italic;
`;

// Enhanced loading container
const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Improved loading spinner
const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(107, 61, 223, 0.2);
  border-radius: 50%;
  border-top-color: #6b3ddf;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AnalysisIcon = () => (
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

// New icons for the enhanced UI
const StrengthIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="white"
    />
  </svg>
);

const WeaknessIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      fill="white"
    />
  </svg>
);

const SuggestionIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"
      fill="white"
    />
  </svg>
);

const InsightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      fill="white"
    />
  </svg>
);

const AnalysisInfoContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  max-width: 800px;
  margin: 0 auto;
`;

const AnalysisInfoTitle = styled.h3`
  color: #333;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const AnalysisInfoText = styled.p`
  color: #4b5563;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const AnalysisFeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 32px 0;
  text-align: left;
`;

const AnalysisFeatureItem = styled.div`
  display: flex;
  gap: 16px;
`;

const AnalysisFeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6b3ddf, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const AnalysisFeatureContent = styled.div`
  flex: 1;
`;

const AnalysisFeatureTitle = styled.h4`
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const AnalysisFeatureDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

// Replace the search styling with the one from Events.tsx
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.backgroundSecondary};
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0 28px 20px;
  width: calc(100% - 56px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${colors.shadow};
  box-sizing: border-box;

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`;

const SearchIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: ${colors.textSecondary};
  margin-right: 10px;
  opacity: 0.7;
`;

const SearchInput = styled.input`
  font-family: Axiforma, sans-serif;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: ${colors.textPrimary};
  outline: none;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const ClearButton = styled.div`
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

// Sample feedback data for testing
const sampleFeedbackData = [
  {
    guestName: "Michael Chen",
    content:
      "The workshop was incredibly informative and well-structured. I especially appreciated the hands-on exercises that helped solidify the concepts. However, the venue was a bit cramped and made networking during breaks difficult.",
  },
  {
    guestName: "Sarah Johnson",
    content:
      "Great content and engaging speakers! The Q&A sessions were particularly valuable. My only suggestion would be to provide more detailed handouts or resources to reference after the event.",
  },
  {
    guestName: "David Rodriguez",
    content:
      "The event started 20 minutes late which was frustrating. While the speakers were knowledgeable, the sound system had issues and it was hard to hear from the back. The content itself was good but the technical problems detracted from the experience.",
  },
  {
    guestName: "Emily Wong",
    content:
      "I found the networking opportunities to be the highlight of this event. The speakers were also excellent and provided actionable insights. Like others, I thought the venue was too small for the number of attendees.",
  },
  {
    guestName: "James Wilson",
    content:
      "The content was relevant and timely for our industry. I particularly enjoyed the panel discussion. The venue was cramped though, and the temperature control was poor - it was too hot throughout the event.",
  },
  {
    guestName: "Priya Patel",
    content:
      "This was one of the best organized events I've attended this year. The agenda flowed logically, and the speakers were top-notch. My only suggestion would be to allow more time for networking.",
  },
  {
    guestName: "Robert Taylor",
    content:
      "The content was good but too basic for someone at my experience level. The event description should have been clearer about the target audience. Also, like others mentioned, the venue was uncomfortably crowded.",
  },
  {
    guestName: "Sophia Martinez",
    content:
      "I really appreciated the diverse perspectives from the panel of speakers. The Q&A session was particularly insightful. My main complaint would be the lack of adequate refreshments during the breaks, and the venue felt a bit stuffy.",
  },
  {
    guestName: "Thomas Lee",
    content:
      "The workshop started late, which cut into valuable learning time. Despite this, the content was excellent and the facilitators were clearly experts in their field. The hands-on activities were very beneficial, though the venue's WiFi kept dropping which affected some of the exercises.",
  },
  {
    guestName: "Aisha Johnson",
    content:
      "The speakers were engaging and the content was well-researched. I particularly valued the case studies presented. However, the sound system issues made it difficult to hear some of the presenters, especially during the Q&A portions.",
  },
  {
    guestName: "Daniel Kim",
    content:
      "This event exceeded my expectations in terms of content quality. The speakers were not only knowledgeable but also excellent communicators. My only criticism is that the venue was too small for the number of attendees, making it uncomfortable during breakout sessions.",
  },
  {
    guestName: "Olivia Williams",
    content:
      "The networking opportunities were valuable, but the event running behind schedule meant less time for these interactions. The temperature in the venue was uncomfortably warm, which became distracting. The speakers and content were excellent though.",
  },
  {
    guestName: "Marcus Johnson",
    content:
      "I found the content to be extremely relevant to current industry trends. The speakers were engaging and the Q&A sessions were thought-provoking. Like others have mentioned, the venue was too small and the temperature control was inadequate.",
  },
  {
    guestName: "Jennifer Garcia",
    content:
      "The event was well-organized with a clear agenda. I particularly appreciated the depth of knowledge from the speakers. However, the event started late and the venue was not ideal - poor acoustics made it hard to hear from certain areas of the room.",
  },
  {
    guestName: "Raj Patel",
    content:
      "The content and speakers were excellent, providing valuable insights for my business. The interactive elements were particularly helpful. My main issues were with the venue - it was cramped, poorly ventilated, and the WiFi was unreliable during the portions that required online participation.",
  },
  {
    guestName: "Lisa Thompson",
    content:
      "While the speakers were knowledgeable and the content was good, the technical issues with the presentation equipment were distracting. The event also ran behind schedule, which meant some topics felt rushed toward the end. I would have appreciated more comprehensive handouts.",
  },
  {
    guestName: "Carlos Mendez",
    content:
      "The workshop provided excellent value with its practical approach and expert facilitators. The hands-on exercises were particularly useful. However, the cramped venue made collaboration difficult, and starting late meant we couldn't cover all the planned material.",
  },
  {
    guestName: "Natalie Wong",
    content:
      "I appreciated the well-structured content and the expertise of the speakers. The networking opportunities were valuable as well. My suggestions would be to improve the sound system quality and provide more detailed resources to reference after the event.",
  },
];

// Test component to add sample feedback
interface TestFeedbackGeneratorProps {
  event: Event;
  refetch: () => void;
  axiosInstance: ReturnType<typeof useAxiosWithAuth>;
}

const TestFeedbackGenerator: React.FC<TestFeedbackGeneratorProps> = ({
  event,
  refetch,
  axiosInstance,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToast, Toasts } = useToast();

  const addSampleFeedback = async () => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      // Select 3-5 random reviews from the sample data

      // Add each review sequentially
      for (const review of sampleFeedbackData) {
        await axiosInstance.post(`/events/${event._id}/feedback`, {
          guestName: review.guestName,
          content: review.content,
        });
      }

      addToast(
        `Added ${sampleFeedbackData.length} sample reviews`,
        ToastType.SUCCESS
      );
      refetch();
    } catch (err) {
      console.error("Error adding sample feedback:", err);
      addToast("Failed to add sample feedback", ToastType.ERROR);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={addSampleFeedback}
        disabled={isAdding}
        style={{
          padding: "8px 16px",
          background: "#f0f0f0",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: isAdding ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          color: "#333",
        }}
      >
        {isAdding ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "2px solid #ccc",
                borderTopColor: "#666",
                animation: "spin 1s linear infinite",
              }}
            ></span>
            Adding samples...
          </>
        ) : (
          <>🧪 Add Sample Feedback</>
        )}
      </button>
      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
        *For testing only adds random sample reviews
      </div>
      <Toasts />
    </div>
  );
};

type Props = {
  event: Event;
  refetch: () => void;
};

const EventFeedbackViewer: React.FC<Props> = ({ event, refetch }) => {
  const [activeTab, setActiveTab] = useState<"feedback" | "analysis">(
    "feedback"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();
  const axiosInstance = useAxiosWithAuth();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (!event.feedback || event.feedback.length === 0) {
      addToast("No feedback to analyze", ToastType.ERROR);
      return;
    }

    setIsAnalyzing(true);

    try {
      await axiosInstance.post(`/events/${event._id}/feedback/analyze`, {
        eventId: event._id,
        reviews: event.feedback.map((f) => f.content),
      });

      addToast("Feedback analyzed successfully", ToastType.SUCCESS);
      refetch();
      setActiveTab("analysis");
    } catch (err) {
      console.error("Error analyzing feedback:", err);
      addToast("Failed to analyze feedback", ToastType.ERROR);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderFeedbackTab = () => {
    // Filter feedback based on search query
    const filteredFeedback = event.feedback
      ? event.feedback.filter((feedback: Feedback) => {
          const guestName = (
            feedback.guestName || "Anonymous Guest"
          ).toLowerCase();
          const content = feedback.content.toLowerCase();
          const query = searchQuery.toLowerCase();

          return guestName.includes(query) || content.includes(query);
        })
      : [];

    return (
      <FeedbackContent>
        {!event.feedback || event.feedback.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📝</EmptyStateIcon>
            <p
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#333",
              }}
            >
              No feedback has been submitted for this event yet
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "#6b7280",
                maxWidth: "400px",
                lineHeight: "1.6",
                margin: "0 auto",
              }}
            >
              Once attendees submit their feedback, it will appear here. You can
              share your event's feedback link to collect responses.
            </p>
          </EmptyState>
        ) : (
          <>
            <SearchContainer>
              <SearchIcon
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search feedback by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <ClearButton onClick={() => setSearchQuery("")}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </ClearButton>
              )}
            </SearchContainer>

            {filteredFeedback.length === 0 ? (
              <div style={{ padding: "0 28px" }}>
                <EmptyState>
                  <p style={{ fontSize: "16px", color: "#6b7280" }}>
                    No feedback matches your search.
                  </p>
                </EmptyState>
              </div>
            ) : (
              <>
                <FeedbackGrid>
                  {filteredFeedback.map((feedback: Feedback, index: number) => (
                    <FeedbackCard key={index}>
                      <FeedbackCardHeader>
                        <GuestName>
                          {feedback.guestName || "Anonymous Guest"}
                        </GuestName>
                        <FeedbackDate>
                          {formatDate(feedback.createdAt)}
                        </FeedbackDate>
                      </FeedbackCardHeader>
                      <FeedbackText>{feedback.content}</FeedbackText>
                    </FeedbackCard>
                  ))}
                </FeedbackGrid>

                {searchQuery && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: "#6b7280",
                      textAlign: "center",
                      padding: "0 28px",
                    }}
                  >
                    Showing {filteredFeedback.length} of {event.feedback.length}{" "}
                    feedback entries
                  </div>
                )}
              </>
            )}
          </>
        )}
      </FeedbackContent>
    );
  };

  const renderAnalysisTab = () => {
    if (isAnalyzing) {
      return (
        <LoadingContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid rgba(107, 61, 223, 0.2)",
                borderTop: "4px solid #6b3ddf",
                borderRadius: "50%",
                animation: "spin 1.2s linear infinite",
              }}
            />
            <p
              style={{ fontSize: "16px", color: "#6b7280", fontWeight: "500" }}
            >
              Analyzing feedback with AI...
            </p>
          </div>
        </LoadingContainer>
      );
    }

    if (!event.feedback || event.feedback.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            No feedback available to analyze.
          </p>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>
            Collect feedback from your event attendees first.
          </p>
        </EmptyState>
      );
    }

    // Check if analysis has been performed by looking for lastUpdated
    if (!event.feedbackAnalysis || !event.feedbackAnalysis.lastUpdated) {
      return (
        <AnalysisInfoContainer>
          <AnalysisInfoTitle>
            <IconContainer>
              <AnalysisIcon />
            </IconContainer>{" "}
            AI-Powered Feedback Analysis
          </AnalysisInfoTitle>

          <AnalysisInfoText>
            Our AI analysis tool processes all your event feedback to provide
            actionable insights that help you improve future events.
          </AnalysisInfoText>

          <AnalysisInfoText>
            With {event.feedback.length}{" "}
            {event.feedback.length === 1 ? "review" : "reviews"} collected, you
            can now generate a comprehensive analysis.
          </AnalysisInfoText>

          <AnalysisFeatureList>
            <AnalysisFeatureItem>
              <AnalysisFeatureIcon>
                <StrengthIcon />
              </AnalysisFeatureIcon>
              <AnalysisFeatureContent>
                <AnalysisFeatureTitle>Identify Strengths</AnalysisFeatureTitle>
                <AnalysisFeatureDescription>
                  Discover what attendees loved most about your event
                </AnalysisFeatureDescription>
              </AnalysisFeatureContent>
            </AnalysisFeatureItem>

            <AnalysisFeatureItem>
              <AnalysisFeatureIcon>
                <WeaknessIcon />
              </AnalysisFeatureIcon>
              <AnalysisFeatureContent>
                <AnalysisFeatureTitle>
                  Highlight Areas for Improvement
                </AnalysisFeatureTitle>
                <AnalysisFeatureDescription>
                  Understand what aspects need attention in future events
                </AnalysisFeatureDescription>
              </AnalysisFeatureContent>
            </AnalysisFeatureItem>

            <AnalysisFeatureItem>
              <AnalysisFeatureIcon>
                <SuggestionIcon />
              </AnalysisFeatureIcon>
              <AnalysisFeatureContent>
                <AnalysisFeatureTitle>
                  Get Actionable Suggestions
                </AnalysisFeatureTitle>
                <AnalysisFeatureDescription>
                  Receive specific recommendations to enhance your events
                </AnalysisFeatureDescription>
              </AnalysisFeatureContent>
            </AnalysisFeatureItem>

            <AnalysisFeatureItem>
              <AnalysisFeatureIcon>
                <InsightIcon />
              </AnalysisFeatureIcon>
              <AnalysisFeatureContent>
                <AnalysisFeatureTitle>Gain Key Insights</AnalysisFeatureTitle>
                <AnalysisFeatureDescription>
                  Get a comprehensive overview of attendee sentiment
                </AnalysisFeatureDescription>
              </AnalysisFeatureContent>
            </AnalysisFeatureItem>
          </AnalysisFeatureList>

          <AIButton
            onClick={handleAnalyzeFeedback}
            disabled={isAnalyzing}
            style={{ padding: "0 32px", height: "48px", fontSize: "16px" }}
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner /> Analyzing...
              </>
            ) : (
              <>
                <AnalysisIcon />
                Analyze Feedback Now
              </>
            )}
          </AIButton>
        </AnalysisInfoContainer>
      );
    }

    const analysis = event.feedbackAnalysis;
    console.log({ analysis });
    // Calculate stats for the enhanced UI
    const totalStrengths = analysis.strengths.length;
    const totalWeaknesses = analysis.weaknesses.length;
    const totalSuggestions = analysis.suggestions.length;

    // Determine overall sentiment - commented out as it's not currently used
    /*
    let overallSentiment: "positive" | "neutral" | "negative" = "neutral";
    if (totalStrengths > totalWeaknesses * 1.5) {
      overallSentiment = "positive";
    } else if (totalWeaknesses > totalStrengths) {
      overallSentiment = "negative";
    }
    */

    return (
      <AnalysisContainer>
        <AnalysisHeader>
          <AnalysisTitle>Feedback Analysis Dashboard</AnalysisTitle>
          <AIButton
            onClick={handleAnalyzeFeedback}
            disabled={isAnalyzing}
            style={{ padding: "0 16px", height: "38px" }}
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner /> Refreshing...
              </>
            ) : (
              <>
                <AnalysisIcon />
                Refresh Analysis
              </>
            )}
          </AIButton>
        </AnalysisHeader>

        <AnalysisDashboard>
          {/* Overview Section */}
          <OverviewCard>
            <CardTitle>
              <IconContainer>
                <InsightIcon />
              </IconContainer>{" "}
              Key Insights Overview
            </CardTitle>
            <CardContent>{analysis.overview}</CardContent>
            {/* <SentimentIndicator sentiment={overallSentiment} /> */}
          </OverviewCard>

          {/* Strengths Section */}
          <StrengthCard>
            <CardTitle>
              <StrengthIconContainer>
                <StrengthIcon />
              </StrengthIconContainer>{" "}
              Event Strengths ({totalStrengths})
            </CardTitle>
            {analysis.strengths.length > 0 ? (
              <ul
                style={{ paddingLeft: "0", listStyleType: "none", margin: "0" }}
              >
                {analysis.strengths.map((strength, index) => (
                  <ListItem key={index}>{strength}</ListItem>
                ))}
              </ul>
            ) : (
              <CardContent>No specific strengths identified.</CardContent>
            )}
          </StrengthCard>

          {/* Weaknesses Section */}
          <WeaknessCard>
            <CardTitle>
              <WeaknessIconContainer>
                <WeaknessIcon />
              </WeaknessIconContainer>{" "}
              Areas for Improvement ({totalWeaknesses})
            </CardTitle>
            {analysis.weaknesses.length > 0 ? (
              <ul
                style={{ paddingLeft: "0", listStyleType: "none", margin: "0" }}
              >
                {analysis.weaknesses.map((weakness, index) => (
                  <ListItem key={index}>{weakness}</ListItem>
                ))}
              </ul>
            ) : (
              <CardContent>
                No specific areas for improvement identified.
              </CardContent>
            )}
          </WeaknessCard>

          {/* Suggestions Section */}
          <SuggestionCard>
            <CardTitle>
              <SuggestionIconContainer>
                <SuggestionIcon />
              </SuggestionIconContainer>{" "}
              Actionable Suggestions ({totalSuggestions})
            </CardTitle>
            {analysis.suggestions.length > 0 ? (
              <ul
                style={{ paddingLeft: "0", listStyleType: "none", margin: "0" }}
              >
                {analysis.suggestions.map((suggestion, index) => (
                  <ListItem key={index}>{suggestion}</ListItem>
                ))}
              </ul>
            ) : (
              <CardContent>No specific suggestions available.</CardContent>
            )}
          </SuggestionCard>

          {/* Only show last updated if there's actual analysis data */}
          {analysis.lastUpdated &&
            (analysis.strengths.length > 0 ||
              analysis.weaknesses.length > 0 ||
              analysis.suggestions.length > 0) && (
              <LastUpdated>
                Last updated: {formatDate(analysis.lastUpdated)}
              </LastUpdated>
            )}
        </AnalysisDashboard>
      </AnalysisContainer>
    );
  };

  return (
    <FeedbackWrapper>
      <FeedbackHeader>
        <FeedbackTitle>Event Feedback</FeedbackTitle>

        {event.feedback &&
          activeTab === "feedback" &&
          event.feedback.length >= 3 &&
          !(!event.feedbackAnalysis || !event.feedbackAnalysis.lastUpdated) && (
            <ButtonsContainer>
              <AIButton onClick={handleAnalyzeFeedback} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner /> Analyzing...
                  </>
                ) : (
                  <>
                    <AnalysisIcon />
                    Analyze with AI
                  </>
                )}
              </AIButton>
            </ButtonsContainer>
          )}
      </FeedbackHeader>

      <TabsContainer>
        <Tab
          isActive={activeTab === "feedback"}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback
        </Tab>
        <Tab
          isActive={activeTab === "analysis"}
          onClick={() => {
            if (event.feedback && event.feedback.length >= 3) {
              setActiveTab("analysis");
            } else if (event.feedback && event.feedback.length > 0) {
              addToast(
                "At least 3 feedback submissions are required for analysis",
                ToastType.INFO
              );
            } else {
              addToast("No feedback available to analyze", ToastType.INFO);
            }
          }}
          style={{
            cursor:
              event.feedback && event.feedback.length >= 3
                ? "pointer"
                : "not-allowed",
            opacity: event.feedback && event.feedback.length >= 3 ? 1 : 0.6,
          }}
        >
          Analysis
        </Tab>
      </TabsContainer>

      {activeTab === "feedback" ? renderFeedbackTab() : renderAnalysisTab()}

      {/* Add the test component at the bottom */}
      {/* {process.env.NODE_ENV !== "production" && (
        <TestFeedbackGenerator
          event={event}
          refetch={refetch}
          axiosInstance={axiosInstance}
        />
      )} */}
    </FeedbackWrapper>
  );
};

export default EventFeedbackViewer;

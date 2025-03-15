import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { format } from "date-fns";
import {
  Event,
  Feedback,
  type FeedbackAnswer,
  FeedbackQuestion,
} from "../types";
import { ToastType, useToast } from "./Toasts";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { AIButton } from "./EventBudgetEditor";
import FeedbackFormEditor from "./FeedbackFormEditor";

const colors = {
  primary: "#6b3ddf",
  primaryLight: "#8f6df2",
  primaryDark: "#5a32c0",
  secondary: "#f5f5f5",
  text: "#333333",
  textLight: "#666666",
  border: "#e0e0e0",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};

const FeedbackWrapper = styled.div`
  width: 90%;
  margin: 20px auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  color: #333333;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border};
  background-color: ${colors.secondary};
  padding: 0 16px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(107, 61, 223, 0.2),
      rgba(107, 61, 223, 0.05),
      rgba(107, 61, 223, 0)
    );
    z-index: 1;
  }
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 18px 24px;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  color: ${(props) => (props.active ? colors.primary : colors.textLight)};
  border-bottom: 3px solid
    ${(props) => (props.active ? colors.primary : "transparent")};
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;

  ${(props) =>
    props.active &&
    `
    background-color: rgba(107, 61, 223, 0.05);
  `}

  &:hover {
    color: ${colors.primary};
    background-color: rgba(107, 61, 223, 0.05);
  }
`;

const FeedbackContent = styled.div`
  padding: 28px;
  min-height: 300px;
  color: #333333;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #333333;
  background-color: rgba(107, 61, 223, 0.02);
  border-radius: 12px;
  border: 1px dashed rgba(107, 61, 223, 0.2);
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  background-color: rgba(107, 61, 223, 0.1);
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
  background-color: rgba(107, 61, 223, 0.03);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 18px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  color: #333333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
  }

  &::placeholder {
    color: rgba(102, 102, 102, 0.7);
  }
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 160px;
  box-shadow: 0 2px 5px rgba(107, 61, 223, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &::before {
    content: "✨";
    font-size: 14px;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      ${colors.primaryDark},
      ${colors.primary}
    );
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(107, 61, 223, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(107, 61, 223, 0.2);
  }

  &:disabled {
    background: linear-gradient(
      135deg,
      ${colors.primaryLight},
      ${colors.primary}
    );
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Add keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(107, 61, 223, 0.2);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(107, 61, 223, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(107, 61, 223, 0);
  }
`;

const FeedbackCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 24px;
  border-left: 4px solid ${colors.primary};
  color: #333333;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
  animation-fill-mode: both;

  &:nth-child(2) {
    animation-delay: 0.1s;
  }

  &:nth-child(3) {
    animation-delay: 0.2s;
  }

  &:nth-child(4) {
    animation-delay: 0.3s;
  }

  &:nth-child(n + 5) {
    animation-delay: 0.4s;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(
      90deg,
      ${colors.primary},
      ${colors.primaryLight}
    );
    opacity: 0.1;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const GuestName = styled.div`
  font-weight: 600;
  color: ${colors.text};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 16px;
  gap: 8px;
`;

const GuestEmail = styled.span`
  font-size: 14px;
  color: ${colors.textLight};
  font-weight: normal;
  display: inline-flex;
  align-items: center;

  &::before {
    content: "•";
    margin-right: 8px;
    opacity: 0.5;
  }
`;

const FeedbackDate = styled.div`
  font-size: 14px;
  color: ${colors.textLight};
  background-color: ${colors.secondary};
  padding: 4px 10px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;

  &::before {
    content: "🕒";
    margin-right: 6px;
    font-size: 12px;
  }
`;

const FeedbackAnswers = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FeedbackAnswer = styled.div`
  margin-bottom: 0;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: ${colors.text};
  font-size: 15px;
  display: flex;
  align-items: center;

  &::before {
    content: "❯";
    margin-right: 8px;
    color: ${colors.primary};
    font-size: 12px;
  }
`;

const AnswerText = styled.div`
  color: ${colors.text};
  line-height: 1.6;
  font-size: 15px;
  padding: 0 0 0 20px;
  white-space: pre-wrap;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 20px;
`;

const RatingValue = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.primary};
  margin-right: 8px;
  background-color: rgba(107, 61, 223, 0.1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;

  &:hover {
    background-color: rgba(107, 61, 223, 0.2);
    transform: scale(1.1);
  }
`;

const RatingScale = styled.span`
  color: ${colors.textLight};
  font-size: 14px;
`;

const ChoiceDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 0 0 20px;
`;

const ChoiceOption = styled.div`
  background-color: rgba(107, 61, 223, 0.08);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: ${colors.text};
  border: 1px solid rgba(107, 61, 223, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(107, 61, 223, 0.12);
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const RankingDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 0 20px;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: rgba(107, 61, 223, 0.04);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(107, 61, 223, 0.08);
    transform: translateX(2px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const RankNumber = styled.span`
  font-weight: bold;
  margin-right: 8px;
  color: ${colors.primary};
  background-color: rgba(107, 61, 223, 0.1);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
`;

// Analysis tab styled components
const AnalysisContainer = styled.div`
  padding: 0 20px;
  color: #333333;
`;

const AnalysisSection = styled.div`
  margin-bottom: 30px;
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const AnalysisTitle = styled.h3`
  margin: 0;
  margin-left: 12px;
  font-size: 18px;
  color: ${colors.text};
`;

const AnalysisContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #333333;
`;

const AnalysisText = styled.p`
  margin: 0;
  line-height: 1.6;
  color: ${colors.text};
`;

const AnalysisList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #333333;
`;

const AnalysisItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.5;
  color: ${colors.text};

  &:last-child {
    margin-bottom: 0;
  }
`;

const AnalysisDate = styled.div`
  font-size: 14px;
  color: ${colors.textLight};
  margin-top: 16px;
  text-align: right;
`;

const NoAnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #333333;
`;

const AnalyzeButtonLarge = styled(AIButton)`
  margin-top: 20px;
`;

// Icons for the analysis section
const FeedbackIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 8H17M7 12H11M12 20L8 16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4H20C20.5523 4 21 4.44772 21 5V15C21 15.5523 20.5523 16 20 16H16L12 20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AnalysisIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 8V16M12 11V16M8 14V16M4 18H20C20.5523 18 21 17.5523 21 17V7C21 6.44772 20.5523 6 20 6H4C3.44772 6 3 6.44772 3 7V17C3 17.5523 3.44772 18 4 18Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FormIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const StrengthIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 12L11 14L15 10M7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20Z"
      stroke={colors.success}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WeaknessIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 14.5L11.5 12.5M11.5 12.5L13.5 10.5M11.5 12.5L9.5 10.5M11.5 12.5L13.5 14.5M7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20Z"
      stroke={colors.error}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SuggestionIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 11.5L11.5 9.5M11.5 9.5L13.5 7.5M11.5 9.5L9.5 7.5M11.5 9.5L13.5 11.5M12 22C12.5917 22 13.1374 21.7454 13.5249 21.3149C13.8346 20.9669 14 20.5109 14 20H10C10 20.5109 10.1654 20.9669 10.4751 21.3149C10.8626 21.7454 11.4083 22 12 22ZM12 2C7.58172 2 4 5.58172 4 4 10C4 11.8487 4.63187 13.551 5.70764 14.9048C6.29595 15.6784 6.99997 16.5484 7.1468 17.568C7.25618 18.3249 7.64762 19 8.5 19H15.5C16.3524 19 16.7438 18.3249 16.8532 17.568C17.0001 16.5484 17.7041 15.6784 18.2924 14.9048C19.3681 13.551 20 11.8487 20 10C20 5.58172 16.4183 2 12 2Z"
      stroke={colors.warning}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InsightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16V21M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM18 8L20 6M6 8L4 6M18 16L20 18M6 16L4 18M21 12H19M5 12H3M12 3V5"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Add these styled components near the other styled components
const RatingLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 13px;
  color: ${colors.textLight};
  width: 100%;
  max-width: 300px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
`;

const RatingLabelMin = styled.span`
  text-align: left;
  opacity: 0.8;
  font-style: italic;
`;

const RatingLabelMax = styled.span`
  text-align: right;
  opacity: 0.8;
  font-style: italic;
`;

type Props = {
  event: Event;
  refetch: () => void;
};

const EventFeedbackViewer: React.FC<Props> = ({ event, refetch }) => {
  const [activeTab, setActiveTab] = useState<"feedback" | "analysis" | "form">(
    "feedback"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast, Toasts } = useToast();
  const axiosInstance = useAxiosWithAuth();

  // Memoize filtered feedback to prevent unnecessary recalculations
  const filteredFeedback = React.useMemo(() => {
    if (!event.feedback) return [];

    return event.feedback.filter((feedback: Feedback) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const guestName = (feedback.guestName || "Anonymous Guest").toLowerCase();

      // Check if guest name matches
      if (guestName.includes(query)) return true;

      // Check if any answer contains the search query
      return feedback.answers?.some((answer) => {
        // For text answers
        if (answer.textAnswer) {
          return answer.textAnswer.toLowerCase().includes(query);
        }
        // For rating answers
        if (answer.ratingAnswer !== undefined) {
          return answer.ratingAnswer.toString().includes(query);
        }
        return false;
      });
    });
  }, [event.feedback, searchQuery]);

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
      await axiosInstance.post(`/events/${event._id}/feedback/analyze`);

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

  // Memoize the renderAnswer function to prevent unnecessary re-renders
  const renderAnswer = React.useCallback(
    (answer: FeedbackAnswer, question: FeedbackQuestion) => {
      switch (question.type) {
        case "text":
          return (
            <AnswerText>{answer.textAnswer || "No answer provided"}</AnswerText>
          );

        case "rating":
          if (answer.ratingAnswer === undefined)
            return <AnswerText>No rating provided</AnswerText>;

          return (
            <RatingDisplay>
              <RatingValue>{answer.ratingAnswer}</RatingValue>
              <RatingScale>
                out of{" "}
                {question.maxRating !== undefined ? question.maxRating : 10}
                {question.minLabel || question.maxLabel ? (
                  <RatingLabels>
                    {question.minLabel && (
                      <RatingLabelMin>{question.minLabel}</RatingLabelMin>
                    )}
                    {question.maxLabel && (
                      <RatingLabelMax>{question.maxLabel}</RatingLabelMax>
                    )}
                  </RatingLabels>
                ) : null}
              </RatingScale>
            </RatingDisplay>
          );

        case "single_choice":
        case "multiple_choice":
          if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
            return <AnswerText>No option selected</AnswerText>;
          }

          return (
            <ChoiceDisplay>
              {answer.selectedOptions.map((optionId) => {
                const option = question.options?.find(
                  (opt) => opt.id === optionId
                );
                return option ? (
                  <ChoiceOption key={optionId}>{option.text}</ChoiceOption>
                ) : null;
              })}
            </ChoiceDisplay>
          );

        case "ranking":
          if (!answer.rankingOrder || answer.rankingOrder.length === 0) {
            return <AnswerText>No ranking provided</AnswerText>;
          }

          return (
            <RankingDisplay>
              {answer.rankingOrder.map((optionId, index) => {
                const option = question.options?.find(
                  (opt) => opt.id === optionId
                );
                return option ? (
                  <RankingItem key={optionId}>
                    <RankNumber>{index + 1}.</RankNumber> {option.text}
                  </RankingItem>
                ) : null;
              })}
            </RankingDisplay>
          );

        default:
          return <AnswerText>Unknown question type</AnswerText>;
      }
    },
    []
  );

  const renderFeedbackTab = React.useCallback(() => {
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
              No feedback yet
            </p>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Feedback from your guests will appear here.
            </p>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Configure your feedback form in the "Form" tab.
            </p>
          </EmptyState>
        ) : (
          <>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <AnalyzeButton
                onClick={handleAnalyzeFeedback}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Feedback"}
              </AnalyzeButton>
            </SearchContainer>

            {filteredFeedback.length === 0 ? (
              <EmptyState>
                <p>No feedback matches your search.</p>
              </EmptyState>
            ) : (
              filteredFeedback.map((feedback, index) => (
                <FeedbackCard key={feedback._id || index}>
                  <FeedbackHeader>
                    <GuestName>
                      {feedback.guestName || "Anonymous Guest"}
                      {feedback.guestEmail && (
                        <GuestEmail>{feedback.guestEmail}</GuestEmail>
                      )}
                    </GuestName>
                    <FeedbackDate>
                      {formatDate(feedback.createdAt)}
                    </FeedbackDate>
                  </FeedbackHeader>
                  <FeedbackAnswers>
                    {feedback.answers &&
                      feedback.answers.map((answer, answerIndex) => {
                        // Find the corresponding question
                        const question = event.feedbackForm?.questions.find(
                          (q) => q.id === answer.questionId
                        );

                        if (!question) return null;

                        return (
                          <FeedbackAnswer key={answerIndex}>
                            <QuestionTitle>{question.title}</QuestionTitle>
                            {renderAnswer(answer, question)}
                          </FeedbackAnswer>
                        );
                      })}
                  </FeedbackAnswers>
                </FeedbackCard>
              ))
            )}
          </>
        )}
      </FeedbackContent>
    );
  }, [
    event.feedback,
    event.feedbackForm,
    filteredFeedback,
    formatDate,
    handleAnalyzeFeedback,
    isAnalyzing,
    renderAnswer,
    searchQuery,
  ]);

  const renderAnalysisTab = React.useCallback(() => {
    if (!event.feedbackAnalysis) {
      return (
        <NoAnalysisContainer>
          <InsightIcon />
          <h3>No Analysis Available</h3>
          <p>
            Analyze your feedback to get insights about strengths, weaknesses,
            and suggestions for improvement.
          </p>
          <AnalyzeButtonLarge
            onClick={handleAnalyzeFeedback}
            disabled={
              isAnalyzing || !event.feedback || event.feedback.length === 0
            }
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Feedback"}
          </AnalyzeButtonLarge>
        </NoAnalysisContainer>
      );
    }

    return (
      <AnalysisContainer>
        <AnalysisSection>
          <AnalysisHeader>
            <AnalysisIcon />
            <AnalysisTitle>Overview</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisContent>
            <AnalysisText>{event.feedbackAnalysis.overview}</AnalysisText>
          </AnalysisContent>
        </AnalysisSection>

        <AnalysisSection>
          <AnalysisHeader>
            <StrengthIcon />
            <AnalysisTitle>Strengths</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisContent>
            <AnalysisList>
              {event.feedbackAnalysis.strengths.map((strength, index) => (
                <AnalysisItem key={index}>{strength}</AnalysisItem>
              ))}
            </AnalysisList>
          </AnalysisContent>
        </AnalysisSection>

        <AnalysisSection>
          <AnalysisHeader>
            <WeaknessIcon />
            <AnalysisTitle>Areas for Improvement</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisContent>
            <AnalysisList>
              {event.feedbackAnalysis.weaknesses.map((weakness, index) => (
                <AnalysisItem key={index}>{weakness}</AnalysisItem>
              ))}
            </AnalysisList>
          </AnalysisContent>
        </AnalysisSection>

        <AnalysisSection>
          <AnalysisHeader>
            <SuggestionIcon />
            <AnalysisTitle>Suggestions</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisContent>
            <AnalysisList>
              {event.feedbackAnalysis.suggestions.map((suggestion, index) => (
                <AnalysisItem key={index}>{suggestion}</AnalysisItem>
              ))}
            </AnalysisList>
          </AnalysisContent>
        </AnalysisSection>

        <AnalysisDate>
          Last updated: {formatDate(event.feedbackAnalysis.lastUpdated)}
        </AnalysisDate>
      </AnalysisContainer>
    );
  }, [
    event.feedbackAnalysis,
    event.feedback,
    formatDate,
    handleAnalyzeFeedback,
    isAnalyzing,
  ]);

  // Update the renderTabs function or the JSX where tabs are rendered
  const renderTabs = () => (
    <TabsContainer>
      <Tab
        active={activeTab === "feedback"}
        onClick={() => setActiveTab("feedback")}
      >
        <FeedbackIcon /> Feedback
      </Tab>
      <Tab
        active={activeTab === "analysis"}
        onClick={() => setActiveTab("analysis")}
      >
        <AnalysisIcon /> Analysis
      </Tab>
      <Tab active={activeTab === "form"} onClick={() => setActiveTab("form")}>
        <FormIcon /> Form
      </Tab>
    </TabsContainer>
  );

  return (
    <FeedbackWrapper>
      {renderTabs()}
      {activeTab === "feedback" && renderFeedbackTab()}
      {activeTab === "analysis" && renderAnalysisTab()}
      {activeTab === "form" && (
        <FeedbackFormEditor event={event} refetch={refetch} />
      )}
      <Toasts />
    </FeedbackWrapper>
  );
};

export default EventFeedbackViewer;

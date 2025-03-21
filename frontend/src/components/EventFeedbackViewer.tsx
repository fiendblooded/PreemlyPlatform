import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { format } from "date-fns";
import { Event } from "../types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import FeedbackPDF from "./FeedbackPDF";
import { AIButton } from "./EventBudgetEditor";
import FeedbackFormEditor from "./FeedbackFormEditor";
import { exportToExcel } from "../utils/feedbackExport";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

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
  border-bottom: 1px solid #eee;
  margin: 0 20px 20px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  color: ${(props) => (props.active ? colors.primary : "#666")};
  border-bottom: 2px solid
    ${(props) => (props.active ? colors.primary : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${colors.primary};
  }
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

const AnswerText = styled.div`
  color: ${colors.text};
  line-height: 1.6;
  font-size: 15px;
  padding: 0 0 0 20px;
  white-space: pre-wrap;
`;

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

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:first-child {
    border-bottom: 1px solid #eee;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Button = styled(AIButton)`
  min-width: 120px;
`;

const ExportButton = styled(AIButton)`
  background: linear-gradient(135deg, #4caf50, #45a049);
  margin-left: 12px;

  &:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const FeedbackItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FeedbackContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const AnswerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuestionText = styled.div`
  font-weight: 500;
  color: #333;
`;

const EmptyStateText = styled.p`
  color: #666;
  text-align: center;
  margin: 0;
`;

// Update Props type
type Props = {
  event: Event;
  refetch: () => void;
};

const EventFeedbackViewer: React.FC<Props> = ({
  event,
  refetch,
}): JSX.Element => {
  const [activeTab, setActiveTab] = useState<"feedback" | "analysis" | "form">(
    "feedback"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const axiosInstance = useAxiosWithAuth();

  const handleAnalyzeFeedback = React.useCallback(async () => {
    if (!event.feedback || event.feedback.length === 0) {
      return;
    }

    setIsAnalyzing(true);

    try {
      await axiosInstance.post(`/events/${event._id}/feedback/analyze`);
      refetch();
      setActiveTab("analysis");
    } catch (err) {
      console.error("Error analyzing feedback:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [event.feedback, event._id, axiosInstance, refetch, setActiveTab]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  // Update the renderFeedbackTab function to be a proper React component
  const FeedbackTab: React.FC<{ event: Event }> = ({ event }) => {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter feedback based on search query
    const filteredFeedback =
      event.feedback?.filter((feedback) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          feedback.guestName?.toLowerCase().includes(searchLower) ||
          feedback.guestEmail?.toLowerCase().includes(searchLower)
        );
      }) || [];

    return (
      <div>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ButtonContainer>
            <Button onClick={handleAnalyzeFeedback}>Analyze Feedback</Button>
            <ExportDropdown>
              <ExportButton
                onClick={() => setIsExportOpen(!isExportOpen)}
                disabled={!event.feedback || event.feedback.length === 0}
              >
                Export
              </ExportButton>
              <DropdownContent isOpen={isExportOpen}>
                <PDFDownloadLink
                  document={<FeedbackPDF event={event} />}
                  fileName={`feedback-report-${format(
                    new Date(),
                    "yyyy-MM-dd"
                  )}.pdf`}
                  className="text-decoration-none"
                >
                  {({ loading }) => (
                    <DropdownItem onClick={() => setIsExportOpen(false)}>
                      {loading ? "Generating PDF..." : "Export as PDF"}
                    </DropdownItem>
                  )}
                </PDFDownloadLink>
                <DropdownItem
                  onClick={() => {
                    exportToExcel(event);
                    setIsExportOpen(false);
                  }}
                >
                  Export as Excel
                </DropdownItem>
              </DropdownContent>
            </ExportDropdown>
          </ButtonContainer>
        </SearchContainer>
        {filteredFeedback.length > 0 ? (
          <FeedbackList>
            {filteredFeedback.map((feedback) => (
              <FeedbackItem key={feedback._id}>
                <FeedbackHeader>
                  <GuestName>
                    {feedback.guestName || "Anonymous Guest"}
                  </GuestName>
                  <FeedbackDate>
                    {format(new Date(feedback.createdAt || ""), "MMM d, yyyy")}
                  </FeedbackDate>
                </FeedbackHeader>
                <FeedbackContent>
                  {feedback.answers.map((answer) => {
                    const question = event.feedbackForm?.questions.find(
                      (q) => q.id === answer.questionId
                    );
                    if (!question) return null;

                    let answerText = "";
                    if (answer.textAnswer) {
                      answerText = answer.textAnswer;
                    } else if (answer.ratingAnswer !== undefined) {
                      answerText = `${answer.ratingAnswer} out of ${
                        question.maxRating || 10
                      }`;
                    } else if (answer.selectedOptions?.length) {
                      answerText = answer.selectedOptions
                        .map(
                          (optId) =>
                            question.options?.find((opt) => opt.id === optId)
                              ?.text
                        )
                        .filter(Boolean)
                        .join(", ");
                    }

                    return (
                      <AnswerItem key={answer.questionId}>
                        <QuestionText>{question.title}</QuestionText>
                        <AnswerText>{answerText}</AnswerText>
                      </AnswerItem>
                    );
                  })}
                </FeedbackContent>
              </FeedbackItem>
            ))}
          </FeedbackList>
        ) : (
          <EmptyState>
            <EmptyStateText>
              {searchQuery
                ? "No feedback matches your search"
                : "No feedback has been submitted yet"}
            </EmptyStateText>
          </EmptyState>
        )}
      </div>
    );
  };

  // Fix the return type of renderFeedbackTab
  const renderFeedbackTab = (): JSX.Element => {
    return <FeedbackTab event={event} />;
  };

  const renderAnalysisTab = React.useCallback(() => {
    if (!event.feedbackAnalysis) {
      return (
        <NoAnalysisContainer>
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
            <AnalysisTitle>Overview</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisContent>
            <AnalysisText>{event.feedbackAnalysis.overview}</AnalysisText>
          </AnalysisContent>
        </AnalysisSection>

        <AnalysisSection>
          <AnalysisHeader>
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
        Feedback
      </Tab>
      <Tab
        active={activeTab === "analysis"}
        onClick={() => setActiveTab("analysis")}
      >
        Analysis
      </Tab>
      <Tab active={activeTab === "form"} onClick={() => setActiveTab("form")}>
        Form
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
    </FeedbackWrapper>
  );
};

export default EventFeedbackViewer;

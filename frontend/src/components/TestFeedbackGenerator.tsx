import React, { useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { Event, FeedbackQuestionType } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";

const Container = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Title = styled.h3`
  margin-top: 0;
  color: #333;
`;

const Button = styled.button`
  background-color: #6b3ddf;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a32c0;
  }

  &:disabled {
    background-color: #a78eea;
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Note = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

interface Props {
  event: Event;
  refetch: () => void;
}

const TestFeedbackGenerator: React.FC<Props> = ({ event, refetch }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();

  const generateRandomFeedback = async () => {
    if (
      isGenerating ||
      !event.feedbackForm ||
      !event.feedbackForm.questions ||
      event.feedbackForm.questions.length === 0
    ) {
      addToast(
        "Cannot generate feedback: No feedback form defined",
        ToastType.ERROR
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Generate 5 random feedback submissions
      const names = [
        "John Doe",
        "Jane Smith",
        "Alex Johnson",
        "Maria Garcia",
        "David Kim",
        "Sarah Brown",
        "Michael Wilson",
        "Emma Davis",
        "James Miller",
        "Olivia Taylor",
      ];

      const feedbackSubmissions = [];

      for (let i = 0; i < 5; i++) {
        const nameIndex = Math.floor(Math.random() * names.length);
        const answers = event.feedbackForm.questions.map((question) => {
          interface FeedbackAnswerData {
            questionId: string;
            textAnswer?: string;
            ratingAnswer?: number;
            selectedOptions?: string[];
            rankingOrder?: string[];
          }

          const answer: FeedbackAnswerData = {
            questionId: question.id,
          };

          switch (question.type) {
            case "text":
              answer.textAnswer = generateRandomTextAnswer();
              break;

            case "rating": {
              const min =
                question.minRating !== undefined ? question.minRating : 0;
              const max =
                question.maxRating !== undefined ? question.maxRating : 10;
              answer.ratingAnswer =
                Math.floor(Math.random() * (max - min + 1)) + min;
              break;
            }

            case "single_choice":
              if (question.options && question.options.length > 0) {
                const randomIndex = Math.floor(
                  Math.random() * question.options.length
                );
                answer.selectedOptions = [question.options[randomIndex].id];
              }
              break;

            case "multiple_choice":
              if (question.options && question.options.length > 0) {
                // Select 1-3 random options
                const numOptions =
                  Math.floor(
                    Math.random() * Math.min(3, question.options.length)
                  ) + 1;
                const selectedIndices = new Set<number>();

                while (selectedIndices.size < numOptions) {
                  selectedIndices.add(
                    Math.floor(Math.random() * question.options.length)
                  );
                }

                answer.selectedOptions = Array.from(selectedIndices).map(
                  (index) => question.options![index].id
                );
              }
              break;

            case "ranking":
              if (question.options && question.options.length > 0) {
                // Create a shuffled array of option IDs
                const optionIds = [...question.options.map((opt) => opt.id)];
                for (let i = optionIds.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [optionIds[i], optionIds[j]] = [optionIds[j], optionIds[i]];
                }
                answer.rankingOrder = optionIds;
              }
              break;
          }

          return answer;
        });

        feedbackSubmissions.push({
          guestName: names[nameIndex],
          answers,
        });
      }

      // Submit the feedback
      const response = await axiosInstance.post(
        `/events/${event._id}/feedback/batch`,
        { feedbackSubmissions }
      );

      if (response.data.success) {
        addToast(
          "Successfully generated 5 random feedback submissions",
          ToastType.SUCCESS
        );
        refetch();
      } else {
        addToast(
          "Failed to generate feedback: " + response.data.message,
          ToastType.ERROR
        );
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      addToast("An error occurred while generating feedback", ToastType.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomTextAnswer = () => {
    const positiveResponses = [
      "Great experience overall!",
      "I really enjoyed this aspect of the event.",
      "The organization was excellent.",
      "Very professional and well-executed.",
      "Exceeded my expectations.",
      "Would definitely attend again.",
      "The speakers were very knowledgeable.",
      "Great networking opportunity.",
    ];

    const neutralResponses = [
      "It was okay, nothing special.",
      "Met my expectations, but didn't exceed them.",
      "Some aspects were good, others could be improved.",
      "Average experience overall.",
      "Decent organization, but room for improvement.",
    ];

    const negativeResponses = [
      "Could have been better organized.",
      "Didn't meet my expectations.",
      "There were several issues that affected my experience.",
      "Needs improvement in several areas.",
      "I was disappointed with this aspect.",
    ];

    const responseTypes = [
      { responses: positiveResponses, weight: 0.6 },
      { responses: neutralResponses, weight: 0.3 },
      { responses: negativeResponses, weight: 0.1 },
    ];

    // Weighted random selection of response type
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedResponses;

    for (const type of responseTypes) {
      cumulativeWeight += type.weight;
      if (random <= cumulativeWeight) {
        selectedResponses = type.responses;
        break;
      }
    }

    // Fallback to positive if something went wrong
    if (!selectedResponses) {
      selectedResponses = positiveResponses;
    }

    // Select a random response from the chosen category
    const responseIndex = Math.floor(Math.random() * selectedResponses.length);
    return selectedResponses[responseIndex];
  };

  const generateDefaultFeedbackForm = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const defaultForm = {
        title: "Event Feedback",
        description: "Please share your thoughts about our event",
        isEnabled: false,
        questions: [
          {
            id: uuidv4(),
            title: "How would you rate the overall event?",
            type: "rating" as FeedbackQuestionType,
            required: true,
            minRating: 1,
            maxRating: 5,
          },
          {
            id: uuidv4(),
            title: "What did you like most about the event?",
            type: "text" as FeedbackQuestionType,
            required: true,
          },
          {
            id: uuidv4(),
            title: "What could be improved for future events?",
            type: "text" as FeedbackQuestionType,
            required: false,
          },
          {
            id: uuidv4(),
            title: "Which aspects of the event did you find most valuable?",
            type: "multiple_choice" as FeedbackQuestionType,
            required: true,
            options: [
              { id: uuidv4(), text: "Content/Presentations" },
              { id: uuidv4(), text: "Networking Opportunities" },
              { id: uuidv4(), text: "Venue and Facilities" },
              { id: uuidv4(), text: "Food and Refreshments" },
              { id: uuidv4(), text: "Organization and Logistics" },
            ],
          },
          {
            id: uuidv4(),
            title: "How likely are you to recommend this event to others?",
            type: "single_choice" as FeedbackQuestionType,
            required: true,
            options: [
              { id: uuidv4(), text: "Very Likely" },
              { id: uuidv4(), text: "Likely" },
              { id: uuidv4(), text: "Neutral" },
              { id: uuidv4(), text: "Unlikely" },
              { id: uuidv4(), text: "Very Unlikely" },
            ],
          },
          {
            id: uuidv4(),
            title: "Please rank the following in order of importance to you:",
            type: "ranking" as FeedbackQuestionType,
            required: false,
            options: [
              { id: uuidv4(), text: "Quality of Speakers" },
              { id: uuidv4(), text: "Relevance of Content" },
              { id: uuidv4(), text: "Networking Opportunities" },
              { id: uuidv4(), text: "Venue and Location" },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await axiosInstance.put(
        `/events/${event._id}/feedback-form`,
        defaultForm
      );
      addToast("Default feedback form created", ToastType.SUCCESS);
      refetch();
    } catch (error) {
      console.error("Error creating default form:", error);
      addToast("Failed to create default form", ToastType.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container>
      <Title>Test Tools</Title>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button onClick={generateDefaultFeedbackForm} disabled={isGenerating}>
          {isGenerating ? "Creating..." : "Create Default Form"}
        </Button>
        <Button
          onClick={generateRandomFeedback}
          disabled={
            isGenerating ||
            !event.feedbackForm ||
            !event.feedbackForm.questions ||
            event.feedbackForm.questions.length === 0
          }
        >
          {isGenerating ? "Generating..." : "Generate Test Feedback"}
        </Button>
      </div>
      <Note>
        *For testing purposes only. Creates a sample feedback form and generates
        random feedback submissions.
      </Note>
      <Toasts />
    </Container>
  );
};

export default TestFeedbackGenerator;

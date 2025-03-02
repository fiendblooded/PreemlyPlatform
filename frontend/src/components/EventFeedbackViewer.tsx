import React from "react";
import styled from "styled-components";
import { Event, Feedback } from "../types";
import { format } from "date-fns";

const FeedbackContainer = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 20px 0;
`;

const FeedbackCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid #6b3ddf;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const GuestName = styled.h3`
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const FeedbackDate = styled.span`
  color: #888;
  font-size: 14px;
`;

const FeedbackContent = styled.p`
  color: #444;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

type Props = {
  event: Event;
};

const EventFeedbackViewer: React.FC<Props> = ({ event }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <FeedbackContainer>
      <SectionTitle>Event Feedback</SectionTitle>

      {!event.feedback || event.feedback.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📝</EmptyStateIcon>
          <p>No feedback has been submitted for this event yet.</p>
        </EmptyState>
      ) : (
        event.feedback.map((feedback: Feedback, index: number) => (
          <FeedbackCard key={index}>
            <FeedbackHeader>
              <GuestName>{feedback.guestName || "Anonymous Guest"}</GuestName>
              <FeedbackDate>{formatDate(feedback.createdAt)}</FeedbackDate>
            </FeedbackHeader>
            <FeedbackContent>{feedback.content}</FeedbackContent>
          </FeedbackCard>
        ))
      )}
    </FeedbackContainer>
  );
};

export default EventFeedbackViewer;

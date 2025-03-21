import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { Event, FeedbackAnswer, FeedbackQuestion } from "../types";

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#333333",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#2c2c2c",
    borderBottom: "2 solid #6b3ddf",
    paddingBottom: 5,
  },
  feedbackCard: {
    marginBottom: 15,
    padding: 10,
    border: "1 solid #e0e0e0",
    borderRadius: 4,
  },
  guestInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  guestName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  date: {
    fontSize: 12,
    color: "#666666",
  },
  question: {
    fontSize: 14,
    marginBottom: 5,
    color: "#2c2c2c",
  },
  answer: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 10,
  },
  analysisSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f8f9fc",
    borderRadius: 4,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c2c2c",
  },
  analysisList: {
    marginLeft: 10,
  },
  analysisItem: {
    fontSize: 12,
    marginBottom: 5,
    color: "#666666",
  },
});

interface FeedbackPDFProps {
  event: Event;
}

const FeedbackPDF: React.FC<FeedbackPDFProps> = ({ event }) => {
  const renderAnswer = (answer: FeedbackAnswer, question: FeedbackQuestion) => {
    if (answer.textAnswer) {
      return answer.textAnswer;
    }

    if (answer.ratingAnswer !== undefined) {
      return `${answer.ratingAnswer} out of ${question.maxRating || 10}`;
    }

    if (answer.selectedOptions && answer.selectedOptions.length > 0) {
      return answer.selectedOptions
        .map((optId) => question.options?.find((opt) => opt.id === optId)?.text)
        .filter(Boolean)
        .join(", ");
    }

    return "No answer provided";
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Feedback Report</Text>

        {/* Feedback Section */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Guest Feedback</Text>
          {event.feedback?.map((feedback, index) => (
            <View key={index} style={pdfStyles.feedbackCard}>
              <View style={pdfStyles.guestInfo}>
                <Text style={pdfStyles.guestName}>
                  {feedback.guestName || "Anonymous Guest"}
                  {feedback.guestEmail ? ` (${feedback.guestEmail})` : ""}
                </Text>
                <Text style={pdfStyles.date}>
                  {format(new Date(feedback.createdAt || ""), "MMM d, yyyy")}
                </Text>
              </View>
              {feedback.answers?.map((answer, answerIndex) => {
                const question = event.feedbackForm?.questions.find(
                  (q) => q.id === answer.questionId
                );
                if (!question) return null;

                return (
                  <View key={answerIndex}>
                    <Text style={pdfStyles.question}>{question.title}</Text>
                    <Text style={pdfStyles.answer}>
                      {renderAnswer(answer, question)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Analysis Section */}
        {event.feedbackAnalysis && (
          <View style={pdfStyles.analysisSection}>
            <Text style={pdfStyles.analysisTitle}>Feedback Analysis</Text>

            <Text style={pdfStyles.sectionTitle}>Overview</Text>
            <Text style={pdfStyles.analysisItem}>
              {event.feedbackAnalysis.overview}
            </Text>

            <Text style={pdfStyles.sectionTitle}>Strengths</Text>
            <View style={pdfStyles.analysisList}>
              {event.feedbackAnalysis.strengths.map((strength, index) => (
                <Text key={index} style={pdfStyles.analysisItem}>
                  • {strength}
                </Text>
              ))}
            </View>

            <Text style={pdfStyles.sectionTitle}>Areas for Improvement</Text>
            <View style={pdfStyles.analysisList}>
              {event.feedbackAnalysis.weaknesses.map((weakness, index) => (
                <Text key={index} style={pdfStyles.analysisItem}>
                  • {weakness}
                </Text>
              ))}
            </View>

            <Text style={pdfStyles.sectionTitle}>Suggestions</Text>
            <View style={pdfStyles.analysisList}>
              {event.feedbackAnalysis.suggestions.map((suggestion, index) => (
                <Text key={index} style={pdfStyles.analysisItem}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default FeedbackPDF;

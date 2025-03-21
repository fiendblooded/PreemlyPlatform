import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Event, Feedback } from "../types";

interface FeedbackRow {
  "Guest Name": string;
  "Guest Email": string;
  Date: string;
  [key: string]: string | number;
}

export const exportToExcel = (event: Event) => {
  try {
    const feedbackData =
      event.feedback?.map((feedback) => {
        const row: FeedbackRow = {
          "Guest Name": feedback.guestName || "Anonymous Guest",
          "Guest Email": feedback.guestEmail || "",
          Date: format(new Date(feedback.createdAt || ""), "MMM d, yyyy"),
        };

        // Add answers for each question
        feedback.answers.forEach((answer) => {
          const question = event.feedbackForm?.questions.find(
            (q) => q.id === answer.questionId
          );
          if (question) {
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
                    question.options?.find((opt) => opt.id === optId)?.text
                )
                .filter(Boolean)
                .join(", ");
            }
            row[question.title] = answerText;
          }
        });

        return row;
      }) || [];

    // Create analysis worksheet
    const analysisData = event.feedbackAnalysis
      ? [
          { Overview: event.feedbackAnalysis.overview },
          { Strengths: event.feedbackAnalysis.strengths.join("\n") },
          {
            "Areas for Improvement":
              event.feedbackAnalysis.weaknesses.join("\n"),
          },
          { Suggestions: event.feedbackAnalysis.suggestions.join("\n") },
          {
            "Last Updated": format(
              new Date(event.feedbackAnalysis.lastUpdated),
              "MMM d, yyyy"
            ),
          },
        ]
      : [];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const feedbackWs = XLSX.utils.json_to_sheet(feedbackData);
    const analysisWs = XLSX.utils.json_to_sheet(analysisData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, feedbackWs, "Feedback");
    XLSX.utils.book_append_sheet(wb, analysisWs, "Analysis");

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `feedback-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};

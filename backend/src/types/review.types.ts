export interface IChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IReviewAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface IStructuredFeedbackItem {
  guestName: string;
  answers: {
    question: string;
    answer: string;
    type: string;
  }[];
} 
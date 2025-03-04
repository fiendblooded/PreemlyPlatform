// Types for chatbot requests and responses
export interface ChatbotRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  context?: {
    currentEventId?: string;
    [key: string]: unknown;
  };
}

export interface ChatbotResponse {
  message: string;
  action?: {
    type: string;
    payload: unknown;
  };
  sessionId?: string;
}

// Event data interface
export interface EventData {
  name: string;
  date?: string;
  location?: string;
  description?: string;
  [key: string]: string | undefined;
}

// Analytics result interface
export interface AnalyticsResult {
  success: boolean;
  data: {
    result: string;
    [key: string]: unknown;
  };
}

// Mock function for now - will be replaced with actual API call
export const sendChatbotMessage = async (
  request: ChatbotRequest
): Promise<ChatbotResponse> => {
  console.log("Sending message to chatbot API:", request);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response based on message content
  if (request.message.toLowerCase().includes("create event")) {
    return {
      message:
        "I'd be happy to help you create a new event! Please provide details like event name, date, location, and description.",
      action: {
        type: "SUGGEST_EVENT_CREATION",
        payload: {
          suggestedFields: ["name", "date", "location", "description"],
        },
      },
    };
  }

  if (
    request.message.toLowerCase().includes("gmail") &&
    request.message.toLowerCase().includes("guest")
  ) {
    return {
      message:
        "Based on your current events, approximately 68% of your guests use Gmail for their email addresses.",
      action: {
        type: "SHOW_STATS",
        payload: {
          stat: "email_domains",
          data: {
            "gmail.com": 68,
            "outlook.com": 15,
            "yahoo.com": 10,
            other: 7,
          },
        },
      },
    };
  }

  // Default response
  return {
    message: `I received your message: "${request.message}". This is a placeholder response. In the real implementation, I would process your request and provide relevant information.`,
  };
};

// Function to create a new event from chatbot
export const createEventFromChatbot = async (
  eventData: EventData
): Promise<{
  success: boolean;
  eventId: string;
  message: string;
}> => {
  console.log("Creating event from chatbot:", eventData);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock response
  return {
    success: true,
    eventId: "new-event-" + Date.now(),
    message: "Event created successfully!",
  };
};

// Function to get analytics from events
export const getEventAnalytics = async (
  query: string,
  eventId?: string
): Promise<AnalyticsResult> => {
  console.log("Getting event analytics:", query, eventId);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Mock response
  return {
    success: true,
    data: {
      // Mock data would go here
      result: "This is a placeholder for event analytics data",
    },
  };
};

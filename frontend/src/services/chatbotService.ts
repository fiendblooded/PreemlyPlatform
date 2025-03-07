/* eslint-disable react-hooks/rules-of-hooks */
import { ButtonOption } from "../components/chatbot/ui/ChatbotMessage";

// Chatbot message types
export interface ChatbotMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  options?: ButtonOption[];
}

// Chatbot request
export interface ChatbotRequest {
  message: string;
  action?: string;
  actionValue?: string;
  sessionId?: string;
  useAI?: boolean; // New parameter to toggle between AI and guided modes
}

// Chatbot response
export interface ChatbotResponse {
  message: string;
  options?: ButtonOption[];
  sessionId: string;
  action?: string;
  data?: Record<string, unknown>;
}

// Event data structure
export interface EventData {
  title: string;
  date?: string;
  location?: string;
  type?: string;
  description?: string;
  budget?: number;
  [key: string]: string | number | boolean | undefined;
}

// Conversation state tracking
export enum ChatState {
  INITIAL = "initial",
  CREATING_EVENT = "creating_event",
  CONFIRMING_EVENT = "confirming_event",
  MODIFYING_EVENT = "modifying_event",
  FINALIZING_EVENT = "finalizing_event",
  GETTING_INFO = "getting_info",
  // New states for guided flow
  GUIDED_NAME = "guided_name",
  GUIDED_DATE = "guided_date",
  GUIDED_LOCATION = "guided_location",
  GUIDED_TYPE = "guided_type",
  GUIDED_DESCRIPTION = "guided_description",
  GUIDED_CONFIRM = "guided_confirm",
}

// Session storage
interface ChatSession {
  state: ChatState;
  eventData?: EventData;
  modificationAttempts: number;
  useAI: boolean; // Track which mode is being used
}

// In-memory session storage (would be replaced with proper backend storage)
const sessions: Record<string, ChatSession> = {};

// Generate a unique session ID
const generateSessionId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Initialize a new session
const initSession = (sessionId: string, useAI: boolean = true): void => {
  sessions[sessionId] = {
    state: ChatState.INITIAL,
    modificationAttempts: 0,
    useAI,
  };
};

// Mock function to simulate OpenAI Assistant processing
const processWithOpenAI = async (
  message: string,
  eventData?: EventData
): Promise<EventData> => {
  // This would be replaced with actual OpenAI Assistant API call
  console.log("Processing with OpenAI:", message, eventData);

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Improved regex patterns for better extraction

  // Name extraction
  const nameMatch1 = message.match(
    /(?:event|party|meeting|conference|wedding) (?:called|named|titled) "([^"]+)"/i
  );
  const nameMatch2 = message.match(
    /(?:event|party|meeting|conference|wedding): ([^,.]+)/i
  );
  const nameMatch3 = message.match(
    /(?:event|party|meeting|conference|wedding) (?:about|on|for) ([^,.]+)/i
  );

  // Date extraction - improved to catch more formats
  const dateMatch1 = message.match(
    /(?:on|at|for) (?:the )?(\d{1,2}(?:st|nd|rd|th)?(?: of)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\w*)(?:,? \d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})/i
  );
  const dateMatch2 = message.match(
    /(\d{1,2}(?:st|nd|rd|th)?(?: of)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\w*)(?:,? \d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})/i
  );
  const dateMatch3 = message.match(
    /(?:date|scheduled for|will be on) (?:the )?(\d{1,2}(?:st|nd|rd|th)?(?: of)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\w*)(?:,? \d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})/i
  );

  // Month name extraction
  const monthMatch = message.match(
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i
  );

  // Day extraction
  const dayMatch = message.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);

  // Location extraction - improved to catch more formats
  const locationMatch1 = message.match(
    /(?:at|in) ([^,.]+(?:venue|location|place|center|hall|building|arena|stadium|hotel|resort))/i
  );
  const locationMatch2 = message.match(
    /location(?:: | is | at | in )([^,.]+)/i
  );
  const locationMatch3 = message.match(
    /(?:at|in) ([^,.]{3,50}?)(?:,|\.|and|on|for|$)/i
  );
  const locationMatch4 = message.match(
    /(?:venue|place|location) (?:is |will be |at |in )([^,.]+)/i
  );

  // Specific location extraction for well-known places
  const specificLocationMatch = message.match(
    /\b(Burj[- ]Khalifa|Eiffel Tower|Times Square|Central Park|Golden Gate|Big Ben|Taj Mahal|Great Wall|Colosseum|Sydney Opera House|Statue of Liberty)\b/i
  );

  // Type extraction - improved to catch more formats
  const typeMatch1 = message.match(/(?:type|kind)(?:: | is | of )([^,.]+)/i);
  const typeMatch2 = message.match(
    /\b(wedding|birthday|conference|meeting|party|dinner|reception|seminar|workshop|concert|exhibition|fair|festival|gala|ceremony|symposium|retreat|webinar|hybrid)\b/i
  );
  const typeMatch3 = message.match(
    /(?:it will be|it is|this is) a ([^,.]+? (?:event|party|meeting|conference|wedding|dinner|reception))/i
  );
  const typeMatch4 = message.match(
    /(?:it will be|it is|this is) a ([^,.]+?)(?:,|\.|and|on|for|$)/i
  );

  // Extract a better description
  let description = "";
  if (message.length > 20) {
    // Remove any extracted information from the description to avoid duplication
    description = message;
  }

  // Determine the event name
  let name = "New Event";
  if (nameMatch1) name = nameMatch1[1];
  else if (nameMatch2) name = nameMatch2[1];
  else if (nameMatch3) name = nameMatch3[1];
  else if (typeMatch2)
    name =
      typeMatch2[1].charAt(0).toUpperCase() + typeMatch2[1].slice(1) + " Event";

  // Determine the date
  let date;
  if (dateMatch1) date = dateMatch1[1];
  else if (dateMatch2) date = dateMatch2[1];
  else if (dateMatch3) date = dateMatch3[1];
  else if (monthMatch && dayMatch) date = `${dayMatch[1]} ${monthMatch[0]}`;

  // Determine the location
  let location;
  if (specificLocationMatch) location = specificLocationMatch[1];
  else if (locationMatch1) location = locationMatch1[1];
  else if (locationMatch2) location = locationMatch2[1];
  else if (locationMatch4) location = locationMatch4[1];
  else if (locationMatch3 && locationMatch3[1].length > 3)
    location = locationMatch3[1];

  // Determine the type
  let type;
  if (typeMatch1) type = typeMatch1[1];
  else if (typeMatch2) type = typeMatch2[1];
  else if (typeMatch3) type = typeMatch3[1];
  else if (typeMatch4 && !location && !date) type = typeMatch4[1];

  const extractedData: EventData = {
    title: name,
    date,
    location,
    type,
    description:
      description.substring(0, 150) + (description.length > 150 ? "..." : ""),
  };

  // If we have existing event data, merge with new data
  if (eventData) {
    // Create a new object with only defined values from extractedData
    const definedValues: Partial<EventData> = {};
    for (const [key, value] of Object.entries(extractedData)) {
      if (value !== undefined) {
        definedValues[key as keyof EventData] = value;
      }
    }

    return {
      ...eventData,
      ...definedValues,
    };
  }

  return extractedData;
};

// Mock function to create an event
const createEvent = async (
  eventData: EventData,
  axiosInstance: import("axios").AxiosInstance
): Promise<string> => {
  console.log("Creating event with data:", JSON.stringify(eventData, null, 2));

  try {
    // Map the chatbot event data to the format expected by the API

    // Validate and format the date
    let eventDate = new Date();
    if (eventData.date) {
      try {
        // Try to parse the date string
        eventDate = new Date(eventData.date);

        // Check if the date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn("Invalid date format received:", eventData.date);
          // Fall back to current date
          eventDate = new Date();
        }
      } catch (dateError) {
        console.warn("Error parsing date:", dateError);
        // Fall back to current date
        eventDate = new Date();
      }
    }

    const eventPayload = {
      title: eventData.title || "New Event", // Add default title if missing
      description: eventData.description || "",
      // ownerId will be set by the backend based on the auth token
      date: eventDate.toISOString(),
      endDate: eventDate.toISOString(), // Using same date for now
      eventType: eventData.type || "Offline",
      location: eventData.location
        ? {
            address: eventData.location,
            // Default coordinates (can be updated later)
            latitude: 37.4224764,
            longitude: -122.0842499,
            placeId: "",
          }
        : {
            address: "1600 Amphitheatre Parkway, Mountain View, CA, USA",
            latitude: 37.4224764,
            longitude: -122.0842499,
            placeId: "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
          },
      poster: "", // No poster for chatbot-created events initially
      welcomeScreenParams: {
        backgroundColor: "",
        textColor: "",
        isGdpr: false,
        isManualCheckin: true,
        videoUrl: "",
      },
      emailParams: {
        scheduleSrc: {
          enabled: false,
          content: "",
          items: [], // Initialize empty items array
        },
        parking: {
          enabled: false,
          content: "",
        },
        dining: {
          enabled: false,
          content: "",
        },
      },
    };

    console.log(
      "Event payload being sent to API:",
      JSON.stringify(eventPayload, null, 2)
    );

    // Make API call to create event
    const response = await axiosInstance.post("/events", eventPayload);

    // Return the event ID
    return response.data.message._id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error; // Rethrow to be handled by the caller
  }
};

// Handle initial message
const handleInitialMessage = (sessionId: string): ChatbotResponse => {
  // Set session state
  sessions[sessionId].state = ChatState.INITIAL;

  const useAI = sessions[sessionId].useAI;

  return {
    message:
      "Hi there! I can help you create a new event or find information about your existing events. What would you like to do?" +
      (useAI ? "" : " (Using guided mode)"),
    options: [
      {
        text: "Create new event",
        value: "create_event",
        action: "create_event",
        primary: true,
      },
      { text: "Get event information", value: "get_info", action: "get_info" },
      {
        text: useAI ? "Switch to guided mode" : "Switch to AI mode",
        value: "toggle_mode",
        action: "toggle_ai_mode",
      },
    ],
    sessionId,
  };
};

// Handle event creation request
const handleCreateEventRequest = (sessionId: string): ChatbotResponse => {
  const session = sessions[sessionId];

  if (session.useAI) {
    // AI-powered flow
    session.state = ChatState.CREATING_EVENT;
    return {
      message:
        "Great! Please describe the event you'd like to create. Include details like event type, date, location, and any other important information.",
      sessionId,
    };
  } else {
    // Guided step-by-step flow
    session.state = ChatState.GUIDED_NAME;
    session.eventData = { title: "" };
    return {
      message:
        "Let's create your event step by step. What would you like to name your event?",
      sessionId,
    };
  }
};

// Handle guided name input
const handleGuidedName = (
  sessionId: string,
  message: string
): ChatbotResponse => {
  const session = sessions[sessionId];

  if (!session.eventData) {
    session.eventData = { title: "" };
  }

  // Update event name
  session.eventData.title = message.trim() || "New Event";

  // Move to next step
  session.state = ChatState.GUIDED_DATE;

  return {
    message: `Great! Your event will be called "${session.eventData.title}". When will it take place? (Please provide a date)`,
    sessionId,
  };
};

// Handle guided date input
const handleGuidedDate = (
  sessionId: string,
  message: string
): ChatbotResponse => {
  const session = sessions[sessionId];

  if (!session.eventData) {
    session.eventData = { title: "New Event" };
  }

  // Update event date
  session.eventData.date = message.trim();

  // Move to next step
  session.state = ChatState.GUIDED_LOCATION;

  return {
    message: `Got it! The event is scheduled for ${session.eventData.date}. Where will it take place?`,
    sessionId,
  };
};

// Handle guided location input
const handleGuidedLocation = (
  sessionId: string,
  message: string
): ChatbotResponse => {
  const session = sessions[sessionId];

  if (!session.eventData) {
    session.eventData = { title: "New Event" };
  }

  // Update event location
  session.eventData.location = message.trim();

  // Move to next step
  session.state = ChatState.GUIDED_TYPE;

  return {
    message: `Perfect! The event will be at ${session.eventData.location}. What type of event is this? (e.g., conference, wedding, party)`,
    sessionId,
  };
};

// Handle guided type input
const handleGuidedType = (
  sessionId: string,
  message: string
): ChatbotResponse => {
  const session = sessions[sessionId];

  if (!session.eventData) {
    session.eventData = { title: "New Event" };
  }

  // Update event type
  session.eventData.type = message.trim();

  // Move to next step
  session.state = ChatState.GUIDED_DESCRIPTION;

  return {
    message: `Great! This will be a ${session.eventData.type} event. Please provide a brief description of the event:`,
    sessionId,
  };
};

// Handle guided description input
const handleGuidedDescription = (
  sessionId: string,
  message: string
): ChatbotResponse => {
  const session = sessions[sessionId];

  if (!session.eventData) {
    session.eventData = { title: "New Event" };
  }

  // Update event description
  session.eventData.description = message.trim();

  // Move to confirmation step
  session.state = ChatState.GUIDED_CONFIRM;

  // Format the event details for display
  const eventSummary = formatEventSummary(session.eventData);

  return {
    message: `Thanks for the details! Here's a summary of your event:\n\n${eventSummary}\n\nWould you like to create this event?`,
    options: [
      {
        text: "Yes, create this event",
        value: "confirm_event",
        action: "CONFIRM_EVENT",
        primary: true,
      },
      {
        text: "No, start over",
        value: "create_event",
        action: "SET_STATE",
      },
    ],
    sessionId,
  };
};

// Handle event description
const handleEventDescription = async (
  sessionId: string,
  message: string
): Promise<ChatbotResponse> => {
  // Process the description with OpenAI
  const eventData = await processWithOpenAI(message);

  // Store the extracted event data in the session
  sessions[sessionId] = {
    ...sessions[sessionId],
    state: ChatState.CONFIRMING_EVENT,
    eventData,
  };

  // Format the event details for display
  const eventSummary = formatEventSummary(eventData);

  return {
    message: `Based on your description, here's what I've understood:\n\n${eventSummary}\n\nIs this what you had in mind?`,
    options: [
      {
        text: "Yes, create this event",
        value: "confirm_event",
        action: "CONFIRM_EVENT",
        primary: true,
      },
      {
        text: "No, make changes",
        value: "modify_event",
        action: "MODIFY_EVENT",
      },
    ],
    sessionId,
  };
};

// Handle event modification
const handleEventModification = async (
  sessionId: string,
  message: string
): Promise<ChatbotResponse> => {
  const session = sessions[sessionId];

  // Increment modification attempts
  session.modificationAttempts += 1;

  // Process the modification with OpenAI
  const updatedEventData = await processWithOpenAI(message, session.eventData);

  // Update the session with the new event data
  session.eventData = updatedEventData;

  // Check if we've reached the maximum number of modification attempts
  const maxAttemptsReached = session.modificationAttempts >= 3;

  if (maxAttemptsReached) {
    // If max attempts reached, move to finalizing state
    session.state = ChatState.FINALIZING_EVENT;

    return {
      message: `I've updated the event details, but we've made several changes already. Let's proceed with creating the event:\n\n${formatEventSummary(
        updatedEventData
      )}`,
      options: [
        {
          text: "Create event",
          value: "create_final_event",
          action: "CREATE_EVENT",
          primary: true,
        },
      ],
      sessionId,
    };
  } else {
    // Otherwise, stay in confirming state
    session.state = ChatState.CONFIRMING_EVENT;

    return {
      message: `I've updated the event details:\n\n${formatEventSummary(
        updatedEventData
      )}\n\nIs this what you had in mind?`,
      options: [
        {
          text: "Yes, create this event",
          value: "confirm_event",
          action: "CONFIRM_EVENT",
          primary: true,
        },
        {
          text: "No, make changes",
          value: "modify_event",
          action: "MODIFY_EVENT",
        },
      ],
      sessionId,
    };
  }
};

// Handle event creation
const handleEventCreation = async (
  sessionId: string,
  axiosInstance: import("axios").AxiosInstance
): Promise<ChatbotResponse> => {
  const session = sessions[sessionId];
  const eventData = session.eventData;

  console.log(
    "handleEventCreation called with session data:",
    JSON.stringify(session, null, 2)
  );

  if (!eventData) {
    return {
      message:
        "Sorry, I couldn't find any event data to create. Let's start over.",
      options: [
        {
          text: "Create new event",
          value: "create_event",
          action: "create_event",
          primary: true,
        },
      ],
      sessionId,
    };
  }

  // Validate that we have a title
  if (!eventData.title) {
    console.warn("Event data is missing title, adding default title");
    eventData.title = "New Event";
  }

  try {
    // Create the event using the provided axios instance
    const eventId = await createEvent(eventData, axiosInstance);

    // Store event name before resetting
    const eventName = eventData.title;

    // Reset session state
    session.state = ChatState.INITIAL;
    session.eventData = undefined;
    session.modificationAttempts = 0;

    return {
      message: `Great! I've created your event "${eventName}". You'll be redirected to the event details page momentarily.`,
      action: "NAVIGATE_TO_EVENT",
      data: { eventId },
      sessionId,
    };
  } catch (error) {
    console.error("Error in handleEventCreation:", error);

    // Keep the session data in case the user wants to try again
    return {
      message:
        "I encountered an error while creating your event. Would you like to try again or start over?",
      options: [
        {
          text: "Try again",
          value: "confirm_event",
          action: "confirm_event",
          primary: true,
        },
        {
          text: "Start over",
          value: "create_event",
          action: "create_event",
        },
      ],
      sessionId,
    };
  }
};

// Handle get info request
const handleGetInfoRequest = (sessionId: string): ChatbotResponse => {
  // Update session state
  sessions[sessionId].state = ChatState.GETTING_INFO;

  // For now, just return a placeholder message
  return {
    message:
      "This feature is coming soon! For now, I can only help with creating new events.",
    options: [
      {
        text: "Create new event instead",
        value: "create_event",
        action: "SET_STATE",
        primary: true,
      },
      { text: "Go back", value: "initial", action: "SET_STATE" },
    ],
    sessionId,
  };
};

// Format event summary for display
const formatEventSummary = (eventData: EventData): string => {
  const lines = [
    `Event Name: ${eventData.title || "Not specified"}`,
    `Date: ${eventData.date || "Not specified"}`,
    `Location: ${eventData.location || "Not specified"}`,
    `Type: ${eventData.type || "Not specified"}`,
    `Description: ${eventData.description || "Not specified"}`,
  ];

  return lines.join("\n");
};

// Toggle between AI and guided modes
const toggleChatMode = (sessionId: string): ChatbotResponse => {
  const session = sessions[sessionId];

  // Toggle the mode
  session.useAI = !session.useAI;

  // Reset to initial state
  session.state = ChatState.INITIAL;
  session.eventData = undefined;
  session.modificationAttempts = 0;

  return {
    message: `Mode switched to ${
      session.useAI ? "AI-powered" : "guided step-by-step"
    } event creation. How can I help you?`,
    options: [
      {
        text: "Create new event",
        value: "create_event",
        action: "create_event",
        primary: true,
      },
      { text: "Get event information", value: "get_info", action: "get_info" },
      {
        text: session.useAI ? "Switch to guided mode" : "Switch to AI mode",
        value: "toggle_mode",
        action: "toggle_ai_mode",
      },
    ],
    sessionId,
  };
};

// Handle event description with AI
const handleEventDescriptionWithAI = async (
  sessionId: string,
  message: string,
  axiosInstance: import("axios").AxiosInstance
): Promise<ChatbotResponse> => {
  // Process the description with OpenAI
  const eventData = await processWithRealOpenAI(message, axiosInstance);

  // Store the extracted event data in the session
  sessions[sessionId] = {
    ...sessions[sessionId],
    state: ChatState.CONFIRMING_EVENT,
    eventData,
  };

  // Format the event details for display
  const eventSummary = formatEventSummary(eventData);

  return {
    message: `Here's what I understood about your event:\n\n${eventSummary}\n\nIs this correct? You can confirm or tell me what to change.`,
    options: [
      {
        text: "Yes, that's correct",
        value: "confirm_event",
        action: "confirm_event",
        primary: true,
      },
      {
        text: "No, I need to make changes",
        value: "modify_event",
        action: "modify_event",
      },
    ],
    sessionId,
  };
};

// Handle event modification with AI
const handleEventModificationWithAI = async (
  sessionId: string,
  message: string,
  axiosInstance: import("axios").AxiosInstance
): Promise<ChatbotResponse> => {
  const session = sessions[sessionId];

  if (!session || !session.eventData) {
    return {
      message:
        "I'm sorry, but I couldn't find your event details. Let's start over.",
      options: [
        {
          text: "Start over",
          value: "start_over",
          action: "start_over",
          primary: true,
        },
      ],
      sessionId,
    };
  }

  // Process the modification with OpenAI
  const updatedEventData = await processWithRealOpenAI(
    message,
    axiosInstance,
    session.eventData
  );

  // Update the session with the modified event data
  sessions[sessionId] = {
    ...session,
    eventData: updatedEventData,
    modificationAttempts: session.modificationAttempts + 1,
  };

  // Format the updated event details for display
  const eventSummary = formatEventSummary(updatedEventData);

  return {
    message: `I've updated your event details:\n\n${eventSummary}\n\nIs this correct now?`,
    options: [
      {
        text: "Yes, that's correct",
        value: "confirm_event",
        action: "confirm_event",
        primary: true,
      },
      {
        text: "No, I need to make more changes",
        value: "modify_event",
        action: "modify_event",
      },
    ],
    sessionId,
  };
};

// Process event description with real OpenAI API
const processWithRealOpenAI = async (
  message: string,
  axiosInstance: import("axios").AxiosInstance,
  eventData?: EventData
): Promise<EventData> => {
  try {
    console.log("Processing with real OpenAI API");

    // Make API call to backend endpoint
    const response = await axiosInstance.post("/openai/event-assistant", {
      message,
      existingEventData: eventData,
    });

    console.log("OpenAI API response:", JSON.stringify(response.data, null, 2));

    // Extract the event data from the response
    const extractedEventData = response.data.eventData;

    console.log(
      "Extracted event data:",
      JSON.stringify(extractedEventData, null, 2)
    );

    // If we have existing event data, merge it with the extracted data
    if (eventData) {
      const mergedData = { ...eventData, ...extractedEventData };
      console.log("Merged event data:", JSON.stringify(mergedData, null, 2));
      return mergedData;
    }

    return extractedEventData;
  } catch (error) {
    console.error("Error in processWithRealOpenAI:", error);

    // If the OpenAI API call fails, fall back to the mock implementation
    console.log("Falling back to mock implementation due to error");
    return processWithOpenAI(message, eventData);
  }
};

// Send a message to the chatbot
export const sendMessage = async (
  request: ChatbotRequest,
  axiosInstance: import("axios").AxiosInstance
): Promise<ChatbotResponse> => {
  const {
    message,
    sessionId: requestSessionId,
    action,
    actionValue,
    useAI,
  } = request;

  // Generate a session ID if not provided
  const sessionId = requestSessionId || generateSessionId();

  // Initialize the session if it doesn't exist
  if (!sessions[sessionId]) {
    initSession(sessionId, useAI !== undefined ? useAI : true);
  } else if (useAI !== undefined) {
    // Update the AI mode if specified
    sessions[sessionId].useAI = useAI;
  }

  // Handle special actions
  if (action === "toggle_ai_mode") {
    return toggleChatMode(sessionId);
  }

  if (action === "start_over") {
    // Reset the session
    sessions[sessionId] = {
      state: ChatState.INITIAL,
      modificationAttempts: 0,
      useAI: sessions[sessionId].useAI,
    };
    return handleInitialMessage(sessionId);
  }

  if (action === "create_event") {
    return handleCreateEventRequest(sessionId);
  }

  if (action === "confirm_event") {
    return handleEventCreation(sessionId, axiosInstance);
  }

  if (action === "modify_event") {
    sessions[sessionId].state = ChatState.MODIFYING_EVENT;
    return {
      message:
        "Please tell me what you'd like to change about the event details.",
      sessionId,
    };
  }

  if (action === "navigate_to_event" && actionValue) {
    return {
      message: `Navigating to event ${actionValue}...`,
      action: "navigate_to_event",
      data: { eventId: actionValue },
      sessionId,
    };
  }

  if (action === "get_info") {
    return handleGetInfoRequest(sessionId);
  }

  // Handle based on current state
  const session = sessions[sessionId];
  const state = session.state;

  switch (state) {
    case ChatState.INITIAL:
      return handleInitialMessage(sessionId);

    case ChatState.CREATING_EVENT:
      if (session.useAI) {
        return handleEventDescriptionWithAI(sessionId, message, axiosInstance);
      } else {
        return handleEventDescription(sessionId, message);
      }

    case ChatState.MODIFYING_EVENT:
      if (session.useAI) {
        return handleEventModificationWithAI(sessionId, message, axiosInstance);
      } else {
        return handleEventModification(sessionId, message);
      }

    case ChatState.GUIDED_NAME:
      return handleGuidedName(sessionId, message);

    case ChatState.GUIDED_DATE:
      return handleGuidedDate(sessionId, message);

    case ChatState.GUIDED_LOCATION:
      return handleGuidedLocation(sessionId, message);

    case ChatState.GUIDED_TYPE:
      return handleGuidedType(sessionId, message);

    case ChatState.GUIDED_DESCRIPTION:
      return handleGuidedDescription(sessionId, message);

    case ChatState.GETTING_INFO:
      // For now, just return to initial state
      sessions[sessionId].state = ChatState.INITIAL;
      return {
        message:
          "I'm still learning how to answer specific questions. Is there anything else I can help you with?",
        options: [
          {
            text: "Create an event",
            value: "create_event",
            action: "create_event",
          },
        ],
        sessionId,
      };

    default:
      return {
        message: "I'm not sure how to respond to that. How can I help you?",
        options: [
          {
            text: "Create an event",
            value: "create_event",
            action: "create_event",
          },
        ],
        sessionId,
      };
  }
};

// Create a new event directly
export const createNewEvent = async (
  eventData: EventData,
  axiosInstance: import("axios").AxiosInstance
): Promise<string> => {
  return createEvent(eventData, axiosInstance);
};

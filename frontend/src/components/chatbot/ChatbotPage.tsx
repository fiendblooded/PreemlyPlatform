/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from "react";
import { styled } from "styled-components";
// import axios from "axios";
// import { useAuth0 } from "@auth0/auth0-react";
// import { useNavigate } from "react-router-dom";
// // Styled Components
// const pulse = keyframes`
//   0% {
//     box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7);
//   }
//   70% {
//     box-shadow: 0 0 10px 20px rgba(255, 77, 77, 0);
//   }
//   100% {
//     box-shadow: 0 0 0 0 rgba(255, 77, 77, 0);
//   }
// `;

// const MicrophoneButton = styled.button<{ isListening: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 50px;
//   height: 50px;
//   background-color: ${({ isListening }) =>
//     isListening ? "#FF4D4D" : "#4CAF50"};
//   border: none;
//   border-radius: 5px;
//   color: white;
//   font-size: 20px;
//   cursor: pointer;
//   ${({ isListening }) =>
//     isListening &&
//     css`
//       animation: ${pulse} 1.5s infinite;
//     `}
//   transition: background-color 0.3s ease;

//   &:hover {
//     background-color: ${({ isListening }) =>
//       isListening ? "#FF0000" : "#45A049"};
//   }

//   &:focus {
//     outline: none;
//   }
// `;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ##121212;
  color: white;
`;
// const ActionButton = styled.button`
//   margin-top: 10px;
//   padding: 10px 20px;
//   background-color: #4caf50;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   font-size: 16px;

//   &:hover {
//     background-color: #45a049;
//   }
// `;
// const EventDetails = styled.div`
//   margin-top: 20px;
//   padding: 20px;
//   width: 80%;
//   max-width: 600px;
//   border-radius: 10px;
//   background-color: #ffffff;
//   color: #000;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// const DetailItem = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const DetailTitle = styled.span`
//   font-weight: bold;
//   font-size: 1.1rem;
// `;

// const DetailValue = styled.span`
//   font-size: 1rem;
//   margin-top: 4px;
// `;

// const ChatContainer = styled.div`
//   width: 80%;
//   max-width: 600px;
//   height: 70%;
//   overflow-y: auto;
//   background-color: #e5ddd5;
//   padding: 10px;
//   border-radius: 10px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
// `;
// const Title = styled.h1`
//   margin: 0;
// `;
// const SubTitle = styled.h3`
//   margin: 0;
//   margin-top: -12px;
//   text-align: center;
//   width: 50%;
// `;

// const Message = styled.div<{ isUser: boolean }>`
//   max-width: 60%;
//   padding: 10px;
//   border-radius: 10px;
//   word-wrap: break-word;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
//   align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
//   color: black;
//   background-color: ${({ isUser }) => (isUser ? "#FFD209" : "#FFFFFF")};
// `;

// const Loading = styled.div`
//   align-self: flex-start;
//   color: #888;
//   font-style: italic;
// `;

// const InputContainer = styled.div`
//   display: flex;

//   gap: 10px;
//   width: 620px;
//   margin-top: 10px;
// `;

// const ChatInput = styled.input`
//   flex: 1;
//   padding: 10px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   font-size: 16px;
// `;

// const SendButton = styled.button`
//   padding: 10px 20px;
//   border: none;
//   background-color: #4caf50;
//   color: white;
//   border-radius: 5px;
//   font-size: 16px;
//   cursor: pointer;

//   &:disabled {
//     background-color: #9e9e9e;
//     cursor: not-allowed;
//   }
// `;

const ChatbotPage: React.FC = () => {
  // const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
  //   []
  // );
  // const [input, setInput] = useState("");
  // const [currentStep, setCurrentStep] = useState<
  //   "title" | "time" | "place" | "description" | "idle"
  // >("idle");
  // const [eventData, setEventData] = useState({
  //   title: "",
  //   time: "",
  //   place: "",
  //   description: "",
  // });
  // const SpeechRecognition =
  //   (window as any).SpeechRecognition ||
  //   (window as any).webkitSpeechRecognition;

  // const recognition = new SpeechRecognition();
  // recognition.lang = "en-US"; // Set language
  // recognition.interimResults = false;
  // recognition.maxAlternatives = 1;
  // const [isListening, setIsListening] = useState(false);

  // const toggleListening = () => {
  //   if (isListening) {
  //     recognition.stop(); // Stop listening
  //     setIsListening(false);
  //   } else {
  //     recognition.start(); // Start listening
  //     setIsListening(true);

  //     recognition.onresult = (event: any) => {
  //       const spokenInput = event.results[0][0].transcript;
  //       console.log("User said:", spokenInput);
  //       setInput(spokenInput); // Set spoken input to the text input field
  //       // Automatically send the message

  //       setTimeout(() => {
  //         sendMessage(spokenInput); // Send the message after capturing the result
  //       }, 500); // Small delay to ensure input state is updated
  //       setIsListening(false); // Stop listening after capturing the result
  //     };

  //     recognition.onerror = (event: any) => {
  //       console.error("Speech recognition error:", event.error);
  //       setIsListening(false); // Stop listening on error
  //     };

  //     recognition.onend = () => {
  //       setIsListening(false); // Reset state when the listening session ends
  //     };
  //   }
  // };

  // const [isLoading, setIsLoading] = useState(false);

  // const handleBotResponse = (botMessage: string, userInput: string) => {
  //   if (botMessage.includes("Got it, your event title is set to")) {
  //     setEventData((prev) => ({ ...prev, title: userInput }));
  //     setCurrentStep("time");
  //   } else if (botMessage.includes("Great, I've noted the event time as")) {
  //     setEventData((prev) => ({ ...prev, time: userInput }));
  //     setCurrentStep("place");
  //   } else if (botMessage.includes("Got the location down as")) {
  //     setEventData((prev) => ({ ...prev, place: userInput }));
  //     setCurrentStep("description");
  //   } else if (botMessage.includes("Here's your description")) {
  //     setEventData((prev) => ({ ...prev, description: userInput }));
  //     setCurrentStep("idle"); // Now the loop ends because all steps are complete.
  //   } else if (
  //     botMessage.includes(
  //       "Here's what I've gathered about your event so far"
  //     ) ||
  //     botMessage.includes("Your event has been successfully created") ||
  //     botMessage.includes("The event has been successfully created")
  //   ) {
  //     // Do not set to "idle" yet; ensure description is properly captured.
  //     if (eventData.description) {
  //       setCurrentStep("idle"); // Only set to "idle" if all data is gathered.
  //     }
  //   }
  // };
  // useEffect(() => {
  //   if (
  //     eventData.description &&
  //     eventData.place &&
  //     eventData.time &&
  //     eventData.title
  //   ) {
  //     setCurrentStep("idle");
  //   }
  // }, [eventData]);

  // useEffect(() => {
  //   const sendIntroMessage = async () => {
  //     const introMessage = {
  //       sender: "assistant",
  //       text: "Hi! I’m Preembot, here to help you create your event. Let’s go step by step to set everything up. Shall we begin with the first step? :)",
  //     };
  //     setMessages([introMessage]);
  //     setCurrentStep("title");
  //   };
  //   sendIntroMessage();
  // }, []);

  // const sendMessage = async (spokenInput?: string) => {
  //   const messageToSend = spokenInput || input.trim();
  //   if (!messageToSend) return;

  //   const userMessage = { sender: "user", text: messageToSend };
  //   setMessages((prev) => [...prev, userMessage]);
  //   setInput("");
  //   setIsLoading(true);

  //   try {
  //     const systemMessage = {
  //       role: "system",
  //       content: `
  //         You are Preembot, an intelligent assistant for creating and managing events. Your task is to guide users step-by-step through creating an event. You will prompt the user for specific details and, at the end of the conversation, generate a structured JSON object containing the event information.

  //         **Your Workflow:**

  //         1. **Introduction and Context Setting**:
  //            - Greet the user warmly and explain your role: "Hi! I'm Preembot, here to help you create your event. Let's go step by step to set everything up."

  //         2. **Step-by-Step Event Creation**:
  //            - **Step 1: Title**:
  //              Ask: "What is the title of your event? For example, 'Annual Company Retreat' or 'John's Birthday Party'."
  //              Trigger Phrase: After the user provides the title, respond with: "Got it, your event title is set to [Title]."
  //            - **Step 2: Date and Time**:
  //              Ask: "When will your event take place? Please provide both the start and end time (e.g., 'December 15th, 3 PM to 6 PM')."
  //              Trigger Phrase: After the user provides the date and time, respond with: "Great, I've noted the event time as [Date and Time]."
  //            - **Step 3: Location**:
  //              Ask: "Where will your event take place? For example, '123 Main St, New York' or 'Central Park'."
  //              Trigger Phrase: After the user provides the location, respond with: "Got the location down as [Location]."
  //            - **Step 4: Description**:
  //              Ask: "Could you provide a short description of the event? 3-4 sentences are perfect. For example, 'This is a gathering to celebrate our yearly achievements and bond as a team.'"
  //              Trigger Phrase: After the user provides the description, respond with: "Here's your description: [Description]."

  //         3. **Confirmation and Finalization**:
  //            - Once all details are gathered, you will summarize them for the user:
  //              - "Here's what I've gathered about your event so far:
  //                - **Title**: [Title]
  //                - **Time**: [Start and End Time]
  //                - **Place**: [Place]
  //                - **Description**: [Description]
  //              Is this correct?"
  //            - If the user confirms, respond: "Great! I have enough information to create your event."
  //            - If the user needs changes, guide them to update the specific information.

  //         4. **Output JSON Generation**:
  //            - After confirmation, generate a structured JSON object:
  //              {
  //                "title": "Sample Title",
  //                "time": "2024-12-10T15:00:00Z to 2024-12-10T18:00:00Z",
  //                "place": "123 Main St, New York",
  //                "description": "Expanded version of the user-provided description with professional and engaging language."
  //              }

  //         **Behavioral Guidelines**:
  //         - Be polite, friendly, and clear in all interactions.
  //         - Ensure each step is completed before moving to the next.
  //         - If the user is unclear or ambiguous, ask for clarification in a friendly manner.
  //         - Never skip steps or assume details; always confirm with the user.

  //         **Tone**:
  //         Be professional yet approachable, like a helpful assistant eager to make the user's experience enjoyable and seamless.
  //       `,
  //     };

  //     const conversation = [
  //       systemMessage,
  //       ...messages.map((msg) => ({ role: msg.sender, content: msg.text })),
  //       { role: "user", content: userMessage.text },
  //     ];

  //     const response = await axios.post(
  //       "https://api.openai.com/v1/chat/completions",
  //       {
  //         model: "gpt-3.5-turbo",
  //         messages: conversation,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${API_KEY}`,
  //         },
  //       }
  //     );

  //     const botMessage = response.data.choices[0].message.content.trim();
  //     setMessages((prev) => [
  //       ...prev,
  //       { sender: "assistant", text: botMessage },
  //     ]);
  //     handleBotResponse(botMessage, userMessage.text); // Handle step transitions
  //   } catch {
  //     const errorMessage = {
  //       sender: "assistant",
  //       text: "Sorry, something went wrong. Please try again later.",
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleInputKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter") sendMessage();
  // };
  // useEffect(() => {
  //   if (currentStep === "idle") {
  //     console.log("Final Event Data:", eventData);
  //     // You can now send `eventData` to an API or perform other actions
  //   }
  // }, [currentStep, eventData]);

  // const { user } = useAuth0();
  // const navigate = useNavigate();
  // async function handleEventCreation(title: string, description: string) {
  //   console.log("In the request" + title, description);
  //   try {
  //     const response = await axios.post("http://localhost:3002/api/events", {
  //       title,
  //       description,
  //       ownerId: user?.sub || "random", // Use the Auth0 user ID
  //       poster: null,
  //     });

  //     console.log("Event created:", response.data);

  //     navigate(`/events/${response.data.id}`);
  //   } catch (err) {
  //     console.error("Error creating event:", err);
  //   }
  // }
  return (
    <Container>
      {/* <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="38"
          cy="38"
          r="32"
          stroke="url(#paint0_radial_351_812)"
          strokeWidth="12"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M48.2359 22.8008H39.0716L38.3774 27.4849H35.0853L33.8768 35.7452H30.2178C27.0623 35.7452 24.6005 36.4533 22.8326 37.8693C21.0646 39.3079 20.0128 41.3083 19.6771 43.8707C19.5428 44.9946 19.5876 46.051 19.8114 47.04C20.0128 48.029 20.4044 48.9281 20.9863 49.7372C21.5681 50.5689 22.4409 51.2207 23.6047 51.6928C24.7684 52.1648 26.1559 52.4008 27.7672 52.4008H36.9316L37.6257 47.7167H40.9179L42.1264 39.4563H45.7854C48.9409 39.4563 51.4026 38.7483 53.1706 37.3322C54.9385 35.8937 55.9903 33.8932 56.326 31.3308C56.4603 30.207 56.4156 29.1506 56.1918 28.1616C55.9903 27.1726 55.5987 26.2735 55.0168 25.4643C54.435 24.6327 53.5622 23.9808 52.3985 23.5088C51.2347 23.0368 49.8472 22.8008 48.2359 22.8008ZM50.0486 28.8022C50.5634 29.3866 50.7648 30.1396 50.6529 31.0611C50.3619 33.3088 48.773 34.4327 45.8861 34.4327H42.8984L43.8384 27.9256H47.8331C48.8178 27.9256 49.5563 28.2178 50.0486 28.8022ZM25.9545 46.3994C25.4398 45.815 25.2384 45.062 25.3502 44.1404C25.6412 41.8927 27.2301 40.7689 30.117 40.7689H33.1047L32.1648 47.276H28.17C27.1854 47.276 26.4468 46.9838 25.9545 46.3994Z"
          fill="#B638AE"
        />
        <defs>
          <radialGradient
            id="paint0_radial_351_812"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(6 38) scale(64 110.358)"
          >
            <stop stopColor="#FFD524" />
            <stop offset="0.5" stopColor="#9C00DF" />
            <stop offset="1" stopColor="#FFD524" />
          </radialGradient>
        </defs>
      </svg>
      <Title>PreemBot</Title>
      <SubTitle>
        Answer a few questions through text or voice, and our AI will set up an
        event for you, ready for your review and adjustments.
      </SubTitle>
      {currentStep === "idle" ? (
        <EventDetails>
          <DetailItem>
            <DetailTitle>Event Title:</DetailTitle>
            <DetailValue>{eventData.title}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailTitle>Date & Time:</DetailTitle>
            <DetailValue>{eventData.time}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailTitle>Location:</DetailTitle>
            <DetailValue>{eventData.place}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailTitle>Description:</DetailTitle>
            <DetailValue>{eventData.description}</DetailValue>
          </DetailItem>
          <ActionButton
            onClick={() => {
              console.log("Event Confirmed!");
              handleEventCreation(eventData.title, eventData.description);
            }}
          >
            Confirm Event
          </ActionButton>
        </EventDetails>
      ) : (
        <>
          <ChatContainer>
            {messages.map((msg, index) => (
              <Message key={index} isUser={msg.sender === "user"}>
                {msg.text}
              </Message>
            ))}
            {isLoading && <Loading>Typing...</Loading>}
          </ChatContainer>
          <InputContainer>
            <ChatInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder="Type a message..."
            />
            <SendButton
              onClick={() => {
                sendMessage();
              }}
              disabled={isLoading}
            >
              Send
            </SendButton>
            <MicrophoneButton
              onClick={toggleListening}
              isListening={isListening}
            >
              {isListening ? "🛑" : "🎙️"}
            </MicrophoneButton>
          </InputContainer>
        </>
      )} */}
    </Container>
  );
};

export default ChatbotPage;

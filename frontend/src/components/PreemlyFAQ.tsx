import React, { useState } from "react";
import styled from "styled-components";
import { PageWrapper } from "./Events";
import TopBar from "./TopBar";

const FAQContainer = styled.div`
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Axiforma, sans-serif;
  color: black;
  display: flex;
  flex-direction: column;
`;

const FAQItem = styled.div`
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const FAQQuestion = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FAQAnswer = styled.div`
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #ddd;
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  transform: ${({ isOpen }) => (isOpen ? "rotate(90deg)" : "rotate(0deg)")};
  transition: transform 0.3s ease;
`;
const ContactButton = styled.button`
  margin: 20px auto;
  width: 30%;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  border-radius: 2px;

  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  border: 2px solid #fcd535;
  color: #0b0e13; /* Dark text for contrast */
  background-color: #fcd535; /* Matches the yellow accent color */

  &:hover {
    background-color: black; /* Slightly darker shade for hover */
    border: 2px solid #fcd535;
    color: #fcd535;
  }
`;

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQBlock: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FAQItem>
      <FAQQuestion onClick={() => setIsOpen(!isOpen)}>
        {question}
        <Arrow isOpen={isOpen}>▶</Arrow>
      </FAQQuestion>
      {isOpen && <FAQAnswer>{answer}</FAQAnswer>}
    </FAQItem>
  );
};

const PreemlyFAQ: React.FC = () => {
  const faqData: FAQItemProps[] = [
    {
      question: "What is Preemly?",
      answer:
        "Preemly is an event management platform designed to simplify and automate event planning, guest management, and on-site experiences.",
    },
    {
      question: "How does Preemly help with guest check-in?",
      answer:
        "Preemly offers a customizable check-in system using QR codes and SMS to streamline guest arrivals.",
    },
    {
      question: "Can I manage multiple events with Preemly?",
      answer:
        "Yes, Preemly supports managing multiple events with an integrated calendar and event dashboard.",
    },
    {
      question: "Does Preemly integrate with Google Calendar?",
      answer:
        "Yes, Preemly can sync with Google Calendar to send invitations and track event dates.",
    },
    {
      question: "Is there an AI assistant in Preemly?",
      answer:
        "Yes, Preemly includes an AI assistant to help answer attendee questions and provide event-related information.",
    },
    {
      question: "What platforms does Preemly support?",
      answer:
        "Preemly is a web-based application and is accessible from both desktop and mobile devices.",
    },
    {
      question: "Can I customize event invitations in Preemly?",
      answer:
        "Yes, you can design personalized invitations using built-in templates.",
    },
    {
      question: "How does Preemly handle event analytics?",
      answer:
        "Preemly provides detailed analytics on attendance, engagement, and feedback to help improve future events.",
    },
    {
      question: "Is there a free trial for Preemly?",
      answer:
        "Yes, we offer a free trial for new users to explore the platforms features.",
    },
    {
      question: "How do I contact Preemly support?",
      answer:
        "You can contact support through the button below or by emailing info@preemly.eu",
    },
  ];

  return (
    <PageWrapper>
      <TopBar showBackButton sectionTitle="Help" />
      <FAQContainer>
        <h1 style={{ textAlign: "center" }}>Frequently Asked Questions</h1>
        {faqData.map((item, index) => (
          <FAQBlock key={index} question={item.question} answer={item.answer} />
        ))}
        <ContactButton
          onClick={() => (window.location.href = "mailto:info@preemly.eu")}
        >
          Contact Support
        </ContactButton>
      </FAQContainer>
    </PageWrapper>
  );
};

export default PreemlyFAQ;

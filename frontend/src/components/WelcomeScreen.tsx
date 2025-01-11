import { useEffect, useState } from "react";
import useWebSocket from "../useWebSocket";
import styled from "styled-components";
import Event from "../event.png";

const WelcomeScreenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #121212;
  color: #f5f5f5;
  font-size: 2rem;
  font-family: Axiforma, sans-serif;
  flex-direction: column;
`;

const WelecomeContainer = styled.div`
  margin: auto;
  position: relative;
  display: flex;
`;

const Background = styled.img`
  width: 90%;
  left: 15%;
`;

const Title = styled.div`
  position: absolute;
  bottom: 20%;
  left: 70px;
  font-size: 48px;
  text-align: left;
`;

const Countdown = styled.div`
  position: absolute;
  bottom: 15%;
  left: 70px;
  font-size: 1.5rem;
  color: #f5f5f5;
`;

const WelcomeScreen: React.FC = () => {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const message = useWebSocket("ws://frontend-pi-bay-46.vercel.app/ws");

  useEffect(() => {
    const targetDate = new Date("2024-12-12T18:30:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours} hours, ${minutes} minutes, ${seconds} seconds left`
        );
      } else {
        setTimeLeft("Event has started!");
      }
    };

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (message) {
      try {
        const parsedMessage = message;
        if (
          parsedMessage &&
          parsedMessage.message === "Guest checked in" &&
          parsedMessage.guest.fullName
        ) {
          setGuestName(parsedMessage.guest.fullName);
          setTimeout(() => setGuestName(null), 3002); // Hide after 5 seconds
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [message]);

  return (
    <WelcomeScreenWrapper>
      <WelecomeContainer>
        <Background src={Event} />
        <Title>{guestName ? `${guestName}` : "Awaiting next guest..."}</Title>
        <Countdown>{timeLeft}</Countdown>
      </WelecomeContainer>
    </WelcomeScreenWrapper>
  );
};

export default WelcomeScreen;

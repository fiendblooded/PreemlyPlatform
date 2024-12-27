import styled from "styled-components";

interface EventProps {
  nextPage: () => void;
}

const EventWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  color: black;
  display: flex;
`;

const EventTitle = styled.h1``;
const EventSubtitle = styled.div`
  margin-top: -40px;
  display: flex;
  text-align: center;
  width: 70%;
`;
const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: auto;
`;
const StartWithAIButton = styled.div`
  background: linear-gradient(
    90deg,
    rgba(0, 123, 136, 0.15) 0%,
    rgba(156, 0, 223, 0.15) 33%,
    rgba(255, 213, 36, 0.15) 66%,
    rgba(48, 73, 248, 0.15) 100%
  );

  cursor: pointer;
  border-radius: 6px;
  width: 600px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  gap: 16px;
  border: 6px solid transparent;
  &:hover {
    background: linear-gradient(
      90deg,
      rgba(0, 123, 136, 0.3) 0%,
      rgba(156, 0, 223, 0.3) 33%,
      rgba(255, 213, 36, 0.3) 66%,
      rgba(48, 73, 248, 0.3) 100%
    );
    border: 6px solid #f4c430;
  }
`;
const Button = styled.div`
  background-color: #f0f0f0;

  cursor: pointer;
  border-radius: 6px;
  width: 600px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  gap: 16px;
  border: 6px solid transparent;
  &:hover {
    border: 6px solid #f4c430;
  }
`;
export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const ButtonTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
`;
const ButtonText = styled.div`
  font-size: 14px;
`;

const EventCreatorWelcome: React.FC<EventProps> = ({ nextPage }) => {
  return (
    <EventWrapper>
      <ButtonsContainer>
        <EventTitle>Welcome to Preemly Event Creator</EventTitle>
        <EventSubtitle>
          Preemly makes event creation seamless and stress-free. Choose your
          path below and start building your event today!
        </EventSubtitle>
        <StartWithAIButton>
          <svg
            width="50"
            height="72"
            viewBox="0 0 50 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.3645 67.1981C30.421 56.0738 36.9645 45.6426 44.7873 36.2552C44.9105 36.1074 44.9105 35.8926 44.7873 35.7448C36.9645 26.3574 30.421 15.9262 25.3645 4.80187C25.2226 4.48961 24.7774 4.48961 24.6355 4.80187C19.579 15.9262 13.0355 26.3574 5.21266 35.7448C5.08947 35.8926 5.08947 36.1074 5.21266 36.2552C13.0355 45.6426 19.579 56.0738 24.6355 67.1981C24.7774 67.5104 25.2226 67.5104 25.3645 67.1981Z"
              stroke="currentColor"
              strokeWidth="9"
            />
          </svg>

          <ColumnContainer>
            <ButtonTitle>Start with Preembot</ButtonTitle>
            <ButtonText>
              Let PreemBot guide you through the process in a conversational
              way. Answer a few questions through text or voice, and our AI will
              set up your event for you, ready for your review and adjustments.
            </ButtonText>
          </ColumnContainer>
        </StartWithAIButton>
        <Button onClick={nextPage}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M35.671 27.3303L19.5782 11.2374C18.3901 10.0494 17.7961 9.45533 17.1111 9.23277C16.5086 9.03699 15.8595 9.03699 15.257 9.23277C14.572 9.45533 13.978 10.0494 12.7899 11.2374L11.0929 12.9345C9.90483 14.1225 9.3108 14.7165 9.08824 15.4015C8.89246 16.0041 8.89246 16.6531 9.08824 17.2556C9.3108 17.9406 9.90484 18.5347 11.0929 19.7227L27.1857 35.8156M44.1563 35.8156L60.2484 51.9077C61.4365 53.0958 62.0305 53.6898 62.2531 54.3748C62.4489 54.9773 62.4489 55.6263 62.2531 56.2289C62.0305 56.9139 61.4365 57.5079 60.2484 58.6959L58.5514 60.393C57.3633 61.581 56.7693 62.1751 56.0843 62.3976C55.4818 62.5934 54.8328 62.5934 54.2302 62.3976C53.5452 62.1751 52.9512 61.581 51.7632 60.393L35.671 44.3008M24.0007 20.9989L26.6684 18.3276M51.0007 47.9994L53.6835 45.3427M46.4993 16.5059L54.9845 24.9912M9 63.0052L9.14235 62.0087C9.64608 58.4826 9.89795 56.7195 10.4709 55.0735C10.9792 53.6129 11.6737 52.2239 12.5372 50.9409C13.5102 49.4949 14.7696 48.2356 17.2882 45.717L52.2322 10.773C54.5754 8.42984 58.3743 8.42984 60.7175 10.773C63.0606 13.1161 63.0606 16.9151 60.7175 19.2583L25.1323 54.8434C22.8474 57.1284 21.7049 58.2708 20.4036 59.1794C19.2485 59.9858 18.0028 60.6539 16.6919 61.1699C15.2151 61.7512 13.6313 62.0708 10.4638 62.7099L9 63.0052Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <ColumnContainer>
            <ButtonTitle>Start from scratch</ButtonTitle>
            <ButtonText>
              Build your event step by step using our intuitive form. Customize
              every detail to create the perfect experience, starting with the
              basics and adding modules as you go.
            </ButtonText>
          </ColumnContainer>
        </Button>
      </ButtonsContainer>
    </EventWrapper>
  );
};

export default EventCreatorWelcome;

import styled from "styled-components";
import { ToggleSwitch } from "./WelcomeScreenEditor";

const SectionContainer = styled.div<{ isEnabled: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${(props) => (props.isEnabled ? "#875cf5" : "#ddd")};
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  width: 100%;
  background-color: ${(props) =>
    props.isEnabled ? "rgb(239,233,255)" : "#fff"};
`;

const Header = styled.div`
  color: black;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: bold;
  flex-grow: 1;
  line-height: 20px;
`;

const ContentArea = styled.textarea`
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  border-radius: 5px;
  resize: none;
  min-height: 80px;
  box-sizing: border-box;
  background-color: #ffffff;
  color: black;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  max-width: 100%;
  font-size: 16px;
  box-sizing: border-box;
  /* Smooth transition for the border */
  transition: border-color 0.3s ease;
  font-family: Axiforma, sans-serif;
  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
  }
`;

interface EmailSectionProps {
  icon: JSX.Element;
  title: string;
  enable: boolean;
  setEnable: (value: boolean) => void;
  content: string;
  setContent: (value: string) => void;
}

const EmailSection: React.FC<EmailSectionProps> = ({
  icon,
  title,
  enable,
  setEnable,
  content,
  setContent,
}) => {
  return (
    <SectionContainer isEnabled={enable}>
      <Header>
        {icon}
        <Title>{title}</Title>
        <ToggleSwitch checked={enable} onChange={() => setEnable(!enable)} />
      </Header>

      {enable && (
        <ContentArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Enter ${title.toLowerCase()} details...`}
        />
      )}
    </SectionContainer>
  );
};

export default EmailSection;

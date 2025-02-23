import styled from "styled-components";
import { ToggleSwitch } from "./WelcomeScreenEditor";

const SectionContainer = styled.div<{ isEnabled: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  ${(props) =>
    props.isEnabled ? "background-color: rgb(245, 241, 255);" : null}

  &:hover {
    border: 2px solid rgb(107, 61, 223);
  }
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
    <SectionContainer isEnabled={enable} onClick={() => setEnable(!enable)}>
      <Header>
        {icon}
        <Title>{title}</Title>
        <ToggleSwitch checked={enable} />
      </Header>

      {enable && (
        <ContentArea
          value={content}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Enter ${title.toLowerCase()} details...`}
        />
      )}
    </SectionContainer>
  );
};

export default EmailSection;

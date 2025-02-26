import styled from "styled-components";
import { ToggleSwitch } from "./WelcomeScreenEditor";

const SectionContainer = styled.div<{ isEnabled: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 2px solid
    ${(props) => (props.isEnabled ? "rgb(107, 61, 223)" : "#eee")};
  border-radius: 12px;
  padding: 20px;
  background-color: ${(props) =>
    props.isEnabled ? "rgba(107, 61, 223, 0.03)" : "white"};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: rgb(107, 61, 223);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(107, 61, 223, 0.08);
  }
`;

const Header = styled.div<{ isEnabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => (props.isEnabled ? "16px" : "0")};
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #2c2c2c;

  svg {
    width: 20px;
    height: 20px;
    color: rgb(107, 61, 223);
  }
`;

const ContentArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  resize: none;
  min-height: 100px;
  background-color: white;
  color: #2c2c2c;
  border: 2px solid #eee;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  transition: all 0.2s ease;
  box-sizing: border-box;
  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
    box-shadow: 0 2px 8px rgba(107, 61, 223, 0.08);
  }

  &::placeholder {
    color: #999;
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
      <Header isEnabled={enable}>
        <TitleGroup>
          {icon}
          <Title>{title}</Title>
        </TitleGroup>
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

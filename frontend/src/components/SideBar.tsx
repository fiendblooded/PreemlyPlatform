import styled, { createGlobalStyle } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../logo.png";
import { isTablet } from "../common/common";
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Thin.ttf') format('truetype');
    font-weight: 100;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ThinItalic.ttf') format('truetype');
    font-weight: 100;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Light.ttf') format('truetype');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-LightItalic.ttf') format('truetype');
    font-weight: 300;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Italic.ttf') format('truetype');
    font-weight: 400;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-MediumItalic.ttf') format('truetype');
    font-weight: 500;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-SemiBold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-SemiBoldItalic.ttf') format('truetype');
    font-weight: 600;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-BoldItalic.ttf') format('truetype');
    font-weight: 700;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ExtraBold.ttf') format('truetype');
    font-weight: 800;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ExtraBoldItalic.ttf') format('truetype');
    font-weight: 800;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Black.ttf') format('truetype');
    font-weight: 900;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-BlackItalic.ttf') format('truetype');
    font-weight: 900;
    font-style: italic;
  }

  body {
    font-family: Axiforma, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #F3F6F9;
    color: #f5f5f5;
  }
`;
const SidebarTopContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const SidebarWrapper = styled.div<{ tablet: boolean }>`
  position: sticky;
  height: 100vh;
  background-color: rgb(11, 14, 19);
  display: flex;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 0px;
  gap: 6px;
  top: 0;
  left: 0;
  font-family: Axiforma, sans-serif !important;
  width: ${(props) =>
    props.tablet ? "80px" : "250px"}; /* Shrink width on tablets */
  transition: width 0.3s ease;
`;

const MenuButton = styled.button<{ isactive: boolean; tablet: boolean }>`
  background-color: ${(props) => (props.isactive ? "#f4c430" : "transparent")};
  color: ${(props) => (props.isactive ? "black" : "white")};
  border: 1px solid transparent;
  border-radius: 6px;
  height: 36px;
  width: ${(props) => (props.tablet ? "70%" : "85%")};
  display: flex;
  cursor: pointer;
  gap: 6px;
  align-items: center;
  padding: 8px ${(props) => (props.tablet ? "0" : "12px")};
  justify-content: ${(props) => (props.tablet ? "center" : "flex-start")};
  transition: padding 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.isactive ? "#f4c430" : "#524C2D")};
    color: ${(props) => (props.isactive ? "black" : "#f4c430")};
    border-color: ${(props) => (props.isactive ? "transparent" : "#f4c430")};
  }
`;

const MenuButtonText = styled.div<{ tablet: boolean }>`
  display: ${(props) => (props.tablet ? "none" : "block")};
  font-size: 15px;
  padding-top: 4px;
`;

export const CTAButton = styled.button`
  background-color: #f4c430; /* Yellow */
  color: #121212; /* Dark text */
  border: none;
  border-radius: 6px;
  height: 36px;
  width: 160px;

  display: flex;
  cursor: pointer;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 8px 0px;
  &:hover {
    background-color: #b28600; /* Bright yellow on hover */
  }
`;

export const ImageContainer = styled.div`
  width: 100%;
  padding: 10px 0;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  cursor: pointer;
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabletDevice = isTablet();

  function getPageStatus(page: string) {
    return location.pathname.split("/")[1] === page;
  }

  return (
    <SidebarWrapper tablet={isTabletDevice}>
      <SidebarTopContainer>
        <ImageContainer>
          <img
            src={Logo}
            onClick={() => navigate("/")}
            alt="logo"
            width={isTabletDevice ? "50%" : "55%"}
          />
        </ImageContainer>
        <MenuButton
          onClick={() => navigate("/")}
          isactive={getPageStatus("")}
          tablet={isTabletDevice}
        >
          <svg
            width="20"
            height="20"
            style={
              isTabletDevice ? { minWidth: "26px", minHeight: "26px" } : {}
            }
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.6654 4.66732C11.6654 4.20061 11.6654 3.96725 11.7562 3.78899C11.8361 3.63219 11.9636 3.50471 12.1204 3.42481C12.2986 3.33398 12.532 3.33398 12.9987 3.33398H15.332C15.7987 3.33398 16.0321 3.33398 16.2104 3.42481C16.3672 3.50471 16.4946 3.63219 16.5745 3.78899C16.6654 3.96725 16.6654 4.20061 16.6654 4.66732V7.00065C16.6654 7.46736 16.6654 7.70072 16.5745 7.87898C16.4946 8.03578 16.3672 8.16326 16.2104 8.24316C16.0321 8.33398 15.7987 8.33398 15.332 8.33398H12.9987C12.532 8.33398 12.2986 8.33398 12.1204 8.24316C11.9636 8.16326 11.8361 8.03578 11.7562 7.87898C11.6654 7.70072 11.6654 7.46736 11.6654 7.00065V4.66732Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.33203 4.66732C3.33203 4.20061 3.33203 3.96725 3.42286 3.78899C3.50275 3.63219 3.63024 3.50471 3.78704 3.42481C3.9653 3.33398 4.19865 3.33398 4.66536 3.33398H6.9987C7.46541 3.33398 7.69876 3.33398 7.87702 3.42481C8.03382 3.50471 8.16131 3.63219 8.2412 3.78899C8.33203 3.96725 8.33203 4.20061 8.33203 4.66732V7.00065C8.33203 7.46736 8.33203 7.70072 8.2412 7.87898C8.16131 8.03578 8.03382 8.16326 7.87702 8.24316C7.69876 8.33398 7.46541 8.33398 6.9987 8.33398H4.66536C4.19865 8.33398 3.9653 8.33398 3.78704 8.24316C3.63024 8.16326 3.50275 8.03578 3.42286 7.87898C3.33203 7.70072 3.33203 7.46736 3.33203 7.00065V4.66732Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.33203 13.0007C3.33203 12.5339 3.33203 12.3006 3.42286 12.1223C3.50275 11.9655 3.63024 11.838 3.78704 11.7581C3.9653 11.6673 4.19865 11.6673 4.66536 11.6673H6.9987C7.46541 11.6673 7.69876 11.6673 7.87702 11.7581C8.03382 11.838 8.16131 11.9655 8.2412 12.1223C8.33203 12.3006 8.33203 12.5339 8.33203 13.0007V15.334C8.33203 15.8007 8.33203 16.0341 8.2412 16.2123C8.16131 16.3691 8.03382 16.4966 7.87702 16.5765C7.69876 16.6673 7.46541 16.6673 6.9987 16.6673H4.66536C4.19865 16.6673 3.9653 16.6673 3.78704 16.5765C3.63024 16.4966 3.50275 16.3691 3.42286 16.2123C3.33203 16.0341 3.33203 15.8007 3.33203 15.334V13.0007Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.6654 13.0007C11.6654 12.5339 11.6654 12.3006 11.7562 12.1223C11.8361 11.9655 11.9636 11.838 12.1204 11.7581C12.2986 11.6673 12.532 11.6673 12.9987 11.6673H15.332C15.7987 11.6673 16.0321 11.6673 16.2104 11.7581C16.3672 11.838 16.4946 11.9655 16.5745 12.1223C16.6654 12.3006 16.6654 12.5339 16.6654 13.0007V15.334C16.6654 15.8007 16.6654 16.0341 16.5745 16.2123C16.4946 16.3691 16.3672 16.4966 16.2104 16.5765C16.0321 16.6673 15.7987 16.6673 15.332 16.6673H12.9987C12.532 16.6673 12.2986 16.6673 12.1204 16.5765C11.9636 16.4966 11.8361 16.3691 11.7562 16.2123C11.6654 16.0341 11.6654 15.8007 11.6654 15.334V13.0007Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <MenuButtonText tablet={isTabletDevice}>Dashboard</MenuButtonText>
        </MenuButton>
        <MenuButton
          onClick={() => navigate("/events")}
          isactive={getPageStatus("events")}
          tablet={isTabletDevice}
        >
          <svg
            width="20"
            height="20"
            style={
              isTabletDevice ? { minWidth: "26px", minHeight: "26px" } : {}
            }
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 7.5H17.5M14.1667 10.8345L5.83333 10.8333M8.61111 14.167L5.83333 14.1667M5.83333 2.5V4.16667M14.1667 2.5V4.16667M5.16667 17.5H14.8333C15.7668 17.5 16.2335 17.5 16.59 17.3183C16.9036 17.1586 17.1586 16.9036 17.3183 16.59C17.5 16.2335 17.5 15.7668 17.5 14.8333V6.83333C17.5 5.89991 17.5 5.4332 17.3183 5.07668C17.1586 4.76308 16.9036 4.50811 16.59 4.34832C16.2335 4.16667 15.7668 4.16667 14.8333 4.16667H5.16667C4.23325 4.16667 3.76654 4.16667 3.41002 4.34832C3.09641 4.50811 2.84144 4.76308 2.68166 5.07668C2.5 5.4332 2.5 5.89991 2.5 6.83333V14.8333C2.5 15.7668 2.5 16.2335 2.68166 16.59C2.84144 16.9036 3.09641 17.1586 3.41002 17.3183C3.76654 17.5 4.23325 17.5 5.16667 17.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <MenuButtonText tablet={isTabletDevice}>Events</MenuButtonText>
        </MenuButton>
        <MenuButton
          onClick={() => navigate("/welcome")}
          isactive={getPageStatus("welcome")}
          tablet={isTabletDevice}
        >
          <svg
            width="20"
            height="20"
            style={
              isTabletDevice ? { minWidth: "26px", minHeight: "26px" } : {}
            }
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 17.5C5 17.5 6.5 16.6667 10 16.6667C13.5 16.6667 15 17.5 15 17.5M7.5 14.1667V16.8286M12.5 14.1667V16.8286M5.16667 14.1667H14.8333C15.7668 14.1667 16.2335 14.1667 16.59 13.985C16.9036 13.8252 17.1586 13.5703 17.3183 13.2567C17.5 12.9001 17.5 12.4334 17.5 11.5V5.16667C17.5 4.23325 17.5 3.76654 17.3183 3.41002C17.1586 3.09641 16.9036 2.84144 16.59 2.68166C16.2335 2.5 15.7668 2.5 14.8333 2.5H5.16667C4.23325 2.5 3.76654 2.5 3.41002 2.68166C3.09641 2.84144 2.84144 3.09641 2.68166 3.41002C2.5 3.76654 2.5 4.23325 2.5 5.16667V11.5C2.5 12.4334 2.5 12.9001 2.68166 13.2567C2.84144 13.5703 3.09641 13.8252 3.41002 13.985C3.76654 14.1667 4.23325 14.1667 5.16667 14.1667Z"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
          <MenuButtonText tablet={isTabletDevice}>
            Welcome screen
          </MenuButtonText>
        </MenuButton>
      </SidebarTopContainer>
    </SidebarWrapper>
  );
};

export default Sidebar;

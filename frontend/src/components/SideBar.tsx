import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../logo.png";
import { isTablet } from "../common/common";
import IpadLogo from "../ipadlogo.png";
import { useState, useEffect } from "react";

// Modern color palette
const colors = {
  background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
  backgroundHover: "rgba(255, 255, 255, 0.05)",
  border: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  accent: "#6366F1", // Modern indigo
  accentHover: "#4F46E5",
  activeText: "#FFFFFF",
};

const SidebarTopContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  gap: 8px;
`;

const SidebarWrapper = styled.div<{ tablet: boolean }>`
  position: sticky;
  height: 100vh;
  background: ${colors.background};
  display: flex;
  border-right: 1px solid ${colors.border};
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 0px;
  gap: 16px;
  top: 0;
  left: 0;
  font-family: "Inter", Axiforma, sans-serif !important;
  width: ${(props) => (props.tablet ? "80px" : "260px")};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  overflow-x: hidden;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const MenuButton = styled.button<{ isactive: boolean; tablet: boolean }>`
  background: ${(props) => (props.isactive ? colors.accent : "transparent")};
  color: ${(props) =>
    props.isactive ? colors.activeText : colors.textPrimary};
  border: none;
  border-radius: 10px;
  height: 44px;
  width: ${(props) => (props.tablet ? "90%" : "90%")};
  display: flex;
  cursor: pointer;
  gap: 12px;
  align-items: center;
  padding: 0 ${(props) => (props.tablet ? "0" : "16px")};
  justify-content: ${(props) => (props.tablet ? "center" : "flex-start")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.isactive ? 1 : 0.9)};
  margin: 2px 0;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  line-height: 1;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: ${(props) => (props.isactive ? colors.accent : "transparent")};
    border-radius: 0 2px 2px 0;
    opacity: ${(props) => (props.isactive ? 1 : 0)};
  }

  &:hover {
    background: ${(props) =>
      props.isactive ? colors.accent : colors.backgroundHover};
    color: ${(props) => (props.isactive ? colors.activeText : colors.accent)};
    transform: translateX(2px);
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 2px;
  }

  svg {
    transition: color 0.2s ease;
  }
`;

const MenuButtonText = styled.span<{ tablet: boolean }>`
  display: ${(props) => (props.tablet ? "none" : "block")};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
  position: relative;
  top: 1px;
`;

const IconWrapper = styled.div<{ isactive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  position: relative;

  svg {
    stroke-width: ${(props) => (props.isactive ? 2 : 1.5)}px;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const CTAButton = styled.button`
  background: linear-gradient(
    135deg,
    ${colors.accent} 0%,
    ${colors.accentHover} 100%
  );
  color: white;
  border: none;
  border-radius: 8px;
  height: 40px;
  width: 160px;
  display: flex;
  cursor: pointer;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ImageContainer = styled.div`
  width: 100%;
  padding: 20px 0;
  display: flex;
  height: 70px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 80%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }

  img {
    transition: all 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Tooltip = styled.div<{ show: boolean }>`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity 0.2s ease;
  margin-left: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;

  &::before {
    content: "";
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-style: solid;
    border-color: transparent rgba(15, 23, 42, 0.9) transparent transparent;
  }
`;

const SidebarSection = styled.div`
  width: 100%;
  padding: 0 8px;
  margin-bottom: 8px;
`;

const SectionTitle = styled.div<{ tablet: boolean }>`
  color: ${colors.textSecondary};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 16px 0 8px ${(props) => (props.tablet ? "0" : "16px")};
  opacity: 0.7;
  display: ${(props) => (props.tablet ? "none" : "block")};
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabletDevice = isTablet();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  function getPageStatus(page: string) {
    return location.pathname.split("/")[1] === page;
  }

  // Hide tooltip when navigating
  useEffect(() => {
    setActiveTooltip(null);
  }, [location.pathname]);

  return (
    <SidebarWrapper tablet={isTabletDevice}>
      <SidebarTopContainer>
        <ImageContainer>
          <img
            src={isTabletDevice ? IpadLogo : Logo}
            onClick={() => navigate("/")}
            alt="logo"
            width={isTabletDevice ? "60%" : "80%"}
          />
        </ImageContainer>

        <SidebarSection>
          <SectionTitle tablet={isTabletDevice}>MAIN</SectionTitle>

          <TooltipWrapper
            onMouseEnter={() => isTabletDevice && setActiveTooltip("dashboard")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <MenuButton
              onClick={() => navigate("/")}
              isactive={getPageStatus("")}
              tablet={isTabletDevice}
            >
              <IconWrapper isactive={getPageStatus("")}>
                <svg
                  width="20"
                  height="20"
                  style={
                    isTabletDevice
                      ? { minWidth: "24px", minHeight: "24px" }
                      : {}
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
              </IconWrapper>
              <MenuButtonText tablet={isTabletDevice}>Dashboard</MenuButtonText>
            </MenuButton>
            {isTabletDevice && activeTooltip === "dashboard" && (
              <Tooltip show={true}>Dashboard</Tooltip>
            )}
          </TooltipWrapper>

          <TooltipWrapper
            onMouseEnter={() => isTabletDevice && setActiveTooltip("events")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <MenuButton
              onClick={() => navigate("/events")}
              isactive={getPageStatus("events")}
              tablet={isTabletDevice}
            >
              <IconWrapper isactive={getPageStatus("events")}>
                <svg
                  width="20"
                  height="20"
                  style={
                    isTabletDevice
                      ? { minWidth: "24px", minHeight: "24px" }
                      : {}
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
              </IconWrapper>
              <MenuButtonText tablet={isTabletDevice}>Events</MenuButtonText>
            </MenuButton>
            {isTabletDevice && activeTooltip === "events" && (
              <Tooltip show={true}>Events</Tooltip>
            )}
          </TooltipWrapper>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle tablet={isTabletDevice}>SETUP</SectionTitle>

          <TooltipWrapper
            onMouseEnter={() => isTabletDevice && setActiveTooltip("welcome")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <MenuButton
              onClick={() => navigate("/welcome")}
              isactive={getPageStatus("welcome")}
              tablet={isTabletDevice}
            >
              <IconWrapper isactive={getPageStatus("welcome")}>
                <svg
                  width="20"
                  height="20"
                  style={
                    isTabletDevice
                      ? { minWidth: "24px", minHeight: "24px" }
                      : {}
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
              </IconWrapper>
              <MenuButtonText tablet={isTabletDevice}>Check-in</MenuButtonText>
            </MenuButton>
            {isTabletDevice && activeTooltip === "welcome" && (
              <Tooltip show={true}>Welcome screen</Tooltip>
            )}
          </TooltipWrapper>
        </SidebarSection>

        {/* <SidebarSection>
          <SectionTitle tablet={isTabletDevice}>FINANCIALS</SectionTitle>

          <TooltipWrapper
            onMouseEnter={() =>
              isTabletDevice && setActiveTooltip("financials")
            }
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <MenuButton
              onClick={() => navigate("/financials")}
              isactive={getPageStatus("financials")}
              tablet={isTabletDevice}
            >
              <IconWrapper isactive={getPageStatus("financials")}>
                <svg
                  width="20"
                  height="20"
                  style={
                    isTabletDevice
                      ? { minWidth: "24px", minHeight: "24px" }
                      : {}
                  }
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V15C1.66667 15.9205 2.41286 16.6667 3.33333 16.6667H16.6667C17.5871 16.6667 18.3333 15.9205 18.3333 15V6.66667C18.3333 5.74619 17.5871 5 16.6667 5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83333 13.3333L8.33333 10.8333L10.8333 13.3333L15 9.16667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 9.16667H15V10.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.66667 3.33333V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3333 3.33333V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconWrapper>
              <MenuButtonText tablet={isTabletDevice}>
                Financials
              </MenuButtonText>
            </MenuButton>
            {isTabletDevice && activeTooltip === "financials" && (
              <Tooltip show={true}>Financials</Tooltip>
            )}
          </TooltipWrapper>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle tablet={isTabletDevice}>TASKS</SectionTitle>

          <TooltipWrapper
            onMouseEnter={() => isTabletDevice && setActiveTooltip("tasks")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <MenuButton
              onClick={() => navigate("/tasks")}
              isactive={getPageStatus("tasks")}
              tablet={isTabletDevice}
            >
              <IconWrapper isactive={getPageStatus("tasks")}>
                <svg
                  width="20"
                  height="20"
                  style={
                    isTabletDevice
                      ? { minWidth: "24px", minHeight: "24px" }
                      : {}
                  }
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.66667 10L8.33333 11.6667L13.3333 6.66669"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.99967 18.3333C14.6021 18.3333 18.333 14.6024 18.333 10C18.333 5.39763 14.6021 1.66669 9.99967 1.66669C5.39728 1.66669 1.66634 5.39763 1.66634 10C1.66634 14.6024 5.39728 18.3333 9.99967 18.3333Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconWrapper>
              <MenuButtonText tablet={isTabletDevice}>Tasks</MenuButtonText>
            </MenuButton>
            {isTabletDevice && activeTooltip === "tasks" && (
              <Tooltip show={true}>Tasks</Tooltip>
            )}
          </TooltipWrapper>
        </SidebarSection> */}
      </SidebarTopContainer>
    </SidebarWrapper>
  );
};

export default Sidebar;

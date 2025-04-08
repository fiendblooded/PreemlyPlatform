import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "./useAxiosWithAuth";

// Define SubscriptionLevel enum locally since we can't import it from backend
enum SubscriptionLevel {
  FREE = "FREE",
  LITE = "LITE",
  PLUS = "PLUS",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  z-index: 1001;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #333;
  font-weight: bold;
`;

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 12px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #666;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  font-size: 14px;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
`;

const Option = styled.div`
  cursor: pointer;
  margin: auto 0;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #f5f5f5;
    transform: translateX(2px);
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  font-size: 14px;
  justify-content: center;
`;

export const Overlay = styled.div<{ isVisible: boolean }>`
  display: ${(props) => (props.isVisible ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const namespace = "https://custom-claims.preemly.eu/";

const SubscriptionBadge = styled.div<{ level: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => {
    switch (props.level) {
      case SubscriptionLevel.FREE:
        return "#e0e0e0";
      case SubscriptionLevel.LITE:
        return "#4caf50";
      case SubscriptionLevel.PLUS:
        return "#2196f3";
      case SubscriptionLevel.PREMIUM:
        return "#9c27b0";
      case SubscriptionLevel.ENTERPRISE:
        return "#ff9800";
      default:
        return "#e0e0e0";
    }
  }};
  color: ${(props) => {
    switch (props.level) {
      case SubscriptionLevel.FREE:
        return "#555";
      default:
        return "#fff";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.level) {
        case SubscriptionLevel.FREE:
          return "#d0d0d0";
        case SubscriptionLevel.LITE:
          return "#388e3c";
        case SubscriptionLevel.PLUS:
          return "#1976d2";
        case SubscriptionLevel.PREMIUM:
          return "#7b1fa2";
        case SubscriptionLevel.ENTERPRISE:
          return "#f57c00";
        default:
          return "#d0d0d0";
      }
    }};
`;

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [subscriptionLevel, setSubscriptionLevel] = useState<SubscriptionLevel>(
    SubscriptionLevel.FREE
  );
  const navigate = useNavigate();
  const axiosInstance = useAxiosWithAuth();

  useEffect(() => {
    const fetchSubscriptionLevel = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await axiosInstance.get("/users/subscription");
        if (response.data.success && response.data.data.subscriptionLevel) {
          setSubscriptionLevel(response.data.data.subscriptionLevel);
        }
      } catch (error) {
        console.error("Error fetching subscription level:", error);
      }
    };

    fetchSubscriptionLevel();
  }, [isAuthenticated, axiosInstance]);

  if (!isAuthenticated) return null;

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  return (
    <>
      <Overlay isVisible={isDropdownVisible} onClick={closeDropdown} />
      <ProfileContainer onClick={toggleDropdown}>
        <ProfileImage
          src={user?.[`${namespace}picture`]}
          alt={user?.[`${namespace}displayName`]}
        />
        {isDropdownVisible && (
          <DropdownContainer>
            <UserInfoSection onClick={() => navigate("/profile")}>
              <ProfileImage
                src={user?.[`${namespace}picture`]}
                alt={user?.[`${namespace}displayName`]}
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
              <UserName>{user?.[`${namespace}displayName`]}</UserName>
              <UserEmail>{user?.[`${namespace}email`]}</UserEmail>
              <SubscriptionBadge level={subscriptionLevel}>
                {subscriptionLevel}
              </SubscriptionBadge>
            </UserInfoSection>
            <OptionsSection>
              <Option onClick={() => navigate("/help")}>Help</Option>
            </OptionsSection>
            <FooterSection>
              <Option
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Sign Out
              </Option>
            </FooterSection>
          </DropdownContainer>
        )}
      </ProfileContainer>
    </>
  );
};

export default UserProfile;

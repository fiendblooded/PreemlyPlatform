import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import useAuthSetup from "../../useAuthSetup";

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
  border 1.5px solid transparent;
  &:hover {
    border 1.5px solid black;
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
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #666;
`;

const UpgradeButton = styled.button`
  color: #0b0e13; /* Dark text for contrast */
  background-color: #fcd535; /* Matches the yellow accent color */
  font-size: 14px;
  padding: 10px;
  border: none;
  border-radius: 20px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #e6bf30; /* Slightly darker shade for hover */
  }
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
  padding: 8px;
  padding-left: 10px;
  border-radius: 4px;
  &:hover {
    background-color: rgb(215, 215, 215);
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

const Overlay = styled.div<{ isVisible: boolean }>`
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

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  useAuthSetup();

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
          alt={user?.[`${namespace}name`]}
        />
        {isDropdownVisible && (
          <DropdownContainer>
            <UserInfoSection>
              <ProfileImage
                src={user?.[`${namespace}picture`]}
                alt={user?.[`${namespace}name`]}
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
              <UserName>{user?.[`${namespace}name`]}</UserName>
              <UserEmail>{user?.[`${namespace}email`]}</UserEmail>

              <UpgradeButton>Upgrade to PRO</UpgradeButton>
            </UserInfoSection>
            <OptionsSection>
              <Option>Profile</Option>
              <Option>Settings</Option>
            </OptionsSection>
            <FooterSection>
              <Option>Help</Option>
            </FooterSection>
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

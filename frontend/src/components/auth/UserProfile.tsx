import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";
import useAuthSetup from "../../useAuthSetup";

const ProfileContainer = styled.div`
  display: flex;
  width: 100%;
  height: 60px;
  align-items: center;
  font-size: 14px;
  justify-content: center;
  position: relative;

  color: #f5f5f5;
  gap: 10px;
  cursor: pointer;
`;

const UserDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: -2px;
`;

const UserRole = styled.div`
  color: grey;
  font-size: 12px;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

// const ProfileInfo = styled.div`
//   position: relative;
//   display: flex;
//   align-items: center;
//   overflow: hidden;
//   height: 60px;
//   width: 100%;
// `;

const LogOutButton = styled.button<{ isVisible: boolean }>`
  background-color: #c50000;
  color: white;
  border: none;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  border-radius: 0px;
  margin-right: -1px;
  width: ${(props) => (props.isVisible ? "60px" : "0px")};
  transition: width 0.3s ease-in-out;
  padding: 0px;
  opacity: ${(props) => (props.isVisible ? "1" : "0")};

  &:hover {
    background-color: darkred;
  }
`;

const namespace = "https://custom-claims.preemly.eu/"; // The same namespace used in your Action

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isVisible, setIsVisible] = useState(false);
  useAuthSetup();

  if (!isAuthenticated) return null;

  return (
    <ProfileContainer
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <ProfileImage
        src={user?.[`${namespace}picture`]}
        alt={user?.[`${namespace}name`]}
      />
      <UserDetailsContainer>
        <div>{user?.[`${namespace}name`]}</div>
        <UserRole>{user?.[`${namespace}email`]}</UserRole>
      </UserDetailsContainer>
      <LogOutButton
        isVisible={isVisible}
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        <svg
          width="20"
          height="21"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.9883 6.8794V3.5332C12.9883 2.42863 12.0929 1.5332 10.9883 1.5332H3.62297C2.51841 1.5332 1.62297 2.42863 1.62297 3.5332V18.0643C1.62297 19.1688 2.5184 20.0643 3.62297 20.0643H10.9883C12.0928 20.0643 12.9883 19.1688 12.9883 18.0643V15.1957"
            stroke="white"
            stroke-width="1.3"
            stroke-linecap="round"
          />
          <path
            d="M6.66797 11.6207C6.30898 11.6207 6.01797 11.3297 6.01797 10.9707C6.01797 10.6117 6.30898 10.3207 6.66797 10.3207V11.6207ZM19.4597 10.5111C19.7135 10.7649 19.7135 11.1765 19.4597 11.4303L15.3231 15.5669C15.0692 15.8207 14.6577 15.8207 14.4038 15.5669C14.15 15.3131 14.15 14.9015 14.4038 14.6477L18.0808 10.9707L14.4038 7.29375C14.15 7.03991 14.15 6.62835 14.4038 6.37451C14.6577 6.12067 15.0692 6.12067 15.3231 6.37451L19.4597 10.5111ZM6.66797 10.3207L19 10.3207V11.6207L6.66797 11.6207V10.3207Z"
            fill="white"
          />
        </svg>
      </LogOutButton>
    </ProfileContainer>
  );
};

export default UserProfile;

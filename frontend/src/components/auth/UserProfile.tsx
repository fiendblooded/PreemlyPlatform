import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";

const ProfileContainer = styled.div`
  display: flex;
  width: 100%;
  height: 60px;
  align-items: center;
  font-size: 14px;
  justify-content: center;

  color: #f5f5f5;
  gap: 10px;
  cursor: pointer;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;
const UserDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: -2px;
`;
const UserRole = styled.div`
  color: grey;
`;
const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

const ProfileInfo = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  width: 180px;

  bottom: 50px;
  right: 0;
  background-color: #2a2a3b;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  gap: 10px;

  h3 {
    font-size: 0.9rem;
    margin: 0;
    color: #ffd524; /* Yellow */
  }

  p {
    font-size: 0.75rem;
    margin: 0;
    color: #aaa; /* Light gray for email */
  }

  button {
    background-color: #f4c430; /* Yellow */
    color: #121212;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;

    &:hover {
      background-color: #ffd700;
    }
  }
`;

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isVisible, setIsVisible] = useState(false);

  if (!isAuthenticated) return null;

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <ProfileContainer onClick={toggleVisibility}>
      <ProfileImage src={user?.picture} alt={user?.name} />
      <UserDetailsContainer>
        <div>{user?.name}</div>
        <UserRole>Business</UserRole>
      </UserDetailsContainer>
      <ProfileInfo isVisible={isVisible}>
        <h3>{user?.name}</h3>
        <p>{user?.email}</p>
        <button onClick={() => logout()}>Log Out</button>
      </ProfileInfo>
    </ProfileContainer>
  );
};

export default UserProfile;

import { useState, useEffect } from "react";
import styled from "styled-components";
import { PageWrapper } from "./Events";
import TopBar from "./TopBar";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { useAuth0 } from "@auth0/auth0-react";
import useAuthSetup from "../useAuthSetup";
import UserSearch from "./UserSearch";

// Styled Components
const ProfileLayout = styled.div`
  display: flex;
  width: 100%;
  gap: 24px;
  min-height: min-content;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ProfileSidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const ProfileContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: visible;
`;

const ProfilePictureSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const ProfilePicture = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProfileNameWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  gap: 8px;
`;

const VerifiedBadge = styled.div`
  color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    stroke: #4caf50;
  }
`;

const ProfileEmail = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const NavigationMenu = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const NavItem = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: ${(props) =>
    props.active ? "rgba(107, 61, 223, 0.08)" : "transparent"};
  color: ${(props) => (props.active ? "rgb(107, 61, 223)" : "#555")};
  border: none;
  text-align: left;
  font-size: 15px;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid
    ${(props) => (props.active ? "rgb(107, 61, 223)" : "transparent")};

  &:hover {
    background-color: ${(props) =>
      props.active ? "rgba(107, 61, 223, 0.12)" : "rgba(0, 0, 0, 0.04)"};
  }

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f5f5f5;
  color: #555;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #eee;
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeader = styled.div`
  margin-bottom: 8px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ProfileCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InfoLabel = styled.div`
  width: 180px;
  font-size: 14px;
  font-weight: 500;
  color: #666;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 4px;
  }
`;

const InfoValue = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const ActivityCard = styled(ProfileCard)`
  margin-top: 24px;
`;

const DangerZone = styled(ProfileCard)`
  margin-top: 24px;
  border: 1px solid rgba(255, 77, 79, 0.2);

  ${CardTitle} {
    color: #ff4d4f;
  }
`;

const DeleteButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #ff3333;
  }

  &:disabled {
    background-color: #ffb3b3;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ComingSoonCard = styled(ProfileCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
`;

const ComingSoonIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

const ComingSoonTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`;

const ComingSoonText = styled.p`
  font-size: 14px;
  color: #666;
  max-width: 400px;
  margin: 0;
`;

const SeamlessInput = styled.input`
  font-family: Axiforma, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
  padding: 4px 0;
  border-bottom: 1px solid transparent;

  &:focus {
    border-bottom: 1px solid rgb(107, 61, 223);
  }
`;

// Additional styled components for the enhanced profile page
const EditButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: rgb(107, 61, 223);
    background-color: rgba(107, 61, 223, 0.08);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyStateMessage = styled.div`
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 20px;

  a {
    color: rgb(107, 61, 223);
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(107, 61, 223, 0.1);
  color: rgb(107, 61, 223);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(107, 61, 223, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    stroke: rgb(107, 61, 223);
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #888;
`;

const SeletedGuestsSC = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;

  b {
    margin-right: 4px;
    color: #333;
  }
`;

// Form-related styled components
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: ${(props) => (props.disabled ? "#f9f9f9" : "white")};
  color: ${(props) => (props.disabled ? "#888" : "#333")};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 2px rgba(107, 61, 223, 0.2);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const FormHint = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 6px;
`;

const VerificationStatus = styled.div<{ verified?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${(props) => (props.verified ? "#4caf50" : "#ff9800")};
  margin-top: 6px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Activity-related styled components
const ActivityLabel = styled.div`
  width: 140px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
`;

const ActivityValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

// Danger zone related
const DangerDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
  box-sizing: border-box;
`;

const Profile: React.FC = () => {
  useAuthSetup();
  const { user, logout } = useAuth0();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState(""); // New state for name input
  const [deleting, setDeleting] = useState(false); // Existing deletion state
  const [activeTab, setActiveTab] = useState("profile"); // For tab navigation
  const axiosInstance = useAxiosWithAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.sub) return;
      try {
        const response = await axiosInstance.get(`/users/${user.sub}`);
        setProfile(response.data.data);
        setNewName(response.data.data.user_metadata.displayName); // Set name for editing
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.sub]);

  const handleNameUpdate = async () => {
    if (!user?.sub || !newName || profile.user_metadata.displayName === newName)
      return;

    try {
      const response = await axiosInstance.patch(`/users/${user.sub}/name`, {
        name: newName,
      });
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again later.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!user?.sub) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/users/${user.sub}`);
      alert("Your profile has been successfully deleted.");
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete your profile. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PageWrapper>Loading...</PageWrapper>;
  }

  return (
    <PageWrapper>
      <TopBar sectionTitle="Account Settings" />
      <ContentWrapper>
        <ProfileLayout>
          <ProfileSidebar>
            <ProfilePictureSection>
              <ProfilePicture
                src={profile.picture}
                alt={`${profile.user_metadata.name}'s profile`}
              />
              <ProfileNameWrapper>
                <SeamlessInput
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleNameUpdate()}
                />
                {profile.email_verified && (
                  <VerifiedBadge title="Email verified">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </VerifiedBadge>
                )}
              </ProfileNameWrapper>
              <ProfileEmail>{profile.email || "N/A"}</ProfileEmail>
            </ProfilePictureSection>

            <NavigationMenu>
              <NavItem
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Profile Settings
              </NavItem>
              <NavItem
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16V12M12 8H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Security
              </NavItem>
              <NavItem
                active={activeTab === "billing"}
                onClick={() => setActiveTab("billing")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 5.25V18.75C21 19.5784 20.3284 20.25 19.5 20.25H4.5C3.67157 20.25 3 19.5784 3 18.75V5.25M21 5.25C21 4.42157 20.3284 3.75 19.5 3.75H4.5C3.67157 3.75 3 4.42157 3 5.25M21 5.25V9.75H3V5.25M21 14.25H3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Billing & Plans
              </NavItem>
              <NavItem
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6V10L16 12M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Notifications
              </NavItem>
              <NavItem
                active={activeTab === "connections"}
                onClick={() => setActiveTab("connections")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 16L19 19M18 12H22M16 8L19 5M8 16L5 19M2 12H6M8 8L5 5M12 2V6M12 18V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Connections
              </NavItem>
            </NavigationMenu>

            <ButtonContainer>
              <LogoutButton
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </LogoutButton>
            </ButtonContainer>
          </ProfileSidebar>

          <ProfileContent>
            {activeTab === "profile" && (
              <ProfileSection>
                <SectionHeader>
                  <h2>Profile Information</h2>
                  <SectionDescription>
                    Update your personal information and how others see you on
                    the platform.
                  </SectionDescription>
                </SectionHeader>

                <ProfileCard>
                  <CardTitle>Personal Details</CardTitle>

                  <FormGroup>
                    <FormLabel>Display Name</FormLabel>
                    <FormInput
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={handleNameUpdate}
                      placeholder="Your display name"
                    />
                    <FormHint>
                      This is the name that will be visible to other users.
                    </FormHint>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Email Address</FormLabel>
                    <FormInput type="email" value={profile.email} disabled />
                    {profile.email_verified ? (
                      <VerificationStatus verified>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Verified
                      </VerificationStatus>
                    ) : (
                      <VerificationStatus>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 9V13M12 17H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Not verified
                      </VerificationStatus>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Username</FormLabel>
                    <FormInput
                      type="text"
                      value={profile.nickname || ""}
                      disabled
                    />
                  </FormGroup>
                </ProfileCard>

                <ProfileCard>
                  <CardTitle>Account Activity</CardTitle>

                  <ActivityItem>
                    <ActivityLabel>Last Login</ActivityLabel>
                    <ActivityValue>
                      {new Date(profile.last_login).toLocaleString()}
                    </ActivityValue>
                  </ActivityItem>

                  <ActivityItem>
                    <ActivityLabel>Login Count</ActivityLabel>
                    <ActivityValue>{profile.logins_count}</ActivityValue>
                  </ActivityItem>

                  <ActivityItem>
                    <ActivityLabel>Account Created</ActivityLabel>
                    <ActivityValue>
                      {new Date(profile.created_at).toLocaleString()}
                    </ActivityValue>
                  </ActivityItem>
                </ProfileCard>

                <DangerZone>
                  <CardTitle>Danger Zone</CardTitle>
                  <DangerDescription>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </DangerDescription>

                  <DeleteButton
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4802 6.21799 19.908C6.40973 20.2843 6.71569 20.5903 7.09202 20.782C7.51984 21 8.07989 21 9.2 21H14.8C15.9201 21 16.4802 21 16.908 20.782C17.2843 20.5903 17.5903 20.2843 17.782 19.908C18 19.4802 18 18.9201 18 17.8V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60218 8.15224 4.23463C8.35523 3.74458 8.74458 3.35523 9.23463 3.15224C9.60218 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6448 3.74458 15.8478 4.23463C16 4.60218 16 5.06812 16 6M16 6H18M18 6H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete Account
                      </>
                    )}
                  </DeleteButton>
                </DangerZone>
              </ProfileSection>
            )}

            {activeTab === "security" && (
              <ProfileSection>
                <SectionHeader>
                  <h2>Security Settings</h2>
                  <SectionDescription>
                    Manage your account security and authentication methods.
                  </SectionDescription>
                </SectionHeader>

                <ComingSoonCard>
                  <ComingSoonIcon>🔒</ComingSoonIcon>
                  <ComingSoonTitle>
                    Security Settings Coming Soon
                  </ComingSoonTitle>
                  <ComingSoonText>
                    We're working on adding password management, two-factor
                    authentication, and other security features to keep your
                    account safe.
                  </ComingSoonText>
                </ComingSoonCard>
              </ProfileSection>
            )}

            {activeTab === "billing" && (
              <ProfileSection>
                <SectionHeader>
                  <h2>Billing & Plans</h2>
                  <SectionDescription>
                    Manage your subscription, payment methods, and billing
                    history.
                  </SectionDescription>
                </SectionHeader>

                <ComingSoonCard>
                  <ComingSoonIcon>💳</ComingSoonIcon>
                  <ComingSoonTitle>
                    Billing Features Coming Soon
                  </ComingSoonTitle>
                  <ComingSoonText>
                    We're working on adding subscription management, payment
                    methods, and billing history to help you manage your
                    account.
                  </ComingSoonText>
                </ComingSoonCard>
              </ProfileSection>
            )}

            {activeTab === "notifications" && (
              <ProfileSection>
                <SectionHeader>
                  <h2>Notification Preferences</h2>
                  <SectionDescription>
                    Control how and when you receive notifications.
                  </SectionDescription>
                </SectionHeader>

                <ComingSoonCard>
                  <ComingSoonIcon>🔔</ComingSoonIcon>
                  <ComingSoonTitle>
                    Notification Settings Coming Soon
                  </ComingSoonTitle>
                  <ComingSoonText>
                    We're working on adding notification preferences so you can
                    customize how and when you receive updates about your events
                    and account.
                  </ComingSoonText>
                </ComingSoonCard>
              </ProfileSection>
            )}

            {activeTab === "connections" && (
              <ProfileSection>
                <SectionHeader>
                  <h2>Connected Accounts</h2>
                  <SectionDescription>
                    Manage integrations with other services and applications.
                  </SectionDescription>
                </SectionHeader>

                <ComingSoonCard>
                  <ComingSoonIcon>🔗</ComingSoonIcon>
                  <ComingSoonTitle>Connections Coming Soon</ComingSoonTitle>
                  <ComingSoonText>
                    We're working on adding integrations with calendar services,
                    social media, and other applications to enhance your
                    experience.
                  </ComingSoonText>
                </ComingSoonCard>

                <ProfileCard>
                  <CardTitle>Find Users</CardTitle>
                  <UserSearch />
                </ProfileCard>
              </ProfileSection>
            )}
          </ProfileContent>
        </ProfileLayout>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Profile;

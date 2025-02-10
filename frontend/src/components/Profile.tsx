import { useState, useEffect } from "react";
import styled from "styled-components";
import { ContentWrapper, Header, PageWrapper } from "./Events";
import TopBar from "./TopBar";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { useAuth0 } from "@auth0/auth0-react";
import useAuthSetup from "../useAuthSetup";
import UserSearch from "./UserSearch";

const Profile: React.FC = () => {
  useAuthSetup();
  const { user, logout } = useAuth0();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState(""); // New state for name input
  const [deleting, setDeleting] = useState(false); // Existing deletion state
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
      <ContentWrapper marginTop={60}>
        <ProfileContainer>
          <ProfilePictureWrapper>
            <ProfilePicture
              src={profile.picture}
              alt={`${profile.user_metadata.name}'s profile`}
            />

            <SeamlessInput
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => handleNameUpdate()}
            />
            {profile.email_verified && (
              <EmailVerifiedIcon
                data-tooltip-id="email-verified-tooltip"
                aria-label="Email verified"
              >
                ✅
              </EmailVerifiedIcon>
            )}

            <ProfileEmail>{profile.email || "N/A"}</ProfileEmail>
          </ProfilePictureWrapper>

          <ProfileDetails>
            <SectionTitle>Personal Information</SectionTitle>
            <DetailItem>
              <strong>Username:</strong> {profile.nickname || "N/A"}
            </DetailItem>
            {/* <DetailItem>
              <strong>User ID:</strong> {profile.user_id || "N/A"}
            </DetailItem> */}

            <SectionTitle>Activity</SectionTitle>
            <DetailItem>
              <strong>Last Login:</strong>{" "}
              {new Date(profile.last_login).toLocaleString() || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>Logins Count:</strong> {profile.logins_count || 0}
            </DetailItem>

            <ButtonContainer>
              <LogoutButton
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Logout
              </LogoutButton>
              <DeleteButton onClick={handleDeleteProfile} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Profile"}
              </DeleteButton>
            </ButtonContainer>
          </ProfileDetails>
        </ProfileContainer>

        <Header>Search for Users</Header>
        <UserSearch />
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Profile;

// Styled Components

const EmailVerifiedIcon = styled.span`
  margin-left: 8px;
  font-size: 18px;
  color: #4caf50;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  gap: 40px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const ProfilePictureWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
`;

const ProfilePicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const ProfileEmail = styled.p`
  font-size: 16px;
  color: #666;
  margin-top: 4px;
`;

const ProfileDetails = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 8px;
`;

const DetailItem = styled.div`
  font-size: 16px;
  margin-bottom: 12px;
  color: #444;

  strong {
    font-weight: 700;
    color: #222;
  }
`;

const LogoutButton = styled.button`
  background-color: #6c63ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #574bff;
  }
`;

const DeleteButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #e43e3e;
  }
`;
const SeamlessInput = styled.input`
  font-family: Axiforma, sans-serif;
  font-size: 28px;
  line-height: 30px;
  font-weight: bold;
  max-width: 90%;
  text-overflow: ellipsis;
  color: black;
  text-align: center;
  background-color: transparent;
  border: none;
  outline: none;
  width: 80%;
  padding: 4px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid transparent;
  &:focus {
    border-bottom: 1px solid black;
  }

  &::placeholder {
    color: #aaa; /* Optional: Adjust placeholder color */
  }
`;

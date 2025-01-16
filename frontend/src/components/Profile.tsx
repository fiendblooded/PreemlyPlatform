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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // Track deletion state
  const axiosInstance = useAxiosWithAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.sub) return;
      try {
        const response = await axiosInstance.get(`/users/${user.sub}`);
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      logout({ logoutParams: { returnTo: window.location.origin } }); // Logout the user
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
        <Header>My Profile</Header>
        <ProfileContainer>
          <ProfilePicture
            src={profile.picture}
            alt={`${profile.name}'s profile`}
          />
          <ProfileDetails>
            <DetailItem>
              <strong>Name:</strong> {profile.name || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>Email:</strong> {profile.email || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>Nickname:</strong> {profile.nickname || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>User ID:</strong> {profile.user_id || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>Email Verified:</strong>{" "}
              {profile.email_verified ? "Yes" : "No"}
            </DetailItem>
            <DetailItem>
              <strong>Last Login:</strong>{" "}
              {new Date(profile.last_login).toLocaleString() || "N/A"}
            </DetailItem>
            <DetailItem>
              <strong>Logins Count:</strong> {profile.logins_count || 0}
            </DetailItem>
          </ProfileDetails>
          <ButtonContainer>
            <LogoutButton
              onClick={() => logout({logoutParams:{ returnTo: window.location.origin }})}
            >
              Logout
            </LogoutButton>
            <DeleteButton onClick={handleDeleteProfile} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Profile"}
            </DeleteButton>
          </ButtonContainer>
        </ProfileContainer>

        <Header>Search for Users</Header>
        <UserSearch />
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Profile;

// Styled Components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const ProfilePicture = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #f0c808; /* Yellow accent */
  margin-bottom: 20px;
`;

const ProfileDetails = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: #f7f7f7; /* Light grey background */
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const DetailItem = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  color: #333; /* Dark grey text */
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #d4c4fb; /* Light purple accent */
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #b8a9f0; /* Slightly darker purple on hover */
  }
`;

const DeleteButton = styled.button`
  padding: 10px 20px;
  background-color: #f44336; /* Red color for delete */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f; /* Slightly darker red on hover */
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

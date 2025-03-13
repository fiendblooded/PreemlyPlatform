import { useState } from "react";
import styled from "styled-components";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import useAuthSetup from "../../useAuthSetup";
import FileDropArea from "../FileDropArea";
import PopupOverlay from "./PopupOverlay";
import { PrimaryButton } from "../EventGuestsEditor";

// Modern color palette to match other components
const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  shadow: "rgba(0, 0, 0, 0.1)",
  error: "#EF4444",
  success: "#10B981",
};

const FormTitle = styled.h2`
  color: ${colors.textPrimary};
  text-align: center;
  margin-bottom: 24px;
  font-family: Axiforma, sans-serif;
  font-weight: 600;
  font-size: 24px;
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-family: Axiforma, sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  background-color: ${colors.backgroundLight};
  font-size: 15px;
  font-family: Axiforma, sans-serif;
  color: ${colors.textPrimary};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${colors.shadow};

  &:hover {
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 4px 8px ${colors.shadow};
  }

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 1;
  }
`;

const SuccessMessage = styled.p`
  color: ${colors.success};
  text-align: center;
  margin-top: 16px;
  font-family: Axiforma, sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "✓";
    display: inline-block;
    font-weight: bold;
  }
`;

const ErrorMessage = styled.p`
  color: ${colors.error};
  text-align: center;
  margin-top: 16px;
  font-family: Axiforma, sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "!";
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    background-color: ${colors.error};
    color: white;
    border-radius: 50%;
    font-weight: bold;
  }
`;

const PopupContent = styled.div`
  position: relative;
  background-color: ${colors.backgroundLight};
  padding: 36px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  font-family: Axiforma, sans-serif;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: all 0.2s ease;

  &:hover {
    color: ${colors.textPrimary};
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const PosterPreview = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px ${colors.shadow};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${PosterPreview}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

interface EventFormProps {
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useAuthSetup();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const axiosInstance = useAxiosWithAuth();

  const handleFileDrop = (file: File) => {
    setPoster(file);
  };

  const handleRemoveFile = () => {
    setPoster(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      let base64Poster = "";

      if (poster) {
        // Convert file to base64 if a poster is present
        base64Poster = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(poster);
        });
      }

      const response = await axiosInstance.post(`/events`, {
        title,
        description: "",
        ownerId: user?.sub || "random",
        poster: base64Poster,
        guests: [],
        date: new Date().toISOString(),
      });

      const eventId = response.data.message._id;
      navigate(`/events/${eventId}`);
      setSuccess(true);
      setTitle("");
      setPoster(null);
      onClose();
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupOverlay visible={true} onClose={onClose}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <FormTitle>Create New Event</FormTitle>
        <FormContainer onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <FileDropArea
            onFileDrop={handleFileDrop}
            onRemoveFile={handleRemoveFile}
            accept="image/*"
            message="Drag & Drop poster image here or click to browse. (Optional)"
            hoverMessage="Drop the image here!"
          />

          {poster && (
            <PosterPreview>
              <img src={URL.createObjectURL(poster)} alt="Poster Preview" />
              <RemoveButton onClick={handleRemoveFile}>×</RemoveButton>
            </PosterPreview>
          )}

          <PrimaryButton
            type="submit"
            disabled={loading}
            style={{ width: "100%", maxWidth: "200px" }}
          >
            {loading ? "Creating..." : "Create Event"}
          </PrimaryButton>
        </FormContainer>
        {success && (
          <SuccessMessage>Event created successfully!</SuccessMessage>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PopupContent>
    </PopupOverlay>
  );
};

export default EventForm;

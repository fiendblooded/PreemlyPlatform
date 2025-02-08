import { useState } from "react";
import styled from "styled-components";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import useAuthSetup from "../../useAuthSetup";
import FileDropArea from "../FileDropArea";
import PopupOverlay from "./PopupOverlay";

const FormTitle = styled.h2`
  color: black;
  text-align: center;
  margin-bottom: 20px;
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: white;
  font-size: 1.1rem;
  font-family: Axiforma, sans-serif;
  color: black;

  &:focus {
    border-color: #f4c430;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #9370db;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  width: 30%;

  &:hover {
    background-color: #805ad5;
  }

  &:disabled {
    background-color: rgb(178, 178, 178);
    color: rgb(94, 94, 94);
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.p`
  color: #4caf50;
  text-align: center;
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: #f44336;
  text-align: center;
  margin-top: 10px;
`;

const PopupContent = styled.div`
  position: relative;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #555;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    color: #000;
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
      // Convert file to base64 if needed before sending to the backend
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Poster = reader.result;

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
      };

      if (poster) reader.readAsDataURL(poster);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupOverlay visible={true} onClose={onClose}>
      <PopupContent>
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
            message="Drag & Drop poster image here or click to browse"
            hoverMessage="Drop the image here!"
          />

          {poster && (
            <img
              src={URL.createObjectURL(poster)}
              alt="Poster Preview"
              style={{ width: "100px", height: "100px" }}
            />
          )}

          <Button type="submit" disabled={loading || !poster}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
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

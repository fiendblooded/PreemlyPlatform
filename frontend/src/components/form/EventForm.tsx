import { useState } from "react";
import styled from "styled-components";
import EventCreatorWelcome from "./EventCreatorWelcome";
import TicketInSpace from "./TicketInSpace";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
const FormWrapper = styled.div`
  background-color: #121212;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  /* Centering the div */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const FormTitle = styled.h2`
  color: #f4c430;
  text-align: center;
  margin-bottom: 20px;
`;
const FormContainer = styled.form`
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #121212;
  color: #f5f5f5;
  font-size: 1rem;

  &:focus {
    border-color: #f4c430;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #121212;
  color: #f5f5f5;
  font-size: 1rem;
  resize: none;

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
  width: 100%;

  &:hover {
    background-color: #805ad5;
  }

  &:disabled {
    background-color: #555;
    color: #777;
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
const TicketInSpaceContainer = styled.div`
  width: 500px;
  height: 500px;
`;

const EventForm: React.FC = () => {
  const __dirname = window.location.origin;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth0();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPoster(reader.result as string); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };
  const axiosInstance = useAxiosWithAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    setError("");
    try {
      const response = await axiosInstance.post(`/events`, {
        title,
        description,
        ownerId: user?.sub || "random", // Use the Auth0 user ID
        poster: poster,
        guests: [],
        date: new Date().toISOString(), // Use the current date and time in ISO format
      });

      console.log("Event created:", response);

      // Navigate to the event page using the returned _id
      const eventId = response.data.message._id; // Ensure this matches the backend structure
      navigate(`/events/${eventId}`);

      setSuccess(true);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function determineUIForStage() {
    switch (stage) {
      case 0:
        return <EventCreatorWelcome nextPage={() => setStage(1)} />;
      case 1:
        return (
          <FormWrapper>
            <FormTitle>Create New Event</FormTitle>
            <FormContainer onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Event Description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {poster && (
                <img
                  src={poster}
                  alt="Poster Preview"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </FormContainer>
            {success && (
              <SuccessMessage>Event created successfully!</SuccessMessage>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <TicketInSpaceContainer>
              <TicketInSpace
                name={title || "Event Title"}
                event={description || "Event Description"}
              />
            </TicketInSpaceContainer>
          </FormWrapper>
        );
      default:
        return <div></div>;
    }
  }
  return determineUIForStage();
};

export default EventForm;

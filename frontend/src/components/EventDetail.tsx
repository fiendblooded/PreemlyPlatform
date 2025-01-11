import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Event } from "../types";
// import QRCode from "qrcode";
import PosterUploadModal from "./PosterUploadModal";
import CSVUploader from "./CSVUploader";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
// import sendEmail from "../mailgunService";

const PageWrapper = styled.div`
  padding: 20px;
  background-color: #121212; /* Dark background */
  color: #f5f5f5;
`;

const Header = styled.div`
  color: #f4c430; /* Yellow */
  text-align: center;
  display: flex;
  font-size: 26px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;
const PosterImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 600px;
  border-radius: 8px;
  margin-bottom: 20px;
  object-fit: cover; /* Ensure the image scales nicely */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;
const EventDetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const EventDetails = styled.div`
  flex: 1;
  margin-right: 20px;
  background-color: #121212;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const GuestsWrapper = styled.div`
  flex: 2;
  background-color: #121212;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const GuestList = styled.ul`
  margin-top: 10px;
  list-style: none;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    background-color: #2c2c3c;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    text-align: left;
    &:before {
      content: "•";
      color: #9370db; /* Purple */
      margin-right: 8px;
    }
  }
`;

const LoadingMessage = styled.p`
  color: #bbb;
  font-size: 1rem;
  text-align: center;
`;

const AddGuestButton = styled.button`
  margin-top: 20px;
  background-color: #f4c430;
  border: none;
  padding: 10px 15px;
  margin-right: 10px;
  color: #121212;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ffd700;
  }
`;
const DeleteButton = styled.button`
  display: flex;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #e7514c;
  color: #e7514c;
  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #e7514c;
    color: white;
  }
`;
const BackButton = styled.button`
  display: flex;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border: 1px solid white;
  color: white;
  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: white;
    color: black;
  }
`;

const GuestTable = styled.table`
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #444;
    padding: 10px;
    text-align: left;
    color: #ccc;
  }

  th {
    background-color: #2c2c3c;
  }

  td input {
    margin: 0 auto;
    width: 98%;
    background-color: #121212;
    color: #f5f5f5;
    border: 1px solid #444;
    padding: 5px;
    border-radius: 4px;
  }
`;

const SaveGuestsButton = styled.button`
  margin-top: 20px;
  margin-right: 10px;
  background-color: #9370db;
  border: none;
  padding: 10px 15px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #7a5fc7;
  }
`;

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const [newGuests, setNewGuests] = useState<
    { fullName: string; age: number; email: string }[]
  >([]);
  const axiosInstance = useAxiosWithAuth();
  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewGuestRow = () => {
    setNewGuests([...newGuests, { fullName: "", age: 0, email: "" }]);
  };

  const handleGuestChange = (
    index: number,
    field: keyof (typeof newGuests)[0],
    value: string | number
  ) => {
    const updatedGuests = [...newGuests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value,
    };
    setNewGuests(updatedGuests);
  };

  // Example usage
  const sendGuestEmail = async (
    toEmail: string,
    qrContent: string,
    eventDetails: Event
  ) => {
    const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrContent
    )}&size=150x150`;
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Event Ticket</title>
        <style>
          
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          a {
            text-decoration: none;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          }

         
          .header {
            background-color: #9370db;
            color: #fff;
            text-align: center;
            padding: 20px;
            font-size: 1.5rem;
          }

          /* Event Details */
          .content {
            padding: 20px;
            text-align: center;
          }
          .content p {
            font-size: 1rem;
            line-height: 1.6;
            margin: 10px 0;
          }

          .details {
            margin: 20px 0;
          }

          .details strong {
            color: #9370db;
          }

          /* QR Code */
          .qr-code {
            margin: 20px auto;
            text-align: center;
          }
          .qr-code img {
            width: 200px;
            height: 200px;
            border: 5px solid #f4c430;
            border-radius: 8px;
          }

          /* Footer */
          .footer {
            background-color: #f4c430;
            color: #333;
            text-align: center;
            padding: 10px;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
        
          <div class="header">
            🎉 Your Ticket for <strong>${eventDetails.title}</strong>
          </div>

       
          <div class="content">
            <p>${eventDetails.description}</p>
            <div class="details">
              <p><strong>Date:</strong> ${new Date(
                eventDetails.date
              ).toLocaleString()}</p>
            </div>

         
            <div class="qr-code">
              <img src="${qrCodeBase64}" alt="Your QR Code" />
            </div>
            <p>Please show this QR code at the event for entry.</p>
          </div>

        
          <div class="footer">
            See you there! 🎟 <br />
            Preemly Team
          </div>
        </div>
      </body>
    </html>
    `;

    await axiosInstance.post(`/mail`, {
      recipient: toEmail,
      subject: `Your ticket for ${eventDetails.title}`,
      htmlContent: htmlContent,
    });
  };

  const sendEmailsToGuests = async () => {
    if (!event || event.guests.length === 0) {
      console.warn("No guests to send emails to.");
      return;
    }

    try {
      console.log(event.date);
      for (const guest of event.guests) {
        const qrContent = guest._id.toString(); // Encoding the guest's ID for now

        await sendGuestEmail(guest.email, qrContent, event);
      }

      alert("Emails sent successfully to all guests!");
    } catch (error) {
      console.error("Error sending emails to guests:", error);
      alert("Failed to send some or all emails.");
    }
  };

  const saveGuests = async () => {
    try {
      await axiosInstance.post(`/events/${id}/guests`, {
        guests: newGuests,
      });
      fetchEvent();
      setNewGuests([]);
    } catch (error) {
      console.error("Error saving guests:", error);
    }
  };
  const deleteEvent = async () => {
    try {
      await axiosInstance.delete(`/events/${id}`);
      navigate("/events");
    } catch (error) {
      console.error("Error saving guests:", error);
    }
  };
  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingMessage>Loading event details...</LoadingMessage>;
  if (!event) return <LoadingMessage>Event not found.</LoadingMessage>;

  return (
    <PageWrapper>
      <Header>
        <BackButton
          onClick={() => {
            navigate("/events");
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 25 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.5 3L3.7 17L20.5 31"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BackButton>
        {event.title}
        <DeleteButton onClick={deleteEvent}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 7H15.5M8.5 7H6.5M8.5 7C8.5 7 8.5 3.5 12 3.5C15.5 3.5 15.5 7 15.5 7M15.5 7H17.5M4.5 7H6.5M6.5 7V18.5C6.5 19.6046 7.39543 20.5 8.5 20.5H15.5C16.6046 20.5 17.5 19.6046 17.5 18.5V7M17.5 7H19.5M14 9.5V17.5M10 9.5V17.5"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </DeleteButton>
      </Header>

      {event.poster && (
        <PosterImage src={`${event.poster}`} alt={`${event.title} poster`} />
      )}
      <EventDetailsWrapper>
        <EventDetails>
          <h3 style={{ color: "#f4c430" }}>Description</h3>
          <p>{event.description}</p>
        </EventDetails>
        <GuestsWrapper>
          <h3 style={{ color: "#f4c430" }}>Guests</h3>
          {event.guests.length === 0 ? (
            <p style={{ color: "#777" }}>No guests for this event.</p>
          ) : (
            <GuestList>
              {event.guests.map((guest) => (
                <li key={guest.id}>
                  {guest.fullName} ({guest.age} years old)
                </li>
              ))}
            </GuestList>
          )}
        </GuestsWrapper>
      </EventDetailsWrapper>

      <AddGuestButton onClick={addNewGuestRow}>Add Guest</AddGuestButton>
      {newGuests.length > 0 && (
        <>
          <GuestTable>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {newGuests.map((guest, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={guest.fullName}
                      onChange={(e) =>
                        handleGuestChange(index, "fullName", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={guest.age}
                      onChange={(e) =>
                        handleGuestChange(index, "age", Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) =>
                        handleGuestChange(index, "email", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </GuestTable>
          <SaveGuestsButton onClick={saveGuests}>Save Guests</SaveGuestsButton>
        </>
      )}
      <SaveGuestsButton onClick={sendEmailsToGuests}>
        Send Email
      </SaveGuestsButton>

      <AddGuestButton onClick={() => setModalOpen(true)}>
        Upload Poster
      </AddGuestButton>
      <CSVUploader eventId={event._id} onGuestsAdded={console.log} />
      {isModalOpen && (
        <PosterUploadModal
          eventId={id!}
          initialPoster={event.poster}
          onClose={() => setModalOpen(false)}
          onPosterUpdated={fetchEvent}
        />
      )}
    </PageWrapper>
  );
};

export default EventDetail;

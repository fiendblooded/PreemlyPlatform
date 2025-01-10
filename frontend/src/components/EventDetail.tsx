import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Event } from "../types";
// import QRCode from "qrcode";
import PosterUploadModal from "./PosterUploadModal";
// import CSVUploader from "./CSVUploader";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import TopBar from "./TopBar";
import {
  ActiveStatusContainer,
  ActiveStatusButton,
  SearchIcon,
} from "./Events";
import { getDateRangeDetails } from "../common/common";
import ToastNotification from "./ToastNotification";
// import sendEmail from "../mailgunService";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 70%;
  margin: 0px auto;
  color: black; /* Yellow */
  display: flex;
  justify-content: space-between;
  text-align: center;
  font-weight: bold;
  display: flex;
  font-size: 40px;
  align-items: center;
`;
const PosterImage = styled.img`
  width: 70%;
  margin: auto;
  height: auto;
  max-height: 450px;
  margin-top: 90px;
  border-radius: 8px;
  margin-bottom: 20px;
  object-fit: cover; /* Ensure the image scales nicely */
`;
const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
`;

const EventDetails = styled.div`
  flex: 1;

  background-color: white;
  color: black;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const GuestsWrapper = styled.div`
  width: 70%;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  height: 500px; /* Adjust to limit height */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  max-width: 400px;
  margin-top: 20px;

  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  /* Highlight the container when the input inside is focused */
  &:focus-within {
    border-color: #f4c430; /* Yellow border */
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const ScrollableTable = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border-left: 1px solid #ddd;
  border-radius: 4px;
  color: black;
  padding: 20px;
  padding-top: 0px;
  margin: 0 auto;
  margin-top: 20px;

  /* Subtle Scrollbar Styling */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: #c8c8c8 #f7f7f7; /* Thumb and Track colors for Firefox */

  ::-webkit-scrollbar {
    width: 8px; /* Slimmer scrollbar */
  }

  ::-webkit-scrollbar-thumb {
    background-color: #c8c8c8; /* Soft grey thumb */
    border-radius: 4px; /* Rounded corners for thumb */
    border: 1px solid #f7f7f7; /* Light border to blend into the track */
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #b5b5b5; /* Slightly darker grey on hover */
  }

  ::-webkit-scrollbar-track {
    background-color: #f7f7f7; /* Very light grey track */
    border-radius: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
      padding: 12px 16px;
      text-align: left;
    }

    th {
      background-color: #f7f7f7; /* Light grey header background */
      position: sticky;
      top: 0;
      z-index: 900;
      font-weight: bold;
      color: #333; /* Dark grey text */
      text-transform: uppercase;
      font-size: 0.85rem;
      border-bottom: 1px solid #ddd; /* Subtle border for separation */
    }

    td {
      background-color: #fff; /* White row background */
      border-bottom: 1px solid #ddd; /* Subtle border between rows */
      vertical-align: middle;
    }

    tr:hover {
      background-color: #f3f3f3; /* Slightly darker grey on hover */
    }

    td input {
      color: black;
      width: 90%;
      padding: 8px;
      border: 1px solid #ccc; /* Subtle grey border */
      border-radius: 4px;
      font-size: 0.9rem;
      background-color: #f9f9f9; /* Light grey background for inputs */
    }
  }
`;

const LoadingMessage = styled.p`
  color: #bbb;
  font-size: 1rem;
  text-align: center;
`;

const GuestTableHeaderContainer = styled.div`
  padding: 0px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const AddGuestButton = styled.button<{ marginTop?: number }>`
  width: 160px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: #f4c430;
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ffd700;
  }
`;
const DeleteButton = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  border: 1.5px solid rgb(102, 102, 102);
  color: rgb(102, 102, 102);
  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: rgb(102, 102, 102);
    color: white;
  }
`;

const SaveGuestsButton = styled.button<{ marginTop?: number }>`
  width: 160px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: #9370db;
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121212;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #7a5fc7;
  }
`;
const DetailsHeader = styled.div`
  width: 70%;

  color: rgb(98, 98, 98); /* Yellow */
  display: flex;
  gap: 10px;
  text-align: center;

  display: flex;
  font-size: 36px;
  align-items: center;
  margin: 0px auto;
`;

const ActivityStatus = styled.div`
  color: rgb(69, 158, 127);
  font-size: 14px;
  width: 80px;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  background-color: rgb(196, 254, 234);
`;
const DateTime = styled.div`
  display: flex;
  align-items: end;
  font-weight: 500;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  line-height: 100%;
`;
const GuestActionsButtonsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [openSection, setOpenSection] = useState("info");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>(""); // For text filtering
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
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
      for (const guest of event.guests) {
        const qrContent = guest._id.toString(); // Encoding the guest's ID for now

        await sendGuestEmail(guest.email, qrContent, event);
      }

      setToastMessage(`Emails sent successfully to all guests!`);
      setToastVisible(true);

      // Hide the toast after 5 seconds
      setTimeout(() => {
        setToastVisible(false);
        setToastMessage(null);
      }, 3002);
    } catch (error) {
      console.error("Error sending emails to guests:", error);
      setToastMessage("Failed to send some or all emails.");
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
        setToastMessage(null);
      }, 3002);
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
  const filteredGuests = event?.guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
      guest.email.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <PageWrapper>
      <TopBar sectionTitle="Events" showBackButton={true} />

      {event.poster && (
        <PosterImage src={`${event.poster}`} alt={`${event.title} poster`} />
      )}
      <Header>
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
              strokeWidth={1.5}
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </DeleteButton>
      </Header>
      <DetailsHeader>
        <ActivityStatus>Active</ActivityStatus>
        <DateTime>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 11C14.2386 11 12 13.2386 12 16C12 18.7614 14.2386 21 17 21C19.7614 21 22 18.7614 22 16C22 13.2386 19.7614 11 17 11ZM17 11V9M2 9V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.0799 19 5.2 19H13M2 9V8.2C2 7.0799 2 6.51984 2.21799 6.09202C2.40973 5.71569 2.71569 5.40973 3.09202 5.21799C3.51984 5 4.0799 5 5.2 5H13.8C14.9201 5 15.4802 5 15.908 5.21799C16.2843 5.40973 16.5903 5.71569 16.782 6.09202C17 6.51984 17 7.0799 17 8.2V9M2 9H17M5 3V5M14 3V5M15 16H17M17 16H19M17 16V14M17 16V18"
              stroke="rgb(98, 98, 98)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Created: {new Date(event.date).toLocaleString()}
        </DateTime>
      </DetailsHeader>

      <ActiveStatusContainer isDetail>
        <ActiveStatusButton
          marginLeft={0}
          isActive={openSection === "info"}
          onClick={() => setOpenSection("info")}
        >
          Overview
        </ActiveStatusButton>
        <ActiveStatusButton
          isActive={openSection === "attendance"}
          onClick={() => setOpenSection("attendance")}
        >
          Guests
        </ActiveStatusButton>
        <ActiveStatusButton
          isActive={openSection === "location"}
          onClick={() => setOpenSection("location")}
        >
          Location
        </ActiveStatusButton>
      </ActiveStatusContainer>
      {openSection === "info" && (
        <EventDetailsWrapper>
          <EventDetails>
            <div
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: "4px" }}
            >
              About this event
            </div>
            <div>{event.description}</div>
          </EventDetails>
          <EventDetails>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: "4px",
                display: "flex",
                alignItems: "end",
                lineHeight: "24px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div style={{ marginBottom: "-2px", marginLeft: "4px" }}>
                Date and Time
              </div>
            </div>
            <div>
              {getDateRangeDetails(event.date, new Date().toDateString())}
            </div>
          </EventDetails>
        </EventDetailsWrapper>
      )}
      {openSection === "attendance" && (
        <>
          <GuestsWrapper>
            {/* Filter Input */}
            <GuestTableHeaderContainer>
              {" "}
              <SearchContainer>
                <SearchIcon
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="rgb(137, 137, 137)"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search by name or email..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </SearchContainer>
              <GuestActionsButtonsContainer>
                <SaveGuestsButton onClick={sendEmailsToGuests} marginTop={20}>
                  Send Emails
                </SaveGuestsButton>
                <AddGuestButton onClick={addNewGuestRow} marginTop={20}>
                  Add Guest
                </AddGuestButton>
              </GuestActionsButtonsContainer>
            </GuestTableHeaderContainer>

            {/* Scrollable Table */}
            <ScrollableTable>
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Age</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Placeholder for no guests */}
                  {filteredGuests?.length === 0 && newGuests.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No guests added yet. Press "Add Guest" to get started!
                      </td>
                    </tr>
                  )}

                  {/* Filtered Existing Guests */}
                  {filteredGuests?.map((guest) => (
                    <tr key={guest._id}>
                      <td>{guest.fullName}</td>
                      <td>{guest.age}</td>
                      <td>{guest.email}</td>
                      <td></td>
                    </tr>
                  ))}

                  {/* New Guests Being Added */}
                  {newGuests.map((guest, index) => (
                    <tr key={`new-${index}`}>
                      <td>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={guest.fullName}
                          onChange={(e) =>
                            handleGuestChange(index, "fullName", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Age"
                          value={guest.age}
                          onChange={(e) =>
                            handleGuestChange(
                              index,
                              "age",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          placeholder="Email"
                          value={guest.email}
                          onChange={(e) =>
                            handleGuestChange(index, "email", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <GuestActionsButtonsContainer>
                          <SaveGuestsButton onClick={() => saveGuests()}>
                            Add
                          </SaveGuestsButton>
                          <AddGuestButton
                            onClick={() => {
                              const reducedGuests = [...newGuests];
                              reducedGuests.splice(index, 1);
                              setNewGuests(reducedGuests);
                            }}
                          >
                            Cancel
                          </AddGuestButton>
                        </GuestActionsButtonsContainer>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>

            {/* Add Guest Button */}
          </GuestsWrapper>
        </>
      )}

      {isModalOpen && (
        <PosterUploadModal
          eventId={id!}
          initialPoster={event.poster}
          onClose={() => setModalOpen(false)}
          onPosterUpdated={fetchEvent}
        />
      )}
      <ToastNotification message={toastMessage} visible={toastVisible} />
    </PageWrapper>
  );
};

export default EventDetail;

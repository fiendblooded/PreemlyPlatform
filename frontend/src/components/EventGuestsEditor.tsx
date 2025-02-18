import React, { useState } from "react";
import styled from "styled-components";
import { Event } from "../types";
import { SearchIcon } from "./Events";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { getMailHtml } from "../common/common";

const GuestsWrapper = styled.div`
  width: 90%;
  max-height: 450px;
  overflow: hidden;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
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
    border-color: rgb(107, 61, 223); /* Yellow border */
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
  overflow-y: auto;
  border-left: 1px solid #ddd;
  border-radius: 4px;
  color: black;
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
      text-overflow: ellipsis;
    }

    tr:hover {
      background-color: #f3f3f3; /* Slightly darker grey on hover */
    }

    td input {
      color: black;
      padding: 8px;
      border: 1px solid #ccc; /* Subtle grey border */
      border-radius: 4px;
      font-size: 0.9rem;
      background-color: #f9f9f9; /* Light grey background for inputs */
    }

    td input[type="checkbox"] {
      padding: 0;
    }

    /* First column specific width */
    th:first-child,
    td:first-child {
      width: 24px;
      padding-bottom: 8px;
    }
  }
`;

const GuestTableHeaderContainer = styled.div`
  padding: 0px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const PrimaryButton = styled.button<{
  marginTop?: number;
  width?: number;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: rgb(107, 61, 223);
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(155, 119, 249);
  }
`;
export const SecondaryButton = styled.button<{
  marginTop?: number;
  width?: number;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: white;
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #875cf5;
  color: #875cf5;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgb(239, 233, 255);
  }
`;

export const GuestActionsButtonsContainer = styled.div<{ width?: number }>`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: start;
  ${(props) => props.width && `width: ${props.width}px;`}
`;

const StyledCheckbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #00aef0;
  border-radius: 4px;
  outline: none;
  cursor: pointer;

  background-color: transparent;

  &::after {
    content: "✓";
    width: 18px;
    height: 18px;
    color: white;
    font-size: 14px;
    line-height: 18px;
  }

  &:checked {
    background-color: #00aef0;
    border-color: #00aef0;
  }

  &:checked::after {
    width: 18px;
    height: 18px;
    content: "✓";
    color: white;
    font-size: 14px;
    display: block;
    text-align: center;
    line-height: 18px;
  }

  &:hover {
    border-color: rgb(0, 119, 166);
  }
`;

type Props = {
  event: Event;
  refetch: () => void;
};

const EventGuestsEditor: React.FC<Props> = ({ event, refetch }) => {
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();
  const [newGuests, setNewGuests] = useState<
    { fullName: string; age: number; email: string }[]
  >([]);
  const [filterText, setFilterText] = useState<string>("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]); // Selected guest IDs

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

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests((prevSelected) =>
      prevSelected.includes(guestId)
        ? prevSelected.filter((id) => id !== guestId)
        : [...prevSelected, guestId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGuests.length === event.guests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(event.guests.map((guest) => guest._id));
    }
  };

  const sendGuestEmail = async (
    guestName: string,
    toEmail: string,
    qrContent: string,
    eventDetails: Event
  ) => {
    const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrContent
    )}&size=150x150&color=00AFEF&bgcolor=FFFFFF`;

    const htmlContent = getMailHtml(
      guestName,
      qrCodeBase64,
      eventDetails.title,
      eventDetails.description,
      eventDetails.date
    );

    await axiosInstance.post(`/mail`, {
      recipient: toEmail,
      subject: `Your ticket for ${eventDetails.title}`,
      htmlContent: htmlContent,
    });
  };

  const sendEmailsToGuests = async () => {
    if (!selectedGuests.length) {
      console.warn("No guests selected to send emails to.");
      addToast("No guests selected to send emails to.", ToastType.INFO);
      return;
    }

    try {
      for (const guestId of selectedGuests) {
        const guest = event.guests.find((g) => g._id === guestId);
        if (guest) {
          const qrContent = guest._id.toString();
          await sendGuestEmail(
            guest.fullName,
            guest.email.toLowerCase(),
            qrContent,
            event
          );
          await axiosInstance.put(`/guests/${guestId}/emailstatus`);
        }
      }

      addToast(
        "Emails sent successfully to selected guests!",
        ToastType.SUCCESS
      );
    } catch (error) {
      console.error("Error sending emails to guests:", error);
      addToast("Failed to send some or all emails.", ToastType.ERROR);
    }

    setSelectedGuests([]);
    refetch();
  };

  const saveGuests = async () => {
    try {
      await axiosInstance.put(`/events/${event._id}/guests`, {
        guests: newGuests,
      });
      refetch();
      setNewGuests([]);
    } catch (error) {
      console.error("Error saving guests:", error);
    }
  };

  const deleteGuest = async (guestId: string) => {
    try {
      await axiosInstance.delete(`/guests/${guestId}`);
      refetch();
    } catch (error) {
      console.error("Error deleting guest:", error);
    }
  };

  const navigate = useNavigate();
  const filteredGuests = event?.guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
      guest.email.toLowerCase().includes(filterText.toLowerCase())
  );
  console.log(event.guests);
  return (
    <GuestsWrapper>
      <GuestTableHeaderContainer>
        <SearchContainer>
          <SearchIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                strokeLinecap="round"
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
          <SecondaryButton marginTop={20} onClick={sendEmailsToGuests}>
            Send Emails{" "}
            {selectedGuests.length ? `(${selectedGuests.length})` : null}
          </SecondaryButton>
          <PrimaryButton marginTop={20} onClick={addNewGuestRow}>
            + Add Guest
          </PrimaryButton>
        </GuestActionsButtonsContainer>
      </GuestTableHeaderContainer>

      <ScrollableTable>
        <table>
          <thead>
            <tr>
              <th>
                <StyledCheckbox
                  type="checkbox"
                  checked={
                    selectedGuests.length === event.guests.length &&
                    event.guests.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Email Sent</th>
              <th>Phone</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests?.map((guest) => (
              <tr key={guest._id}>
                <td>
                  <StyledCheckbox
                    type="checkbox"
                    checked={selectedGuests.includes(guest._id)}
                    onChange={() => toggleGuestSelection(guest._id)}
                  />
                </td>
                <td>{guest.fullName}</td>
                <td
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {guest.email}
                </td>
                <td
                  style={{
                    color: guest.email_sent ? "green" : "red",
                    fontWeight: "semibold",
                  }}
                >
                  {guest.email_sent ? "Sent" : "Not Sent"}
                </td>
                <td>{guest.phoneNumber}</td>
                <td>{guest.attendance_status ? "+" : "-"}</td>

                <td>
                  <PrimaryButton onClick={() => deleteGuest(guest._id)}>
                    Delete
                  </PrimaryButton>
                </td>
              </tr>
            ))}

            {newGuests.map((guest, index) => (
              <tr key={`new-${index}`}>
                <td>
                  <StyledCheckbox type="checkbox" disabled />
                </td>
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
                    type="email"
                    placeholder="Email"
                    value={guest.email}
                    onChange={(e) =>
                      handleGuestChange(index, "email", e.target.value)
                    }
                  />
                </td>
                <td></td>
                <td></td>
                <td>
                  <GuestActionsButtonsContainer>
                    <PrimaryButton width={80} onClick={saveGuests}>
                      Add
                    </PrimaryButton>
                    <SecondaryButton
                      width={80}
                      onClick={() => {
                        const reducedGuests = [...newGuests];
                        reducedGuests.splice(index, 1);
                        setNewGuests(reducedGuests);
                      }}
                    >
                      Cancel
                    </SecondaryButton>
                  </GuestActionsButtonsContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
      <Toasts />
    </GuestsWrapper>
  );
};

export default EventGuestsEditor;

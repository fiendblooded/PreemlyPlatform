import React, { useState } from "react";
import styled from "styled-components";
import { Event } from "../types";
import { SearchIcon } from "./Events";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { getMailHtml, SvgSC } from "../common/common";
import { ActivityStatus } from "./EventDetail";

const GuestsWrapper = styled.div`
  width: 90%;

  overflow: hidden;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
  max-width: 300px;
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
      background-color: #f9fbfc; /* Light grey header background */
      position: sticky;
      top: 0;
      z-index: 900;
      font-weight: bold;
      color: #56626c; /* Dark grey text */
      text-transform: uppercase;
      font-size: 0.85rem;
      border-bottom: 1px solid #ddd; /* Subtle border for separation */
    }

    td {
      border-bottom: 1px solid #ddd; /* Subtle border between rows */
      vertical-align: middle;
      text-overflow: ellipsis;
    }

    tr:hover {
      background-color: rgb(249, 244, 253); /* Ensure hover color applies */
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
  &:disabled {
    opacity: 0.8;
    border: 2px solid rgb(103, 103, 103);
    color: rgb(103, 103, 103);
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
const DeleteButton = styled.div`
  display: flex;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;

  background-color: rgb(173, 1, 1);
  color: white;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgb(234, 141, 141);
  }
`;
const SeletedGuestsSC = styled.div`
  height: 38px;
  color: black;

  display: flex;
  align-items: center;
`;
export const Panel = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1000;
  transition: opacity 0.3s ease, transform 0.3s ease;
`;
type Props = {
  event: Event;
  refetch: () => void;
};

const EventGuestsEditor: React.FC<Props> = ({ event, refetch }) => {
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();
  const [newGuests, setNewGuests] = useState<{
    fullName: string;
    age: number;
    email: string;
  } | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]); // Selected guest IDs

  const addNewGuestRow = () => {
    if (newGuests === null) {
      setNewGuests({ fullName: "", age: 0, email: "" });
    }
  };

  const handleGuestChange = (field: string, value: string | number) => {
    if (newGuests != null) {
      setNewGuests({
        ...newGuests,
        [field]: value,
      });
    }
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
    )}&size=320x320&color=000000&bgcolor=FFFFFF`;

    const htmlContent = getMailHtml(
      guestName,
      qrCodeBase64,
      eventDetails.title,
      event.poster || "",
      eventDetails.description,
      eventDetails.date,
      eventDetails.endDate,
      eventDetails.emailParams.parking,
      eventDetails.emailParams.scheduleSrc,
      eventDetails.emailParams.dining,
      event.location.address || ""
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

  const deleteSelectedGuests = async () => {
    try {
      for (const guestId of selectedGuests) {
        deleteGuest(guestId);
      }

      addToast(
        `${selectedGuests.length} Guests deleted successfully!`,
        ToastType.SUCCESS
      );
    } catch (error) {
      console.error("Error deleting some guests:", error);
      addToast("Error deleting some guests.", ToastType.ERROR);
    }

    setSelectedGuests([]);
    refetch();
  };

  const saveGuests = async () => {
    try {
      await axiosInstance.put(`/events/${event._id}/guests`, {
        guests: [newGuests],
      });
      refetch();
      setNewGuests(null);
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

  const filteredGuests = event?.guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
      guest.email.toLowerCase().includes(filterText.toLowerCase())
  );
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
          {newGuests === null && (
            <PrimaryButton marginTop={20} onClick={addNewGuestRow}>
              + Add Guest
            </PrimaryButton>
          )}
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
            {newGuests != null && (
              <tr>
                <td>
                  <StyledCheckbox type="checkbox" disabled />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newGuests.fullName}
                    onChange={(e) =>
                      handleGuestChange("fullName", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newGuests.email}
                    onChange={(e) => handleGuestChange("email", e.target.value)}
                  />
                </td>
                <td></td>
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
                        setNewGuests(null);
                      }}
                    >
                      Cancel
                    </SecondaryButton>
                  </GuestActionsButtonsContainer>
                </td>
              </tr>
            )}
            {filteredGuests?.map((guest) => (
              <tr
                key={guest._id}
                onClick={() => toggleGuestSelection(guest._id)}
              >
                <td>
                  <StyledCheckbox
                    type="checkbox"
                    checked={selectedGuests.includes(guest._id)}
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
                  <ActivityStatus
                    color={guest.email_sent ? "#2a9134" : "#e40000"}
                  >
                    {guest.email_sent ? "Sent" : "Not Sent"}
                  </ActivityStatus>
                </td>
                <td>{guest.phoneNumber || "-"}</td>
                <td>{guest.attendance_status ? "+" : "-"}</td>

                <td>
                  <DeleteButton onClick={() => deleteGuest(guest._id)}>
                    <SvgSC
                      width="24"
                      height="24"
                      size={24}
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
                    </SvgSC>
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
      <Toasts />
      {selectedGuests.length ? (
        <Panel>
          <SeletedGuestsSC>
            <b>{selectedGuests.length}</b>&nbsp;
            {selectedGuests.length > 1 ? "guests" : "guest"}&nbsp;selected
          </SeletedGuestsSC>

          <SecondaryButton
            onClick={deleteSelectedGuests}
            disabled={selectedGuests.length === 0}
          >
            Delete selected
          </SecondaryButton>

          <SecondaryButton
            onClick={sendEmailsToGuests}
            disabled={selectedGuests.length === 0}
          >
            Email selected
          </SecondaryButton>
        </Panel>
      ) : null}
    </GuestsWrapper>
  );
};

export default EventGuestsEditor;

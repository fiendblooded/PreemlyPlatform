import React, { useState } from "react";
import styled from "styled-components";
import { Event } from "../types/event";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { getMailHtml, SvgSC } from "../common/common";
import { saveAs } from "file-saver";
// import { ActivityStatus } from "./EventDetail";

interface Props {
  event: Event;
  refetch: () => void;
}

interface StyledProps {
  isTablet?: boolean;
  width?: number;
}

const GuestsWrapper = styled.div`
  width: 90%;
  overflow: hidden;
  margin: 20px auto;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`;

const GuestTableHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px 0;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #f9f9f9;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #888;
  pointer-events: none;
`;

const StyledCheckbox = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: rgb(107, 61, 223);
  background-color: white;
  border: 1.5px solid #aaa;
  color-scheme: light; /* Force light mode appearance */

  &:not(:checked) {
    background-color: transparent;
  }
`;

const ScrollableTable = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;

    th,
    td {
      padding: 14px 16px;
      text-align: left;
      vertical-align: middle;
    }

    th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
      position: sticky;
      top: 0;
      z-index: 10;
      white-space: nowrap;

      &:first-child {
        border-top-left-radius: 8px;
      }

      &:last-child {
        border-top-right-radius: 8px;
      }
    }

    tr {
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(107, 61, 223, 0.03);
      }

      &:not(:last-child) td {
        border-bottom: 1px solid #e9ecef;
      }
    }

    td {
      color: #333;

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;

        &:focus {
          border-color: rgb(107, 61, 223);
          box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
          outline: none;
        }
      }
    }
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgb(184, 28, 10);
    background-color: rgba(237, 72, 54, 0.1);
  }
`;

const ActivityStatus = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.color};
  background-color: ${(props) => props.color}15; /* 10% opacity */
`;


const ReminderStatus = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  border-radius: 4px;
  padding: 6px 8px;
  background-color: ${(props) => props.color}33; /* 20% opacity */
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .status-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .date-time {
    font-weight: 600;
    white-space: nowrap;
  }
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
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(107, 61, 223, 0.2);

  &:hover {
    background-color: rgb(126, 87, 231);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(107, 61, 223, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(107, 61, 223, 0.2);
  }

  &:disabled {
    background-color: #c5c5c5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
export const SecondaryButton = styled.button<{
  marginTop?: number;
  width?: number;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: white;
  border: 2px solid rgb(107, 61, 223);
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(107, 61, 223);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(107, 61, 223, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(107, 61, 223, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    border-color: #c5c5c5;
    color: #c5c5c5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ExcelButton = styled(SecondaryButton)`
  background-color: #217346; // Excel green
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  width: 180px;
  &:hover {
    background-color: #1e5e3e;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Add this component for the Excel icon
const ExcelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM14.25 21v-3H7.5v3zm0-4.5v-3.75H7.5v3.75zm0-5.25V7.5H7.5v3.75zm0-5.25V3H7.5v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3z" />
  </svg>
);

export const GuestActionsButtonsContainer = styled.div<{ width?: number }>`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: start;
  ${(props) => props.width && `width: ${props.width}px;`}
`;

const SeletedGuestsSC = styled.div`
  height: 38px;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: rgba(107, 61, 223, 0.08);
  border-radius: 8px;
  font-size: 15px;

  b {
    color: rgb(107, 61, 223);
    margin-right: 4px;
    font-size: 16px;
  }
`;
export const Panel = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  z-index: 1000;
  transition: all 0.3s ease;
  border: 1px solid rgba(107, 61, 223, 0.1);


  /* Add a subtle animation when the panel appears */
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  /* Add a subtle hover effect */
  &:hover {
    box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.18);
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 28px;
  border-radius: 8px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;

  @keyframes slideUp {
    to {
      transform: translateY(0);
    }
  }
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
`;

const DialogDescription = styled.p`
  color: #555;
  font-size: 15px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  font-family: "Axiforma", sans-serif;
  background-color: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const ReminderPreview = styled.div`
  background-color: rgba(107, 61, 223, 0.05);
  border: 1px solid rgba(107, 61, 223, 0.2);
  border-radius: 6px;
  padding: 14px;
  margin-top: 16px;
  color: #333;
  font-size: 15px;

  strong {
    color: rgb(107, 61, 223);
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

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

  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [daysBefore, setDaysBefore] = useState(1);
  const [reminderTime, setReminderTime] = useState("12:00"); // Default to noon
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [showDeleteGuestsDialog, setShowDeleteGuestsDialog] = useState(false);

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
      setSelectedGuests(event.guests.map((guest: Event['guests'][0]) => guest._id));
    }
  };

  const openSendEmailDialog = () => setShowSendEmailDialog(true);
  const closeSendEmailDialog = () => setShowSendEmailDialog(false);
  const openDeleteGuestsDialog = () => setShowDeleteGuestsDialog(true);
  const closeDeleteGuestsDialog = () => setShowDeleteGuestsDialog(false);

  const sendGuestEmails = async (selectedGuests: string[], eventDetails: Event) => {
    const emails = selectedGuests.map(guestId => {
      const guest = eventDetails.guests.find((g: Event['guests'][0]) => g._id === guestId);
      if (!guest) return null;

      const qrContent = guest._id.toString();
      const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrContent
      )}&size=320x320&color=000000&bgcolor=FFFFFF`;

      const parkingModule = {
        enabled: true,
        content: eventDetails.emailParams.parking.content
      };

      const scheduleModule = {
        enabled: true,
        content: eventDetails.emailParams.scheduleSrc.content
      };

      const diningModule = {
        enabled: true,
        content: eventDetails.emailParams.dining.content
      };

      const htmlContent = getMailHtml(
        guest.fullName,
        qrCodeBase64,
        eventDetails.title,
        eventDetails.poster || "",
        eventDetails.description,
        eventDetails.date,
        eventDetails.endDate,
        parkingModule,
        scheduleModule,
        diningModule,
        eventDetails.location.address || ""
      );

      return {
        recipient: guest.email.toLowerCase(),
        guestName: guest.fullName,
        qrCode: qrCodeBase64
      };
    }).filter(email => email !== null);

    await axiosInstance.post(`/mail`, {
      subject: `Reminder : Your ticket for ${eventDetails.title}`,
      htmlTemplate: getMailHtml(
        "{{guestName}}",
        "{{qrCode}}",
        eventDetails.title,
        eventDetails.poster || "",
        eventDetails.description,
        eventDetails.date,
        eventDetails.endDate,
        { enabled: true, content: eventDetails.emailParams.parking.content },
        { enabled: true, content: eventDetails.emailParams.scheduleSrc.content },
        { enabled: true, content: eventDetails.emailParams.dining.content },
        eventDetails.location.address || ""
      ),
      emails
    });
  };

  const sendEmailsToGuests = async () => {
    if (!selectedGuests.length) {
      console.warn("No guests selected to send emails to.");
      addToast("No guests selected to send emails to.", ToastType.INFO);
      return;
    }

    try {
      await sendGuestEmails(selectedGuests, event);
      
      // Обновляем статус отправки для всех гостей одним запросом
      await axiosInstance.post('/mail/update-status', {
        guestIds: selectedGuests
      });

      addToast(
        "Emails sent successfully to all selected guests!",
        ToastType.SUCCESS
      );
      
      setSelectedGuests([]);
      refetch();
      setShowSendEmailDialog(false);
    } catch (error) {
      console.error("Failed to send emails:", error);
      addToast(
        "Failed to send emails. Please try again.",
        ToastType.ERROR
      );
    }
  };

  const isEventInPast = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate < now;
  };

  const calculateReminderDate = () => {
    const eventDate = new Date(event.date);
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(eventDate.getDate() - daysBefore);

    // Set the time from the time input
    const [hours, minutes] = reminderTime.split(":").map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    return reminderDate;
  };

  // Open reminder dialog
  const openReminderDialog = () => {
    if (selectedGuests.length === 0) {
      addToast(
        "No guests selected to schedule reminder emails for.",
        ToastType.INFO
      );
      return;
    }
    setShowReminderDialog(true);
  };

  // Close reminder dialog
  const closeReminderDialog = () => {
    setShowReminderDialog(false);
  };

  // Schedule reminder emails with the calculated date
  const scheduleReminderEmails = async () => {
    if (!selectedGuests.length) {
      console.warn("No guests selected to schedule reminder emails for.");
      addToast(
        "No guests selected to schedule reminder emails for.",
        ToastType.INFO
      );
      return;
    }

    const reminderDate = calculateReminderDate();

    // Check if reminder date is in the past
    if (reminderDate < new Date()) {
      addToast("Reminder date cannot be in the past.", ToastType.ERROR);
      return;
    }


    // Prepare email data for each selected guest
    const emailsData = selectedGuests
      .map((guestId) => {
        const guest = event.guests.find((g: Event['guests'][0]) => g._id === guestId);
        if (!guest) return null;

        const qrContent = guest._id.toString();
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          qrContent
        )}&size=320x320&color=000000&bgcolor=FFFFFF`;

        const parkingModule = {
          enabled: true,
          content: event.emailParams.parking.content
        };

        const scheduleModule = {
          enabled: true,
          content: event.emailParams.scheduleSrc.content
        };

        const diningModule = {
          enabled: true,
          content: event.emailParams.dining.content
        };

        const htmlContent = getMailHtml(
          guest.fullName,
          qrCodeUrl,
          event.title,
          event.poster || "",
          event.description,
          event.date,
          event.endDate,
          parkingModule,
          scheduleModule,
          diningModule,
          event.location.address || ""
        );

        return {
          recipient: guest.email.toLowerCase(),
          htmlContent,
        };
      })
      .filter(Boolean); // Remove any null entries

    try {
      // Send the request to schedule reminder emails
      await axiosInstance.post("/mail/schedule-reminders", {
        eventId: event._id,
        guests: selectedGuests.map((id) => ({ guestId: id })),
        reminderTime: reminderDate.toISOString(),
        emailSubject: `Reminder: Your event "${event.title}" is coming up!`,
        emailsData,
      });

      // Update reminder_email_date for each guest
      for (const guestId of selectedGuests) {
        await axiosInstance.put(`/guests/${guestId}/reminder-date`, {
          reminderDate: reminderDate.toISOString(),
        });
      }

      addToast(
        `Reminder emails scheduled for ${
          selectedGuests.length
        } guests on ${reminderDate.toLocaleDateString()}`,
        ToastType.SUCCESS
      );
      setSelectedGuests([]);
      closeReminderDialog();
      refetch();
    } catch (error) {
      console.error("Error scheduling reminder emails:", error);
      addToast("Failed to schedule reminder emails.", ToastType.ERROR);
    }
  };

  // Format reminder date for display
  const formatReminderDate = (dateString?: string) => {
    if (!dateString) {
      return { status: "Not set", dateTime: "" };
    }

    const reminderDate = new Date(dateString);
    const now = new Date();

    const dateTimeStr = `${reminderDate.toLocaleDateString()} ${reminderDate.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    if (reminderDate < now) {
      return {
        status: "Sent on",
        dateTime: dateTimeStr,
      };
    } else {
      return {
        status: "Will be sent on",
        dateTime: dateTimeStr,
      };
    }
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
    closeDeleteGuestsDialog();
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

  const downloadGuestsExcel = async () => {
    try {
      const response = await axiosInstance.get(
        `/events/${event._id}/guests/export`,
        {
          responseType: "blob",
        }
      );


      // Create a filename with event name and date
      const fileName = `${event.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_guests.xlsx`;
    saveAs(new Blob([response.data]), fileName);

    addToast("Guest list downloaded successfully", ToastType.SUCCESS);
  } catch (error) {
    console.error("Error downloading guest list:", error);
    addToast("Failed to download guest list", ToastType.ERROR);
  }
};

const filteredGuests = event?.guests.filter(
  (guest: Event['guests'][0]) =>
    guest.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
    guest.email.toLowerCase().includes(filterText.toLowerCase())
);
console.log(event.guests);
return (
  <GuestsWrapper>
    <GuestTableHeaderContainer>
      <SearchContainer>
        <SearchIcon
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search by name or email..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </SearchContainer>

      <ButtonGroup>
        {event.guests.length && (
          <ExcelButton onClick={downloadGuestsExcel}>
            <ExcelIcon />
            Download Excel
          </ExcelButton>
        )}
        <PrimaryButton onClick={addNewGuestRow}>+ Add Guest</PrimaryButton>
      </ButtonGroup>
    </GuestTableHeaderContainer>

    <ScrollableTable>
      <table>
        <thead>
          <tr>
            <th>
              <StyledCheckbox
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
            <th>Reminder Email</th>
            <th>Phone</th>
            <th>Attendance</th>
            <th>GDPR Consent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {newGuests != null && (
            <tr>
              <td></td>
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
          {filteredGuests?.map((guest: Event['guests'][0]) => (
            <tr
              key={guest._id}
              onClick={() => toggleGuestSelection(guest._id)}
            >
              <td>
                <StyledCheckbox

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
<td>
{guest.reminder_email_date ? (
  <ReminderStatus
    color={
      new Date(guest.reminder_email_date) < new Date()
        ? "#2a9134" // Green for sent
        : "#00aef0" // Blue for scheduled
    }
  >
    <span className="status-text">
      {formatReminderDate(guest.reminder_email_date).status}
    </span>
    <span className="date-time">
      {formatReminderDate(guest.reminder_email_date).dateTime}
    </span>
  </ReminderStatus>
) : (
  <ReminderStatus color="#e40000">
    {" "}
    {/* Red for not set */}
    <span className="status-text">Not set</span>
  </ReminderStatus>
)}
</td>
<td>{guest.phoneNumber || "-"}</td>
<td>{guest.attendance_status ? "+" : "-"}</td>
<td>
<div style={{ textAlign: "center" }}>
  {guest.gdpr_consent ? (
    <span style={{ color: "#4caf50" }}>Yes</span>
  ) : (
    <span style={{ color: "#f44336" }}>No</span>
  )}
</div>
</td>
<td>
<DeleteButton
  onClick={(e) => {
    e.stopPropagation();
    deleteGuest(guest._id);
  }}
>
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
{/* Reminder Dialog */}
{showReminderDialog && (
<DialogOverlay onClick={closeReminderDialog}>
<DialogContent onClick={(e) => e.stopPropagation()}>
<DialogTitle>Schedule Reminder Emails</DialogTitle>
<DialogDescription>
Set when reminder emails should be sent to your guests. Choose how
many days before the event and at what time.
</DialogDescription>


<InputGroup>
              <Label htmlFor="daysBefore">Days before event:</Label>
              <Input
                id="daysBefore"
                type="number"
                min="1"
                max="30"
                value={daysBefore}
                onChange={(e) => setDaysBefore(parseInt(e.target.value) || 1)}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="reminderTime">Time of day:</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </InputGroup>

            <ReminderPreview>
              Reminder emails will be sent on:{" "}
              <strong>{calculateReminderDate().toLocaleDateString()}</strong> at{" "}
              <strong>
                {calculateReminderDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </ReminderPreview>

            <DialogButtons>
              <SecondaryButton onClick={closeReminderDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={scheduleReminderEmails} width={180}>
                Schedule Reminders
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
      {selectedGuests.length > 0 && (
        <Panel>
          <SeletedGuestsSC>
            <b>{selectedGuests.length}</b>
            {selectedGuests.length > 1 ? " guests" : " guest"} selected
          </SeletedGuestsSC>

          <SecondaryButton
            onClick={openDeleteGuestsDialog}
            disabled={selectedGuests.length === 0}
          >
            Delete selected
          </SecondaryButton>

          <SecondaryButton
            onClick={openSendEmailDialog}
            disabled={selectedGuests.length === 0}
          >
            Email selected
          </SecondaryButton>

          {!isEventInPast() && (
            <SecondaryButton
              onClick={openReminderDialog}
              disabled={selectedGuests.length === 0}
              width={180}
            >
              Set reminders
            </SecondaryButton>
          )}
        </Panel>
      )}
      {showSendEmailDialog && (
        <DialogOverlay onClick={closeSendEmailDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Send Emails to Selected Guests</DialogTitle>
            <DialogDescription>
              You are about to send event invitation emails to{" "}
              {selectedGuests.length} selected{" "}
              {selectedGuests.length === 1 ? "guest" : "guests"}. Each guest
              will receive a personalized email with event details and their
              unique QR code ticket.
            </DialogDescription>

            <DialogButtons>
              <SecondaryButton onClick={closeSendEmailDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={sendEmailsToGuests} width={180}>
                Send Emails
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
      {showDeleteGuestsDialog && (
        <DialogOverlay onClick={closeDeleteGuestsDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Delete Selected Guests</DialogTitle>
            <DialogDescription>
              You are about to delete {selectedGuests.length} selected{" "}
              {selectedGuests.length === 1 ? "guest" : "guests"} from this
              event. This action cannot be undone. Any scheduled emails for
              these guests will also be canceled.
            </DialogDescription>


            <DialogButtons>
              <SecondaryButton onClick={closeDeleteGuestsDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={deleteSelectedGuests}
                width={180}
                style={{ backgroundColor: "rgb(220, 53, 69)" }} // Red color for delete button
              >
                Delete Guests
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
    </GuestsWrapper>
  );
};

export default EventGuestsEditor;
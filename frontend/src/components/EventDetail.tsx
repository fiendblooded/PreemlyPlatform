import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Event } from "../types";
// import QRCode from "qrcode";
import PosterUploadModal from "./PosterUploadModal";
// import CSVUploader from "./CSVUploader";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import TopBar from "./TopBar";
import { ActiveStatusContainer, ActiveStatusButton } from "./Events";
import EventLocationEditor from "./EventLocationEditor";
import EventDetailsEditor from "./EventDetailsEditor";
import EventGuestsEditor from "./EventGuestsEditor";
import { getDateRangeDetails } from "../common/common";

export const PageWrapper = styled.div`
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

const LoadingMessage = styled.p`
  color: #bbb;
  font-size: 1rem;
  text-align: center;
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

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [openSection, setOpenSection] = useState("info");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false); // Modal state

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
          {getDateRangeDetails(event.date || "", event.endDate || "")}
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
        <EventDetailsEditor event={event} refetch={fetchEvent} />
      )}
      {openSection === "attendance" && (
        <EventGuestsEditor event={event} refetch={fetchEvent} />
      )}
      {openSection === "location" && (
        <EventLocationEditor event={event} refetch={fetchEvent} />
      )}

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

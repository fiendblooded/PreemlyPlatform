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
import {
  getDateRangeDetails,
  getDateTimeStatus,
  isTablet,
} from "../common/common";
import WelcomeScreenEditor from "./WelcomeScreenEditor";
import EventTasksEditor from "./EventTasksEditor";
import UserSearch from "./UserSearch";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 90%;
  margin: 0px auto;
  color: black; /* Yellow */
  display: flex;
  justify-content: space-between;
  text-align: left;
  font-weight: bold;
  display: flex;
  font-size: 40px;
  align-items: center;
`;
const ChangePosterModalButton = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 80px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(107, 61, 223);
  color: white;
  cursor: pointer;
  font-weight: bold;
  opacity: 0; /* Initially hidden */
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  &:hover {
    background-color: rgb(153, 115, 248);
  }
`;
const PosterImage = styled.div<{ imageUrl: string }>`
  width: 90%;
  min-height: 400px;
  max-height: 40%;
  margin: 20px auto;
  border-radius: 6px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;

  &:hover ${ChangePosterModalButton} {
    opacity: 1; /* Show the button on hover */
    visibility: visible;
  }
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

  &:disabled {
    background-color: rgb(
      169,
      169,
      169
    ); /* Light gray background for disabled */
    cursor: not-allowed; /* Change cursor to indicate it's disabled */
    opacity: 0.6; /* Optional: Reduce opacity */
  }
`;

const EventDetailWrapper = styled.div<{ tabletMode: boolean }>`
  width: ${(props) => (props.tabletMode ? "100%" : "75%")};
  height: ${(props) => (props.tabletMode ? "100%" : "90%")};
  max-height: ${(props) => (props.tabletMode ? "100%" : "90%")};
  margin: auto;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  /* Responsive style for tablet and mobile */
  @media (max-width: 1024px) {
    width: 100%;
    max-height: 100%;
    height: 100%;
  }
`;

export const SecondaryButton = styled.button<{
  marginTop?: number;
  width?: number;
  color?: string;
  hoverColor?: string;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: white;
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  border: 2px solid ${(props) => (props.color ? props.color : "#875cf5")};
  color: ${(props) => (props.color ? props.color : "#875cf5")};
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${(props) =>
      props.hoverColor ? props.hoverColor : "rgb(239, 233, 255)"};
    border: 2px solid ${(props) => (props.color ? props.color : "#875cf5")};
  }
`;
const DeleteButton = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  border: 1.5px solid rgb(173, 1, 1);
  color: rgb(173, 1, 1);
  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgb(173, 1, 1);
    color: white;
  }
`;

const WelcomeScreenButton = styled.div`
  display: flex;
  width: 130px;
  height: 40px;
  padding: 0;
  cursor: pointer;

  border-radius: 6px;
  background-color: transparent;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 1.5px solid #875cf5;
  color: #875cf5;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #875cf5;
    color: white;
  }
`;

const DetailsHeader = styled.div`
  width: 90%;

  color: rgb(98, 98, 98); /* Yellow */
  display: flex;
  gap: 10px;
  text-align: center;

  display: flex;
  font-size: 36px;
  align-items: center;
  margin: 0px auto;
`;

const ActivityStatus = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 14px;
  width: 80px;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  background-color: ${(props) => props.color}33; /* 20% opacity */
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
const SeamlessInput = styled.input`
  font-family: Axiforma, sans-serif;
  font-size: 32px;
  line-height: 34px;
  font-weight: bold;
  max-width: 90%;
  text-overflow: ellipsis;
  color: black;
  background-color: transparent;
  border: none;
  outline: none;
  width: 80%;
  padding: 4px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid transparent;
  &:focus {
    border-bottom: 1px solid black;
  }

  &::placeholder {
    color: #aaa; /* Optional: Adjust placeholder color */
  }
`;
const HeaderButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [openSection, setOpenSection] = useState("info");
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState(event?.title);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const tabletMode = isTablet();
  // const [isModalVisible, setIsModalVisible] = useState(false);

  // const handleAnswerOne = () => {
  //   console.log("Answer One selected");
  //   setIsModalVisible(false); // Close the modal after handling
  // };

  // const handleAnswerTwo = () => {
  //   console.log("Answer Two selected");
  //   setIsModalVisible(false); // Close the modal after handling
  // };

  const axiosInstance = useAxiosWithAuth();
  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
      const fetchedEvent = response.data.data;
      setEvent(fetchedEvent);
      setTitle(fetchedEvent.title); // Use fetched event data directly
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
  const updateTitle = async () => {
    await axiosInstance.put(`/events/${event?._id}`, {
      ...event,
      title,
    });
    fetchEvent();
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const dateTimeStatus = getDateTimeStatus(event?.date, event?.endDate);
  if (loading) return <LoadingMessage>Loading event details...</LoadingMessage>;
  if (!event) return <LoadingMessage>Event not found.</LoadingMessage>;
  return (
    <PageWrapper>
      <TopBar sectionTitle="Events" showBackButton={true} />
      <EventDetailWrapper tabletMode={tabletMode}>
        {event.poster && (
          <PosterImage imageUrl={`${event.poster}`}>
            <ChangePosterModalButton onClick={() => setModalOpen(true)}>
              Edit
            </ChangePosterModalButton>
          </PosterImage>
        )}
        <Header>
          <SeamlessInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title != event?.title) updateTitle();
            }}
          />
          <HeaderButtonsContainer>
            <WelcomeScreenButton
              onClick={() => navigate(`/welcome/${event._id}`)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12H4.01M8 12H8.01M16 12H16.01M12 12H12.01M20 12H20.01M8.5 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V8.5M15.5 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.07989 20 7.2V8.5M20 15.5V16.8C20 17.9201 20 18.4802 19.782 18.908C19.5903 19.2843 19.2843 19.5903 18.908 19.782C18.4802 20 17.9201 20 16.8 20H15.5M4 15.5V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H8.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div style={{ paddingTop: 4, marginLeft: 2 }}>Check in</div>
            </WelcomeScreenButton>
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
          </HeaderButtonsContainer>
        </Header>
        <DetailsHeader>
          <ActivityStatus color={dateTimeStatus.color}>
            {dateTimeStatus.type}
          </ActivityStatus>
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
            borderColor="#e6bf30"
          >
            Details
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={openSection === "tasks"}
            onClick={() => setOpenSection("tasks")}
            borderColor="#e6bf30"
          >
            Tasks
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={openSection === "attendance"}
            onClick={() => setOpenSection("attendance")}
            borderColor="#e6bf30"
          >
            Guests
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={openSection === "location"}
            onClick={() => setOpenSection("location")}
            borderColor="#e6bf30"
          >
            Location
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={openSection === "welcome"}
            onClick={() => setOpenSection("welcome")}
            borderColor="#e6bf30"
          >
            Welcome Screen
          </ActiveStatusButton>
          <ActiveStatusButton
            isActive={openSection === "collaborators"}
            onClick={() => setOpenSection("collaborators")}
            borderColor="#e6bf30"
          >
            Collaborators
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
        {openSection === "welcome" && (
          <WelcomeScreenEditor event={event} refetch={fetchEvent} />
        )}
        {openSection === "tasks" && (
          <EventTasksEditor event={event} refetch={fetchEvent} />
        )}
        {openSection === "collaborators" && <UserSearch />}

        {isModalOpen && (
          <PosterUploadModal
            eventId={id!}
            initialPoster={event.poster}
            onClose={() => setModalOpen(false)}
            onPosterUpdated={fetchEvent}
          />
        )}
      </EventDetailWrapper>
    </PageWrapper>
  );
};

export default EventDetail;

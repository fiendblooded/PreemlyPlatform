import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Event } from "../types";
import { getMailHtml, isTablet } from "../common/common";
import EmailSection from "./EmailSection";
import GuestsSettingsIcon from "./icons/GuestsSettingsIcon";
import ScheduleIcon from "./icons/ScheduleIcon";
import DiningIcon from "./icons/DiningIcon";
import ParkingIcon from "./icons/ParkingIcon";
import { PrimaryButton, SecondaryButton } from "./EventDetail";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Panel } from "./EventGuestsEditor";

const Container = styled.div<{ isTablet: boolean }>`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 16px;
  width: calc(90% - 32px);
  margin: 20px auto;
  display: flex;
  flex-direction: ${(props) => (props.isTablet ? "column-reverse" : "row")};

  ${(props) => !props.isTablet && "height: 800px;"}
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  overflow: hidden;
`;

const EmailSectionsContainer = styled.div<{ isTablet: boolean }>`
  ${(props) => (!props.isTablet ? "flex: 2;" : "width: 100%;")}
  display: flex;
  max-height: 100%;

  box-sizing: border-box;
  justify-content: space-between;
  gap: 20px;
  flex-direction: column;
  color: black;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
`;
const IframeContainer = styled.div<{ isTablet: boolean }>`
  ${(props) => (props.isTablet ? "width: 100%;" : "flex: 3; height: 100%;")}
  display: flex;
  position: relative;
`;

const StyledIframe = styled.div`
  flex: 3;
  height: 100%;
  overflow-y: auto;
  background-color: #eeedf2;
  padding: 20px;
  box-sizing: border-box;
  scrollbar-gutter: stable;
  /* Subtle Scrollbar Styling */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: #c8c8c8 #f7f7f7; /* Thumb and Track colors for Firefox */

  ::-webkit-scrollbar {
    width: 8px; /* Slimmer scrollbar */
    position: absolute;
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
`;

type Props = {
  event: Event;
  refetch: () => void;
};

export type EmailExtraModule = {
  enabled: boolean;
  content: string;
};

const EmailTemplateEditor: React.FC<Props> = ({ event, refetch }) => {
  const [parking, setParking] = useState<EmailExtraModule>({
    enabled: event?.emailParams?.parking?.enabled || false,
    content: event?.emailParams?.parking?.content || "",
  });
  const [schedule, setSchedule] = useState<EmailExtraModule>({
    enabled: event?.emailParams?.scheduleSrc?.enabled || false,
    content: event?.emailParams?.scheduleSrc?.content || "",
  });
  const [dining, setDining] = useState<EmailExtraModule>({
    enabled: event?.emailParams?.dining?.enabled || false,
    content: event?.emailParams?.dining?.content || "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  const axiosInstance = useAxiosWithAuth();
  const tabletMode = isTablet();
  useEffect(() => {
    const hasParking =
      JSON.stringify(parking) !== JSON.stringify(event?.emailParams?.parking);
    const hasSchedule =
      JSON.stringify(schedule) !==
      JSON.stringify(event?.emailParams?.scheduleSrc);
    const hasDining =
      JSON.stringify(dining) !== JSON.stringify(event?.emailParams?.dining);

    setHasChanges(hasParking || hasSchedule || hasDining);
  }, [parking, schedule, dining, event?.emailParams]);

  const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    "123467474"
  )}&size=320x320&color=000000&bgcolor=FFFFFF`;

  const htmlContent = getMailHtml(
    "John Doe",
    qrCodeBase64,
    event.title,
    event.poster || "",
    event.description,
    event.date,
    event.endDate,
    parking,
    schedule,
    dining,
    event.location.address || "",
    false
  );

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        emailParams: {
          parking,
          scheduleSrc: schedule,
          dining,
        },
      });
      refetch();
      // Optionally, show a success message to the user
      console.log("Email template saved successfully");
    } catch (error) {
      console.error("Error saving email template:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };
  const handleCancel = () => {
    setParking({
      enabled: event?.emailParams?.parking?.enabled || false,
      content: event?.emailParams?.parking?.content || "",
    });
    setSchedule({
      enabled: event?.emailParams?.scheduleSrc?.enabled || false,
      content: event?.emailParams?.scheduleSrc?.content || "",
    });
    setDining({
      enabled: event?.emailParams?.dining?.enabled || false,
      content: event?.emailParams?.dining?.content || "",
    });
    setHasChanges(false);
  };

  return (
    <Container isTablet={tabletMode}>
      <IframeContainer isTablet={tabletMode}>
        <StyledIframe dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </IframeContainer>
      <EmailSectionsContainer isTablet={tabletMode}>
        Set up additional sections
        <EmailSection
          icon={<ParkingIcon />}
          title={"Parking"}
          enable={parking.enabled}
          setEnable={() =>
            setParking({ ...parking, enabled: !parking.enabled })
          }
          content={parking.content}
          setContent={(newContent) =>
            setParking({ ...parking, content: newContent })
          }
        />
        <EmailSection
          icon={<ScheduleIcon />}
          title={"Schedule"}
          enable={schedule.enabled}
          setEnable={() =>
            setSchedule({ ...schedule, enabled: !schedule.enabled })
          }
          content={schedule.content}
          setContent={(newContent) =>
            setSchedule({ ...schedule, content: newContent })
          }
        />
        <EmailSection
          icon={<DiningIcon />}
          title={"Dining"}
          enable={dining.enabled}
          setEnable={() => setDining({ ...dining, enabled: !dining.enabled })}
          content={dining.content}
          setContent={(newContent) =>
            setDining({ ...dining, content: newContent })
          }
        />
      </EmailSectionsContainer>
      {hasChanges ? (
        <Panel>
          <SecondaryButton onClick={handleCancel} disabled={!hasChanges}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={!hasChanges}>
            Save
          </PrimaryButton>
        </Panel>
      ) : null}
    </Container>
  );
};

export default EmailTemplateEditor;

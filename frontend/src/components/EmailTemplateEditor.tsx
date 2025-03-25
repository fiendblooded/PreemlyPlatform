import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Event, ScheduleItem } from "../types";
import { getMailHtml, isTablet } from "../common/common";
import EmailSection from "./EmailSection";
import ScheduleIcon from "./icons/ScheduleIcon";
// import DiningIcon from "./icons/DiningIcon";
import ParkingIcon from "./icons/ParkingIcon";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Panel } from "./EventGuestsEditor";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

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
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  overflow: hidden;
  min-height: 800px;
`;

const EmailSectionsContainer = styled.div<{
  isTablet: boolean;
  isCustomTemplate: boolean;
}>`
  ${(props) => (!props.isTablet ? "width: 45%;" : "width: 100%;")}
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

const IframeContainer = styled.div<{
  isTablet: boolean;
  isCustomTemplate: boolean;
}>`
  ${(props) => (!props.isTablet ? "width: 55%;" : "width: 100%;")}
  display: flex;
  position: relative;
  height: 100%;
  min-height: 700px;
`;

// Replace the StyledIframe div with an actual iframe to isolate styles
const StyledIframeWrapper = styled.div`
  flex: 1;
  height: 100%;
  background-color: #eeedf2;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 4px;
`;

const SectionContainer = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const HeaderTitle = styled.div`
  font-weight: bold;
  font-size: 20px;
`;

const EditorContainer = styled.div`
  height: 650px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`;

const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
`;

const EditorContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const InfoBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: normal;
  color: #495057;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: #2196f3;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleLabel = styled.div`
  font-size: 14px;
  font-weight: normal;
  color: #333;
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ToolbarButton = styled.button`
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &:active {
    background-color: #e8e8e8;
  }
`;

const PlaceholderButton = styled(ToolbarButton)`
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;

  &:hover {
    background-color: #bae7ff;
  }

  &:active {
    background-color: #91d5ff;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  margin-top: 10px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  background-color: #fff;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

type Props = {
  event: Event;
  refetch: () => void;
};

// Add a VirtualSpaceIcon component
const VirtualSpaceIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color: "black" }}
  >
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.6001 9H20.4001"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.6001 15H20.4001"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 20.7999C14.2091 20.7999 16 16.8375 16 11.9999C16 7.16236 14.2091 3.19995 12 3.19995C9.79086 3.19995 8 7.16236 8 11.9999C8 16.8375 9.79086 20.7999 12 20.7999Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type EmailExtraModule = {
  enabled: boolean;
  content: string;
  items?: ScheduleItem[];
};

export type CustomHtmlTemplate = {
  enabled: boolean;
  content: string;
};

const EmailTemplateEditor: React.FC<Props> = ({ event, refetch }) => {
  // Create a deep copy of the event's emailParams to avoid reference issues
  const eventEmailParams = JSON.parse(JSON.stringify(event?.emailParams || {}));

  // Ensure all properties exist with default values if they don't
  const defaultEmailParams = {
    parking: { enabled: false, content: "" },
    scheduleSrc: { enabled: false, content: "", items: [] },
    dining: { enabled: false, content: "" },
    customHtmlTemplate: { enabled: false, content: "" },
    virtualSpace: { enabled: false },
    emailIdentifier: "",
  };

  // Merge default values with actual values
  const normalizedEmailParams = {
    ...defaultEmailParams,
    ...eventEmailParams,
    // Ensure nested objects are properly initialized
    parking: { ...defaultEmailParams.parking, ...eventEmailParams.parking },
    scheduleSrc: {
      ...defaultEmailParams.scheduleSrc,
      ...eventEmailParams.scheduleSrc,
      items: eventEmailParams.scheduleSrc?.items || [],
    },
    dining: { ...defaultEmailParams.dining, ...eventEmailParams.dining },
    customHtmlTemplate: {
      ...defaultEmailParams.customHtmlTemplate,
      ...eventEmailParams.customHtmlTemplate,
    },
    virtualSpace: {
      ...defaultEmailParams.virtualSpace,
      ...eventEmailParams.virtualSpace,
    },
    emailIdentifier: eventEmailParams.emailIdentifier || "",
  };

  const [parking, setParking] = useState<EmailExtraModule>(
    normalizedEmailParams.parking
  );
  const [schedule, setSchedule] = useState<EmailExtraModule>(
    normalizedEmailParams.scheduleSrc
  );
  const [dining, setDining] = useState<EmailExtraModule>(
    normalizedEmailParams.dining
  );
  const [customTemplate, setCustomTemplate] = useState<CustomHtmlTemplate>(
    normalizedEmailParams.customHtmlTemplate
  );
  const [virtualSpace, setVirtualSpace] = useState<{ enabled: boolean }>(
    normalizedEmailParams.virtualSpace
  );
  const [emailIdentifier, setEmailIdentifier] = useState<string>(
    normalizedEmailParams.emailIdentifier
  );
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const axiosInstance = useAxiosWithAuth();
  const tabletMode = isTablet();

  useEffect(() => {
    // Compare current state with normalized event data
    const hasParking =
      JSON.stringify(parking) !== JSON.stringify(normalizedEmailParams.parking);
    const hasSchedule =
      JSON.stringify(schedule) !==
      JSON.stringify(normalizedEmailParams.scheduleSrc);
    const hasDining =
      JSON.stringify(dining) !== JSON.stringify(normalizedEmailParams.dining);
    const hasCustomTemplate =
      JSON.stringify(customTemplate) !==
      JSON.stringify(normalizedEmailParams.customHtmlTemplate);
    const hasVirtualSpace =
      JSON.stringify(virtualSpace) !==
      JSON.stringify(normalizedEmailParams.virtualSpace);
    const hasEmailIdentifier =
      emailIdentifier !== normalizedEmailParams.emailIdentifier;

    setHasChanges(
      hasParking ||
        hasSchedule ||
        hasDining ||
        hasCustomTemplate ||
        hasVirtualSpace ||
        hasEmailIdentifier
    );
  }, [
    parking,
    schedule,
    dining,
    customTemplate,
    virtualSpace,
    emailIdentifier,
    event?.emailParams,
  ]);

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
    false,
    customTemplate.enabled ? customTemplate.content : undefined,
    virtualSpace.enabled
      ? `https://platform.preemly.eu/space/${event._id}`
      : undefined
  );

  // Update iframe content when htmlContent changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Add styles to make content fit properly in the iframe
        const style = doc.createElement("style");
        style.textContent = `
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
            width: 100%;
          }
          table {
            max-width: 100%;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        `;
        doc.head.appendChild(style);
      }
    }
  }, [htmlContent]);

  const handleSave = async () => {
    try {
      const requestData = {
        ...event,
        emailParams: {
          ...event.emailParams,
          customHtmlTemplate: customTemplate,
          parking,
          scheduleSrc: {
            ...event.emailParams.scheduleSrc,
            enabled: schedule.enabled,
            content: schedule.content,
            items: schedule.items || [],
          },
          dining,
          virtualSpace,
          emailIdentifier,
        },
      };

      console.log("Request data:", JSON.stringify(requestData));

      await axiosInstance.put(`/events/${event._id}`, requestData);
      refetch();
      // Optionally, show a success message to the user
      console.log("Email template saved successfully");
    } catch (error) {
      console.error("Error saving email template:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleCancel = () => {
    // Reset state to normalized values
    setParking(normalizedEmailParams.parking);
    setSchedule(normalizedEmailParams.scheduleSrc);
    setDining(normalizedEmailParams.dining);
    setCustomTemplate(normalizedEmailParams.customHtmlTemplate);
    setVirtualSpace(normalizedEmailParams.virtualSpace);
    setEmailIdentifier(normalizedEmailParams.emailIdentifier);
    setHasChanges(false);
  };

  const insertPlaceholder = (type: "name" | "qr") => {
    if (!editorRef.current) return;

    const placeholder =
      type === "name"
        ? '<div id="guest-name">Guest Name</div>'
        : '<div id="qr-code">QR Code will appear here</div>';

    // Get current cursor position
    const selection = editorRef.current.getSelection();

    // Insert the placeholder at cursor position
    if (selection) {
      const position = selection.getPosition();
      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );

      // Create an edit operation
      const op = {
        range: range,
        text: placeholder,
        forceMoveMarkers: true,
      };

      // Execute the edit
      editorRef.current.executeEdits("placeholder-insertion", [op]);

      // Focus back on the editor
      editorRef.current.focus();
    }
  };

  const formatHtml = () => {
    if (!editorRef.current) return;

    editorRef.current.getAction("editor.action.formatDocument")?.run();
  };

  const toggleCustomTemplate = (enabled: boolean) => {
    setCustomTemplate((prev) => ({
      ...prev,
      enabled,
    }));
  };

  return (
    <Container isTablet={tabletMode}>
      <IframeContainer
        isTablet={tabletMode}
        isCustomTemplate={customTemplate.enabled}
      >
        <StyledIframeWrapper>
          <iframe
            ref={iframeRef}
            title="Email Preview"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "700px",
              border: "none",
              backgroundColor: "#eeedf2",
            }}
            sandbox="allow-same-origin"
          />
        </StyledIframeWrapper>
      </IframeContainer>
      <EmailSectionsContainer
        isTablet={tabletMode}
        isCustomTemplate={customTemplate.enabled}
      >
        <Header>
          <HeaderTitle>Email Template</HeaderTitle>
          <ToggleContainer>
            <ToggleLabel>
              {customTemplate.enabled ? "Custom HTML" : "Standard Template"}
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={customTemplate.enabled}
                onChange={() => toggleCustomTemplate(!customTemplate.enabled)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>
        </Header>

        <SectionContainer>
          <Header>
            <HeaderTitle>Email Sender Name</HeaderTitle>
          </Header>
          <InfoBox>
            <p>
              Set the name that will appear in the "From" field of your emails.
              This will be displayed as "[Your Name]
              &lt;tickets@preemly.eu&gt;". If left empty, it will default to
              "Preemly".
            </p>
          </InfoBox>
          <StyledInput
            type="text"
            value={emailIdentifier}
            onChange={(e) => setEmailIdentifier(e.target.value)}
            placeholder="Enter sender name (e.g., Event Organizer)"
          />
        </SectionContainer>

        {customTemplate.enabled ? (
          <SectionContainer>
            <EditorContainer>
              <EditorToolbar>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  HTML Editor
                </div>
                <ToolbarActions>
                  <PlaceholderButton onClick={() => insertPlaceholder("name")}>
                    Insert Name
                  </PlaceholderButton>
                  <PlaceholderButton onClick={() => insertPlaceholder("qr")}>
                    Insert QR Code
                  </PlaceholderButton>
                  <ToolbarButton onClick={formatHtml}>
                    Format HTML
                  </ToolbarButton>
                </ToolbarActions>
              </EditorToolbar>
              <EditorContent>
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={customTemplate.content}
                  onChange={(value) =>
                    setCustomTemplate((prev) => ({
                      ...prev,
                      content: value || "",
                    }))
                  }
                  theme="vs-light"
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    formatOnPaste: true,
                    formatOnType: true,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </EditorContent>
            </EditorContainer>

            <InfoBox>
              <p>
                <strong>Important:</strong> To include dynamic content in your
                custom template, use the following placeholders:
              </p>
              <ul>
                <li>
                  <code>&lt;div id="guest-name"&gt;&lt;/div&gt;</code> - Will be
                  replaced with the guest's name
                </li>
                <li>
                  <code>&lt;div id="qr-code"&gt;&lt;/div&gt;</code> - Will be
                  replaced with the guest's QR code
                </li>
              </ul>
            </InfoBox>
          </SectionContainer>
        ) : (
          <>
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
              toggleOnly={true}
              description="Include the event schedule in the email. The schedule will be automatically generated from the event's schedule items."
            />
            <EmailSection
              icon={<VirtualSpaceIcon />}
              title={"Virtual Space Link"}
              enable={virtualSpace.enabled}
              setEnable={() =>
                setVirtualSpace({ enabled: !virtualSpace.enabled })
              }
              toggleOnly={true}
              description="Include a button to access the event's virtual space. Guests will be able to join the virtual space directly from the email."
            />
          </>
        )}
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

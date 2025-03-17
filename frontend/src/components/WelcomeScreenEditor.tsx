import React, { useState, useRef } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";

// Define Event interface
interface Event {
  _id: string;
  title: string;
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
    videoUrl: string;
    inactivityTimeout?: number;
  };
}

// Styled components
const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 16px;
  width: calc(90% - 32px);
  margin: 20px auto;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: stretch;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Form = styled.div<{ isAppearanceTab?: boolean }>`
  display: flex;
  width: ${(props) => (props.isAppearanceTab ? "35%" : "100%")};
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #f8f9fc;
  border-radius: 12px;
  box-sizing: border-box;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Preview = styled.div<{
  backgroundcolor: string;
  textcolor: string;
}>`
  flex: 1;
  min-height: 400px;
  display: flex;
  font-size: 32px;
  font-weight: 600;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: ${(props) => props.backgroundcolor};
  color: ${(props) => props.textcolor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 12px;
  display: block;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const ThemeButton = styled.button<{
  bgColor: string;
  textColor: string;
  isSelected: boolean;
}>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 3px solid ${(props) => (props.isSelected ? "#6b3ddf" : "transparent")};
  box-shadow: ${(props) =>
    props.isSelected
      ? "0 4px 8px rgba(107, 61, 223, 0.3)"
      : "0 2px 4px rgba(0, 0, 0, 0.1)"};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      ${(props) => props.bgColor} 0%,
      ${(props) => props.bgColor} 50%,
      ${(props) => props.textColor} 50%,
      ${(props) => props.textColor} 100%
    );
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ToggleLabel = styled.span`
  font-weight: 500;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ToggleSwitch = styled.input.attrs({ type: "checkbox" })`
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: #ccc;
  border-radius: 10px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:checked {
    background-color: rgb(107, 61, 223);
  }

  &::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;

    ${(props) =>
      props.checked &&
      `
      left: 22px;
    `}
  }
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 20px;
  color: #2c2c2c;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: rgb(107, 61, 223);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin: 0 0 20px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  color: ${(props) => (props.active ? "#6b3ddf" : "#666")};
  border-bottom: 2px solid
    ${(props) => (props.active ? "#6b3ddf" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #6b3ddf;
  }
`;

const VideoPreviewContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: #f0f0f0;
  position: relative;
  min-height: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f5f5f5;
  color: #6b3ddf;
  border: 2px dashed #6b3ddf;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-bottom: 16px;

  &:hover {
    background-color: rgba(107, 61, 223, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const VideoInfo = styled.div`
  font-size: 14px;
  color: #757575;
  margin-top: 8px;
`;

const NoVideoMessage = styled.div`
  padding: 32px;
  text-align: center;
  color: #757575;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;

  svg {
    opacity: 0.6;
    margin-bottom: 16px;
    width: 64px;
    height: 64px;
  }

  p {
    margin: 4px 0;
  }

  p:first-of-type {
    font-weight: 600;
    font-size: 18px;
    color: #555;
  }
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid #6b3ddf;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Update TwoColumnLayout to give more space to the video preview
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Define color themes with good contrast
const colorThemes = [
  { name: "Blue & White", bgColor: "#1E88E5", textColor: "#FFFFFF" },
  { name: "Dark Green & Yellow", bgColor: "#1B5E20", textColor: "#FFEB3B" },
  { name: "Purple & White", bgColor: "#2A2768", textColor: "#FFFFFF" },
  { name: "Dark & Light", bgColor: "#212121", textColor: "#F5F5F5" },
  { name: "Teal & White", bgColor: "#00897B", textColor: "#FFFFFF" },
  { name: "Orange & Black", bgColor: "#FF9800", textColor: "#212121" },
  { name: "Red & White", bgColor: "#D32F2F", textColor: "#FFFFFF" },
];

// Move the styled components outside the component function
const TimeoutInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  margin-bottom: 16px;
`;

const NumberInput = styled.input`
  width: 80px;
  height: 40px;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #6b3ddf;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #6b3ddf;
    box-shadow: 0 0 0 2px rgba(107, 61, 223, 0.2);
  }

  /* Make the spinner buttons more stable */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
    height: 30px;
    margin: 0;
    position: relative;
  }
`;

const TimeoutLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #2c2c2c;
`;

const VideoPreviewWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fc;
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
  height: 100%;
`;

const VideoControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const FormLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #2c2c2c;
`;

const FormDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

// Component
const WelcomeScreenEditor: React.FC<{ event: Event; refetch: () => void }> = ({
  event,
  refetch,
}) => {
  const axiosInstance = useAxiosWithAuth();
  const [activeTab, setActiveTab] = useState("appearance");

  const [backgroundColor, setBackgroundColor] = useState(
    event.welcomeScreenParams.backgroundColor
  );
  const [textColor, setTextColor] = useState(
    event.welcomeScreenParams.textColor
  );
  const [isManualCheckin, setManualCheckin] = useState(
    event.welcomeScreenParams.isManualCheckin
  );
  const [isGdpr, setGdpr] = useState(event.welcomeScreenParams.isGdpr);
  const [inactivityTimeout, setInactivityTimeout] = useState(
    event.welcomeScreenParams.inactivityTimeout || 30
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(
    event.welcomeScreenParams.videoUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a new state for the input value
  const [timeoutInputValue, setTimeoutInputValue] = useState(
    inactivityTimeout.toString()
  );

  const handleThemeSelect = (bgColor: string, textColor: string) => {
    setBackgroundColor(bgColor);
    setTextColor(textColor);
  };

  const handleSaveAppearance = async () => {
    setIsUpdating(true);

    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        welcomeScreenParams: {
          ...event.welcomeScreenParams,
          backgroundColor,
          textColor,
          isManualCheckin,
          isGdpr,
          inactivityTimeout,
        },
      });
      refetch();
    } catch (error) {
      console.error("Error updating appearance:", error);
      alert("Failed to update appearance settings.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is a video
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file.");
        return;
      }

      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("Video file is too large. Please select a file under 100MB.");
        return;
      }

      setVideoFile(file);

      // Don't automatically set the preview URL
      // We'll set it after the user clicks "Upload Video"
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      console.error("No video file selected");
      alert("Please select a video file first");
      return;
    }

    setIsUploading(true);
    console.log(
      "Starting upload for file:",
      videoFile.name,
      "size:",
      videoFile.size,
      "type:",
      videoFile.type
    );

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("video", videoFile);

      // Log the FormData contents for debugging
      console.log("FormData created with video file");

      // Upload the video to Cloudinary via your backend
      console.log("Sending upload request to server...");
      const response = await axiosInstance.post(
        "/events/upload-sleep-video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Add timeout and onUploadProgress for better user experience
          timeout: 300000, // 5 minutes timeout for large files
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Upload response received:", response);

      if (response.data && response.data.success) {
        console.log(
          "Video uploaded successfully, URL:",
          response.data.data.url
        );

        // Update the event with the new video URL
        console.log("Updating event with new video URL");
        const updateResponse = await axiosInstance.put(`/events/${event._id}`, {
          ...event,
          welcomeScreenParams: {
            ...event.welcomeScreenParams,
            videoUrl: response.data.data.url,
          },
        });

        console.log("Event update response:", updateResponse);

        // Update the preview URL with the Cloudinary URL
        setVideoPreviewUrl(response.data.data.url);
        setVideoFile(null);

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        alert("Video uploaded successfully!");
        refetch();
      } else {
        console.error("Upload response indicates failure:", response.data);
        throw new Error(
          response.data?.message || "Failed to upload video. Unknown error."
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);

      // More detailed error message
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      alert(`Failed to upload video: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (!videoPreviewUrl) {
      console.error("No video to remove");
      return;
    }

    setIsUploading(true);
    console.log("Removing video from event");

    try {
      // Update the event to remove the video URL
      console.log("Sending request to update event and remove video URL");
      const response = await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        welcomeScreenParams: {
          ...event.welcomeScreenParams,
          videoUrl: "",
        },
      });

      console.log("Video removal response:", response);

      // Clear the preview URL and file
      setVideoPreviewUrl("");
      setVideoFile(null);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      console.log("Video removed successfully");
      alert("Video removed successfully");
      refetch();
    } catch (error) {
      console.error("Error removing video:", error);

      // More detailed error message
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      alert(`Failed to remove video: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Update the handleTimeoutChange function
  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update the input value, not the actual timeout yet
    setTimeoutInputValue(e.target.value);
  };

  // Add a function to update the actual timeout on blur
  const handleTimeoutBlur = () => {
    const value = parseInt(timeoutInputValue);
    if (!isNaN(value) && value >= 5 && value <= 300) {
      setInactivityTimeout(value);
    } else {
      // Reset to valid value if input is invalid
      setTimeoutInputValue(inactivityTimeout.toString());
    }
  };

  // Add a specific function for saving the inactivity timeout
  const handleSaveTimeout = async () => {
    setIsUpdating(true);

    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        welcomeScreenParams: {
          ...event.welcomeScreenParams,
          inactivityTimeout,
        },
      });
      alert("Inactivity timeout saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error updating inactivity timeout:", error);
      alert("Failed to update inactivity timeout.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container>
      <SectionTitle>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 16V8M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Welcome Screen Settings
      </SectionTitle>

      <TabsContainer>
        <Tab
          active={activeTab === "appearance"}
          onClick={() => setActiveTab("appearance")}
        >
          Appearance
        </Tab>
        <Tab
          active={activeTab === "sleep-video"}
          onClick={() => setActiveTab("sleep-video")}
        >
          Sleep Video
        </Tab>
      </TabsContainer>

      {activeTab === "appearance" && (
        <ContentContainer>
          <Preview backgroundcolor={backgroundColor} textcolor={textColor}>
            Welcome, User1
          </Preview>
          <Form isAppearanceTab>
            <div>
              <Label>Choose a Theme</Label>
              <ThemeGrid>
                {colorThemes.map((theme, index) => (
                  <ThemeButton
                    key={index}
                    bgColor={theme.bgColor}
                    textColor={theme.textColor}
                    isSelected={
                      theme.bgColor === backgroundColor &&
                      theme.textColor === textColor
                    }
                    onClick={() =>
                      handleThemeSelect(theme.bgColor, theme.textColor)
                    }
                    title={theme.name}
                  />
                ))}
              </ThemeGrid>
            </div>

            <ToggleContainer>
              <ToggleLabel>Manual Check-in</ToggleLabel>
              <ToggleSwitch
                checked={isManualCheckin}
                onChange={() => setManualCheckin(!isManualCheckin)}
              />
            </ToggleContainer>

            <ToggleContainer>
              <ToggleLabel>GDPR Compliance</ToggleLabel>
              <ToggleSwitch
                checked={isGdpr}
                onChange={() => setGdpr(!isGdpr)}
              />
            </ToggleContainer>
            <PrimaryButton
              onClick={handleSaveAppearance}
              disabled={
                isUpdating ||
                (event.welcomeScreenParams.backgroundColor ===
                  backgroundColor &&
                  event.welcomeScreenParams.textColor === textColor &&
                  event.welcomeScreenParams.isManualCheckin ===
                    isManualCheckin &&
                  event.welcomeScreenParams.isGdpr === isGdpr &&
                  event.welcomeScreenParams.inactivityTimeout ===
                    inactivityTimeout)
              }
            >
              {isUpdating ? "Saving..." : "Save"}
            </PrimaryButton>
          </Form>
        </ContentContainer>
      )}

      {activeTab === "sleep-video" && (
        <ContentContainer>
          <TwoColumnLayout>
            <Form>
              <FormSection>
                <FormLabel>Inactivity Timeout</FormLabel>
                <FormDescription>
                  Set how long (in seconds) before the sleep screen appears due
                  to inactivity
                </FormDescription>
                <TimeoutInputContainer>
                  <NumberInput
                    type="number"
                    min={5}
                    max={300}
                    step={5}
                    value={timeoutInputValue}
                    onChange={handleTimeoutChange}
                    onBlur={handleTimeoutBlur}
                  />
                  <TimeoutLabel>seconds</TimeoutLabel>
                </TimeoutInputContainer>
                <SecondaryButton
                  onClick={handleSaveTimeout}
                  disabled={
                    isUpdating ||
                    inactivityTimeout < 5 ||
                    inactivityTimeout ===
                      event.welcomeScreenParams.inactivityTimeout
                  }
                  style={{ marginTop: "12px" }}
                >
                  {isUpdating ? <LoadingSpinner /> : "Save Timeout"}
                </SecondaryButton>
              </FormSection>

              <FormSection>
                <FormLabel>Sleep Screen Video</FormLabel>
                <FormDescription>
                  Upload a video to be displayed when the welcome screen goes to
                  sleep
                </FormDescription>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />

                <UploadButton onClick={() => fileInputRef.current?.click()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {videoFile ? videoFile.name : "Choose a video file"}
                </UploadButton>

                <VideoControlsContainer>
                  {isUploading ? (
                    <SecondaryButton disabled>
                      <LoadingSpinner /> Uploading...
                    </SecondaryButton>
                  ) : (
                    videoFile && (
                      <SecondaryButton onClick={handleUpload}>
                        Upload Video
                      </SecondaryButton>
                    )
                  )}

                  {videoPreviewUrl && (
                    <SecondaryButton onClick={handleRemoveVideo}>
                      Remove Video
                    </SecondaryButton>
                  )}
                </VideoControlsContainer>

                <VideoInfo>
                  Supported formats: MP4, WebM, Ogg
                  <br />
                  Maximum file size: 100MB
                </VideoInfo>
              </FormSection>
            </Form>

            <VideoPreviewWrapper>
              <VideoPreviewContainer>
                {videoPreviewUrl ? (
                  <video
                    src={videoPreviewUrl}
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      maxHeight: "400px",
                    }}
                  />
                ) : (
                  <NoVideoMessage>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p>No video uploaded</p>
                    <p>Upload a video to see a preview here</p>
                  </NoVideoMessage>
                )}
              </VideoPreviewContainer>
            </VideoPreviewWrapper>
          </TwoColumnLayout>
        </ContentContainer>
      )}
    </Container>
  );
};

export default WelcomeScreenEditor;

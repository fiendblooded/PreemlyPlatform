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
    checkinSuccessTimeout?: number;
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

  @media (max-width: 1024px) {
    width: calc(95% - 32px);
    padding: 12px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: stretch;

  @media (max-width: 1024px) {
    gap: 24px;
  }

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

  @media (max-width: 1024px) {
    width: ${(props) => (props.isAppearanceTab ? "40%" : "100%")};
    padding: 20px;
    gap: 20px;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 16px;
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

  @media (max-width: 1024px) {
    min-height: 350px;
    font-size: 28px;
  }

  @media (max-width: 768px) {
    min-height: 300px;
  }
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

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ThemeButton = styled.button<{
  bgColor: string;
  textColor: string;
  isSelected: boolean;
}>`
  width: 100%;
  aspect-ratio: 1.6 / 1;
  border: 2px solid ${(props) => (props.isSelected ? "#6b3ddf" : "#e0e0e0")};
  border-radius: 8px;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.textColor};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.isSelected ? "0 0 0 2px rgba(107, 61, 223, 0.3)" : "none"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &::after {
    content: "${(props) => (props.isSelected ? "✓" : "")}";
    position: absolute;
    bottom: 4px;
    right: 4px;
    background-color: ${(props) =>
      props.isSelected ? "#6b3ddf" : "transparent"};
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  @media (max-width: 1024px) {
    aspect-ratio: 1.5 / 1;

    &::after {
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: 480px) {
    aspect-ratio: 1.4 / 1;
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

  @media (max-width: 1024px) {
    font-size: 18px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin: 0 0 20px;
  overflow-x: auto;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    padding-bottom: 4px;
  }
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
  white-space: nowrap;

  &:hover {
    color: #6b3ddf;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 15px;
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

  @media (max-width: 768px) {
    min-height: 240px;
  }
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
  word-break: break-word;

  &:hover {
    background-color: rgba(107, 61, 223, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 14px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const VideoInfo = styled.div`
  font-size: 14px;
  color: #757575;
  margin-top: 8px;
`;

const VideoStatusContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: #f0f8ff;
  border: 1px solid #b3d7ff;
  margin: 12px 0;

  svg {
    color: #2b7de9;
    margin-right: 10px;
    flex-shrink: 0;
  }
`;

const VideoStatusText = styled.div`
  display: flex;
  flex-direction: column;

  span:first-child {
    font-weight: 500;
    font-size: 14px;
    color: #2c2c2c;
    margin-bottom: 2px;
  }

  span:last-child {
    font-size: 13px;
    color: #666;
    word-break: break-all;
  }
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

    @media (max-width: 768px) {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }
  }

  p {
    margin: 4px 0;

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }

  p:first-of-type {
    font-weight: 600;
    font-size: 18px;
    color: #555;

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    width: 14px;
    height: 14px;
    border-width: 1.5px;
  }
`;

// Update TwoColumnLayout to give more space to the video preview
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 24px;
  width: 100%;

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: 45% 55%;
    gap: 20px;
  }

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
const EnhancedTimeoutInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f0f4fa;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border: 1px solid #e9eff9;
  box-sizing: border-box;
  &:hover {
    background: #e9f0fc;
  }

  @media (max-width: 1024px) {
    padding: 14px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
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
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #6b3ddf;
    box-shadow: 0 0 0 2px rgba(107, 61, 223, 0.2);
  }

  /* Custom styling for the spinner buttons */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }

  /* Firefox */
  -moz-appearance: textfield;

  @media (max-width: 1024px) {
    height: 44px;
    font-size: 17px;
  }
`;

const TimeoutLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #2c2c2c;
  display: flex;
  align-items: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const EnhancedNumberInput = styled(NumberInput)`
  border-color: #d8e1ee;
  background-color: white;
  width: 90px;
  border-radius: 10px;
  font-weight: 700;
  color: #5a30c2;
  box-shadow: 0 2px 6px rgba(107, 61, 223, 0.08);
  padding-right: 36px; /* Make room for custom stepper buttons */
  position: relative;

  @media (max-width: 1024px) {
    width: 100px;
    height: 48px;
    font-size: 18px;
  }

  &:focus {
    border-color: #6b3ddf;
    box-shadow: 0 0 0 2px rgba(107, 61, 223, 0.15);
  }

  &:hover {
    border-color: #b9c7e0;
  }
`;

const NumberControls = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 24px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e6edf8;

  button {
    flex: 1;
    border: none;
    background: white;
    color: #5a30c2;
    font-size: 12px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s;
    margin: 0;
    height: 50%;

    &:hover {
      background-color: #f0f4fa;
    }

    &:active {
      background-color: #e6edf8;
    }

    &:first-child {
      border-bottom: 1px solid #e6edf8;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
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

  @media (max-width: 1024px) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const VideoControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    flex-wrap: wrap;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const FormLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #2c2c2c;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const FormDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

// Add these new styled components
const FunctionalityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
  margin-bottom: 24px;

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const SettingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1024px) {
    padding: 20px;
    gap: 16px;
  }
`;

const SettingHeader = styled.div`
  margin-bottom: 8px;
`;

const SettingTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 8px 0;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const EnhancedToggleContainer = styled(
  typeof ToggleContainer !== "undefined" ? ToggleContainer : "div"
)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fc;
  border-radius: 8px;
  margin-bottom: 8px;

  @media (max-width: 1024px) {
    padding: 14px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const EnhancedToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const EnhancedToggleName = styled.span`
  font-weight: 500;
  font-size: 16px;
  color: #2c2c2c;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const EnhancedToggleDescription = styled.span`
  font-size: 13px;
  color: #666;
  line-height: 1.4;

  @media (max-width: 1024px) {
    font-size: 12px;
  }
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

  // Fix: Use exact number values with parseInt to ensure consistency
  const [inactivityTimeout, setInactivityTimeout] = useState(
    event.welcomeScreenParams.inactivityTimeout
      ? parseInt(event.welcomeScreenParams.inactivityTimeout.toString(), 10)
      : 30
  );

  const [checkinSuccessTimeout, setCheckinSuccessTimeout] = useState(
    event.welcomeScreenParams.checkinSuccessTimeout
      ? parseInt(event.welcomeScreenParams.checkinSuccessTimeout.toString(), 10)
      : 10
  );

  const [isUpdating, setIsUpdating] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(
    event.welcomeScreenParams.videoUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Ensure input values are synchronized with state initially
  const [timeoutInputValue, setTimeoutInputValue] = useState(
    inactivityTimeout.toString()
  );
  const [checkinTimeoutInputValue, setCheckinTimeoutInputValue] = useState(
    checkinSuccessTimeout.toString()
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

  const handleSaveFunctionality = async () => {
    setIsUpdating(true);

    try {
      // Fix: Ensure we're sending the exact numeric values, not strings or calculations
      const inactivityTimeoutValue = parseInt(timeoutInputValue, 10);
      const checkinSuccessTimeoutValue = parseInt(checkinTimeoutInputValue, 10);

      // Validate values before sending to ensure they're within bounds
      const validInactivityTimeout =
        !isNaN(inactivityTimeoutValue) &&
        inactivityTimeoutValue >= 5 &&
        inactivityTimeoutValue <= 300
          ? inactivityTimeoutValue
          : inactivityTimeout;

      const validCheckinTimeout =
        !isNaN(checkinSuccessTimeoutValue) &&
        checkinSuccessTimeoutValue >= 2 &&
        checkinSuccessTimeoutValue <= 60
          ? checkinSuccessTimeoutValue
          : checkinSuccessTimeout;

      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        welcomeScreenParams: {
          ...event.welcomeScreenParams,
          isManualCheckin,
          isGdpr,
          inactivityTimeout: validInactivityTimeout,
          checkinSuccessTimeout: validCheckinTimeout,
        },
      });

      // Update local state with exact values we sent
      setInactivityTimeout(validInactivityTimeout);
      setCheckinSuccessTimeout(validCheckinTimeout);

      refetch();
    } catch (error) {
      console.error("Error updating functionality settings:", error);
      alert("Failed to update functionality settings.");
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

  // Fix: Update handler to prevent any unintended conversions
  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update the input value, not the actual timeout yet
    setTimeoutInputValue(e.target.value);
  };

  // Fix: Ensure exact number parsing
  const handleTimeoutBlur = () => {
    const value = parseInt(timeoutInputValue, 10);
    if (!isNaN(value) && value >= 5 && value <= 300) {
      setInactivityTimeout(value);
    } else {
      // Reset to valid value if input is invalid
      setTimeoutInputValue(inactivityTimeout.toString());
    }
  };

  // Fix: Update handler to prevent any unintended conversions
  const handleCheckinTimeoutChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCheckinTimeoutInputValue(e.target.value);
  };

  // Fix: Ensure exact number parsing
  const handleCheckinTimeoutBlur = () => {
    const value = parseInt(checkinTimeoutInputValue, 10);
    if (!isNaN(value) && value >= 2 && value <= 60) {
      setCheckinSuccessTimeout(value);
    } else {
      // Reset to valid value if input is invalid
      setCheckinTimeoutInputValue(checkinSuccessTimeout.toString());
    }
  };

  // Update the implementation for the timeout inputs in the functionality tab
  const renderTimeoutInput = (
    value: string,
    min: number,
    max: number,
    step: number,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleBlur: () => void,
    ariaLabel: string,
    setStateDirectly: (value: number) => void
  ) => {
    const handleIncrement = () => {
      const currentValue = parseInt(value, 10);
      if (!isNaN(currentValue) && currentValue < max) {
        const newValue = Math.min(currentValue + step, max);

        // Update the input value
        const event = {
          target: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);

        // Also directly update the state value
        setStateDirectly(newValue);
      }
    };

    const handleDecrement = () => {
      const currentValue = parseInt(value, 10);
      if (!isNaN(currentValue) && currentValue > min) {
        const newValue = Math.max(currentValue - step, min);

        // Update the input value
        const event = {
          target: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);

        // Also directly update the state value
        setStateDirectly(newValue);
      }
    };

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <EnhancedNumberInput
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={ariaLabel}
        />
        <NumberControls>
          <button type="button" onClick={handleIncrement} aria-label="Increase">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 14L12 10L8 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" onClick={handleDecrement} aria-label="Decrease">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10L12 14L16 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </NumberControls>
      </div>
    );
  };

  // Fix: Add an effect to sync state when event data changes (like after refresh)
  React.useEffect(() => {
    // Ensure these are always exact integer values
    const inactivityTimeoutValue = event.welcomeScreenParams.inactivityTimeout
      ? parseInt(event.welcomeScreenParams.inactivityTimeout.toString(), 10)
      : 30;

    const checkinSuccessTimeoutValue = event.welcomeScreenParams
      .checkinSuccessTimeout
      ? parseInt(event.welcomeScreenParams.checkinSuccessTimeout.toString(), 10)
      : 10;

    setInactivityTimeout(inactivityTimeoutValue);
    setCheckinSuccessTimeout(checkinSuccessTimeoutValue);

    setTimeoutInputValue(inactivityTimeoutValue.toString());
    setCheckinTimeoutInputValue(checkinSuccessTimeoutValue.toString());
  }, [
    event.welcomeScreenParams.inactivityTimeout,
    event.welcomeScreenParams.checkinSuccessTimeout,
  ]);

  // Add a function to extract filename from Cloudinary URL
  const extractFilenameFromUrl = (url: string): string => {
    if (!url) return "";

    // Try to extract filename from Cloudinary URL
    const parts = url.split("/");
    const fileWithExtension = parts[parts.length - 1];

    // Remove any query parameters
    const filename = fileWithExtension.split("?")[0];

    // Decode URI components to handle special characters
    try {
      return decodeURIComponent(filename);
    } catch {
      // Return the raw filename if decoding fails
      return filename;
    }
  };

  return (
    <Container>
      <SectionTitle>Check-in Screen Settings</SectionTitle>

      <TabsContainer>
        <Tab
          active={activeTab === "appearance"}
          onClick={() => setActiveTab("appearance")}
        >
          Appearance
        </Tab>
        <Tab
          active={activeTab === "functionality"}
          onClick={() => setActiveTab("functionality")}
        >
          Functionality
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

            <PrimaryButton
              onClick={handleSaveAppearance}
              disabled={
                isUpdating ||
                (event.welcomeScreenParams.backgroundColor ===
                  backgroundColor &&
                  event.welcomeScreenParams.textColor === textColor)
              }
              style={{ width: "100%" }}
            >
              {isUpdating ? (
                <>{isUpdating && <LoadingSpinner />} Saving...</>
              ) : (
                "Save Appearance"
              )}
            </PrimaryButton>
          </Form>
        </ContentContainer>
      )}

      {activeTab === "functionality" && (
        <ContentContainer>
          <Form>
            <SettingHeader>
              <SettingTitle>Welcome Screen Behavior Settings</SettingTitle>
              <SettingDescription>
                Configure how your welcome screen behaves for event check-ins
                and user interactions.
              </SettingDescription>
            </SettingHeader>

            <FunctionalityGrid>
              <SettingCard>
                <SettingTitle>Check-in Options</SettingTitle>

                <EnhancedToggleContainer>
                  <EnhancedToggleLabel>
                    <EnhancedToggleName>Manual Check-in</EnhancedToggleName>
                    <EnhancedToggleDescription>
                      Allow guests to check in manually without scanning a QR
                      code
                    </EnhancedToggleDescription>
                  </EnhancedToggleLabel>
                  <ToggleSwitch
                    checked={isManualCheckin}
                    onChange={() => setManualCheckin(!isManualCheckin)}
                  />
                </EnhancedToggleContainer>

                <EnhancedToggleContainer>
                  <EnhancedToggleLabel>
                    <EnhancedToggleName>GDPR Compliance</EnhancedToggleName>
                    <EnhancedToggleDescription>
                      Require guests to accept GDPR consent before check-in
                    </EnhancedToggleDescription>
                  </EnhancedToggleLabel>
                  <ToggleSwitch
                    checked={isGdpr}
                    onChange={() => setGdpr(!isGdpr)}
                  />
                </EnhancedToggleContainer>
              </SettingCard>

              <SettingCard>
                <SettingTitle>Timing Settings</SettingTitle>

                <div>
                  <FormLabel>Check-in Success Message</FormLabel>
                  <SettingDescription style={{ marginBottom: "12px" }}>
                    How long to display the success message after a guest checks
                    in
                  </SettingDescription>
                  <EnhancedTimeoutInputContainer>
                    {renderTimeoutInput(
                      checkinTimeoutInputValue,
                      2,
                      60,
                      1,
                      handleCheckinTimeoutChange,
                      handleCheckinTimeoutBlur,
                      "Check-in success timeout in seconds",
                      setCheckinSuccessTimeout
                    )}
                    <TimeoutLabel>seconds</TimeoutLabel>
                  </EnhancedTimeoutInputContainer>
                </div>

                <div>
                  <FormLabel>Sleep Screen Timeout</FormLabel>
                  <SettingDescription style={{ marginBottom: "12px" }}>
                    Time of inactivity before the sleep screen appears
                  </SettingDescription>
                  <EnhancedTimeoutInputContainer>
                    {renderTimeoutInput(
                      timeoutInputValue,
                      5,
                      300,
                      5,
                      handleTimeoutChange,
                      handleTimeoutBlur,
                      "Sleep screen timeout in seconds",
                      setInactivityTimeout
                    )}
                    <TimeoutLabel>seconds</TimeoutLabel>
                  </EnhancedTimeoutInputContainer>
                </div>
              </SettingCard>
            </FunctionalityGrid>

            <PrimaryButton
              onClick={handleSaveFunctionality}
              style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
              disabled={
                isUpdating ||
                (event.welcomeScreenParams.isManualCheckin ===
                  isManualCheckin &&
                  event.welcomeScreenParams.isGdpr === isGdpr &&
                  event.welcomeScreenParams.inactivityTimeout ===
                    inactivityTimeout &&
                  event.welcomeScreenParams.checkinSuccessTimeout ===
                    checkinSuccessTimeout)
              }
            >
              {isUpdating ? (
                <>{isUpdating && <LoadingSpinner />} Saving...</>
              ) : (
                "Save Functionality"
              )}
            </PrimaryButton>
          </Form>
        </ContentContainer>
      )}

      {activeTab === "sleep-video" && (
        <ContentContainer>
          <TwoColumnLayout>
            <Form>
              <FormSection>
                <FormLabel>Sleep Screen Video</FormLabel>
                <FormDescription>
                  Upload a video to be displayed when the check-in screen goes
                  to sleep
                </FormDescription>

                {videoPreviewUrl && (
                  <VideoStatusContainer>
                    <VideoStatusText>
                      <span>Current Video:</span>
                      <span>{extractFilenameFromUrl(videoPreviewUrl)}</span>
                    </VideoStatusText>
                  </VideoStatusContainer>
                )}

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />

                <UploadButton
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginTop: "12px" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16V8M8 12H16M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {videoFile
                    ? `Selected: ${videoFile.name.substring(0, 20)}${
                        videoFile.name.length > 20 ? "..." : ""
                      }`
                    : videoPreviewUrl
                    ? "Change Video"
                    : "Choose a Video File"}
                </UploadButton>

                <VideoInfo>
                  Recommended: MP4 format, max 100MB, landscape orientation
                </VideoInfo>

                <VideoControlsContainer>
                  {isUploading ? (
                    <SecondaryButton disabled style={{ flex: 1 }}>
                      <LoadingSpinner /> Uploading...
                    </SecondaryButton>
                  ) : (
                    videoFile && (
                      <SecondaryButton
                        onClick={handleUpload}
                        style={{ flex: 1 }}
                      >
                        Upload Video
                      </SecondaryButton>
                    )
                  )}

                  {videoPreviewUrl && (
                    <SecondaryButton
                      onClick={handleRemoveVideo}
                      style={{ flex: 1 }}
                    >
                      Remove Video
                    </SecondaryButton>
                  )}
                </VideoControlsContainer>
              </FormSection>
            </Form>

            <VideoPreviewWrapper>
              <FormLabel>
                {videoPreviewUrl ? "Video Preview" : "No Video Uploaded"}
              </FormLabel>
              <VideoPreviewContainer>
                {videoPreviewUrl ? (
                  <video
                    controls
                    src={videoPreviewUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <NoVideoMessage>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.53 20.42H6.21C3.05 20.42 2 18.32 2 16.21V7.79C2 4.63 3.05 3.58 6.21 3.58H12.53C15.69 3.58 16.74 4.63 16.74 7.79V16.21C16.74 19.37 15.68 20.42 12.53 20.42Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.52 17.1L16.74 15.15V8.84L19.52 6.89C20.88 5.94 22 6.52 22 8.19V15.81C22 17.48 20.88 18.06 19.52 17.1Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>No Video Uploaded</p>
                    <p>Upload a video to see the preview</p>
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

import { useState } from "react";
import styled from "styled-components";
import React from "react";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(25, 29, 35, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  width: 440px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  color: #191d23;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.h2`
  color: #191d23;
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
`;

const ModalDescription = styled.p`
  color: #5a6072;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 20px;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  margin: 10px 0 24px;
  padding: 36px 24px;
  border: 2px dashed ${(props) => (props.isDragging ? "#6B3DDF" : "#E2E8F0")};
  border-radius: 10px;
  background-color: ${(props) =>
    props.isDragging ? "rgba(107, 61, 223, 0.05)" : "#F8FAFC"};
  color: #5a6072;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    border-color: #6b3ddf;
    background-color: rgba(107, 61, 223, 0.03);
  }
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(107, 61, 223, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  svg {
    color: #6b3ddf;
    width: 24px;
    height: 24px;
  }
`;

const PosterPreview = styled.div`
  margin-top: 0;
  margin-bottom: 24px;
  width: 100%;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.02);
    }
  }
`;

const ButtonGroup = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:focus {
    outline: none;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const UploadButton = styled(Button)`
  background-color: #6b3ddf;
  color: white;

  &:hover {
    background-color: #5f35c8;
    box-shadow: 0 4px 12px rgba(107, 61, 223, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #5a6072;
  border: 1px solid #e2e8f0;

  &:hover {
    background-color: #f8fafc;
    color: #191d23;
  }
`;

const FileInput = styled.input`
  display: none; /* Hidden input */
`;

const PreviewLabel = styled.div`
  color: #5a6072;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #6b3ddf;
    width: 16px;
    height: 16px;
  }
`;

interface PosterUploadModalProps {
  eventId: string;
  initialPoster: string | null;
  onClose: () => void;
  onPosterUpdated: () => void;
}

const PosterUploadModal: React.FC<PosterUploadModalProps> = ({
  eventId,
  initialPoster,
  onClose,
  onPosterUpdated,
}) => {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(
    initialPoster
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const axiosInstance = useAxiosWithAuth();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setPosterFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUpload = async () => {
    if (!posterFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Poster = reader.result as string;
        await axiosInstance.put(`/events/${eventId}/poster`, {
          poster: base64Poster,
        });

        onPosterUpdated(); // Notify parent to refresh the data
        onClose(); // Close the modal
      } catch (error) {
        console.error("Error updating poster:", error);
        alert("Failed to update poster");
      }
    };
    reader.readAsDataURL(posterFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Upload Event Poster</ModalHeader>
        <ModalDescription>
          Add a visual representation for your event. Recommended size:
          1200x630px.
        </ModalDescription>

        <DropZone
          isDragging={isDragging}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 12L12 8M12 8L8 12M12 8V17.2M7 16.8C5.46005 16.3994 4.19943 15.3836 3.52208 14.0062C2.84473 12.6289 2.80281 11.0204 3.40508 9.61332C4.00734 8.20628 5.20021 7.12566 6.66122 6.6545C8.12222 6.18334 9.70933 6.36639 11.034 7.15M12.584 7.5C13.2478 7.17784 13.9675 6.99747 14.7 6.97165C15.4325 6.94582 16.162 7.07493 16.841 7.34978C17.5199 7.62464 18.1333 8.03876 18.6372 8.56272C19.1411 9.08667 19.5232 9.70934 19.7634 10.389C20.0036 11.0686 20.096 11.7968 20.0334 12.519C19.9707 13.2411 19.7548 13.9392 19.4 14.57"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </UploadIcon>
          <div>
            {isDragging ? (
              <strong>Drop to upload!</strong>
            ) : (
              <>
                <strong>Drag & drop your image here</strong>
                <div style={{ marginTop: 4, fontSize: 13 }}>
                  or click to browse files
                </div>
              </>
            )}
          </div>
          <FileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </DropZone>

        {posterPreview && (
          <>
            <PreviewLabel>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.57441 12.7075C2.32486 12.4317 2.20001 12.2939 2.17812 12.1745C2.15253 12.0603 2.15253 11.9397 2.17812 11.8255C2.20001 11.7061 2.32486 11.5683 2.57441 11.2925C3.96247 9.7441 7.21517 6 12 6C16.7848 6 20.0375 9.7441 21.4256 11.2925C21.6751 11.5683 21.8 11.7061 21.8219 11.8255C21.8475 11.9397 21.8475 12.0603 21.8219 12.1745C21.8 12.2939 21.6751 12.4317 21.4256 12.7075C20.0375 14.2559 16.7848 18 12 18C7.21517 18 3.96247 14.2559 2.57441 12.7075Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Preview
            </PreviewLabel>
            <PosterPreview>
              <img src={posterPreview} alt="Poster Preview" />
            </PosterPreview>
          </>
        )}

        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <UploadButton onClick={handlePosterUpload}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 13V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.0799 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V13M12 3V17M12 3L16 7.5M12 3L8 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Upload
          </UploadButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PosterUploadModal;

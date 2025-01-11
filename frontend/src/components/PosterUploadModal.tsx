import { useState } from "react";
import styled from "styled-components";
import React from "react";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

const __dirname = window.location.origin;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e2f;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: #f5f5f5;
`;

const ModalHeader = styled.h2`
  color: #f4c430; /* Yellow */
  margin-bottom: 20px;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  margin: 10px 0;
  padding: 40px;
  border: 2px dashed ${(props) => (props.isDragging ? "#f4c430" : "#7a5fc7")};
  border-radius: 8px;
  background-color: ${(props) =>
    props.isDragging ? "#2c2c3c" : "transparent"};
  color: #f5f5f5;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #f4c430;
  }
`;

const PosterPreview = styled.img`
  margin-top: 20px;
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
`;

const UploadButton = styled.button`
  background-color: #9370db;
  border: none;
  padding: 10px 15px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #7a5fc7;
  }
`;

const CancelButton = styled.button`
  background-color: #f4c430;
  border: none;
  padding: 10px 15px;
  color: #121212;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ffd700;
  }
`;

const FileInput = styled.input`
  display: none; /* Hidden input */
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
        alert("Poster updated successfully!");
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
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>Upload Event Poster</ModalHeader>
        <DropZone
          isDragging={isDragging}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isDragging
            ? "Drop the file here!"
            : "Drag & Drop or Click to Upload Poster"}
          <FileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </DropZone>

        {posterPreview && (
          <PosterPreview src={posterPreview} alt="Poster Preview" />
        )}

        <ButtonGroup>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <UploadButton onClick={handlePosterUpload}>Upload</UploadButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PosterUploadModal;

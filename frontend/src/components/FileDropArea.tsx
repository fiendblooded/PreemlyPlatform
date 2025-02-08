import React, { useState, useRef } from "react";
import styled from "styled-components";

const DropZone = styled.div<{ isDragging: boolean }>`
  width: 90%;
  margin: 20px 0;
  padding: 40px;
  border: 2px dashed ${(props) => (props.isDragging ? "#f4c430" : "#7a5fc7")};
  border-radius: 8px;
  background-color: ${(props) =>
    props.isDragging ? "#2c2c3c" : "transparent"};
  color: black;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #f4c430;
    background-color: rgb(255, 251, 238);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const FileIcon = styled.svg`
  width: 60px;
  height: 60px;
  fill: #7a5fc7;
`;

const RemoveButton = styled.button`
  padding: 5px 10px;
  background-color: white;
  border: 1px solid #7a5fc7;
  color: #7a5fc7;

  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: rgb(222, 215, 244);
  }
`;

interface FileDropAreaProps {
  onFileDrop: (file: File) => void;
  onRemoveFile?: () => void; // New prop to notify when the file is removed
  accept?: string;
  message?: string;
  hoverMessage?: string;
}

const FileDropArea: React.FC<FileDropAreaProps> = ({
  onFileDrop,
  onRemoveFile,
  accept = "*/*",
  message = "Drag & Drop file here or click to browse",
  hoverMessage = "Drop the file here!",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setDroppedFile(file);
      onFileDrop(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDroppedFile(file);
      onFileDrop(file);
    }
  };

  const handleRemoveFile = () => {
    setDroppedFile(null);
    if (onRemoveFile) onRemoveFile(); // Notify parent about file removal
  };

  return (
    <DropZone
      isDragging={isDragging}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {droppedFile ? (
        <FilePreview>
          <FileIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 9V3.5L18.5 9H13Z" />
          </FileIcon>
          <span>{droppedFile.name}</span>
          <RemoveButton
            onClick={() => {
              handleRemoveFile();
            }}
          >
            Change File
          </RemoveButton>
        </FilePreview>
      ) : isDragging ? (
        hoverMessage
      ) : (
        message
      )}

      <FileInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileUpload}
      />
    </DropZone>
  );
};

export default FileDropArea;

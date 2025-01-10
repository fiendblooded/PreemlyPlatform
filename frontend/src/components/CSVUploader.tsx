import { useState } from "react";
import styled from "styled-components";
import Papa from "papaparse"; // CSV parser library
import React from "react";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

const Wrapper = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #1e1e2f;
  border-radius: 8px;
  color: #f5f5f5;
  text-align: center;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  margin: 20px 0;
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

const FileInput = styled.input`
  display: none; /* Hide the default file input */
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #444;
    padding: 10px;
    text-align: left;
    color: #f5f5f5;
  }

  th {
    background-color: #2c2c3c;
  }
`;

const Button = styled.button`
  margin-top: 20px;
  background-color: #9370db;
  border: none;
  padding: 10px 20px;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #7a5fc7;
  }
`;

const Error = styled.div`
  margin-top: 10px;
  color: #e7514c;
`;

interface Guest {
  fullName: string;
  email: string;
  age: number;
}

interface CSVUploaderProps {
  eventId: string;
  onGuestsAdded: () => void; // Callback to refresh the guest list
}

const CSVUploader: React.FC<CSVUploaderProps> = ({
  eventId,
  onGuestsAdded,
}) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const axiosInstance = useAxiosWithAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) parseCSV(file);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as Guest[];
        const invalidRows: string[] = [];
        const validGuests = parsedData.filter((row, index) => {
          const isValid =
            row.fullName && row.email && Number.isInteger(Number(row.age));
          if (!isValid) invalidRows.push(`Row ${index + 1} is invalid`);
          return isValid;
        });

        setGuests(validGuests);
        setErrors(invalidRows);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setErrors(["Failed to parse the file. Please check the format."]);
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseCSV(file);
  };

  const handleUpload = async () => {
    try {
      await axiosInstance.post(`/events/${eventId}/guests`, {
        guests,
      });
      setGuests([]);
      setErrors([]);
      onGuestsAdded();
    } catch (error) {
      console.error("Error uploading guests:", error);
      setErrors(["Failed to upload guests. Please try again."]);
    }
  };

  return (
    <Wrapper>
      <h3>Upload Guests via CSV</h3>
      <DropZone
        isDragging={isDragging}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isDragging
          ? "Drop the file here!"
          : "Drag & Drop CSV file here or click to browse"}
      </DropZone>

      <FileInput
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
      />

      {errors.length > 0 && (
        <Error>
          <h4>Errors:</h4>
          {errors.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </Error>
      )}
      {guests.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, index) => (
                <tr key={index}>
                  <td>{guest.fullName}</td>
                  <td>{guest.email}</td>
                  <td>{guest.age}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button onClick={handleUpload}>Upload Guests</Button>
        </>
      )}
    </Wrapper>
  );
};

export default CSVUploader;

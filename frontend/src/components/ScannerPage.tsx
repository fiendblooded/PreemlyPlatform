import { useState } from "react";
import styled from "styled-components";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { Header } from "./Events";
import ToastNotification from "./ToastNotification"; // Import the reusable component

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #121212; /* Dark background */
  padding-right: 80px;
`;

const ScannerContainer = styled.div`
  width: 800px;
  height: 800px;
`;

const ScannerPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const handleScan = async (result: IDetectedBarcode[]) => {
    try {
      const guestId = result[0].rawValue; // Assuming result contains the guest ID
      console.log(guestId);
      const response = await axios.put(
        `http://localhost:3002/api/guests/${guestId}/attendance`
      );

      console.log(guestId);
      setToastMessage(
        `Guest ${response.data.guest.fullName} marked as present`
      );
      setToastVisible(true);

      // Hide the toast after 5 seconds
      setTimeout(() => {
        setToastVisible(false);
        setToastMessage(null);
      }, 3002);
    } catch (error) {
      console.error("Error updating attendance:", error);
      setToastMessage("Failed to update attendance");
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
        setToastMessage(null);
      }, 3002);
    }
  };

  return (
    <Container>
      <Header>Scanner</Header>
      <ScannerContainer>
        <Scanner
          components={{ audio: false }}
          formats={["qr_code"]}
          onScan={(result) => handleScan(result)}
        />
      </ScannerContainer>
      {/* Use the reusable ToastNotification */}
      <ToastNotification message={toastMessage} visible={toastVisible} />
    </Container>
  );
};

export default ScannerPage;
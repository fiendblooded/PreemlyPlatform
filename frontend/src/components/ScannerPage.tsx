import { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Guest } from "../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #121212; /* Dark background */
  border-radius: 20px;
  margin: 20px auto;
`;

const ripple = keyframes`
  from {
    opacity: 1;
    transform: scale3d(0.75, 0.75, 1);
  }

  to {
    opacity: 0;
    transform: scale3d(1.2, 1.2, 1);
  }
`;

// Styled Component
const ScannerContainer = styled.div`
  width: 40vh;
  height: 40vh;
  border-radius: 20px;
  border: 4px solid #00aef0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.25);

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    background: #0460cc;
    border-radius: 20px;
    opacity: 0;
    animation: ${ripple} 6s infinite cubic-bezier(0.65, 0, 0.34, 1);
    z-index: -1;
  }
`;

type Props = {
  setGuest: (guest: Guest) => void;
};
const ScannerComponent: React.FC<Props> = ({ setGuest }) => {
  const axiosInstance = useAxiosWithAuth();

  const handleScan = async (result: IDetectedBarcode[]) => {
    const guestId = result[0].rawValue; // Assuming result contains the guest ID
    const response = await axiosInstance.put(`/guests/${guestId}/attendance`);
    console.log(response.data.data);
    const guest = response.data.data as Guest;
    setGuest(guest);
  };

  //hiding the svgs
  useEffect(() => {
    const hideSVGs = () => {
      // Select the parent div with the class 'scanner'
      const scannerDiv = document.querySelector(".scanner");

      // Check if the parent div exists
      if (scannerDiv) {
        // Find all SVG elements within the parent div
        const svgs = scannerDiv.querySelectorAll("svg");

        // Loop through each SVG and disable visibility
        svgs.forEach((svg) => {
          svg.style.display = "none"; // Alternatively, use svg.style.visibility = 'hidden';
        });
      }
    };

    // Run the hideSVGs function on mount
    hideSVGs();

    // Re-run the function whenever the DOM changes (e.g., when the Scanner renders)
    const observer = new MutationObserver(() => hideSVGs());
    const scannerDiv = document.querySelector(".scanner");
    if (scannerDiv) {
      observer.observe(scannerDiv, { childList: true, subtree: true });
    }

    // Cleanup the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Container>
      <ScannerContainer>
        <Scanner
          classNames={{ container: "scanner", video: "scanner" }}
          components={{ audio: false, torch: true }}
          formats={["qr_code"]}
          onScan={(result) => handleScan(result)}
          styles={{
            finderBorder: 0,
            container: { borderRadius: 20, border: 0 },
            video: { borderRadius: 20, border: 0 },
          }}
        />
      </ScannerContainer>
    </Container>
  );
};

export default ScannerComponent;

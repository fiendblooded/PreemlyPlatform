import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Guest } from "../types";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  border-radius: 20px;
  margin: 40px;
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

const Button = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100%;
  width: 40px;
  height: 40px;

  color: #fff;
  background-color: rgba(189, 189, 189, 0.3);
  border: none;
  cursor: pointer;

  &:hover {
    color: #008fcc;
  }
`;

const ScannerContainer = styled.div`
  width: 45vh;
  height: 45vh;
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
  eventGuests: string[];
};

const ScannerComponent: React.FC<Props> = ({ setGuest, eventGuests }) => {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const axiosInstance = useAxiosWithAuth();

  const handleSwitchCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const handleScan = async (result: IDetectedBarcode[]) => {
    const guestId = result[0]?.rawValue;
    if (guestId && eventGuests.includes(guestId)) {
      const response = await axiosInstance.put(`/guests/${guestId}/attendance`);
      const guest = response.data.data as Guest;
      setGuest(guest);
    }
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
  }, [facingMode]);

  return (
    <Container>
      <ScannerContainer>
        <Scanner
          key={facingMode} // Forces a re-render when facingMode changes
          classNames={{ container: "scanner", video: "scanner" }}
          components={{ audio: false, torch: true }}
          formats={["qr_code"]}
          onScan={(result) => handleScan(result)}
          constraints={{
            advanced: [{ facingMode: { exact: facingMode } }],
          }}
          styles={{
            finderBorder: -2,
            container: { borderRadius: 20, border: 0 },
            video: { borderRadius: 20, border: 0 },
          }}
        />
      </ScannerContainer>

      <Button onClick={handleSwitchCamera}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12C21 16.9706 16.9706 21 12 21C9.69494 21 7.59227 20.1334 6 18.7083L3 16M3 12C3 7.02944 7.02944 3 12 3C14.3051 3 16.4077 3.86656 18 5.29168L21 8M3 21V16M3 16H8M21 3V8M21 8H16"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Button>
    </Container>
  );
};

export default ScannerComponent;

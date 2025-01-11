import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Header } from "./Events";
import ToastNotification from "./ToastNotification"; // Import the reusable component
import { useNavigate } from "react-router-dom";
const spin = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`;
const Container = styled.div`
  position: absolute;
  bottom: 64px;
  right: 64px;
  width: 76px;
  height: 76px;
  border-radius: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  &:hover {
    animation: ${spin} 6s linear infinite; /* Apply the spin animation */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const ScannerContainer = styled.div`
  width: 800px;
  height: 800px;
`;

const PreembotButton: React.FC = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  return (
    <Container onClick={() => navigate("/preembot")}>
      <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="38"
          cy="38"
          r="32"
          stroke="url(#paint0_radial_351_812)"
          strokeWidth="12"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M48.2359 22.8008H39.0716L38.3774 27.4849H35.0853L33.8768 35.7452H30.2178C27.0623 35.7452 24.6005 36.4533 22.8326 37.8693C21.0646 39.3079 20.0128 41.3083 19.6771 43.8707C19.5428 44.9946 19.5876 46.051 19.8114 47.04C20.0128 48.029 20.4044 48.9281 20.9863 49.7372C21.5681 50.5689 22.4409 51.2207 23.6047 51.6928C24.7684 52.1648 26.1559 52.4008 27.7672 52.4008H36.9316L37.6257 47.7167H40.9179L42.1264 39.4563H45.7854C48.9409 39.4563 51.4026 38.7483 53.1706 37.3322C54.9385 35.8937 55.9903 33.8932 56.326 31.3308C56.4603 30.207 56.4156 29.1506 56.1918 28.1616C55.9903 27.1726 55.5987 26.2735 55.0168 25.4643C54.435 24.6327 53.5622 23.9808 52.3985 23.5088C51.2347 23.0368 49.8472 22.8008 48.2359 22.8008ZM50.0486 28.8022C50.5634 29.3866 50.7648 30.1396 50.6529 31.0611C50.3619 33.3088 48.773 34.4327 45.8861 34.4327H42.8984L43.8384 27.9256H47.8331C48.8178 27.9256 49.5563 28.2178 50.0486 28.8022ZM25.9545 46.3994C25.4398 45.815 25.2384 45.062 25.3502 44.1404C25.6412 41.8927 27.2301 40.7689 30.117 40.7689H33.1047L32.1648 47.276H28.17C27.1854 47.276 26.4468 46.9838 25.9545 46.3994Z"
          fill="#B638AE"
        />
        <defs>
          <radialGradient
            id="paint0_radial_351_812"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(6 38) scale(64 110.358)"
          >
            <stop stopColor="#FFD524" />
            <stop offset="0.5" stopColor="#9C00DF" />
            <stop offset="1" stopColor="#FFD524" />
          </radialGradient>
        </defs>
      </svg>
    </Container>
  );
};

export default PreembotButton;

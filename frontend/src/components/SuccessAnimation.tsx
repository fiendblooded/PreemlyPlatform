import React from "react";
import "./SuccessAnimation.css";

const SuccessAnimation: React.FC<{ animated?: boolean }> = ({
  animated = false,
}) => {
  return (
    <svg
      id="successAnimation"
      className={animated ? "animated" : ""}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 70 70"
    >
      <path
        id="successAnimationResult"
        fill="#FFF"
        opacity="0"
        d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z"
      />
      <circle
        id="successAnimationCircle"
        cx="35"
        cy="35"
        r="24"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray="151 151"
      />
      <polyline
        id="successAnimationCheck"
        stroke="#FFF"
        strokeWidth="2"
        points="23 34 34 43 47 27"
        fill="transparent"
        strokeDasharray="36 36"
      />
    </svg>
  );
};

export default SuccessAnimation;

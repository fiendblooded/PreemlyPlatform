import React from "react";

const BudgetSettingsIcon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 7C2 4.79086 3.79086 3 6 3H18C20.2091 3 22 4.79086 22 7V17C22 19.2091 20.2091 21 18 21H6C3.79086 21 2 19.2091 2 17V7Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M16 14H16.01M12 14H12.01M8 14H8.01M2 9H22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default BudgetSettingsIcon;

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { CategoryBreakdown, Event, Invoice } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { SecondaryButton } from "./EventGuestsEditor";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { format, parseISO, isSameDay } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BudgetWrapper = styled.div`
  width: 90%;
  overflow: hidden;
  margin: 20px auto;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px 0;
  flex-wrap: wrap;
`;

const BudgetTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin: 0 20px 20px;
`;

const Tab = styled.div<{ isActive: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  color: ${(props) => (props.isActive ? "#6b3ddf" : "#666")};
  border-bottom: 2px solid
    ${(props) => (props.isActive ? "#6b3ddf" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #6b3ddf;
  }
`;

const BudgetContent = styled.div`
  display: flex;
  padding: 0 20px 20px;
  gap: 24px;
  height: 700px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const InvoiceListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 16px;
  max-width: 300px;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 300px;
  }
`;

const InvoiceDetailContainer = styled.div`
  flex: 2;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const InvoiceCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: ${(props) => (props.isSelected ? "#e8f0fe" : "white")};
  border-radius: 8px;
  border: 1px solid ${(props) => (props.isSelected ? "#6b3ddf" : "#eee")};
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const InvoiceTitle = styled.h3`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 4px;
  color: #333;
  line-height: 1.3;
`;

const InvoiceDetail = styled.p`
  font-size: 14px;
  margin: 0;
  margin-bottom: 4px;
  color: #666;
`;

const UploadDate = styled.span`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const NewBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  background: linear-gradient(135deg, #2a9134, #3bb143);
  margin-left: 8px;
  vertical-align: middle;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(42, 145, 52, 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(42, 145, 52, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(42, 145, 52, 0);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  height: 100%;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DetailTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PDFPreview = styled.div`
  flex: 1;
  min-height: 500px;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid #eee;
`;

const PDFEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
`;

const PDFPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  background-color: #f0f0f0;
  color: #666;
`;

const UploadContainer = styled.div`
  height: 120px;
  margin: 0 20px;
  box-sizing: border-box;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s ease;
  background-color: #f9f9f9;

  /* Add appear animation */
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    border-color: #6b3ddf;
    background-color: #f5f2ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  color: #6b3ddf;
`;

const UploadText = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  text-align: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const AnalysisContainer = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
`;

const AnalysisTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const AnalysisDate = styled.span`
  font-size: 12px;
  color: #888;
`;

const AnalysisSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #444;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

export const AIButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 20px;
  background: linear-gradient(
    90deg,
    #5e83fb,
    #c054ff,
    #ea5cbe,
    #c054ff,
    #5e83fb
  );
  background-size: 200% 100%;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(192, 84, 255, 0.3);
  animation: gradientMove 3s linear infinite;
  line-height: 24px;
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(192, 84, 255, 0.4);
    animation: gradientMove 1.5s linear infinite;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(192, 84, 255, 0.3);
  }

  &:disabled {
    background: linear-gradient(
      90deg,
      #5e83fb,
      #c054ff,
      #ea5cbe,
      #c054ff,
      #5e83fb
    );
    background-size: 200% 100%;
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    animation: gradientMove 3s linear infinite;
  }
`;

const AnalysisIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M19.6385 19.6387C20.1064 20.1066 20.1098 20.8693 19.5976 21.2884C18.2657 22.3778 16.7112 23.1712 15.0376 23.6091C12.9766 24.1484 10.8093 24.1293 8.75816 23.5538C6.70705 22.9783 4.84611 21.8672 3.36652 20.3345C1.88693 18.8018 0.84202 16.9029 0.339136 14.8327C-0.163748 12.7626 -0.106478 10.5959 0.505062 8.55522C1.1166 6.51454 2.26037 4.67345 3.81886 3.22107C5.37735 1.76869 7.29439 0.75739 9.37304 0.291048C11.06 -0.0874224 12.8041 -0.0958826 14.4863 0.260427C15.1353 0.397894 15.4836 1.07846 15.2824 1.70927C15.0808 2.34126 14.4039 2.68214 13.7503 2.56094C12.4788 2.32512 11.1684 2.34792 9.89841 2.63284C8.23549 3.00591 6.70186 3.81496 5.45506 4.97686C4.20827 6.13876 3.29326 7.61163 2.80402 9.24418C2.31479 10.8767 2.26898 12.6101 2.67128 14.2662C3.07359 15.9223 3.90952 17.4414 5.09319 18.6676C6.27687 19.8937 7.76561 20.7827 9.4065 21.2431C11.0474 21.7035 12.7813 21.7187 14.43 21.2873C15.6895 20.9578 16.8646 20.3766 17.8864 19.5834C18.4109 19.1762 19.1691 19.1693 19.6385 19.6387ZM21.3347 4.45945C20.9176 3.94312 20.15 3.9421 19.6779 4.40882C19.2074 4.87404 19.2102 5.6276 19.6132 6.15228C20.839 7.748 21.5389 9.69801 21.5962 11.7295C21.6535 13.7613 21.0646 15.7479 19.9305 17.4103C19.5579 17.9565 19.5979 18.7088 20.0939 19.1468C20.5915 19.5861 21.3575 19.5421 21.7446 19.0035C23.2722 16.8779 24.0697 14.3003 23.9952 11.6618C23.9208 9.02362 22.9794 6.49538 21.3347 4.45945ZM12.6411 5.75815C12.3993 5.22787 11.6376 5.22786 11.3958 5.75815L11.2432 6.0929C10.3865 7.97173 9.27951 9.72884 7.95154 11.3175L7.73017 11.5823C7.52153 11.8319 7.52153 12.1928 7.73017 12.4424L7.95154 12.7072C9.27951 14.2959 10.3865 16.053 11.2432 17.9319L11.3958 18.2666C11.6376 18.7969 12.3993 18.7969 12.6411 18.2666L12.7937 17.9319C13.6504 16.053 14.7574 14.2959 16.0854 12.7072L16.3068 12.4424C16.5154 12.1928 16.5154 11.8319 16.3068 11.5823L16.0854 11.3175C14.7574 9.72884 13.6504 7.97173 12.7937 6.0929L12.6411 5.75815ZM17.9612 1.58272C17.3845 1.25284 16.6689 1.53027 16.3989 2.13631C16.1294 2.74097 16.4067 3.44295 16.9738 3.78616C17.1414 3.88756 17.3058 3.99407 17.4669 4.10554C18.0131 4.48354 18.7706 4.44916 19.2136 3.95485C19.6552 3.46211 19.6169 2.70013 19.0823 2.30958C18.7224 2.04666 18.3481 1.804 17.9612 1.58272Z"
      fill="white"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16L12 8"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9 13L11.913 15.913V15.913C11.961 15.961 12.039 15.961 12.087 15.913V15.913L15 13"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M3 15L3 16L3 19C3 20.1046 3.89543 21 5 21L19 21C20.1046 21 21 20.1046 21 19L21 16L21 15"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M10 11V17"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14 11V17"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4 7H20"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8 7L8.78376 4.65396C8.91065 4.27038 9.26168 4 9.66087 4H14.3391C14.7383 4 15.0894 4.27038 15.2162 4.65396L16 7"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const IconButton = styled(SecondaryButton)`
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CategoryCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const CategoryAmount = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #6b3ddf;
`;

const CategoryProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const CategoryProgressFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background-color: ${(props) => props.color};
  border-radius: 4px;
`;

const CategoryPercentage = styled.div<{ color: string }>`
  font-size: 14px;
  color: #666;
`;

const VendorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const VendorCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
`;

const VendorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const VendorName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const VendorAmount = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #6b3ddf;
`;

const VendorDetail = styled.div`
  font-size: 14px;
  color: #666;
`;

// Due Date Calendar Styled Components
const CalendarContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const CalendarWrapper = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const DueDatesList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DueDateSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-height: 300px;
  overflow-y: auto;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #6b3ddf;
`;

const CountBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #6b3ddf;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  padding: 2px 8px;
  margin-left: 8px;
`;

const DueDateItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DueDateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DueDateTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const DueDateDate = styled.div`
  font-size: 14px;
  color: #666;
`;

const DueDateAmount = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #6b3ddf;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CalendarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CalendarNavigation = styled.div`
  display: flex;
  gap: 8px;
`;

const CalendarButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #e9e9e9;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const CalendarDay = styled.div<{
  isToday?: boolean;
  hasDueDate?: boolean;
  isCurrentMonth?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  position: relative;
  cursor: ${(props) => (props.hasDueDate ? "pointer" : "default")};
  background: ${(props) =>
    props.isToday ? "#f0f0ff" : props.hasDueDate ? "#f9f5ff" : "transparent"};
  color: ${(props) => (props.isCurrentMonth ? "#333" : "#ccc")};
  font-weight: ${(props) =>
    props.isToday || props.hasDueDate ? "600" : "normal"};

  &:hover {
    background: ${(props) =>
      props.hasDueDate ? "#f0e6ff" : props.isToday ? "#e6e6ff" : "transparent"};
  }

  &::after {
    content: "";
    display: ${(props) => (props.hasDueDate ? "block" : "none")};
    position: absolute;
    bottom: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6b3ddf;
  }
`;

const DayOfWeek = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  padding: 8px 0;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const PastDueDateItem = styled(DueDateItem)`
  opacity: 0.7;
  background-color: #f9f9f9;
`;

const UpcomingIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PastIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8V12L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AnalysisWrapper = styled.div`
  padding: 0 20px 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;
// Add this function to generate colors for the chart
const generateCategoryColors = (count: number) => {
  const baseColors = [
    "rgba(107, 61, 223, 0.8)", // Primary purple
    "rgba(66, 133, 244, 0.8)", // Blue
    "rgba(219, 68, 55, 0.8)", // Red
    "rgba(244, 180, 0, 0.8)", // Yellow
    "rgba(15, 157, 88, 0.8)", // Green
    "rgba(171, 71, 188, 0.8)", // Purple
    "rgba(255, 112, 67, 0.8)", // Orange
    "rgba(0, 172, 193, 0.8)", // Teal
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
};

const EventBudgetEditor: React.FC<{
  event: Event;
  refetch: () => void;
}> = ({ event, refetch }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [analyzingInvoices, setAnalyzingInvoices] = useState(false);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "invoices" | "analysis" | "dueDate"
  >("invoices");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const axiosInstance = useAxiosWithAuth();

  // Set default tab to "invoices" when component mounts
  useEffect(() => {
    setActiveTab("invoices");
  }, []);
  console.log(invoices);
  // Fetch invoices when the component mounts or when the event changes
  useEffect(() => {
    if (event) {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/${event._id}/invoices`);
      const fetchedInvoices = response.data.data;
      setInvoices(fetchedInvoices);

      // Select the first invoice by default if available and none is selected
      if (fetchedInvoices.length > 0 && !selectedInvoice) {
        setSelectedInvoice(fetchedInvoices[0]);
      } else if (selectedInvoice) {
        // If an invoice was selected, find and select it again (if it still exists)
        const existingInvoice = fetchedInvoices.find(
          (inv: Invoice) => inv._id === selectedInvoice._id
        );
        if (existingInvoice) {
          setSelectedInvoice(existingInvoice);
        } else if (fetchedInvoices.length > 0) {
          setSelectedInvoice(fetchedInvoices[0]);
        } else {
          setSelectedInvoice(null);
        }
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      addToast("Failed to load invoices", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        addToast("Please upload a PDF file", ToastType.ERROR);
        return;
      }
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("invoice", file);

    // Add current date as default
    const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
    formData.append("date", currentDate);

    try {
      setShowUploadArea(false);
      await axiosInstance.post(`/events/${event._id}/invoices`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      addToast("Invoice uploaded successfully", ToastType.SUCCESS);
      fetchInvoices();
      refetch();
    } catch (error) {
      console.error("Error uploading invoice:", error);
      addToast("Failed to upload invoice", ToastType.ERROR);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setDeletingInvoiceId(id);
      await axiosInstance.delete(`/events/invoices/${id}`);
      addToast("Invoice deleted successfully", ToastType.SUCCESS);

      // If the deleted invoice was selected, clear selection
      if (selectedInvoice && selectedInvoice._id === id) {
        setSelectedInvoice(null);
      }

      // Just fetch invoices without refetching the entire event
      // to avoid triggering tab changes
      void fetchInvoices();

      // Refetch the event data without changing tabs
      void refetch();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      addToast("Failed to delete invoice", ToastType.ERROR);
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  const handleAnalyzeInvoices = async () => {
    if (!invoices || invoices.length === 0) {
      addToast("No invoices to analyze", ToastType.ERROR);
      return;
    }

    try {
      setAnalyzingInvoices(true);
      await axiosInstance.post(`/events/${event._id}/invoices/analyze`);

      addToast("Invoices analyzed successfully", ToastType.SUCCESS);

      // First refetch the event data
      await refetch();

      // Then switch to analysis tab after successful analysis
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error analyzing invoices:", error);
      addToast("Failed to analyze invoices", ToastType.ERROR);
    } finally {
      setAnalyzingInvoices(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatUploadDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return { text: "Today", isRecent: true };
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return { text: "Yesterday", isRecent: true };
    }

    // Otherwise return formatted date
    return {
      text: date.toLocaleDateString(),
      isRecent: now.getTime() - date.getTime() < 3 * 24 * 60 * 60 * 1000, // 3 days
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // Add this function before renderAnalysis
  const aggregateCategories = (categories: CategoryBreakdown[]) => {
    if (!categories || categories.length === 0) return [];

    const aggregatedMap = new Map<string, CategoryBreakdown>();

    // Group categories by name and sum their amounts
    categories.forEach((category) => {
      const categoryName = category.category || "Miscellaneous";

      if (aggregatedMap.has(categoryName)) {
        const existing = aggregatedMap.get(categoryName)!;
        existing.amount += category.amount || 0;
        // We'll recalculate percentages after aggregation
      } else {
        aggregatedMap.set(categoryName, {
          ...category,
          category: categoryName,
          amount: category.amount || 0,
        });
      }
    });

    // Convert map to array
    const aggregatedCategories = Array.from(aggregatedMap.values());

    // Recalculate percentages based on total
    const totalAmount = aggregatedCategories.reduce(
      (sum, cat) => sum + (cat.amount || 0),
      0
    );

    return aggregatedCategories
      .map((cat) => ({
        ...cat,
        percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  };

  const renderAnalysis = () => {
    if (!event.invoiceAnalysis || !event.invoiceAnalysis.budgetSummary)
      return null;

    const analysis = event.invoiceAnalysis;
    const lastUpdated = new Date(analysis.lastUpdated);
    console.log({ analysis });
    // Use monthly spending data from API if available, otherwise use local calculation
    const monthlySpendingData =
      analysis.performanceInsights?.monthlySpending &&
      analysis.performanceInsights.monthlySpending.length >= 2
        ? getMonthlySpendingDataFromAPI(
            analysis.performanceInsights.monthlySpending
          )
        : getMonthlySpendingData();

    // Check if the analysis data is incomplete
    const isIncompleteAnalysis =
      !analysis.budgetSummary?.totalSpend &&
      (!analysis.costBreakdown?.categories ||
        analysis.costBreakdown.categories.length === 0) &&
      (!analysis.costBreakdown?.vendors ||
        analysis.costBreakdown.vendors.length === 0);

    return (
      <AnalysisContainer>
        <AnalysisHeader>
          <AnalysisTitle>AI Budget Analysis</AnalysisTitle>
          <AnalysisDate>
            Performed on {lastUpdated.toLocaleDateString()}{" "}
            {lastUpdated.toLocaleTimeString()}
          </AnalysisDate>
        </AnalysisHeader>

        {isIncompleteAnalysis ? (
          <EmptyState>
            <EmptyStateIcon>⚠️</EmptyStateIcon>
            <p>
              The analysis results appear to be incomplete. This might happen if
              your invoices don't contain enough information. Try adding more
              detailed invoices or contact support if this issue persists.
            </p>
          </EmptyState>
        ) : (
          <>
            <AnalysisSection>
              <SectionTitle>Budget Summary</SectionTitle>
              <StatGrid>
                <StatCard>
                  <StatLabel>Total Spend</StatLabel>
                  <StatValue>
                    {formatCurrency(analysis.budgetSummary?.totalSpend)}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Invoices Processed</StatLabel>
                  <StatValue>
                    {analysis.budgetSummary?.invoiceCount || 0}
                  </StatValue>
                </StatCard>
                {/* <StatCard>
                  <StatLabel>Paid Invoices</StatLabel>
                  <StatValue>
                    {analysis.budgetSummary?.paidInvoices || 0}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Unpaid Invoices</StatLabel>
                  <StatValue>
                    {analysis.budgetSummary?.unpaidInvoices || 0}
                  </StatValue>
                </StatCard> */}
                {analysis.budgetSummary?.budgetVariance && (
                  <StatCard>
                    <StatLabel>Budget Variance</StatLabel>
                    <StatValue>
                      {formatCurrency(
                        analysis.budgetSummary.budgetVariance.amount
                      )}
                      {analysis.budgetSummary.budgetVariance.percentage !==
                        undefined && (
                        <>
                          (
                          {analysis.budgetSummary.budgetVariance.percentage > 0
                            ? "+"
                            : ""}
                          {analysis.budgetSummary.budgetVariance.percentage}%)
                        </>
                      )}
                    </StatValue>
                  </StatCard>
                )}
              </StatGrid>
            </AnalysisSection>

            <AnalysisSection>
              <SectionTitle>Monthly Spending Trend</SectionTitle>
              {monthlySpendingData ? (
                <ChartContainer
                  style={{
                    padding: "24px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Bar
                    data={{
                      ...monthlySpendingData,
                      datasets: [
                        {
                          ...monthlySpendingData.datasets[0],
                          backgroundColor: "rgba(107, 61, 223, 0.7)",
                          borderColor: "#6b3ddf",
                          borderWidth: 1,
                          borderRadius: 4,
                          hoverBackgroundColor: "rgba(107, 61, 223, 0.9)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Amount",
                            font: {
                              weight: "bold",
                            },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function (tooltipItem) {
                              return `${
                                tooltipItem.dataset.label
                              }: ${formatCurrency(Number(tooltipItem.raw))}`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </ChartContainer>
              ) : (
                <EmptyState>
                  <EmptyStateIcon>📊</EmptyStateIcon>
                  <p>
                    Not enough data to display monthly spending trends. Please
                    ensure your invoices have dates and amounts.
                  </p>
                </EmptyState>
              )}
            </AnalysisSection>

            <AnalysisSection>
              {analysis.costBreakdown?.categories &&
                analysis.costBreakdown.categories.length > 0 && (
                  <div>
                    <SectionTitle>Cost Breakdown by Category</SectionTitle>

                    {/* Add Doughnut Chart */}
                    <div style={{ height: "300px", marginBottom: "20px" }}>
                      <Doughnut
                        data={{
                          labels: aggregateCategories(
                            analysis.costBreakdown.categories
                          ).map((cat) => cat.category),
                          datasets: [
                            {
                              data: aggregateCategories(
                                analysis.costBreakdown.categories
                              ).map((cat) => cat.amount),
                              backgroundColor: generateCategoryColors(
                                aggregateCategories(
                                  analysis.costBreakdown.categories
                                ).length
                              ),
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                              labels: {
                                boxWidth: 15,
                                padding: 15,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const value = context.raw as number;
                                  return `${context.label}: ${formatCurrency(
                                    value
                                  )} (${(
                                    (context.parsed /
                                      context.dataset.data.reduce(
                                        (a, b) => (a as number) + (b as number),
                                        0
                                      )) *
                                    100
                                  ).toFixed(1)}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    {/* Keep the existing category cards */}
                    {aggregateCategories(analysis.costBreakdown.categories).map(
                      (category, index) => {
                        // Get the same color that's used in the pie chart
                        const colors = generateCategoryColors(
                          aggregateCategories(analysis.costBreakdown.categories)
                            .length
                        );
                        const categoryColor = colors[index];

                        return (
                          <CategoryCard key={index}>
                            <CategoryHeader>
                              <CategoryName>
                                {category.category || "Unknown"}
                              </CategoryName>
                              <CategoryAmount>
                                {formatCurrency(category.amount)}
                              </CategoryAmount>
                            </CategoryHeader>
                            <CategoryProgressBar>
                              <CategoryProgressFill
                                percentage={category.percentage || 0}
                                color={categoryColor}
                              />
                            </CategoryProgressBar>
                            <CategoryPercentage color={categoryColor}>
                              {category.percentage !== undefined
                                ? `${category.percentage.toFixed(
                                    1
                                  )}% of total spend`
                                : "N/A"}
                            </CategoryPercentage>
                          </CategoryCard>
                        );
                      }
                    )}
                  </div>
                )}

              {/* {analysis.costBreakdown?.topCategories &&
                analysis.costBreakdown.topCategories.length > 0 && (
                  <>
                    <SectionTitle>Top Cost Categories</SectionTitle>
                    <StatGrid>
                      {analysis.costBreakdown.topCategories.map(
                        (category, index) => (
                          <StatCard key={index}>
                            <StatLabel>#{index + 1}</StatLabel>
                            <StatValue>{category || "N/A"}</StatValue>
                          </StatCard>
                        )
                      )}
                    </StatGrid>
                  </>
                )} */}

              {analysis.costBreakdown?.vendors &&
                analysis.costBreakdown.vendors.length > 0 && (
                  <>
                    <SectionTitle>Vendor Analysis</SectionTitle>
                    <VendorGrid>
                      {analysis.costBreakdown.vendors.map((vendor, index) => (
                        <VendorCard key={index}>
                          <VendorHeader>
                            <VendorName>
                              {vendor.vendor || "Unknown"}
                            </VendorName>
                            <VendorAmount>
                              {formatCurrency(vendor.amount)}
                            </VendorAmount>
                          </VendorHeader>
                          <VendorDetail>
                            {vendor.invoiceCount || 0}{" "}
                            {vendor.invoiceCount === 1 ? "invoice" : "invoices"}
                          </VendorDetail>
                        </VendorCard>
                      ))}
                    </VendorGrid>
                  </>
                )}
            </AnalysisSection>

            {/* {analysis.performanceInsights && (
              <AnalysisSection>
                <SectionTitle>Performance Insights</SectionTitle>
                <StatGrid>
                  {analysis.performanceInsights.costPerAttendee !==
                    undefined && (
                    <StatCard>
                      <StatLabel>Cost per Attendee</StatLabel>
                      <StatValue>
                        {formatCurrency(
                          analysis.performanceInsights.costPerAttendee
                        )}
                      </StatValue>
                    </StatCard>
                  )}
                  {analysis.performanceInsights.costPerLead !== undefined && (
                    <StatCard>
                      <StatLabel>Cost per Lead</StatLabel>
                      <StatValue>
                        {formatCurrency(
                          analysis.performanceInsights.costPerLead
                        )}
                      </StatValue>
                    </StatCard>
                  )}
                  {analysis.performanceInsights.profitabilityEstimate !==
                    undefined && (
                    <StatCard>
                      <StatLabel>Profitability Estimate</StatLabel>
                      <StatValue>
                        {formatCurrency(
                          analysis.performanceInsights.profitabilityEstimate
                        )}
                      </StatValue>
                    </StatCard>
                  )}
                </StatGrid>

                {analysis.performanceInsights.costComparison && (
                  <InvoiceDetail>
                    <strong>Cost Comparison:</strong>{" "}
                    {analysis.performanceInsights.costComparison}
                  </InvoiceDetail>
                )}

                {analysis.performanceInsights.yearOverYearTrend && (
                  <InvoiceDetail>
                    <strong>Year-Over-Year Trend:</strong>{" "}
                    {analysis.performanceInsights.yearOverYearTrend}
                  </InvoiceDetail>
                )}

                {analysis.performanceInsights.peakSpendingPeriods &&
                  analysis.performanceInsights.peakSpendingPeriods.length >
                    0 && (
                    <div>
                      <strong>Peak Spending Periods:</strong>
                      <ul>
                        {analysis.performanceInsights.peakSpendingPeriods.map(
                          (period, index) => (
                            <li key={index}>{period}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </AnalysisSection>
            )} */}
          </>
        )}
      </AnalysisContainer>
    );
  };

  const renderInvoicesTab = () => (
    <BudgetContent>
      <InvoiceListContainer>
        {loading ? (
          <EmptyState>Loading...</EmptyState>
        ) : invoices.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📄</EmptyStateIcon>
            <p>
              No invoices yet. Upload your first invoice to start tracking your
              budget.
            </p>
          </EmptyState>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              isSelected={selectedInvoice?._id === invoice._id}
              onClick={() => setSelectedInvoice(invoice)}
              style={{ opacity: deletingInvoiceId === invoice._id ? 0.5 : 1 }}
            >
              <InvoiceTitle>
                {invoice.title}
                {formatUploadDate(invoice.createdAt).isRecent && (
                  <NewBadge>NEW</NewBadge>
                )}
                {deletingInvoiceId === invoice._id && (
                  <LoadingSpinner
                    style={{ marginLeft: "8px", width: "12px", height: "12px" }}
                  />
                )}
              </InvoiceTitle>
              {invoice.vendor && (
                <InvoiceDetail>Vendor: {invoice.vendor}</InvoiceDetail>
              )}
              <UploadDate>
                Uploaded: {formatUploadDate(invoice.createdAt).text}
              </UploadDate>
            </InvoiceCard>
          ))
        )}
      </InvoiceListContainer>

      <InvoiceDetailContainer>
        {selectedInvoice ? (
          <>
            <DetailHeader>
              <DetailTitle>{selectedInvoice.title}</DetailTitle>
              <HeaderActions>
                <IconButton
                  onClick={() => window.open(selectedInvoice.pdfUrl, "_blank")}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteInvoice(selectedInvoice._id)}
                  color="#e40000"
                  disabled={deletingInvoiceId === selectedInvoice._id}
                >
                  {deletingInvoiceId === selectedInvoice._id ? (
                    <LoadingSpinner />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </HeaderActions>
            </DetailHeader>

            <PDFPreview>
              {selectedInvoice?.pdfUrl ? (
                <PDFEmbed
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    selectedInvoice.pdfUrl
                  )}&embedded=true`}
                  title={`PDF preview for ${selectedInvoice.title}`}
                />
              ) : (
                <PDFPlaceholder>
                  <EmptyStateIcon>📄</EmptyStateIcon>
                  <p>PDF preview not available</p>
                </PDFPlaceholder>
              )}
            </PDFPreview>
          </>
        ) : (
          <EmptyState>
            <EmptyStateIcon>📋</EmptyStateIcon>
            <p>
              {invoices.length > 0
                ? "Select an invoice from the list to view details"
                : "Upload your first invoice to get started"}
            </p>
          </EmptyState>
        )}
      </InvoiceDetailContainer>
    </BudgetContent>
  );

  const renderAnalysisTab = () => {
    // If analysis is in progress, show the loading animation
    if (analyzingInvoices) {
      return (
        <AnalysisWrapper>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ marginBottom: "20px" }}>
              <LoadingSpinner
                style={{ width: "40px", height: "40px", margin: "0 auto" }}
              />
            </div>
            <h3>AI is analyzing your invoices</h3>
            <p style={{ color: "#666", fontSize: "14px" }}>
              This may take a moment as we process your data to generate
              insights...
            </p>
          </div>
        </AnalysisWrapper>
      );
    }

    // If there's no analysis data or the analysis is incomplete
    if (!event.invoiceAnalysis || !event.invoiceAnalysis.budgetSummary) {
      // Check if there are any invoices
      if (invoices.length === 0) {
        return (
          <AnalysisWrapper>
            <EmptyState>
              <EmptyStateIcon>📄</EmptyStateIcon>
              <p>
                No invoices available. Please upload some invoices in the
                Invoices tab before performing an analysis.
              </p>
            </EmptyState>
          </AnalysisWrapper>
        );
      } else {
        return (
          <AnalysisWrapper>
            <EmptyState>
              <EmptyStateIcon>📊</EmptyStateIcon>
              <p>
                No analysis has been performed yet. Click the "Analyze with AI"
                button above to generate insights from your invoices.
              </p>
            </EmptyState>
          </AnalysisWrapper>
        );
      }
    }

    return <AnalysisWrapper>{renderAnalysis()}</AnalysisWrapper>;
  };

  const renderDueDateTab = () => {
    // Get due dates from the analysis
    const dueDates = event.invoiceAnalysis?.dueDates || [];

    if (dueDates.length === 0) {
      return (
        <AnalysisWrapper>
          <EmptyState>
            <EmptyStateIcon>📅</EmptyStateIcon>
            <p>
              No due dates available. Upload invoices with due date information
              to see them here.
            </p>
          </EmptyState>
        </AnalysisWrapper>
      );
    }

    // Parse due dates
    const parsedDueDates = dueDates.map((dueDate) => ({
      ...dueDate,
      parsedDate: parseISO(dueDate.date),
    }));

    // Sort due dates by date (closest first)
    const sortedDueDates = [...parsedDueDates].sort(
      (a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()
    );

    // Separate upcoming and past due dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    const upcomingDueDates = sortedDueDates.filter(
      (dueDate) => dueDate.parsedDate >= today
    );

    const pastDueDates = sortedDueDates
      .filter((dueDate) => dueDate.parsedDate < today)
      .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()); // Most recent first

    // Get days with due dates for the selected month
    const getDaysWithDueDates = () => {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      return parsedDueDates.filter(
        (dueDate) =>
          dueDate.parsedDate.getFullYear() === year &&
          dueDate.parsedDate.getMonth() === month
      );
    };

    // Get due dates for the selected date
    const getDueDatesForSelectedDate = () => {
      if (!selectedDate) return [];

      return parsedDueDates.filter((dueDate) =>
        isSameDay(dueDate.parsedDate, selectedDate)
      );
    };

    // Generate calendar days
    const generateCalendarDays = () => {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);

      // Day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay();

      // Total days in the month
      const daysInMonth = lastDay.getDate();

      // Days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek;

      // Get days with due dates
      const daysWithDueDates = getDaysWithDueDates();

      // Calendar days
      const days = [];

      // Add days from previous month
      const prevMonth = new Date(year, month - 1, 0);
      const prevMonthDays = prevMonth.getDate();

      for (
        let i = prevMonthDays - daysFromPrevMonth + 1;
        i <= prevMonthDays;
        i++
      ) {
        const date = new Date(year, month - 1, i);
        const hasDueDate = parsedDueDates.some((dueDate) =>
          isSameDay(dueDate.parsedDate, date)
        );

        days.push({
          date,
          day: i,
          isCurrentMonth: false,
          isToday: isSameDay(date, new Date()),
          hasDueDate,
        });
      }

      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const hasDueDate = daysWithDueDates.some(
          (dueDate) => dueDate.parsedDate.getDate() === i
        );

        days.push({
          date,
          day: i,
          isCurrentMonth: true,
          isToday: isSameDay(date, new Date()),
          hasDueDate,
        });
      }

      // Add days from next month to complete the grid
      const totalDaysToShow =
        Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
      const daysFromNextMonth =
        totalDaysToShow - (daysFromPrevMonth + daysInMonth);

      for (let i = 1; i <= daysFromNextMonth; i++) {
        const date = new Date(year, month + 1, i);
        const hasDueDate = parsedDueDates.some((dueDate) =>
          isSameDay(dueDate.parsedDate, date)
        );

        days.push({
          date,
          day: i,
          isCurrentMonth: false,
          isToday: isSameDay(date, new Date()),
          hasDueDate,
        });
      }

      return days;
    };

    // Navigate to previous month
    const goToPrevMonth = () => {
      setSelectedMonth(
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
      );
    };

    // Navigate to next month
    const goToNextMonth = () => {
      setSelectedMonth(
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
      );
    };

    // Handle day click
    const handleDayClick = (day: { date: Date; hasDueDate: boolean }) => {
      if (day.hasDueDate) {
        setSelectedDate(day.date);
      }
    };

    const calendarDays = generateCalendarDays();
    const selectedDueDates = getDueDatesForSelectedDate();

    // Filter selected due dates into upcoming and past
    const selectedUpcomingDueDates = selectedDueDates.filter(
      (dueDate) => dueDate.parsedDate >= today
    );

    const selectedPastDueDates = selectedDueDates
      .filter((dueDate) => dueDate.parsedDate < today)
      .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()); // Most recent first

    return (
      <AnalysisWrapper>
        <CalendarContainer>
          <CalendarWrapper>
            <CalendarHeader>
              <CalendarTitle>
                {format(selectedMonth, "MMMM yyyy")}
              </CalendarTitle>
              <CalendarNavigation>
                <CalendarButton onClick={goToPrevMonth}>
                  Previous
                </CalendarButton>
                <CalendarButton onClick={goToNextMonth}>Next</CalendarButton>
              </CalendarNavigation>
            </CalendarHeader>

            <CalendarGrid>
              {/* Days of the week */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <DayOfWeek key={day}>{day}</DayOfWeek>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => (
                <CalendarDay
                  key={index}
                  isToday={day.isToday}
                  hasDueDate={day.hasDueDate}
                  isCurrentMonth={day.isCurrentMonth}
                  onClick={() => handleDayClick(day)}
                >
                  {day.day}
                </CalendarDay>
              ))}
            </CalendarGrid>
          </CalendarWrapper>

          <DueDatesList>
            {/* Upcoming Due Dates Section */}
            <DueDateSection>
              <SectionHeader>
                <SectionIcon>
                  <UpcomingIcon />
                </SectionIcon>
                <CalendarTitle>
                  {selectedDate
                    ? `Upcoming Due Dates for ${format(
                        selectedDate,
                        "MMMM d, yyyy"
                      )}`
                    : "Upcoming Due Dates"}
                </CalendarTitle>
                {(selectedDate
                  ? selectedUpcomingDueDates.length
                  : upcomingDueDates.length) > 0 && (
                  <CountBadge>
                    {selectedDate
                      ? selectedUpcomingDueDates.length
                      : upcomingDueDates.length}
                  </CountBadge>
                )}
              </SectionHeader>

              {(selectedDate ? selectedUpcomingDueDates : upcomingDueDates).map(
                (dueDate, index) => (
                  <DueDateItem key={index}>
                    <DueDateInfo>
                      <DueDateTitle>{dueDate.title}</DueDateTitle>
                      <DueDateDate>
                        {format(dueDate.parsedDate, "MMMM d, yyyy")}
                      </DueDateDate>
                    </DueDateInfo>
                    {dueDate.amount && (
                      <DueDateAmount>
                        {formatCurrency(dueDate.amount)}
                      </DueDateAmount>
                    )}
                  </DueDateItem>
                )
              )}

              {selectedDate && selectedUpcomingDueDates.length === 0 && (
                <NoDataMessage>
                  No upcoming due dates for the selected day.
                </NoDataMessage>
              )}

              {!selectedDate && upcomingDueDates.length === 0 && (
                <NoDataMessage>No upcoming due dates.</NoDataMessage>
              )}
            </DueDateSection>

            {/* Past Due Dates Section */}
            <DueDateSection>
              <SectionHeader>
                <SectionIcon>
                  <PastIcon />
                </SectionIcon>
                <CalendarTitle>
                  {selectedDate
                    ? `Past Due Dates for ${format(
                        selectedDate,
                        "MMMM d, yyyy"
                      )}`
                    : "Past Due Dates"}
                </CalendarTitle>
                {(selectedDate
                  ? selectedPastDueDates.length
                  : pastDueDates.length) > 0 && (
                  <CountBadge>
                    {selectedDate
                      ? selectedPastDueDates.length
                      : pastDueDates.length}
                  </CountBadge>
                )}
              </SectionHeader>

              {(selectedDate ? selectedPastDueDates : pastDueDates).map(
                (dueDate, index) => (
                  <PastDueDateItem key={index}>
                    <DueDateInfo>
                      <DueDateTitle>{dueDate.title}</DueDateTitle>
                      <DueDateDate>
                        {format(dueDate.parsedDate, "MMMM d, yyyy")}
                      </DueDateDate>
                    </DueDateInfo>
                    {dueDate.amount && (
                      <DueDateAmount>
                        {formatCurrency(dueDate.amount)}
                      </DueDateAmount>
                    )}
                  </PastDueDateItem>
                )
              )}

              {selectedDate && selectedPastDueDates.length === 0 && (
                <NoDataMessage>
                  No past due dates for the selected day.
                </NoDataMessage>
              )}

              {!selectedDate && pastDueDates.length === 0 && (
                <NoDataMessage>No past due dates.</NoDataMessage>
              )}
            </DueDateSection>
          </DueDatesList>
        </CalendarContainer>
      </AnalysisWrapper>
    );
  };

  // Extract monthly spending data from actual invoices only
  const getMonthlySpendingData = () => {
    if (!invoices || invoices.length === 0) {
      return null;
    }

    // Create a map to store spending by month
    const monthlySpending = new Map<string, number>();

    // Process each invoice
    invoices.forEach((invoice) => {
      if (invoice.amount && invoice.date) {
        const date = new Date(invoice.date);
        const monthYear = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;

        // Add to existing month or create new entry
        const currentAmount = monthlySpending.get(monthYear) || 0;
        monthlySpending.set(monthYear, currentAmount + invoice.amount);
      }
    });

    // If we don't have enough data, return null
    if (monthlySpending.size < 2) {
      return null;
    }

    // Sort the entries by date
    const sortedEntries = Array.from(monthlySpending.entries()).sort((a, b) => {
      const [monthA, yearA] = a[0].split(" ");
      const [monthB, yearB] = b[0].split(" ");

      // First compare years
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }

      // Then compare months
      const monthsOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return monthsOrder.indexOf(monthA) - monthsOrder.indexOf(monthB);
    });

    // Prepare data for Chart.js
    const labels = sortedEntries.map((entry) => entry[0]);
    const data = sortedEntries.map((entry) => entry[1]);

    return {
      labels,
      datasets: [
        {
          label: "Monthly Spend",
          data,
          backgroundColor: "rgba(107, 61, 223, 0.7)",
          borderColor: "#6b3ddf",
          borderWidth: 1,
        },
      ],
    };
  };

  // Convert API monthly spending data to Chart.js format
  const getMonthlySpendingDataFromAPI = (
    monthlySpending: { month: string; amount: number }[]
  ) => {
    if (!monthlySpending || monthlySpending.length < 2) {
      return null;
    }

    // Sort the entries by date
    const sortedEntries = [...monthlySpending].sort((a, b) => {
      // Assuming month is in YYYY-MM format
      return a.month.localeCompare(b.month);
    });

    // Format the labels to be more readable (convert YYYY-MM to Month YYYY)
    const labels = sortedEntries.map((entry) => {
      const [year, month] = entry.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return `${date.toLocaleString("default", { month: "long" })} ${year}`;
    });

    const data = sortedEntries.map((entry) => entry.amount);

    return {
      labels,
      datasets: [
        {
          label: "Monthly Spend",
          data,
          backgroundColor: "rgba(107, 61, 223, 0.7)",
          borderColor: "#6b3ddf",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <BudgetWrapper>
      <BudgetHeader>
        <BudgetTitle>Budget & Invoices</BudgetTitle>
        {activeTab === "invoices" && (
          <ButtonsContainer>
            <SecondaryButton onClick={() => setShowUploadArea(!showUploadArea)}>
              {showUploadArea ? "Cancel" : "Upload Invoice"}
            </SecondaryButton>

            {invoices && invoices.length > 0 && (
              <AIButton
                onClick={handleAnalyzeInvoices}
                disabled={analyzingInvoices}
              >
                {analyzingInvoices ? (
                  <>
                    <LoadingSpinner /> Analyzing...
                  </>
                ) : (
                  <>
                    <AnalysisIcon />
                    Analyze with AI
                  </>
                )}
              </AIButton>
            )}
          </ButtonsContainer>
        )}
      </BudgetHeader>

      <TabsContainer>
        <Tab
          isActive={activeTab === "invoices"}
          onClick={() => setActiveTab("invoices")}
        >
          Invoices
        </Tab>
        <Tab
          isActive={activeTab === "analysis"}
          onClick={() => setActiveTab("analysis")}
        >
          Analysis
        </Tab>
        <Tab
          isActive={activeTab === "dueDate"}
          onClick={() => setActiveTab("dueDate")}
        >
          Due Dates
        </Tab>
      </TabsContainer>

      {showUploadArea && activeTab === "invoices" && (
        <UploadContainer onClick={triggerFileInput}>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <UploadIcon>📄</UploadIcon>
          <UploadText>
            Click to select a PDF invoice or drag and drop here
          </UploadText>
        </UploadContainer>
      )}

      {activeTab === "invoices" && renderInvoicesTab()}
      {activeTab === "analysis" && renderAnalysisTab()}
      {activeTab === "dueDate" && renderDueDateTab()}
    </BudgetWrapper>
  );
};

export default EventBudgetEditor;

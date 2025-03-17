import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Event } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { getMailHtml, SvgSC } from "../common/common";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
// import { ActivityStatus } from "./EventDetail";

const GuestsWrapper = styled.div`
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

const GuestTableHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #f9f9f9;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #888;
  pointer-events: none;
`;

const StyledCheckbox = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: rgb(107, 61, 223);
  background-color: white;
  border: 1.5px solid #aaa;
  color-scheme: light; /* Force light mode appearance */

  &:not(:checked) {
    background-color: transparent;
  }
`;

const ScrollableTable = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;

    th,
    td {
      padding: 14px 16px;
      text-align: left;
      vertical-align: middle;
    }

    th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
      position: sticky;
      top: 0;
      z-index: 10;
      white-space: nowrap;

      &:first-child {
        border-top-left-radius: 8px;
      }

      &:last-child {
        border-top-right-radius: 8px;
      }
    }

    tr {
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(107, 61, 223, 0.03);
      }

      &:not(:last-child) td {
        border-bottom: 1px solid #e9ecef;
      }
    }

    td {
      color: #333;

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;

        &:focus {
          border-color: rgb(107, 61, 223);
          box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
          outline: none;
        }
      }
    }
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgb(184, 28, 10);
    background-color: rgba(237, 72, 54, 0.1);
  }
`;

const ActivityStatus = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.color};
  background-color: ${(props) => props.color}15; /* 10% opacity */
`;

const ReminderStatus = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  border-radius: 4px;
  padding: 6px 8px;
  background-color: ${(props) => props.color}33; /* 20% opacity */
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .status-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .date-time {
    font-weight: 600;
    white-space: nowrap;
  }
`;

export const PrimaryButton = styled.button<{
  marginTop?: number;
  width?: number;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: rgb(107, 61, 223);
  border: none;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(107, 61, 223, 0.2);

  &:hover {
    background-color: rgb(126, 87, 231);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(107, 61, 223, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(107, 61, 223, 0.2);
  }

  &:disabled {
    background-color: #c5c5c5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
export const SecondaryButton = styled.button<{
  marginTop?: number;
  width?: number;
}>`
  width: ${(props) => (props.width ? props.width : 160)}px;
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)}px;
  background-color: white;
  border: 2px solid rgb(107, 61, 223);
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(107, 61, 223);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(107, 61, 223, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(107, 61, 223, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    border-color: #c5c5c5;
    color: #c5c5c5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ExcelButton = styled(SecondaryButton)`
  background-color: #217346; // Excel green
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  width: 180px;
  &:hover {
    background-color: #1e5e3e;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Add this component for the Excel icon
const ExcelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM14.25 21v-3H7.5v3zm0-4.5v-3.75H7.5v3.75zm0-5.25V7.5H7.5v3.75zm0-5.25V3H7.5v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3z" />
  </svg>
);

// Add a TestButton component
// const TestButton = styled.button`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   background-color: #f3f4f6;
//   color: #4b5563;
//   border: 1px solid #d1d5db;
//   border-radius: 6px;
//   padding: 8px 12px;
//   font-size: 14px;
//   font-weight: 500;
//   cursor: pointer;
//   transition: all 0.2s ease;

//   &:hover {
//     background-color: #e5e7eb;
//   }

//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }
// `;

// Add a TestIcon component
// const TestIcon = () => (
//   <svg
//     width="16"
//     height="16"
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"
//       fill="currentColor"
//     />
//   </svg>
// );

export const GuestActionsButtonsContainer = styled.div<{ width?: number }>`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: start;
  ${(props) => props.width && `width: ${props.width}px;`}
`;

const SeletedGuestsSC = styled.div`
  height: 38px;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: rgba(107, 61, 223, 0.08);
  border-radius: 8px;
  font-size: 15px;

  b {
    color: rgb(107, 61, 223);
    margin-right: 4px;
    font-size: 16px;
  }
`;
export const Panel = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  z-index: 1000;
  transition: all 0.3s ease;
  border: 1px solid rgba(107, 61, 223, 0.1);

  /* Add a subtle animation when the panel appears */
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  /* Add a subtle hover effect */
  &:hover {
    box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.18);
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 28px;
  border-radius: 8px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;

  @keyframes slideUp {
    to {
      transform: translateY(0);
    }
  }
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
`;

const DialogDescription = styled.p`
  color: #555;
  font-size: 15px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  font-family: "Axiforma", sans-serif;
  background-color: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const ReminderPreview = styled.div`
  background-color: rgba(107, 61, 223, 0.05);
  border: 1px solid rgba(107, 61, 223, 0.2);
  border-radius: 6px;
  padding: 14px;
  margin-top: 16px;
  color: #333;
  font-size: 15px;

  strong {
    color: rgb(107, 61, 223);
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  button {
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
`;

type Props = {
  event: Event;
  refetch: () => void;
};

// Add this component for the Upload icon
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45-2.6-2.6V16h-2zm-5 4c-.55 0-1.02-.2-1.41-.59A1.93 1.93 0 0 1 4 18v-3h2v3h12v-3h2v3c0 .55-.2 1.02-.59 1.41-.39.4-.86.59-1.41.59H6z" />
  </svg>
);

// Update the UploadArea styled component with better animations
const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  background-color: #f9fafb;
  position: relative;

  h3 {
    margin-top: 0;
    font-size: 18px;
    color: #374151;
  }

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  &.dragging {
    background-color: #e0f2fe;
    border-color: #0ea5e9;
    border-width: 3px;
    box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
    transform: scale(1.01);
  }

  &.dragging::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(224, 242, 254, 0.7);
    border-radius: 6px;
    z-index: 1;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
    }
  }
`;

// Add a styled component for the drop overlay
const DropOverlay = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(224, 242, 254, 0.9);
  z-index: 2;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 6px;

  .dragging & {
    display: flex;
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    animation: bounce 1s infinite alternate;

    path {
      fill: #0ea5e9;
    }
  }

  @keyframes bounce {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-10px);
    }
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #0ea5e9;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    color: #0369a1;
    margin: 0;
  }
`;

// Update the DropIcon for the overlay
const DropOverlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor" />
    <path d="M19 18H5V20H19V18Z" fill="currentColor" />
  </svg>
);

// Style the drop zone area
const DropZone = styled.div`
  margin: 20px 0;
  padding: 25px;
  border-radius: 6px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    margin-bottom: 10px;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    color: #6b7280;
  }
`;

const UploadButton = styled(ExcelButton)`
  background-color: #4f46e5;
  color: white;

  &:hover {
    background-color: #4338ca;
  }
`;

const TemplateButton = styled(ExcelButton)`
  background-color: #ffffff;
  color: #4f46e5;
  border: 1px solid #4f46e5;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadInstructions = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #6b7280;
  max-width: 500px;
  margin: 16px auto;
`;

const UploadButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;

  button {
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    max-width: 300px;
    margin: 16px auto 0;

    button {
      width: 100%;
    }
  }
`;

// Add a DropIcon component
const DropIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="#9ca3af" />
    <path d="M19 18H5V20H19V18Z" fill="#9ca3af" />
  </svg>
);

// Update the EmptyStateContainer styling for a more detailed view
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-bottom: 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  color: #9ca3af;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 10px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 25px 0;
  max-width: 500px;
`;

// Update the EmptyStateInstructions styling for a more detailed view
const EmptyStateInstructions = styled.div`
  margin: 0 auto 25px;
  max-width: 600px;
  text-align: left;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
  }
  p {
    color: #374151;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
    color: #4b5563;
  }

  .method {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .method-icon {
    width: 40px;
    height: 40px;
    background-color: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
      color: #6b7280;
    }
  }

  .method-content {
    flex: 1;
  }
`;

// Update the EmptyStateActions styling for better button layout
const EmptyStateActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;

  button {
    min-width: 180px;
    padding: 10px 16px;
    white-space: nowrap;

    svg {
      margin-right: 8px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;

    button {
      width: 100%;
    }
  }
`;

// Add a styled component for action buttons with icons
const ActionButton = styled(PrimaryButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ActionSecondaryButton = styled(SecondaryButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ActionTemplateButton = styled(TemplateButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Add a plus icon component
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Add an icon for the empty state
const EmptyGuestsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
      fill="currentColor"
    />
    <circle
      cx="19"
      cy="5"
      r="3"
      fill="#e5e7eb"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M21 8L17 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Update the tooltip component to ensure it's fully visible
const Tooltip = styled.div`
  position: fixed; // Change to fixed positioning to break out of any container constraints
  transform: translate(-50%, -100%); // Position above the cursor
  margin-top: -10px; // Add some margin to position it better
  background-color: #374151;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #374151 transparent transparent transparent;
  }
`;

// Update the EditableField component to handle tooltip positioning
const EditableField = styled.span`
  cursor: pointer;
  display: block;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: #f3f4f6;
  }

  &:hover::after {
    content: "✎";
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #6b7280;
    opacity: 0.7;
  }
`;

// Add back the EditInput component
const EditInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  &:hover:not(:focus) {
    border-color: #9ca3af;
  }
`;

// Add back the EditInputContainer
const EditInputContainer = styled.div`
  position: relative;
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 8px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), white);
    pointer-events: none;
  }
`;

// Update the EditableFieldWithTooltip component to handle tooltip positioning
const EditableFieldWithTooltip = ({
  children,
  onDoubleClick,
}: {
  children: React.ReactNode;
  onDoubleClick: () => void;
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const fieldRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <EditableField
        ref={fieldRef}
        onDoubleClick={onDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </EditableField>
      {showTooltip && (
        <Tooltip
          style={{
            opacity: 1,
            visibility: "visible",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          Double-click to edit
        </Tooltip>
      )}
    </>
  );
};

// Add a styled dropdown component for editing boolean fields
const EditDropdown = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  &:hover:not(:focus) {
    border-color: #9ca3af;
  }
`;

const EventGuestsEditor: React.FC<Props> = ({ event, refetch }) => {
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();
  const [newGuests, setNewGuests] = useState<{
    fullName: string;
    age: number;
    email: string;
  } | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]); // Selected guest IDs

  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [daysBefore, setDaysBefore] = useState(1);
  const [reminderTime, setReminderTime] = useState("12:00"); // Default to noon
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [showDeleteGuestsDialog, setShowDeleteGuestsDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add state for editing guests
  const [editingGuest, setEditingGuest] = useState<{
    id: string;
    field: string;
    value: string;
  } | null>(null);

  const addNewGuestRow = () => {
    if (newGuests === null) {
      setNewGuests({ fullName: "", age: 0, email: "" });
    }
  };

  const handleGuestChange = (field: string, value: string | number) => {
    if (newGuests != null) {
      setNewGuests({
        ...newGuests,
        [field]: value,
      });
    }
  };

  // Update the toggleGuestSelection function to handle checkbox clicks
  const toggleGuestSelection = (guestId: string, e?: React.MouseEvent) => {
    // If the event exists, stop propagation to prevent row click from triggering
    if (e) {
      e.stopPropagation();
    }

    setSelectedGuests((prevSelected) =>
      prevSelected.includes(guestId)
        ? prevSelected.filter((id) => id !== guestId)
        : [...prevSelected, guestId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGuests.length === event.guests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(event.guests.map((guest) => guest._id));
    }
  };

  const sendGuestEmail = async (
    guestName: string,
    toEmail: string,
    qrContent: string,
    eventDetails: Event
  ) => {
    const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrContent
    )}&size=320x320&color=000000&bgcolor=FFFFFF`;

    const htmlContent = getMailHtml(
      guestName,
      qrCodeBase64,
      eventDetails.title,
      event.poster || "",
      eventDetails.description,
      eventDetails.date,
      eventDetails.endDate,
      eventDetails.emailParams.parking,
      {
        enabled: eventDetails.emailParams.scheduleSrc.enabled,
        content: eventDetails.emailParams.scheduleSrc.content,
        items: eventDetails.emailParams.scheduleSrc.items || [],
      },
      eventDetails.emailParams.dining,
      event.location.address || "",
      false,
      eventDetails.emailParams.customHtmlTemplate?.enabled
        ? eventDetails.emailParams.customHtmlTemplate.content
        : undefined
    );

    await axiosInstance.post(`/mail`, {
      recipient: toEmail,
      subject: `Reminder : Your ticket for ${eventDetails.title}`,
      htmlContent: htmlContent,
    });
  };

  const openSendEmailDialog = () => {
    if (selectedGuests.length === 0) {
      addToast("No guests selected to send emails to.", ToastType.INFO);
      return;
    }
    setShowSendEmailDialog(true);
  };

  const closeSendEmailDialog = () => {
    setShowSendEmailDialog(false);
  };

  const openDeleteGuestsDialog = () => {
    if (selectedGuests.length === 0) {
      addToast("No guests selected to delete.", ToastType.INFO);
      return;
    }
    setShowDeleteGuestsDialog(true);
  };

  const closeDeleteGuestsDialog = () => {
    setShowDeleteGuestsDialog(false);
  };

  const sendEmailsToGuests = async () => {
    if (!selectedGuests.length) {
      console.warn("No guests selected to send emails to.");
      addToast("No guests selected to send emails to.", ToastType.INFO);
      return;
    }

    const results: Array<{
      guestId: string;
      status: "success" | "failure";
      name: string;
      error?: string;
    }> = [];

    for (const guestId of selectedGuests) {
      const guest = event.guests.find((g) => g._id === guestId);
      if (guest) {
        const qrContent = guest._id.toString();
        try {
          await sendGuestEmail(
            guest.fullName,
            guest.email.toLowerCase(),
            qrContent,
            event
          );
          await axiosInstance.put(`/guests/${guestId}/emailstatus`);
          results.push({ guestId, status: "success", name: guest.fullName });
        } catch (error) {
          console.error(
            `Failed to send email to ${guest.fullName} (${guest.email}):`,
            error
          );
          results.push({
            guestId,
            status: "failure",
            name: guest.fullName,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    const successes = results.filter((r) => r.status === "success");
    const failures = results.filter((r) => r.status === "failure");

    console.log("Email sending results:");
    console.log("Successes:", successes);
    console.log("Failures:", failures);

    if (failures.length > 0) {
      const failedNames = failures.map((f) => f.name).join(", ");
      addToast(
        `${failures.length} email(s) failed to send: ${failedNames}. Check the console for details.`,
        ToastType.ERROR
      );
    } else {
      addToast(
        "Emails sent successfully to all selected guests!",
        ToastType.SUCCESS
      );
    }

    setSelectedGuests([]);
    refetch();
    closeSendEmailDialog();
  };

  const isEventInPast = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate < now;
  };

  const calculateReminderDate = () => {
    const eventDate = new Date(event.date);
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(eventDate.getDate() - daysBefore);

    // Set the time from the time input
    const [hours, minutes] = reminderTime.split(":").map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    return reminderDate;
  };

  // Open reminder dialog
  const openReminderDialog = () => {
    if (selectedGuests.length === 0) {
      addToast(
        "No guests selected to schedule reminder emails for.",
        ToastType.INFO
      );
      return;
    }
    setShowReminderDialog(true);
  };

  // Close reminder dialog
  const closeReminderDialog = () => {
    setShowReminderDialog(false);
  };

  // Schedule reminder emails with the calculated date
  const scheduleReminderEmails = async () => {
    if (!selectedGuests.length) {
      console.warn("No guests selected to schedule reminder emails for.");
      addToast(
        "No guests selected to schedule reminder emails for.",
        ToastType.INFO
      );
      return;
    }

    const reminderDate = calculateReminderDate();

    // Check if reminder date is in the past
    if (reminderDate < new Date()) {
      addToast("Reminder date cannot be in the past.", ToastType.ERROR);
      return;
    }

    // Prepare email data for each selected guest
    const emailsData = selectedGuests
      .map((guestId) => {
        const guest = event.guests.find((g) => g._id === guestId);
        if (!guest) return null;

        const qrContent = guest._id.toString();
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          qrContent
        )}&size=320x320&color=000000&bgcolor=FFFFFF`;

        // Generate HTML content for this guest
        const htmlContent = getMailHtml(
          guest.fullName,
          qrCodeUrl,
          event.title,
          event.poster || "",
          event.description,
          event.date,
          event.endDate,
          event.emailParams.parking,
          {
            enabled: event.emailParams.scheduleSrc.enabled,
            content: event.emailParams.scheduleSrc.content,
            items: event.emailParams.scheduleSrc.items || [],
          },
          event.emailParams.dining,
          event.location.address || "",
          false,
          event.emailParams.customHtmlTemplate?.enabled
            ? event.emailParams.customHtmlTemplate.content
            : undefined
        );

        return {
          recipient: guest.email.toLowerCase(),
          htmlContent,
        };
      })
      .filter(Boolean); // Remove any null entries

    try {
      // Send the request to schedule reminder emails
      await axiosInstance.post("/mail/schedule-reminders", {
        eventId: event._id,
        guests: selectedGuests.map((id) => ({ guestId: id })),
        reminderTime: reminderDate.toISOString(),
        emailSubject: `Reminder: Your event "${event.title}" is coming up!`,
        emailsData,
      });

      // Update reminder_email_date for each guest
      for (const guestId of selectedGuests) {
        await axiosInstance.put(`/guests/${guestId}/reminder-date`, {
          reminderDate: reminderDate.toISOString(),
        });
      }

      addToast(
        `Reminder emails scheduled for ${
          selectedGuests.length
        } guests on ${reminderDate.toLocaleDateString()}`,
        ToastType.SUCCESS
      );
      setSelectedGuests([]);
      closeReminderDialog();
      refetch();
    } catch (error) {
      console.error("Error scheduling reminder emails:", error);
      addToast("Failed to schedule reminder emails.", ToastType.ERROR);
    }
  };

  // Format reminder date for display
  const formatReminderDate = (dateString?: string) => {
    if (!dateString) {
      return { status: "Not set", dateTime: "" };
    }

    const reminderDate = new Date(dateString);
    const now = new Date();

    const dateTimeStr = `${reminderDate.toLocaleDateString()} ${reminderDate.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    if (reminderDate < now) {
      return {
        status: "Sent on",
        dateTime: dateTimeStr,
      };
    } else {
      return {
        status: "Will be sent on",
        dateTime: dateTimeStr,
      };
    }
  };

  const deleteSelectedGuests = async () => {
    try {
      for (const guestId of selectedGuests) {
        deleteGuest(guestId);
      }

      addToast(
        `${selectedGuests.length} Guests deleted successfully!`,
        ToastType.SUCCESS
      );
    } catch (error) {
      console.error("Error deleting some guests:", error);
      addToast("Error deleting some guests.", ToastType.ERROR);
    }

    setSelectedGuests([]);
    refetch();
    closeDeleteGuestsDialog();
  };

  const saveGuests = async () => {
    try {
      await axiosInstance.put(`/events/${event._id}/guests`, {
        guests: [newGuests],
      });
      refetch();
      setNewGuests(null);
    } catch (error) {
      console.error("Error saving guests:", error);
    }
  };

  const deleteGuest = async (guestId: string) => {
    try {
      await axiosInstance.delete(`/guests/${guestId}`);
      refetch();
    } catch (error) {
      console.error("Error deleting guest:", error);
    }
  };

  const downloadGuestsExcel = async () => {
    try {
      const response = await axiosInstance.get(
        `/events/${event._id}/guests/export`,
        {
          responseType: "blob",
        }
      );

      // Create a filename with event name and date
      const fileName = `${event.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_guests.xlsx`;
      saveAs(new Blob([response.data]), fileName);

      addToast("Guest list downloaded successfully", ToastType.SUCCESS);
    } catch (error) {
      console.error("Error downloading guest list:", error);
      addToast("Failed to download guest list", ToastType.ERROR);
    }
  };

  // Update the handleFileUpload function to provide more helpful error messages
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      addToast("Please upload an Excel file (.xlsx or .xls)", ToastType.ERROR);
      return;
    }

    // Create form data for the file upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Show loading toast
      addToast("Uploading guests...", ToastType.INFO);

      const response = await axiosInstance.put(
        `/events/${event._id}/guests/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        addToast(
          response.data.message || "Guests imported successfully",
          ToastType.SUCCESS
        );
        refetch(); // Refresh the event data
      } else {
        addToast(
          response.data.message || "Failed to import guests",
          ToastType.ERROR
        );
      }
    } catch (error: unknown) {
      console.error("Error uploading guests:", error);

      // Type guard to check if error has response property
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        // Define a type for the response data
        interface ErrorResponseData {
          message?: string;
          invalidRows?: Array<{
            rowNumber: number;
            fullName: string;
            email: string;
          }>;
        }

        const responseData = error.response.data as ErrorResponseData;

        if (responseData) {
          // Check if we have invalid rows information
          if (
            responseData.invalidRows &&
            Array.isArray(responseData.invalidRows)
          ) {
            const invalidRows = responseData.invalidRows;
            let errorMessage =
              responseData.message || "Some rows have missing required fields.";

            // Add details about the first few invalid rows
            if (invalidRows.length > 0) {
              errorMessage += "\n\nProblems found in rows:";
              const rowsToShow = Math.min(invalidRows.length, 3);

              for (let i = 0; i < rowsToShow; i++) {
                const row = invalidRows[i];
                errorMessage += `\nRow ${row.rowNumber}: `;

                if (row.fullName === "[MISSING]") {
                  errorMessage += "Missing Full Name";
                }

                if (row.email === "[MISSING]") {
                  errorMessage +=
                    row.fullName === "[MISSING]"
                      ? " and Email"
                      : "Missing Email";
                }
              }

              if (invalidRows.length > rowsToShow) {
                errorMessage += `\n...and ${
                  invalidRows.length - rowsToShow
                } more rows with issues.`;
              }

              errorMessage +=
                "\n\nTry downloading our template and using it as a guide.";
            }

            addToast(errorMessage, ToastType.ERROR);
            return;
          }

          // If we have a message in the response data, use it
          if (responseData.message) {
            addToast(
              responseData.message +
                "\n\nTry downloading our template and using it as a guide.",
              ToastType.ERROR
            );
            return;
          }
        }
      }

      // Default error message
      addToast(
        "Failed to upload guests. Please check your file format and ensure all required fields are filled. Try downloading our template for the correct format.",
        ToastType.ERROR
      );
    }
  };

  // Handle file selection from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset the input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Toggle upload area visibility
  const toggleUploadArea = () => {
    setShowUploadArea(!showUploadArea);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update the downloadGuestTemplate function to create a template that will pass validation
  const downloadGuestTemplate = () => {
    // Create a simple Excel template with headers and valid example data
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Full Name", "Email", "Phone Number"],
      ["John Doe", "john.doe@example.com", "123-456-7890"],
      ["Jane Smith", "jane.smith@example.com", "098-765-4321"],
    ]);

    // Set column widths for better readability
    const wscols = [
      { wch: 25 }, // Full Name
      { wch: 30 }, // Email
      { wch: 20 }, // Phone Number
    ];

    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");

    // Generate the Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileName = `guest_template.xlsx`;
    saveAs(new Blob([excelBuffer]), fileName);

    addToast(
      "Guest template downloaded successfully. You can use this template to add your own guests.",
      ToastType.SUCCESS
    );
  };

  const filteredGuests = event?.guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
      guest.email.toLowerCase().includes(filterText.toLowerCase())
  );

  // Add a handler for dragEnter to ensure we catch all drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Add a function to handle editing a guest
  const startEditing = (guestId: string, field: string, value: string) => {
    setEditingGuest({ id: guestId, field, value });
  };

  // Update the saveEditedGuest function to check if the value has actually changed
  const saveEditedGuest = async (
    guestId: string,
    field: string,
    value: string
  ) => {
    try {
      // Find the current guest to compare values
      const currentGuest = event.guests.find((guest) => guest._id === guestId);

      if (!currentGuest) {
        console.error("Guest not found:", guestId);
        return;
      }

      // Get the current value of the field
      const currentValue = currentGuest[field as keyof typeof currentGuest];

      // Check if the value has actually changed
      if (value === currentValue) {
        // No change, just clear the editing state without sending a request
        setEditingGuest(null);
        return;
      }

      // Create an update object with the field being edited
      const updateData: Record<string, string | number> = {};
      updateData[field] = value;

      // Send the update to the backend
      await axiosInstance.put(`/guests/${guestId}`, updateData);

      // Refresh the event data
      refetch();

      // Clear the editing state
      setEditingGuest(null);

      // Show success message
      addToast("Guest updated successfully", ToastType.SUCCESS);
    } catch (error) {
      console.error("Error updating guest:", error);
      addToast("Failed to update guest", ToastType.ERROR);
    }
  };

  // Add a function to handle key press events in the edit input
  const handleEditKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    guestId: string,
    field: string,
    value: string
  ) => {
    if (e.key === "Enter") {
      saveEditedGuest(guestId, field, value);
    } else if (e.key === "Escape") {
      setEditingGuest(null);
    }
  };

  // Add a function to handle changes in the edit input
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingGuest) {
      setEditingGuest({
        ...editingGuest,
        value: e.target.value,
      });
    }
  };

  // Add a function to handle dropdown changes
  const handleDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    guestId: string,
    field: string
  ) => {
    let value: boolean | null = null;

    if (e.target.value === "true") {
      value = true;
    } else if (e.target.value === "false") {
      value = false;
    }

    // Create an update object with the field being edited
    const updateData: Record<string, boolean | null> = {};
    updateData[field] = value;

    // Send the update to the backend
    axiosInstance
      .put(`/guests/${guestId}`, updateData)
      .then(() => {
        // Refresh the event data
        refetch();

        // Show success message
        addToast("Guest updated successfully", ToastType.SUCCESS);
      })
      .catch((error: unknown) => {
        console.error("Error updating guest:", error);
        addToast("Failed to update guest", ToastType.ERROR);
      });
  };

  // Add a function to start editing a boolean field
  const startEditingBoolean = (guestId: string, field: string) => {
    setEditingGuest({ id: guestId, field, value: "" });
  };

  return (
    <GuestsWrapper>
      {/* Only show the header if there are guests or if we're adding a new guest */}
      {(event.guests.length > 0 || newGuests) && (
        <GuestTableHeaderContainer>
          <SearchContainer>
            <SearchIcon
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by name or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </SearchContainer>

          <ButtonGroup>
            <SecondaryButton onClick={toggleUploadArea}>
              <UploadIcon />
              {showUploadArea ? "Hide Upload" : "Upload"}
            </SecondaryButton>
            {event.guests.length > 0 && (
              <ExcelButton onClick={downloadGuestsExcel}>
                <ExcelIcon />
                Download
              </ExcelButton>
            )}
            <PrimaryButton onClick={addNewGuestRow}>
              <PlusIcon />
              Add Guest
            </PrimaryButton>
          </ButtonGroup>
        </GuestTableHeaderContainer>
      )}

      {showUploadArea && (
        <UploadArea
          className={isDragging ? "dragging" : ""}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
        >
          <DropOverlay>
            <DropOverlayIcon />
            <h2>Drop to Upload</h2>
            <p>Release your file to start uploading</p>
          </DropOverlay>

          <h3>Upload Guest List</h3>
          <DropZone>
            <DropIcon />
            <p>Drag and drop your Excel file here, or click "Select File"</p>
          </DropZone>
          <UploadInstructions>
            Upload an Excel file (.xlsx or .xls) with your guest list. The file
            should have the following structure:
            <br />
            <br />
            <strong>Required Format:</strong>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li>
                <strong>First row:</strong> Header row with column names
              </li>
              <li>
                <strong>First column:</strong> Full Name (required)
              </li>
              <li>
                <strong>Second column:</strong> Email (required)
              </li>
              <li>
                <strong>Third column:</strong> Phone Number (optional)
              </li>
            </ul>
            <br />
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                textAlign: "left",
              }}
            >
              <strong>Tips:</strong>
              <ul>
                <li>Download our template for the correct format</li>
                <li>
                  The template includes example data that you can use as-is or
                  replace
                </li>
                <li>Make sure all guests have both a name and email</li>
                <li>Empty rows will be ignored</li>
              </ul>
            </div>
          </UploadInstructions>

          <UploadButtonGroup>
            <TemplateButton onClick={downloadGuestTemplate}>
              <ExcelIcon />
              Get Template
            </TemplateButton>
            <UploadButton onClick={triggerFileInput}>
              <UploadIcon />
              Select File
            </UploadButton>
          </UploadButtonGroup>

          {/* Add a button to go back to the empty state */}
          {event.guests.length === 0 && !newGuests && (
            <div style={{ marginTop: "20px" }}>
              <SecondaryButton onClick={toggleUploadArea} width={200}>
                ← Back to Overview
              </SecondaryButton>
            </div>
          )}

          <UploadInput
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
          />
        </UploadArea>
      )}

      {event.guests.length === 0 && !newGuests && !showUploadArea ? (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <EmptyGuestsIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>No Guests Added Yet</EmptyStateTitle>
          <EmptyStateDescription>
            Start adding guests to your event. You can add guests individually
            or upload a list from an Excel file.
          </EmptyStateDescription>

          <EmptyStateInstructions>
            <div className="method">
              <div className="method-icon">
                <UploadIcon />
              </div>
              <div className="method-content">
                <h4>Upload a Guest List</h4>
                <p>The fastest way to add multiple guests at once:</p>
                <ul>
                  <li>Download our Excel template below</li>
                  <li>
                    Fill in your guests' information (name and email required)
                  </li>
                  <li>Upload the completed file</li>
                </ul>
              </div>
            </div>

            <div className="method">
              <div className="method-icon">
                <PlusIcon />
              </div>
              <div className="method-content">
                <h4>Add Guests Manually</h4>
                <p>Add guests one by one with these required fields:</p>
                <ul>
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Optional: Phone Number</li>
                </ul>
              </div>
            </div>
          </EmptyStateInstructions>

          <EmptyStateActions>
            <ActionButton onClick={addNewGuestRow}>
              <PlusIcon />
              Add Manually
            </ActionButton>
            <ActionSecondaryButton onClick={toggleUploadArea}>
              <UploadIcon />
              Upload List
            </ActionSecondaryButton>
            <ActionTemplateButton onClick={downloadGuestTemplate}>
              <ExcelIcon />
              Get Template
            </ActionTemplateButton>
          </EmptyStateActions>
        </EmptyStateContainer>
      ) : (
        <ScrollableTable>
          <table>
            <thead>
              <tr>
                <th>
                  <StyledCheckbox
                    checked={
                      selectedGuests.length === event.guests.length &&
                      event.guests.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Email Sent</th>
                <th>Reminder Email</th>
                <th>Phone</th>
                <th>Attendance</th>
                <th>GDPR Consent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newGuests != null && (
                <tr>
                  <td></td>
                  <td>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newGuests.fullName}
                      onChange={(e) =>
                        handleGuestChange("fullName", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newGuests.email}
                      onChange={(e) =>
                        handleGuestChange("email", e.target.value)
                      }
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <GuestActionsButtonsContainer>
                      <PrimaryButton width={80} onClick={saveGuests}>
                        Add
                      </PrimaryButton>
                      <SecondaryButton
                        width={80}
                        onClick={() => {
                          setNewGuests(null);
                        }}
                      >
                        Cancel
                      </SecondaryButton>
                    </GuestActionsButtonsContainer>
                  </td>
                </tr>
              )}
              {filteredGuests?.map((guest) => (
                <tr key={guest._id}>
                  <td onClick={(e) => toggleGuestSelection(guest._id, e)}>
                    <StyledCheckbox
                      checked={selectedGuests.includes(guest._id)}
                      onChange={() => {}} // Add empty onChange to avoid React warning about controlled component
                    />
                  </td>
                  <td>
                    {editingGuest &&
                    editingGuest.id === guest._id &&
                    editingGuest.field === "fullName" ? (
                      <EditInputContainer>
                        <EditInput
                          type="text"
                          value={editingGuest.value}
                          onChange={handleEditChange}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) =>
                            handleEditKeyPress(
                              e,
                              guest._id,
                              "fullName",
                              editingGuest.value
                            )
                          }
                          onBlur={() =>
                            saveEditedGuest(
                              guest._id,
                              "fullName",
                              editingGuest.value
                            )
                          }
                          autoFocus
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </EditInputContainer>
                    ) : (
                      <EditableFieldWithTooltip
                        onDoubleClick={() =>
                          startEditing(guest._id, "fullName", guest.fullName)
                        }
                      >
                        {guest.fullName}
                      </EditableFieldWithTooltip>
                    )}
                  </td>
                  <td
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {editingGuest &&
                    editingGuest.id === guest._id &&
                    editingGuest.field === "email" ? (
                      <EditInputContainer>
                        <EditInput
                          type="email"
                          value={editingGuest.value}
                          onChange={handleEditChange}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) =>
                            handleEditKeyPress(
                              e,
                              guest._id,
                              "email",
                              editingGuest.value
                            )
                          }
                          onBlur={() =>
                            saveEditedGuest(
                              guest._id,
                              "email",
                              editingGuest.value
                            )
                          }
                          autoFocus
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </EditInputContainer>
                    ) : (
                      <EditableFieldWithTooltip
                        onDoubleClick={() =>
                          startEditing(guest._id, "email", guest.email)
                        }
                      >
                        {guest.email}
                      </EditableFieldWithTooltip>
                    )}
                  </td>
                  <td
                    style={{
                      color: guest.email_sent ? "green" : "red",
                      fontWeight: "semibold",
                    }}
                  >
                    <ActivityStatus
                      color={guest.email_sent ? "#2a9134" : "#e40000"}
                    >
                      {guest.email_sent ? "Sent" : "Not Sent"}
                    </ActivityStatus>
                  </td>
                  <td>
                    {guest.reminder_email_date ? (
                      <ReminderStatus
                        color={
                          new Date(guest.reminder_email_date) < new Date()
                            ? "#2a9134" // Green for sent
                            : "#00aef0" // Blue for scheduled
                        }
                      >
                        <span className="status-text">
                          {formatReminderDate(guest.reminder_email_date).status}
                        </span>
                        <span className="date-time">
                          {
                            formatReminderDate(guest.reminder_email_date)
                              .dateTime
                          }
                        </span>
                      </ReminderStatus>
                    ) : (
                      <ReminderStatus color="#e40000">
                        {" "}
                        {/* Red for not set */}
                        <span className="status-text">Not set</span>
                      </ReminderStatus>
                    )}
                  </td>
                  <td>
                    {editingGuest &&
                    editingGuest.id === guest._id &&
                    editingGuest.field === "phoneNumber" ? (
                      <EditInputContainer>
                        <EditInput
                          type="text"
                          value={editingGuest.value}
                          onChange={handleEditChange}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) =>
                            handleEditKeyPress(
                              e,
                              guest._id,
                              "phoneNumber",
                              editingGuest.value
                            )
                          }
                          onBlur={() =>
                            saveEditedGuest(
                              guest._id,
                              "phoneNumber",
                              editingGuest.value
                            )
                          }
                          autoFocus
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </EditInputContainer>
                    ) : (
                      <EditableFieldWithTooltip
                        onDoubleClick={() =>
                          startEditing(
                            guest._id,
                            "phoneNumber",
                            guest.phoneNumber || ""
                          )
                        }
                      >
                        {guest.phoneNumber || "-"}
                      </EditableFieldWithTooltip>
                    )}
                  </td>
                  <td>
                    {editingGuest &&
                    editingGuest.id === guest._id &&
                    editingGuest.field === "attendance_status" ? (
                      <EditInputContainer>
                        <EditDropdown
                          value={
                            guest.attendance_status === true
                              ? "true"
                              : guest.attendance_status === false
                              ? "false"
                              : "null"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              e,
                              guest._id,
                              "attendance_status"
                            )
                          }
                          onBlur={() => setEditingGuest(null)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="null">Not Set</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </EditDropdown>
                      </EditInputContainer>
                    ) : (
                      <EditableFieldWithTooltip
                        onDoubleClick={() =>
                          startEditingBoolean(guest._id, "attendance_status")
                        }
                      >
                        {guest.attendance_status === true
                          ? "Yes"
                          : guest.attendance_status === false
                          ? "No"
                          : "Not Set"}
                      </EditableFieldWithTooltip>
                    )}
                  </td>
                  <td>
                    {editingGuest &&
                    editingGuest.id === guest._id &&
                    editingGuest.field === "gdpr_consent" ? (
                      <EditInputContainer>
                        <EditDropdown
                          value={
                            guest.gdpr_consent === true
                              ? "true"
                              : guest.gdpr_consent === false
                              ? "false"
                              : "null"
                          }
                          onChange={(e) =>
                            handleDropdownChange(e, guest._id, "gdpr_consent")
                          }
                          onBlur={() => setEditingGuest(null)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="null">Not Set</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </EditDropdown>
                      </EditInputContainer>
                    ) : (
                      <EditableFieldWithTooltip
                        onDoubleClick={() =>
                          startEditingBoolean(guest._id, "gdpr_consent")
                        }
                      >
                        <div style={{ textAlign: "center" }}>
                          {guest.gdpr_consent === true ? (
                            <span style={{ color: "#4caf50" }}>Yes</span>
                          ) : guest.gdpr_consent === false ? (
                            <span style={{ color: "#f44336" }}>No</span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>Not Set</span>
                          )}
                        </div>
                      </EditableFieldWithTooltip>
                    )}
                  </td>
                  <td>
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGuest(guest._id);
                      }}
                    >
                      <SvgSC
                        width="24"
                        height="24"
                        size={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.5 7H15.5M8.5 7H6.5M8.5 7C8.5 7 8.5 3.5 12 3.5C15.5 3.5 15.5 7 15.5 7M15.5 7H17.5M4.5 7H6.5M6.5 7V18.5C6.5 19.6046 7.39543 20.5 8.5 20.5H15.5C16.6046 20.5 17.5 19.6046 17.5 18.5V7M17.5 7H19.5M14 9.5V17.5M10 9.5V17.5"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                      </SvgSC>
                    </DeleteButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>
      )}

      <Toasts />
      {/* Reminder Dialog */}
      {showReminderDialog && (
        <DialogOverlay onClick={closeReminderDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Schedule Reminder Emails</DialogTitle>
            <DialogDescription>
              Set when reminder emails should be sent to your guests. Choose how
              many days before the event and at what time.
            </DialogDescription>

            <InputGroup>
              <Label htmlFor="daysBefore">Days before event:</Label>
              <Input
                id="daysBefore"
                type="number"
                min="1"
                max="30"
                value={daysBefore}
                onChange={(e) => setDaysBefore(parseInt(e.target.value) || 1)}
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="reminderTime">Time of day:</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </InputGroup>

            <ReminderPreview>
              Reminder emails will be sent on:{" "}
              <strong>{calculateReminderDate().toLocaleDateString()}</strong> at{" "}
              <strong>
                {calculateReminderDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </ReminderPreview>

            <DialogButtons>
              <SecondaryButton onClick={closeReminderDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={scheduleReminderEmails} width={180}>
                Schedule Reminders
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
      {selectedGuests.length > 0 && (
        <Panel>
          <SeletedGuestsSC>
            <b>{selectedGuests.length}</b>
            {selectedGuests.length > 1 ? " guests" : " guest"} selected
          </SeletedGuestsSC>

          <SecondaryButton
            onClick={openDeleteGuestsDialog}
            disabled={selectedGuests.length === 0}
          >
            Delete selected
          </SecondaryButton>

          <SecondaryButton
            onClick={openSendEmailDialog}
            disabled={selectedGuests.length === 0}
          >
            Email selected
          </SecondaryButton>

          {!isEventInPast() && (
            <SecondaryButton
              onClick={openReminderDialog}
              disabled={selectedGuests.length === 0}
              width={180}
            >
              Set reminders
            </SecondaryButton>
          )}
        </Panel>
      )}
      {showSendEmailDialog && (
        <DialogOverlay onClick={closeSendEmailDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Send Emails to Selected Guests</DialogTitle>
            <DialogDescription>
              You are about to send event invitation emails to{" "}
              {selectedGuests.length} selected{" "}
              {selectedGuests.length === 1 ? "guest" : "guests"}. Each guest
              will receive a personalized email with event details and their
              unique QR code ticket.
            </DialogDescription>

            <DialogButtons>
              <SecondaryButton onClick={closeSendEmailDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={sendEmailsToGuests} width={180}>
                Send Emails
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
      {showDeleteGuestsDialog && (
        <DialogOverlay onClick={closeDeleteGuestsDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>Delete Selected Guests</DialogTitle>
            <DialogDescription>
              You are about to delete {selectedGuests.length} selected{" "}
              {selectedGuests.length === 1 ? "guest" : "guests"} from this
              event. This action cannot be undone. Any scheduled emails for
              these guests will also be canceled.
            </DialogDescription>

            <DialogButtons>
              <SecondaryButton onClick={closeDeleteGuestsDialog} width={120}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={deleteSelectedGuests}
                width={180}
                style={{ backgroundColor: "rgb(220, 53, 69)" }} // Red color for delete button
              >
                Delete Guests
              </PrimaryButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}
    </GuestsWrapper>
  );
};

export default EventGuestsEditor;
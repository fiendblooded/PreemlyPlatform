import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { format } from "date-fns";

// Define prop interfaces for styled components
interface AnimatedProps {
  isVisible: boolean;
}

// Styled Components
const Overlay = styled.div<AnimatedProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
`;

const Container = styled.div<AnimatedProps>`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  transform: ${(props) =>
    props.isVisible ? "translateY(0)" : "translateY(20px)"};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-sizing: border-box;
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #6366f1;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    background-color: #f1f5f9;
    color: #334155;
  }
`;

const Content = styled.div`
  display: flex;
  padding: 24px;
  gap: 32px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const Sidebar = styled.div`
  width: 320px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    border-top: 1px solid #e2e8f0;
    padding-top: 24px;
    margin-top: 8px;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
`;

const SeamlessInput = styled.input`
  font-family: inherit;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 600;
  width: 100%;
  color: #0f172a;
  background-color: transparent;
  border: none;
  outline: none;
  padding: 4px 0;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-bottom: 1px solid #6366f1;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Section = styled.div`
  margin-bottom: 28px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #64748b;
    width: 18px;
    height: 18px;
  }
`;

const EditInputContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  background-color: white;
  transition: all 0.2s ease;
  min-height: 120px;
  resize: vertical;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  &:hover:not(:focus) {
    border-color: #9ca3af;
  }
`;

const DescriptionDisplay = styled.div`
  font-size: 15px;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  min-height: 100px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: #cbd5e1;
    background-color: #f1f5f9;
  }
`;

const PropertyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
`;

const PropertyItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e2e8f0;
  }
`;

const PropertyLabel = styled.div`
  width: 80px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  flex-shrink: 0;
  padding-top: 8px;
`;

const PropertyValue = styled.div`
  flex: 1;
  min-width: 0; /* Ensures text truncation works properly */
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s;
  font-weight: 500;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background-color: white;
  }
`;

const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  shadow: "rgba(0, 0, 0, 0.05)",
  yellow: "#FFD716",
  yellowHover: "#FFCC00",
  yellowShadow: "rgba(255, 215, 22, 0.3)",
};

const DatePickerWrapper = styled.div`
  color: ${colors.textPrimary};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  width: 100%;
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    color: ${colors.primary};
    z-index: 1;
  }

  .react-datepicker {
    font-size: 14px;
    background-color: ${colors.backgroundLight};
    color: ${colors.textPrimary};
    border: 1px solid ${colors.borderLight};
    border-radius: 8px;
    box-shadow: 0 4px 12px ${colors.shadow};
    padding: 8px;
    transition: all 0.2s ease;
    font-family: Axiforma, sans-serif;
  }

  .react-datepicker__header {
    background-color: ${colors.backgroundSecondary};
    border-bottom: none;
    padding-top: 12px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .react-datepicker__day--selected {
    background-color: ${colors.primary};
    color: white;
    border-radius: 4px;
  }

  .react-datepicker__day:hover {
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 4px;
  }

  .react-datepicker__current-month {
    font-weight: 600;
    color: ${colors.textPrimary};
    margin-bottom: 8px;
  }

  .react-datepicker__day-name {
    color: ${colors.textSecondary};
    font-weight: 500;
    margin-top: 4px;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__input-container input {
    background-color: ${colors.backgroundLight};
    border: 1px solid ${colors.borderLight};
    border-radius: 8px;
    padding: 10px 14px 10px 40px;
    font-size: 14px;
    font-weight: 500;
    color: ${colors.textPrimary};
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px ${colors.shadow};
    width: 100%;
    font-family: Axiforma, sans-serif;
    box-sizing: border-box;
    &:hover {
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 4px 8px ${colors.shadow};
    }

    &:focus {
      border-color: ${colors.primary};
      outline: none;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    &::placeholder {
      color: ${colors.textSecondary};
      opacity: 0.6;
      font-weight: 400;
    }
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ status }) => {
    if (status === "finished") return "rgba(16, 185, 129, 0.1)";
    if (status === "inProgress") return "rgba(245, 158, 11, 0.1)";
    return "rgba(148, 163, 184, 0.1)";
  }};
  color: ${({ status }) => {
    if (status === "finished") return "#10b981";
    if (status === "inProgress") return "#f59e0b";
    return "#94a3b8";
  }};
  box-sizing: border-box;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${({ status }) => {
      if (status === "finished") return "#10b981";
      if (status === "inProgress") return "#f59e0b";
      return "#94a3b8";
    }};
  }
`;

const PriorityBadge = styled.div<{ priority: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ priority }) => {
    if (priority === "high") return "rgba(239, 68, 68, 0.1)";
    if (priority === "medium") return "rgba(245, 158, 11, 0.1)";
    return "rgba(16, 185, 129, 0.1)";
  }};
  color: ${({ priority }) => {
    if (priority === "high") return "#ef4444";
    if (priority === "medium") return "#f59e0b";
    return "#10b981";
  }};
  box-sizing: border-box;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${({ priority }) => {
      if (priority === "high") return "#ef4444";
      if (priority === "medium") return "#f59e0b";
      return "#10b981";
    }};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;

  ${({ variant }) => {
    if (variant === "primary") {
      return `
        background-color: #6366f1;
        color: white;
        border: none;
        
        &:hover {
          background-color: #4f46e5;
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
        }
        
        &:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
      `;
    } else if (variant === "danger") {
      return `
        background-color: #ef4444;
        color: white;
        border: none;
        
        &:hover {
          background-color: #dc2626;
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
        }
      `;
    } else {
      return `
        background-color: white;
        color: #475569;
        border: 1px solid #cbd5e1;
        
        &:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }
        
        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `;
    }
  }}
`;

const Timestamp = styled.div`
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 0;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    width: 14px;
    height: 14px;
    color: #6366f1;
    flex-shrink: 0;
  }
`;

// Custom dropdown components
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 6px;
  transition: all 0.2s;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }

  svg {
    color: #64748b;
    flex-shrink: 0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 20;
  overflow: hidden;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
  box-sizing: border-box;
`;

const DropdownItem = styled.div<{ isActive?: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${(props) => (props.isActive ? "#f1f5f9" : "transparent")};
  box-sizing: border-box;

  &:hover {
    background-color: #f1f5f9;
  }

  &:active {
    background-color: #e2e8f0;
  }
`;

// Custom dropdown for status
interface StatusDropdownProps {
  value: "next" | "inProgress" | "finished" | undefined;
  onChange: (value: "next" | "inProgress" | "finished") => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: "next" as const, label: "To Do", color: "#94a3b8" },
    { value: "inProgress" as const, label: "In Progress", color: "#f59e0b" },
    { value: "finished" as const, label: "Completed", color: "#10b981" },
  ];

  const currentStatus =
    statusOptions.find((option) => option.value === value) || statusOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger onClick={() => setIsOpen(!isOpen)}>
        <StatusBadge status={value || "next"}>
          {currentStatus.label}
        </StatusBadge>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DropdownTrigger>

      {isOpen && (
        <DropdownMenu>
          {statusOptions.map((option) => (
            <DropdownItem
              key={option.value}
              isActive={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <StatusBadge status={option.value}>{option.label}</StatusBadge>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

// Custom dropdown for priority
interface PriorityDropdownProps {
  value: "high" | "medium" | "low" | undefined;
  onChange: (value: "high" | "medium" | "low") => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const priorityOptions = [
    { value: "low" as const, label: "Low", color: "#10b981" },
    { value: "medium" as const, label: "Medium", color: "#f59e0b" },
    { value: "high" as const, label: "High", color: "#ef4444" },
  ];

  const currentPriority =
    priorityOptions.find((option) => option.value === value) ||
    priorityOptions[1];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger onClick={() => setIsOpen(!isOpen)}>
        <PriorityBadge priority={value || "medium"}>
          {currentPriority.label}
        </PriorityBadge>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DropdownTrigger>

      {isOpen && (
        <DropdownMenu>
          {priorityOptions.map((option) => (
            <DropdownItem
              key={option.value}
              isActive={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <PriorityBadge priority={option.value}>
                {option.label}
              </PriorityBadge>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

const EventValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 6px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  svg {
    color: #6366f1;
    flex-shrink: 0;
  }
`;

// Add a new styled component for the copy link button
const CopyLinkButton = styled.button`
  background: none;
  border: none;
  color: #6366f1;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdated: (updatedTask?: Task) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  onClose,
  onTaskUpdated,
}) => {
  const axiosInstanceRef = useRef(useAxiosWithAuth());
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Show the component with animation when mounted
  useEffect(() => {
    // Small delay to ensure the component is rendered before starting the animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await axiosInstanceRef.current.get(`/tasks/${taskId}`);
        setTask(response.data);
        setEditedTask(response.data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  // Update task locally and notify parent without requiring a full refresh
  const updateTaskLocally = (updates: Partial<Task>) => {
    if (!task) return;

    const updatedTask = { ...task, ...updates };
    setTask(updatedTask);

    // Pass the updated task to the parent so it can update its state without refetching
    onTaskUpdated(updatedTask);
  };

  // Handle status change from custom dropdown
  const handleStatusChange = (status: "next" | "inProgress" | "finished") => {
    const isCompleted = status === "finished";
    setEditedTask((prev) => ({ ...prev, status, isCompleted }));

    // Save the status change immediately
    axiosInstanceRef.current
      .patch(`/tasks/${taskId}`, {
        status,
        isCompleted,
      })
      .then(() => {
        updateTaskLocally({ status, isCompleted });
      })
      .catch((err) => {
        console.error("Error updating task status:", err);
      });
  };

  // Handle priority change from custom dropdown
  const handlePriorityChange = (priority: "high" | "medium" | "low") => {
    setEditedTask((prev) => ({ ...prev, priority }));

    // Save the priority change immediately
    axiosInstanceRef.current
      .patch(`/tasks/${taskId}`, {
        priority,
      })
      .then(() => {
        updateTaskLocally({ priority });
      })
      .catch((err) => {
        console.error("Error updating task priority:", err);
      });
  };

  // Delete task
  const deleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axiosInstanceRef.current.delete(`/tasks/${taskId}`);
      onTaskUpdated(); // No need to pass task for deletion
      onClose();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  // Handle closing with animation
  const handleClose = () => {
    setIsVisible(false);
    // Wait for the animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the transition duration
  };

  // Function to copy the task link to clipboard
  const copyTaskLink = () => {
    const taskUrl = `${window.location.origin}/tasks/${taskId}`;
    navigator.clipboard
      .writeText(taskUrl)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  if (loading) {
    return (
      <Overlay isVisible={isVisible}>
        <Container isVisible={isVisible}>
          <Header>
            <div>Loading task details...</div>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
          </Header>
        </Container>
      </Overlay>
    );
  }

  if (error || !task) {
    return (
      <Overlay isVisible={isVisible}>
        <Container isVisible={isVisible}>
          <Header>
            <div>Error: {error || "Task not found"}</div>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
          </Header>
        </Container>
      </Overlay>
    );
  }

  return (
    <Overlay
      isVisible={isVisible}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <Container isVisible={isVisible} onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderTitle>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Task Details
          </HeaderTitle>
          <div style={{ display: "flex", gap: "12px" }}>
            <CopyLinkButton onClick={copyTaskLink}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 13C10.8284 13.8284 12 15 13 15C14 15 15.1716 13.8284 16 13C16.8284 12.1716 18 11 18 10C18 9 16.8284 7.82843 16 7C15.1716 6.17157 14 5 13 5C12 5 10.8284 6.17157 10 7M14 11C13.1716 10.1716 12 9 11 9C10 9 8.82843 10.1716 8 11C7.17157 11.8284 6 13 6 14C6 15 7.17157 16.1716 8 17C8.82843 17.8284 10 19 11 19C12 19 13.1716 17.8284 14 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {linkCopied ? "Link Copied!" : "Copy Link"}
            </CopyLinkButton>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
          </div>
        </Header>

        <Content>
          <MainContent>
            <Title>
              <SeamlessInput
                value={editedTask.title || ""}
                onChange={handleInputChange}
                name="title"
                placeholder="Task title"
                onBlur={() => {
                  if (task && editedTask.title !== task.title) {
                    axiosInstanceRef.current
                      .patch(`/tasks/${taskId}`, {
                        title: editedTask.title,
                      })
                      .then(() => {
                        updateTaskLocally({ title: editedTask.title || "" });
                      })
                      .catch((err) => {
                        console.error("Error updating task title:", err);
                      });
                  }
                }}
              />
            </Title>

            <Section>
              <SectionTitle>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 11.5C14 12.9587 13.4205 14.3576 12.3891 15.3891C11.3576 16.4205 9.95869 17 8.5 17C7.04131 17 5.64236 16.4205 4.61091 15.3891C3.57946 14.3576 3 12.9587 3 11.5C3 10.0413 3.57946 8.64236 4.61091 7.61091C5.64236 6.57946 7.04131 6 8.5 6C9.95869 6 11.3576 6.57946 12.3891 7.61091C13.4205 8.64236 14 10.0413 14 11.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 8.5C18.1046 8.5 19 7.60457 19 6.5C19 5.39543 18.1046 4.5 17 4.5C15.8954 4.5 15 5.39543 15 6.5C15 7.60457 15.8954 8.5 17 8.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12.5C21.5523 12.5 22 12.0523 22 11.5C22 10.9477 21.5523 10.5 21 10.5C20.4477 10.5 20 10.9477 20 11.5C20 12.0523 20.4477 12.5 21 12.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 18.5C18.1046 18.5 19 17.6046 19 16.5C19 15.3954 18.1046 14.5 17 14.5C15.8954 14.5 15 15.3954 15 16.5C15 17.6046 15.8954 18.5 17 18.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Description
              </SectionTitle>
              <EditInputContainer>
                {isEditingDescription ? (
                  <EditTextarea
                    name="description"
                    value={editedTask.description || ""}
                    onChange={handleInputChange}
                    placeholder="Add a description..."
                    onBlur={() => {
                      setIsEditingDescription(false);
                      if (task && editedTask.description !== task.description) {
                        axiosInstanceRef.current
                          .patch(`/tasks/${taskId}`, {
                            description: editedTask.description,
                          })
                          .then(() => {
                            updateTaskLocally({
                              description: editedTask.description || "",
                            });
                          })
                          .catch((err) => {
                            console.error(
                              "Error updating task description:",
                              err
                            );
                          });
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <DescriptionDisplay
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {task?.description || "Click to add a description..."}
                  </DescriptionDisplay>
                )}
              </EditInputContainer>
            </Section>

            <Section>
              <SectionTitle>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Notes
              </SectionTitle>
              <EditInputContainer>
                {isEditingNotes ? (
                  <EditTextarea
                    name="notes"
                    value={editedTask.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Add notes..."
                    onBlur={() => {
                      setIsEditingNotes(false);
                      if (task && editedTask.notes !== task.notes) {
                        axiosInstanceRef.current
                          .patch(`/tasks/${taskId}`, {
                            notes: editedTask.notes,
                          })
                          .then(() => {
                            updateTaskLocally({
                              notes: editedTask.notes || "",
                            });
                          })
                          .catch((err) => {
                            console.error("Error updating task notes:", err);
                          });
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <DescriptionDisplay onClick={() => setIsEditingNotes(true)}>
                    {task?.notes || "Click to add notes..."}
                  </DescriptionDisplay>
                )}
              </EditInputContainer>
            </Section>

            <ButtonGroup>
              <Button variant="danger" onClick={deleteTask}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6H5H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Delete Task
              </Button>
            </ButtonGroup>
          </MainContent>

          <Sidebar>
            <PropertyList>
              <PropertyItem>
                <PropertyLabel>Status</PropertyLabel>
                <PropertyValue>
                  <StatusDropdown
                    value={editedTask.status}
                    onChange={handleStatusChange}
                  />
                </PropertyValue>
              </PropertyItem>

              <PropertyItem>
                <PropertyLabel>Priority</PropertyLabel>
                <PropertyValue>
                  <PriorityDropdown
                    value={editedTask.priority}
                    onChange={handlePriorityChange}
                  />
                </PropertyValue>
              </PropertyItem>

              <PropertyItem>
                <PropertyLabel>Due Date</PropertyLabel>
                <PropertyValue>
                  {isEditingDueDate ? (
                    <DatePickerWrapper>
                      <DatePicker
                        selected={
                          editedTask.dueDate
                            ? new Date(editedTask.dueDate)
                            : null
                        }
                        onChange={(date) => {
                          if (date && task) {
                            const newDueDate = date.toISOString();
                            setEditedTask((prev) => ({
                              ...prev,
                              dueDate: newDueDate,
                            }));
                            axiosInstanceRef.current
                              .patch(`/tasks/${taskId}`, {
                                dueDate: newDueDate,
                              })
                              .then(() => {
                                updateTaskLocally({ dueDate: newDueDate });
                                setIsEditingDueDate(false);
                              })
                              .catch((err) => {
                                console.error("Error updating due date:", err);
                              });
                          }
                        }}
                        dateFormat="MMMM d, yyyy"
                        onBlur={() => setIsEditingDueDate(false)}
                        autoFocus
                      />
                    </DatePickerWrapper>
                  ) : (
                    <DropdownTrigger onClick={() => setIsEditingDueDate(true)}>
                      <span>
                        {task?.dueDate
                          ? formatDate(task.dueDate)
                          : "Set due date"}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </DropdownTrigger>
                  )}
                </PropertyValue>
              </PropertyItem>

              <PropertyItem>
                <PropertyLabel>Assignee</PropertyLabel>
                <PropertyValue>
                  {isEditingAssignee ? (
                    <Input
                      name="assignee"
                      value={editedTask.assignee || ""}
                      onChange={handleInputChange}
                      placeholder="Assignee"
                      onBlur={() => {
                        setIsEditingAssignee(false);
                        if (task && editedTask.assignee !== task.assignee) {
                          axiosInstanceRef.current
                            .patch(`/tasks/${taskId}`, {
                              assignee: editedTask.assignee,
                            })
                            .then(() => {
                              updateTaskLocally({
                                assignee: editedTask.assignee || "",
                              });
                            })
                            .catch((err) => {
                              console.error("Error updating assignee:", err);
                            });
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <DropdownTrigger onClick={() => setIsEditingAssignee(true)}>
                      <span>{task?.assignee || "Unassigned"}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </DropdownTrigger>
                  )}
                </PropertyValue>
              </PropertyItem>

              {task?.event && (
                <PropertyItem>
                  <PropertyLabel>Event</PropertyLabel>
                  <PropertyValue>
                    <EventValue>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{task.event.title || "Unknown Event"}</span>
                    </EventValue>
                  </PropertyValue>
                </PropertyItem>
              )}

              {task?.createdAt && (
                <PropertyItem>
                  <PropertyLabel>Created</PropertyLabel>
                  <PropertyValue>
                    <Timestamp>
                      <svg
                        width="14"
                        height="14"
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
                      {formatTimestamp(task.createdAt)}
                    </Timestamp>
                  </PropertyValue>
                </PropertyItem>
              )}

              {task?.updatedAt && (
                <PropertyItem>
                  <PropertyLabel>Updated</PropertyLabel>
                  <PropertyValue>
                    <Timestamp>
                      <svg
                        width="14"
                        height="14"
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
                      {formatTimestamp(task.updatedAt)}
                    </Timestamp>
                  </PropertyValue>
                </PropertyItem>
              )}
            </PropertyList>
          </Sidebar>
        </Content>
      </Container>
    </Overlay>
  );
};

export default TaskDetail;

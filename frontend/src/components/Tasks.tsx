import React, { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProps,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
  DragUpdate,
  DragStart,
} from "react-beautiful-dnd";
import { format } from "date-fns";
import { Task, Event } from "../types";
import useAxiosWithAuth from "../components/auth/useAxiosWithAuth";
import TaskDetail from "./TaskDetail";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TopBar from "./TopBar";

// This is needed for react-beautiful-dnd to work with React 18 and StrictMode
// It's a workaround for the issue with the library
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fc;
`;

const Container = styled.div`
  padding: 20px 32px;
`;

const KanbanBoard = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  height: calc(100vh - 200px);
  overflow-x: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

interface ColumnProps {
  isDraggingOver: boolean;
}

const Column = styled.div<ColumnProps>`
  background-color: ${(props) =>
    props.isDraggingOver ? "#eef2ff" : "#f7f9fc"};
  border-radius: 8px;
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  box-shadow: ${(props) =>
    props.isDraggingOver
      ? "0 0 0 2px #6366f1, 0 4px 12px rgba(99, 102, 241, 0.2)"
      : "0 2px 10px rgba(0, 0, 0, 0.05)"};
  transition: all 0.2s ease;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    margin-bottom: 1rem;
  }
`;

const ColumnHeader = styled.div<{ color: string }>`
  padding: 1rem;
  border-bottom: 1px solid #eaedf3;
  background-color: white;
  border-top: 4px solid ${(props) => props.color};
  border-radius: 8px 8px 0 0;
`;

const ColumnTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
`;

const TaskCount = styled.span`
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  margin-left: 0.5rem;
`;

interface TaskListProps {
  isDraggingOver: boolean;
  isSourceColumn: boolean;
}

const TaskList = styled.div<TaskListProps>`
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
  transition: all 0.2s ease;
  filter: ${(props) =>
    props.isDraggingOver && !props.isSourceColumn ? "blur(2px)" : "none"};
  opacity: ${(props) =>
    props.isDraggingOver && !props.isSourceColumn ? 0.7 : 1};
  pointer-events: ${(props) =>
    props.isDraggingOver && !props.isSourceColumn ? "none" : "auto"};
`;

interface TaskCardProps {
  isDragging: boolean;
  isColumnDraggingOver: boolean;
  isInSourceColumn: boolean;
}

const TaskCard = styled.div<TaskCardProps>`
  background-color: white;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  box-shadow: ${(props) =>
    props.isDragging
      ? "0 8px 16px rgba(0, 0, 0, 0.1), 0 0 0 2px #6366f1"
      : "0 1px 3px rgba(0, 0, 0, 0.1)"};
  border-left: 3px solid #6366f1;
  cursor: grab;
  transition: all 0.2s ease;
  transform: ${(props) =>
    props.isDragging ? "rotate(1deg) scale(1.02)" : "none"};
  opacity: ${(props) => {
    if (props.isDragging) return 0.9;
    if (props.isColumnDraggingOver && !props.isInSourceColumn) return 0.7;
    return 1;
  }};

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    transform: ${(props) =>
      props.isDragging ? "rotate(1deg) scale(1.02)" : "translateY(-2px)"};
  }
`;

const TaskTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const TaskDescription = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 12px;
  line-height: 1.5;
`;

const AddTaskButton = styled.button`
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 0.8rem;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background-color: #e2e8f0;
    color: #475569;
  }
`;

const DropIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(99, 102, 241, 0.9);
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
  animation: fadeIn 0.2s ease-in-out;
  backdrop-filter: blur(4px);

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

// Get custom drag styles for animation
const getTaskStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): React.CSSProperties => ({
  ...draggableStyle,
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "white" : "white",
  // styles we need to apply on draggables
});

// Task form modal components
const ModalOverlay = styled.div`
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 0;
  border-radius: 12px;
  width: 550px;
  max-width: 95%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #6366f1;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
    opacity: 0.7;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
    opacity: 0.7;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  transition: all 0.2s;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;

  &:hover {
    border-color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #475569;
  border: 1px solid #cbd5e1;

  &:hover {
    background-color: #f1f5f9;
    border-color: #94a3b8;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.4);
  }
`;

const SubmitButton = styled(Button)`
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 0.5rem;
  font-size: 14px;
  padding: 10px;
  background-color: #fef2f2;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
`;

// Add these new styled components after the existing styled components
const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  background-color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: #475569;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
    color: #6366f1;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #1e293b;
  min-width: 180px;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 42px;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:hover {
    border-color: #94a3b8;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 14px;
  min-width: 250px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 42px; /* Fixed height to match select inputs */

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #94a3b8;
    opacity: 0.6;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;

  svg {
    color: #6366f1;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }
`;

// Add these new styled components for enhanced task cards
const TaskCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TaskCardBadges = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const TaskBadge = styled.span<{ bgColor: string; textColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.textColor};
`;

const TaskDueDate = styled.div<{ isOverdue: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${(props) => (props.isOverdue ? "#ef4444" : "#64748b")};
  font-weight: ${(props) => (props.isOverdue ? "600" : "500")};
  margin-top: 8px;
`;

const TaskAssignee = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
  background-color: #f8fafc;
  padding: 4px 8px;
  border-radius: 4px;
  width: fit-content;
`;

const TaskEventTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
  width: fit-content;
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
`;

const TaskCreatedAt = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
`;

const Tasks: React.FC = () => {
  const axiosInstanceRef = useRef(useAxiosWithAuth());
  const initialEventIdSetRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams<{ taskId?: string }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceColumn, setSourceColumn] = useState<string | null>(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormStatus, setTaskFormStatus] = useState<
    "next" | "inProgress" | "finished"
  >("next");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignee: "",
    notes: "",
    eventId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Task detail modal state - now derived from URL if available
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    taskId || null
  );

  // Update selectedTaskId when URL parameter changes
  useEffect(() => {
    setSelectedTaskId(taskId || null);
  }, [taskId]);

  // Add these new state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");

  // Fetch all events - only once
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        console.log("Fetching events...");
        const response = await axiosInstanceRef.current.get("/events");

        if (!isMounted) return;

        console.log("Events response:", response);

        // Handle different response formats
        if (Array.isArray(response.data)) {
          console.log(
            "Events data is an array with length:",
            response.data.length
          );
          setEvents(response.data);

          // If we have events and no eventId is selected yet, set the first one
          if (response.data.length > 0 && !initialEventIdSetRef.current) {
            initialEventIdSetRef.current = true;
            setTaskForm((prev) => ({
              ...prev,
              eventId: response.data[0]._id,
            }));
          }
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.events)
        ) {
          console.log(
            "Events found in response.data.events with length:",
            response.data.events.length
          );
          setEvents(response.data.events);

          // If we have events and no eventId is selected yet, set the first one
          if (
            response.data.events.length > 0 &&
            !initialEventIdSetRef.current
          ) {
            initialEventIdSetRef.current = true;
            setTaskForm((prev) => ({
              ...prev,
              eventId: response.data.events[0]._id,
            }));
          }
        } else if (response.data && typeof response.data === "object") {
          // Try to find an array in the response
          console.log("Response data keys:", Object.keys(response.data));
          let foundEvents = false;

          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(
                `Found array in response.data.${key} with length:`,
                response.data[key].length
              );
              setEvents(response.data[key]);
              foundEvents = true;

              // If we have events and no eventId is selected yet, set the first one
              if (
                response.data[key].length > 0 &&
                !initialEventIdSetRef.current
              ) {
                initialEventIdSetRef.current = true;
                setTaskForm((prev) => ({
                  ...prev,
                  eventId: response.data[key][0]._id,
                }));
              }

              break;
            }
          }

          if (!foundEvents) {
            console.error("Could not find events array in response");
            setEvents([]);
          }
        } else {
          console.error(
            "Events response is not an array or object:",
            response.data
          );
          setEvents([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching events:", err);
        setEvents([]);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Fetch all tasks
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching tasks...");
        // Use the new tasks endpoint
        const response = await axiosInstanceRef.current.get("/tasks");

        if (!isMounted) return;

        console.log("Tasks response:", response);

        // Handle different response formats
        if (Array.isArray(response.data)) {
          console.log(
            "Tasks data is an array with length:",
            response.data.length
          );
          setTasks(response.data);
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.tasks)
        ) {
          console.log(
            "Tasks found in response.data.tasks with length:",
            response.data.tasks.length
          );
          setTasks(response.data.tasks);
        } else if (response.data && typeof response.data === "object") {
          // Try to find an array in the response
          console.log("Response data keys:", Object.keys(response.data));
          let foundTasks = false;

          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(
                `Found array in response.data.${key} with length:`,
                response.data[key].length
              );
              setTasks(response.data[key]);
              foundTasks = true;
              break;
            }
          }

          if (!foundTasks) {
            console.error("Could not find tasks array in response");
            setTasks([]);
            setError("Received invalid data format from server");
          }
        } else {
          console.error(
            "Tasks response is not an array or object:",
            response.data
          );
          setTasks([]);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setTasks([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const onDragStart = (start: DragStart) => {
    setIsDragging(true);
    setSourceColumn(start.source.droppableId);
  };

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    setDraggingOver(null);
    setSourceColumn(null);

    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in its original position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Find the task that was dragged
    const task = tasks.find((task) => task._id === draggableId);
    if (!task) return;

    try {
      // Optimistically update the UI
      const newTasks = tasks.filter((t) => t._id !== draggableId);

      // Create a new task with the updated status
      const updatedTask = {
        ...task,
        status: destination.droppableId as "next" | "inProgress" | "finished",
        isCompleted: destination.droppableId === "finished",
      };

      // Insert the task at the correct position in the new array
      const tasksInDestination = newTasks.filter(
        (t) => t.status === destination.droppableId
      );
      const tasksBeforeDestination = tasksInDestination.slice(
        0,
        destination.index
      );
      const tasksAfterDestination = tasksInDestination.slice(destination.index);

      const reorderedTasks = [
        ...newTasks.filter((t) => t.status !== destination.droppableId),
        ...tasksBeforeDestination,
        updatedTask,
        ...tasksAfterDestination,
      ];

      // Update the state with the new task order
      setTasks(reorderedTasks);

      // Send the update to the backend using the new API
      await axiosInstanceRef.current.patch(`/tasks/${draggableId}/status`, {
        status: destination.droppableId,
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      // If there's an error, revert to the original state
    }
  };

  const onDragUpdate = (update: DragUpdate) => {
    if (!update.destination) {
      setDraggingOver(null);
      return;
    }

    setDraggingOver(update.destination.droppableId);
  };

  const handleAddTask = (status: "next" | "inProgress" | "finished") => {
    setTaskFormStatus(status);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignee: "",
      notes: "",
      eventId: events.length > 0 ? events[0]._id : "",
    });
    setFormError(null);
    setShowTaskModal(true);
  };

  const handleTaskFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!taskForm.title.trim()) {
      setFormError("Task title is required");
      return;
    }

    if (!taskForm.dueDate) {
      setFormError("Due date is required");
      return;
    }

    if (!taskForm.eventId) {
      setFormError("Please select an event for this task");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      // Use the new API endpoint
      const response = await axiosInstanceRef.current.post(
        `/tasks/event/${taskForm.eventId}`,
        {
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate,
          status: taskFormStatus,
          isCompleted: taskFormStatus === "finished",
          priority: taskForm.priority,
          assignee: taskForm.assignee,
          notes: taskForm.notes,
        }
      );

      // Add the new task to the state
      setTasks((prev) => [...prev, response.data.task]);

      // Close the modal
      setShowTaskModal(false);
    } catch (err) {
      console.error("Error adding task:", err);
      setFormError("Failed to add task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add this new function to filter tasks
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // Event filter
      if (selectedEvent !== "all" && task.eventId !== selectedEvent) {
        return false;
      }

      // Search term filter
      if (
        searchTerm &&
        !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(
          task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== "all") {
        if (assigneeFilter === "unassigned" && task.assignee) {
          return false;
        } else if (
          assigneeFilter !== "unassigned" &&
          task.assignee !== assigneeFilter
        ) {
          return false;
        }
      }

      // Due date filter
      if (dueDateFilter !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (
          dueDateFilter === "today" &&
          taskDate.getTime() !== today.getTime()
        ) {
          return false;
        } else if (dueDateFilter === "thisWeek") {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

          if (taskDate < today || taskDate > endOfWeek) {
            return false;
          }
        } else if (dueDateFilter === "overdue") {
          if (taskDate >= today) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Update these variables to use the filtered tasks
  const filteredTasks = getFilteredTasks();
  const nextTasks = filteredTasks.filter((task) => task.status === "next");
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "inProgress"
  );
  const finishedTasks = filteredTasks.filter(
    (task) => task.status === "finished"
  );

  // Get unique assignees for the filter dropdown
  const uniqueAssignees = useMemo(() => {
    const assignees = tasks
      .filter((task) => task.assignee)
      .map((task) => task.assignee as string);
    return ["all", "unassigned", ...new Set(assignees)];
  }, [tasks]);

  const handleEventFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };

  // Handle task click to open detail view
  const handleTaskClick = (taskId: string) => {
    // Navigate to the task detail URL instead of just setting state
    navigate(`/tasks/${taskId}`);
    // No need to call setSelectedTaskId here as it will be updated via the useEffect
  };

  // Handle task update from detail view
  const handleTaskUpdated = (updatedTask?: Task) => {
    if (updatedTask) {
      // Update the task in the local state without refetching
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    } else {
      // If no task is provided (e.g., after deletion), refresh the tasks
      const fetchTasks = async () => {
        try {
          setLoading(true);
          setError(null);

          console.log("Refreshing tasks...");
          const response = await axiosInstanceRef.current.get("/tasks");

          // Handle different response formats
          if (Array.isArray(response.data)) {
            setTasks(response.data);
          } else if (
            response.data &&
            typeof response.data === "object" &&
            Array.isArray(response.data.tasks)
          ) {
            setTasks(response.data.tasks);
          } else if (response.data && typeof response.data === "object") {
            // Try to find an array in the response
            let foundTasks = false;

            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                setTasks(response.data[key]);
                foundTasks = true;
                break;
              }
            }

            if (!foundTasks) {
              setTasks([]);
              setError("Received invalid data format from server");
            }
          } else {
            setTasks([]);
            setError("Received invalid data format from server");
          }
        } catch (err) {
          console.error("Error refreshing tasks:", err);
          setError("Failed to refresh tasks. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchTasks();

      // If a task was deleted, navigate back to the tasks list
      if (location.pathname.includes("/tasks/")) {
        navigate("/tasks");
      }
    }
  };

  // Handle closing the task detail
  const handleTaskDetailClose = () => {
    // Navigate back to the tasks list
    navigate("/tasks");
  };

  if (loading) {
    return (
      <PageWrapper>
        <TopBar sectionTitle="Task Management" />
        <Container>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <LoadingSpinner />
            <p>Loading tasks...</p>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <TopBar sectionTitle="Task Management" />
        <Container>
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}
          >
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar sectionTitle="Task Management" />

      <Container>
        <SummaryCard>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12H15M9 16H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Total Tasks: {filteredTasks.length}</span>
        </SummaryCard>

        <FiltersBar>
          <FilterGroup>
            <FilterLabel htmlFor="search">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Search
            </FilterLabel>
            <SearchContainer>
              <SearchInput
                id="search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm !== "" && (
                <ClearButton onClick={() => setSearchTerm("")}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 9L15 15M15 9L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ClearButton>
              )}
            </SearchContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="eventFilter">
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
                  d="M16 2V6M8 2V6M3 10H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Event
            </FilterLabel>
            <FilterSelect
              id="eventFilter"
              value={selectedEvent}
              onChange={handleEventFilterChange}
              style={{
                borderLeft:
                  selectedEvent !== "all" ? "4px solid #6366f1" : "none",
              }}
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="priorityFilter">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Priority
            </FilterLabel>
            <FilterSelect
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPriorityFilter(e.target.value)
              }
              style={{
                borderLeft:
                  priorityFilter !== "all"
                    ? `4px solid ${
                        priorityFilter === "high"
                          ? "#ef4444"
                          : priorityFilter === "medium"
                          ? "#f59e0b"
                          : "#10b981"
                      }`
                    : "none",
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="assigneeFilter">
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
              Assignee
            </FilterLabel>
            <FilterSelect
              id="assigneeFilter"
              value={assigneeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setAssigneeFilter(e.target.value)
              }
              style={{
                borderLeft:
                  assigneeFilter !== "all" ? "4px solid #8b5cf6" : "none",
              }}
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {uniqueAssignees
                .filter((a) => a !== "all" && a !== "unassigned")
                .map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="dueDateFilter">
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
              Due Date
            </FilterLabel>
            <FilterSelect
              id="dueDateFilter"
              value={dueDateFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDueDateFilter(e.target.value)
              }
              style={{
                borderLeft:
                  dueDateFilter !== "all" ? "4px solid #0ea5e9" : "none",
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="overdue">Overdue</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersBar>

        <DragDropContext
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
        >
          <KanbanBoard>
            {/* Next Column */}
            <Column isDraggingOver={draggingOver === "next"}>
              <ColumnHeader color="#3b82f6">
                <ColumnTitle>
                  Next <TaskCount>{nextTasks.length}</TaskCount>
                </ColumnTitle>
              </ColumnHeader>
              {draggingOver === "next" &&
                isDragging &&
                sourceColumn !== "next" && (
                  <DropIndicator>Move to Next</DropIndicator>
                )}
              <StrictModeDroppable droppableId="next">
                {(provided: DroppableProvided) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={draggingOver === "next" && isDragging}
                    isSourceColumn={sourceColumn === "next"}
                  >
                    {nextTasks.length === 0 ? (
                      <EmptyState>
                        <EmptyStateIcon>📋</EmptyStateIcon>
                        <p>No tasks yet</p>
                      </EmptyState>
                    ) : (
                      nextTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id || ""}
                          index={index}
                        >
                          {(
                            provided: DraggableProvided,
                            snapshot: DraggableStateSnapshot
                          ) => (
                            <TaskCard
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getTaskStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              isDragging={snapshot.isDragging}
                              isColumnDraggingOver={draggingOver === "next"}
                              isInSourceColumn={sourceColumn === "next"}
                              onClick={() => handleTaskClick(task._id || "")}
                            >
                              <TaskCardHeader>
                                <TaskTitle>{task.title}</TaskTitle>
                                <TaskCardBadges>
                                  {task.priority && (
                                    <TaskBadge
                                      bgColor={
                                        task.priority === "high"
                                          ? "#fee2e2"
                                          : task.priority === "medium"
                                          ? "#fef3c7"
                                          : "#ecfdf5"
                                      }
                                      textColor={
                                        task.priority === "high"
                                          ? "#b91c1c"
                                          : task.priority === "medium"
                                          ? "#92400e"
                                          : "#065f46"
                                      }
                                    >
                                      {task.priority.charAt(0).toUpperCase() +
                                        task.priority.slice(1)}
                                    </TaskBadge>
                                  )}
                                </TaskCardBadges>
                              </TaskCardHeader>

                              {task.description && (
                                <TaskDescription>
                                  {task.description.length > 100
                                    ? `${task.description.substring(0, 100)}...`
                                    : task.description}
                                </TaskDescription>
                              )}

                              {task.dueDate && (
                                <TaskDueDate
                                  isOverdue={
                                    new Date(task.dueDate) < new Date()
                                  }
                                >
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {format(
                                    new Date(task.dueDate),
                                    "MMM d, yyyy"
                                  )}
                                  {new Date(task.dueDate) < new Date() &&
                                    " (Overdue)"}
                                </TaskDueDate>
                              )}

                              {task.event && (
                                <TaskEventTag>
                                  <svg
                                    width="12"
                                    height="12"
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
                                      d="M16 2V6M8 2V6M3 10H21"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {task.event.title}
                                </TaskEventTag>
                              )}

                              {task.assignee && (
                                <TaskAssignee>
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {task.assignee}
                                </TaskAssignee>
                              )}

                              {task.createdAt && (
                                <TaskFooter>
                                  <TaskCreatedAt>
                                    Created{" "}
                                    {format(new Date(task.createdAt), "MMM d")}
                                  </TaskCreatedAt>
                                </TaskFooter>
                              )}
                            </TaskCard>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                    <AddTaskButton onClick={() => handleAddTask("next")}>
                      + Add Task
                    </AddTaskButton>
                  </TaskList>
                )}
              </StrictModeDroppable>
            </Column>

            {/* In Progress Column */}
            <Column isDraggingOver={draggingOver === "inProgress"}>
              <ColumnHeader color="#8b5cf6">
                <ColumnTitle>
                  In Progress <TaskCount>{inProgressTasks.length}</TaskCount>
                </ColumnTitle>
              </ColumnHeader>
              {draggingOver === "inProgress" &&
                isDragging &&
                sourceColumn !== "inProgress" && (
                  <DropIndicator>Move to In Progress</DropIndicator>
                )}
              <StrictModeDroppable droppableId="inProgress">
                {(provided: DroppableProvided) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={draggingOver === "inProgress" && isDragging}
                    isSourceColumn={sourceColumn === "inProgress"}
                  >
                    {inProgressTasks.length === 0 ? (
                      <EmptyState>
                        <EmptyStateIcon>🔄</EmptyStateIcon>
                        <p>No tasks in progress</p>
                      </EmptyState>
                    ) : (
                      inProgressTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id || ""}
                          index={index}
                        >
                          {(
                            provided: DraggableProvided,
                            snapshot: DraggableStateSnapshot
                          ) => (
                            <TaskCard
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getTaskStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              isDragging={snapshot.isDragging}
                              isColumnDraggingOver={
                                draggingOver === "inProgress"
                              }
                              isInSourceColumn={sourceColumn === "inProgress"}
                              onClick={() => handleTaskClick(task._id || "")}
                            >
                              <TaskCardHeader>
                                <TaskTitle>{task.title}</TaskTitle>
                                <TaskCardBadges>
                                  {task.priority && (
                                    <TaskBadge
                                      bgColor={
                                        task.priority === "high"
                                          ? "#fee2e2"
                                          : task.priority === "medium"
                                          ? "#fef3c7"
                                          : "#ecfdf5"
                                      }
                                      textColor={
                                        task.priority === "high"
                                          ? "#b91c1c"
                                          : task.priority === "medium"
                                          ? "#92400e"
                                          : "#065f46"
                                      }
                                    >
                                      {task.priority.charAt(0).toUpperCase() +
                                        task.priority.slice(1)}
                                    </TaskBadge>
                                  )}
                                </TaskCardBadges>
                              </TaskCardHeader>

                              {task.description && (
                                <TaskDescription>
                                  {task.description.length > 100
                                    ? `${task.description.substring(0, 100)}...`
                                    : task.description}
                                </TaskDescription>
                              )}

                              {task.dueDate && (
                                <TaskDueDate
                                  isOverdue={
                                    new Date(task.dueDate) < new Date()
                                  }
                                >
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {format(
                                    new Date(task.dueDate),
                                    "MMM d, yyyy"
                                  )}
                                  {new Date(task.dueDate) < new Date() &&
                                    " (Overdue)"}
                                </TaskDueDate>
                              )}

                              {task.event && (
                                <TaskEventTag>
                                  <svg
                                    width="12"
                                    height="12"
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
                                      d="M16 2V6M8 2V6M3 10H21"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {task.event.title}
                                </TaskEventTag>
                              )}

                              {task.assignee && (
                                <TaskAssignee>
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {task.assignee}
                                </TaskAssignee>
                              )}

                              {task.createdAt && (
                                <TaskFooter>
                                  <TaskCreatedAt>
                                    Created{" "}
                                    {format(new Date(task.createdAt), "MMM d")}
                                  </TaskCreatedAt>
                                </TaskFooter>
                              )}
                            </TaskCard>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                    <AddTaskButton onClick={() => handleAddTask("inProgress")}>
                      + Add Task
                    </AddTaskButton>
                  </TaskList>
                )}
              </StrictModeDroppable>
            </Column>

            {/* Finished Column */}
            <Column isDraggingOver={draggingOver === "finished"}>
              <ColumnHeader color="#10b981">
                <ColumnTitle>
                  Finished <TaskCount>{finishedTasks.length}</TaskCount>
                </ColumnTitle>
              </ColumnHeader>
              {draggingOver === "finished" &&
                isDragging &&
                sourceColumn !== "finished" && (
                  <DropIndicator>Move to Finished</DropIndicator>
                )}
              <StrictModeDroppable droppableId="finished">
                {(provided: DroppableProvided) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={draggingOver === "finished" && isDragging}
                    isSourceColumn={sourceColumn === "finished"}
                  >
                    {finishedTasks.length === 0 ? (
                      <EmptyState>
                        <EmptyStateIcon>✅</EmptyStateIcon>
                        <p>No completed tasks</p>
                      </EmptyState>
                    ) : (
                      finishedTasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id || ""}
                          index={index}
                        >
                          {(
                            provided: DraggableProvided,
                            snapshot: DraggableStateSnapshot
                          ) => (
                            <TaskCard
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getTaskStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              isDragging={snapshot.isDragging}
                              isColumnDraggingOver={draggingOver === "finished"}
                              isInSourceColumn={sourceColumn === "finished"}
                              onClick={() => handleTaskClick(task._id || "")}
                            >
                              <TaskCardHeader>
                                <TaskTitle>{task.title}</TaskTitle>
                                <TaskCardBadges>
                                  {task.priority && (
                                    <TaskBadge
                                      bgColor={
                                        task.priority === "high"
                                          ? "#fee2e2"
                                          : task.priority === "medium"
                                          ? "#fef3c7"
                                          : "#ecfdf5"
                                      }
                                      textColor={
                                        task.priority === "high"
                                          ? "#b91c1c"
                                          : task.priority === "medium"
                                          ? "#92400e"
                                          : "#065f46"
                                      }
                                    >
                                      {task.priority.charAt(0).toUpperCase() +
                                        task.priority.slice(1)}
                                    </TaskBadge>
                                  )}
                                </TaskCardBadges>
                              </TaskCardHeader>

                              {task.description && (
                                <TaskDescription>
                                  {task.description.length > 100
                                    ? `${task.description.substring(0, 100)}...`
                                    : task.description}
                                </TaskDescription>
                              )}

                              {task.dueDate && (
                                <TaskDueDate
                                  isOverdue={
                                    new Date(task.dueDate) < new Date()
                                  }
                                >
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {format(
                                    new Date(task.dueDate),
                                    "MMM d, yyyy"
                                  )}
                                  {new Date(task.dueDate) < new Date() &&
                                    " (Overdue)"}
                                </TaskDueDate>
                              )}

                              {task.event && (
                                <TaskEventTag>
                                  <svg
                                    width="12"
                                    height="12"
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
                                      d="M16 2V6M8 2V6M3 10H21"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {task.event.title}
                                </TaskEventTag>
                              )}

                              {task.assignee && (
                                <TaskAssignee>
                                  <svg
                                    width="12"
                                    height="12"
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
                                  {task.assignee}
                                </TaskAssignee>
                              )}

                              {task.createdAt && (
                                <TaskFooter>
                                  <TaskCreatedAt>
                                    Created{" "}
                                    {format(new Date(task.createdAt), "MMM d")}
                                  </TaskCreatedAt>
                                </TaskFooter>
                              )}
                            </TaskCard>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                    <AddTaskButton onClick={() => handleAddTask("finished")}>
                      + Add Task
                    </AddTaskButton>
                  </TaskList>
                )}
              </StrictModeDroppable>
            </Column>
          </KanbanBoard>
        </DragDropContext>

        {/* Task Form Modal */}
        {showTaskModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Add New Task
                </ModalTitle>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleTaskFormSubmit}>
                  <FormGroup>
                    <Label htmlFor="eventId">Event *</Label>
                    <Select
                      id="eventId"
                      name="eventId"
                      value={taskForm.eventId}
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="">Select an event</option>
                      {Array.isArray(events) &&
                        events.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.title}
                          </option>
                        ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskFormChange}
                      placeholder="Enter task title"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="description">Description</Label>
                    <TextArea
                      id="description"
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskFormChange}
                      placeholder="Enter task description"
                    />
                  </FormGroup>

                  <FormRow>
                    <FormColumn>
                      <FormGroup>
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={taskForm.dueDate}
                          onChange={handleTaskFormChange}
                          required
                        />
                      </FormGroup>
                    </FormColumn>
                    <FormColumn>
                      <FormGroup>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          id="priority"
                          name="priority"
                          value={taskForm.priority}
                          onChange={handleTaskFormChange}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </Select>
                      </FormGroup>
                    </FormColumn>
                  </FormRow>

                  <FormGroup>
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      name="assignee"
                      value={taskForm.assignee}
                      onChange={handleTaskFormChange}
                      placeholder="Who is responsible for this task?"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="notes">Notes</Label>
                    <TextArea
                      id="notes"
                      name="notes"
                      value={taskForm.notes}
                      onChange={handleTaskFormChange}
                      placeholder="Any additional notes"
                    />
                  </FormGroup>

                  {formError && <ErrorMessage>{formError}</ErrorMessage>}

                  <ButtonGroup>
                    <CancelButton
                      type="button"
                      onClick={() => setShowTaskModal(false)}
                    >
                      Cancel
                    </CancelButton>
                    <SubmitButton type="submit" disabled={submitting}>
                      {submitting ? <LoadingSpinner /> : "Add Task"}
                    </SubmitButton>
                  </ButtonGroup>
                </form>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Task Detail Modal - now conditionally rendered based on URL or local state */}
        {selectedTaskId && (
          <TaskDetail
            taskId={selectedTaskId}
            onClose={handleTaskDetailClose}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </Container>
    </PageWrapper>
  );
};

export default Tasks;

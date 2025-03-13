import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Task } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

interface TaskListProps {
  compact?: boolean; // Support different display modes
  onTaskClick?: (taskId: string) => void; // Optional callback for task interaction
  eventId?: string; // Optional filter by event
  events?: {
    _id: string;
    title: string;
    date: string;
    endDate: string;
    poster: string;
    guests: {
      _id: string;
      name: string;
      email: string;
      attendance_status: boolean;
    }[];
    tasks: {
      _id: string;
      title: string;
      isCompleted: boolean;
      dueDate: string;
      // Note: These are the only fields available in the events.tasks array
      // Other Task fields will be populated with defaults
    }[];
  }[];
  tasks?: Task[]; // Add direct tasks prop
}

const TaskListContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
  text-align: center;

  svg {
    width: 48px;
    height: 48px;
    stroke: #ccc;
    margin-bottom: 16px;
  }

  p {
    font-size: 15px;
    margin: 0;
  }
`;

const Content = styled.div`
  padding: 16px 20px;
`;

const EventSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    color: #888;
    font-size: 14px;
    font-weight: 500;
  }
`;

const TaskItem = styled.div<{ isCompleted: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ isCompleted }) =>
    isCompleted ? "rgba(0, 188, 138, 0.05)" : "#fff"};
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
  position: relative;
  border: 1px solid
    ${({ isCompleted }) => (isCompleted ? "rgba(0, 188, 138, 0.2)" : "#eee")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TaskStatus = styled.div<{ isCompleted: boolean; status: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${({ isCompleted, status }) => {
      if (isCompleted) return "#00BC8A";
      if (status === "inProgress") return "#FFB800";
      if (status === "next") return "#ddd";
      return "#ddd";
    }};
  background-color: ${({ isCompleted, status }) => {
    if (isCompleted) return "#00BC8A";
    if (status === "inProgress") return "rgba(255, 184, 0, 0.2)";
    return "transparent";
  }};
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
    stroke: white;
    stroke-width: 3;
  }
`;

const TaskDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div<{ isCompleted: boolean }>`
  font-size: 15px;
  font-weight: 500;
  color: ${({ isCompleted }) => (isCompleted ? "#666" : "#333")};
  margin-bottom: 4px;
  text-decoration: ${({ isCompleted }) =>
    isCompleted ? "line-through" : "none"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TaskDescription = styled.div`
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DueDate = styled.div<{ isPast?: boolean }>`
  font-size: 13px;
  color: ${({ isPast }) => (isPast ? "#E30D8E" : "#888")};
  display: flex;
  align-items: center;

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    margin-right: 4px;
  }
`;

const Priority = styled.div<{ priority: string }>`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ priority }) => {
    if (priority === "high") return "rgba(227, 13, 142, 0.1)";
    if (priority === "medium") return "rgba(255, 184, 0, 0.1)";
    return "rgba(0, 188, 138, 0.1)";
  }};
  color: ${({ priority }) => {
    if (priority === "high") return "#E30D8E";
    if (priority === "medium") return "#FFB800";
    return "#00BC8A";
  }};
`;

const EventBadge = styled.div`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(107, 61, 223, 0.1);
  color: #6b3ddf;
`;

const TaskList: React.FC<TaskListProps> = ({
  compact = false,
  onTaskClick,
  eventId,
  events,
  tasks: propTasks,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Create a stable reference to the axios instance
  const axiosInstanceRef = useRef(useAxiosWithAuth());
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // If direct tasks are provided, use them
    if (propTasks && propTasks.length > 0) {
      setTasks(propTasks);
      setLoading(false);
      return;
    }

    // If events are provided, extract tasks from them
    if (events && events.length > 0) {
      const extractedTasks: Task[] = [];

      events.forEach((event) => {
        if (event.tasks && Array.isArray(event.tasks)) {
          event.tasks.forEach((task) => {
            // Create a task object with all required fields
            // The event.tasks array contains limited task data, so we need to provide defaults for missing fields
            const taskWithRequiredFields: Task = {
              _id: task._id,
              title: task.title,
              isCompleted: task.isCompleted,
              dueDate: task.dueDate,
              status: task.isCompleted ? "finished" : "next", // Default status based on completion
              eventId: event._id,
              event: {
                _id: event._id,
                title: event.title,
              },
              // Add optional fields with defaults
              priority: "medium", // Default priority
              description: "", // Default description
              assignee: "", // Default assignee
              notes: "", // Default notes
              createdAt: new Date().toISOString(), // Default creation date
              updatedAt: new Date().toISOString(), // Default update date
            };

            extractedTasks.push(taskWithRequiredFields);
          });
        }
      });

      setTasks(extractedTasks);
      setLoading(false);
      return;
    }

    // If neither direct tasks nor events are provided, fetch tasks from API
    const fetchTasks = async () => {
      try {
        setLoading(true);

        // Build the URL with optional eventId filter
        const url = eventId ? `/tasks?eventId=${eventId}` : "/tasks";
        const response = await axiosInstanceRef.current.get(url);

        if (!isMounted) return;

        let tasksData: Task[] = [];

        // Handle different response formats
        if (Array.isArray(response.data)) {
          tasksData = response.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.tasks)
        ) {
          tasksData = response.data.tasks;
        } else if (response.data && typeof response.data === "object") {
          // Try to find an array in the response
          let foundTasks = false;

          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              tasksData = response.data[key];
              foundTasks = true;
              break;
            }
          }

          if (!foundTasks) {
            setTasks([]);
            setError("Received invalid data format from server");
            return;
          }
        } else {
          setTasks([]);
          setError("Received invalid data format from server");
          return;
        }

        // Ensure all tasks have the required fields
        const validatedTasks = tasksData.map((task) => {
          // Make sure all required fields are present
          const validatedTask: Task = {
            _id: task._id || "",
            title: task.title || "Untitled Task",
            isCompleted: !!task.isCompleted,
            dueDate: task.dueDate || new Date().toISOString(),
            status: task.status || (task.isCompleted ? "finished" : "next"),
            eventId: task.eventId || "",
            // Include optional fields if they exist
            event: task.event,
            assignee: task.assignee,
            priority: task.priority,
            notes: task.notes,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
          return validatedTask;
        });

        setTasks(validatedTasks);
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
  }, [eventId, events, propTasks]); // Add propTasks to the dependency array

  // Check if a date is in the past
  const isPastDue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Format date to be more human-readable
  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Set hours to 0 for comparison
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      return "Today";
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (dueDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return dueDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year:
          dueDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      // Navigate to task detail or event detail page
      if (taskId) {
        const task = tasks.find((t) => t._id === taskId);
        if (task && task.eventId) {
          navigate(`/events/${task.eventId}`);
        }
      }
    }
  };

  // Group tasks by event
  const groupTasksByEvent = () => {
    const eventGroups: { [key: string]: { title: string; tasks: Task[] } } = {};

    tasks.forEach((task) => {
      if (task.event && task.event._id) {
        const eventId = task.event._id;
        if (!eventGroups[eventId]) {
          eventGroups[eventId] = {
            title: task.event.title || "Unknown Event",
            tasks: [],
          };
        }
        eventGroups[eventId].tasks.push(task);
      } else if (task.eventId) {
        // Fallback if event object is not populated
        const eventId = task.eventId;
        if (!eventGroups[eventId]) {
          eventGroups[eventId] = {
            title: "Unknown Event",
            tasks: [],
          };
        }
        eventGroups[eventId].tasks.push(task);
      }
    });

    // Sort tasks within each event by due date
    Object.values(eventGroups).forEach((group) => {
      group.tasks.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    });

    return eventGroups;
  };

  const eventGroups = groupTasksByEvent();
  const hasEvents = Object.keys(eventGroups).length > 0;

  if (loading) {
    return (
      <TaskListContainer>
        <EmptyState>
          <p>Loading tasks...</p>
        </EmptyState>
      </TaskListContainer>
    );
  }

  if (error) {
    return (
      <TaskListContainer>
        <EmptyState>
          <p>{error}</p>
        </EmptyState>
      </TaskListContainer>
    );
  }

  return (
    <TaskListContainer>
      {!hasEvents ? (
        <EmptyState>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 11L12 14L20 6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>No tasks created yet</p>
        </EmptyState>
      ) : (
        <Content>
          {Object.entries(eventGroups).map(
            ([eventId, { title, tasks: eventTasks }]) => (
              <EventSection key={eventId}>
                <EventTitle>
                  {title}
                  <span>
                    {eventTasks.length}{" "}
                    {eventTasks.length === 1 ? "task" : "tasks"}
                  </span>
                </EventTitle>

                {eventTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    isCompleted={task.isCompleted}
                    onClick={() => handleTaskClick(task._id || "")}
                  >
                    <TaskStatus
                      isCompleted={task.isCompleted}
                      status={task.status}
                    >
                      {task.isCompleted && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 12L10 17L19 8"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </TaskStatus>

                    <TaskDetails>
                      <TaskTitle isCompleted={task.isCompleted}>
                        {task.title}
                      </TaskTitle>

                      {task.description && !compact && (
                        <TaskDescription>{task.description}</TaskDescription>
                      )}

                      <TaskMeta>
                        <DueDate
                          isPast={!task.isCompleted && isPastDue(task.dueDate)}
                        >
                          <svg
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
                          {formatDueDate(task.dueDate)}
                        </DueDate>

                        {task.priority && !compact && (
                          <Priority priority={task.priority}>
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </Priority>
                        )}

                        {!eventId && !compact && task.event && (
                          <EventBadge>{task.event.title}</EventBadge>
                        )}
                      </TaskMeta>
                    </TaskDetails>
                  </TaskItem>
                ))}
              </EventSection>
            )
          )}
        </Content>
      )}
    </TaskListContainer>
  );
};

export default TaskList;

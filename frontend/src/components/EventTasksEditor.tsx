import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { Task } from "../types";
import CustomCheckbox from "../common/CustomCheckbox";
import { PrimaryButton, SecondaryButton } from "./EventGuestsEditor";

// Styled Components
const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px auto;
  width: calc(100% - 40px);
  max-width: 900px;
`;

const Header = styled.div`
  color: #1e293b;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TasksContainer = styled.div`
  margin-bottom: 24px;
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const TasksTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  margin: 0;
`;

const TaskCount = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 400;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskItem = styled.div<{ status: string; isCompleted: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: white;
  border-left: 4px solid
    ${({ status, isCompleted }) => {
      if (isCompleted) return "#10b981";
      if (status === "inProgress") return "#f59e0b";
      return "#94a3b8";
    }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const TaskContent = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const TaskTitle = styled.div<{ isCompleted: boolean }>`
  font-size: 15px;
  font-weight: 500;
  color: ${({ isCompleted }) => (isCompleted ? "#64748b" : "#1e293b")};
  text-decoration: ${({ isCompleted }) =>
    isCompleted ? "line-through" : "none"};
  margin-bottom: 4px;
`;

const TaskDescription = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TaskMetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
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
`;

const StatusBadge = styled.span<{ status: string }>`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
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
`;

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const FormContainer = styled.div`
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
`;

const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  margin: 0 0 16px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #475569;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #6366f1;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #6366f1;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #6366f1;
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    color: #1e293b;
    background-color: white;
  }
`;

interface Event {
  _id: string;
  title?: string;
}

interface EventTasksEditorProps {
  event: Event;
  refetch: () => void;
}

const EventTasksEditor: React.FC<EventTasksEditorProps> = ({
  event,
  refetch,
}) => {
  // Create a stable reference to the axios instance
  const axiosInstanceRef = useRef(useAxiosWithAuth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: new Date().toISOString(),
    status: "next",
    isCompleted: false,
    priority: "medium",
    assignee: "",
    notes: "",
    eventId: event._id,
  });

  // Fetch tasks for this event
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axiosInstanceRef.current.get(
          `/tasks?eventId=${event._id}`
        );

        if (!isMounted) return;

        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.tasks)
        ) {
          setTasks(response.data.tasks);
        } else {
          console.error("Unexpected response format:", response.data);
          setTasks([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
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
  }, [event._id]); // Only depend on event._id, not on axiosInstance

  // Add new task
  const addTask = async () => {
    if (!newTask.title?.trim()) return;

    try {
      const response = await axiosInstanceRef.current.post(
        `/tasks/event/${event._id}`,
        {
          title: newTask.title,
          description: newTask.description || "",
          dueDate: newTask.dueDate,
          status: newTask.status,
          isCompleted: newTask.status === "finished",
          priority: newTask.priority,
          assignee: newTask.assignee || "",
          notes: newTask.notes || "",
        }
      );

      // Add the new task to the state
      if (response.data && response.data.task) {
        setTasks((prev) => [...prev, response.data.task]);
      }

      // Reset the form
      setNewTask({
        title: "",
        description: "",
        dueDate: new Date().toISOString(),
        status: "next",
        isCompleted: false,
        priority: "medium",
        assignee: "",
        notes: "",
        eventId: event._id,
      });

      // Hide the form
      setShowForm(false);

      // Trigger refetch to update parent component
      refetch();
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task");
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      await axiosInstanceRef.current.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));

      // Trigger refetch to update parent component
      refetch();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const newStatus = task.isCompleted ? task.status : "finished";
    const newIsCompleted = !task.isCompleted;

    try {
      await axiosInstanceRef.current.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
        isCompleted: newIsCompleted,
      });

      // Update the task in the state
      setTasks(
        tasks.map((t) =>
          t._id === taskId
            ? { ...t, status: newStatus, isCompleted: newIsCompleted }
            : t
        )
      );

      // Trigger refetch to update parent component
      refetch();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewTask((prev) => ({ ...prev, dueDate: date.toISOString() }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Status display names
  const statusNames = {
    next: "To Do",
    inProgress: "In Progress",
    finished: "Completed",
  };

  // Status order for display
  const statusOrder = ["next", "inProgress", "finished"];

  if (loading) {
    return <Container>Loading tasks...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <Container>
      <Header>
        <div>Tasks for {event.title || "this event"}</div>
        <PrimaryButton width={130} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Task"}
        </PrimaryButton>
      </Header>

      {tasks.length === 0 ? (
        <EmptyState>
          <p>No tasks have been created for this event yet.</p>
          <p>Click "Add Task" to create your first task.</p>
        </EmptyState>
      ) : (
        statusOrder.map((status) => {
          const tasksInStatus = groupedTasks[status] || [];
          if (tasksInStatus.length === 0) return null;

          return (
            <TasksContainer key={status}>
              <TasksHeader>
                <TasksTitle>
                  {statusNames[status as keyof typeof statusNames]}
                </TasksTitle>
                <TaskCount>
                  {tasksInStatus.length} task
                  {tasksInStatus.length !== 1 ? "s" : ""}
                </TaskCount>
              </TasksHeader>

              <TasksList>
                {tasksInStatus.map((task) => (
                  <TaskItem
                    key={task._id}
                    status={task.status}
                    isCompleted={task.isCompleted}
                  >
                    <CustomCheckbox
                      checked={task.isCompleted}
                      onChange={() => toggleTaskCompletion(task._id || "")}
                    />

                    <TaskContent>
                      <TaskTitle isCompleted={task.isCompleted}>
                        {task.title}
                      </TaskTitle>

                      {task.description && (
                        <TaskDescription>{task.description}</TaskDescription>
                      )}

                      <TaskMeta>
                        <TaskMetaItem>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginRight: "4px" }}
                          >
                            <path
                              d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {formatDate(task.dueDate)}
                        </TaskMetaItem>

                        {task.priority && (
                          <PriorityBadge priority={task.priority}>
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </PriorityBadge>
                        )}

                        <StatusBadge status={task.status}>
                          {statusNames[task.status as keyof typeof statusNames]}
                        </StatusBadge>

                        {task.assignee && (
                          <TaskMetaItem>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ marginRight: "4px" }}
                            >
                              <path
                                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {task.assignee}
                          </TaskMetaItem>
                        )}
                      </TaskMeta>
                    </TaskContent>

                    <TaskActions>
                      <SecondaryButton
                        width={24}
                        color={"rgb(173, 1, 1)"}
                        onClick={() => deleteTask(task._id || "")}
                      >
                        -
                      </SecondaryButton>
                    </TaskActions>
                  </TaskItem>
                ))}
              </TasksList>
            </TasksContainer>
          );
        })
      )}

      {showForm && (
        <FormContainer>
          <FormTitle>Add New Task</FormTitle>

          <FormGroup>
            <Label>Title *</Label>
            <Input
              type="text"
              name="title"
              placeholder="Task title"
              value={newTask.title}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="Task description"
              value={newTask.description || ""}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGrid>
            <FormGroup>
              <Label>Due Date</Label>
              <DatePickerWrapper>
                <DatePicker
                  selected={
                    newTask.dueDate ? new Date(newTask.dueDate) : new Date()
                  }
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                />
              </DatePickerWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
              >
                <option value="next">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="finished">Completed</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Priority</Label>
              <Select
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Assignee</Label>
              <Input
                type="text"
                name="assignee"
                placeholder="Task assignee"
                value={newTask.assignee || ""}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Notes</Label>
            <Textarea
              name="notes"
              placeholder="Additional notes"
              value={newTask.notes || ""}
              onChange={handleInputChange}
            />
          </FormGroup>

          <ButtonContainer>
            <SecondaryButton onClick={() => setShowForm(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={addTask}>Add Task</PrimaryButton>
          </ButtonContainer>
        </FormContainer>
      )}
    </Container>
  );
};

export default EventTasksEditor;

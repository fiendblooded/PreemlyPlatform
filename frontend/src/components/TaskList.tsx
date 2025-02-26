import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Task {
  title: string;
  isCompleted: boolean;
  dueDate: string;
}

interface Event {
  _id: string;
  title: string;
  tasks: Task[];
}

interface TaskListProps {
  events: Event[];
  compact?: boolean; // New prop to support different display modes
  onTaskClick?: (eventId: string, taskIndex: number) => void; // Optional callback for task interaction
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

const TaskStatus = styled.div<{ isCompleted: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ isCompleted }) => (isCompleted ? "#00BC8A" : "#ddd")};
  background-color: ${({ isCompleted }) =>
    isCompleted ? "#00BC8A" : "transparent"};
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

const TaskList: React.FC<TaskListProps> = ({
  events,
  compact = false,
  onTaskClick,
}) => {
  // Filter out events without tasks and sort tasks by due date
  const tasksByEvent = events
    .map((event) => ({
      _id: event._id,
      title: event.title,
      tasks: event.tasks.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    }))
    .filter((event) => event.tasks.length > 0);

  const navigate = useNavigate();

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

  const handleTaskClick = (eventId: string, taskIndex: number) => {
    if (onTaskClick) {
      onTaskClick(eventId, taskIndex);
    } else {
      navigate(`./events/${eventId}`);
    }
  };

  return (
    <TaskListContainer>
      {tasksByEvent.length === 0 ? (
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
          {tasksByEvent.map((event, eventIndex) => (
            <EventSection key={eventIndex}>
              <EventTitle>
                {event.title}
                <span>
                  {event.tasks.length}{" "}
                  {event.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </EventTitle>

              {event.tasks.map((task, taskIndex) => (
                <TaskItem
                  key={taskIndex}
                  isCompleted={task.isCompleted}
                  onClick={() => handleTaskClick(event._id, taskIndex)}
                >
                  <TaskStatus isCompleted={task.isCompleted}>
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
                  </TaskDetails>
                </TaskItem>
              ))}
            </EventSection>
          ))}
        </Content>
      )}
    </TaskListContainer>
  );
};

export default TaskList;

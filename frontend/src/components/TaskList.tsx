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
}

const TaskListContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;

  font-family: Axiforma, sans-serif;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  background-color: #fff;
  padding: 10px 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e0e0e0;
`;

const Content = styled.div`
  padding: 10px 20px;
`;

const EventSection = styled.div`
  margin-bottom: 20px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const TaskItem = styled.div<{ isCompleted: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ isCompleted }) =>
    isCompleted ? "rgb(237, 255, 237)" : "#fff"};
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  position: relative;
  border: 1px solid #e0e0e0;
  cursor: pointer;
`;

const LeftBorder = styled.div<{ isCompleted: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background-color: ${(props) => (props.isCompleted ? "#2a9134" : "#ffc107")};
  border-radius: 6px 0 0 6px;
`;

const TaskDetails = styled.div`
  margin-left: 15px;
`;

const TaskTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const DueDate = styled.div`
  font-size: 14px;
  color: #555;
`;

const TaskList: React.FC<TaskListProps> = ({ events }) => {
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
  return (
    <TaskListContainer>
      <Header>Tasks</Header>
      <Content>
        {tasksByEvent.length === 0 ? (
          <p>No tasks created yet</p>
        ) : (
          tasksByEvent.map((event, eventIndex) => (
            <EventSection key={eventIndex}>
              <EventTitle>
                {event.title}
                {` (${event.tasks.length} tasks)`}
              </EventTitle>
              {event.tasks.map((task, taskIndex) => (
                <TaskItem
                  key={taskIndex}
                  isCompleted={task.isCompleted}
                  onClick={() => navigate(`./events/${event._id}`)}
                >
                  <LeftBorder isCompleted={task.isCompleted} />
                  <TaskDetails>
                    <TaskTitle>{task.title}</TaskTitle>
                    <DueDate>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </DueDate>
                  </TaskDetails>
                </TaskItem>
              ))}
            </EventSection>
          ))
        )}
      </Content>
    </TaskListContainer>
  );
};

export default TaskList;

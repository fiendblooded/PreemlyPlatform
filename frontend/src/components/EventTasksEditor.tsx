import React, { useState } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker"; // Assuming you have this installed
import "react-datepicker/dist/react-datepicker.css";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { StyledDatePickerWrapper } from "./EventDetailsEditor";
import { PrimaryButton, SecondaryButton } from "./EventDetail";

// Styled Components
const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90% !important;
  margin: auto;
  justify-content: space-between;
  margin-top: 0;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TaskItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const TaskTitle = styled.div<{ isCompleted: boolean }>`
  text-decoration: ${(props) => (props.isCompleted ? "line-through" : "none")};
  font-size: 16px;
  flex: 1;
  margin-right: 16px;
  color: black;
`;

const TaskActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CircleCheckbox = styled.div<{ isChecked: boolean }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${(props) => (props.isChecked ? "#00aef0" : "#ccc")};
  border-radius: 50%;
  background-color: ${(props) => (props.isChecked ? "#00aef0" : "transparent")};
  cursor: pointer;
`;

const AddTaskForm = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  margin: auto;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  color: black;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;

  font-size: 16px;

  /* Smooth transition for the border */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    outline: none;
  }
`;
const NoTasks = styled.div`
  width: 100%;
  text-align: center;
  color: black;
`;

interface Task {
  title: string;
  isCompleted: boolean;
  dueDate: string;
}

interface Event {
  _id: string;
  tasks: Task[];
}

const EventTasksEditor: React.FC<{ event: Event; refetch: () => void }> = ({
  event,
  refetch,
}) => {
  const axiosInstance = useAxiosWithAuth();
  const [tasks, setTasks] = useState<Task[]>(event.tasks);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  // Add new task
  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([
        ...tasks,
        {
          title: newTaskTitle,
          isCompleted: false,
          dueDate: new Date().toISOString(),
        },
      ]);
      setNewTaskTitle("");
    }
  };

  // Delete task
  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Toggle task completion
  const toggleTaskCompletion = (index: number) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  // Update task due date
  const updateTaskDueDate = (index: number, date: Date) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, dueDate: date.toISOString() } : task
      )
    );
  };

  // Save tasks
  const saveTasks = async () => {
    try {
      await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        tasks,
      });
      refetch();
    } catch (error) {
      console.error("Error saving tasks:", error);
      alert("Failed to save tasks.");
    }
    refetch();
  };
  function haveTasksChanged(eventTasks: Task[], updatedTasks: Task[]): boolean {
    if (eventTasks.length !== updatedTasks.length) {
      return true; // If the number of tasks is different, they have changed
    }

    // Compare each task's relevant properties
    for (let i = 0; i < eventTasks.length; i++) {
      const {
        title: eventTitle,
        isCompleted: eventCompleted,
        dueDate: eventDueDate,
      } = eventTasks[i];
      const {
        title: updatedTitle,
        isCompleted: updatedCompleted,
        dueDate: updatedDueDate,
      } = updatedTasks[i];

      // If any property is different, tasks have changed
      if (
        eventTitle !== updatedTitle ||
        eventCompleted !== updatedCompleted ||
        new Date(eventDueDate).toISOString() !==
          new Date(updatedDueDate).toISOString()
      ) {
        return true;
      }
    }

    return false; // No changes detected
  }

  return (
    <EventDetailsWrapper>
      {tasks.length ? (
        <TaskList>
          {tasks.map((task, index) => (
            <TaskItem key={index}>
              <CircleCheckbox
                isChecked={task.isCompleted}
                onClick={() => toggleTaskCompletion(index)}
              />
              <TaskTitle isCompleted={task.isCompleted}>{task.title}</TaskTitle>
              <TaskActions>
                <StyledDatePickerWrapper>
                  <DatePicker
                    selected={new Date(task.dueDate)}
                    onChange={(date) =>
                      updateTaskDueDate(index, date || new Date())
                    }
                  />
                </StyledDatePickerWrapper>
                <SecondaryButton onClick={() => deleteTask(index)}>
                  Delete
                </SecondaryButton>
              </TaskActions>
            </TaskItem>
          ))}
        </TaskList>
      ) : (
        <NoTasks>No tasks recorded. Try adding a new one below...</NoTasks>
      )}

      <AddTaskForm>
        <Input
          type="text"
          placeholder="New task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <SecondaryButton onClick={addTask}>Add Task</SecondaryButton>
      </AddTaskForm>

      <PrimaryButton
        onClick={saveTasks}
        disabled={!haveTasksChanged(event.tasks, tasks)}
      >
        Save
      </PrimaryButton>
    </EventDetailsWrapper>
  );
};

export default EventTasksEditor;

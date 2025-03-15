import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import {
  Event,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionType,
} from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";

// Define colors object to match the style in ScheduleEditor
const colors = {
  primary: "#6b3ddf",
  primaryLight: "#8f6df2",
  primaryDark: "#5a32c0",
  textPrimary: "#333333",
  textSecondary: "#666666",
  backgroundLight: "#ffffff",
  borderLight: "#e0e0e0",
  success: "#52c41a",
  warning: "#ff9800",
  error: "#ff4d4f",
};

const FormEditorWrapper = styled.div`
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: ${colors.textPrimary};
`;

const FormHeader = styled.div`
  margin-bottom: 20px;
`;

const FormHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FormTitle = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;
  margin-bottom: 10px;
  font-weight: bold;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const FormDescription = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const QuestionsContainer = styled.div`
  margin-top: 20px;
`;

const QuestionCard = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid ${colors.borderLight};
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const QuestionTitle = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;
  min-width: 200px;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const QuestionTypeSelect = styled.select`
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const RequiredCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: ${colors.textPrimary};

  input {
    margin-right: 8px;
    width: 18px;
    height: 18px;
    accent-color: ${colors.primary};
  }

  label {
    font-size: 15px;
  }
`;

const DeleteButton = styled.button`
  background-color: ${colors.error};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background-color: #ff7875;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const OptionsContainer = styled.div`
  margin-top: 16px;
  color: ${colors.textPrimary};
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;
  margin-right: 10px;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const RatingSettings = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  color: ${colors.textPrimary};
  flex-wrap: wrap;
  gap: 16px;

  label {
    margin-right: 10px;
    font-size: 15px;
  }

  input {
    width: 80px;
    padding: 14px 16px;
    border: 1px solid ${colors.borderLight};
    border-radius: 12px;
    font-size: 15px;
    color: ${colors.textPrimary};
    background-color: ${colors.backgroundLight};
    transition: all 0.2s;
    box-sizing: border-box;

    &:focus {
      border-color: ${colors.primary};
      outline: none;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  }
`;

const RatingLabelInput = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  font-size: 15px;
  color: ${colors.textPrimary};
  background-color: ${colors.backgroundLight};
  transition: all 0.2s;
  box-sizing: border-box;
  min-width: 150px;
  max-width: 250px;

  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const RatingLabelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 16px;
  gap: 12px;
`;

const RatingLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    min-width: 120px;
    font-size: 15px;
  }
`;

const AddOptionButton = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background-color: #40a9ff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const AddQuestionButton = styled.button`
  background-color: ${colors.success};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  margin-top: 24px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;

  &:hover {
    background-color: #73d13d;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SaveButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  cursor: pointer;
  margin-top: 24px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background-color: ${colors.primaryLight};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: ${colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EnabledToggle = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.textPrimary};
  margin-bottom: 20px;
`;

interface ToggleProps {
  checked: boolean;
}

const ToggleSwitch = styled.div<ToggleProps>`
  position: relative;
  width: 50px;
  height: 26px;
  background-color: ${(props) => (props.checked ? colors.primary : "#ccc")};
  border-radius: 13px;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
  }
`;

const ToggleButton = styled.div<ToggleProps>`
  position: absolute;
  top: 3px;
  left: ${(props) => (props.checked ? "27px" : "3px")};
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${(props) => (props.checked ? "8px" : "0px")};
    height: ${(props) => (props.checked ? "8px" : "0px")};
    background-color: ${colors.primary};
    border-radius: 50%;
    opacity: 0.5;
    transition: all 0.3s ease;
  }
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
`;

const ToggleLabel = styled.label`
  font-weight: 600;
  font-size: 15px;
  margin-left: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
`;

const FormDisabledMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(107, 61, 223, 0.05);
  border-radius: 12px;
  margin: 30px 0;
  color: ${colors.textPrimary};
  border: 1px dashed rgba(107, 61, 223, 0.2);
`;

const FormDisabledIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.primary};
  opacity: 0.6;
`;

const LoadingOverlay = styled.div`
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
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${colors.primary};
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface Props {
  event: Event;
  refetch: () => void;
}

const FeedbackFormEditor: React.FC<Props> = ({ event, refetch }) => {
  const [form, setForm] = useState<FeedbackForm>({
    title: "Event Feedback",
    description: "Please share your thoughts about the event",
    questions: [],
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState(event._id);

  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();

  // Only fetch when the component mounts or when the event ID changes
  useEffect(() => {
    // Update the stored event ID
    setEventId(event._id);

    // Fetch the form data
    setLoading(true);

    axiosInstance
      .get(`/events/${event._id}/feedback-form`)
      .then((response) => {
        if (response.data.success && response.data.data) {
          setForm(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching feedback form:", error);
        addToast("Failed to load feedback form", ToastType.ERROR);
        setLoading(false);
      });
  }, [event._id]); // Only depend on event._id

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, title: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setForm({ ...form, description: e.target.value });
  };

  const handleEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    // If it's a checkbox change event, use e.target.checked
    // If it's a click event on the toggle, just toggle the current value
    if ("checked" in e.target) {
      setForm({ ...form, isEnabled: e.target.checked });
    } else {
      setForm({ ...form, isEnabled: !form.isEnabled });
    }
  };

  const addQuestion = () => {
    setForm((prevForm) => ({
      ...prevForm,
      questions: [
        ...prevForm.questions,
        {
          id: uuidv4(),
          title: "New Question",
          type: "text" as FeedbackQuestionType,
          required: false,
        },
      ],
    }));
  };

  const updateQuestion = (
    index: number,
    updates: Partial<FeedbackQuestion>
  ) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };

    setForm({
      ...form,
      questions: updatedQuestions,
    });
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions.splice(index, 1);

    setForm({
      ...form,
      questions: updatedQuestions,
    });
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...form.questions];
    const question = updatedQuestions[questionIndex];

    if (!question.options) {
      question.options = [];
    }

    question.options.push({
      id: uuidv4(),
      text: `Option ${question.options.length + 1}`,
    });

    setForm({
      ...form,
      questions: updatedQuestions,
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => {
    const updatedQuestions = [...form.questions];
    const question = updatedQuestions[questionIndex];

    if (question.options && question.options[optionIndex]) {
      question.options[optionIndex].text = text;

      setForm({
        ...form,
        questions: updatedQuestions,
      });
    }
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...form.questions];
    const question = updatedQuestions[questionIndex];

    if (question.options) {
      question.options.splice(optionIndex, 1);

      setForm({
        ...form,
        questions: updatedQuestions,
      });
    }
  };

  const saveForm = () => {
    // Validate form
    if (!form.title.trim()) {
      addToast("Form title is required", ToastType.ERROR);
      return;
    }

    // Validate questions
    for (const question of form.questions) {
      if (!question.title.trim()) {
        addToast("All questions must have a title", ToastType.ERROR);
        return;
      }

      if (
        ["single_choice", "multiple_choice", "ranking"].includes(
          question.type
        ) &&
        (!question.options || question.options.length < 2)
      ) {
        addToast(
          `Question "${question.title}" needs at least 2 options`,
          ToastType.ERROR
        );
        return;
      }
    }

    setSaving(true);

    const updatedForm = {
      ...form,
      updatedAt: new Date().toISOString(),
    };

    axiosInstance
      .put(`/events/${eventId}/feedback-form`, updatedForm)
      .then(() => {
        addToast("Feedback form saved successfully", ToastType.SUCCESS);
        refetch();
        setSaving(false);
      })
      .catch((error) => {
        console.error("Error saving feedback form:", error);
        addToast("Failed to save feedback form", ToastType.ERROR);
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <FormEditorWrapper>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <LoadingSpinner />
          <p>Loading feedback form...</p>
        </div>
      </FormEditorWrapper>
    );
  }

  return (
    <FormEditorWrapper>
      {saving && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      <FormHeader>
        <FormHeaderTop>
          <h2>Feedback Form Editor</h2>
          <EnabledToggle>
            <ToggleInput
              type="checkbox"
              checked={form.isEnabled}
              onChange={handleEnabledChange}
              id="form-enabled"
            />
            <ToggleSwitch checked={form.isEnabled}>
              <ToggleButton checked={form.isEnabled} />
            </ToggleSwitch>
            <ToggleLabel
              htmlFor="form-enabled"
              style={{
                color: form.isEnabled ? colors.primary : colors.textPrimary,
              }}
            >
              {form.isEnabled
                ? "Feedback Form Enabled"
                : "Feedback Form Disabled"}
            </ToggleLabel>
          </EnabledToggle>
        </FormHeaderTop>

        {form.isEnabled ? (
          <>
            <FormTitle
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Form Title"
            />
            <FormDescription
              value={form.description || ""}
              onChange={handleDescriptionChange}
              placeholder="Form Description"
            />
          </>
        ) : null}
      </FormHeader>

      {form.isEnabled ? (
        <>
          <QuestionsContainer>
            <h3>Questions</h3>
            {form.questions.map((question, index) => (
              <QuestionCard key={question.id}>
                <QuestionHeader>
                  <QuestionTitle
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(index, { title: e.target.value })
                    }
                    placeholder="Question Title"
                  />
                  <QuestionTypeSelect
                    value={question.type}
                    onChange={(e) => {
                      const newType = e.target.value as FeedbackQuestionType;
                      const needsOptions = [
                        "single_choice",
                        "multiple_choice",
                        "ranking",
                      ].includes(newType);

                      updateQuestion(index, {
                        type: newType,
                        options: needsOptions
                          ? question.options && question.options.length >= 2
                            ? question.options
                            : [
                                { id: uuidv4(), text: "Option 1" },
                                { id: uuidv4(), text: "Option 2" },
                              ]
                          : undefined,
                      });
                    }}
                  >
                    <option value="text">Text Answer</option>
                    <option value="rating">Rating (0-10)</option>
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="ranking">Ranking</option>
                  </QuestionTypeSelect>
                  <RequiredCheckbox>
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        updateQuestion(index, { required: e.target.checked })
                      }
                    />
                    <label>Required</label>
                  </RequiredCheckbox>
                  <DeleteButton onClick={() => deleteQuestion(index)}>
                    Delete
                  </DeleteButton>
                </QuestionHeader>

                {question.type === "rating" && (
                  <>
                    <RatingSettings>
                      <label>Min:</label>
                      <input
                        type="number"
                        value={
                          question.minRating !== undefined
                            ? question.minRating
                            : 0
                        }
                        onChange={(e) =>
                          updateQuestion(index, {
                            minRating: parseInt(e.target.value),
                          })
                        }
                        min="0"
                        max="9"
                      />
                      <label>Max:</label>
                      <input
                        type="number"
                        value={
                          question.maxRating !== undefined
                            ? question.maxRating
                            : 10
                        }
                        onChange={(e) =>
                          updateQuestion(index, {
                            maxRating: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        max="10"
                      />
                    </RatingSettings>
                    <RatingLabelsContainer>
                      <RatingLabelRow>
                        <label>Lowest label:</label>
                        <RatingLabelInput
                          value={question.minLabel || ""}
                          onChange={(e) =>
                            updateQuestion(index, { minLabel: e.target.value })
                          }
                          placeholder="E.g., 'Wouldn't recommend'"
                        />
                      </RatingLabelRow>
                      <RatingLabelRow>
                        <label>Highest label:</label>
                        <RatingLabelInput
                          value={question.maxLabel || ""}
                          onChange={(e) =>
                            updateQuestion(index, { maxLabel: e.target.value })
                          }
                          placeholder="E.g., 'Would strongly recommend'"
                        />
                      </RatingLabelRow>
                    </RatingLabelsContainer>
                  </>
                )}

                {["single_choice", "multiple_choice", "ranking"].includes(
                  question.type
                ) && (
                  <OptionsContainer>
                    <h4>Options</h4>
                    {question.options &&
                      question.options.map((option, optionIndex) => (
                        <OptionItem key={option.id}>
                          <OptionInput
                            value={option.text}
                            onChange={(e) =>
                              updateOption(index, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <DeleteButton
                            onClick={() => deleteOption(index, optionIndex)}
                          >
                            ✕
                          </DeleteButton>
                        </OptionItem>
                      ))}
                    <AddOptionButton onClick={() => addOption(index)}>
                      Add Option
                    </AddOptionButton>
                  </OptionsContainer>
                )}
              </QuestionCard>
            ))}
            <AddQuestionButton onClick={addQuestion}>
              Add Question
            </AddQuestionButton>
          </QuestionsContainer>

          <SaveButton onClick={saveForm} disabled={saving}>
            {saving ? "Saving..." : "Save Form"}
          </SaveButton>
        </>
      ) : (
        <FormDisabledMessage>
          <FormDisabledIcon>🔒</FormDisabledIcon>
          <h3>Feedback Form is Disabled</h3>
          <p>Enable the toggle above to create and edit your feedback form.</p>
          <p>
            When enabled, guests will be able to provide feedback for your
            event.
          </p>
        </FormDisabledMessage>
      )}
      <Toasts />
    </FormEditorWrapper>
  );
};

export default FeedbackFormEditor;

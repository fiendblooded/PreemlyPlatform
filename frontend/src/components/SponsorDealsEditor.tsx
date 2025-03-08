import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Event, SponsorDeal } from "../types";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";

// Modern color palette with gradients
const colors = {
  primary: "#6366F1", // Modern indigo
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#06B6D4", // Cyan for accents
  accentLight: "#CFFAFE",
  textPrimary: "#1E293B", // Slate 800
  textSecondary: "#64748B", // Slate 500
  borderLight: "#E2E8F0", // Slate 200
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC", // Slate 50
  shadow: "rgba(0, 0, 0, 0.08)",
  success: "#10B981", // Emerald 500
  error: "#EF4444", // Red 500
  danger: "#EF4444", // Same as error
  warning: "#F59E0B", // Amber 500
  info: "#3B82F6", // Blue 500
  gray: "#94A3B8", // Slate 400
  grayLight: "#F1F5F9", // Slate 100
  blue: "#3B82F6", // Blue 500
  gradientStart: "#4F46E5",
  gradientEnd: "#7C3AED",
};

// Enhanced typography
const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Main container with consistent styling
const SponsorDealsWrapper = styled.div`
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid ${colors.borderLight};
  background-color: ${colors.backgroundLight};

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: ${fontWeights.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 16px 0;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;

  @media (max-width: 768px) {
    padding: 24px;
    gap: 24px;
  }
`;

const SponsorDealsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const SponsorDealCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid ${colors.borderLight};
  background-color: white;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const SponsorDealImage = styled.div<{ backgroundImage: string }>`
  height: 180px;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid ${colors.borderLight};
`;

const SponsorDealContent = styled.div`
  padding: 16px;
`;

const SponsorDealTitle = styled.h3`
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 8px 0;
`;

const SponsorDealDescription = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const SponsorDealLink = styled.div`
  font-size: 14px;
  color: ${colors.primary};
  word-break: break-all;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  color: ${colors.primary};
  font-weight: bold;
  font-size: 14px;
  position: relative;

  &:hover {
    background-color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    color: ${colors.primaryDark};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
    color: inherit;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.8;
  }
`;

const FormSection = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.borderLight};
`;

const FormTitle = styled.h3`
  font-size: 20px;
  font-weight: ${fontWeights.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.borderLight};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: ${fontWeights.medium};
  color: ${colors.textPrimary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
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

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
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

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: ${fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
`;

const PrimaryButton = styled(Button)`
  background-color: ${colors.primary};
  color: white;
  border: none;

  &:hover {
    background-color: ${colors.primaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${colors.gray};
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  border: 1px solid ${colors.borderLight};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.primary};
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  max-width: 400px;
  margin: 0;
  line-height: 1.6;
`;

const ImageUploadContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  background-color: ${colors.backgroundLight};

  &:hover {
    border-color: ${colors.primary};
  }

  &:focus,
  &:active {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadIcon = styled.div`
  font-size: 32px;
  color: ${colors.primary};
  margin-bottom: 12px;
`;

const UploadText = styled.p`
  font-size: 15px;
  color: ${colors.textSecondary};
  margin: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

// Add a new styled component for the add button
const AddButton = styled(PrimaryButton)`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Add a styled component for the form container with animation
const FormContainer = styled.div<{ isVisible: boolean }>`
  max-height: ${(props) => (props.isVisible ? "1000px" : "0")};
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin-bottom: ${(props) => (props.isVisible ? "32px" : "0")};
`;

// Add these components after the styled components and before the SponsorDealsEditor component
const EditButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} title="Edit">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
    <span>✏️</span>
  </IconButton>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton onClick={onClick} title="Delete">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    <span>🗑️</span>
  </IconButton>
);

type Props = {
  event: Event;
  refetch: () => void;
};

const SponsorDealsEditor: React.FC<Props> = ({ event, refetch }) => {
  const axiosInstance = useAxiosWithAuth();
  const { addToast, Toasts } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sponsor deals from event data or use default empty array
  const [sponsorDeals, setSponsorDeals] = useState<SponsorDeal[]>(
    event.emailParams.sponsorDeals?.items || []
  );

  const [newSponsorDeal, setNewSponsorDeal] = useState<Partial<SponsorDeal>>({
    title: "",
    description: "",
    imageSrc: "",
    linkUrl: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSponsorDeal((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Use our backend endpoint to upload to Cloudinary
      const response = await axiosInstance.post("/events/sponsor-deal-image", {
        image: base64Image,
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw new Error("Failed to upload image");
    }
  };

  const saveSponsorDealsToBackend = async (
    updatedSponsorDeals: SponsorDeal[]
  ) => {
    try {
      const updatedEvent = {
        ...event,
        emailParams: {
          ...event.emailParams,
          sponsorDeals: {
            enabled: true,
            content: "",
            items: updatedSponsorDeals,
          },
        },
      };

      await axiosInstance.put(`/events/${event._id}`, updatedEvent);
      refetch();
    } catch (error) {
      console.error("Error saving sponsor deals:", error);
      addToast("Failed to save sponsor deals", ToastType.ERROR);
    }
  };

  const handleAddOrUpdateSponsorDeal = async () => {
    if (
      !newSponsorDeal.title ||
      !newSponsorDeal.linkUrl ||
      (!imageFile && !newSponsorDeal.imageSrc)
    ) {
      addToast("Please fill in all required fields", ToastType.ERROR);
      return;
    }

    setIsProcessing(true);

    try {
      let imageSrc = newSponsorDeal.imageSrc || "";

      if (imageFile) {
        imageSrc = await uploadImageToCloudinary(imageFile);
      }

      let updatedSponsorDeals: SponsorDeal[];

      if (isEditing && editingItemId !== null) {
        // Update existing sponsor deal
        updatedSponsorDeals = sponsorDeals.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                title: newSponsorDeal.title || item.title,
                description: newSponsorDeal.description || item.description,
                imageSrc: imageSrc || item.imageSrc,
                linkUrl: newSponsorDeal.linkUrl || item.linkUrl,
              }
            : item
        );
      } else {
        // Add new sponsor deal
        const newId =
          sponsorDeals.length > 0
            ? Math.max(...sponsorDeals.map((item) => item.id)) + 1
            : 1;

        updatedSponsorDeals = [
          ...sponsorDeals,
          {
            id: newId,
            title: newSponsorDeal.title || "",
            description: newSponsorDeal.description || "",
            imageSrc,
            linkUrl: newSponsorDeal.linkUrl || "",
          },
        ];
      }

      await saveSponsorDealsToBackend(updatedSponsorDeals);
      setSponsorDeals(updatedSponsorDeals);

      // Reset form
      setNewSponsorDeal({
        title: "",
        description: "",
        imageSrc: "",
        linkUrl: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setEditingItemId(null);
      setIsEditing(false);
      setIsFormVisible(false);

      addToast(
        isEditing
          ? "Sponsor deal updated successfully"
          : "Sponsor deal added successfully",
        ToastType.SUCCESS
      );
    } catch (error) {
      console.error("Error adding/updating sponsor deal:", error);
      addToast("Failed to save sponsor deal", ToastType.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditItem = (item: SponsorDeal) => {
    setNewSponsorDeal({
      title: item.title,
      description: item.description,
      imageSrc: item.imageSrc,
      linkUrl: item.linkUrl,
    });
    setImagePreview(item.imageSrc);
    setEditingItemId(item.id);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setNewSponsorDeal({
      title: "",
      description: "",
      imageSrc: "",
      linkUrl: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItemId(null);
    setIsEditing(false);
    setIsFormVisible(false);
  };

  const handleDeleteSponsorDeal = async (id: number) => {
    setIsProcessing(true);

    try {
      const updatedSponsorDeals = sponsorDeals.filter((item) => item.id !== id);
      await saveSponsorDealsToBackend(updatedSponsorDeals);
      setSponsorDeals(updatedSponsorDeals);

      addToast("Sponsor deal removed", ToastType.INFO);

      // If we were editing this item, reset the form
      if (editingItemId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Error deleting sponsor deal:", error);
      addToast("Failed to delete sponsor deal", ToastType.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFormVisibility = () => {
    if (isFormVisible && isEditing) {
      handleCancelEdit();
    } else {
      setIsFormVisible(!isFormVisible);

      if (!isFormVisible && !isEditing) {
        setNewSponsorDeal({
          title: "",
          description: "",
          imageSrc: "",
          linkUrl: "",
        });
        setImageFile(null);
        setImagePreview(null);
      }
    }
  };

  return (
    <SponsorDealsWrapper>
      <SectionHeader>
        <SectionTitle>Sponsor Deals</SectionTitle>
      </SectionHeader>

      <ContentContainer>
        {/* Add button to show/hide the form */}
        <AddButton onClick={toggleFormVisibility}>
          {isFormVisible ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isEditing ? "Cancel Editing" : "Cancel Adding"}
            </>
          ) : (
            <>
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
              Add New Sponsor Deal
            </>
          )}
        </AddButton>

        {/* Form container with animation */}
        <FormContainer isVisible={isFormVisible}>
          <FormSection>
            <FormTitle>
              {isEditing ? "Edit Sponsor Deal" : "Add New Sponsor Deal"}
            </FormTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={newSponsorDeal.title}
                  onChange={handleInputChange}
                  placeholder="Enter sponsor title"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="linkUrl">Link URL*</Label>
                <Input
                  id="linkUrl"
                  name="linkUrl"
                  value={newSponsorDeal.linkUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={newSponsorDeal.description}
                onChange={handleInputChange}
                placeholder="Enter sponsor description"
              />
            </FormGroup>

            <FormGroup>
              <Label>Banner Image*</Label>
              <ImageUploadContainer onClick={handleImageClick}>
                {imagePreview ? (
                  <ImagePreview src={imagePreview} alt="Preview" />
                ) : (
                  <>
                    <UploadIcon>📷</UploadIcon>
                    <UploadText>Click to upload an image</UploadText>
                  </>
                )}
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </ImageUploadContainer>
            </FormGroup>

            <ButtonGroup>
              <PrimaryButton
                onClick={handleAddOrUpdateSponsorDeal}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : isEditing
                  ? "Update Sponsor Deal"
                  : "Add Sponsor Deal"}
              </PrimaryButton>
            </ButtonGroup>
          </FormSection>
        </FormContainer>

        {/* Sponsor deals list with improved styling */}
        <SectionTitle>Sponsor Deals List</SectionTitle>

        {sponsorDeals.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>🤝</EmptyStateIcon>
            <EmptyStateText>
              No sponsor deals yet. Click the "Add New Sponsor Deal" button
              above to showcase your sponsors in the event space.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <SponsorDealsList>
            {sponsorDeals.map((deal) => (
              <SponsorDealCard key={deal.id}>
                <SponsorDealImage backgroundImage={deal.imageSrc} />
                <ActionButtons>
                  <EditButton onClick={() => handleEditItem(deal)} />
                  <DeleteButton
                    onClick={() => handleDeleteSponsorDeal(deal.id)}
                  />
                </ActionButtons>
                <SponsorDealContent>
                  <SponsorDealTitle>{deal.title}</SponsorDealTitle>
                  {deal.description && (
                    <SponsorDealDescription>
                      {deal.description}
                    </SponsorDealDescription>
                  )}
                  <SponsorDealLink>{deal.linkUrl}</SponsorDealLink>
                </SponsorDealContent>
              </SponsorDealCard>
            ))}
          </SponsorDealsList>
        )}
      </ContentContainer>

      <Toasts />
    </SponsorDealsWrapper>
  );
};

export default SponsorDealsEditor;

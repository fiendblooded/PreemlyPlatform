import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import { ToastType, useToast } from "../Toasts";

interface ServiceProvider {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
}

interface Organization {
  _id: string;
  name: string;
  serviceProviders: ServiceProvider[];
}

const Container = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  max-width: 1400px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  background-color: rgb(107, 61, 223);
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(107, 61, 223, 0.2);

  &:hover {
    background-color: rgb(126, 87, 231);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(107, 61, 223, 0.3);
  }
`;

const ProviderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ProviderImage = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 200px;
  background-color: ${(props) => (props.hasImage ? "transparent" : "#f1f1f1")};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProviderInfo = styled.div`
  padding: 16px;
`;

const ProviderName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
`;

const ProviderDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  min-height: 60px;
`;

const ProviderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;

  &.edit:hover {
    color: #0066cc;
    background-color: rgba(0, 102, 204, 0.1);
  }

  &.delete:hover {
    color: #cc0000;
    background-color: rgba(204, 0, 0, 0.1);
  }
`;

const NewProviderCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #ddd;
  height: 100%;
  min-height: 328px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgb(107, 61, 223);
    background-color: rgba(107, 61, 223, 0.05);
  }
`;

const NewProviderText = styled.div`
  color: #666;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Drawer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  transform: translateX(${(props) => (props.isOpen ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  z-index: 999;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const DrawerTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const DrawerContent = styled.div`
  padding: 24px;
`;

const DrawerActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: white;
  position: sticky;
  bottom: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
  color: #000;
  box-sizing: border-box;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
  min-height: 120px;
  resize: vertical;
  color: #000;
  box-sizing: border-box;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const ImageUpload = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

const ImagePreview = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background-color: ${(props) => (props.hasImage ? "transparent" : "#f1f1f1")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
  border: 2px dashed ${(props) => (props.hasImage ? "transparent" : "#ddd")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageUploadButton = styled.button`
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ddd;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e9ecef;
  }
`;

const CancelButton = styled.button`
  background-color: #f1f1f1;
  color: #333;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #e1e1e1;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

const OrganizationProviders: React.FC = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxiosWithAuth();
  const { addToast } = useToast();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProviderDrawer, setShowProviderDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProvider, setCurrentProvider] =
    useState<ServiceProvider | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchMyOrganizations();
  }, []);

  const fetchMyOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/organizations/user/mine");
      if (response.data.success && response.data.data.length > 0) {
        setSelectedOrg(response.data.data[0]);
        setProviders(response.data.data[0].serviceProviders);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      addToast("Failed to load organizations", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setEditMode(false);
    setCurrentProvider(null);
    setFormData({
      name: "",
      description: "",
      image: "",
    });
    setImagePreview(null);
    setShowProviderDrawer(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setEditMode(true);
    setCurrentProvider(provider);
    setFormData({
      name: provider.name,
      description: provider.description || "",
      image: provider.image || "",
    });
    setImagePreview(provider.image || null);
    setShowProviderDrawer(true);
  };

  const handleDeleteProvider = async (provider: ServiceProvider) => {
    if (
      !window.confirm(`Are you sure you want to delete "${provider.name}"?`)
    ) {
      return;
    }

    try {
      if (selectedOrg && provider._id) {
        // Since there's no direct endpoint for deleting a provider,
        // we can filter out the provider and update the entire list
        const updatedProviders = providers.filter(
          (p) => p._id !== provider._id
        );

        const response = await axiosInstance.put(
          `/organizations/${selectedOrg._id}`,
          {
            serviceProviders: updatedProviders,
          }
        );

        if (response.data.success) {
          addToast("Service provider deleted successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      }
    } catch (error) {
      console.error("Error deleting service provider:", error);
      addToast("Failed to delete service provider", ToastType.ERROR);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProvider = async () => {
    if (!formData.name.trim()) {
      addToast("Provider name is required", ToastType.ERROR);
      return;
    }

    try {
      if (selectedOrg) {
        if (editMode && currentProvider?._id) {
          // Update existing provider using the dedicated API endpoint
          const response = await axiosInstance.put(
            `/organizations/${selectedOrg._id}/providers/${currentProvider._id}`,
            {
              name: formData.name,
              description: formData.description,
              image: formData.image,
            }
          );

          if (response.data.success) {
            addToast(
              "Service provider updated successfully",
              ToastType.SUCCESS
            );
            fetchMyOrganizations();
            setShowProviderDrawer(false);
          }
        } else {
          // Add new provider
          const response = await axiosInstance.post(
            `/organizations/${selectedOrg._id}/providers`,
            {
              name: formData.name,
              description: formData.description,
              image: formData.image,
            }
          );

          if (response.data.success) {
            addToast("Service provider added successfully", ToastType.SUCCESS);
            fetchMyOrganizations();
            setShowProviderDrawer(false);
          }
        }
      }
    } catch (error) {
      console.error("Error saving service provider:", error);
      addToast("Failed to save service provider", ToastType.ERROR);
    }
  };

  if (loading) {
    return (
      <Container>
        <p>Loading service providers...</p>
      </Container>
    );
  }

  if (!selectedOrg) {
    return (
      <Container>
        <EmptyState>
          <h2>No organization found</h2>
          <p>Please create an organization first.</p>
          <Button onClick={() => navigate("/organization")}>
            Go to Organization
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <PageHeader>
          <Title>Service Providers</Title>
          <Button onClick={() => navigate("/organization")}>
            Back to Organization
          </Button>
        </PageHeader>

        <ProviderGrid>
          {providers.map((provider) => (
            <Card key={provider._id}>
              <ProviderImage hasImage={!!provider.image}>
                {provider.image ? (
                  <img src={provider.image} alt={provider.name} />
                ) : (
                  "No Image Available"
                )}
              </ProviderImage>
              <ProviderInfo>
                <ProviderName>{provider.name}</ProviderName>
                <ProviderDescription>
                  {provider.description || "No description available"}
                </ProviderDescription>
                <ProviderActions>
                  <ActionButton
                    className="edit"
                    onClick={() => handleEditProvider(provider)}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleDeleteProvider(provider)}
                  >
                    Delete
                  </ActionButton>
                </ProviderActions>
              </ProviderInfo>
            </Card>
          ))}

          <NewProviderCard onClick={handleAddProvider}>
            <NewProviderText>
              <span>+</span>
              <span>Add New Service Provider</span>
            </NewProviderText>
          </NewProviderCard>
        </ProviderGrid>
      </Container>

      {/* Provider Drawer */}
      <Overlay
        isOpen={showProviderDrawer}
        onClick={() => setShowProviderDrawer(false)}
      />
      <Drawer isOpen={showProviderDrawer}>
        <DrawerHeader>
          <DrawerTitle>
            {editMode ? "Edit Service Provider" : "New Service Provider"}
          </DrawerTitle>
          <CloseButton onClick={() => setShowProviderDrawer(false)}>
            ×
          </CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <ImageUpload>
            <ImagePreview hasImage={!!imagePreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Provider" />
              ) : (
                "Upload Provider Image"
              )}
            </ImagePreview>
            <input
              type="file"
              accept="image/*"
              id="provider-image-upload"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <ImageUploadButton
              onClick={() =>
                document.getElementById("provider-image-upload")?.click()
              }
            >
              {imagePreview ? "Change Image" : "Upload Image"}
            </ImageUploadButton>
          </ImageUpload>

          <FormGroup>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter provider name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter provider description"
            />
          </FormGroup>
        </DrawerContent>

        <DrawerActions>
          <CancelButton onClick={() => setShowProviderDrawer(false)}>
            Cancel
          </CancelButton>
          <Button onClick={handleSaveProvider}>
            {editMode ? "Update Provider" : "Add Provider"}
          </Button>
        </DrawerActions>
      </Drawer>
    </>
  );
};

export default OrganizationProviders;

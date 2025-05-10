import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import { ToastType, useToast } from "../Toasts";

interface Organization {
  _id: string;
  name: string;
  image?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
  description?: string;
  productCategories: {
    _id: string;
    name: string;
    products: {
      _id: string;
      name: string;
      description: string;
      price: number;
    }[];
  }[];
  serviceProviders: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Styled components with improved design
const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
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

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(107, 61, 223, 0.2);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
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

  &:hover {
    background-color: #e0e0e0;
  }

  &:active {
    background-color: #d8d8d8;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px;
  width: 100%;

  transition: box-shadow 0.3s ease;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: #f9f9f9;
  color: #000;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }

  &:hover:not(:focus) {
    border-color: #bbb;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: #f9f9f9;
  min-height: 120px;
  resize: vertical;
  color: #000;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }

  &:hover:not(:focus) {
    border-color: #bbb;
  }
`;

const ImageUploadWrapper = styled.div`
  margin-bottom: 32px;
`;

const ImageUploadCard = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background-color: ${(props) => (props.hasImage ? "#f0f0f0" : "#f9f9f9")};
  border: 2px dashed ${(props) => (props.hasImage ? "transparent" : "#ddd")};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: #666;

  &:hover {
    background-color: ${(props) => (props.hasImage ? "#f0f0f0" : "#f0f0f0")};
    border-color: ${(props) => (props.hasImage ? "transparent" : "#ccc")};
    transform: ${(props) => (props.hasImage ? "scale(1.01)" : "none")};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
`;

const UploadIcon = styled.div`
  font-size: 32px;
  color: #999;
`;

const UploadText = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #666;
`;

const ImageActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? "rgb(107, 61, 223)" : "transparent")};
  color: ${(props) => (props.active ? "rgb(107, 61, 223)" : "#666")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => (props.active ? "rgb(107, 61, 223)" : "#333")};
    border-bottom-color: ${(props) =>
      props.active ? "rgb(107, 61, 223)" : "#ddd"};
  }
`;

const StatsSection = styled.div`
  margin-bottom: 32px;
  border-radius: 16px;
  padding: 0;
  box-sizing: border-box;
`;

const StatsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 0;
  box-sizing: border-box;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 28px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  box-sizing: border-box;
  border-bottom: 4px solid rgb(107, 61, 223);
  overflow: hidden;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, rgb(107, 61, 223), rgb(133, 89, 255));
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(107, 61, 223, 0.1);
  }
`;

const StatIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(107, 61, 223, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgb(107, 61, 223);
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 1px dashed #ddd;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  max-width: 400px;
`;

const RequiredField = styled.span`
  color: #e53935;
  margin-left: 4px;
`;

const ItemList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const ItemCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    border-color: rgba(107, 61, 223, 0.2);
  }
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ItemDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ItemCount = styled.span`
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
`;

const ItemAction = styled.span`
  color: rgb(107, 61, 223);
  font-size: 14px;
  font-weight: 500;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 16px;
  color: #666;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const OrganizationGeneral: React.FC = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxiosWithAuth();
  const { addToast } = useToast();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    address: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    fetchMyOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      setFormData({
        name: selectedOrg.name,
        description: selectedOrg.description || "",
        image: selectedOrg.image || "",
        address: selectedOrg.location?.address || "",
      });
      setImagePreview(selectedOrg.image || null);
    }
  }, [selectedOrg]);

  const fetchMyOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/organizations/user/mine");
      if (response.data.success) {
        if (response.data.data.length > 0) {
          setSelectedOrg(response.data.data[0]);
        } else {
          setSelectedOrg(null);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      addToast("Failed to load organizations", ToastType.ERROR);
    } finally {
      setLoading(false);
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

  const handleSaveOrg = async () => {
    try {
      if (!formData.name) {
        addToast("Organization name is required", ToastType.ERROR);
        return;
      }

      // Prepare the organization data
      interface OrgDataPayload {
        name: string;
        description?: string;
        image?: string;
        location?: {
          address: string;
          latitude: number;
          longitude: number;
          placeId: string;
        };
      }

      const orgData: OrgDataPayload = {
        name: formData.name,
      };

      // Only include these fields if they have values
      if (formData.description) {
        orgData.description = formData.description;
      }

      if (formData.image) {
        orgData.image = formData.image;
      }

      if (selectedOrg?.location) {
        orgData.location = selectedOrg.location;
      } else if (formData.address) {
        orgData.location = {
          address: formData.address,
          latitude: 0,
          longitude: 0,
          placeId: "",
        };
      }

      if (selectedOrg) {
        // Update existing
        const response = await axiosInstance.put(
          `/organizations/${selectedOrg._id}`,
          orgData
        );
        if (response.data.success) {
          addToast("Organization updated successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      } else {
        // Create new
        const response = await axiosInstance.post("/organizations", orgData);
        if (response.data.success) {
          addToast("Organization created successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      addToast("Failed to save organization", ToastType.ERROR);
    }
  };

  const navigateToProducts = () => {
    navigate("/organization/products");
  };

  const navigateToProviders = () => {
    navigate("/organization/providers");
  };

  const renderStats = () => {
    if (!selectedOrg) return null;

    const totalProducts = selectedOrg.productCategories.reduce(
      (sum, category) => sum + category.products.length,
      0
    );

    return (
      <StatsSection>
        <StatsWrapper>
          <StatCard>
            <StatIconWrapper>📊</StatIconWrapper>
            <StatContent>
              <StatValue>{selectedOrg.productCategories.length}</StatValue>
              <StatLabel>Product Categories</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIconWrapper>🛍️</StatIconWrapper>
            <StatContent>
              <StatValue>{totalProducts}</StatValue>
              <StatLabel>Total Products</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIconWrapper>👥</StatIconWrapper>
            <StatContent>
              <StatValue>{selectedOrg.serviceProviders.length}</StatValue>
              <StatLabel>Service Providers</StatLabel>
            </StatContent>
          </StatCard>
        </StatsWrapper>
      </StatsSection>
    );
  };

  const renderOrganizationForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedOrg ? "Organization Details" : "Create New Organization"}
        </CardTitle>
      </CardHeader>

      <ImageUploadWrapper>
        <Label>Organization Image</Label>
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <ImageUploadCard
          hasImage={!!imagePreview}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Organization" />
          ) : (
            <>
              <UploadIcon>📷</UploadIcon>
              <UploadText>Click to upload an image</UploadText>
            </>
          )}
        </ImageUploadCard>
        <ImageActions>
          {imagePreview && (
            <SecondaryButton
              onClick={() => {
                setImagePreview(null);
                setFormData((prev) => ({ ...prev, image: "" }));
              }}
            >
              Remove Image
            </SecondaryButton>
          )}
        </ImageActions>
      </ImageUploadWrapper>

      <FormGroup>
        <Label htmlFor="name">
          Organization Name<RequiredField>*</RequiredField>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your organization name"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter your organization address"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <TextArea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter a description of your organization"
        />
      </FormGroup>

      <ButtonsGroup>
        <Button onClick={handleSaveOrg}>
          {selectedOrg ? "Save Changes" : "Create Organization"}
        </Button>
      </ButtonsGroup>
    </Card>
  );

  const renderProductsSection = () => {
    if (!selectedOrg) return null;

    const hasProducts = selectedOrg.productCategories.length > 0;

    return (
      <div>
        <SectionHeader>
          <CardTitle>Products & Categories</CardTitle>
          <Button onClick={navigateToProducts}>Manage Products</Button>
        </SectionHeader>

        {hasProducts ? (
          <ItemList>
            {selectedOrg.productCategories.map((category) => (
              <ItemCard key={category._id} onClick={navigateToProducts}>
                <ItemName>{category.name}</ItemName>
                <ItemDescription>
                  {category.products.length > 0
                    ? `Contains ${category.products.length} products`
                    : "No products in this category"}
                </ItemDescription>
                <ItemFooter>
                  <ItemCount>{category.products.length} products</ItemCount>
                  <ItemAction>View →</ItemAction>
                </ItemFooter>
              </ItemCard>
            ))}
          </ItemList>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No products yet</EmptyStateTitle>
            <EmptyStateDescription>
              Add your product categories and products to manage your inventory
            </EmptyStateDescription>
            <Button onClick={navigateToProducts}>Add Products</Button>
          </EmptyState>
        )}
      </div>
    );
  };

  const renderProvidersSection = () => {
    if (!selectedOrg) return null;

    const hasProviders = selectedOrg.serviceProviders.length > 0;

    return (
      <div>
        <SectionHeader>
          <CardTitle>Service Providers</CardTitle>
          <Button onClick={navigateToProviders}>Manage Providers</Button>
        </SectionHeader>

        {hasProviders ? (
          <ItemList>
            {selectedOrg.serviceProviders.map((provider) => (
              <ItemCard key={provider._id} onClick={navigateToProviders}>
                <ItemName>{provider.name}</ItemName>
                <ItemDescription>
                  {provider.description || "No description available"}
                </ItemDescription>
                <ItemFooter>
                  <ItemAction>View →</ItemAction>
                </ItemFooter>
              </ItemCard>
            ))}
          </ItemList>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No service providers yet</EmptyStateTitle>
            <EmptyStateDescription>
              Add your staff and service providers to manage appointments
            </EmptyStateDescription>
            <Button onClick={navigateToProviders}>Add Providers</Button>
          </EmptyState>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingWrapper>Loading organization details...</LoadingWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <Title>{selectedOrg ? selectedOrg.name : "Create Organization"}</Title>
        {/* {selectedOrg && (
          <Button onClick={handleCreateOrg}>+ New Organization</Button>
        )} */}
      </PageHeader>

      {renderStats()}

      <MainLayout>
        {renderOrganizationForm()}

        {selectedOrg && (
          <Card>
            <TabsHeader>
              <Tab
                active={activeTab === "products"}
                onClick={() => setActiveTab("products")}
              >
                Products
              </Tab>
              <Tab
                active={activeTab === "providers"}
                onClick={() => setActiveTab("providers")}
              >
                Service Providers
              </Tab>
            </TabsHeader>

            <TabsWrapper>
              {activeTab === "products" && renderProductsSection()}
              {activeTab === "providers" && renderProvidersSection()}
            </TabsWrapper>
          </Card>
        )}
      </MainLayout>
    </Container>
  );
};

export default OrganizationGeneral;

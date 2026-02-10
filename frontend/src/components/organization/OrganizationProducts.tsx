import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "../auth/useAxiosWithAuth";
import { ToastType, useToast } from "../Toasts";

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface ProductCategory {
  _id?: string;
  name: string;
  products: Product[];
}

interface Organization {
  _id: string;
  name: string;
  productCategories: ProductCategory[];
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

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
  height: fit-content;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
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

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryItem = styled.div<{ isActive: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.isActive ? "rgba(107, 61, 223, 0.1)" : "#f8f9fa"};
  border-left: 3px solid
    ${(props) => (props.isActive ? "rgb(107, 61, 223)" : "transparent")};

  &:hover {
    background-color: ${(props) =>
      props.isActive ? "rgba(107, 61, 223, 0.15)" : "rgba(107, 61, 223, 0.05)"};
  }
`;

const CategoryName = styled.div`
  font-weight: 500;
  color: #333;
`;

const ProductCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const NewCategoryButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: none;
  cursor: pointer;
  text-align: center;
  color: #666;
  font-weight: 500;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: rgb(107, 61, 223);
    color: rgb(107, 61, 223);
    background-color: rgba(107, 61, 223, 0.05);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ProductCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 160px;
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

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
`;

const ProductDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: rgb(107, 61, 223);
`;

const ProductActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;

  &:hover {
    background-color: #f1f1f1;
    color: #333;
  }

  &.edit:hover {
    color: #0066cc;
  }

  &.delete:hover {
    color: #cc0000;
  }
`;

const NewProductCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #ddd;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgb(107, 61, 223);
    background-color: rgba(107, 61, 223, 0.05);
  }
`;

const NewProductText = styled.div`
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
  font-size: 20px;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
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

const OrganizationProducts: React.FC = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxiosWithAuth();
  const { addToast } = useToast();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [productForm, setProductForm] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    image: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      setCategories(selectedOrg.productCategories);
      if (selectedOrg.productCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(selectedOrg.productCategories[0]);
      }
    }
  }, [selectedOrg]);

  const fetchMyOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/organizations/user/mine");
      if (response.data.success && response.data.data.length > 0) {
        setSelectedOrg(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      addToast("Failed to load organizations", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditMode(false);
    setCategoryForm({ name: "" });
    setShowCategoryDrawer(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditMode(true);
    setCategoryForm({ name: category.name });
    setSelectedCategory(category);
    setShowCategoryDrawer(true);
  };

  const handleAddProduct = () => {
    setEditMode(false);
    setProductForm({
      name: "",
      description: "",
      price: 0,
      image: "",
    });
    setImagePreview(null);
    setShowProductDrawer(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditMode(true);
    setProductForm({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || "",
    });
    setImagePreview(product.image || null);
    setShowProductDrawer(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      addToast("Category name is required", ToastType.ERROR);
      return;
    }

    try {
      if (editMode && selectedCategory && selectedOrg) {
        // Update existing category
        const response = await axiosInstance.put(
          `/organizations/${selectedOrg._id}/categories/${selectedCategory._id}`,
          {
            name: categoryForm.name,
            products: selectedCategory.products,
          }
        );

        if (response.data.success) {
          addToast("Category updated successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      } else if (selectedOrg) {
        // Create new category
        const response = await axiosInstance.post(
          `/organizations/${selectedOrg._id}/categories`,
          {
            name: categoryForm.name,
            products: [],
          }
        );

        if (response.data.success) {
          addToast("Category created successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      }
      setShowCategoryDrawer(false);
    } catch (error) {
      console.error("Error saving category:", error);
      addToast("Failed to save category", ToastType.ERROR);
    }
  };

  const handleDeleteCategory = async (category: ProductCategory) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      return;
    }

    try {
      if (selectedOrg && category._id) {
        const response = await axiosInstance.delete(
          `/organizations/${selectedOrg._id}/categories/${category._id}`
        );

        if (response.data.success) {
          addToast("Category deleted successfully", ToastType.SUCCESS);
          setSelectedCategory(null);
          fetchMyOrganizations();
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      addToast("Failed to delete category", ToastType.ERROR);
    }
  };

  const handleSaveProduct = async () => {
    if (
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      productForm.price <= 0
    ) {
      addToast(
        "All product fields are required and price must be greater than 0",
        ToastType.ERROR
      );
      return;
    }

    try {
      if (selectedOrg && selectedCategory) {
        const updatedProducts = [...selectedCategory.products];

        // Create a product object, including image if it exists
        const productToSave = {
          ...productForm,
          image: productForm.image || undefined, // Only include if it has a value
        };

        if (editMode && productForm._id) {
          // Update existing product
          const productIndex = updatedProducts.findIndex(
            (p) => p._id === productForm._id
          );
          if (productIndex !== -1) {
            updatedProducts[productIndex] = productToSave;
          }
        } else {
          // Add new product
          updatedProducts.push(productToSave);
        }

        const response = await axiosInstance.put(
          `/organizations/${selectedOrg._id}/categories/${selectedCategory._id}`,
          {
            name: selectedCategory.name,
            products: updatedProducts,
          }
        );

        if (response.data.success) {
          addToast(
            editMode
              ? "Product updated successfully"
              : "Product created successfully",
            ToastType.SUCCESS
          );
          fetchMyOrganizations();
        }
      }
      setShowProductDrawer(false);
    } catch (error) {
      console.error("Error saving product:", error);
      addToast("Failed to save product", ToastType.ERROR);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the product "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      if (selectedOrg && selectedCategory && product._id) {
        const updatedProducts = selectedCategory.products.filter(
          (p) => p._id !== product._id
        );

        const response = await axiosInstance.put(
          `/organizations/${selectedOrg._id}/categories/${selectedCategory._id}`,
          {
            name: selectedCategory.name,
            products: updatedProducts,
          }
        );

        if (response.data.success) {
          addToast("Product deleted successfully", ToastType.SUCCESS);
          fetchMyOrganizations();
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("Failed to delete product", ToastType.ERROR);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (showCategoryDrawer) {
      setCategoryForm((prev) => ({ ...prev, [name]: value }));
    } else if (showProductDrawer) {
      if (name === "price") {
        setProductForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
      } else {
        setProductForm((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductForm((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Container>
        <p>Loading products...</p>
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
          <Title>Product Management</Title>
          <Button onClick={() => navigate("/organization")}>
            Back to Organization
          </Button>
        </PageHeader>

        <ContentLayout>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>

            <CategoryList>
              {categories.map((category) => (
                <CategoryItem
                  key={category._id}
                  isActive={selectedCategory?._id === category._id}
                  onClick={() => setSelectedCategory(category)}
                >
                  <CategoryName>{category.name}</CategoryName>
                  <ProductCount>
                    {category.products.length} products
                  </ProductCount>

                  <ProductActions>
                    <ActionButton
                      className="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category);
                      }}
                    >
                      Delete
                    </ActionButton>
                  </ProductActions>
                </CategoryItem>
              ))}
            </CategoryList>

            <NewCategoryButton onClick={handleAddCategory}>
              + Add New Category
            </NewCategoryButton>
          </Card>

          <div>
            {selectedCategory ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCategory.name} Products</CardTitle>
                  </CardHeader>

                  <ProductGrid>
                    {selectedCategory.products.map((product) => (
                      <ProductCard key={product._id}>
                        <ProductImage hasImage={!!product.image}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span>No Image</span>
                          )}
                        </ProductImage>
                        <ProductInfo>
                          <ProductName>{product.name}</ProductName>
                          <ProductDescription>
                            {product.description}
                          </ProductDescription>
                          <ProductPrice>
                            ${product.price.toFixed(2)}
                          </ProductPrice>
                          <ProductActions>
                            <ActionButton
                              className="edit"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              className="delete"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              Delete
                            </ActionButton>
                          </ProductActions>
                        </ProductInfo>
                      </ProductCard>
                    ))}

                    <NewProductCard onClick={handleAddProduct}>
                      <NewProductText>
                        <span>+</span>
                        <span>Add New Product</span>
                      </NewProductText>
                    </NewProductCard>
                  </ProductGrid>
                </Card>
              </>
            ) : (
              <EmptyState>
                <h2>Select a category</h2>
                <p>Or create a new one to manage products</p>
              </EmptyState>
            )}
          </div>
        </ContentLayout>
      </Container>

      {/* Category Drawer */}
      <Overlay
        isOpen={showCategoryDrawer}
        onClick={() => setShowCategoryDrawer(false)}
      />
      <Drawer isOpen={showCategoryDrawer}>
        <DrawerHeader>
          <DrawerTitle>
            {editMode ? "Edit Category" : "New Category"}
          </DrawerTitle>
          <CloseButton onClick={() => setShowCategoryDrawer(false)}>
            ×
          </CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <FormGroup>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={categoryForm.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
            />
          </FormGroup>
        </DrawerContent>

        <DrawerActions>
          <CancelButton onClick={() => setShowCategoryDrawer(false)}>
            Cancel
          </CancelButton>
          <Button onClick={handleSaveCategory}>Save Category</Button>
        </DrawerActions>
      </Drawer>

      {/* Product Drawer */}
      <Overlay
        isOpen={showProductDrawer}
        onClick={() => setShowProductDrawer(false)}
      />
      <Drawer isOpen={showProductDrawer}>
        <DrawerHeader>
          <DrawerTitle>{editMode ? "Edit Product" : "New Product"}</DrawerTitle>
          <CloseButton onClick={() => setShowProductDrawer(false)}>
            ×
          </CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <ImageUpload>
            <ImagePreview hasImage={!!imagePreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Product" />
              ) : (
                "Upload Product Image"
              )}
            </ImagePreview>
            <input
              type="file"
              accept="image/*"
              id="product-image-upload"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <ImageUploadButton
              onClick={() =>
                document.getElementById("product-image-upload")?.click()
              }
            >
              {imagePreview ? "Change Image" : "Upload Image"}
            </ImageUploadButton>
          </ImageUpload>

          <FormGroup>
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              name="name"
              value={productForm.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={productForm.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={handleInputChange}
              placeholder="Enter product price"
            />
          </FormGroup>
        </DrawerContent>

        <DrawerActions>
          <CancelButton onClick={() => setShowProductDrawer(false)}>
            Cancel
          </CancelButton>
          <Button onClick={handleSaveProduct}>Save Product</Button>
        </DrawerActions>
      </Drawer>
    </>
  );
};

export default OrganizationProducts;

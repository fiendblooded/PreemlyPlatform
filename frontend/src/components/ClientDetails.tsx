import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ServiceProvider {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface Booking {
  _id: string;
  serviceProvider: ServiceProvider;
  serviceDate: string;
  serviceTime: string;
  client: string;
  products?: Product[];
  totalAmount?: number; // Total amount for the booking
  createdAt: string;
  updatedAt: string;
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  comment?: string;
  attendance_status: boolean;
  email_sent: boolean;
  reminder_email_date?: Date | string;
  eventId?: string;
  gdpr_consent?: boolean;
  eventName?: string;
  bookings: Booking[];
  createdAt?: string;
}

// Styled components
const Container = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  max-width: 1400px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;

  &:hover {
    color: rgb(107, 61, 223);
  }

  svg {
    margin-right: 8px;
  }
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

const ClientDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ClientInfoCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const BookingSection = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const InfoGroup = styled.div`
  margin-bottom: 16px;
`;

const InfoLabel = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
`;

const InfoValue = styled.p`
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BookingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th {
    background-color: #f8f9fa;
    text-align: left;
    padding: 16px 24px;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #e9ecef;
  }

  td {
    padding: 16px 24px;
    border-bottom: 1px solid #e9ecef;
    color: #333;
  }

  tr:hover {
    background-color: rgba(107, 61, 223, 0.03);
  }
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

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #6c757d;
`;

const EmptyBookings = styled.div`
  padding: 40px;
  text-align: center;
  color: #6c757d;
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

const Select = styled.select`
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

const CancelButton = styled.button`
  background-color: #f1f1f1;
  color: #333;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e1e1e1;
  }
`;

const Modal = styled.div`
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

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 28px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #343a40;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

// New checkbox multi-select components
const CheckboxListContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 8px 0;
  margin-bottom: 8px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(107, 61, 223, 0.05);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  font-size: 14px;
  color: #333;
`;

const CheckboxInput = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: rgb(107, 61, 223);

  &:checked {
    background-color: rgb(107, 61, 223);
    border-color: rgb(107, 61, 223);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(107, 61, 223, 0.2);
  }
`;

const SelectedCount = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-style: italic;
`;

const ClientDetails: React.FC = () => {
  // Explicitly type the parameter to match the route in App.tsx
  const { clientId } = useParams<{ clientId: string }>();
  console.log("Component rendered with clientId param:", clientId);

  const navigate = useNavigate();
  const axiosWithAuth = useAxiosWithAuth();
  const { addToast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newBooking, setNewBooking] = useState({
    serviceProvider: "",
    serviceDate: "",
    serviceTime: "",
    products: [] as string[],
  });
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
    []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddBooking, setShowAddBooking] = useState<boolean>(false);
  const [financialStats, setFinancialStats] = useState({
    totalSpent: 0,
    averagePerBooking: 0,
    highestBooking: 0,
    lastBookingAmount: 0,
  });

  // Fetch client details
  useEffect(() => {
    console.log("Component mounted, clientId:", clientId);
    if (clientId) {
      fetchClientDetails();
      fetchServiceProviders();
      fetchProducts();
    }
  }, [clientId]); // Only depend on clientId, not the client object

  // Calculate financial statistics whenever client bookings change
  useEffect(() => {
    if (client && client.bookings.length > 0) {
      calculateFinancialStats();
    }
  }, [client]);

  const fetchClientDetails = async () => {
    console.log("Fetching client details for clientId:", clientId);
    try {
      setLoading(true);
      const response = await axiosWithAuth.get(`/clients/${clientId}/bookings`);
      console.log("Client details response:", response);
      if (response.data && response.data.success && response.data.data) {
        setClient(response.data.data);
        console.log("Client set successfully:", response.data.data);
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      addToast("Failed to load client details", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      const response = await axiosWithAuth.get("/organizations/user/mine");
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // Get the first organization's service providers
        setServiceProviders(response.data.data[0].serviceProviders || []);
      } else {
        console.error("No organizations or service providers found");
        setServiceProviders([]);
      }
    } catch (error) {
      console.error("Error fetching service providers:", error);
      setServiceProviders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosWithAuth.get("/organizations/user/mine");
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // Get the first organization's product categories
        const productCategories = response.data.data[0].productCategories || [];

        // Flatten products from all categories
        const allProducts = productCategories.reduce(
          (acc: Product[], category: { products: Product[] }) => {
            return [...acc, ...category.products];
          },
          []
        );
        setProducts(allProducts);
      } else {
        console.error("No organizations or products found");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const calculateFinancialStats = () => {
    if (!client) return;

    const bookings = client.bookings;
    const totalSpent = bookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );
    const averagePerBooking =
      bookings.length > 0 ? totalSpent / bookings.length : 0;
    const highestBooking = Math.max(
      ...bookings.map((booking) => booking.totalAmount || 0)
    );
    const lastBookingAmount =
      bookings.length > 0 ? bookings[bookings.length - 1].totalAmount || 0 : 0;

    setFinancialStats({
      totalSpent,
      averagePerBooking,
      highestBooking,
      lastBookingAmount,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handleProductChange = (productId: string) => {
    setNewBooking((prev) => {
      const updatedProducts = prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId];
      return { ...prev, products: updatedProducts };
    });
  };

  const handleAddBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      // Calculate total amount based on selected products
      const selectedProducts = products.filter((product) =>
        newBooking.products.includes(product._id)
      );
      const totalAmount = selectedProducts.reduce(
        (sum, product) => sum + product.price,
        0
      );

      const bookingData = {
        ...newBooking,
        client: clientId,
        products: newBooking.products,
        totalAmount,
      };

      const response = await axiosWithAuth.post("/bookings", bookingData);

      if (response.data && client) {
        // Fetch the updated client with bookings to ensure we have the latest data
        fetchClientDetails();
      }

      setNewBooking({
        serviceProvider: "",
        serviceDate: "",
        serviceTime: "",
        products: [],
      });

      // Close the modal
      setShowAddBooking(false);
      addToast("Booking added successfully", ToastType.SUCCESS);
    } catch (error) {
      console.error("Error adding booking:", error);
      addToast("Failed to add booking", ToastType.ERROR);
    }
  };

  const prepareSpendingOverTimeData = () => {
    if (!client || client.bookings.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Spending Over Time",
            data: [],
            borderColor: "rgb(107, 61, 223)",
            backgroundColor: "rgba(107, 61, 223, 0.5)",
          },
        ],
      };
    }

    // Sort bookings by date
    const sortedBookings = [...client.bookings].sort(
      (a, b) =>
        new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
    );

    // Calculate cumulative spending
    let cumulativeSpending = 0;
    const data = sortedBookings.map((booking) => {
      cumulativeSpending += booking.totalAmount || 0;
      return {
        date: format(new Date(booking.serviceDate), "MMM d, yyyy"),
        amount: cumulativeSpending,
      };
    });

    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: "Cumulative Spending ($)",
          data: data.map((item) => item.amount),
          borderColor: "rgb(107, 61, 223)",
          backgroundColor: "rgba(107, 61, 223, 0.5)",
          tension: 0.4,
        },
      ],
    };
  };

  const prepareSpendingByProviderData = () => {
    if (!client || client.bookings.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Group spending by provider
    const providerSpending: { [key: string]: number } = {};

    client.bookings.forEach((booking) => {
      const providerName = booking.serviceProvider.name;
      const amount = booking.totalAmount || 0;

      if (providerSpending[providerName]) {
        providerSpending[providerName] += amount;
      } else {
        providerSpending[providerName] = amount;
      }
    });

    // Convert to chart data format
    const labels = Object.keys(providerSpending);
    const data = Object.values(providerSpending);

    return {
      labels,
      datasets: [
        {
          label: "Spending by Provider ($)",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading client details...</LoadingContainer>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container>
        <BackButton onClick={() => navigate("/clients")}>
          ← Back to Customers
        </BackButton>
        <EmptyBookings>Client not found</EmptyBookings>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate("/clients")}>
        ← Back to Customers
      </BackButton>

      <PageHeader>
        <Title>
          {client.firstName} {client.lastName}
        </Title>
        <Button onClick={() => setShowAddBooking(true)}>+ Add Booking</Button>
      </PageHeader>

      <ClientDetailGrid>
        <ClientInfoCard>
          <SectionTitle>Customer Information</SectionTitle>

          <InfoGroup>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{client.email}</InfoValue>
          </InfoGroup>

          <InfoGroup>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>{client.phone || "N/A"}</InfoValue>
          </InfoGroup>

          {client.comment && (
            <InfoGroup>
              <InfoLabel>Comment</InfoLabel>
              <InfoValue>{client.comment}</InfoValue>
            </InfoGroup>
          )}

          {client.createdAt && (
            <InfoGroup>
              <InfoLabel>Customer Since</InfoLabel>
              <InfoValue>
                {format(new Date(client.createdAt), "MMMM d, yyyy")}
              </InfoValue>
            </InfoGroup>
          )}
        </ClientInfoCard>

        <ClientInfoCard>
          <SectionHeader>
            <SectionTitle>Financial Summary</SectionTitle>
          </SectionHeader>
          <InfoGroup>
            <InfoLabel>Total Spent</InfoLabel>
            <InfoValue>${financialStats.totalSpent.toFixed(2)}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Average Per Booking</InfoLabel>
            <InfoValue>
              ${financialStats.averagePerBooking.toFixed(2)}
            </InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Highest Booking</InfoLabel>
            <InfoValue>${financialStats.highestBooking.toFixed(2)}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Last Booking Amount</InfoLabel>
            <InfoValue>
              ${financialStats.lastBookingAmount.toFixed(2)}
            </InfoValue>
          </InfoGroup>
        </ClientInfoCard>
      </ClientDetailGrid>

      <ChartsGrid>
        <BookingSection>
          <SectionHeader>
            <SectionTitle>Cumulative Spending Over Time</SectionTitle>
          </SectionHeader>
          <ChartContainer>
            <Line
              data={prepareSpendingOverTimeData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Cumulative Amount ($)",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Booking Date",
                    },
                  },
                },
              }}
            />
          </ChartContainer>
        </BookingSection>

        <BookingSection>
          <SectionHeader>
            <SectionTitle>Spending by Provider</SectionTitle>
          </SectionHeader>
          <ChartContainer>
            <Pie
              data={prepareSpendingByProviderData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </ChartContainer>
        </BookingSection>
      </ChartsGrid>

      <BookingSection>
        <SectionHeader>
          <SectionTitle>Bookings History</SectionTitle>
          <Button onClick={() => setShowAddBooking(true)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Booking
          </Button>
        </SectionHeader>

        {client.bookings.length === 0 ? (
          <p>This client has no bookings yet.</p>
        ) : (
          <BookingTable>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Service Provider</th>
                <th>Products</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {client.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    {format(new Date(booking.serviceDate), "MMMM d, yyyy")} at{" "}
                    {booking.serviceTime}
                  </td>
                  <td>{booking.serviceProvider.name}</td>
                  <td>
                    {booking.products && booking.products.length > 0
                      ? booking.products
                          .map((product: Product) => product.name)
                          .join(", ")
                      : "No products"}
                  </td>
                  <td>
                    $
                    {booking.totalAmount
                      ? booking.totalAmount.toFixed(2)
                      : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </BookingTable>
        )}
      </BookingSection>

      {/* Add Booking Modal */}
      {showAddBooking && (
        <Modal onClick={() => setShowAddBooking(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add New Booking</ModalTitle>
              <CloseButton onClick={() => setShowAddBooking(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddBooking();
              }}
            >
              <FormGroup>
                <Label>Service Provider</Label>
                <Select
                  name="serviceProvider"
                  value={newBooking.serviceProvider}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a provider</option>
                  {serviceProviders.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Date</Label>
                <Input
                  type="date"
                  name="serviceDate"
                  value={newBooking.serviceDate}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Time</Label>
                <Input
                  type="time"
                  name="serviceTime"
                  value={newBooking.serviceTime}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Products</Label>
                <SelectedCount>
                  {newBooking.products.length} product
                  {newBooking.products.length !== 1 ? "s" : ""} selected
                </SelectedCount>
                <CheckboxListContainer>
                  {products.map((product) => (
                    <CheckboxItem key={product._id}>
                      <CheckboxLabel>
                        <CheckboxInput
                          checked={newBooking.products.includes(product._id)}
                          onChange={() => handleProductChange(product._id)}
                        />
                        {product.name} - ${product.price.toFixed(2)}
                      </CheckboxLabel>
                    </CheckboxItem>
                  ))}
                </CheckboxListContainer>
              </FormGroup>

              <ModalFooter>
                <CancelButton
                  type="button"
                  onClick={() => setShowAddBooking(false)}
                >
                  Cancel
                </CancelButton>
                <Button
                  type="submit"
                  disabled={
                    !newBooking.serviceProvider ||
                    !newBooking.serviceDate ||
                    !newBooking.serviceTime
                  }
                >
                  Save Booking
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ClientDetails;

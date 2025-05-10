import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { ToastType, useToast } from "./Toasts";
import { useNavigate } from "react-router-dom";

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
  eventName?: string; // Added to display the event name
  bookings?: { _id: string }[];
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

const AddButton = styled.button`
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
`;

const TableContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #f9f9f9;

  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background-color: #f8f9fa;
    text-align: left;
    padding: 16px 24px;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 10;
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

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  margin: 0 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(107, 61, 223, 0.1);
    color: rgb(107, 61, 223);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const EmptyMessage = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #495057;
  margin-top: 20px;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: #6c757d;
  max-width: 400px;
  margin-bottom: 20px;
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
  color: black;
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
  min-height: 100px;
  resize: vertical;
  color: black;
  box-sizing: border-box;
  &:focus {
    border-color: rgb(107, 61, 223);
    box-shadow: 0 0 0 3px rgba(107, 61, 223, 0.1);
    outline: none;
    background-color: white;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
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

const SaveButton = styled.button`
  background-color: rgb(107, 61, 223);
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgb(126, 87, 231);
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

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(107, 61, 223, 0.06);
  }
`;

const BookingCount = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(107, 61, 223, 0.1);
  color: rgb(107, 61, 223);
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
`;

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const axiosInstance = useAxiosWithAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.firstName.toLowerCase().includes(lowercaseTerm) ||
          client.lastName.toLowerCase().includes(lowercaseTerm) ||
          client.email.toLowerCase().includes(lowercaseTerm) ||
          (client.phone && client.phone.includes(searchTerm))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/clients");
      if (response.data.success) {
        // Fetch each client with their bookings
        const clientsWithBookings = await Promise.all(
          response.data.data.map(async (client: Client) => {
            try {
              const bookingsResponse = await axiosInstance.get(
                `/clients/${client._id}/bookings`
              );
              if (bookingsResponse.data.success) {
                return {
                  ...client,
                  bookings: bookingsResponse.data.data.bookings || [],
                };
              }
              return client;
            } catch (error) {
              console.error(
                `Error fetching bookings for client ${client._id}:`,
                error
              );
              return client;
            }
          })
        );

        setClients(clientsWithBookings);
        setFilteredClients(clientsWithBookings);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      addToast("Failed to load clients", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setCurrentClient(client);
      setIsEditing(true);
    } else {
      setCurrentClient({});
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentClient({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClient = async () => {
    try {
      if (
        !currentClient.firstName ||
        !currentClient.lastName ||
        !currentClient.email ||
        !currentClient.phone
      ) {
        addToast("Please fill out all required fields", ToastType.ERROR);
        return;
      }

      if (isEditing && currentClient._id) {
        await axiosInstance.put(`/clients/${currentClient._id}`, currentClient);
        addToast("Client updated successfully", ToastType.SUCCESS);
      } else {
        await axiosInstance.post("/clients", currentClient);
        addToast("Client added successfully", ToastType.SUCCESS);
      }

      handleCloseModal();
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
      addToast("Error saving client", ToastType.ERROR);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axiosInstance.delete(`/clients/${id}`);
        addToast("Client deleted successfully", ToastType.SUCCESS);
        fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
        addToast("Error deleting client", ToastType.ERROR);
      }
    }
  };

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <Container>
      <PageHeader>
        <Title>Customers</Title>
        <AddButton onClick={() => handleOpenModal()}>+ Add Customer</AddButton>
      </PageHeader>

      <TableContainer>
        <TableHeader>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </TableHeader>

        {loading ? (
          <LoadingContainer>Loading customers...</LoadingContainer>
        ) : filteredClients.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Bookings</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client._id}
                  onClick={() => handleRowClick(client._id)}
                >
                  <td>{client.firstName}</td>
                  <td>{client.lastName}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>
                    <BookingCount>{client.bookings?.length || 0}</BookingCount>
                  </td>
                  <td>{client.comment || "-"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(client);
                      }}
                    >
                      ✏️
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client._id);
                      }}
                    >
                      🗑️
                    </ActionButton>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            <EmptyMessage>No customers found</EmptyMessage>
            <EmptyDescription>
              {searchTerm
                ? "Try adjusting your search to find what you're looking for."
                : "Add your first customer to get started."}
            </EmptyDescription>
            {!searchTerm && (
              <AddButton onClick={() => handleOpenModal()}>
                + Add Customer
              </AddButton>
            )}
          </EmptyState>
        )}
      </TableContainer>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {isEditing ? "Edit Customer" : "Add Customer"}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveClient();
              }}
            >
              <FormGroup>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={currentClient.firstName || ""}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={currentClient.lastName || ""}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentClient.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={currentClient.phone || ""}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="comment">Comment</Label>
                <TextArea
                  id="comment"
                  name="comment"
                  value={currentClient.comment || ""}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <ModalFooter>
                <CancelButton type="button" onClick={handleCloseModal}>
                  Cancel
                </CancelButton>
                <SaveButton type="submit">
                  {isEditing ? "Update" : "Save"}
                </SaveButton>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Clients;

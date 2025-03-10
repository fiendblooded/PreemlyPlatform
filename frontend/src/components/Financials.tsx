import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import TopBar from "./TopBar";
import { Invoice, Event, CategoryBreakdown } from "../types";

// Modern color palette to match sidebar but with light theme
const colors = {
  primary: "#6366F1", // Matches sidebar accent
  primaryHover: "#4F46E5",
  primaryGradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  borderLight: "#E2E8F0",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  yellow: "#e6bf30",
  green: "#2a9134",
  blue: "#4F46E5",
  gray: "#64748B",
  shadow: "rgba(0, 0, 0, 0.05)",
  red: "#e53e3e",
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.backgroundLight};
  font-family: Axiforma, sans-serif;
`;

const ContentWrapper = styled.div`
  padding: 0px 32px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 140px);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.2);
    border-radius: 4px;
  }
`;

const Header = styled.div`
  margin-top: 24px;
  height: 50px;
  color: ${colors.textPrimary};
  display: flex;
  font-size: 28px;
  font-weight: 700;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 24px;
  align-items: center;
  letter-spacing: -0.5px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  width: 100%;
`;

const Spinner = styled.div`
  border: 4px solid rgba(99, 102, 241, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border-left-color: ${colors.primary};
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
  border-bottom: 1px solid ${colors.borderLight};
  position: sticky;
  top: 0;
  background-color: ${colors.backgroundLight};
  z-index: 10;
  padding: 0 4px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? colors.primary : "transparent")};
  color: ${(props) => (props.active ? colors.primary : colors.textSecondary)};
  font-weight: ${(props) => (props.active ? "600" : "500")};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    color: ${colors.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${colors.primary};
    transform: ${(props) => (props.active ? "scaleX(1)" : "scaleX(0)")};
    transform-origin: bottom left;
    transition: transform 0.3s ease;
    opacity: 0.2;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: ${colors.textSecondary};
  background-color: ${colors.backgroundSecondary};
  border-radius: 12px;
  margin-top: 20px;
  animation: ${fadeIn} 0.5s ease-out;
  border: 1px dashed ${colors.borderLight};
`;

const EmptyStateIcon = styled.div`
  font-size: 56px;
  margin-bottom: 20px;
  opacity: 0.8;
`;

// Overview tab components
const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px ${colors.shadow};
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid ${colors.borderLight};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${colors.primaryGradient || colors.primary};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  color: ${(props) => (props.positive ? colors.green : colors.red)};
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: 20px;
  margin-top: 32px;
  position: relative;
  padding-left: 16px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${colors.primaryGradient || colors.primary};
    border-radius: 4px;
  }
`;

const EventCard = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px ${colors.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${colors.borderLight};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EventTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.textPrimary};
`;

const EventDate = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 4px;
`;

const EventAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

// Invoices tab components
const InvoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 24px;
  position: relative;

  &::before {
    content: "🔍";
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: ${colors.textSecondary};
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 12px 12px 40px;
  border: 1px solid ${colors.borderLight};
  border-radius: 30px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${colors.textTertiary};
  }
`;

const InvoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const InvoiceCard = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px ${colors.shadow};
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid ${colors.borderLight};
  height: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.borderLight};
`;

const InvoiceTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textPrimary};
  line-height: 1.4;
`;

const InvoiceAmount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.primary};
  background-color: rgba(99, 102, 241, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
`;

const InvoiceDetail = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "•";
    color: ${colors.primary};
    font-size: 18px;
    line-height: 1;
  }
`;

const InvoiceStatus = styled.div<{ isPaid: boolean }>`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${(props) =>
    props.isPaid ? "rgba(42, 145, 52, 0.1)" : "rgba(229, 62, 62, 0.1)"};
  color: ${(props) => (props.isPaid ? colors.green : colors.red)};
  display: inline-block;
  margin-top: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InvoiceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  font-size: 12px;
  color: ${colors.textSecondary};
  border-top: 1px solid ${colors.borderLight};
`;

const InvoiceEvent = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.textSecondary};
  background-color: ${colors.backgroundSecondary};
  padding: 4px 10px;
  border-radius: 20px;
`;

// Analysis tab components
const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ChartContainer = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px ${colors.shadow};
  margin-bottom: 32px;
  height: 320px;
  position: relative;
  border: 1px solid ${colors.borderLight};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const ChartTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.borderLight};
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  box-shadow: 0 1px 3px ${colors.shadow};
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border: 1px solid ${colors.borderLight};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const CategoryName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
`;

const CategoryColorDot = styled.div<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 10px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
`;

const CategoryAmount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const CategoryPercentage = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-left: 10px;
  background-color: ${colors.backgroundSecondary};
  padding: 4px 8px;
  border-radius: 20px;
`;

// Mock chart component (in a real app, you'd use a charting library)
const MockChart = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  font-size: 15px;
  background-color: ${colors.backgroundSecondary};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  line-height: 1.6;
`;

// Extended Invoice type with event information
interface ExtendedInvoice extends Omit<Invoice, "eventId"> {
  eventTitle?: string;
  eventId?: string;
}

// Add these components for the Invoice Detail popup
const PopupOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.isVisible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
`;

const PopupContainer = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PopupHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PopupTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.backgroundSecondary};
  }
`;

const PopupContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const DetailLabel = styled.div`
  width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textSecondary};
`;

const DetailValue = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${colors.textPrimary};
`;

const PDFViewer = styled.div`
  width: 100%;
  height: 500px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
`;

const PDFEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const ActionButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

// Add these components for the Add Invoice popup
const AddButton = styled(ActionButton)`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  z-index: 10;

  &::before {
    content: "+";
    font-size: 28px;
    line-height: 1;
  }

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textPrimary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.textPrimary};
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed ${colors.borderLight};
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primary};
    background-color: rgba(99, 102, 241, 0.05);
  }
`;

const FileUploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: ${colors.textSecondary};
`;

const FileUploadText = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

const FileUploadSubtext = styled.div`
  font-size: 12px;
  color: ${colors.textTertiary};
`;

const SelectedFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${colors.backgroundSecondary};
  border-radius: 6px;
  margin-top: 12px;
`;

const FileIcon = styled.div`
  font-size: 20px;
  color: ${colors.primary};
`;

const FileName = styled.div`
  font-size: 14px;
  color: ${colors.textPrimary};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${colors.red};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background: none;
  border: 1px solid ${colors.borderLight};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.backgroundSecondary};
  }
`;

const SubmitButton = styled(ActionButton)`
  padding: 10px 24px;
`;

const Financials: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<ExtendedInvoice[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "invoices" | "analysis"
  >("overview");
  const navigate = useNavigate();
  const axiosInstance = useAxiosWithAuth();

  // Financial summary stats
  const [totalSpend, setTotalSpend] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdown[]
  >([]);

  const [selectedInvoice, setSelectedInvoice] =
    useState<ExtendedInvoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    eventId: "",
    title: "",
    vendor: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0], // Today's date as default
    isPaid: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add state for event analysis data
  const [eventsWithAnalysis, setEventsWithAnalysis] = useState<Event[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalVariance, setTotalVariance] = useState(0);
  const [variancePercentage, setVariancePercentage] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // Filter invoices when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInvoices(invoices);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = invoices.filter(
        (invoice) =>
          (invoice.title && invoice.title.toLowerCase().includes(term)) ||
          (invoice.vendor && invoice.vendor.toLowerCase().includes(term)) ||
          (invoice.category && invoice.category.toLowerCase().includes(term))
      );
      setFilteredInvoices(filtered);
    }
  }, [searchTerm, invoices]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch events
      const eventsResponse = await axiosInstance.get("/events");
      const fetchedEvents = eventsResponse.data.data;
      setEvents(fetchedEvents);

      // Filter events with invoice analysis
      const eventsWithInvoiceAnalysis = fetchedEvents.filter(
        (event: Event) => event.invoiceAnalysis
      );
      setEventsWithAnalysis(eventsWithInvoiceAnalysis);

      // Calculate totals from event analysis data
      let totalBudgetAmount = 0;
      let totalVarianceAmount = 0;

      eventsWithInvoiceAnalysis.forEach((event: Event) => {
        if (event.invoiceAnalysis) {
          const { budgetSummary } = event.invoiceAnalysis;
          totalBudgetAmount += budgetSummary.totalSpend;

          if (budgetSummary.budgetVariance) {
            totalVarianceAmount += budgetSummary.budgetVariance.amount;
          }
        }
      });

      setTotalBudget(totalBudgetAmount);
      setTotalVariance(totalVarianceAmount);

      // Calculate variance percentage
      if (totalBudgetAmount > 0) {
        setVariancePercentage(
          Math.round((totalVarianceAmount / totalBudgetAmount) * 100)
        );
      }

      // Aggregate all invoices from all events
      let allInvoices: ExtendedInvoice[] = [];
      let totalAmount = 0;
      let paidCount = 0;
      let unpaidCount = 0;

      // For category breakdown
      const categories: Record<string, number> = {};

      for (const event of fetchedEvents) {
        if (event.invoices && event.invoices.length > 0) {
          // Add event title to each invoice for reference
          const invoicesWithEvent = event.invoices.map((invoice: Invoice) => ({
            ...invoice,
            eventTitle: event.title,
            eventId: event._id,
          }));

          allInvoices = [...allInvoices, ...invoicesWithEvent];

          // Calculate financial stats
          event.invoices.forEach((invoice: Invoice) => {
            if (invoice.amount) {
              totalAmount += invoice.amount;

              // Add to category breakdown
              if (invoice.category) {
                categories[invoice.category] =
                  (categories[invoice.category] || 0) + invoice.amount;
              } else {
                categories["Uncategorized"] =
                  (categories["Uncategorized"] || 0) + invoice.amount;
              }
            }

            if (invoice.isPaid) {
              paidCount++;
            } else {
              unpaidCount++;
            }
          });
        }
      }

      // Convert categories to array and calculate percentages
      const categoryArray: CategoryBreakdown[] = Object.entries(categories).map(
        ([category, amount]) => ({
          category,
          amount,
          percentage: Math.round((amount / totalAmount) * 100),
        })
      );

      // Sort by amount (descending)
      categoryArray.sort((a, b) => b.amount - a.amount);

      setInvoices(allInvoices);
      setFilteredInvoices(allInvoices);
      setTotalSpend(totalAmount);
      setInvoiceCount(allInvoices.length);
      setPaidInvoices(paidCount);
      setUnpaidInvoices(unpaidCount);
      setCategoryBreakdown(categoryArray);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate colors for categories
  const generateCategoryColors = (count: number) => {
    const baseColors = [
      "rgba(107, 61, 223, 0.8)", // Primary purple
      "rgba(66, 133, 244, 0.8)", // Blue
      "rgba(219, 68, 55, 0.8)", // Red
      "rgba(244, 180, 0, 0.8)", // Yellow
      "rgba(15, 157, 88, 0.8)", // Green
      "rgba(171, 71, 188, 0.8)", // Purple
      "rgba(255, 112, 67, 0.8)", // Orange
      "rgba(0, 172, 193, 0.8)", // Teal
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }

    return colors;
  };

  const openInvoiceDetail = (invoice: ExtendedInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const closeInvoiceDetail = () => {
    setShowInvoiceDetail(false);
  };

  const openAddInvoicePopup = () => {
    setShowAddInvoice(true);
  };

  const closeAddInvoicePopup = () => {
    setShowAddInvoice(false);
    setSelectedFile(null);
    setNewInvoice({
      eventId: "",
      title: "",
      vendor: "",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      isPaid: false,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewInvoice((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewInvoice((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitInvoice = async () => {
    if (!selectedFile) {
      alert("Please upload a PDF file");
      return;
    }

    if (!newInvoice.eventId) {
      alert("Please select an event");
      return;
    }

    if (!newInvoice.title.trim()) {
      alert("Please enter a title for the invoice");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("invoice", selectedFile);

      // Add other invoice details
      Object.entries(newInvoice).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      await axiosInstance.post(
        `/events/${newInvoice.eventId}/invoices`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh data
      await fetchData();

      // Close popup and reset form
      closeAddInvoicePopup();

      // Show success message
      alert("Invoice uploaded successfully");
    } catch (error) {
      console.error("Error uploading invoice:", error);
      alert("Failed to upload invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOverviewTab = () => {
    if (events.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <p>
            No financial data available yet. Create events and upload invoices
            to see your financial overview.
          </p>
        </EmptyState>
      );
    }

    // Get events with invoices
    const eventsWithInvoices = events.filter(
      (event) => event.invoices && event.invoices.length > 0
    );

    // Sort events by total invoice amount (descending)
    const sortedEvents = [...eventsWithInvoices].sort((a, b) => {
      const aTotal =
        a.invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const bTotal =
        b.invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      return bTotal - aTotal;
    });

    return (
      <OverviewContainer>
        <StatsGrid>
          <StatCard>
            <StatTitle>Total Spend</StatTitle>
            <StatValue>
              {formatCurrency(totalBudget > 0 ? totalBudget : totalSpend)}
            </StatValue>
            <StatChange>{invoiceCount} invoices total</StatChange>
          </StatCard>

          <StatCard>
            <StatTitle>Budget Variance</StatTitle>
            <StatValue>{formatCurrency(totalVariance)}</StatValue>
            <StatChange positive={totalVariance <= 0}>
              {totalVariance !== 0
                ? `${
                    totalVariance <= 0 ? "Under" : "Over"
                  } budget by ${Math.abs(variancePercentage)}%`
                : "On budget"}
            </StatChange>
          </StatCard>

          <StatCard>
            <StatTitle>Paid vs. Unpaid</StatTitle>
            <StatValue>
              {paidInvoices} / {unpaidInvoices}
            </StatValue>
            <StatChange positive={paidInvoices > unpaidInvoices}>
              {paidInvoices > 0 && invoiceCount > 0
                ? `${Math.round((paidInvoices / invoiceCount) * 100)}% paid`
                : "0% paid"}
            </StatChange>
          </StatCard>
        </StatsGrid>

        <SectionTitle>Events by Spend</SectionTitle>
        {eventsWithAnalysis.length > 0
          ? eventsWithAnalysis.slice(0, 5).map((event) => {
              const totalAmount =
                event.invoiceAnalysis?.budgetSummary.totalSpend || 0;

              return (
                <EventCard
                  key={event._id}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <EventInfo>
                    <EventTitle>{event.title}</EventTitle>
                    <EventDate>{formatDate(event.date)}</EventDate>
                  </EventInfo>
                  <div>
                    <EventAmount>{formatCurrency(totalAmount)}</EventAmount>
                    {event.invoiceAnalysis?.budgetSummary.budgetVariance && (
                      <div
                        style={{
                          fontSize: "12px",
                          color:
                            event.invoiceAnalysis.budgetSummary.budgetVariance
                              .amount <= 0
                              ? colors.green
                              : colors.red,
                          textAlign: "right",
                          marginTop: "4px",
                        }}
                      >
                        {event.invoiceAnalysis.budgetSummary.budgetVariance
                          .amount <= 0
                          ? `${Math.abs(
                              event.invoiceAnalysis.budgetSummary.budgetVariance
                                .percentage
                            )}% under budget`
                          : `${event.invoiceAnalysis.budgetSummary.budgetVariance.percentage}% over budget`}
                      </div>
                    )}
                  </div>
                </EventCard>
              );
            })
          : sortedEvents.slice(0, 5).map((event) => {
              const totalAmount =
                event.invoices?.reduce(
                  (sum, inv) => sum + (inv.amount || 0),
                  0
                ) || 0;

              return (
                <EventCard
                  key={event._id}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <EventInfo>
                    <EventTitle>{event.title}</EventTitle>
                    <EventDate>{formatDate(event.date)}</EventDate>
                  </EventInfo>
                  <EventAmount>{formatCurrency(totalAmount)}</EventAmount>
                </EventCard>
              );
            })}

        {eventsWithInvoices.length === 0 && (
          <EmptyState>
            <p>No events with financial data yet.</p>
          </EmptyState>
        )}
      </OverviewContainer>
    );
  };

  const renderInvoicesTab = () => {
    if (invoices.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>📄</EmptyStateIcon>
          <p>
            No invoices available yet. Upload invoices in your event pages to
            see them here.
          </p>
        </EmptyState>
      );
    }

    return (
      <InvoicesContainer>
        <SearchBar>
          <SearchInput
            placeholder="Search invoices by title, vendor, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        {filteredInvoices.length === 0 ? (
          <EmptyState>
            <p>No invoices match your search criteria.</p>
          </EmptyState>
        ) : (
          <InvoiceGrid>
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                onClick={() => openInvoiceDetail(invoice)}
              >
                <InvoiceHeader>
                  <InvoiceTitle>{invoice.title}</InvoiceTitle>
                  <InvoiceAmount>
                    {formatCurrency(invoice.amount)}
                  </InvoiceAmount>
                </InvoiceHeader>

                {invoice.vendor && (
                  <InvoiceDetail>Vendor: {invoice.vendor}</InvoiceDetail>
                )}

                {invoice.category && (
                  <InvoiceDetail>Category: {invoice.category}</InvoiceDetail>
                )}

                {invoice.date && (
                  <InvoiceDetail>
                    Date: {formatDate(invoice.date)}
                  </InvoiceDetail>
                )}

                <InvoiceStatus isPaid={invoice.isPaid}>
                  {invoice.isPaid ? "Paid" : "Unpaid"}
                </InvoiceStatus>

                <InvoiceFooter>
                  <div>Uploaded: {formatDate(invoice.createdAt)}</div>
                  <InvoiceEvent>{invoice.eventTitle}</InvoiceEvent>
                </InvoiceFooter>
              </InvoiceCard>
            ))}
          </InvoiceGrid>
        )}
      </InvoicesContainer>
    );
  };

  const renderAnalysisTab = () => {
    if (invoices.length === 0) {
      return (
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <p>
            No financial data available for analysis. Upload invoices to see
            insights.
          </p>
        </EmptyState>
      );
    }

    const categoryColors = generateCategoryColors(categoryBreakdown.length);

    return (
      <AnalysisContainer>
        <ChartContainer>
          <ChartTitle>Spending by Category</ChartTitle>
          <MockChart>
            {/* In a real app, you would use a chart library like Chart.js or Recharts */}
            This is where a pie chart would be displayed showing category
            breakdown
          </MockChart>
        </ChartContainer>

        <SectionTitle>Category Breakdown</SectionTitle>
        <CategoryList>
          {categoryBreakdown.map((category, index) => (
            <CategoryItem key={category.category}>
              <CategoryName>
                <CategoryColorDot color={categoryColors[index]} />
                {category.category}
              </CategoryName>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CategoryAmount>
                  {formatCurrency(category.amount)}
                </CategoryAmount>
                <CategoryPercentage>{category.percentage}%</CategoryPercentage>
              </div>
            </CategoryItem>
          ))}
        </CategoryList>
      </AnalysisContainer>
    );
  };

  // Invoice Detail Popup
  const renderInvoiceDetailPopup = () => {
    if (!selectedInvoice) return null;

    return (
      <PopupOverlay isVisible={showInvoiceDetail} onClick={closeInvoiceDetail}>
        <PopupContainer onClick={(e) => e.stopPropagation()}>
          <PopupHeader>
            <PopupTitle>{selectedInvoice.title}</PopupTitle>
            <CloseButton onClick={closeInvoiceDetail}>×</CloseButton>
          </PopupHeader>
          <PopupContent>
            <DetailRow>
              <DetailLabel>Amount:</DetailLabel>
              <DetailValue>
                {formatCurrency(selectedInvoice.amount)}
              </DetailValue>
            </DetailRow>
            {selectedInvoice.vendor && (
              <DetailRow>
                <DetailLabel>Vendor:</DetailLabel>
                <DetailValue>{selectedInvoice.vendor}</DetailValue>
              </DetailRow>
            )}
            {selectedInvoice.category && (
              <DetailRow>
                <DetailLabel>Category:</DetailLabel>
                <DetailValue>{selectedInvoice.category}</DetailValue>
              </DetailRow>
            )}
            {selectedInvoice.date && (
              <DetailRow>
                <DetailLabel>Date:</DetailLabel>
                <DetailValue>{formatDate(selectedInvoice.date)}</DetailValue>
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <InvoiceStatus
                  isPaid={selectedInvoice.isPaid}
                  style={{ display: "inline-block" }}
                >
                  {selectedInvoice.isPaid ? "Paid" : "Unpaid"}
                </InvoiceStatus>
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Event:</DetailLabel>
              <DetailValue>{selectedInvoice.eventTitle}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Uploaded:</DetailLabel>
              <DetailValue>{formatDate(selectedInvoice.createdAt)}</DetailValue>
            </DetailRow>

            <PDFViewer>
              <PDFEmbed
                src={selectedInvoice.pdfUrl}
                title={`PDF: ${selectedInvoice.title}`}
              />
            </PDFViewer>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <ActionButton
                onClick={() => window.open(selectedInvoice.pdfUrl, "_blank")}
              >
                Open PDF in New Tab
              </ActionButton>
              <ActionButton
                onClick={() => navigate(`/events/${selectedInvoice.eventId}`)}
              >
                Go to Event
              </ActionButton>
            </div>
          </PopupContent>
        </PopupContainer>
      </PopupOverlay>
    );
  };

  // Add Invoice Popup
  const renderAddInvoicePopup = () => {
    return (
      <PopupOverlay isVisible={showAddInvoice} onClick={closeAddInvoicePopup}>
        <PopupContainer onClick={(e) => e.stopPropagation()}>
          <PopupHeader>
            <PopupTitle>Add New Invoice</PopupTitle>
            <CloseButton onClick={closeAddInvoicePopup}>×</CloseButton>
          </PopupHeader>
          <PopupContent>
            <FormGroup>
              <FormLabel htmlFor="eventId">Event</FormLabel>
              <FormSelect
                id="eventId"
                name="eventId"
                value={newInvoice.eventId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="title">Invoice Title</FormLabel>
              <FormInput
                id="title"
                name="title"
                value={newInvoice.title}
                onChange={handleInputChange}
                placeholder="Enter invoice title"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="vendor">Vendor (Optional)</FormLabel>
              <FormInput
                id="vendor"
                name="vendor"
                value={newInvoice.vendor}
                onChange={handleInputChange}
                placeholder="Enter vendor name"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="category">Category (Optional)</FormLabel>
              <FormInput
                id="category"
                name="category"
                value={newInvoice.category}
                onChange={handleInputChange}
                placeholder="Enter category"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="amount">Amount (Optional)</FormLabel>
              <FormInput
                id="amount"
                name="amount"
                type="number"
                value={newInvoice.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="0.01"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="date">Date</FormLabel>
              <FormInput
                id="date"
                name="date"
                type="date"
                value={newInvoice.date}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <FormInput
                  type="checkbox"
                  name="isPaid"
                  checked={newInvoice.isPaid}
                  onChange={handleInputChange}
                  style={{ width: "auto", marginRight: "8px" }}
                />
                <span>Mark as paid</span>
              </label>
            </FormGroup>

            <FormGroup>
              <FormLabel>Upload PDF</FormLabel>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: "none" }}
              />

              {!selectedFile ? (
                <FileUploadArea onClick={triggerFileInput}>
                  <FileUploadIcon>📄</FileUploadIcon>
                  <FileUploadText>Click to upload PDF</FileUploadText>
                  <FileUploadSubtext>
                    Only PDF files are accepted
                  </FileUploadSubtext>
                </FileUploadArea>
              ) : (
                <div>
                  <SelectedFileInfo>
                    <FileIcon>📄</FileIcon>
                    <FileName>{selectedFile.name}</FileName>
                    <RemoveFileButton onClick={removeSelectedFile}>
                      ×
                    </RemoveFileButton>
                  </SelectedFileInfo>
                </div>
              )}
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={closeAddInvoicePopup}>Cancel</CancelButton>
              <SubmitButton
                onClick={handleSubmitInvoice}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload Invoice"}
              </SubmitButton>
            </ButtonGroup>
          </PopupContent>
        </PopupContainer>
      </PopupOverlay>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <TopBar sectionTitle="Financials" />
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar sectionTitle="Financials" />
      <ContentWrapper>
        <Header>Financials</Header>

        <TabsContainer>
          <Tab
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Tab>
          <Tab
            active={activeTab === "invoices"}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </Tab>
          <Tab
            active={activeTab === "analysis"}
            onClick={() => setActiveTab("analysis")}
          >
            Analysis
          </Tab>
        </TabsContainer>

        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "invoices" && renderInvoicesTab()}
        {activeTab === "analysis" && renderAnalysisTab()}

        {renderInvoiceDetailPopup()}
        {renderAddInvoicePopup()}

        <AddButton onClick={openAddInvoicePopup} title="Add New Invoice" />
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Financials;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventDetail from "./components/EventDetail";
import EventForm from "./components/form/EventForm";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "./components/SideBar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import ScannerPage from "./components/ScannerPage";
import WelcomeScreen from "./components/WelcomeScreen";
import Events from "./components/Events";
import Dashboard from "./components/Dashboard";
import ChatbotPage from "./components/chatbot/ChatbotPage";
import PreembotButton from "./components/PreembotButton";
import useAuthSetup from "./useAuthSetup";

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Thin.ttf') format('truetype');
    font-weight: 100;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ThinItalic.ttf') format('truetype');
    font-weight: 100;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Light.ttf') format('truetype');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-LightItalic.ttf') format('truetype');
    font-weight: 300;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Italic.ttf') format('truetype');
    font-weight: 400;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-MediumItalic.ttf') format('truetype');
    font-weight: 500;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-SemiBold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-SemiBoldItalic.ttf') format('truetype');
    font-weight: 600;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-BoldItalic.ttf') format('truetype');
    font-weight: 700;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ExtraBold.ttf') format('truetype');
    font-weight: 800;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-ExtraBoldItalic.ttf') format('truetype');
    font-weight: 800;
    font-style: italic;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-Black.ttf') format('truetype');
    font-weight: 900;
    font-style: normal;
  }
  @font-face {
    font-family: 'Axiforma';
    src: url('/assets/fonts/Axiforma-BlackItalic.ttf') format('truetype');
    font-weight: 900;
    font-style: italic;
  }

  body {
    font-family: Axiforma, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #E9F0F2;
    color: #f5f5f5;
  }
`;

const AppWrapper = styled.div`
  display: flex;
`;

const ContentWrapper = styled.div`
  width: calc(100% - 250px);
  display: grid;
`;

const App: React.FC = () => {
  useAuthSetup();
  return (
    <Router>
      <GlobalStyle />
      <AppWrapper>
        <ProtectedRoute>
          <Sidebar />
        </ProtectedRoute>
        <ContentWrapper>
          {/* <PreembotButton /> */}
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />

            {/* Individual Event Page */}

            <Route path="/events/:id" element={<EventDetail />} />
            {/*Create New Event*/}
            <Route path="/events/create-new-event" element={<EventForm />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/preembot" element={<ChatbotPage />} />
          </Routes>
        </ContentWrapper>
      </AppWrapper>
    </Router>
  );
};

export default App;

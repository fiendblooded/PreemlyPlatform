import React from "react"; // Add this line
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import dotenv from "dotenv";
import { Auth0Provider } from "@auth0/auth0-react";
dotenv.config();
const domain = "dev-ye6rboqfch0cwuik.us.auth0.com";
const clientId = "V5rE0wHpT72anvpCAQ8B6IJ5NKvOiGTp";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

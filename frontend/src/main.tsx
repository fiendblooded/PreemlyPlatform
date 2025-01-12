import React from "react"; // Add this line
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
const domain = import.meta.env.VITE_APP_DOMAIN;
const clientId = import.meta.env.VITE_APP_CLIENTID;
const audience = import.meta.env.VITE_APP_AUDIENCE;

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
        audience: audience,
        scope: "read:events write:events offline_access",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const useAxiosWithAuth = () => {
  const { getAccessTokenSilently } = useAuth0();
  //const __dirname = window.location.origin;
  const axiosInstance = axios.create({
    baseURL: `http://localhost:5001/api`, // Your backend's base URL
  });
  const audience = "https://api.preemly.eu";
  const scopes = "read:events write:events offline_access";
  // Add a request interceptor to include the token
  axiosInstance.interceptors.request.use(async (config) => {
    console.log("I MA HERE");
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience, // Use your audience
          scope: scopes, // Add required scopes
        },
      });
      console.log("Token:", token); // Log the token if successfully fetched
      config.headers.Authorization = `Bearer ${token}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getAccessTokenSilently:", error.message); // Log the error message
    }
    return config;
  });

  return axiosInstance;
};

export default useAxiosWithAuth;

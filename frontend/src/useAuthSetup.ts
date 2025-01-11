import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const useAuthSetup = () => {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } =
    useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        try {
          await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://api.preemly.eu", // Your API
              scope: "read:events write:events",
            },
          });
          //console.log("Token fetched on page reload:", token);
        } catch (err) {
          console.error("Error fetching token silently:", err);
          // Redirect to login if the silent fetch fails
          await loginWithRedirect();
        }
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect]);
};

export default useAuthSetup;

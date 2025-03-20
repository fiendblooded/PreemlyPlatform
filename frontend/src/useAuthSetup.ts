import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const useAuthSetup = () => {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } =
    useAuth0();
  const audience = import.meta.env.VITE_APP_AUDIENCE;

  useEffect(() => {
    // Only run the token fetch if the user is authenticated
    if (!isAuthenticated) return;

    // Use a cached promise to prevent duplicate token requests
    let tokenPromise: Promise<string> | null = null;

    const fetchToken = async () => {
      try {
        // If we already have a promise in progress, use that one
        if (!tokenPromise) {
          tokenPromise = getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "read:events write:events",
            },
            // Auth0 SDK automatically caches tokens by default
          });
        }

        await tokenPromise;
        // Reset the promise once it's resolved
        tokenPromise = null;
      } catch (err) {
        console.error("Error fetching token silently:", err);
        // Reset the promise on error
        tokenPromise = null;
        // Redirect to login if the silent fetch fails
        await loginWithRedirect();
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect, audience]);
};

export default useAuthSetup;

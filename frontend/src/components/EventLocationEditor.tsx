import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { loadGoogleMapsScript } from "../common/common";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import { PrimaryButton } from "./EventDetail";

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 16px;
  width: calc(90% - 32px);
  margin: 20px auto;
`;
const InputAndButton = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const Title = styled.div`
  margin-bottom: 4px;
  color: black;
  font-weight: bold;
  font-size: 18px;
`;

const AddressInput = styled.input`
  width: calc(100% - 16px);
  font-family: Axiforma, sans-serif;
  flex: 1;
  border: 1.5px solid rgb(205, 205, 205);
  border-radius: 5px;
  background: transparent;
  font-size: 14px;
  height: 34px;

  color: #333;
  outline: none;
  margin-bottom: 10px;
  &::placeholder {
    color: #aaa;
  }
`;

const MapContainer = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`;

interface Event {
  _id: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    placeId?: string;
  };
}

const EventLocationEditor: React.FC<{ event: Event; refetch: () => void }> = ({
  event,
  refetch,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const axiosInstance = useAxiosWithAuth();
  const [location, setLocation] = useState({
    latitude: event.location.latitude || 37.7749, // Default to San Francisco
    longitude: event.location.longitude || -122.4194,
    address: event.location.address || "",
    placeId: event.location.placeId || "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const gmapsKey = import.meta.env.VITE_GOOGLE_MAPS_API;
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript(gmapsKey); // Ensure the script is loaded

        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 15,
        });

        const markerInstance = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: mapInstance,
          draggable: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        markerInstance.addListener("dragend", (event: any) => {
          const newLat = event.latLng?.lat() ?? 0;
          const newLng = event.latLng?.lng() ?? 0;

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: newLat, lng: newLng } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                setLocation({
                  latitude: newLat,
                  longitude: newLng,
                  address: results[0].formatted_address,
                  placeId: results[0].place_id || "",
                });
              } else {
                console.error("Geocoding failed: ", status);
              }
            }
          );
        });

        setMap(mapInstance);
        setMarker(markerInstance);
      } catch (error) {
        console.error("Failed to load Google Maps script:", error);
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!autocompleteRef.current || !map) return;

    const autocomplete = new google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        fields: ["formatted_address", "geometry", "place_id"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        const newAddress = place.formatted_address || "";
        const newPlaceId = place.place_id || "";

        setLocation({
          latitude: newLat,
          longitude: newLng,
          address: newAddress,
          placeId: newPlaceId,
        });

        if (marker) {
          marker.setPosition({ lat: newLat, lng: newLng });
        }

        if (map) {
          map.setCenter({ lat: newLat, lng: newLng });
        }
      }
    });
  }, [map, marker]);

  const handleSaveLocation = async () => {
    setIsUpdating(true);

    try {
      const response = await axiosInstance.put(`/events/${event._id}`, {
        ...event,
        location,
      });

      console.log("Location updated:", response.data);
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location.");
    } finally {
      setIsUpdating(false);
    }
    refetch();
  };

  return (
    <Container>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: "10px",
          display: "flex",
          alignItems: "end",
          lineHeight: "24px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.7 15C4.03377 15.6353 3 16.5205 3 17.4997C3 19.4329 7.02944 21 12 21C16.9706 21 21 19.4329 21 17.4997C21 16.5205 19.9662 15.6353 18.3 15M12 9H12.01M18 9C18 13.0637 13.5 15 12 18C10.5 15 6 13.0637 6 9C6 5.68629 8.68629 3 12 3C15.3137 3 18 5.68629 18 9ZM13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9Z"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div
          style={{ marginBottom: "-2px", marginLeft: "4px", color: "black" }}
        >
          Event location
        </div>
      </div>
      <InputAndButton>
        <AddressInput
          ref={autocompleteRef}
          type="text"
          placeholder="Search for a location..."
          defaultValue={location.address}
        />

        <PrimaryButton
          onClick={handleSaveLocation}
          disabled={
            isUpdating ||
            (event.location.latitude == location.latitude &&
              event.location.longitude == location.longitude)
          }
        >
          {isUpdating ? "Saving..." : "Save Location"}
        </PrimaryButton>
      </InputAndButton>

      <MapContainer ref={mapRef}></MapContainer>
    </Container>
  );
};

export default EventLocationEditor;

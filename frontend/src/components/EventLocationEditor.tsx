import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
  width: calc(70% - 32px);
  margin: 20px auto;
`;

const Title = styled.div`
  margin-bottom: 4px;
  color: black;
  font-weight: bold;
  font-size: 18px;
`;

const AddressInput = styled.input`
  width: 50%;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;

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

const EventLocationEditor: React.FC<{ event: Event }> = ({ event }) => {
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

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript("AIzaSyC-_-vvIQu7A1lP5ahPXkrv8gJVyyl_35c"); // Ensure the script is loaded

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

        markerInstance.addListener("dragend", (event) => {
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
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container>
      <Title>Event Location</Title>
      <AddressInput
        ref={autocompleteRef}
        type="text"
        placeholder="Search for a location..."
        defaultValue={location.address}
      />
      <MapContainer ref={mapRef}></MapContainer>
      <PrimaryButton onClick={handleSaveLocation} disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save Location"}
      </PrimaryButton>
    </Container>
  );
};

export default EventLocationEditor;

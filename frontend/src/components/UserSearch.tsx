import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";

interface UserSearchProps {
  onSelectUser?: (user: any) => void; // Optional callback when a user is selected
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const axiosInstance = useAxiosWithAuth();
  const suggestionsBoxRef = useRef<HTMLDivElement>(null); // Reference for detecting clicks outside
  const searchContainerRef = useRef<HTMLDivElement>(null); // Reference for positioning

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]); // Close suggestions if clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 1) {
      setLoadingSuggestions(true);
      try {
        const response = await axiosInstance.get(`/users?q=${value}`);
        setSuggestions(response.data.data.slice(0, 10)); // Limit to 10 suggestions
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const response = await axiosInstance.get(`/users?q=${searchQuery}`);
      setAllResults(response.data.data); // Fetch all matching results
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setAllResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <SearchContainer ref={searchContainerRef}>
      <SearchInputWrapper>
        <SearchInput
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Trigger search on "Enter" key
        />
        <ClearButton onClick={handleClear}>Clear</ClearButton>
        <SearchButton onClick={handleSearch} disabled={loadingSearch}>
          {loadingSearch ? "Searching ..." : "Search"}
        </SearchButton>
      </SearchInputWrapper>

      {suggestions.length > 0 && (
        <SuggestionsBox ref={suggestionsBoxRef}>
          {loadingSuggestions ? (
            <p>Loading suggestions...</p>
          ) : (
            suggestions.map((user) => (
              <SuggestionItem
                key={user.user_id}
                onClick={() => {
                  onSelectUser?.(user);
                  setSuggestions([]); // Close suggestions on selection
                }}
              >
                <SuggestionPicture src={user.picture} alt={user.name} />
                <SuggestionDetails>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </SuggestionDetails>
              </SuggestionItem>
            ))
          )}
        </SuggestionsBox>
      )}

      <SearchResults>
        {allResults.length > 0 ? (
          allResults.map((user) => (
            <SearchResultItem key={user.user_id}>
              <ResultPicture src={user.picture} alt={user.name} />
              <ResultDetails>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </ResultDetails>
            </SearchResultItem>
          ))
        ) : (
          <p>{searchQuery && !loadingSearch ? "No results found." : ""}</p>
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default UserSearch;

// Styled Components
const SearchContainer = styled.div`
  margin-top: 20px;
  position: relative; /* Ensures the SuggestionsBox is positioned relative to this container */
  color: black;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const ClearButton = styled.button`
  padding: 10px 20px;
  background-color: #eaeaea; /* Grey accent */
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #d6d6d6;
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background-color: #f0c808; /* Yellow accent */
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuggestionsBox = styled.div`
  position: absolute; /* Floats above the SearchResults */
  top: 50px; /* Adjusts below the input field */
  left: 0;
  right: 0;
  background-color: #f7f7f7; /* Light grey */
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10; /* Ensures it floats above other content */
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #eaeaea;
  }
`;

const SuggestionPicture = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const SuggestionDetails = styled.div`
  flex: 1;
  font-size: 14px;
`;

const SearchResults = styled.div`
  margin-top: 20px;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ResultPicture = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const ResultDetails = styled.div`
  flex: 1;
  font-size: 14px;
`;

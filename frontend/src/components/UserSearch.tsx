import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import useAxiosWithAuth from "./auth/useAxiosWithAuth";
import debounce from "lodash.debounce";

interface User {
  user_id: string;
  name: string;
  email: string;
  picture: string;
  role?: string;
  lastActive?: string;
}

interface UserSearchProps {
  onSelectUser?: (user: User) => void;
  placeholder?: string;
  maxSuggestions?: number;
  showResults?: boolean;
  allowClear?: boolean;
  className?: string;
  initialQuery?: string;
  filterUsers?: (user: User) => boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSelectUser,
  placeholder = "Search by name or email...",
  maxSuggestions = 5,
  showResults = true,
  allowClear = true,
  className,
  initialQuery = "",
  filterUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [allResults, setAllResults] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const axiosInstance = useAxiosWithAuth();
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 1) {
        setLoadingSuggestions(true);
        setNoResults(false);
        try {
          const response = await axiosInstance.get(`/users?q=${query}`);
          let filteredData = response.data.data;

          // Apply custom filter if provided
          if (filterUsers) {
            filteredData = filteredData.filter(filterUsers);
          }

          if (filteredData.length === 0) {
            setNoResults(true);
          }

          setSuggestions(filteredData.slice(0, maxSuggestions));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
          setNoResults(true);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setNoResults(false);
      }
    }, 300),
    [axiosInstance, maxSuggestions, filterUsers]
  );

  useEffect(() => {
    // Clean up debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    // Handle initial query if provided
    if (initialQuery) {
      debouncedSearch(initialQuery);
    }
  }, [initialQuery, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(event.target as Node) &&
        !searchContainerRef.current?.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setHasFocus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;

    setLoadingSearch(true);
    try {
      const response = await axiosInstance.get(`/users?q=${searchQuery}`);
      let filteredData = response.data.data;

      // Apply custom filter if provided
      if (filterUsers) {
        filteredData = filteredData.filter(filterUsers);
      }

      setAllResults(filteredData);
      setSuggestions([]);
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
    setNoResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle keyboard navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectUser(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser?.(user);
    setSuggestions([]);
    setSearchQuery(user.name);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SearchContainer ref={searchContainerRef} className={className}>
      <SearchInputWrapper hasFocus={hasFocus}>
        <SearchIcon>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setHasFocus(true)}
          autoComplete="off"
        />
        {searchQuery && allowClear && (
          <ClearButton
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ClearButton>
        )}
        <SearchButton
          onClick={handleSearch}
          disabled={loadingSearch || searchQuery.length < 2}
        >
          {loadingSearch ? <LoadingSpinner /> : "Search"}
        </SearchButton>
      </SearchInputWrapper>

      {suggestions.length > 0 && (
        <SuggestionsBox ref={suggestionsBoxRef}>
          {loadingSuggestions ? (
            <LoadingMessage>
              <LoadingSpinner size="small" />
              <span>Finding users...</span>
            </LoadingMessage>
          ) : (
            suggestions.map((user, index) => (
              <SuggestionItem
                key={user.user_id}
                onClick={() => handleSelectUser(user)}
                isSelected={index === selectedIndex}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <SuggestionPicture src={user.picture} alt={user.name} />
                <SuggestionDetails>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </SuggestionDetails>
                {user.role && <UserRole>{user.role}</UserRole>}
                {user.lastActive && (
                  <LastActive>{formatTimeAgo(user.lastActive)}</LastActive>
                )}
              </SuggestionItem>
            ))
          )}
        </SuggestionsBox>
      )}

      {noResults && searchQuery.length > 1 && (
        <SuggestionsBox ref={suggestionsBoxRef}>
          <NoResultsMessage>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>No users found matching "{searchQuery}"</span>
          </NoResultsMessage>
        </SuggestionsBox>
      )}

      {showResults && allResults.length > 0 && (
        <SearchResults>
          <ResultsHeader>
            <ResultsCount>
              {allResults.length} user{allResults.length !== 1 ? "s" : ""} found
            </ResultsCount>
            {allowClear && (
              <ClearResultsButton onClick={handleClear}>
                Clear results
              </ClearResultsButton>
            )}
          </ResultsHeader>
          <ResultsList>
            {allResults.map((user) => (
              <SearchResultItem
                key={user.user_id}
                onClick={() => onSelectUser?.(user)}
                clickable={!!onSelectUser}
              >
                <ResultPicture src={user.picture} alt={user.name} />
                <ResultDetails>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </ResultDetails>
                {user.role && <UserRole>{user.role}</UserRole>}
                {user.lastActive && (
                  <LastActive>{formatTimeAgo(user.lastActive)}</LastActive>
                )}
              </SearchResultItem>
            ))}
          </ResultsList>
        </SearchResults>
      )}
    </SearchContainer>
  );
};

export default UserSearch;

// Styled Components
const SearchContainer = styled.div`
  width: 100%;
  position: relative;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Axiforma", Roboto, Helvetica,
    Arial, sans-serif;
`;

const SearchInputWrapper = styled.div<{ hasFocus: boolean }>`
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid ${(props) => (props.hasFocus ? "#6b3ddf" : "#e0e0e0")};
  border-radius: 8px;
  padding: 0 8px;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.hasFocus ? "0 0 0 3px rgba(107, 61, 223, 0.1)" : "none"};

  &:hover {
    border-color: ${(props) => (props.hasFocus ? "#6b3ddf" : "#c0c0c0")};
  }
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  padding: 0 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 8px;
  border: none;
  font-size: 15px;
  background: transparent;
  outline: none;
  color: #333;

  &::placeholder {
    color: #9e9e9e;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #9e9e9e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    color: #757575;
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #6b3ddf;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  height: 36px;

  &:hover {
    background-color: #5a32c0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #b4a6e0;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div<{ size?: string }>`
  width: ${(props) => (props.size === "small" ? "16px" : "20px")};
  height: ${(props) => (props.size === "small" ? "16px" : "20px")};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SuggestionsBox = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 8px;
  max-height: 320px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  border: 1px solid #e0e0e0;

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c8c8c8 #f7f7f7;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c8c8c8;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f7f7f7;
  }
`;

const SuggestionItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  background-color: ${(props) =>
    props.isSelected ? "#f0ebff" : "transparent"};

  &:hover {
    background-color: #f0ebff;
  }
`;

const SuggestionPicture = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 1px solid #e0e0e0;
`;

const SuggestionDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #6b3ddf;
  background-color: #f0ebff;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  white-space: nowrap;
`;

const LastActive = styled.div`
  font-size: 12px;
  color: #9e9e9e;
  margin-left: 8px;
  white-space: nowrap;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #757575;
  gap: 8px;
`;

const NoResultsMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  color: #757575;
  gap: 8px;

  svg {
    color: #9e9e9e;
  }
`;

const SearchResults = styled.div`
  margin-top: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
`;

const ResultsCount = styled.div`
  font-weight: 500;
  color: #333;
`;

const ClearResultsButton = styled.button`
  background: none;
  border: none;
  color: #6b3ddf;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
  }
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c8c8c8 #f7f7f7;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c8c8c8;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f7f7f7;
  }
`;

const SearchResultItem = styled.div<{ clickable: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) =>
      props.clickable ? "#f9f7ff" : "transparent"};
  }
`;

const ResultPicture = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  border: 1px solid #e0e0e0;
`;

const ResultDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

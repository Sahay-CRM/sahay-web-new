/* eslint-disable @typescript-eslint/no-explicit-any */
import { debounce } from "lodash";
import { useCallback } from "react";

interface UseSearchInputProps {
  setPaginationFilter: any;
  setLocalSearch: any;
}

export default function useSearchInput({
  setPaginationFilter,
  setLocalSearch,
}: UseSearchInputProps) {
  // Debounced function to update pagination filter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _debounceSearchApiCall = useCallback(
    debounce((searchTerm: string) => {
      setPaginationFilter((prevState: any) => ({
        ...prevState,
        search: searchTerm,
        currentPage: 1, // Reset to the first page when the search changes
      }));
    }, 600),
    [setPaginationFilter],
  );

  // Handle search input changes
  const onSearchChange = useCallback(
    (event: any) => {
      setLocalSearch(event.target.value); // Update local search state
      _debounceSearchApiCall(event.target.value); // Trigger debounced API call
    },
    [_debounceSearchApiCall, setLocalSearch],
  );

  return {
    onSearchChange,
  };
}

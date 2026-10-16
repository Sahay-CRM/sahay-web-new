/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";

export default function useGetCompanyProjectSearchList(
  searchTerm: string,
  projectId?: string,
  enabled: boolean = true,
) {
  const debouncedSearch = useDebounce(searchTerm, 500);
  const normalizedProjectId = projectId || undefined;

  return useQuery({
    queryKey: ["get-company-project-search-list", debouncedSearch, normalizedProjectId],
    queryFn: async () => {
      const { data } = await Api.post<{ data: any }>({
        url: Urls.getCompanyProjectSearchList(),
        data: { search: debouncedSearch, projectId: normalizedProjectId },
      });
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

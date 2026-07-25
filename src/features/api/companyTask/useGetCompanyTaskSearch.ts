/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";



export default function useGetCompanyTaskSearch(
  searchTerm: string,
  planingtask?: boolean
) {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["get-company-task-search", debouncedSearch, planingtask],
    queryFn: async () => {
      const payload: { search: string; planingtask?: boolean } = {
        search: debouncedSearch || "",
      };
      if (planingtask !== undefined) {
        payload.planingtask = planingtask;
      }

      const { data } = await Api.post<{ data: any }>({
        url: Urls.getCompanyTaskSearch(),
        data: payload,
      });
      return data;
    },
  });
}

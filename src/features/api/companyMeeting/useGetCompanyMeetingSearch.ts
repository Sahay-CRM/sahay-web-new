/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";



export default function useGetCompanyMeetingSearch(
  searchTerm: string,
  detailMeetingStatus?: boolean
) {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["get-company-meeting-search", debouncedSearch, detailMeetingStatus],
    queryFn: async () => {
      const payload: { search: string; detailMeetingStatus?: boolean } = {
        search: debouncedSearch || "",
      };
      if (detailMeetingStatus !== undefined) {
        payload.detailMeetingStatus = detailMeetingStatus;
      }

      const { data } = await Api.post<{ data: any }>({
        url: Urls.getCompanyMeetingSearch(),
        data: payload,
      });
      return data;
    },
  });
}

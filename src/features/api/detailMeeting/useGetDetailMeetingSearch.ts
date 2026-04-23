import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";

export default function useGetDetailMeetingSearch(searchTerm: string) {
  const debouncedSearch = useDebounce(searchTerm, 500);

  return useQuery({
    queryKey: ["get-detail-meeting-search", debouncedSearch],
    queryFn: async () => {
      const { data } = await Api.post<{ data: MeetingSearchResponse[] }>({
        url: Urls.detailMeetingSearch(),
        data: { search: debouncedSearch },
      });
      return data;
    },
    enabled: debouncedSearch.trim().length >= 5,
  });
}

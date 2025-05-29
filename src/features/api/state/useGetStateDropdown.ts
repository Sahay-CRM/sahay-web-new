import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetStateDropdown(countryId?: string) {
  const query = useQuery({
    queryKey: ["get-state-dropdown", countryId],
    queryFn: async () => {
      const { data: resData } = await Api.post<StateResponse>({
        url: Urls.dropdownState(),
        data: { countryId: countryId || "" },
      });
      return resData;
    },
  });
  return query;
}

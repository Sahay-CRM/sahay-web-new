import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCityDropdown(stateId?: string) {
  const query = useQuery({
    queryKey: ["get-city-dropdown", stateId],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: CityData[] }>({
        url: Urls.dropdownCity(),
        data: { stateId: stateId || null },
      });
      return resData;
    },
  });

  return query;
}

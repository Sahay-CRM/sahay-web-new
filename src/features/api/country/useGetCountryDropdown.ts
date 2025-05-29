import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCountryDropdown() {
  const query = useQuery({
    queryKey: ["get-country-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<CountryResponse>({
        url: Urls.dropdownCountry(),
      });
      return resData;
    },
  });
  return query;
}

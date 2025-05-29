import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useGetCountry({ filter }: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-country-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<CountryResponse>({
        url: Urls.getCountryList(),
        data: {
          ...filter,
        },
      });
      return resData;
    },
    enabled: !!filter,
  });
  return query;
}

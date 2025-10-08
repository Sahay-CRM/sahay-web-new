import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type CountryProps = BaseResponse<Country>;

export default function useGetCountryDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-country-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<CountryProps>({
        url: Urls.dropdownCountry(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}

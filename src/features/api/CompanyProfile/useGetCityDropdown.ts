import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type CityRes = BaseResponse<CityData>;

export default function useGetCityDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-city-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<CityRes>({
        url: Urls.dropdownCity(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });

  return query;
}

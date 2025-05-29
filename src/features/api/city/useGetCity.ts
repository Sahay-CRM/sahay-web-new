import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

interface CityResponse {
  data: CityData[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
  hasMore: boolean;
  status: number;
}

export default function useGetCityList({
  filter,
}: {
  filter: PaginationFilter;
}) {
  const query = useQuery({
    queryKey: ["get-city-list", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<CityResponse>({
        url: Urls.getCityList(),
        data: filter,
      });

      return resData;
    },
    enabled: !!filter,
  });

  return query;
}

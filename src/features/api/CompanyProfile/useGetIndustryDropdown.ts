import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type IndustriesType = BaseResponse<IndustryOption>;

export default function useGetIndustryDropdown({
  filter,
  enable,
}: FilterDataProps) {
  const query = useQuery({
    queryKey: ["get-industry-dropdown", filter],
    queryFn: async () => {
      const { data: resData } = await Api.post<IndustriesType>({
        url: Urls.dropdownIndustry(),
        data: filter,
      });
      return resData;
    },
    enabled: !!enable || !!filter,
  });
  return query;
}

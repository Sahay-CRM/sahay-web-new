import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type BrandRes = BaseResponse<BrandData>;

export default function useGetBrand({ filter }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-brand-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<BrandRes>({
        url: Urls.getBrandList(),
        data: filter,
      });
      return data;
    },
    enabled: !!filter,
  });
}

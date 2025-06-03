import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

type ProductRes = BaseResponse<ProductData>;

export default function useGetProduct({ filter }: FilterDataProps) {
  return useQuery({
    queryKey: ["get-product-list", filter],
    queryFn: async () => {
      const { data } = await Api.post<ProductRes>({
        url: Urls.getProductList(),
        data: filter,
      });
      return data;
    },
    enabled: !!filter,
  });
}

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdProduct() {
  return useQuery({
    queryKey: ["get-product-dropdown"],
    queryFn: async () => {
      const { data } = await Api.post<{ data: ProductData }>({
        url: Urls.gelAllProduct(),
      });
      return data;
    },
  });
}

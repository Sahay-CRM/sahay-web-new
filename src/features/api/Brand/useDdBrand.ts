import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useQuery } from "@tanstack/react-query";

export default function useDdBrand() {
  return useQuery({
    queryKey: ["get-brand-dropdown"],
    queryFn: async () => {
      const { data: resData } = await Api.post<{ data: BrandData[] }>({
        url: Urls.gelAllBrand(),
      });
      return resData;
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type BrandRes = CommonResponse<BrandData>;

export default function useDeleteBrand() {
  const deleteBrandMutation = useMutation({
    mutationKey: ["delete-brand"],
    mutationFn: async (brandId: string) => {
      const { data: resData } = await Api.delete<BrandRes>({
        url: Urls.brandDeleteById(brandId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-brand-list"] });
      queryClient.resetQueries({ queryKey: ["get-brand-dropdown"] });
    },
  });

  return deleteBrandMutation;
}

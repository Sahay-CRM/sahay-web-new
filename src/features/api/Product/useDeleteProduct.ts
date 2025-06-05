import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type ProductRes = CommonResponse<ProductData>;

export default function useDeleteProduct() {
  const deleteProductMutation = useMutation({
    mutationKey: ["delete-product"],
    mutationFn: async (productId: string) => {
      const { data: resData } = await Api.delete<ProductRes>({
        url: Urls.productDeleteById(productId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-product-list"] });
      queryClient.resetQueries({ queryKey: ["get-product-dropdown"] });
    },
  });

  return deleteProductMutation;
}

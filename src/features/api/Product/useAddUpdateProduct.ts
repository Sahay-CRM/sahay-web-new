import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type ProductRes = CommonResponse<ProductData>;

export default function useAddUpdateProduct() {
  const productMutation = useMutation({
    mutationKey: ["add-update-product"],
    mutationFn: async (data: ProductData) => {
      const isUpdate = Boolean(data.productId);

      const config = {
        url: isUpdate ? Urls.updateProduct(data.productId!) : Urls.addProduct(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<ProductRes>(config)
        : await Api.post<ProductRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-product-list"] });
      queryClient.resetQueries({ queryKey: ["get-product-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return productMutation;
}

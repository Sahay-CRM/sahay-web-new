import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type BrandRes = CommonResponse<BrandData>;

export default function useAddUpdateBrand() {
  const brandMutation = useMutation({
    mutationKey: ["add-update-brand"],
    mutationFn: async (data: BrandData) => {
      const isUpdate = Boolean(data.brandId);

      const config = {
        url: isUpdate ? Urls.updateBrand(data.brandId!) : Urls.addBrand(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.put<BrandRes>(config)
        : await Api.post<BrandRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-brand-list"] });
      queryClient.resetQueries({ queryKey: ["get-brand-dropdown"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return brandMutation;
}

// hooks/useAddOrUpdateCounsultant.ts

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type ConRes = BaseResponse<SimpleCompanyDetails>;

export default function useAddCompany() {
  const addCompanyMutation = useMutation({
    mutationKey: ["add-or-update-company"],
    mutationFn: async (data: SimpleCompanyDetails) => {
      const { data: resData } = await Api.post<ConRes>({
        url: Urls.updateCompany(),
        data: data,
      });

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["companyDataGetById"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });

  return addCompanyMutation;
}

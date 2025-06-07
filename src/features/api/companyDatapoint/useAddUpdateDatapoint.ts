import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type DatePaging = BaseResponse<KPIFormDataProp>;

export default function useAddUpdateDataPoint() {
  const addUpdateCompanyDatapointMutation = useMutation({
    mutationKey: ["add-or-update-Datapoint-list"],
    mutationFn: async (data: KPIFormData) => {
      const isUpdate = Boolean(data.companykpimasterId);

      const config = {
        url: isUpdate
          ? Urls.updateCompanyDatapoint(data.companykpimasterId!)
          : Urls.addCompanyDatapoint(),
        data: data,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
      queryClient.resetQueries({ queryKey: ["get-datapoint-list-non-select"] });
      queryClient.resetQueries({ queryKey: ["get-kpi-by-id"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateCompanyDatapointMutation;
}

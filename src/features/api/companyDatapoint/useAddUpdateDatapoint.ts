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

      const payload = {
        dataPointName: data?.KPIMasterId?.KPILabel,
        KPIMasterId: data?.KPIMasterId?.KPIMasterId,
        coreParameterId: data?.coreParameterId?.coreParameterId,
        dataPointLabel: data?.KPIMasterId?.KPIName,
        productIds: data.productIds,
        assignUser: data.assignUser,
        validationType: data.validationType,
        frequencyType: data.frequencyType,
        unit: data.unit,
      };

      const config = {
        url: isUpdate
          ? Urls.updateCompanyDatapoint(data.companykpimasterId!)
          : Urls.addCompanyDatapoint(),
        data: payload,
      };

      const { data: resData } = isUpdate
        ? await Api.put<DatePaging>(config)
        : await Api.post<DatePaging>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-datapoint-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return addUpdateCompanyDatapointMutation;
}

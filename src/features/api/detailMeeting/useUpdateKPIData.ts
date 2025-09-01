import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type KpiUpdateData = {
  kpiId: string;
  startDate: string;
  endDate: string;
  data: string;
};

interface MeetingKpiData {
  data: KpiUpdateData[];
  ioId: string;
  ioType: string;
}

export default function useUpdateKPIData() {
  const updateKPIDataMutation = useMutation({
    mutationKey: ["add-or-update-kpi"],
    mutationFn: async (data: MeetingKpiData) => {
      const payload = {
        dataArray: data,
      };
      const config = {
        url: Urls.updateDetailMeetingKPIData(),
        data: payload,
      };
      const { data: resData } =
        await Api.post<CommonResponse<KpiUpdateData>>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Operation successful");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return updateKPIDataMutation;
}

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

type HolidayRes = CommonResponse<HolidaysDataProps>;

export default function useAddUpdateHoliday() {
  const holidayMutation = useMutation({
    mutationKey: ["add-update-holiday"],
    mutationFn: async (data: HolidaysDataProps) => {
      const isUpdate = Boolean(data.holidayId);

      const config = {
        url: isUpdate ? Urls.updateHoliday(data.holidayId!) : Urls.addHoliday(),
        data: data,
      };
      const { data: resData } = isUpdate
        ? await Api.post<HolidayRes>(config)
        : await Api.post<HolidayRes>(config);

      return resData;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Successful");
      queryClient.resetQueries({ queryKey: ["get-holiday-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return holidayMutation;
}

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";

type holidayRes = CommonResponse<HolidaysDataProps>;

export default function useDeleteHoliday() {
  const deleteHolidayMutation = useMutation({
    mutationKey: ["delete-holiday"],
    mutationFn: async (holidayId: string) => {
      const { data: resData } = await Api.post<holidayRes>({
        url: Urls.deleteHoliday(holidayId),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-holiday-list"] });
      queryClient.resetQueries({ queryKey: ["get-holiday-list-all"] });
    },
  });

  return deleteHolidayMutation;
}

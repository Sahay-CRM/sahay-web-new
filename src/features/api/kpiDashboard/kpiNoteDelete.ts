import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
type DatePaging = BaseResponse<CompanyMeetingDataProps>;

export default function useDeleteKpiNote() {
  const deleteKpiNoteMutation = useMutation({
    mutationKey: ["kpi-delete-note"],
    mutationFn: async (data: string) => {
      if (!data) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<DatePaging>({
        url: Urls.deleteKpiNote(data),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
      queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
    },
  });

  return deleteKpiNoteMutation;
}

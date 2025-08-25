import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

interface DeleteMeetingKpis {
  kpiId: string;
  meetingId: string;
  ioType: string;
  issueKPIId?: string;
  objectiveKPIId?: string;
  ioKPIId: string;
}

export default function useDeleteMeetingKpis() {
  const deleteMeetingKpisMutation = useMutation({
    mutationKey: ["delete-meeting-kpis"],
    mutationFn: async (data: DeleteMeetingKpis) => {
      if (!data.kpiId) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.post({
        url: Urls.deleteMeetingKpisData(),
        data: data,
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Meeting Kpis Deleted");
    },
  });

  return deleteMeetingKpisMutation;
}

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDeleteTeam() {
  return useMutation({
    mutationKey: ["delete-team"],
    mutationFn: async (id: string) => {
      const { data } = await Api.delete<CommonResponse<Team>>({
        url: Urls.teamDelete(id),
      });

      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["get-team-list"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete team");
    },
  });
}

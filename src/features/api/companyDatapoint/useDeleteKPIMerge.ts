import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";

export default function useDeleteKPIMerge() {
  const deleteKPIMergeMutation = useMutation({
    mutationKey: ["delete-kpi-merge"],
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("Something Went Wrong");
      }
      const { data: resData } = await Api.delete<{ message: string }>({
        url: Urls.deleteKPIMerge(id),
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Group KPI deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["kpi-list-dd-all"] });
      queryClient.invalidateQueries({ queryKey: ["get-all-kpi-merge"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete Group KPI");
    },
  });

  return deleteKPIMergeMutation;
}

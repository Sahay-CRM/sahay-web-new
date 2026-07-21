
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDeleteBlueprintGoal() {
  return useMutation({
    mutationFn: async (variables: { id: string; companyId: string }) => {
      return Api.delete({ url: Urls.companyBlueprintGoalDelete(variables.id) });
    },
    onSuccess: () => {
      toast.success("Subjective goal deleted successfully");
    },
      onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete subjective goal.");
    }
  });
}

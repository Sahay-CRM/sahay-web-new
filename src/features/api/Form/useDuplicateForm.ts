import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDuplicateForm() {
  const duplicateFormMutation = useMutation({
    mutationKey: ["duplicate-form"],
    mutationFn: async (id: string) => {
      const { data: resData } = await Api.post<FormResponse>({
        url: Urls.duplicateForm(id),
      });
      return resData;
    },
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || "Form duplicated successfully");
      } else {
        toast.error(response.message || "Failed to duplicate form");
      }
      queryClient.resetQueries({ queryKey: ["get-forms"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
  return duplicateFormMutation;
}

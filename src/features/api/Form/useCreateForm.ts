import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useCreateForm() {
  const createFormMutation = useMutation({
    mutationKey: ["create-form"],
    mutationFn: async (data: Partial<FormDetails>) => {
      const { data: resData } = await Api.post<FormResponse>({
        url: Urls.createForm(),
        data,
      });
      return resData;
    },
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || "Form created successfully");
      } else {
        toast.error(response.message || "Failed to create form");
      }
      queryClient.resetQueries({ queryKey: ["get-forms"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
  return createFormMutation;
}

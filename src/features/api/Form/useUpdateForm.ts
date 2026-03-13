import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { queryClient } from "@/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateForm() {
  const updateFormMutation = useMutation({
    mutationKey: ["update-form"],
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<FormDetails>;
    }) => {
      const { data: resData } = await Api.post<FormResponse>({
        url: Urls.updateForm(id),
        data,
      });
      return resData;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Operation successful");
      queryClient.resetQueries({ queryKey: ["get-forms"] });
      queryClient.resetQueries({ queryKey: ["get-form-by-id"] });
      queryClient.resetQueries({ queryKey: ["get-form"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
  return updateFormMutation;
}

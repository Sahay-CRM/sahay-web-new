
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useDeleteCoreValue() {
  return useMutation({
    mutationFn: async (variables: { id: string; companyId: string }) => {
      return Api.delete({ url: Urls.companyCoreValueDelete(variables.id) });
    },
    onSuccess: () => {
      toast.success("Core value removed successfully");
    },
       onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove core value.");
    }
  });
}

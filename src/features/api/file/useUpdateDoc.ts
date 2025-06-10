import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateDocs() {
  const docUploadMutation = useMutation({
    mutationKey: ["upload-docs"],
    mutationFn: async (formData: FormData) => {
      const { data: resData } = await Api.post({
        url: Urls.uploadDoc(),
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Files uploaded/removed successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "File operation failed");
    },
  });
  return docUploadMutation;
}

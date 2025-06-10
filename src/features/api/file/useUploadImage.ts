// hooks/useAddOrUpdateDepartment.ts

import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateImage() {
  const imageUploadMutation = useMutation({
    mutationKey: ["upload-image"],
    mutationFn: async (formData: FormData) => {
      const { data: resData } = await Api.post({
        url: Urls.uploadImage(), // Ensure this is the correct endpoint for image upload
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return resData;
    },
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message);
    },
  });
  return imageUploadMutation;
}

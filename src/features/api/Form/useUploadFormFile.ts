import Urls from "@/features/utils/urls.utils";
import { useMutation } from "@tanstack/react-query";

type UploadFormFilePayload = {
  file: File | Blob;
  fileName?: string;
  mobileNumber?: string;
  fileType: string;
  refId: string;
  token: string;
};

export default function useUploadFormFile() {
  const uploadFormFileMutation = useMutation({
    mutationKey: ["upload-form-file"],
    mutationFn: async (data: UploadFormFilePayload) => {
      const formData = new FormData();
      formData.append("fileType", data.fileType);
      formData.append("refId", data.refId);
      if (data.mobileNumber) {
        formData.append("mobileNumber", data.mobileNumber);
      }

      // Always use the 3-arg append to ensure binary upload
      const name =
        data.fileName ||
        (data.file instanceof File
          ? data.file.name
          : `upload-${Date.now()}.jpg`);
      formData.append("file", data.file, name);

      const response = await fetch(Urls.uploadFormImage(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to upload file");
      }
      return await response.json();
    },
  });
  return uploadFormFileMutation;
}

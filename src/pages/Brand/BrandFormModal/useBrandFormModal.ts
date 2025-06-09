import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { brandMutation } from "@/features/api/Brand";
import { imageUploadMutation } from "@/features/api/file";

export default function useBrandFormModal({
  modalClose,
  modalData,
}: BrandFormModalProps) {
  const { mutate: addBrand } = brandMutation();
  const { mutate: uploadImage } = imageUploadMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    values: modalData,
  });

  const onSubmit = handleSubmit(async (data) => {
    const finalData = data.brandId
      ? {
          brandId: data.brandId,
          brandName: data.brandName,
          brandDescription: data.brandDescription,
        }
      : {
          brandName: data.brandName,
          brandDescription: data.brandDescription,
        };

    addBrand(finalData, {
      onSuccess: (res) => {
        type BrandRes = { brandId?: string };
        const brandId =
          Array.isArray(res) && res.length > 0 && (res[0] as BrandRes).brandId
            ? (res[0] as BrandRes).brandId
            : data.brandId;

        const uploadIfPresent = (
          file: File | string | null | undefined,
          fileType: string,
        ) => {
          if (
            file &&
            ((typeof file === "string" && file.startsWith("data:")) ||
              (typeof File !== "undefined" && file instanceof File))
          ) {
            const formData = new FormData();
            formData.append("refId", brandId || "");
            formData.append("fileType", fileType);
            formData.append("isMaster", "1");
            formData.append("isUpdate", "1");
            if (typeof file === "string" && file.startsWith("data:")) {
              const arr = file.split(",");
              const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              formData.append(
                "file",
                new Blob([u8arr], { type: mime }),
                "file.png",
              );
            } else {
              formData.append("file", file as File);
            }
            uploadImage(formData);
          }
        };

        uploadIfPresent(data.brandLogo, "2050");

        handleModalClose();
      },
    });
  });

  const handleModalClose = () => {
    reset();
    modalClose();
  };

  useEffect(() => {
    reset(modalData);
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    watch,
    handleModalClose,
    setValue,
  };
}

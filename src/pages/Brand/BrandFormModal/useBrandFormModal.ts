import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { brandMutation } from "@/features/api/Brand";

export default function useBrandFormModal({
  modalClose,
  modalData,
}: BrandFormModalProps) {
  const { mutate: addBrand } = brandMutation();
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
    addBrand(data, {
      onSuccess: () => {
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

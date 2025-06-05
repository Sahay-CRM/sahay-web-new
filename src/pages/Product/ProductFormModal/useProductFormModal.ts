import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { productMutation } from "@/features/api/Product";
import { useDdBrand } from "@/features/api/Brand";

export default function useProductFormModal({
  modalClose,
  modalData,
}: ProductFormModalProps) {
  const { mutate: addProduct } = productMutation();
  const { data: brandData } = useDdBrand();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm({
    values: modalData,
  });

  const brandOptions = (brandData?.data ?? []).map((item) => ({
    label: item.brandName,
    value: item.brandId,
  }));

  const onSubmit = handleSubmit(async (data) => {
    addProduct(data, {
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
    control,
    brandOptions,
  };
}

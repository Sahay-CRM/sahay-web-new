import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface UseDesignationFormModalProps {
  modalClose: () => void;
  modalData?: DesignationData;
}

export default function useDesignationFormModal({
  modalClose,
  modalData,
}: UseDesignationFormModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: modalData,
  });

  const departmentData = [
    { label: "Marketing", value: "marketing-id" },
    { label: "Sales", value: "sales-id" },
    { label: "Engineering", value: "engineering-id" },
    { label: "HR", value: "hr-id" },
  ];

  const onSubmit = handleSubmit(async () => {
    // Add submission logic here
    reset();
    handleModalClose();
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
    handleModalClose,
    departmentData,
  };
}

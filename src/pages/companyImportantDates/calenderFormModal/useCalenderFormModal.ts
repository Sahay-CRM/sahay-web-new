import { useForm } from "react-hook-form";

// import { teamMutation } from "@/share/data/hooks/marketing";

// import usePermissionFromLocation from "@/share/data/hooks/userPermissionFromLocation";
import { useEffect } from "react";

interface UseFormModalProps {
  modalClose: () => void;
  modalData: ImportantDatesDataProps;
}

export default function useCalenderFormModal({
  modalClose,
  modalData,
}: UseFormModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: modalData,
  });

  const onSubmit = handleSubmit(async () => {
    // addDepartment(data, {
    //   onSuccess: () => {
    //     handleModalClose();
    //   },
    // });
  });

  const handleModalClose = () => {
    reset(); // Reset the form data when modal is closed
    modalClose(); // Close the modal
  };

  useEffect(() => {
    reset(modalData); // Sync form data with modalData when it changes
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    handleModalClose,
  };
}

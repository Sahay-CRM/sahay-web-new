import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface UseTeamFormModalProps {
  modalClose: () => void;
  modalData: UpdateState | undefined;
}

export default function useStateFormModal({
  modalClose,
  modalData,
}: UseTeamFormModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: modalData, // Use defaultValues instead of `values`
  });

  const onSubmit = handleSubmit(async () => {
    // try {
    //   addUpdateTeam(data);
    //   // Close the modal after successful submission
    //   reset();
    //   handleModalClose();
    // } catch (error) {
    // console.error("Error while adding or updating team:", error);
    // }
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
    // currentPagePermission,
    onSubmit,
    handleModalClose,
  };
}

import { useForm } from "react-hook-form";

// import { teamMutation } from "@/share/data/hooks/marketing";

// import usePermissionFromLocation from "@/share/data/hooks/userPermissionFromLocation";
import { useEffect } from "react";

interface UseTeamFormModalProps {
  modalClose: () => void; // Explicitly type the modalClose function
  modalData: DepartmentDataProps; // You can replace `any` with a more specific type if available
}

export default function useDepartmentFormModal({
  modalClose,
  modalData,
}: UseTeamFormModalProps) {
  //   const currentPagePermission = usePermissionFromLocation("team");

  //   const { mutate: addUpdateTeam } = teamMutation();

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
    onSubmit,
    handleModalClose,
  };
}

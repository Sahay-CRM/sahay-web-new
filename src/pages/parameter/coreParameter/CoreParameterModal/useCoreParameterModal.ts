import { useForm } from "react-hook-form";

// import { teamMutation } from "@/share/data/hooks/marketing";

// import usePermissionFromLocation from "@/share/data/hooks/userPermissionFromLocation";
import { useEffect } from "react";

interface UseTeamFormModalProps {
  modalClose: () => void; // Explicitly type the modalClose function
  modalData: CoreParameterDataProps; // You can replace `any` with a more specific type if available
}

export default function useCoreParameterModal({
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
  const departmentOptions = [
    {
      value: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
      label: "Marketing",
    },
    {
      value: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
      label: "Human Resource",
    },
    {
      value: "4f90a02c-e13b-40c2-b107-eae066042f96",
      label: "Finance",
    },
    {
      value: "5c822d88-73ac-445c-8de9-f84a29e715d5",
      label: "Sales",
    },
    {
      value: "98dbd98c-4948-46b4-86e5-8c90cd676bfb",
      label: "Accounts",
    },
    {
      value: "6f08fd23-1307-4fc4-9032-284765457b7c",
      label: "Business Development",
    },
    {
      value: "15870c8e-c42a-46ab-8d37-75a9c33130fb",
      label: "Production",
    },
    {
      value: "2b94eceb-2ff0-4e36-9a29-cf224bdd45b3",
      label: "Operations",
    },
    {
      value: "431f6977-508d-42e4-a891-1ad61f95f81a",
      label: "Supply Chain",
    },
    {
      value: "11c37a34-86c1-4591-96ce-9ad2697d443c",
      label: "Branding & Public Relations",
    },
    {
      value: "e77a36a6-274e-4b3c-882c-1eaa157a646c",
      label: "Technology",
    },
  ];
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
    departmentOptions,
  };
}

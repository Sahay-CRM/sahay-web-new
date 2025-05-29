import { useForm } from "react-hook-form";

// import { teamMutation } from "@/share/data/hooks/marketing";

// import usePermissionFromLocation from "@/share/data/hooks/userPermissionFromLocation";
import { useEffect } from "react";
import { addCountryMutation } from "@/features/api/country";

interface UseCountryFormModalProps {
  modalClose: () => void; // Explicitly type the modalClose function
  modalData: CountryData; // You can replace any with a more specific type if available
}

export default function useCountryFormModal({
  modalClose,
  modalData,
}: UseCountryFormModalProps) {
  const { mutate: addCountry } = addCountryMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: modalData,
  });

  const onSubmit = handleSubmit(async (data) => {
    addCountry(data, {
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
    handleModalClose,
  };
}

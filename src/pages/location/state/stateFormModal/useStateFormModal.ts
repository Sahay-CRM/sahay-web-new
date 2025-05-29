import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { addStateMutation } from "@/features/api/state";
import { useGetCountryDropdown } from "@/features/api/country";

interface UseStateFormModalProps {
  modalClose: () => void;
  modalData: StateData | undefined;
}

export default function useStateFormModal({
  modalClose,
  modalData,
}: UseStateFormModalProps) {
  const { mutate: addState } = addStateMutation();
  const methods = useFormContext<StateData>();
  const {
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = methods;

  const { data: countryList } = useGetCountryDropdown();
  
  const countryOptions = [
    {
      label: "Please select country",
      value: "",
      disabled: true,
    },
    ...(countryList?.data ?? []).map((item) => ({
      label: item.countryName,
      value: item.countryId,
    })),
  ];

  const onSubmit = handleSubmit((data) => {
    
    addState(data, {
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
    countryOptions,
    register,
    errors,
    onSubmit,
    handleModalClose,
    control,
  };
}

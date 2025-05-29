import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { addCityMutation } from "@/features/api/city";
import useGetStateDropdown from "@/features/api/state/useGetStateDropdown";
import { useGetCountryDropdown } from "@/features/api/country";

interface UseCityFormModalProps {
  modalClose: () => void;
  modalData: CityData | undefined;
}

export default function useCityFormModal({
  modalClose,
  modalData,
}: UseCityFormModalProps) {
  const { mutate: addCity } = addCityMutation();

  const {
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
    watch,
  } = useForm({
    values: modalData,
  });

  const countryId = watch("countryId");

  const { data: country } = useGetCountryDropdown();
  const { data: stateList } = useGetStateDropdown(countryId);

  const countryOptions = [
    {
      label: "Please select country",
      value: "",
      disabled: true,
    },
    ...(country?.data ?? []).map((item) => ({
      label: item.countryName,
      value: item.countryId,
    })),
  ];
  
  const stateOptions = [
    {
      label: "Please select State",
      value: "",
      disabled: true,
    },
    ...(stateList?.data ?? []).map((item) => ({
      label: item.stateName,
      value: item.stateId,
    })),
  ];

  const onSubmit = handleSubmit((data) => {
    addCity(data, {
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
    stateOptions,
    register,
    errors,
    onSubmit,
    handleModalClose,
    control,
    countryOptions,
    countryId
  };
}

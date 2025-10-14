import { holidayMutation } from "@/features/api/Holiday";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function useAddHolidaysForm({
  modalClose,
  modalData,
}: AddHolidaysFormModalProps) {
  const { mutate: addHoliday, isPending } = holidayMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control,
  } = useForm({
    values: modalData,
  });

  const onSubmit = handleSubmit(async (data) => {
    const payload = modalData?.holidayId
      ? {
          holidayId: modalData.holidayId,
          holidayName: data.holidayName,
          holidayDate: data.holidayDate,
        }
      : {
          holidayName: data.holidayName,
          holidayDate: data.holidayDate,
        };

    addHoliday(payload, {
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
    control,
    isPending,
  };
}

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { addUpdateObjective } from "@/features/api/Objective";

export default function useObjectiveFormModal({
  modalClose,
  modalData,
}: UseObjectiveFormModalProps) {
  const { mutate: addObjective, isPending } = addUpdateObjective();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    values: modalData,
  });

  const onSubmit = handleSubmit((data) => {
    const payload = modalData?.objectiveId
      ? {
          objectiveId: modalData.objectiveId,
          objectiveName: data.objectiveName,
        }
      : {
          objectiveName: data.objectiveName,
        };

    addObjective(payload, {
      onSuccess: () => {
        handleModalClose();
        modalClose();
      },
    });
  });

  const handleModalClose = () => {
    modalClose();
    reset();
  };

  useEffect(() => {
    reset(modalData);
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    control,
    handleModalClose,
    isPending,
  };
}

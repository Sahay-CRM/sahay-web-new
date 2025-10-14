import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { addUpdateObjective } from "@/features/api/Objective";
import { getALLDepartmentList } from "@/features/api/department";

export default function useObjectiveFormModal({
  modalClose,
  modalData,
}: UseObjectiveFormModalProps) {
  const [isDepartmentSearch, setIsDepartmentSearch] = useState("");

  const { mutate: addObjective, isPending } = addUpdateObjective();

  const { data: departmentData } = getALLDepartmentList({
    filter: {
      search: isDepartmentSearch.length >= 3 ? isDepartmentSearch : undefined,
    },
    enable: isDepartmentSearch.length >= 3,
  });

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
          ...(data.departmentId && { departmentId: data.departmentId }),
        }
      : {
          objectiveName: data.objectiveName,
          ...(data.departmentId && { departmentId: data.departmentId }),
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

  const departmentOptions = [
    ...(
      (departmentData?.data ?? []) as Array<{
        departmentName: string;
        departmentId: string;
      }>
    ).map((item) => ({
      label: item.departmentName,
      value: item.departmentId,
    })),
  ];

  return {
    register,
    errors,
    onSubmit,
    control,
    handleModalClose,
    isPending,
    departmentOptions,
    setIsDepartmentSearch,
  };
}

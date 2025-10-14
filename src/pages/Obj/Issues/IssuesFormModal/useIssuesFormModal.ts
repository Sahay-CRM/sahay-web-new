import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { addUpdateIssues } from "@/features/api/Issues";
import { getALLDepartmentList } from "@/features/api/department";

export default function useIssueFormModal({
  modalClose,
  modalData,
}: UseIssuesFormModalProps) {
  const [isDepartmentSearch, setIsDepartmentSearch] = useState("");

  const { mutate: addIssue, isPending } = addUpdateIssues();

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
    const payload = modalData?.issueId
      ? {
          issueId: modalData.issueId,
          issueName: data.issueName,
          ...(data.departmentId && { departmentId: data.departmentId }),
        }
      : {
          issueName: data.issueName,
          ...(data.departmentId && { departmentId: data.departmentId }),
        };

    addIssue(payload, {
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

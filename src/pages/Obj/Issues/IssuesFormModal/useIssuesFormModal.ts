import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { addUpdateIssues } from "@/features/api/Issues";

export default function useIssueFormModal({
  modalClose,
  modalData,
}: UseIssuesFormModalProps) {
  const { mutate: addIssue, isPending } = addUpdateIssues();

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
        }
      : {
          issueName: data.issueName,
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

  return {
    register,
    errors,
    onSubmit,
    control,
    handleModalClose,
    isPending,
  };
}

import { useForm } from "react-hook-form";

// import { teamMutation } from "@/share/data/hooks/marketing";

// import usePermissionFromLocation from "@/share/data/hooks/userPermissionFromLocation";
import { useEffect } from "react";
import { addUpdateImportantDateMutation } from "@/features/api/importantDates";

interface UseFormModalProps {
  modalClose: () => void;
  modalData: ImportantDatesDataProps;
}

// Helper function to convert ISO date to YYYY-MM-DD format
const isoToDisplayDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return "";
  return new Date(isoDate).toISOString().split("T")[0];
};

// Helper function to convert YYYY-MM-DD to ISO format
const displayDateToIso = (displayDate: string): string => {
  if (!displayDate) return "";
  return new Date(displayDate + "T00:00:00.000Z").toISOString();
};

export default function useCalenderFormModal({
  modalClose,
  modalData,
}: UseFormModalProps) {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<ImportantDatesDataProps>({
    defaultValues: {
      ...modalData,
      importantDate: modalData?.importantDate
        ? isoToDisplayDate(modalData.importantDate)
        : "",
      color: modalData?.color ? String(modalData.color) : "#aabbcc",
    },
  });

  const { mutate: addImportantDate } = addUpdateImportantDateMutation();
  const onSubmit = handleSubmit(async (data) => {
    // Validate date field manually since react-datepicker doesn't use register
    if (!data.importantDate) {
      setError("importantDate", {
        type: "required",
        message: "Select a important date",
      });
      return;
    }

    clearErrors("importantDate");

    // Convert display date back to ISO format before sending to API
    const submitData = {
      ...data,
      importantDate: displayDateToIso(data.importantDate),
    };

    addImportantDate(submitData, {
      onSuccess: () => {
        handleModalClose();
      },
    });
  });

  const handleModalClose = () => {
    reset(); // Reset the form data when modal is closed
    modalClose(); // Close the modal
  };

  useEffect(() => {
    const formattedData = {
      ...modalData,
      importantDate: modalData?.importantDate
        ? isoToDisplayDate(modalData.importantDate)
        : "",
      color: modalData?.color ? String(modalData.color) : "#aabbcc",
    };
    reset(formattedData);
  }, [modalData, reset]);

  return {
    register,
    errors,
    onSubmit,
    handleModalClose,
    watch,
    setValue,
    control,
  };
}

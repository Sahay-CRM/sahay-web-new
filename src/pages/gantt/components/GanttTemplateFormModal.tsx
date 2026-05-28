import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { getUserDetail } from "@/features/selectors/auth.selector";
import {
  useCreateGanttTemplate,
  useUpdateGanttTemplate,
} from "@/features/api/gantt";
import useGetCompanyId from "@/features/api/CompanyProfile/useGetCompanyId";
import type { GanttTemplate } from "@/types/gantt";

interface GanttTemplateFormProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSuccess?: () => void;
  editData?: GanttTemplate | null;
}

export default function GanttTemplateFormModal({
  isModalOpen,
  modalClose,
  onSuccess,
  editData,
}: GanttTemplateFormProps) {
  const methods = useForm({
    defaultValues: {
      templateName: "",
      templateDescription: "",
    },
  });

  const userData = useSelector(getUserDetail);
  const { data: companyData } = useGetCompanyId();

  const createMutation = useCreateGanttTemplate();
  const updateMutation = useUpdateGanttTemplate();

  // Pre-populate form on edit
  useEffect(() => {
    if (editData) {
      methods.reset({
        templateName: editData.templateName || "",
        templateDescription: editData.templateDescription || "",
      });
    } else {
      methods.reset({
        templateName: "",
        templateDescription: "",
      });
    }
  }, [editData, isModalOpen, methods]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    // Silently pick up company & industry ids from store / company profile
    const companyId = userData?.companyId ?? "";
    const industryId =
      companyData?.Industry?.industryId ?? companyData?.industryId ?? null;

    try {
      if (editData) {
        await updateMutation.mutateAsync({
          id: editData.ganttTemplateId,
          payload: {
            templateName: values.templateName,
            templateDescription: values.templateDescription || undefined,
            ownerType: "COMPANY",
            industryId,
          },
        });
      } else {
        await createMutation.mutateAsync({
          templateName: values.templateName,
          templateDescription: values.templateDescription || undefined,
          ownerType: "COMPANY",
          industryId,
          companyId,
        });
      }
      methods.reset();
      modalClose();
      onSuccess?.();
    } catch {
      // errors handled by mutations
    }
  });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={editData ? "Edit Gantt Template" : "Add Gantt Template"}
        modalClose={() => {
          methods.reset();
          modalClose();
        }}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: handleSubmit,
            isLoading: editData
              ? updateMutation.isPending
              : createMutation.isPending,
          },
        ]}
      >
        <div className="space-y-4">
          <Controller
            name="templateName"
            control={methods.control}
            rules={{ required: "Template name is required" }}
            render={({ field, fieldState }) => (
              <FormInputField
                {...field}
                label="Template Name"
                placeholder="e.g. Standard Solar Installation"
                isMandatory
                error={fieldState.error}
              />
            )}
          />

          <Controller
            name="templateDescription"
            control={methods.control}
            render={({ field }) => (
              <FormInputField
                {...field}
                label="Description"
                placeholder="Brief description of when to use this template"
              />
            )}
          />
        </div>
      </ModalData>
    </FormProvider>
  );
}

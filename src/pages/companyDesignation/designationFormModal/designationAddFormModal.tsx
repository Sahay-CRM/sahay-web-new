import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormSelect from "@/components/shared/Form/FormSelect/selectuser";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import {
  useDesignationFormModalOptions,
  useDesignationDropdownOptions,
  useDesignationFormSubmit,
} from "./useDesignationFormModal";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

function DesignationAddFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: DesignationAddFormProps) {
  // Use form with default values from modalData, and add isParentDesignation
  const methods = useForm<DesignationData & { isParentDesignation?: boolean }>({
    defaultValues: {
      ...modalData,
      isParentDesignation: Boolean(modalData?.parentId),
    },
  });
  const { DepartmentOptions } = useDesignationFormModalOptions();
  const departmentId = methods.watch("departmentId");
  const { designationOptions } = useDesignationDropdownOptions(departmentId);

  // Get handleSubmit and loading state
  const { handleSubmit: submitHandler, isLoading } = useDesignationFormSubmit(
    () => {
      methods.reset();
      modalClose();
    },
  );

  // Filter out the current designation from parent options if editing
  const filteredDesignationOptions = useMemo(() => {
    if (!modalData?.designationId) return designationOptions;
    return designationOptions.filter(
      (item) => item.value !== modalData.designationId,
    );
  }, [designationOptions, modalData?.designationId]);

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={
          modalData?.designationId ? "Edit Designation" : "Add Designation"
        }
        modalClose={() => {
          methods.reset();
          modalClose();
        }}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: methods.handleSubmit(submitHandler),
            isLoading, // Pass loading state here
          },
        ]}
      >
        <div className="space-y-4">
          <Controller
            name="departmentId"
            control={methods.control}
            rules={{ required: "Department is required" }}
            render={({ field, fieldState }) => (
              <SearchDropdown
                options={DepartmentOptions}
                selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                onSelect={(value) => {
                  field.onChange(value.value);
                }}
                {...field}
                label="Department"
                placeholder="Select an Department..."
                error={fieldState.error}
                isMandatory={true}
              />
            )}
          />

          <div>
            <FormInputField
              id="designationName"
              {...methods.register("designationName", {
                required: "Enter Designation Name",
              })}
              error={methods.formState.errors.designationName}
              label="Designation Name"
              placeholder={"Enter Designation Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex flex-col items-start space-y-2">
              <Label className="text-md" htmlFor="designationSwitch">
                Is Parent Designation
              </Label>
              <Controller
                name="isParentDesignation"
                control={methods.control}
                defaultValue={Boolean(modalData?.parentId)}
                render={({ field }) => (
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Show this only if switch is ON */}
          {methods.watch("isParentDesignation") && (
            <div className="mt-4">
              <Controller
                name="parentId"
                control={methods.control}
                rules={{
                  required: {
                    value: true,
                    message: "Parent Designation is required",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormSelect
                    {...field}
                    value={field.value ?? ""}
                    label="Parent Designation"
                    options={filteredDesignationOptions}
                    error={fieldState.error}
                    isMandatory={true}
                  />
                )}
              />
            </div>
          )}
        </div>
      </ModalData>
    </FormProvider>
  );
}

export default DesignationAddFormModal;

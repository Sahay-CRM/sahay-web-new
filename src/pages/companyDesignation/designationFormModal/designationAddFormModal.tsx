import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import {
  useDesignationFormModalOptions,
  useDesignationDropdownOptions,
  useDesignationFormSubmit,
} from "./useDesignationFormModal";
import { useMemo } from "react";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";

function DesignationAddFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: DesignationAddFormProps) {
  const methods = useForm<DesignationData & { isParentDesignation?: boolean }>({
    defaultValues: {
      ...modalData,
      isParentDesignation: Boolean(modalData?.parentId),
    },
  });
  const { DepartmentOptions, setIsDepartmentSearch } =
    useDesignationFormModalOptions();
  const departmentId = methods.watch("departmentId");
  const { designationOptions, setIsParentDesSearch } =
    useDesignationDropdownOptions(departmentId);

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
                onSearchChange={setIsDepartmentSearch}
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
          <div className="flex flex-row items-center gap-6 mt-2">
            <Controller
              name="isParentDesignation"
              control={methods.control}
              defaultValue={Boolean(modalData?.parentId)}
              render={({ field }) => (
                <FormCheckbox
                  id="designationCheckbox"
                  label="Has Parent Designation?"
                  checked={!!field.value}
                  onChange={field.onChange}
                  className="w-5 h-5"
                  labelClass="text-md font-medium"
                />
              )}
            />
            <Controller
              name="isOwner"
              control={methods.control}
              render={({ field }) => (
                <FormCheckbox
                  id="ownerCheckbox"
                  label="Owner Designation?"
                  checked={!!field.value}
                  onChange={field.onChange}
                  className="w-5 h-5"
                  labelClass="text-md font-medium"
                />
              )}
            />
          </div>

          {/* Show this only if switch is ON */}
          {methods.watch("isParentDesignation") && (
            <div className="mt-4">
              {/* <Controller
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
              /> */}
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
                  <SearchDropdown
                    {...field}
                    label="Parent Designation"
                    options={filteredDesignationOptions}
                    error={fieldState.error}
                    isMandatory={true}
                    selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                    onSelect={(value) => {
                      field.onChange(value.value);
                    }}
                    placeholder="Select an Parent Designation..."
                    onSearchChange={setIsParentDesSearch}
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

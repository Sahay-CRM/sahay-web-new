import { Controller } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useObjectivesFormModal from "./useObjectiveFormModal";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormSelect from "@/components/shared/Form/FormSelect";

export default function ObjectiveFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: UseObjectiveFormModalProps) {
  const {
    register,
    errors,
    onSubmit,
    handleModalClose,
    isPending,
    departmentOptions,
    setIsDepartmentSearch,
    control,
  } = useObjectivesFormModal({
    isModalOpen,
    modalClose,
    modalData,
  });

  const typeOptions = [
    { label: "RESOLVED", value: "RESOLVED" },
    { label: "UNRESOLVED", value: "UNRESOLVED" },
  ];

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData?.objectiveId ? "Edit Objective" : "Add Objective"}
      modalClose={handleModalClose}
      buttons={[
        {
          btnText: "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: onSubmit,
          isLoading: isPending,
        },
      ]}
    >
      <div className="space-y-4">
        <div>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <SearchDropdown
                options={departmentOptions}
                selectedValues={field.value ? [field.value] : []}
                onSelect={(value) => {
                  field.onChange(value.value);
                }}
                {...field}
                label="Department"
                placeholder="Select an Department..."
                error={errors.departmentId}
                onSearchChange={setIsDepartmentSearch}
              />
            )}
          />
        </div>
        <div>
          <FormInputField
            id="objectiveName"
            {...register("objectiveName", {
              required: "Enter Objective",
            })}
            error={errors.objectiveName}
            label="Objective Name"
            placeholder={"Enter Objective"}
            containerClass="mt-0 tb:mt-0"
            className="text-lg"
            isMandatory={true}
          />
        </div>
        <div>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Select Type"
                value={field.value ?? undefined}
                onChange={field.onChange}
                options={typeOptions}
                error={errors.type}
                placeholder="Select Type"
                isMandatory
              />
            )}
          />
        </div>
      </div>
    </ModalData>
  );
}

import { Controller } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useIssuesFormModal from "./useIssuesFormModal";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

export default function IssueFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: UseIssuesFormModalProps) {
  // const methods = useForm();
  const {
    register,
    errors,
    onSubmit,
    handleModalClose,
    isPending,
    departmentOptions,
    setIsDepartmentSearch,
    control,
  } = useIssuesFormModal({
    isModalOpen,
    modalClose,
    modalData,
  });

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle={modalData?.issueId ? "Edit Issues" : "Add Issues"}
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
            id="issueName"
            {...register("issueName", {
              required: "Enter Issue",
            })}
            error={errors.issueName}
            label="Issue Name"
            placeholder={"Enter Issue"}
            containerClass="mt-0 tb:mt-0"
            className="text-lg"
            isMandatory={true}
          />
        </div>
      </div>
    </ModalData>
  );
}

import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormSelect from "@/components/shared/Form/FormSelect/selectuser";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useDesignationFormModal from "./useDesignationFormModal";

function DesignationAddFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: DesignationAddFormProps) {
  const methods = useForm();
  const { register, errors, departmentData, onSubmit, handleModalClose } =
    useDesignationFormModal({
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={
          modalData?.designationId ? "Edit Designation" : "Add Designation"
        }
        modalClose={handleModalClose}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: onSubmit,
          },
        ]}
      >
        <div className="space-y-4">
          <FormSelect
            label="Department"
            id="departmentId"
            options={departmentData}
            isMandatory
            value=""
          />
          <div>
            <FormInputField
              id="designationName"
              {...register("designationName", {
                required: "Enter DesignationName Name",
              })}
              error={errors.designationName}
              label="Designation Name"
              placeholder={"Enter Designation Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
}

export default DesignationAddFormModal;

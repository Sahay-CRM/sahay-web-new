import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useDepartmentFormModal from "./useDepartmentFormModal";

interface DepartmentModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: DepartmentDataProps;
}

const DepartmentFormModal: React.FC<DepartmentModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } =
    useDepartmentFormModal({
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={
            modalData?.departmentId ? "Edit Department" : "Add Department"
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
          <div>
            <FormInputField
              id="departmentName"
              {...register("departmentName", {
                required: "Enter Department Name",
              })}
              error={errors.departmentName}
              label="Department Name"
              placeholder={"Enter department name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
        </ModalData>
      </div>
    </FormProvider>
  );
};
export default DepartmentFormModal;

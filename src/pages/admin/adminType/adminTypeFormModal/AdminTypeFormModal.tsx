import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useConsultantFormModal from "./useAdminTypeFormModal";

interface AddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: AdminUserTypeDataProps;
}

const AdminTypeFormModal: React.FC<AddModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } =
    useConsultantFormModal({
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={
            modalData?.adminUserTypeId
              ? "Edit Admin Type Name"
              : "Add Admin Type Name"
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
              id="adminUserTypeName"
              {...register("adminUserTypeName", {
                required: "Enter Admin Type Name",
              })}
              error={errors.adminUserTypeName}
              label="Admin Type Name"
              placeholder={"Enter admin type name"}
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
export default AdminTypeFormModal;

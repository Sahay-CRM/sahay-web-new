import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useConsultantFormModal from "./useConsultantFormModal";

interface AddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: ConsultantDataProps;
}

const ConsultantFormModal: React.FC<AddModalProps> = ({
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
            modalData?.consultantId ? "Edit Consultant" : "Add Consultant"
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
              id="consultantName"
              {...register("consultantName", {
                required: "Enter Consultant Name",
              })}
              error={errors.consultantName}
              label="Consultant Name"
              placeholder={"Enter consultant name"}
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
export default ConsultantFormModal;

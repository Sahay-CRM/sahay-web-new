import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useIndustryModal from "./useIndustryModal";

interface AddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: IndustryTypeDataProps;
}

const IndustryModal: React.FC<AddModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } = useIndustryModal({
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={modalData?.industryId ? "Edit Industry" : "Add Industry"}
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
              id="industryName"
              {...register("industryName", {
                required: "Enter Industry Name",
              })}
              error={errors.industryName}
              label="Industry Name"
              placeholder={"Enter industry name"}
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
export default IndustryModal;

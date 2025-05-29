import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useEngagementTypeModal from "./useEngagementTypeModal";

interface AddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: EngagementTypeDataProps;
}

const EngagementTypeModal: React.FC<AddModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } =
    useEngagementTypeModal({
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={
            modalData?.engagementTypeId
              ? "Edit Engagement Type"
              : "Add Engagement Type"
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
              id="engagementTypeName"
              {...register("engagementTypeName", {
                required: "Enter Admin Type Name",
              })}
              error={errors.engagementTypeName}
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
export default EngagementTypeModal;

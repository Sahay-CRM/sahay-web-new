import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useStateFormModal from "./useStateFormModal";

interface TeamModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: UpdateState | undefined;
}

const StateFormModal: React.FC<TeamModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const {
    register,
    errors,
    // currentPagePermission,
    onSubmit,
    handleModalClose,
  } = useStateFormModal({ modalClose, modalData });

  // if (!currentPagePermission && !currentPagePermission.add) {
  //   return;
  // }
  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={"modalTitle"}
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
              id="stateName"
              {...register("stateName")}
              error={errors.stateName}
              label="Team Name"
              placeholder={"placeholder"}
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
export default StateFormModal;

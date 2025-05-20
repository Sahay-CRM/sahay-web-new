import { FormProvider, useForm } from "react-hook-form";
import useCountryFormModal from "./useCountryFormModal";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

interface TeamModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: TeamData;
}

const CountryFormModal: React.FC<TeamModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const {
    register,
    errors,
    currentPagePermission,
    onSubmit,
    handleModalClose,
  } = useCountryFormModal({ modalClose, modalData });

  if (!currentPagePermission && !currentPagePermission.add) {
    return;
  }
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
              id="teamName"
              {...register("teamName")}
              error={errors.teamName}
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
export default CountryFormModal;

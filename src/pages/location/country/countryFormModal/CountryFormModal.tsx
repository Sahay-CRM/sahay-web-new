import { FormProvider, useForm } from "react-hook-form";
import useCountryFormModal from "./useCountryFormModal";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

interface TeamModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: CountryData;
}

const CountryFormModal: React.FC<TeamModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } = useCountryFormModal({
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={"Add Country"}
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
              id="countryName"
              {...register("countryName", { required: "Enter Country Name" })}
              error={errors.countryName}
              label="Country Name"
              placeholder={"Enter country name"}
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

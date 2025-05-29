import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useCityFormModal from "./useCityFormModal";

interface TeamModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: TeamData;
}

const CityFormModal: React.FC<TeamModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } = useCityFormModal({
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={"Add City"}
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
              id="cityName"
              {...register("cityName", { required: "Enter City Name" })}
              error={errors.cityName}
              label="City Name"
              placeholder={"Enter city name"}
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
export default CityFormModal;

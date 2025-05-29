import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import useCityFormModal from "./useCityFormModal";

interface CityModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: CityData | undefined;
}

const CityFormModal: React.FC<CityModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();

  const {
    register,
    errors,
    onSubmit,
    handleModalClose,
    stateOptions,
    control,
    countryOptions,
    countryId
  } = useCityFormModal({ modalClose, modalData });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.cityId ? "Edit City" : "Add City"}
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
          <Controller
            name="countryId"
            control={control}
            rules={{ required: "Select a Country" }}
            render={({ field }) => (
              <FormSelect
                {...field}
                label="Country"
                options={countryOptions}
                placeholder="Select Country"
                error={errors.countryId}
                isMandatory
              />
            )}
          />

          <Controller
            name="stateId"
            control={control}
            rules={{ required: "Select a state" }}
            render={({ field }) => (
              <FormSelect
                {...field}
                label="State"
                options={stateOptions}
                placeholder="Select State"
                error={errors.stateId}
                isMandatory
                disabled={!countryId}
              />
            )}
          />
          <FormInputField
            id="cityName"
            {...register("cityName", { required: "Enter City Name" })}
            error={errors?.cityName}
            label="City Name"
            placeholder="Enter city name"
            containerClass="mt-0 tb:mt-0"
            className="text-lg"
            isMandatory
          />
        </div>
      </ModalData>
    </FormProvider>
  );
};

export default CityFormModal;

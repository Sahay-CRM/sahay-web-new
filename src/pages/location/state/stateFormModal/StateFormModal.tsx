import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import useStateFormModal from "./useStateFormModal";

interface StateModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: StateData | undefined;
}

const StateFormModal: React.FC<StateModalProps> = ({
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
    countryOptions,
    control,
  } = useStateFormModal({
    modalClose,
    modalData,
  });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.stateId ? "Edit State" : "Add State"}
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
            rules={{ required: "Select a country" }}
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
          <FormInputField
            id="stateName"
            {...register("stateName", { required: "Enter State Name" })}
            error={errors?.stateName}
            label="State Name"
            placeholder="Enter state name"
            containerClass="mt-0 tb:mt-0"
            className="text-lg"
            isMandatory
          />
        </div>
      </ModalData>
    </FormProvider>
  );
};

export default StateFormModal;

import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useCoreParameterModal from "./useCoreParameterModal";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";

interface AddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: CoreParameterDataProps;
}

export const CoreParameterModal: React.FC<AddModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose, departmentOptions } =
    useCoreParameterModal({
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={
            modalData?.coreParameterId
              ? "Edit Core Parameter"
              : "Add Core Parameter"
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
            <FormSelect
              label="Department"
              id={`select`}
              options={departmentOptions}
              placeholder="Selete Department"
            />

            <FormInputField
              id="coreParameterId"
              {...register("coreParameterId", {
                required: "Enter Core Parameter Name",
              })}
              error={errors.coreParameterId}
              label="Core Parameter Name"
              placeholder={"Enter core parameter name"}
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

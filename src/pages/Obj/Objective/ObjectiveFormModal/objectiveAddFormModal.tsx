import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useObjectivesFormModal from "./useObjectiveFormModal";

export default function ObjectiveFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: UseObjectiveFormModalProps) {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose, isPending } =
    useObjectivesFormModal({
      isModalOpen,
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.objectiveId ? "Edit Objective" : "Add Objective"}
        modalClose={handleModalClose}
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: onSubmit,
            isLoading: isPending,
          },
        ]}
      >
        <div className="space-y-4">
          <div>
            <FormInputField
              id="objectiveName"
              {...register("objectiveName", {
                required: "Enter Objective",
              })}
              error={errors.objectiveName}
              label="Objective Name"
              placeholder={"Enter Objective"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
}

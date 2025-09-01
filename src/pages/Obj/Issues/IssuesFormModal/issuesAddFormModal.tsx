import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useIssuesFormModal from "./useIssuesFormModal";

export default function IssueFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: UseIssuesFormModalProps) {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose, isPending } =
    useIssuesFormModal({
      isModalOpen,
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.issueId ? "Edit Issues" : "Add Issues"}
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
              id="issueName"
              {...register("issueName", {
                required: "Enter Issue",
              })}
              error={errors.issueName}
              label="Issue Name"
              placeholder={"Enter Issue"}
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

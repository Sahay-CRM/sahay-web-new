import { FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useCalenderFormModal from "./useCalenderFormModal";

interface ImportantModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  modalData: ImportantDatesDataProps;
}

const CalenderFormModal: React.FC<ImportantModalProps> = ({
  isModalOpen,
  modalClose,
  modalData,
}) => {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose } = useCalenderFormModal(
    {
      modalClose,
      modalData,
    },
  );

  return (
    <FormProvider {...methods}>
      <div>
        <ModalData
          isModalOpen={isModalOpen}
          modalTitle={
            modalData?.importantDateId
              ? "Edit Important Dates"
              : "Add Important Dates"
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
              id="importantDateName"
              {...register("importantDateName", {
                required: "Enter Important Name",
              })}
              error={errors.importantDateName}
              label="Important Date Name"
              placeholder={"Enter important date name"}
              containerClass="mt-0 tb:mt-0 mb-4"
              className="text-lg"
              isMandatory={true}
            />
            <FormInputField
              id="importantDate"
              {...register("importantDate", {
                required: "Select a important date",
              })}
              type="date"
              error={errors.importantDate}
              label="Important Date"
              placeholder={"Enter important date name"}
              containerClass="mt-0 tb:mt-0 mb-4"
              className="text-lg"
              isMandatory={true}
            />
            <FormInputField
              id="importantDateRemarks"
              {...register("importantDateRemarks")}
              error={errors.importantDateRemarks}
              label="Important Date Remarks"
              placeholder={"Enter important date remarks"}
              containerClass="mt-4"
              className="text-lg"
            />
          </div>
        </ModalData>
      </div>
    </FormProvider>
  );
};
export default CalenderFormModal;

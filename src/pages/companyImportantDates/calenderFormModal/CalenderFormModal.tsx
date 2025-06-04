import { FormProvider, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const { register, errors, onSubmit, handleModalClose, watch, setValue } =
    useCalenderFormModal({
      modalClose,
      modalData,
    });

  const selectedDate = watch("importantDate");

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
            <div className="mt-0 tb:mt-0 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Important Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) =>
                  setValue(
                    "importantDate",
                    date ? date.toISOString().split("T")[0] : "",
                  )
                }
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholderText="Select important date"
              />
              {errors.importantDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.importantDate.message}
                </p>
              )}
            </div>
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

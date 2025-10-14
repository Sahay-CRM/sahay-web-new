import { Controller, FormProvider, useForm } from "react-hook-form";

import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useAddHolidaysForm from "./useAddHolidaysForm";

export default function AddHolidaysForm({
  isModalOpen,
  modalClose,
  modalData,
}: AddHolidaysFormModalProps) {
  const methods = useForm();
  const { register, errors, onSubmit, handleModalClose, control, isPending } =
    useAddHolidaysForm({
      isModalOpen,
      modalClose,
      modalData,
    });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={modalData?.holidayId ? "Edit Holidays" : "Add Holidays"}
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
              id="holidayName"
              {...register("holidayName", {
                required: "Enter Holiday Name",
              })}
              error={errors.holidayName}
              label="Holiday Name"
              placeholder={"Enter Holiday Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
          <div>
            <label
              htmlFor="holidayDate"
              className="block text-sm font-medium mb-1"
            >
              Holiday Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="holidayDate"
              control={control}
              rules={{ required: "Select Holiday Date" }}
              render={({ field }) => (
                <>
                  <input
                    type="date"
                    id="holidayDate"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value
                          .split("-")
                          .map(Number);
                        const utcDate = new Date(
                          Date.UTC(year, month - 1, day),
                        );
                        field.onChange(utcDate.toISOString());
                      } else {
                        field.onChange("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                  />
                  {errors.holidayDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.holidayDate.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </ModalData>
    </FormProvider>
  );
}

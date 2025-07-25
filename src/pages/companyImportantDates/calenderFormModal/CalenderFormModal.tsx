import { Controller, FormProvider, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useCalenderFormModal from "./useCalenderFormModal";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  // New: Local state to stage color before saving
  const [stagedColor, setStagedColor] = useState<string>(
    modalData?.color || "#aabbcc",
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  // Sync stagedColor with form value when modal opens or color changes externally
  useEffect(() => {
    // If stagedColor is undefined or empty, use #aabbcc
    setValue("color", stagedColor || "#aabbcc");
    setStagedColor(stagedColor || "#aabbcc");
  }, [setValue, stagedColor]);

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    }
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

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
            <div className="mt-4">
              <label className="block mb-1 font-medium">
                Color <span className="text-red-500">*</span>
              </label>
              <Controller
                name="color"
                control={methods.control}
                rules={{ required: "Select a color" }}
                render={({ field }) => (
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center px-3 py-1 border rounded bg-white"
                      onClick={() => {
                        setShowColorPicker((v) => !v);
                        setStagedColor(field.value || "#aabbcc"); // Reset staged color to current value or default
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 20,
                          height: 20,
                          background: field.value || "#aabbcc",
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                      />
                      <span className="text-sm">
                        {field.value || "#aabbcc"}
                      </span>
                    </button>
                    {showColorPicker && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          style={{ background: "transparent" }}
                          onClick={() => setShowColorPicker(false)}
                        />
                        {/* Popup */}
                        <div
                          ref={pickerRef}
                          className="fixed z-50 bg-white p-3 rounded shadow"
                          style={{
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            minWidth: 200,
                          }}
                        >
                          <HexColorPicker
                            color={stagedColor || "#aabbcc"}
                            onChange={setStagedColor}
                          />
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              style={{
                                display: "inline-block",
                                width: 24,
                                height: 24,
                                background: stagedColor,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                verticalAlign: "middle",
                              }}
                            />
                            <span className="ml-2 text-sm">{stagedColor}</span>
                            <div className="ml-4 flex gap-2">
                              <button
                                type="button"
                                className="px-2 py-1 border rounded text-xs"
                                onClick={() => setShowColorPicker(false)}
                              >
                                Close
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 border rounded text-xs bg-blue-500 text-white"
                                onClick={() => {
                                  field.onChange(stagedColor);
                                  setShowColorPicker(false);
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              />
              {errors.color && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.color.message}
                </p>
              )}
            </div>
          </div>
        </ModalData>
      </div>
    </FormProvider>
  );
};
export default CalenderFormModal;

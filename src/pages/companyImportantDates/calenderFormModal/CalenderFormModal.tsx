import { Controller, FormProvider, useForm } from "react-hook-form";
// import DatePicker from "react-datepicker";
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
  const {
    register,
    errors,
    control,
    onSubmit,
    handleModalClose,
    // watch,
    setValue,
  } = useCalenderFormModal({
    modalClose,
    modalData,
  });

  // const selectedDate = watch("importantDate");
  const [showColorPicker, setShowColorPicker] = useState(false);
  // New: Local state to stage color before saving
  const [stagedColor, setStagedColor] = useState<string>(
    modalData?.color || "",
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stagedColor && modalData.color) {
      setValue("color", modalData.color);
      setStagedColor(modalData.color);
    }
  }, [modalData.color, setValue, stagedColor]);

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
          childclass="py-0"
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
            <div className="mt-0 tb:mt-0 mb-4 w-full flex gap-4 items-start">
              <div className="w-1/2">
                <label className="block text-md font-medium text-black mb-2">
                  Important Date <span className="text-red-500">*</span>
                </label>

                <Controller
                  name="importantDate"
                  control={control}
                  rules={{ required: "Select Important Date" }}
                  render={({ field }) => (
                    <>
                      <input
                        type="date"
                        id="importantDate"
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
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                      />
                      {errors.importantDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.importantDate.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <FormInputField
                id="importantDateRemarks"
                {...register("importantDateRemarks")}
                error={errors.importantDateRemarks}
                label="Important Date Remarks"
                placeholder={"Enter important date remarks"}
                containerClass="w-1/2"
                className="text-lg mt-0"
              />
            </div>
            <div className="mt-4">
              <label className="block mb-1 font-medium">
                Color <span className="text-red-500">*</span>
              </label>
              <Controller
                name="color"
                control={control}
                rules={{ required: "Select a color" }}
                render={({ field }) => (
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center px-3 py-1 border rounded bg-white"
                      onClick={() => {
                        setShowColorPicker((v) => !v);
                        setStagedColor(field.value || "#aabbcc");
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
                            className="w-full"
                          />
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              style={{
                                display: "inline-block",
                                width: 20,
                                height: 20,
                                background: stagedColor,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                verticalAlign: "middle",
                              }}
                            />
                            <span className="ml-2 text-sm w-16">
                              <input
                                type="text"
                                value={stagedColor}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStagedColor(val);
                                }}
                                className="px-2 w-17 py-1 border rounded text-xs"
                                placeholder="#aabbcc"
                              />
                            </span>
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

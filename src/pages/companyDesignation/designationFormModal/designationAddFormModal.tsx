import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import FormSelect from "@/components/shared/Form/FormSelect/selectuser";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useDesignationFormModal from "./useDesignationFormModal";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

function DesignationAddFormModal({
  isModalOpen,
  modalClose,
  modalData,
}: DesignationAddFormProps) {
  const methods = useForm();
  const {
    register,
    errors,
    control,
    DepartmentOptions,
    designationOptions,
    onSubmit,
    handleModalClose,
  } = useDesignationFormModal({
    modalClose,
    modalData,
  });

  const [selectedprentswitch, setselectedparentswitch] = useState(false);
  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={
          modalData?.designationId ? "Edit Designation" : "Add Designation"
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
        <div className="space-y-4">
          {/* <FormSelect
            label="Department"
            id="departmentId"
            options={DepartmentOptions}
            isMandatory
            value=""
          /> */}
          <Controller
            name="departmentId"
            control={control}
            render={({ field, fieldState }) => (
              <FormSelect
                {...field}
                label="Department"
                options={DepartmentOptions}
                error={fieldState.error}
                isMandatory={true}
              />
            )}
          />
          <div>
            <FormInputField
              id="designationName"
              {...register("designationName", {
                required: "Enter DesignationName Name",
              })}
              error={errors.designationName}
              label="Designation Name"
              placeholder={"Enter Designation Name"}
              containerClass="mt-0 tb:mt-0"
              className="text-lg"
              isMandatory={true}
            />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex flex-col items-start space-y-2">
              <Label className="text-md" htmlFor="designationSwitch">
                Is industry specific?
              </Label>
              <Switch
                checked={selectedprentswitch}
                onCheckedChange={() => {
                  setselectedparentswitch(true);
                }}
              />
            </div>
          </div>

          {/* Show this only if switch is ON */}
          {selectedprentswitch && (
            <div className="mt-4">
              <Controller
                name="parentId"
                control={control}
                render={({ field, fieldState }) => (
                  <FormSelect
                    {...field}
                    value={field.value ?? ""}
                    label="Parent Designation"
                    options={designationOptions}
                    error={fieldState.error}
                    isMandatory={true}
                  />
                )}
              />
            </div>
          )}
        </div>
      </ModalData>
    </FormProvider>
  );
}

export default DesignationAddFormModal;

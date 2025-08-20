import { Controller, FormProvider, useForm } from "react-hook-form";

import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

import useEditDatapointFormModal from "./useEditDatapointFormModal";
import FormSelect from "@/components/shared/Form/FormSelect";
import { Label } from "@radix-ui/react-label";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

interface UseEditDatapointFormModalProps {
  modalClose: () => void;
  isModalOpen: boolean;
  kpiId: string;
}

export default function EditDatapointAddFormModal({
  isModalOpen,
  modalClose,
  kpiId,
}: UseEditDatapointFormModalProps) {
  const methods = useForm();

  const {
    isPending,
    handleClose,
    onSubmit,
    sumAveOptions,
    validationOptions,
    shouldShowSumAveField,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    hasData,
    control,
    setValue,
    frequenceOptions,
    errors,
    validationType,
    register,
    watch,
    selectedFrequency,
    datapointApiData,
    employee,
    allOptions,
    getEmployeeName,
    showYesNo,
    showBoth,
    yesnoOptions,
  } = useEditDatapointFormModal({ modalClose, kpiId });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle="Update KPI"
        modalClose={handleClose}
        containerClass="min-w-[50%]"
        buttons={[
          {
            btnText: "Submit",
            buttonCss: "py-1.5 px-5",
            btnClick: onSubmit,
            isLoading: isPending,
          },
        ]}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4"> */}
          <FormInputField
            label="Selected Kpi"
            value={datapointApiData?.KPIMaster?.KPIName}
            disabled
            className="h-[44px] border-gray-300 cursor-not-allowed"
          />

          <Controller
            control={control}
            name="frequencyType"
            rules={{ required: "Frequency is required" }}
            render={({ field }) => (
              <FormSelect
                label="Frequency"
                value={field.value}
                // onChange={(value) => {
                //   field.onChange(value);
                //   setValue("visualFrequencyTypes", []);
                // }}
                onChange={field.onChange}
                options={frequenceOptions}
                error={errors.frequencyType}
                disabled={hasData}
                className={hasData ? "rounded-md" : ""}
                isMandatory
              />
            )}
          />
          <Controller
            control={control}
            name="validationType"
            rules={{ required: "Validation Type is required" }}
            render={({ field }) => (
              <FormSelect
                label="Validation Type"
                value={field.value}
                onChange={field.onChange}
                options={validationOptions}
                error={errors.validationType}
                className="rounded-md"
                isMandatory
                labelClass="mb-2"
              />
            )}
          />

          {shouldShowVisualFrequency && (
            <div>
              <Controller
                control={control}
                name="visualFrequencyTypes"
                render={({ field }) => (
                  <FormSelect
                    label="Visual Frequency Types"
                    value={field.value || []}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value?.length > 0 && validationType !== "YES_NO") {
                        setValue("visualFrequencyAggregate", "sum");
                      }
                    }}
                    options={getFilteredVisualFrequencyOptions()}
                    error={errors.visualFrequencyTypes}
                    isMulti={true}
                    placeholder="Select visual frequency types"
                    disabled={false}
                    key={
                      selectedFrequency + "-" + (watch("coreParameterId") || "")
                    }
                  />
                )}
              />
              {shouldShowSumAveField && (
                <div className="">
                  <Controller
                    control={control}
                    name="visualFrequencyAggregate"
                    render={({ field }) => (
                      <FormSelect
                        label="Sum/Average"
                        value={field.value || "sum"}
                        onChange={field.onChange}
                        options={sumAveOptions}
                        error={errors.visualFrequencyAggregate}
                        placeholder="Select visual frequency Aggregate"
                        disabled={false}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}

          <FormInputField label="Unit" {...register(`unit`)} />

          <Controller
            control={control}
            name="employeeId"
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <SearchDropdown
                options={allOptions}
                selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                onSelect={(value) => {
                  field.onChange(value.value);
                  setValue("employeeId", value.value);
                }}
                placeholder="Select an employee..."
                label="Employee"
                error={errors.employeeId}
                isMandatory
              />
            )}
          />

          {employee && (
            <div key={employee} className="flex gap-2 w-full">
              <Label className="text-[18px] mb-0">
                {getEmployeeName(employee)}
              </Label>
              <div
                className={`grid w-1/2 ${
                  showBoth ? "grid-cols-2" : "grid-cols-1"
                } gap-4 mt-0`}
              >
                {!showYesNo && (
                  <>
                    <FormInputField
                      label="Goal Value 1"
                      isMandatory
                      {...register(`value1`, {
                        required: "Please enter Goal Value 1",
                      })}
                      error={errors?.value1}
                      // disabled={isDisabled}
                      // readOnly={isDisabled}
                    />
                    {showBoth && (
                      <FormInputField
                        isMandatory
                        label="Goal Value 2"
                        {...register(`value2`, {
                          required: "Please enter Goal Value 2",
                        })}
                        error={errors?.value2}
                        // disabled={isDisabled}
                        // readOnly={isDisabled}
                      />
                    )}
                  </>
                )}
                {showYesNo && (
                  <Controller
                    name={`value1`}
                    control={control}
                    rules={{ required: "Please select Yes or No" }}
                    render={({ field, fieldState }) => {
                      const selectedOption =
                        field.value?.value ?? field.value ?? "";
                      return (
                        <FormSelect
                          {...field}
                          label="Yes/No"
                          options={yesnoOptions}
                          error={fieldState.error}
                          isMandatory={true}
                          value={selectedOption}
                          onChange={field.onChange}
                        />
                      );
                    }}
                  />
                )}
              </div>
            </div>
          )}
          <div className="">
            <label className="block mb-1 font-medium">Tags</label>
            <textarea
              {...register(`tag`)}
              className="w-full border rounded-md p-2 text-base h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* </Card> */}
        </div>
      </ModalData>
    </FormProvider>
  );
}

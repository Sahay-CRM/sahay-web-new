import { Controller, FormProvider, useForm } from "react-hook-form";

import ModalData from "@/components/shared/Modal/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

import useEditDatapointFormModal from "./useEditDatapointFormModal";
import FormSelect from "@/components/shared/Form/FormSelect";
import { Label } from "@radix-ui/react-label";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { formatIndianNumber } from "@/features/utils/app.utils";

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
    allKpi,
  } = useEditDatapointFormModal({ modalClose, kpiId });

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={datapointApiData?.KPIMaster?.KPIName}
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
        {!hasData && (
          <Controller
            control={control}
            name="KPIMasterId"
            rules={{ required: "KPIMasterId is required" }}
            render={({ field }) => (
              <SearchDropdown
                options={allKpi}
                selectedValues={field.value ? [field.value] : []}
                onSelect={(selected) => {
                  field.onChange(selected);
                  setValue("KPIMasterId", selected.value);
                  setValue("selectedKpi", selected);
                }}
                placeholder="Select KPI..."
                label="Selected KPI"
                error={errors.KPIMasterId}
                isMandatory
                className="mb-2"
              />
            )}
          />
        )}

        {/* <FormInputField
          label="Selected Kpi"
          value={datapointApiData?.KPIMaster?.KPIName}
          disabled
          className="h-[44px] border-gray-300 cursor-not-allowed"
        /> */}

        <div className="grid grid-cols-2 gap-4">
          {/* Frequency */}
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
                triggerClassName="py-4"
              />
            )}
          />
          {/* Validation Type */}
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
                triggerClassName="py-4"
              />
            )}
          />
          {/* Visual Frequency + Sum/Average */}
          {shouldShowVisualFrequency && (
            <div className="col-span-2 grid grid-cols-2 gap-4">
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
                      triggerClassName="py-4"
                    />
                  )}
                />
              )}
            </div>
          )}
          {/* Employee */}
          <Controller
            control={control}
            name="employeeId"
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <SearchDropdown
                options={allOptions}
                selectedValues={field.value ? [field.value] : []}
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
          <FormInputField
            label="Tag"
            placeholder="Enter Tag"
            // isMandatory
            {...register(`tag`)}
            error={errors?.tag}
            // disabled={isDisabled}
            // readOnly={isDisabled}
          />
          {employee && (
            <div className="col-span-2 flex flex-col gap-2">
              <Label className="text-[18px] mb-0">
                {getEmployeeName(employee)}
              </Label>

              <div className="grid w-full gap-4 mt-0">
                {!showYesNo && !showBoth && (
                  // Case: Only Goal Value 1 -> side by side with Unit
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="value1"
                      control={control}
                      rules={{ required: "Please enter Goal Value 1" }}
                      render={({ field, fieldState }) => (
                        <FormInputField
                          label="Goal Value 1"
                          isMandatory
                          // value={field.value || ""}
                          // onChange={(e) => field.onChange(e.target.value)} // store raw input
                          // onBlur={() => {
                          //   const formatted = formatIndianNumber(field.value);
                          //   field.onChange(formatted);
                          // }}
                          placeholder="Enter Goal Value 1"
                          value={formatIndianNumber(field.value)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, "");
                            field.onChange(raw);
                          }}
                          error={fieldState.error}
                        />
                      )}
                    />
                    <FormInputField
                      label="Unit"
                      placeholder="Enter Unit"
                      {...register(`unit`)}
                    />
                  </div>
                )}

                {!showYesNo && showBoth && (
                  // Case: Goal Value 1 + Goal Value 2
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="value1"
                        control={control}
                        rules={{ required: "Please enter Goal Value 1" }}
                        render={({ field, fieldState }) => (
                          <FormInputField
                            label="Goal Value 1"
                            isMandatory
                            placeholder="Enter Goal Value 1"
                            value={formatIndianNumber(field.value)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, "");
                              field.onChange(raw);
                            }}
                            error={fieldState.error}
                          />
                        )}
                      />

                      <Controller
                        name="value2"
                        control={control}
                        rules={{ required: "Please enter Goal Value 2" }}
                        render={({ field, fieldState }) => (
                          <FormInputField
                            label="Goal Value 2"
                            isMandatory
                            placeholder="Enter Goal Value 2"
                            value={formatIndianNumber(field.value)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, "");
                              field.onChange(raw);
                            }}
                            error={fieldState.error}
                          />
                        )}
                      />
                    </div>
                    <FormInputField
                      label="Unit"
                      placeholder="Enter Unit"
                      {...register(`unit`)}
                    />
                  </>
                )}

                {showYesNo && (
                  // Case: Yes/No dropdown
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name={`value1`}
                      control={control}
                      rules={{ required: "Please select Yes or No" }}
                      render={({ field, fieldState }) => (
                        <FormSelect
                          {...field}
                          label="Yes/No"
                          options={yesnoOptions}
                          error={fieldState.error}
                          isMandatory
                          value={field.value?.value ?? field.value ?? ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FormInputField
                      label="Unit"
                      placeholder="Enter Unit"
                      {...register(`unit`)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalData>
    </FormProvider>
  );
}

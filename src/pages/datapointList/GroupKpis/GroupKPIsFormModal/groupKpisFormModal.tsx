import { Controller, FormProvider, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import useGroupKpisFormModal from "./useGroupKpisFormModal";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useGetKpiMergeById from "@/features/api/companyDatapoint/useGetKpimergeById";
import { useEffect } from "react";

export default function GroupKpisFormModal({
  isModalOpen,
  modalClose,
  selectedKpiData,
  selectedKpisIds,
  groupId,
}: GroupKpisProps) {
  const methods = useForm();
  const {
    onSubmit,
    register,
    handleModalClose,
    isPending,
    control,
    setValue,
    errors,
    frequenceOptions,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    sumAveOptions,
  } = useGroupKpisFormModal({
    modalClose,
    isModalOpen,
    selectedKpiData,
    selectedKpisIds,
    groupId,
  });
  const { data: fetchedGroupData, isSuccess } = useGetKpiMergeById(
    groupId ?? ""
  );

  useEffect(() => {
    if (isSuccess && fetchedGroupData) {
      console.log(fetchedGroupData, "fetchedGroupData");

      setValue("frequencyType", fetchedGroupData.frequencyType || "");

      setValue(
        "visualFrequencyAggregate",
        fetchedGroupData.visualFrequencyAggregate || "sum"
      );
      // ✅ Fix: convert comma-separated string to array
      const visualTypes = fetchedGroupData.visualFrequencyTypes
        ? fetchedGroupData.visualFrequencyTypes.split(",")
        : [];

      setValue("visualFrequencyTypes", visualTypes);

      setValue("unit", fetchedGroupData.unit || "");
      setValue("tag", fetchedGroupData.tag || "");
    }
  }, [isSuccess, fetchedGroupData, setValue]);

  return (
    <FormProvider {...methods}>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={groupId ? "Update KPIs Group" : "Create KPIs Group"}
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
        <div className="">
          <div className="grid gap-4 grid-cols-2 items-center">
            <Controller
              control={control}
              name="frequencyType"
              // rules={{ required: "Frequency is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Frequency"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("visualFrequencyTypes", []);
                  }}
                  options={frequenceOptions}
                  error={errors.frequencyType}
                  disabled={true}
                  isMandatory
                />
              )}
            />
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

          {shouldShowVisualFrequency && (
            <div className="my-2">
              <Controller
                control={control}
                name="visualFrequencyTypes"
                render={({ field }) => (
                  <FormSelect
                    label="Visual Frequency Types"
                    value={field.value || []}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("visualFrequencyAggregate", "sum");
                    }}
                    options={getFilteredVisualFrequencyOptions()}
                    error={errors.visualFrequencyTypes}
                    isMulti={true}
                    placeholder="Select visual frequency types"
                    disabled={false}
                  />
                )}
              />
            </div>
          )}
          <FormInputField label="Unit" {...register(`unit`)} />
          <FormInputField label="Tag" {...register(`tag`)} />
        </div>
      </ModalData>
    </FormProvider>
  );
}

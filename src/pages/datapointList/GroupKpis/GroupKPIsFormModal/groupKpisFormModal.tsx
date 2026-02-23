import { Controller, FormProvider } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData";
import useGroupKpisFormModal from "./useGroupKpisFormModal";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useGetKpiMergeById } from "@/features/api/companyDatapoint";
import { useEffect } from "react";

export default function GroupKpisFormModal({
  isModalOpen,
  modalClose,
  selectedKpiData,
  selectedKpisIds,
  groupId,
}: GroupKpisProps) {
  const formMethods = useGroupKpisFormModal({
    modalClose,
    isModalOpen,
    selectedKpiData,
    selectedKpisIds,
    groupId,
  });

  const {
    onSubmit,
    register,
    handleModalClose,
    isPending,
    control,
    setValue,
    formState: { errors },
    frequenceOptions,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    sumAveOptions,
    validationTypeOptions,
    kpiOptions,
    isKpisLoading,
    watch,
  } = formMethods;

  const { data: fetchedGroupData, isSuccess } = useGetKpiMergeById(
    groupId ?? "",
  );

  useEffect(() => {
    if (isSuccess && fetchedGroupData) {
      setValue("frequencyType", fetchedGroupData.frequencyType || "");
      setValue(
        "visualFrequencyAggregate",
        fetchedGroupData.visualFrequencyAggregate || "sum",
      );
      const visualTypes =
        typeof fetchedGroupData.visualFrequencyTypes === "string"
          ? fetchedGroupData.visualFrequencyTypes.split(",")
          : fetchedGroupData.visualFrequencyTypes || [];

      setValue("visualFrequencyTypes", visualTypes);

      setValue("unit", fetchedGroupData.unit || "");
      setValue("tag", fetchedGroupData.tag || "");
      setValue("kpiMergeName", fetchedGroupData.kpiMergeName || "");
      setValue("validationType", fetchedGroupData.validationType || "");
      setValue("value1", fetchedGroupData.value1 || "");
      setValue("value2", fetchedGroupData.value2 || "");

      // If the API returns the KPI IDs for the group, set them here
      const fetchedKpiIds = fetchedGroupData.kpiIds;
      if (fetchedKpiIds) {
        const kpiIdArray =
          typeof fetchedKpiIds === "string"
            ? fetchedKpiIds.split(",").filter((id) => !!id)
            : Array.isArray(fetchedKpiIds)
              ? fetchedKpiIds
              : [];
        setValue("kpiIds", kpiIdArray);
      }
    }
  }, [isSuccess, fetchedGroupData, setValue]);

  return (
    <FormProvider {...formMethods}>
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
        <div className="space-y-4">
          <FormInputField
            label="Group Name"
            {...register(`kpiMergeName`, {
              required: "Group name is required",
            })}
            isMandatory
            error={errors.kpiMergeName}
          />
          <div className="grid gap-4 grid-cols-2 items-center">
            <Controller
              control={control}
              name="frequencyType"
              rules={{ required: "Frequency is required" }}
              render={({ field }) => (
                <FormSelect
                  label="Frequency"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  options={frequenceOptions}
                  error={errors.frequencyType}
                  disabled={false}
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

          <div className="my-2">
            <Controller
              control={control}
              name="kpiIds"
              rules={{ required: "KPIs are required" }}
              render={({ field }) => (
                <FormSelect
                  label="KPIs"
                  value={field.value || []}
                  onChange={field.onChange}
                  options={kpiOptions}
                  error={errors.kpiIds}
                  isMulti={true}
                  placeholder={
                    !watch("frequencyType")
                      ? "Select frequency first"
                      : "Select KPIs"
                  }
                  isSearchable={true}
                  disabled={!watch("frequencyType") || isKpisLoading}
                  isMandatory
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
          <div className="grid gap-4 grid-cols-2 items-center">
            <Controller
              control={control}
              name="validationType"
              render={({ field }) => (
                <FormSelect
                  label="Validation Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={validationTypeOptions}
                  error={errors.validationType}
                  placeholder="Select validation type"
                />
              )}
            />
            {watch("validationType") === "YES_NO" ? (
              <Controller
                control={control}
                name="value1"
                render={({ field }) => (
                  <FormSelect
                    label="Value 1"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "1", label: "Yes" },
                      { value: "2", label: "No" },
                    ]}
                    error={errors.value1}
                    placeholder="Select Yes/No"
                  />
                )}
              />
            ) : (
              <FormInputField
                label="Value 1"
                {...register("value1")}
                error={errors.value1}
              />
            )}
            {watch("validationType") === "BETWEEN" && (
              <FormInputField
                label="Value 2"
                {...register("value2")}
                error={errors.value2}
              />
            )}
          </div>
          <FormInputField label="Unit" {...register(`unit`)} />
          <FormInputField label="Tag" {...register(`tag`)} />
        </div>
      </ModalData>
    </FormProvider>
  );
}

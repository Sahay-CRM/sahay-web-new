import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";

import FormSelect from "@/components/shared/Form/FormSelect";
import {
  useAddUpdateDatapoint,
  useGetDatapointById,
  useGetKpiNonSel,
} from "@/features/api/companyDatapoint";
// import { useGetProduct } from "@/features/api/Product";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "@/components/shared/SearchInput";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetCoreParameterDropdown } from "@/features/api/Business";
import { Label } from "recharts";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

export default function useAddEmployee() {
  const { id: companykpimasterId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addDatapoint, isPending } = useAddUpdateDatapoint();
  const navigate = useNavigate();

  const { data: datapointApiData, isLoading: isDatapointLoading } =
    useGetDatapointById(companykpimasterId || "");

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "KPI List", href: "/dashboard/kpi" },
      { label: companykpimasterId ? "Update KPI" : "Add KPI", href: "" },
      ...(companykpimasterId
        ? [
            {
              label: `${
                typeof datapointApiData?.KPIMaster === "object" &&
                datapointApiData?.KPIMaster
                  ? datapointApiData.KPIMaster.KPIName
                  : ""
              }`,
              href: `/dashboard/kpi/${companykpimasterId}`,
            },
          ]
        : []),
    ]);
  }, [companykpimasterId, datapointApiData, setBreadcrumbs]);

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    mode: "onChange",
  });

  const watchedFrequency = useWatch({ name: "frequencyType", control });

  useEffect(() => {
    if (watchedFrequency && !datapointApiData) {
      setValue("visualFrequencyTypes", []);
    }
  }, [watchedFrequency, setValue, datapointApiData]);

  useEffect(() => {
    if (datapointApiData) {
      setValue("KPIMasterId", {
        KPIMasterId: datapointApiData.KPIMasterId,
        KPIName:
          datapointApiData.KPIMaster?.KPIName ||
          datapointApiData.dataPointLabel,
        KPILabel:
          datapointApiData.KPIMaster?.KPILabel ||
          datapointApiData.dataPointName,
      });
      // Set frequency
      setValue("frequencyType", datapointApiData.frequencyType);
      // Set validation type
      setValue("validationType", datapointApiData.validationType);
      // Set unit
      setValue("employeeId", datapointApiData.employeeId);
      setValue("unit", datapointApiData.unit);
      setValue("value1", datapointApiData.value1);
      setValue("value2", datapointApiData.value2);
      setValue("tag", datapointApiData.tag);
      if (
        datapointApiData.validationType === "YES_NO" &&
        datapointApiData.employeeId
      ) {
        setValue(
          `yesno_${datapointApiData.employeeId}`,
          datapointApiData.value1 === "1"
            ? { value: "1", label: "Yes" }
            : { value: "0", label: "No" },
        );
      }
      // Set core parameter
      setValue("coreParameterId", datapointApiData.coreParameterId);
      if (datapointApiData.visualFrequencyTypes) {
        const visualFrequencyArray = datapointApiData.visualFrequencyTypes
          .split(",")
          .map((type) => type.trim());
        setValue("visualFrequencyTypes", visualFrequencyArray);
      }
    }
  }, [datapointApiData, setValue]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    // Convert visualFrequencyTypes array to comma-separated string if it's an array
    const visualFrequencyTypesStr = Array.isArray(data.visualFrequencyTypes)
      ? data.visualFrequencyTypes.join(",")
      : data.visualFrequencyTypes;

    const simplePayload = companykpimasterId
      ? {
          kpiId: companykpimasterId,
          KPIMasterId: data.KPIMasterId.KPIMasterId,
          coreParameterId: data.coreParameterId,
          employeeId: data.employeeId,
          // frequencyType: data.frequencyType,
          tag: data.tag,
          unit: data.unit,
          validationType: data.validationType,
          value1: data.value1,
          value2: data.value2,
          frequencyType: data.frequencyType,
          visualFrequencyTypes: visualFrequencyTypesStr,
        }
      : {
          KPIMasterId: data.KPIMasterId.KPIMasterId,
          coreParameterId: data.coreParameterId,
          employeeId: data.employeeId,
          // frequencyType: data.frequencyType,
          tag: data.tag,
          unit: data.unit,
          validationType: data.validationType,
          value1: data.value1,
          value2: data.value2,
          frequencyType: data.frequencyType,
          visualFrequencyTypes: visualFrequencyTypesStr,
        };
    addDatapoint(simplePayload, {
      onSuccess: () => {
        handleModalClose();
      },
    });
    navigate("/dashboard/kpi");
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  // Go to GoalValue step directly if hasData is true
  const isUpdateMode = !!datapointApiData?.hasData;
  const isUpdateModeforFalse = datapointApiData?.hasData === false;

  const Kpi = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
    const { data: kpidata } = useGetKpiNonSel({
      filter: paginationFilter,
    });

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      {
        key: "KPIName",
        label: "KPI Name",
        visible: true,
      },
      { key: "KPILabel", label: "KPI Description (Tooltip)", visible: true },
      { key: "coreParameterName", label: "Business Function", visible: true },
    ]);

    // Filter visible columns
    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Toggle column visibility
    const onToggleColumn = (key: string) => {
      setColumnToggleOptions((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, visible: !col.visible } : col,
        ),
      );
    };
    // Check if the number of columns is more than 3
    const canToggleColumns = columnToggleOptions.length > 3;

    return (
      <div>
        <div className=" mt-1 flex items-center justify-end">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>
          {canToggleColumns && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownSearchMenu
                      columns={columnToggleOptions}
                      onToggleColumn={onToggleColumn}
                      columnIcon={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-white">Toggle Visible Columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Controller
          name="KPIMasterId"
          control={control}
          rules={{ required: "Please select a Kpi" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.KPIMasterId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.KPIMasterId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={kpidata?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (kpidata.currentPage - 1) * kpidata.pageSize + index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="KPIMasterId"
                paginationDetails={kpidata as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                onCheckbox={() => true}
              />
            </>
          )}
        />
      </div>
    );
  };

  const Details = () => {
    const frequenceOptions = [
      { value: "DAILY", label: "Daily" },
      { value: "WEEKLY", label: "Weekly" },
      { value: "MONTHLY", label: "Monthly" },
      { value: "QUARTERLY", label: "Quarterly" },
      { value: "HALFYEARLY", label: "Half-Yearly" },
      { value: "YEARLY", label: "Yearly" },
    ];

    const { data: corePara } = useGetCoreParameterDropdown();

    const coreParameterOption = corePara
      ? corePara.data.map((status) => ({
          label: status.coreParameterName,
          value: status.coreParameterId,
        }))
      : [];

    // Get the selected frequency value
    const selectedFrequency = useWatch({ name: "frequencyType", control });

    // Filter visual frequency options based on selected frequency
    const getFilteredVisualFrequencyOptions = () => {
      if (!selectedFrequency) return frequenceOptions;

      const frequencyIndex = frequenceOptions.findIndex(
        (opt) => opt.value === selectedFrequency,
      );

      if (frequencyIndex === -1) return frequenceOptions;

      // Return only options that come after the selected frequency
      return frequenceOptions.slice(frequencyIndex + 1);
    };

    // Check if visual frequency should be shown (not when YEARLY is selected)
    const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

    const validationOptions = [
      { value: "EQUAL_TO", label: "= Equal to" },
      {
        value: "GREATER_THAN_OR_EQUAL_TO",
        label: ">= Greater than or equal to",
      },
      { value: "GREATER_THAN", label: "> Greater than" },
      { value: "LESS_THAN", label: "< Less than" },
      { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
      { value: "BETWEEN", label: "Between" },
      { value: "YES_NO", label: "Yes/No" },
    ];
    // const unitTypeOptions = [
    //   { value: "Number", label: "Number" },
    //   { value: "Percentage", label: "Percentage (%)" },
    //   { value: "Dollar", label: "Dollar ($)" },
    //   { value: "Euro", label: "Euro (€)" },
    //   { value: "Pounds", label: "Pounds (£)" },
    //   { value: "INR", label: "INR (₹)" },
    // ];

    const hasData = datapointApiData?.hasData;

    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
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
                  // Clear visualFrequencyTypes immediately when frequency changes
                  setValue("visualFrequencyTypes", []);
                }}
                options={frequenceOptions}
                error={errors.frequencyType}
                disabled={hasData}
                className={hasData ? "bg-gray-100 p-2 rounded-md" : ""}
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
                className="p-2 rounded-md"
                isMandatory
              />
            )}
          />

          {shouldShowVisualFrequency && (
            <Controller
              control={control}
              name="visualFrequencyTypes"
              render={({ field }) => (
                <FormSelect
                  label="Visual Frequency Types"
                  value={field.value || []}
                  onChange={field.onChange}
                  options={getFilteredVisualFrequencyOptions()}
                  error={errors.visualFrequencyTypes}
                  isMulti={true}
                  placeholder="Select visual frequency types"
                  disabled={false}
                  // className="text-[15px] "
                  key={
                    selectedFrequency + "-" + (watch("coreParameterId") || "")
                  }
                />
              )}
            />
          )}

          {/* <Controller
            control={control}
            name="unit"
            // Removed required validation to make it optional
            render={({ field }) => (
              <FormSelect
                label="Unit Type"
                value={field.value}
                onChange={field.onChange}
                options={unitTypeOptions}
                error={errors.unit}
                disabled={false} // Always enabled, not disabled in edit mode
                placeholder="Select unit type"
              />
            )}
          /> */}

          <FormInputField label="Unit" {...register(`unit`)} />

          <Controller
            control={control}
            name="coreParameterId"
            rules={{ required: "Core Parameter is required" }}
            render={({ field }) => (
              <FormSelect
                label="Core Parameter"
                value={field.value}
                onChange={field.onChange}
                options={coreParameterOption}
                error={errors.coreParameterId}
                isMandatory
              />
            )}
          />
        </Card>
      </div>
    );
  };

  const AssignUser = () => {
    const { data: employeedata } = useGetEmployeeDd();

    const allOptions = (employeedata?.data || [])
      .filter((item) => !item.isDeactivated)
      .map((emp) => ({
        value: emp.employeeId,
        label: emp.employeeName,
      }));

    const employee = watch("employeeId");

    const getEmployeeName = (emp: DataPointEmployee) => {
      if (emp?.employeeName) return emp.employeeName;
      const found = employeedata?.data?.find(
        (e: EmployeeDetails) => e.employeeId === emp.employeeId,
      );
      return found?.employeeName || emp.employeeId || "";
    };

    const validationType = useWatch({ name: "validationType", control });

    const showBoth = validationType === "6" || validationType === "BETWEEN";
    const showYesNo = validationType === "7" || validationType === "YES_NO";

    const yesnoOptions = [
      { label: "Yes", value: "1" },
      { label: "No", value: "0" },
    ];

    return (
      <div>
        <div className="w-fit min-w-96">
          <Controller
            control={control}
            name="employeeId"
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <FormSelect
                label="Employee"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("employeeId", value);
                }}
                options={allOptions}
                error={errors.employeeId}
                isMandatory
                disabled={!!datapointApiData?.hasData}
              />
            )}
          />
        </div>
        <div className="mt-5">
          {employee && (
            <div>
              <div key={employee} className="flex flex-col gap-2">
                <Label className="text-[18px] mb-0">
                  {getEmployeeName(employee)}
                </Label>
                <div
                  className={`grid ${
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
                <FormInputField
                  label="Tag"
                  // isMandatory
                  {...register(`tag`)}
                  error={errors?.tag}
                  // disabled={isDisabled}
                  // readOnly={isDisabled}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    Kpi,
    Details,
    AssignUser,
    KpiPreview: getValues(),
    trigger,
    skipToStep: isUpdateMode ? 5 : isUpdateModeforFalse ? 1 : 0,
    isLoading: isDatapointLoading,
    companykpimasterId,
    isPending,
    datapointApiData,
  };
}

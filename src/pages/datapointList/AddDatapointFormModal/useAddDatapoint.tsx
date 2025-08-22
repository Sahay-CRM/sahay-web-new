import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Label } from "recharts";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import FormSelect from "@/components/shared/Form/FormSelect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "@/components/shared/SearchInput";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import {
  useAddUpdateDatapoint,
  useGetKpiNonSel,
} from "@/features/api/companyDatapoint";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
// import { useGetProduct } from "@/features/api/Product";

export default function useAddDataPoint() {
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addDatapoint, isPending } = useAddUpdateDatapoint();
  const navigate = useNavigate();

  const { setBreadcrumbs } = useBreadcrumbs();

  const permission = useSelector(getUserPermission).DATAPOINT_LIST;

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI List", href: "/dashboard/kpi" }]);
  }, [setBreadcrumbs]);

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
  const selectedKpi = watch("KPIMasterId");

  useEffect(() => {
    if (watchedFrequency) {
      setValue("visualFrequencyTypes", []);
    }
  }, [watchedFrequency, setValue]);

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

    const simplePayload = {
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
      visualFrequencyAggregate: data.visualFrequencyAggregate,
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

  const Kpi = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });
    const { data: kpidata, isLoading } = useGetKpiNonSel({
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
        <div className="mt-1 mb-4 flex items-center justify-between">
          {/* Search + Error Container */}
          <div className="flex items-center gap-2 mr-4">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
            {errors?.KPIMasterId && (
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] whitespace-nowrap">
                {String(errors?.KPIMasterId?.message || "")}
              </span>
            )}
          </div>

          {/* Column Toggle Icon */}
          <div className="flex items-center">
            {canToggleColumns && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-3">
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
        </div>

        <Controller
          name="KPIMasterId"
          control={control}
          rules={{ required: "Please select a Kpi" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={kpidata?.data.map((item, index) => ({
                ...item,
                srNo: (kpidata.currentPage - 1) * kpidata.pageSize + index + 1,
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
              showActionsColumn={false}
              isLoading={isLoading}
            />
          )}
        />
      </div>
    );
  };

  // const Details = () => {
  //   const frequenceOptions = [
  //     { value: "DAILY", label: "Daily" },
  //     { value: "WEEKLY", label: "Weekly" },
  //     { value: "MONTHLY", label: "Monthly" },
  //     { value: "QUARTERLY", label: "Quarterly" },
  //     { value: "HALFYEARLY", label: "Half-Yearly" },
  //     { value: "YEARLY", label: "Yearly" },
  //   ];
  //   // Get the selected frequency value
  //   const selectedFrequency = useWatch({ name: "frequencyType", control });

  //   // Filter visual frequency options based on selected frequency
  //   const getFilteredVisualFrequencyOptions = () => {
  //     if (!selectedFrequency) return frequenceOptions;

  //     const frequencyIndex = frequenceOptions.findIndex(
  //       (opt) => opt.value === selectedFrequency
  //     );

  //     if (frequencyIndex === -1) return frequenceOptions;

  //     // Return only options that come after the selected frequency
  //     return frequenceOptions.slice(frequencyIndex + 1);
  //   };

  //   // Check if visual frequency should be shown (not when YEARLY is selected)
  //   const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

  //   const validationOptions = [
  //     { value: "EQUAL_TO", label: "= Equal to" },
  //     {
  //       value: "GREATER_THAN_OR_EQUAL_TO",
  //       label: ">= Greater than or equal to",
  //     },
  //     { value: "GREATER_THAN", label: "> Greater than" },
  //     { value: "LESS_THAN", label: "< Less than" },
  //     { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
  //     { value: "BETWEEN", label: "Between" },
  //     { value: "YES_NO", label: "Yes/No" },
  //   ];

  //   const sumAveOptions = [
  //     { value: "sum", label: "Sum" },
  //     {
  //       value: "average",
  //       label: "Average",
  //     },
  //   ];

  //   const hasData = datapointApiData?.hasData;

  //   const vasualFre = watch("visualFrequencyTypes");

  //   return (
  //     <div className="grid grid-cols-2 gap-4">
  //       <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
  //         <Controller
  //           control={control}
  //           name="frequencyType"
  //           rules={{ required: "Frequency is required" }}
  //           render={({ field }) => (
  //             <FormSelect
  //               label="Frequency"
  //               value={field.value}
  //               onChange={(value) => {
  //                 field.onChange(value);
  //                 // Clear visualFrequencyTypes immediately when frequency changes
  //                 setValue("visualFrequencyTypes", []);
  //               }}
  //               options={frequenceOptions}
  //               error={errors.frequencyType}
  //               disabled={hasData}
  //               className={hasData ? "bg-gray-100 p-2 rounded-md" : ""}
  //               isMandatory
  //             />
  //           )}
  //         />
  //         <Controller
  //           control={control}
  //           name="validationType"
  //           rules={{ required: "Validation Type is required" }}
  //           render={({ field }) => (
  //             <FormSelect
  //               label="Validation Type"
  //               value={field.value}
  //               onChange={field.onChange}
  //               options={validationOptions}
  //               error={errors.validationType}
  //               className="p-2 rounded-md"
  //               isMandatory
  //             />
  //           )}
  //         />

  //         {shouldShowVisualFrequency && (
  //           <div className="flex">
  //             <div className="w-full">
  //               <Controller
  //                 control={control}
  //                 name="visualFrequencyTypes"
  //                 render={({ field }) => (
  //                   <FormSelect
  //                     label="Visual Frequency Types"
  //                     value={field.value || []}
  //                     onChange={field.onChange}
  //                     options={getFilteredVisualFrequencyOptions()}
  //                     error={errors.visualFrequencyTypes}
  //                     isMulti={true}
  //                     placeholder="Select visual frequency types"
  //                     disabled={false}
  //                     // className="text-[15px] "
  //                     key={
  //                       selectedFrequency +
  //                       "-" +
  //                       (watch("coreParameterId") || "")
  //                     }
  //                   />
  //                 )}
  //               />
  //             </div>
  //             {vasualFre && (
  //               <div className="w-full ml-3">
  //                 <Controller
  //                   control={control}
  //                   name="visualFrequencyAggregate"
  //                   render={({ field }) => (
  //                     <FormSelect
  //                       label="Sum/Average"
  //                       value={field.value || []}
  //                       onChange={field.onChange}
  //                       options={sumAveOptions}
  //                       error={errors.visualFrequencyAggregate}
  //                       placeholder="Select visual frequency Aggregate"
  //                       disabled={false}
  //                     />
  //                   )}
  //                 />
  //               </div>
  //             )}
  //           </div>
  //         )}
  //         <FormInputField label="Unit" {...register(`unit`)} />
  //       </Card>
  //     </div>
  //   );
  // };

  const Details = () => {
    const { data: employeeData } = useGetEmployeeDd({
      filter: { isDeactivated: false },
    });

    const frequenceOptions = [
      { value: "DAILY", label: "Daily" },
      { value: "WEEKLY", label: "Weekly" },
      { value: "MONTHLY", label: "Monthly" },
      { value: "QUARTERLY", label: "Quarterly" },
      { value: "HALFYEARLY", label: "Half-Yearly" },
      { value: "YEARLY", label: "Yearly" },
    ];
    // Get the selected frequency value
    const selectedFrequency = useWatch({ name: "frequencyType", control });
    const validationType = useWatch({ name: "validationType", control });
    const visualFrequencyTypes = useWatch({
      name: "visualFrequencyTypes",
      control,
    });
    const visualFrequencyAggregate = useWatch({
      name: "visualFrequencyAggregate",
      control,
    });

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

    // Check if sum/ave field should be shown
    const shouldShowSumAveField =
      validationType !== "YES_NO" && visualFrequencyTypes?.length > 0;

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

    const sumAveOptions = [
      { value: "sum", label: "Sum" },
      {
        value: "average",
        label: "Average",
      },
    ];

    useEffect(() => {
      if (
        validationType !== "YES_NO" &&
        visualFrequencyTypes?.length > 0 &&
        !visualFrequencyAggregate
      ) {
        setValue("visualFrequencyAggregate", "sum");
      }
    }, [validationType, visualFrequencyTypes, visualFrequencyAggregate]);

    const allOptions = (employeeData?.data || [])
      .filter((item) => !item.isDeactivated)
      .map((emp) => ({
        value: emp.employeeId,
        label: emp.employeeName,
      }));

    const employee = watch("employeeId");

    const getEmployeeName = (emp: DataPointEmployee) => {
      if (emp?.employeeName) return emp.employeeName;
      const found = employeeData?.data?.find(
        (e: EmployeeDetails) => e.employeeId === emp.employeeId,
      );
      return found?.employeeName || emp.employeeId || "";
    };

    // const validationType = useWatch({ name: "validationType", control });

    const showBoth = validationType === "6" || validationType === "BETWEEN";
    const showYesNo = validationType === "7" || validationType === "YES_NO";

    const yesnoOptions = [
      { label: "Yes", value: "1" },
      { label: "No", value: "0" },
    ];

    return (
      <div className="h-[calc(100vh-200px)]">
        <div className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
          {/* {selectedKpi && selectedKpi.KPIName && (
            <FormInputField
              label="Selected Kpi"
              value={selectedKpi.KPIName}
              disabled
              className="h-[44px] border-gray-300"
            />
          )} */}

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
                  setValue("visualFrequencyTypes", []);
                }}
                options={frequenceOptions}
                error={errors.frequencyType}
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
                // labelClass="mb-2"
              />
            )}
          />

          {shouldShowVisualFrequency && (
            <div className="flex">
              <div className="w-full">
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
                        selectedFrequency +
                        "-" +
                        (watch("coreParameterId") || "")
                      }
                    />
                  )}
                />
              </div>
              {shouldShowSumAveField && (
                <div className="w-full ml-3 max-w-40">
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
                        triggerClassName="w-full mb-0 border rounded-md px-3 text-left text-sm py-4"
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}
          <FormInputField
            label="Unit"
            {...register(`unit`)}
            className="h-[38px] mt-2"
          />
        </div>
        <div className="px-4 py-4 border-t-2">
          <div className="mb-2">
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
            {/* <Controller
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
                  />
                )}
              /> */}
          </div>
          {employee && (
            <div>
              <div key={employee} className="flex mb-2 flex-col gap-2">
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
          )}
        </div>
      </div>
    );
  };

  // const AssignUser = () => {
  //   const { data: employeeData } = useGetEmployeeDd({
  //     filter: { isDeactivated: false },
  //   });

  //   const allOptions = (employeeData?.data || [])
  //     .filter((item) => !item.isDeactivated)
  //     .map((emp) => ({
  //       value: emp.employeeId,
  //       label: emp.employeeName,
  //     }));

  //   const employee = watch("employeeId");

  //   const getEmployeeName = (emp: DataPointEmployee) => {
  //     if (emp?.employeeName) return emp.employeeName;
  //     const found = employeeData?.data?.find(
  //       (e: EmployeeDetails) => e.employeeId === emp.employeeId
  //     );
  //     return found?.employeeName || emp.employeeId || "";
  //   };

  //   const validationType = useWatch({ name: "validationType", control });

  //   const showBoth = validationType === "6" || validationType === "BETWEEN";
  //   const showYesNo = validationType === "7" || validationType === "YES_NO";

  //   const yesnoOptions = [
  //     { label: "Yes", value: "1" },
  //     { label: "No", value: "0" },
  //   ];

  //   return (
  //     <div>
  //       <div className="w-fit min-w-96">
  //         <Controller
  //           control={control}
  //           name="employeeId"
  //           rules={{ required: "Employee is required" }}
  //           render={({ field }) => (
  //             <FormSelect
  //               label="Employee"
  //               value={field.value}
  //               onChange={(value) => {
  //                 field.onChange(value);
  //                 setValue("employeeId", value);
  //               }}
  //               options={allOptions}
  //               error={errors.employeeId}
  //               isMandatory
  //             />
  //           )}
  //         />
  //       </div>
  //       <div className="mt-5">
  //         {employee && (
  //           <div>
  //             <div key={employee} className="flex flex-col gap-2">
  //               <Label className="text-[18px] mb-0">
  //                 {getEmployeeName(employee)}
  //               </Label>
  //               <div
  //                 className={`grid ${
  //                   showBoth ? "grid-cols-2" : "grid-cols-1"
  //                 } gap-4 mt-0`}
  //               >
  //                 {!showYesNo && (
  //                   <>
  //                     <FormInputField
  //                       label="Goal Value 1"
  //                       isMandatory
  //                       {...register(`value1`, {
  //                         required: "Please enter Goal Value 1",
  //                       })}
  //                       error={errors?.value1}
  //                       // disabled={isDisabled}
  //                       // readOnly={isDisabled}
  //                     />
  //                     {showBoth && (
  //                       <FormInputField
  //                         isMandatory
  //                         label="Goal Value 2"
  //                         {...register(`value2`, {
  //                           required: "Please enter Goal Value 2",
  //                         })}
  //                         error={errors?.value2}
  //                         // disabled={isDisabled}
  //                         // readOnly={isDisabled}
  //                       />
  //                     )}
  //                   </>
  //                 )}
  //                 {showYesNo && (
  //                   <Controller
  //                     name={`value1`}
  //                     control={control}
  //                     rules={{ required: "Please select Yes or No" }}
  //                     render={({ field, fieldState }) => {
  //                       const selectedOption =
  //                         field.value?.value ?? field.value ?? "";
  //                       return (
  //                         <FormSelect
  //                           {...field}
  //                           label="Yes/No"
  //                           options={yesnoOptions}
  //                           error={fieldState.error}
  //                           isMandatory={true}
  //                           value={selectedOption}
  //                           onChange={field.onChange}
  //                         />
  //                       );
  //                     }}
  //                   />
  //                 )}
  //               </div>
  //               <FormInputField
  //                 label="Tag"
  //                 // isMandatory
  //                 {...register(`tag`)}
  //                 error={errors?.tag}
  //                 // disabled={isDisabled}
  //                 // readOnly={isDisabled}
  //               />
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    Kpi,
    Details,
    // AssignUser,
    KpiPreview: getValues(),
    trigger,
    isPending,
    permission,
    selectedKpi,
  };
}

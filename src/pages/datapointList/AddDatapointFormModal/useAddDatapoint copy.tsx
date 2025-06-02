import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import { useNavigate, useParams } from "react-router-dom";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { Label } from "@/components/ui/label";
import FormSelect from "@/components/shared/Form/FormSelect";
import {
  useAddUpdateDatapoint,
  useGetDatapointById,
  useGetKpiNonSel,
} from "@/features/api/companyDatapoint";
// import useGetCoreParameter from "@/features/api/coreParameter/useGetCoreParameter";
export default function useAddEmployee() {
  const { id: companykpimasterId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addDatapoint } = useAddUpdateDatapoint();
  const navigate = useNavigate();

  const { data: datapointApiData } = useGetDatapointById(
    companykpimasterId || "",
  );

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
  } = useForm({
    mode: "onChange",
  });

  console.log(datapointApiData);

  // Add this array for validation type options
  const validationTypeOptions = [
    { validationTypeId: "1", validationType: "EQUAL_TO" },
    { validationTypeId: "2", validationType: "GREATER_THAN_OR_EQUAL_TO" },
    { validationTypeId: "3", validationType: "GREATER_THAN" },
    { validationTypeId: "4", validationType: "LESS_THAN" },
    { validationTypeId: "5", validationType: "LESS_THAN_OR_EQUAL_TO" },
    { validationTypeId: "6", validationType: "BETWEEN" },
    { validationTypeId: "7", validationType: "YES_NO" },
  ];

  useEffect(() => {
    if (datapointApiData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resetObj: any = {
        dataPointName:
          datapointApiData?.KPIMaster?.KPILabel ||
          datapointApiData?.dataPointName,
        KPIMasterId: datapointApiData?.KPIMasterId,
        dataPointLabel:
          datapointApiData?.KPIMaster?.KPIName ||
          datapointApiData?.dataPointLabel,
        frequencyType: datapointApiData?.frequencyType,
        // Match validationType by name and set the whole object
        validationType:
          validationTypeOptions.find(
            (v) => v.validationType === datapointApiData?.validationType,
          ) || datapointApiData?.validationType,
      };

      if (Array.isArray(datapointApiData?.dataPointEmployeeJunction)) {
        resetObj.employeeId = datapointApiData.dataPointEmployeeJunction.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (u: any) => ({
            employeeId: u.employeeId,
            employeeName: u.employeeName,
          }),
        );
        datapointApiData.dataPointEmployeeJunction.forEach(
          (u: DataPointEmployee) => {
            resetObj[`goalValue1_${u.employeeId}`] = u.value1;
            resetObj[`goalValue2_${u.employeeId}`] = u.value2;
          },
        );
        // If validationType is YES_NO, set yesno field based on value1
        const isYesNo =
          (resetObj.validationType &&
            (resetObj.validationType.validationType === "YES_NO" ||
              resetObj.validationType === "YES_NO")) ||
          false;
        if (isYesNo) {
          datapointApiData.dataPointEmployeeJunction.forEach(
            (u: DataPointEmployee) => {
              resetObj[`yesno_${u.employeeId}`] =
                u.value1 === "1" ? "yes" : "no";
            },
          );
        }
      }

      reset(resetObj);
    }
  }, [datapointApiData, reset]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    // Normalize selected employees
    let selectedEmployees = data.employeeId || [];
    if (!Array.isArray(selectedEmployees)) {
      selectedEmployees = selectedEmployees ? [selectedEmployees] : [];
    }

    // Get validationType string value
    let validationTypeValue = "";
    if (
      typeof data.validationType === "object" &&
      data.validationType?.validationType
    ) {
      validationTypeValue = data.validationType.validationType;
    } else if (typeof data.validationType === "string") {
      validationTypeValue = data.validationType;
    }

    // Get validationTypeId for logic
    const validationTypeId =
      data?.validationType?.validationTypeId ?? data?.validationTypeId ?? "";

    // Build assignUser array with all required fields
    const assignUser = selectedEmployees.map((emp: DataPointEmployee) => {
      let value1 = "";
      let value2 = "0";
      if (String(validationTypeId) === "6") {
        // BETWEEN
        value1 = data[`goalValue1_${emp.employeeId}`];
        value2 = data[`goalValue2_${emp.employeeId}`];
      } else if (String(validationTypeId) === "7") {
        // YES_NO
        const yesnoValue = data[`yesno_${emp.employeeId}`];
        value1 = yesnoValue === "yes" ? "1" : "0";
      } else {
        // Single value
        value1 = data[`goalValue1_${emp.employeeId}`];
      }
      return {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        value1: value1,
        value2: value2,
      };
    });

    // Build payload with all required fields
    const payload = {
      dataPointName: data.dataPointName || "",
      KPIMasterId: data.KPIMasterId || "",
      dataPointLabel: data.dataPointLabel || "",
      validationType: validationTypeValue,
      frequencyType: data.frequencyType || data.frequencyId || "",
      assignUser,
      companykpimasterId: companykpimasterId || "",
    };

    addDatapoint(payload, {
      onSuccess: () => {
        handleModalClose();
      },
    });
    navigate("/dashboard/datapoint");
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const isUpdateMode = !!datapointApiData;

  const Kpi = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });
    const { data: kpidata } = useGetKpiNonSel({
      filter: paginationFilter,
    });

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "KPINames", label: "Kpi Name", visible: true },
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
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4 ">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            </div>
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
                  srNo: index + 1,
                  KPINames: `${item.KPIName} ( ${item.KPILabel} )`,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="KPIMasterId"
                paginationDetails={kpidata}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                // permissionKey="--"
              />
            </>
          )}
        />
      </div>
    );
  };

  const Frequency = () => {
    const frequencyData = {
      data: [
        { frequencyId: "1", frequencyName: "DAILY" },
        {
          frequencyId: "2",
          frequencyName: "WEEKLY",
        },
        {
          frequencyId: "3",
          frequencyName: "MONTHLY",
        },
        {
          frequencyId: "4",
          frequencyName: "QUARTERLY",
        },
        {
          frequencyId: "5",
          frequencyName: "YEARLY",
        },
        {
          frequencyId: "6",
          frequencyName: "HALFYEARLY",
        },
      ],
      totalPages: 1,
      currentPage: 1,
      totalRecords: 5,
    };

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "frequencyName", label: "Frequency", visible: true },
    ]);

    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    const onToggleColumn = (key: string) => {
      setColumnToggleOptions((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, visible: !col.visible } : col,
        ),
      );
    };

    const canToggleColumns = columnToggleOptions.length > 3;

    return (
      <div>
        <div className="mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            </div>
          )}
        </div>

        <Controller
          name="frequencyId"
          control={control}
          rules={{ required: "Please select a Frequency" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.frequencyId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.frequencyId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={frequencyData.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="frequencyId"
                paginationDetails={frequencyData}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
              />
            </>
          )}
        />
      </div>
    );
  };

  const ValidationType = () => {
    const filterOptionsData = {
      data: [
        { validationTypeId: "1", validationType: "EQUAL_TO" },
        {
          validationTypeId: "2",
          validationType: "GREATER_THAN_OR_EQUAL_TO",
        },
        {
          validationTypeId: "3",
          validationType: "GREATER_THAN",
        },
        { validationTypeId: "4", validationType: "LESS_THAN" },
        { validationTypeId: "5", validationType: "LESS_THAN_OR_EQUAL_TO" },
        { validationTypeId: "6", validationType: "BETWEEN" },
        { validationTypeId: "7", validationType: "YES_NO" },
      ],
      totalPages: 1,
      currentPage: 1,
      totalRecords: 8,
    };

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "validationType", label: "Condition", visible: true },
    ]);

    const visibleColumns = columnToggleOptions.reduce(
      (acc, col) => {
        if (col.visible) acc[col.key] = col.label;
        return acc;
      },
      {} as Record<string, string>,
    );

    const onToggleColumn = (key: string) => {
      setColumnToggleOptions((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, visible: !col.visible } : col,
        ),
      );
    };

    const canToggleColumns = columnToggleOptions.length > 3;

    return (
      <div>
        <div className="mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            </div>
          )}
        </div>

        <Controller
          name="validationType"
          control={control}
          rules={{ required: "Please select a Validation Type" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.validationType && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.validationType?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={filterOptionsData.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="validationType"
                paginationDetails={filterOptionsData}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
              />
            </>
          )}
        />
      </div>
    );
  };

  // const CoreParameter = () => {
  //   const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
  //     currentPage: 1,
  //     pageSize: 10,
  //     search: "",
  //   });
  //   const { data: CoreparameterData } = useGetCoreParameter({
  //     filter: paginationFilter,
  //   });

  //   const [columnToggleOptions, setColumnToggleOptions] = useState([
  //     { key: "srNo", label: "Sr No", visible: true },
  //     { key: "coreParameterName", label: "coreParameter Name", visible: true },
  //   ]);

  //   // Filter visible columns
  //   const visibleColumns = columnToggleOptions.reduce(
  //     (acc, col) => {
  //       if (col.visible) acc[col.key] = col.label;
  //       return acc;
  //     },
  //     {} as Record<string, string>
  //   );

  //   // Toggle column visibility
  //   const onToggleColumn = (key: string) => {
  //     setColumnToggleOptions((prev) =>
  //       prev.map((col) =>
  //         col.key === key ? { ...col, visible: !col.visible } : col
  //       )
  //     );
  //   };
  //   // Check if the number of columns is more than 3
  //   const canToggleColumns = columnToggleOptions.length > 3;

  //   return (
  //     <div>
  //       <div className=" mt-1 flex items-center justify-between">
  //         {canToggleColumns && (
  //           <div className="ml-4 ">
  //             <DropdownSearchMenu
  //               columns={columnToggleOptions}
  //               onToggleColumn={onToggleColumn}
  //             />
  //           </div>
  //         )}
  //       </div>

  //       <Controller
  //         name="KPIMasterId"
  //         control={control}
  //         rules={{ required: "Please select a Kpi" }}
  //         render={({ field }) => (
  //           <>
  //             <div className="mb-4">
  //               {errors?.KPIMasterId && (
  //                 <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
  //                   {String(errors?.KPIMasterId?.message || "")}
  //                 </span>
  //               )}
  //             </div>
  //             <TableData
  //               {...field}
  //               tableData={CoreparameterData?.data.map((item, index) => ({
  //                 ...item,
  //                 srNo: index + 1,
  //               }))}
  //               isActionButton={() => false}
  //               columns={visibleColumns}
  //               primaryKey="KPIMasterId"
  //               paginationDetails={CoreparameterData}
  //               setPaginationFilter={setPaginationFilter}
  //               multiSelect={false}
  //               selectedValue={field.value}
  //               handleChange={field.onChange}
  //               // permissionKey="--"
  //             />
  //           </>
  //         )}
  //       />
  //     </div>
  //   );
  // };

  const AssignUser = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
      //   status: currentStatus, // Use currentStatus state
    });

    const { data: employeedata } = getEmployee({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "employeeName", label: "Assign Use", visible: true },
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
        <div className=" mt-1 flex items-center justify-between">
          {canToggleColumns && (
            <div className="ml-4 ">
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            </div>
          )}
        </div>

        <Controller
          name="employeeId"
          control={control}
          rules={{ required: "Please select a Assign User" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.employeeId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.employeeId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={employeedata?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
                selectedValue={field.value}
                handleChange={field.onChange}
              />
            </>
          )}
        />
      </div>
    );
  };

  const GoalValue = () => {
    // Use the correct value for validationType
    const validationType = useWatch({ name: "validationType", control });
    const selectedEmployees = useWatch({ name: "employeeId", control }) || [];

    // Get validationTypeId from object or string
    const validationTypeId =
      typeof validationType === "object"
        ? validationType?.validationTypeId
        : validationType;

    const showBoth = String(validationTypeId) === "6";
    const showYesNo = String(validationTypeId) === "7";

    const yesnoOptions = [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ];

    return (
      <div className="flex flex-col gap-6">
        {selectedEmployees.map((emp: DataPointEmployee, index: number) => (
          <div key={emp?.employeeId || index} className="flex flex-col gap-2">
            <Label className="text-[18px] mb-0">{emp?.employeeName}</Label>
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
                    {...register(`goalValue1_${emp.employeeId}`, {
                      required: "Please enter Goal Value 1",
                    })}
                    error={errors?.[`goalValue1_${emp.employeeId}`]}
                  />
                  {showBoth && (
                    <FormInputField
                      isMandatory
                      label="Goal Value 2"
                      {...register(`goalValue2_${emp.employeeId}`, {
                        required: "Please enter Goal Value 2",
                      })}
                      error={errors?.[`goalValue2_${emp.employeeId}`]}
                    />
                  )}
                </>
              )}
              {showYesNo && (
                <Controller
                  name={`yesno_${emp.employeeId}`}
                  control={control}
                  rules={{ required: "Please select Yes or No" }}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      {...field}
                      label="Yes/No"
                      options={yesnoOptions}
                      error={fieldState.error}
                      isMandatory={true}
                    />
                  )}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    Kpi,
    Frequency,
    ValidationType,
    // CoreParameter,
    AssignUser,
    GoalValue,
    KpiPreview: getValues(),
    // employeeId,
    trigger,
    skipToStep: isUpdateMode ? 2 : 0,
  };
}

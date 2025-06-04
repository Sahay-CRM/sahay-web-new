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
import useGetCoreParameter from "@/features/api/coreParameter/useGetCoreParameter";
import { useGetProduct } from "@/features/api/Product";
import { Card } from "@/components/ui/card";
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

  useEffect(() => {
    if (datapointApiData) {
      const data = datapointApiData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resetObj: any = {
        KPIName: data?.KPIMaster?.KPILabel || data?.dataPointName,
        KPIMasterId: data?.KPIMasterId,
        dataPointLabel: data?.KPIMaster?.KPIName || data?.dataPointLabel,
        coreParameterId: data?.coreParameter,
        // frequencyId and validationTypeId now expect string values
        frequencyId: data?.frequencyType || "",
        unit: data?.unit || "",
        validationTypeId: data?.validationType || "",
      };

      if (Array.isArray(data?.DataPointProductJunction)) {
        resetObj.productId = data.DataPointProductJunction.map(
          (u: ProductData) => ({
            productId: u.productId,
            productName: u.productName,
          }),
        );
      }
      if (Array.isArray(data?.dataPointEmployeeJunction)) {
        resetObj.employeeId = data.dataPointEmployeeJunction.map(
          (u: DataPointEmployee) => ({
            employeeId: u.employeeId,
            employeeName: u.employeeName,
          }),
        );
        data.dataPointEmployeeJunction.forEach((u: DataPointEmployee) => {
          resetObj[`goalValue1_${u.employeeId}`] = u.value1;
          resetObj[`yesno_${u.employeeId}`] = u.value1;
          resetObj[`goalValue2_${u.employeeId}`] = u.value2;
        });
        const isYesNo =
          (resetObj.validationType &&
            (resetObj.validationType.validationType === "YES_NO" ||
              resetObj.validationType === "YES_NO")) ||
          false;
        if (isYesNo) {
          datapointApiData.dataPointEmployeeJunction.forEach(
            (u: DataPointEmployee) => {
              const yesNoValue = u.value1 === "1" ? "1" : "0";

              resetObj[`yesno_${u.employeeId}`] = {
                value: yesNoValue,
                label: yesNoValue === "1" ? "Yes" : "No",
              };
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
    // Prepare productIds as array of strings, or blank array if not selected
    let productIds: string[] = [];
    if (Array.isArray(data.productId) && data.productId.length > 0) {
      productIds = data.productId.map((p: ProductData) =>
        typeof p === "object" && p !== null
          ? String(p.productId ?? p.productId ?? "")
          : String(p ?? ""),
      );
    }
    // frequencyId and validationTypeId are now string values
    const frequencyValue = data.frequencyId;
    const unit = data.unit;
    const validationTypeValue = data.validationTypeId;

    const assignUser = selectedEmployees.map((emp: DataPointEmployee) => {
      const obj: DataPointEmployee = {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
      };
      if (
        String(validationTypeValue) === "6" ||
        validationTypeValue === "BETWEEN"
      ) {
        obj.value1 = data[`goalValue1_${emp.employeeId}`];
        obj.value2 = data[`goalValue2_${emp.employeeId}`];
      } else if (
        String(validationTypeValue) === "7" ||
        validationTypeValue === "YES_NO"
      ) {
        const yesnoValue = data[`yesno_${emp.employeeId}`];
        let value = yesnoValue;
        if (typeof yesnoValue === "object" && yesnoValue !== null) {
          value = yesnoValue.value;
        }
        if (value === "1" || value === 1 || value === "yes") {
          obj.value1 = "1";
        } else {
          obj.value1 = "0";
        }
      } else {
        obj.value1 = data[`goalValue1_${emp.employeeId}`];
      }
      return obj;
    });
    const payload = {
      ...data,
      companykpimasterId: companykpimasterId || "",
      assignUser,
      productIds, // will be [] if not selected
      frequencyType: frequencyValue,
      validationType: validationTypeValue,
      unit: unit,
    };
    addDatapoint(payload, {
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
    const frequenceOptions = [
      { value: "DAILY", label: "DAILY" },
      { value: "WEEKLY", label: "WEEKLY" },
      { value: "MONTHLY", label: "MONTHLY" },
      { value: "QUARTERLY", label: "QUARTERLY" },
      { value: "YEARLY", label: "YEARLY" },
      { value: "HALFYEARLY", label: "HALFYEARLY" },
    ];
    const validationOptions = [
      { value: "EQUAL_TO", label: "EQUAL_TO" },
      { value: "GREATER_THAN_OR_EQUAL_TO", label: "GREATER_THAN_OR_EQUAL_TO" },
      { value: "GREATER_THAN", label: "GREATER_THAN" },
      { value: "LESS_THAN", label: "LESS_THAN" },
      { value: "LESS_THAN_OR_EQUAL_TO", label: "LESS_THAN_OR_EQUAL_TO" },
      { value: "BETWEEN", label: "BETWEEN" },
      { value: "YES_NO", label: "YES_NO" },
    ];
    const unitTypeOptions = [
      { value: "Number", label: "Number" },
      { value: "Percentage", label: "Percentage" },
      { value: "Dollar", label: "Dollar" },
      { value: "Urros", label: "Urros" },
      { value: "Pounds", label: "Pounds" },
      { value: "INR", label: "INR" },
    ];
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="frequencyId"
            rules={{ required: "Frequency is required" }}
            render={({ field }) => (
              <FormSelect
                label="Frequency"
                value={field.value}
                onChange={field.onChange}
                options={frequenceOptions}
                error={errors.frequencyId}
              />
            )}
          />
          <Controller
            control={control}
            name="validationTypeId"
            rules={{ required: "Validation Type is required" }}
            render={({ field }) => (
              <FormSelect
                label="Validation Type"
                value={field.value}
                onChange={field.onChange}
                options={validationOptions}
                error={errors.validationTypeId}
              />
            )}
          />
          <Controller
            control={control}
            name="unit"
            rules={{ required: "Unit Type is required" }}
            render={({ field }) => (
              <FormSelect
                label="Unit Type"
                value={field.value}
                onChange={field.onChange}
                options={unitTypeOptions}
                error={errors.unit}
              />
            )}
          />
        </Card>
      </div>
    );
  };

  const CoreParameter = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
      //   status: currentStatus, // Use currentStatus state
    });

    const { data: coreparameterData } = useGetCoreParameter({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "coreParameterName", label: "CoreParameter Name", visible: true },
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
          name="coreParameterId"
          control={control}
          rules={{ required: "Please select a CoreParameter" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.coreParameterId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.coreParameterId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={coreparameterData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={visibleColumns}
                primaryKey="coreParameterId"
                paginationDetails={coreparameterData}
                setPaginationFilter={setPaginationFilter}
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

  const Product = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
      //   status: currentStatus, // Use currentStatus state
    });

    const { data: ProductData } = useGetProduct({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "productName", label: "product Name", visible: true },
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
          name="productId"
          control={control}
          // No rules here, so it's optional
          render={({ field }) => (
            <>
              <TableData
                {...field}
                tableData={ProductData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                columns={visibleColumns}
                primaryKey="productId"
                paginationDetails={ProductData}
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
    // Now validationTypeId is a string value
    const validationTypeId = useWatch({ name: "validationTypeId", control });
    const selectedEmployees = useWatch({ name: "employeeId", control }) || [];

    // Get all employees for fallback lookup
    const { data: employeedata } = getEmployee({
      filter: { currentPage: 1, pageSize: 1000, search: "" },
    });

    const showBoth = validationTypeId === "6" || validationTypeId === "BETWEEN";
    const showYesNo = validationTypeId === "7" || validationTypeId === "YES_NO";

    const yesnoOptions = [
      { label: "Yes", value: "1" },
      { label: "No", value: "0" },
    ];

    // Helper to get employeeName by id if missing
    const getEmployeeName = (emp: DataPointEmployee) => {
      if (emp?.employeeName) return emp.employeeName;
      const found = employeedata?.data?.find(
        (e: EmployeeDetails) => e.employeeId === emp.employeeId,
      );
      return found?.employeeName || emp.employeeId || "";
    };

    return (
      <div className="flex flex-col gap-6">
        {selectedEmployees.map((emp: DataPointEmployee, index: number) => (
          <div key={emp?.employeeId || index} className="flex flex-col gap-2">
            <Label className="text-[18px] mb-0">{getEmployeeName(emp)}</Label>
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
    CoreParameter,
    Product,
    AssignUser,
    GoalValue,
    KpiPreview: getValues(),
    trigger,
    skipToStep: isUpdateMode ? 5 : isUpdateModeforFalse ? 1 : 0,
  };
}

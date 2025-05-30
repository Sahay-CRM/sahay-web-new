import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import { getALLDepartmentList } from "@/features/api/department";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getDesignaationDropdown } from "@/features/api/designation";
import { getEmployee } from "@/features/api/companyEmployee";

export default function useAddEmployee() {
  const { id: employeeId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addEmployee } = useAddOrUpdateEmployee();

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
  } = useForm({
    mode: "onChange",
    // values: employeeApiData, // If you have employee data to prefill
  });

  // Watch employeeType field
  const employeeTypeValue = watch("employeeType");
  const showNextStep = employeeTypeValue !== "owner";

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    addEmployee(data, {
      onSuccess: () => {
        handleModalClose();
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const EmployeeStatus = () => {
    const [countryCode, setCountryCode] = useState<string>("+91");
    const employeeTypeOptions = [
      { value: "employee", label: "Employee" },
      { value: "owner", label: "Owner" },
    ];
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
          <FormInputField
            label="Employee Name"
            {...register("employeeName", { required: "Name is required" })}
            error={errors.employeeName}
          />
          <FormInputField
            label="Email"
            {...register("employeeEmail", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter valid email",
              },
            })}
            error={errors.employeeEmail}
          />
          <FormInputField
            id="employeeMobile"
            label="Mobile Number"
            {...register("employeeMobile", {
              required: "Please enter your mobile number",
            })}
            error={errors.employeeMobile}
            placeholder="Enter mobile number"
            options={[{ value: "+91", label: "+91" }]}
            selectedCodeValue={countryCode || "+91"}
            onCountryCodeChange={setCountryCode}
            className="text-lg"
          />
          <Controller
            control={control}
            name="employeeType"
            rules={{ required: "Employee Type is required" }}
            render={({ field }) => (
              <FormSelect
                label="Employee Type"
                value={field.value}
                onChange={field.onChange}
                options={employeeTypeOptions}
                error={errors.employeeType}
              />
            )}
          />
        </Card>
      </div>
    );
  };

  const DepartmentSelect = () => {
    const { data: departmentData } = getALLDepartmentList();
    // const designationData = [
    //   { value: "des1", label: "Executive" },
    //   { value: "des2", label: "Manager" },
    // ];
    // const employees = [
    //   { value: "emp1", label: "John Doe" },
    //   { value: "emp2", label: "Jane Smith" },
    // ];

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "departmentName", label: "Department Name", visible: true },
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
          name="departmentId"
          control={control}
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={departmentData?.data.map((item, index) => ({
                ...item,
                srNo: index + 1,
              }))}
              isActionButton={false}
              columns={visibleColumns}
              primaryKey="departmentId"
              paginationDetails={departmentData}
              // setPaginationFilter={setPaginationFilter}
              multiSelect={false}
              selectedValue={field.value}
              handleChange={field.onChange}
              // permissionKey="--"
            />
          )}
        />
      </div>
    );
  };

  const EmployeeType = () => {
    const { data: designationData } = getDesignaationDropdown();

    // const employees = [
    //   { value: "emp1", label: "John Doe" },
    //   { value: "emp2", label: "Jane Smith" },
    // ];

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "designationName", label: "Designation Name", visible: true },
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
          name="departmentId"
          control={control}
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={designationData?.data.map((item, index) => ({
                ...item,
                srNo: index + 1,
              }))}
              isActionButton={false}
              columns={visibleColumns}
              primaryKey="departmentId"
              paginationDetails={designationData}
              // setPaginationFilter={setPaginationFilter}
              multiSelect={false}
              selectedValue={field.value}
              handleChange={field.onChange}
              // permissionKey="--"
            />
          )}
        />
      </div>
    );
  };
  const ReportingManage = () => {
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
      { key: "employeeName", label: "Reporting Manager", visible: true },
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
          rules={{ required: "Please select a Task Priority" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={employeedata?.data.map((item, index) => ({
                ...item,
                srNo: index + 1,
              }))}
              isActionButton={false}
              columns={visibleColumns}
              primaryKey="employeeId"
              paginationDetails={employeedata}
              setPaginationFilter={setPaginationFilter}
              multiSelect={false}
              selectedValue={field.value}
              handleChange={field.onChange}
              // permissionKey="--"
            />
          )}
        />
      </div>
    );
  };

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    EmployeeStatus,
    DepartmentSelect,
    EmployeeType,
    ReportingManage,
    employeePreview: getValues(),
    employeeId,
    trigger,
    showNextStep,
  };
}

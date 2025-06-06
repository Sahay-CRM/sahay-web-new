import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/ui/card";
import FormSelect from "@/components/shared/Form/FormSelect";
import useAddOrUpdateEmployee from "@/features/api/companyEmployee/useAddEmployee";
import { getDepartmentList } from "@/features/api/department";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";
import useGetDesignation from "@/features/api/designation/useGetDesignation";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";

export default function useAddEmployee() {
  const { id: companyEmployeeId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addEmployee } = useAddOrUpdateEmployee();
  const { data: employeeApiData } = useGetEmployeeById(companyEmployeeId || "");

  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
  } = useForm<EmployeeData>({
    mode: "onChange",
  });

  useEffect(() => {
    if (employeeApiData?.data) {
      const data = employeeApiData?.data;

      reset({
        employeeName: data.employeeName || "",
        employeeEmail: data.employeeEmail || "",
        employeeMobile: data.employeeMobile || "",
        employeeType: data.employeeType || "",
        department: data.department
          ? data.department
          : data.departmentId
            ? { departmentId: data.departmentId }
            : null,
        designation: data.designation
          ? data.designation
          : data.designationId
            ? { designationId: data.designationId }
            : null,
        employee: data.reportingManager || undefined,
      });
    }
  }, [employeeApiData, reset]);

  // Watch employeeType field

  const employeeTypeValue = watch("employeeType");
  const department = watch("department") as { departmentId?: string } | null;
  const showNextStep = employeeTypeValue !== "OWNER";

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    // Ensure employeeMobile starts with +91, but don't add if already present
    let employeeMobile = data.employeeMobile || "";
    if (!employeeMobile.startsWith("+91")) {
      employeeMobile = "+91" + employeeMobile;
    }
    console.log(data);

    const payload = {
      companyEmployeeId: companyEmployeeId,
      departmentId: data.department?.departmentId || data.departmentId,
      designationId: data.designation?.designationId || data.designationId,
      reportingManagerId: data.employee?.employeeId ?? null,
      ...data,
    };
    addEmployee(payload, {
      onSuccess: () => {
        handleModalClose();
        navigate("/dashboard/company-employee");
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
      { value: "EMPLOYEE", label: "EMPLOYEE" },
      { value: "OWNER", label: "OWNER" },
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
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: departmentData } = getDepartmentList({
      filter: paginationFilter,
    });
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
          name="department"
          control={control}
          rules={{ required: "Please select a Department" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.departmentId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.departmentId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={departmentData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="departmentId"
                paginationDetails={departmentData}
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

  const EmployeeType = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: designationData } = useGetDesignation({
      filter: {
        ...paginationFilter,
        departmentId: department?.departmentId || "",
      },
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "designationName", label: "Designation Name", visible: true },
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
          name="designation"
          control={control}
          rules={{ required: "Please select a Designation" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.designationId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.designationId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={designationData?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="designationId"
                paginationDetails={designationData}
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
          name="employee"
          control={control}
          rules={{ required: "Please select a report manager" }}
          render={({ field }) => (
            <>
              <TableData
                {...field}
                tableData={employeedata?.data.map((item, index) => ({
                  ...item,
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={(val) => {
                  // Only allow a single value or undefined
                  if (!val || (Array.isArray(val) && val.length === 0)) {
                    field.onChange(undefined);
                  } else if (Array.isArray(val)) {
                    field.onChange(val[0]);
                  } else {
                    field.onChange(val);
                  }
                }}
                // permissionKey="--"
              />
            </>
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
    companyEmployeeId,
    trigger,
    showNextStep,
  };
}

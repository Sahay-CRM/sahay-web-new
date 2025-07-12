import StepProgress from "../../../components/shared/StepProgress";
import useStepForm from "../../../components/shared/StepProgress/useStepForm";
import { Button } from "@/components/ui/button";
import AddEmployeeModal from "./addEmployeeModal";
import useAddEmployee from "./useAddEmployee";
import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Updated imports
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState } from "react"; // Added useState

// Imports for components used within step components
import { Card } from "@/components/ui/card";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";

// Imports for other step components (example)
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getDepartmentList } from "@/features/api/department";
import useGetDesignation from "@/features/api/designation/useGetDesignation";
import { getEmployee } from "@/features/api/companyEmployee";

// --- EmployeeStatus Component Definition ---
const EmployeeStatus = () => {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext();
  const [countryCode, setCountryCode] = useState<string>("+91");
  const employeeTypeOptions = [
    { value: "EMPLOYEE", label: "EMPLOYEE" },
    { value: "OWNER", label: "OWNER" },
  ];

  return (
    <div className="flex gap-5">
      <Card className="flex items-start w-1/3 px-4 py-4">
        <FormImage
          value={watch("photo") ?? ""}
          onChange={(val: unknown) => setValue("photo", val)}
          label="Upload Profile"
        />
      </Card>
      <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4 w-2/3">
        <div>
          <FormInputField
            label="Employee Name"
            {...register("employeeName", { required: "Name is required" })}
            error={errors.employeeName}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div>
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
            onFocus={(e) => e.target.select()}
          />
        </div>
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

// --- DepartmentSelect Component Definition (Refactored) ---
// This component would also use useFormContext and manage its own state/data fetching.
// The data fetching (getDepartmentList) and state (paginationFilter, columnToggleOptions)
// previously in useAddEmployee would move here.
const DepartmentSelect = () => {
  const {
    control,
    formState: { errors: formErrors },
  } = useFormContext(); // Note: errors renamed to formErrors to avoid conflict
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: departmentData } = getDepartmentList({
    // API call directly in component
    filter: paginationFilter,
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "departmentName", label: "Department Name", visible: true },
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
        name="department" // Ensure this name matches what's expected in useAddEmployee's reset/payload
        control={control}
        rules={{ required: "Please select a Department" }}
        render={({ field }) => (
          <>
            <div className="mb-4">
              {formErrors?.department && ( // Use formErrors.department (or formErrors.departmentId if that's the field name)
                <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                  {/* Adjust error message access based on actual error object structure */}
                  {String(
                    formErrors.department?.message ||
                      formErrors.departmentId?.message ||
                      "",
                  )}
                </span>
              )}
            </div>
            <TableData
              {...field}
              tableData={departmentData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (departmentData.currentPage - 1) * departmentData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="departmentId"
              paginationDetails={departmentData}
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

// --- Designation Component Definition (Placeholder - Needs Full Refactor) ---
const Designation = () => {
  const {
    control,
    watch,
    formState: { errors: formErrors },
  } = useFormContext();
  const departmentField = watch("department") as {
    departmentId?: string;
  } | null; // Watch for departmentId

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: designationData } = useGetDesignation({
    filter: {
      ...paginationFilter,
      departmentId: departmentField?.departmentId || "", // Use watched departmentId
    },
  });
  // ... rest of Designation logic (column toggles, etc.) ...
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
              {formErrors?.designation && (
                <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                  {String(
                    formErrors.designation?.message ||
                      formErrors.designationId?.message ||
                      "",
                  )}
                </span>
              )}
            </div>
            <TableData
              {...field}
              tableData={designationData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (designationData.currentPage - 1) * designationData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="designationId"
              paginationDetails={designationData as PaginationFilter} // Cast might be needed
              setPaginationFilter={setPaginationFilter}
              onCheckbox={() => true}
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

// --- ReportingManage Component Definition (Placeholder - Needs Full Refactor) ---
const ReportingManage = () => {
  const { control } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: employeedata } = getEmployee({
    // API call
    filter: paginationFilter,
  });
  // ... rest of ReportingManage logic ...
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Reporting Manager", visible: true },
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
        name="employee" // This is for the reporting manager selection
        control={control}
        rules={{ required: "Please select a report manager" }}
        render={({ field }) => (
          <>
            {/* Error display for reporting manager if needed */}
            <TableData
              {...field}
              tableData={employeedata?.data.map((item, index) => ({
                ...item,
                srNo:
                  (employeedata.currentPage - 1) * employeedata.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="employeeId"
              paginationDetails={employeedata as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              selectedValue={field.value}
              onCheckbox={() => true}
              handleChange={(val) => {
                if (!val || (Array.isArray(val) && val.length === 0)) {
                  field.onChange(undefined);
                } else if (Array.isArray(val)) {
                  field.onChange(val[0]);
                } else {
                  field.onChange(val);
                }
              }}
            />
          </>
        )}
      />
    </div>
  );
};

const AddEmployee = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger, // Kept, as it's used by useStepForm
    employeePreview,
    showNextStep,
    companyEmployeeId,
    isPending,
    employeeApiData,
    methods, // This is the methods object from useForm in useAddEmployee
  } = useAddEmployee();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Employee", href: "/dashboard/company-employee" },
      {
        label: companyEmployeeId
          ? "Company Employee Update"
          : "Company Employee Add",
        href: "",
      },
      ...(companyEmployeeId
        ? [
            {
              label: `${
                employeeApiData?.data?.employeeName
                  ? employeeApiData?.data?.employeeName
                  : ""
              }`,
              href: `/dashboard/kpi/${companyEmployeeId}`,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, companyEmployeeId, employeeApiData?.data?.employeeName]);

  const steps = showNextStep
    ? [
        <EmployeeStatus key="employeeStatus" />,
        <DepartmentSelect key="departmentSelect" />,
        <Designation key="designation" />,
        <ReportingManage key="reportingManage" />,
      ]
    : [<EmployeeStatus key="employeeStatusSingle" />];

  const {
    back,
    next,
    stepContent,
    totalSteps,
    currentStep,
    isFirstStep,
    isLastStep,
  } = useStepForm(steps, trigger); // trigger from useAddEmployee is correct

  const stepNames = [
    "Basic Info",
    "Department",
    "Designation",
    "Reporting Manager",
  ];

  return (
    <FormProvider {...methods}>
      {" "}
      {/* Pass methods from useAddEmployee to FormProvider */}
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
          header={
            companyEmployeeId ? employeeApiData?.data?.employeeName : null
          }
        />

        <div className="flex justify-end gap-5 mb-5 ">
          <Button
            onClick={back}
            disabled={isFirstStep || isPending}
            className="w-fit"
            type="button"
          >
            Previous
          </Button>
          <Button
            onClick={isLastStep ? onFinish : next}
            className="w-fit"
            isLoading={isPending}
            type="button"
            disabled={isPending}
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>

          {companyEmployeeId && !isLastStep && (
            <Button onClick={onFinish} className="w-fit">
              Submit
            </Button>
          )}
        </div>

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddEmployeeModal
            modalData={employeePreview as EmployeeData} // Ensure EmployeeData type is available/imported
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            onSubmit={onSubmit}
            isLoading={isPending}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AddEmployee;

import StepProgress from "../../../components/shared/StepProgress";
import useStepForm from "../../../components/shared/StepProgress/useStepForm";
import AddEmployeeModal from "./addEmployeeModal";
import useAddEmployee from "./useAddEmployee";
import { FormProvider, useFormContext, Controller } from "react-hook-form";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import FormImage from "@/components/shared/Form/FormImage/FormImage";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getDepartmentList } from "@/features/api/department";
import useGetDesignation from "@/features/api/designation/useGetDesignation";
import { getEmployee } from "@/features/api/companyEmployee";
import SearchInput from "@/components/shared/SearchInput";

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

  const { data: departmentData, isLoading } = getDepartmentList({
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
        <div className="mb-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
            {formErrors?.department && (
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                {/* Adjust error message access based on actual error object structure */}
                {String(
                  formErrors.department?.message ||
                    formErrors.departmentId?.message ||
                    "",
                )}
              </span>
            )}
            {canToggleColumns && (
              <div className="ml-4 ">
                <DropdownSearchMenu
                  columns={columnToggleOptions}
                  onToggleColumn={onToggleColumn}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Controller
        name="department" // Ensure this name matches what's expected in useAddEmployee's reset/payload
        control={control}
        rules={{ required: "Please select a Department" }}
        render={({ field }) => (
          <>
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
              isLoading={isLoading}
              showActionsColumn={false}
            />
          </>
        )}
      />
    </div>
  );
};

const Designation = () => {
  const {
    control,
    watch,
    formState: { errors: formErrors },
  } = useFormContext();
  const departmentId = watch("department")?.departmentId.trim();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: designationData, isLoading } = useGetDesignation({
    filter: {
      ...paginationFilter,
      departmentId: departmentId,
    },
    enable: !!departmentId,
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
  console.log(designationData);

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
              isLoading={isLoading}
              showActionsColumn={false}
            />
          </>
        )}
      />
    </div>
  );
};

const ReportingManage = () => {
  const { control } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: employeedata, isLoading } = getEmployee({
    filter: paginationFilter,
  });
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
        name="employee"
        control={control}
        rules={{ required: "Please select a report manager" }}
        render={({ field }) => (
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
            isLoading={isLoading}
            showActionsColumn={false}
          />
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
    trigger,
    employeePreview,
    showNextStep,
    companyEmployeeId,
    isPending,
    employeeApiData,
    methods,
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
  } = useStepForm(steps, trigger);

  const stepNames = [
    "Basic Info",
    "Department",
    "Designation",
    "Reporting Manager",
  ];

  return (
    <FormProvider {...methods}>
      <div>
        <StepProgress
          currentStep={currentStep}
          stepNames={stepNames}
          totalSteps={totalSteps}
          header={
            companyEmployeeId ? employeeApiData?.data?.employeeName : null
          }
          back={back}
          isFirstStep={isFirstStep}
          next={next}
          isLastStep={isLastStep}
          isPending={isPending}
          onFinish={onFinish}
          isUpdate={!!companyEmployeeId}
        />

        {/* <div className="flex justify-end gap-5 mb-5 ">
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
        </div> */}

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddEmployeeModal
            modalData={employeePreview as EmployeeData}
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

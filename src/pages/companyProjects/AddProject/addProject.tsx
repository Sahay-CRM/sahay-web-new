import { Button } from "@/components/ui/button";
import { FormProvider, useFormContext, Controller } from "react-hook-form"; // Added useFormContext, Controller
import useStepForm from "@/components/shared/StepProgress/useStepForm";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import useAddProject from "./useAddProject";
import AddProjectModal from "./addProjectModal";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useState } from "react"; // Added useState

// Imports for components used within step components
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";

// Imports for API hooks and functions used by step components
import { getEmployee } from "@/features/api/companyEmployee";
import {
  useGetCorparameter,
  useGetProjectStatus,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
// Define CompanyProjectDataProps type if not already globally available
// interface CompanyProjectDataProps { /* ... properties ... */ }

// --- ProjectInfo Component Definition ---
const ProjectInfo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="col-span-2 px-4 py-4 grid grid-cols-2 gap-4">
        <FormInputField
          label="Project Name"
          {...register("projectName", { required: "Name is required" })}
          error={errors.projectName}
        />
        <FormInputField
          label="Project Description"
          {...register("projectDescription", {
            required: "Description is required",
          })}
          error={errors.projectDescription}
        />
        <FormInputField
          id="projectDeadline"
          type="date"
          label="Project Deadline"
          {...register("projectDeadline", {
            required: "Date & Time is required",
          })}
          error={errors.projectDeadline}
        />
      </Card>
    </div>
  );
};

// --- ProjectStatus Component Definition ---
const ProjectStatus = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { data: projectStatusData } = useGetProjectStatus({
    filter: paginationFilter,
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "projectStatus", label: "Project Status", visible: true },
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
      <div className="flex items-center mb-4 gap-2">
        <SearchInput
          placeholder="Search Status..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-96"
        />
        {errors?.projectStatusId && (
          <div className="mb-1">
            <span className="text-red-600 text-sm">
              {String(errors?.projectStatusId?.message || "")}
            </span>
          </div>
        )}
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
        name="projectStatusId"
        control={control}
        rules={{ required: "Please select a project status" }}
        render={({ field }) => (
          <>
            <TableData
              tableData={projectStatusData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (projectStatusData.currentPage - 1) *
                    projectStatusData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="projectStatusId"
              paginationDetails={projectStatusData as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              multiSelect={false}
              selectedValue={field.value} // field.value might be an object or just ID
              handleChange={(selected) => field.onChange(selected)} // Store the whole selected object or just ID based on what reset provides
              onCheckbox={() => true}
            />
          </>
        )}
      />
    </div>
  );
};

// --- CoreParameter Component Definition ---
const CoreParameter = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { data: coreParameterData } = useGetCorparameter({
    filter: paginationFilter,
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "coreParameterName", label: "Business Function", visible: true },
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
      <div className="flex items-center mb-4 gap-2">
        <SearchInput
          placeholder="Search Business Function..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-96"
        />
        {errors?.coreParameterId && (
          <div className="mb-1">
            <span className="text-red-600 text-sm">
              {String(errors?.coreParameterId?.message || "")}
            </span>
          </div>
        )}
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
        name="coreParameterId"
        control={control}
        // rules={{ required: "Please select a Business Function" }}
        render={({ field }) => (
          <>
            <TableData
              tableData={coreParameterData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (coreParameterData.currentPage - 1) *
                    coreParameterData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="coreParameterId"
              paginationDetails={coreParameterData as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              multiSelect={false}
              selectedValue={field.value}
              handleChange={(selected) => field.onChange(selected)} // Store the whole selected object
              onCheckbox={() => true}
            />
          </>
        )}
      />
    </div>
  );
};

// --- SubParameter Component Definition ---
const SubParameter = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { isInitialLoad, hasInitializedData } = useAddProject(); // Get state from hook

  const coreParameter = watch("coreParameterId"); // This will be the object
  const coreParameterIdValue = coreParameter?.coreParameterId;

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  useEffect(() => {
    if (coreParameterIdValue) {
      setPaginationFilter((prev) => ({ ...prev, currentPage: 1, search: "" }));
    }
  }, [coreParameterIdValue]);

  const { data: subParameterData } = useGetSubParaFilter({
    filter: {
      ...paginationFilter,
      coreParameterId: coreParameterIdValue,
    },
    enable: !!coreParameterIdValue && (!isInitialLoad || hasInitializedData),
  });

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "subParameterName", label: "Key Result Area", visible: true },
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

  if (!coreParameterIdValue) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a Business Function first.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4 gap-2">
        <SearchInput
          placeholder="Search..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-96"
        />
        {errors?.subParameterId && (
          <div className="mb-1">
            <span className="text-red-600 text-sm">
              {String(errors?.subParameterId?.message || "")}
            </span>
          </div>
        )}
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
        name="subParameterId"
        control={control}
        render={({ field }) => (
          <>
            <TableData
              tableData={subParameterData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (subParameterData.currentPage - 1) *
                    subParameterData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="subParameterId"
              paginationDetails={subParameterData as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              multiSelect={true}
              selectedValue={field.value || []} // Expects array of IDs
              handleChange={(selectedItems) => {
                const ids = selectedItems.map((item: SubParameter | string) =>
                  typeof item === "object" && item !== null
                    ? item.subParameterId
                    : item,
                );
                field.onChange(ids);
              }}
              onCheckbox={() => true}
            />
          </>
        )}
      />
    </div>
  );
};

// --- Employees Component Definition ---
const Employees = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { data: employeeData } = getEmployee({
    filter: { ...paginationFilter, isDeactivated: false },
  });
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
    { key: "employeeMobile", label: "Mobile", visible: true },
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
      <div className="mt-1 flex items-center justify-between mb-2">
        <SearchInput
          placeholder="Search Employees..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-96"
        />
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
        name="employeeId" // This should store an array of employee IDs
        control={control}
        rules={{ required: "Please select at least one employee" }}
        render={({ field }) => (
          <>
            {errors?.employeeId && (
              <div className="mb-1">
                <span className="text-red-600 text-sm">
                  {String(errors?.employeeId?.message || "")}
                </span>
              </div>
            )}
            <TableData
              tableData={employeeData?.data.map((item, index) => ({
                ...item,
                srNo:
                  (employeeData.currentPage - 1) * employeeData.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={visibleColumns}
              primaryKey="employeeId"
              paginationDetails={employeeData as PaginationFilter}
              setPaginationFilter={setPaginationFilter}
              multiSelect={true}
              selectedValue={field.value || []}
              handleChange={(selectedItems) => {
                const ids = selectedItems.map((item: Employee | string) =>
                  typeof item === "object" && item !== null
                    ? item.employeeId
                    : item,
                );
                field.onChange(ids);
              }}
              onCheckbox={() => true}
            />
          </>
        )}
      />
    </div>
  );
};

const AddProject = () => {
  const {
    onFinish,
    isModalOpen,
    handleClose,
    onSubmit,
    trigger,
    projectPreview, // Renamed from meetingPreview and removed trailing comment
    companyProjectId,
    isPending,
    methods,
    projectApiData,
  } = useAddProject();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Projects", href: "/dashboard/projects" }, // Corrected breadcrumb
      {
        label: companyProjectId
          ? "Update Company Project"
          : "Add Company Project",
        href: "",
      },
      ...(companyProjectId
        ? [
            {
              label: `${
                // typeof projectApiData?.KPIMaster === "object" &&
                projectApiData?.data.projectName
                  ? projectApiData.data.projectName
                  : ""
              }`,
              href: `/dashboard/kpi/${companyProjectId}`,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, companyProjectId, projectApiData?.data.projectName]);

  const steps = [
    <ProjectInfo key="projectInfo" />,
    <ProjectStatus key="projectStatus" />,
    <CoreParameter key="coreParameter" />,
    <SubParameter key="subParameter" />,
    <Employees key="employees" />,
  ];

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
    "Project Info",
    "Project Status",
    "Business Function",
    "Key Result Area",
    "Employees",
  ];

  return (
    <FormProvider {...methods}>
      <div>
        <div className="flex items-center gap-5 mb-5">
          <StepProgress
            currentStep={currentStep}
            stepNames={stepNames}
            totalSteps={totalSteps}
            header={companyProjectId ? projectApiData?.data.projectName : null}
          />
          <div className="flex mt-9 items-center gap-3">
            <Button
              onClick={back}
              disabled={isFirstStep || isPending}
              className="w-fit"
              type="button"
            >
              Previous
            </Button>
            <Button
              onClick={next}
              className="w-fit"
              disabled={isLastStep || isPending}
              isLoading={isPending}
            >
              Next
            </Button>

            {/* Finish button always visible on last step */}
            {isLastStep && (
              <Button onClick={onFinish} className="w-fit" disabled={isPending}>
                Finish
              </Button>
            )}
            {companyProjectId && !isLastStep && (
              <Button onClick={onFinish} className="w-fit">
                Submit
              </Button>
            )}
          </div>
        </div>

        <div className="step-content w-full">{stepContent}</div>

        {isModalOpen && (
          <AddProjectModal
            modalData={{
              ...projectPreview,
              projectStatusId:
                projectPreview?.projectStatusId ??
                methods.getValues("projectStatusId"),
            }} // Ensure projectStatusId is present
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

export default AddProject;

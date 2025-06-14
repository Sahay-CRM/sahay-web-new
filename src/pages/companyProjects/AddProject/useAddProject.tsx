import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import {
  useAddUpdateCompanyProject,
  useGetCompanyProjectById,
  useGetCorparameter,
  useGetProjectStatus,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import SearchInput from "@/components/shared/SearchInput";

export default function useAddProject() {
  const { id: companyProjectId } = useParams();
  const [searchParams] = useSearchParams();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const { mutate: addProject, isPending } = useAddUpdateCompanyProject();
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
  const navigate = useNavigate();
  const methods = useForm({
    mode: "onChange",
  });

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
    watch,
    setValue,
  } = methods;

  useEffect(() => {
    if (projectApiData?.data) {
      setIsInitialLoad(true);
      setHasInitializedData(false);
      reset({
        projectId: companyProjectId || "",
        projectName: projectApiData?.data.projectName || "",
        projectDescription: projectApiData?.data.projectDescription || "",
        projectDeadline: projectApiData?.data.projectDeadline
          ? format(
              parseISO(projectApiData?.data?.projectDeadline),
              "yyyy-MM-dd",
            )
          : "",
        projectStatusId: projectApiData?.data.projectStatus || "",
        subParameterId:
          projectApiData?.data.ProjectParameters?.subParameters?.map(
            (item) => item.subParameterId,
          ) || [],
        coreParameterId:
          projectApiData?.data.ProjectParameters?.coreParameter || undefined,
        employeeId:
          projectApiData?.data?.ProjectEmployees?.map(
            (item) => item.employeeId,
          ) || [],
      });
      // Set flags after form data is set
      setTimeout(() => {
        setIsInitialLoad(false);
        setHasInitializedData(true);
      }, 200);
    } else {
      setIsInitialLoad(false);
      setHasInitializedData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectApiData, reset]);

  // Watch for core parameter changes and clear dependent fields
  const watchedCoreParameter = watch("coreParameterId");
  const [previousCoreParameterId, setPreviousCoreParameterId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const currentCoreParameterId = watchedCoreParameter?.coreParameterId;

    // Only clear sub parameters if:
    // 1. Not in initial load
    // 2. Has initialized data (existing project)
    // 3. Core parameter actually changed from previous value
    if (
      !isInitialLoad &&
      hasInitializedData &&
      currentCoreParameterId &&
      previousCoreParameterId &&
      currentCoreParameterId !== previousCoreParameterId
    ) {
      setValue("subParameterId", []);
    }

    // Update previous core parameter ID
    if (currentCoreParameterId) {
      setPreviousCoreParameterId(currentCoreParameterId);
    }
  }, [
    watchedCoreParameter,
    setValue,
    isInitialLoad,
    hasInitializedData,
    previousCoreParameterId,
  ]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = companyProjectId
      ? {
          projectId: companyProjectId || "",
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: data.projectStatusId.projectStatusId,
          subParameterIds: data.subParameterId,
          otherProjectEmployees: data.employeeId,
        }
      : {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: data.projectStatusId.projectStatusId,
          subParameterIds: data.subParameterId,
          otherProjectEmployees: data.employeeId,
        };

    addProject(payload, {
      onSuccess: () => {
        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate("/dashboard/tasks/add");
          window.location.reload();
        } else {
          navigate(`/dashboard/projects`);
          window.location.reload();
        }
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const ProjectInfo = () => {
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
            id=""
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

  const ProjectStatus = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: projectlistdata } = useGetProjectStatus({
      filter: paginationFilter,
    });

    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "projectStatus", label: "Project Status", visible: true },
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
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-96"
          />
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
          name="projectStatusId"
          control={control}
          rules={{ required: "Please select a project status" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.projectStatusId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.projectStatusId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={projectlistdata?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (projectlistdata.currentPage - 1) *
                      projectlistdata.pageSize +
                    index +
                    1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="projectStatusId"
                paginationDetails={projectlistdata as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={false}
                selectedValue={field.value}
                handleChange={field.onChange}
                onCheckbox={() => true}
                // permissionKey="--"
              />
            </>
          )}
        />
      </div>
    );
  };

  const CoreParameter = () => {
    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: mcoreparameter } = useGetCorparameter({
      filter: paginationFilter,
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "coreParameterName", label: "Core Parameter", visible: true },
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
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-96"
          />
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
          rules={{ required: "Please select a core parameter" }}
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
                tableData={mcoreparameter?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (mcoreparameter.currentPage - 1) * mcoreparameter.pageSize +
                    index +
                    1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="coreParameterId"
                paginationDetails={mcoreparameter as PaginationFilter}
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
  const SubParameter = () => {
    const coreParameter = watch("coreParameterId");

    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    // Reset pagination when core parameter changes
    useEffect(() => {
      setPaginationFilter((prev) => ({
        ...prev,
        currentPage: 1,
      }));
    }, [coreParameter?.coreParameterId]);

    const { data: subparameter } = useGetSubParaFilter({
      filter: {
        ...paginationFilter,
        coreParameterId: coreParameter?.coreParameterId,
      },
    });
    const [columnToggleOptions, setColumnToggleOptions] = useState([
      { key: "srNo", label: "Sr No", visible: true },
      { key: "subParameterName", label: "Sub Parameter", visible: true },
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

    // Helper to ensure selectedValue is always an array of IDs
    const getSelectedSubParameterIds = (value: unknown) => {
      if (!Array.isArray(value)) return [];
      return value
        .map((item: string | { subParameterId?: string }) => {
          // Handle both string IDs and objects with subParameterId
          if (typeof item === "string") return item;
          if (
            typeof item === "object" &&
            item !== null &&
            "subParameterId" in item &&
            typeof item.subParameterId === "string"
          ) {
            return item.subParameterId;
          }
          return item;
        })
        .filter(Boolean); // Remove any undefined/null values
    };

    // Custom onChange handler to normalize data
    const handleSubParameterChange = (
      selectedItems: (string | { subParameterId?: string })[],
      onChange: (value: string[]) => void,
    ) => {
      // Always store as array of string IDs, filter out undefined
      const normalizedIds = selectedItems
        .map((item) => (typeof item === "string" ? item : item.subParameterId))
        .filter((id): id is string => typeof id === "string");
      onChange(normalizedIds);
    };

    // Don't render the table if no core parameter is selected
    if (!coreParameter?.coreParameterId) {
      return (
        <div className="text-center py-8 text-gray-500">
          Please select a core parameter first
        </div>
      );
    }

    return (
      <div>
        <div className=" mt-1 flex items-center justify-between">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-96"
          />
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
          name="subParameterId"
          control={control}
          rules={{ required: "Please select a sub parameter" }}
          render={({ field }) => (
            <>
              <div className="mb-4">
                {errors?.subParameterId && (
                  <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                    {String(errors?.subParameterId?.message || "")}
                  </span>
                )}
              </div>
              <TableData
                {...field}
                tableData={subparameter?.data.map((item, index) => ({
                  ...item,
                  srNo:
                    (subparameter.currentPage - 1) * subparameter.pageSize +
                    index +
                    1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="subParameterId"
                paginationDetails={subparameter as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
                selectedValue={getSelectedSubParameterIds(field.value)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handleChange={(selectedItems: any[]) =>
                  handleSubParameterChange(selectedItems, field.onChange)
                }
                onCheckbox={() => true}
                // permissionKey="--"
              />
            </>
          )}
        />
      </div>
    );
  };
  const Employees = () => {
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
      { key: "employeeName", label: "Joiners", visible: true },
      { key: "employeeMobile", label: "Mobile", visible: true },
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

    // Helper to ensure selectedValue is always an array of IDs for employees
    const getSelectedEmployeeIds = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value
        .map((item) => {
          // Handle both string IDs and objects with employeeId
          if (typeof item === "string") return item;
          if (
            typeof item === "object" &&
            item !== null &&
            "employeeId" in item
          ) {
            return (item as { employeeId: string }).employeeId;
          }
          return item;
        })
        .filter((id): id is string => typeof id === "string");
    };

    // Custom onChange handler to normalize data
    const handleEmployeeChange = (
      selectedItems: (string | { employeeId?: string })[],
      onChange: (value: string[]) => void,
    ) => {
      // Always store as array of string IDs, filter out undefined
      const normalizedIds = selectedItems
        .map((item) => (typeof item === "string" ? item : item.employeeId))
        .filter((id): id is string => typeof id === "string");
      onChange(normalizedIds);
    };

    return (
      <div>
        <div className=" mt-1 flex items-center justify-between">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-96"
          />
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
          rules={{ required: "Please select a Employee" }}
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
                  srNo:
                    (employeedata.currentPage - 1) * employeedata.pageSize +
                    index +
                    1,
                }))}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata as PaginationFilter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
                selectedValue={getSelectedEmployeeIds(field.value)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handleChange={(selectedItems: any[]) =>
                  handleEmployeeChange(selectedItems, field.onChange)
                }
                onCheckbox={() => true}
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
    ProjectInfo,
    ProjectStatus,
    CoreParameter,
    SubParameter,
    Employees,
    meetingPreview: getValues(),
    trigger,
    setValue,
    methods,
    companyProjectId,
    isPending,
  };
}

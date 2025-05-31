import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { getEmployee } from "@/features/api/companyEmployee";
import {
  getAllSubParameter,
  useAddUpdateCompanyProject,
  useGetCompanyProjectById,
  useGetCorparameter,
  useGetProjectStatus,
} from "@/features/api/companyProject";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";

export default function useAddProject() {
  const { id: companyProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "";
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addProject } = useAddUpdateCompanyProject();
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
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
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    if (projectApiData?.data) {
      const data = projectApiData?.data;
      reset({
        projectName: data.projectName || "",
        projectDescription: data.projectDescription || "",
        projectDeadline: data.projectDeadline
          ? format(parseISO(data?.projectDeadline), "yyyy-MM-dd")
          : "",
        projectStatusId: data.projectStatus || "",
        subParameterId: data.ProjectParameters?.subParameters || undefined,
        coreParameterId: data.ProjectParameters?.coreParameter || undefined,
        employeeId: data.ProjectEmployees || undefined,
      });
    }
  }, [projectApiData, reset]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      projectId: companyProjectId,
    };
    addProject(payload, {
      onSuccess: () => {
        handleModalClose();
      },
    });

    if (source == "view") {
      navigate(`/dashboard/projects/view/${companyProjectId}`);
    } else {
      navigate("/dashboard/projects");
    }
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
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="projectStatusId"
                paginationDetails={projectlistdata}
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
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="coreParameterId"
                paginationDetails={mcoreparameter}
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
  const SubParameter = () => {
    const coreParameter = watch("coreParameterId");

    const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 10,
      search: "",
    });

    const { data: subparameter } = getAllSubParameter({
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
                  srNo: index + 1,
                }))}
                isActionButton={() => false}
                columns={visibleColumns}
                primaryKey="subParameterId"
                paginationDetails={subparameter}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
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
                  srNo: index + 1,
                }))}
                columns={visibleColumns}
                primaryKey="employeeId"
                paginationDetails={employeedata}
                setPaginationFilter={setPaginationFilter}
                multiSelect={true}
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
    // employeeId,
    trigger,
  };
}

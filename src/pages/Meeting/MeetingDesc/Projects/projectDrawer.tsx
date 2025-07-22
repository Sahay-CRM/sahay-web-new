import { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, parseISO } from "date-fns";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { queryClient } from "@/queryClient";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCorparameter,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";

interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  projectData?: CompanyProjectDataProps | null;
}

type ProjectFormData = {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: string;
  projectStatusId: string;
  coreParameterId: string;
  subParameterId: string[];
  employeeId: string[];
};

export default function ProjectDrawer({
  open,
  onClose,
  projectData,
}: ProjectDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { mutate: addProject } = useAddUpdateCompanyProject();
  const { data: projectStatusData } = useGetAllProjectStatus();
  const { data: employeeData } = useGetEmployeeDd();
  const { data: coreParameterData } = useGetCorparameter({
    filter: { currentPage: 1, pageSize: 100 },
  });
  // Prepare options
  const projectStatusOption = projectStatusData
    ? projectStatusData.data.map((status) => ({
        label: status.projectStatus,
        value: status.projectStatusId,
      }))
    : [];
  const employeeOption = employeeData
    ? employeeData.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];

  const coreParameterOption = coreParameterData
    ? coreParameterData.data.map((item) => ({
        label: item.coreParameterName,
        value: item.coreParameterId,
      }))
    : [];

  // Default values from projectData
  const defaultValues = projectData
    ? {
        projectId: projectData.projectId || "",
        projectName: projectData.projectName || "",
        projectDescription: projectData.projectDescription || "",
        projectDeadline: projectData.projectDeadline
          ? format(parseISO(projectData.projectDeadline), "yyyy-MM-dd")
          : "",
        projectStatusId: projectData.projectStatusId || "",
        coreParameterId: projectData.coreParameterId || "",
        subParameterId: Array.isArray(projectData.subParameters)
          ? projectData.subParameters.map((item) => item.subParameterId)
          : [],
        employeeId: Array.isArray(projectData.ProjectEmployees)
          ? projectData.ProjectEmployees.map((item) => item.employeeId)
          : [],
      }
    : {
        projectId: "",
        projectName: "",
        projectDescription: "",
        projectDeadline: "",
        projectStatusId: "",
        coreParameterId: "",
        subParameterId: [],
        employeeId: [],
      };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues,
  });

  // Watch coreParameterId for subParameter options
  const watchedCoreParameterId = watch("coreParameterId");
  const { data: subParameterData } = useGetSubParaFilter({
    filter: {
      currentPage: 1,
      pageSize: 100,
      coreParameterId: watchedCoreParameterId,
    },
    enable: !!watchedCoreParameterId,
  });
  const subParameterOption = subParameterData
    ? subParameterData.data.map((item) => ({
        label: item.subParameterName,
        value: item.subParameterId,
      }))
    : [];

  // Reset form when projectData changes
  useEffect(() => {
    if (open && projectData) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If click is inside the drawer, do nothing
      if (
        drawerRef.current &&
        drawerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      // If click is inside a select or popover menu, do nothing
      if (
        (event.target as HTMLElement).closest('[data-slot="select-content"]') ||
        (event.target as HTMLElement).closest(
          '[data-slot="popover-content"]',
        ) ||
        (event.target as HTMLElement).closest(
          "[data-radix-popper-content-wrapper]",
        )
      ) {
        return;
      }
      // Otherwise, close the drawer
      onClose();
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, open]);

  const onSubmit = (data: ProjectFormData) => {
    const { employeeId, ...rest } = data;
    const payload = {
      ...rest,
      projectId: projectData?.projectId,
      otherProjectEmployees: employeeId, // API expects this field for employees
    };
    addProject(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
        onClose();
      },
    });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 transition-opacity" />
      )}
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="h-[calc(100vh-30px)] overflow-scroll">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Project Drawer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            <FormInputField
              label="Project Name"
              {...register("projectName", {
                required: "Project Name is required",
              })}
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
              type="date"
              label="Project Deadline"
              {...register("projectDeadline", {
                required: "Deadline is required",
              })}
              error={errors.projectDeadline}
            />
            <Controller
              control={control}
              name="projectStatusId"
              render={({ field }) => (
                <FormSelect
                  label="Project Status"
                  value={field.value}
                  onChange={field.onChange}
                  options={projectStatusOption}
                  error={errors.projectStatusId}
                  placeholder="Select status"
                />
              )}
            />
            <Controller
              control={control}
              name="coreParameterId"
              render={({ field }) => (
                <FormSelect
                  label="Business Function"
                  value={field.value}
                  onChange={field.onChange}
                  options={coreParameterOption}
                  error={errors.coreParameterId}
                  placeholder="Select business function"
                />
              )}
            />
            <Controller
              control={control}
              name="subParameterId"
              render={({ field }) => (
                <FormSelect
                  label="Key Result Area"
                  value={field.value}
                  onChange={field.onChange}
                  options={subParameterOption}
                  error={errors.subParameterId}
                  isMulti={true}
                  placeholder="Select key result areas"
                />
              )}
            />
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.employeeId}
                  isMulti={true}
                  placeholder="Select employees"
                />
              )}
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

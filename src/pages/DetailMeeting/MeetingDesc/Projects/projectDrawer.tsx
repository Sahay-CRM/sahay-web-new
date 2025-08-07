import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

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
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { addMeetingNotesMutation } from "@/features/api/companyMeeting";

interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  projectData?: CompanyProjectDataProps | null;
  detailMeetingAgendaIssueId?: string;
  detailMeetingId?: string;
}

type ProjectFormData = {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: Date | string | null;
  projectStatusId: string;
  coreParameterId: string;
  subParameterId: string[];
  employeeId: string[];
};

export default function ProjectDrawer({
  open,
  onClose,
  projectData,
  detailMeetingAgendaIssueId,
  detailMeetingId,
}: ProjectDrawerProps) {
  const { id: meetingId } = useParams();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { mutate: addProject } = useAddUpdateCompanyProject();
  const { data: projectStatusData } = useGetAllProjectStatus();
  const { data: employeeData } = useGetEmployeeDd();
  const { data: coreParameterData } = useGetCorparameter({
    filter: { currentPage: 1, pageSize: 100 },
  });
  const { mutate: addNote } = addMeetingNotesMutation();
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
          ? new Date(projectData.projectDeadline)
          : null,
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
    setValue,
  } = useForm<ProjectFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (!projectData || !projectData.projectStatusId) {
      if (projectStatusData?.data?.[0]?.projectStatusId) {
        setValue("projectStatusId", projectStatusData.data[0].projectStatusId);
      }
    }
  }, [setValue, projectData, projectStatusData?.data]);

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
  useEffect(() => {
    if (open && projectData) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        drawerRef.current.contains(event.target as Node)
      ) {
        return;
      }
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
    if (meetingId && detailMeetingAgendaIssueId) {
      const { employeeId, projectDeadline, ...rest } = data;
      const payload = {
        ...rest,
        projectId: projectData?.projectId,
        otherProjectEmployees: employeeId,
        detailMeetingId: detailMeetingId,
        projectDeadline: projectDeadline
          ? new Date(projectDeadline).toISOString()
          : null,
        detailMeetingAgendaIssueId: detailMeetingAgendaIssueId,
      };
      addProject(payload, {
        onSuccess: () => {
          if (projectData && projectData.detailMeetingNoteId) {
            addNote(
              {
                detailMeetingNoteId: projectData?.detailMeetingNoteId,
                noteType: "TASKS",
              },
              {
                onSuccess: () => {
                  onClose();
                },
              },
            );
          }
          queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
          onClose();
        },
      });
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-50" />}
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
            <Controller
              control={control}
              name="projectDeadline"
              render={({ field }) => {
                const localDate = field.value
                  ? new Date(
                      new Date(field.value).getTime() +
                        new Date().getTimezoneOffset() * 60000,
                    )
                  : null;

                return (
                  <FormDateTimePicker
                    label="Project Deadline"
                    value={localDate}
                    onChange={(date) => {
                      const utcDate = date
                        ? new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          )
                        : null;
                      field.onChange(utcDate);
                    }}
                    error={errors.projectDeadline}
                  />
                );
              }}
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

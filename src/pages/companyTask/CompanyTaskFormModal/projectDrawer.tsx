import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCorparameter,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import {
  addMeetingNotesMutation,
  useGetDetailMeetingAgenda,
} from "@/features/api/detailMeeting";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

type ProjectFormData = {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: Date | string | null;
  projectStatusId: string;
  coreParameterId: string;
  subParameterId: string[];
  employeeId: string[];
  ioId?: string;
  ioType?: string;
};
interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  projectData?: CompanyProjectDataProps | null;
  issueId?: string;
  projectsFireBase: () => void;
  ioType?: string;
  onProjectCreated?: (project: CompanyProjectDataProps) => void;
  defaultProjectName?: string;
}

export default function ProjectDrawer({
  open,
  onClose,
  projectData,
  issueId,
  projectsFireBase,
  ioType,
  onProjectCreated,
  defaultProjectName,
}: ProjectDrawerProps) {
  const { id: meetingId } = useParams();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isStatusSearch, setIsStatusSearch] = useState("");

  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  const { mutate: addProject, isPending } = useAddUpdateCompanyProject();
  const [savedPayload, setSavedPayload] = useState<
    Parameters<typeof addProject>[0] | null
  >(null);

  const { data: ioList } = useGetDetailMeetingAgenda({
    filter: {
      meetingId: meetingId,
    },
    enable: !!meetingId,
  });
  const { data: projectStatusData } = useGetAllProjectStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
    },
    enable: isStatusSearch.length >= 3 || isStatusSearch.length === 0,
  });
  const { data: employeeData } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });
  const { data: coreParameterData } = useGetCorparameter({
    filter: { currentPage: 1, pageSize: 100 },
  });
  const { mutate: addNote } = addMeetingNotesMutation();

  const ioOption = ioList
    ? ioList.map((item) => ({
        label: item.name,
        value: item.ioType === "ISSUE" ? item.issueId : item.objectiveId,
        ioType: item.ioType,
      }))
    : [];
  // Prepare options
  const projectStatusOption = projectStatusData
    ? projectStatusData.data.map((status) => ({
        label: status.projectStatus,
        value: status.projectStatusId,
        color: status.color,
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

  const rawProjectDeadline = projectData
    ? (
        projectData as CompanyProjectDataProps & {
          rawProjectDeadline?: string | Date | null;
        }
      ).rawProjectDeadline
    : undefined;

  const deadlineVal = rawProjectDeadline || projectData?.projectDeadline;

  const defaultValues = projectData
    ? {
        projectId: projectData.projectId || "",
        projectName: projectData.projectName || "",
        projectDescription: projectData.projectDescription || "",
        projectDeadline: deadlineVal ? new Date(deadlineVal) : null,
        projectStatusId: projectData.projectStatusId || "",
        coreParameterId: projectData.coreParameterId || "",
        subParameterId: Array.isArray(projectData.subParameters)
          ? projectData.subParameters.map((item) => item.subParameterId)
          : [],
        employeeId: Array.isArray(projectData.ProjectEmployees)
          ? projectData.ProjectEmployees.map((item) => item.employeeId)
          : [],
        ioId: issueId || "",
        ioType: ioType || "",
      }
    : {
        projectId: "",
        projectName: defaultProjectName || "",
        projectDescription: "",
        projectDeadline: "",
        projectStatusId: "",
        coreParameterId: "",
        subParameterId: [],
        employeeId: [],
        ioId: issueId || "",
        ioType: ioType || "",
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

  const projectNameValue = watch("projectName") || "";
  const projectDescriptionValue = watch("projectDescription") || "";
  const prevProjectNameRef = useRef(projectNameValue);

  useEffect(() => {
    if (projectDescriptionValue === "" || projectDescriptionValue === prevProjectNameRef.current) {
      if (projectDescriptionValue !== projectNameValue) {
        setValue("projectDescription", projectNameValue);
      }
    }
    prevProjectNameRef.current = projectNameValue;
  }, [projectNameValue, projectDescriptionValue, setValue]);

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

  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     const target = event.target as HTMLElement;

  //     if (drawerRef.current && drawerRef.current.contains(target)) {
  //       return;
  //     }

  //     if (
  //       target.closest('[data-slot="select-content"]') ||
  //       target.closest('[data-slot="popover-content"]') ||
  //       target.closest("[data-radix-popper-content-wrapper]")
  //     ) {
  //       return;
  //     }

  //     if (
  //       target.closest(".react-datepicker") ||
  //       target.closest(".react-datepicker-popper")
  //     ) {
  //       return;
  //     }

  //     onClose();
  //   }

  //   if (open) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [onClose, open]);

  const handleSuccess = (newProject?: CompanyProjectDataProps) => {
    if (projectData && projectData.meetingNoteId) {
      addNote(
        {
          meetingNoteId: projectData?.meetingNoteId,
          noteType: "PROJECT",
          noteTag: "Project",
        },
        {
          onSuccess: () => {
            projectsFireBase();
            if (newProject && onProjectCreated) {
              onProjectCreated(newProject);
            }
            onClose();
          },
        },
      );
    } else {
      projectsFireBase();
      if (newProject && onProjectCreated) {
        onProjectCreated(newProject);
      }
      onClose();
    }
  };

  const onConfirmSubmit = () => {
    if (!reasons.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    if (!savedPayload) return;

    const finalPayload = {
      ...savedPayload,
      isForceChangeDeadline: true,
      reasons: reasons,
    };

    addProject(finalPayload, {
      onSuccess: (res) => {
        setIsConfModalOpen(false);
        handleSuccess(res.data);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;
        toast.error(
          `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
        );
      },
    });
  };

  const onSubmit = (data: ProjectFormData) => {
    const { employeeId, projectDeadline, ioType, ioId, ...rest } = data;
    const payload = {
      ...rest,
      projectId: projectData?.projectId,
      otherProjectEmployees: employeeId,
      ...(meetingId ? { meetingId } : {}),
      projectDeadline: projectDeadline
        ? new Date(projectDeadline).toISOString()
        : null,
      ...(meetingId && ioId && ioType
        ? {
            ...(ioType === "ISSUE"
              ? { issueId: ioId }
              : ioType === "OBJECTIVE"
                ? { objectiveId: ioId }
                : {}),
          }
        : {}),

      ioType: meetingId ? data.ioType : undefined,
    };
    addProject(payload, {
      onSuccess: (res) => {
        handleSuccess(res.data);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setSavedPayload(payload);
          setReasons("");
          setIsConfModalOpen(true);
        } else {
          toast.error(
            `Error: ${
              axiosError.response?.data?.message || "An error occurred"
            }`,
          );
        }
      },
    });
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
            <h2 className="text-lg font-semibold">Company Project</h2>
            <button
              onClick={onClose}
              className="text-gray-500 text-2xl hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {meetingId && (
              <div>
                <Controller
                  control={control}
                  name="ioId"
                  rules={{ required: meetingId ? "Please select an Issue or Objective" : false }}
                  render={({ field }) => (
                    <FormSelect
                      label="Select Issue/Objective"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        const selected = ioOption.find(
                          (opt) => opt.value === val,
                        );
                        if (selected) {
                          setValue("ioType", selected.ioType); // 👈 also set ioType
                        }
                      }}
                      options={ioOption}
                      error={errors.ioId}
                      placeholder="Select Issue or Objective"
                      isMandatory
                    />
                  )}
                />
              </div>
            )}
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
              rules={{
                required: {
                  value: true,
                  message: "Project Deadline is Required",
                },
              }}
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
                    isMandatory
                    onChange={(date) => {
                      const utcDate = date
                        ? new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000,
                          )
                        : null;
                      field.onChange(utcDate);
                    }}
                    error={errors.projectDeadline}
                    disablePastDays={
                      Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                    }
                  />
                );
              }}
            />
            <Controller
              name="projectStatusId"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: "Please select a project status",
                },
              }}
              render={({ field }) => (
                <SearchDropdown
                  placeholder="Select Project Status..."
                  label="Project Status"
                  error={errors.projectStatusId}
                  isMandatory
                  {...field}
                  labelClass=""
                  className=""
                  options={projectStatusOption}
                  selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("projectStatusId", value.value);
                  }}
                  onSearchChange={setIsStatusSearch}
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
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmation Required</DialogTitle>
            <DialogDescription>
              The deadline has been changed. Please provide a reason to proceed
              with the update.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason
              </label>
              <Textarea
                id="reason"
                placeholder="Enter reasons for deadline change..."
                value={reasons}
                onChange={(e) => setReasons(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsConfModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirmSubmit}
              disabled={!reasons.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

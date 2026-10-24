/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Calendar, Circle, Folder, Loader2, Repeat, Send, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormTimePicker } from "@/components/shared/FormDateTimePicker/formTimePicker";
import CustomModalFile from "@/components/shared/CustomModalRepeatMeeting";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import {
  buildRepetitionOptionsREPT,
  getRepeatTypeOrCustomForRepeatMeeting,
} from "@/components/shared/RepeatOption/repeatOption";

import {
  addUpdateRepeatCompanyTaskMutation,
  useDdTaskType,
  useGetRepeatCompanyTaskById,
} from "@/features/api/companyTask";
import useGetCompanyProjectSearchList from "@/features/api/companyProject/useGetCompanyProjectSearchList";
import { useGetBothCompanyMeeting } from "@/features/api/companyMeeting";
import { getEmployee } from "@/features/api/companyEmployee";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { getCompaniesList } from "@/features/selectors/company.selector";
import {
  getNextRepeatDates,
  getNextRepeatDatesCustom,
} from "@/features/utils/nextDate.utils";
import {
  convertUtcTimeToLocal,
  formatToLocalDateTime,
  getInitials,
  updateDateTime,
} from "@/features/utils/app.utils";

import AddRepetitiveTaskModal from "./addRepetitiveTaskModal";

interface GroupedCompanyMeetings {
  detailMeetings?: CompanyMeetingDataProps[];
  normalMeetings?: CompanyMeetingDataProps[];
}

export default function AddRepetitiveCompanyTaskSingle() {
  const { id: repetitiveTaskId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumbs();
  const permission = useSelector(getUserPermission);

  let queryProjectId = searchParams.get("projectId") || "";
  let queryMeetingId = searchParams.get("meetingId") || "";
  queryProjectId = queryProjectId.replace(/[?&]+$/, "");
  queryMeetingId = queryMeetingId.replace(/[?&]+$/, "");

  const { data: taskDataById } = useGetRepeatCompanyTaskById({
    filter: { id: repetitiveTaskId },
    enable: !!repetitiveTaskId,
  });
  const taskdata = taskDataById?.data;

  const { mutate: addUpdateTask, isPending } =
    addUpdateRepeatCompanyTaskMutation();

  const {
    register,
    control,
    watch,
    formState: { errors },
    handleSubmit,
    trigger,
    setValue,
    getValues,
  } = useForm();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>("");
  const [CustomRepeatData, setCustomRepeatData] = useState<
    CustomObjREPT | undefined
  >();
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [hasUserChangedRepeat, setHasUserChangedRepeat] = useState(false);
  const [isRepeatChange, setIsRepeatChange] = useState(false);
  const [repeatResult, setRepeatResult] = useState<{
    createDateUTC: string;
    nextDateUTC: string;
  } | null>(null);

  const [projectSearch, setProjectSearch] = useState("");
  // Once the user clears project/meeting, don't auto-fill them again from the
  // task / URL defaults.
  const [projectCleared, setProjectCleared] = useState(false);
  const meetingClearedRef = useRef(false);
  const [meetingPagination, setMeetingPagination] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [employeePagination, setEmployeePagination] =
    useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

  const projectVal = watch("project");
  const meetingVal = watch("meeting");
  const assignUserVal: Employee[] = watch("assignUser") || [];
  const repeatTime = watch("repeatTime");
  const selectedRepeat = watch("repeatType");

  // ---------- Data ----------
  const { data: projectSearchListData } = useGetCompanyProjectSearchList(
    projectSearch,
    projectVal?.projectId ||
      (projectCleared
        ? undefined
        : taskdata?.projectId || queryProjectId || undefined),
  );
  const projectList = useMemo(
    () => (projectSearchListData?.data ?? []) as ProjectSearchResponse[],
    [projectSearchListData],
  );

  const { data: meetingData } = useGetBothCompanyMeeting({
    filter: {
      ...meetingPagination,
      meetingId: taskdata?.meetingId || undefined,
    },
  });
  const flatMeetings = useMemo((): CompanyMeetingDataProps[] => {
    if (!meetingData?.data) return [];
    const rawData = meetingData.data as unknown as GroupedCompanyMeetings;
    return Array.isArray(rawData)
      ? (rawData as CompanyMeetingDataProps[])
      : [
          ...(rawData.normalMeetings || []),
          ...(rawData.detailMeetings || []),
        ];
  }, [meetingData]);

  const { data: employeedata } = getEmployee({
    filter: { ...employeePagination, isDeactivated: false },
  });

  const { data: taskTypeData } = useDdTaskType({
    filter: { search: isTypeSearch.length >= 3 ? isTypeSearch : undefined },
    enable: isTypeSearch.length >= 3,
  });
  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "",
      }))
    : [];

  const repeatOptions = buildRepetitionOptionsREPT(new Date());

  // ---------- Company access ----------
  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = taskDataById?.data?.companyId;
  const isAuthorized =
    !repetitiveTaskId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Repeat Tasks", href: "/tasksrepeat" },
      {
        label: repetitiveTaskId
          ? "Update Repetition Task"
          : "Add Repetition Task",
        href: "",
      },
      ...(repetitiveTaskId && isAuthorized
        ? [
            {
              label: taskDataById?.data?.taskName || "",
              href: `/kpi/${repetitiveTaskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data?.taskName, repetitiveTaskId, isAuthorized]);

  // ---------- Initial values ----------
  const initializedRef = useRef(false);
  useEffect(() => {
    if (repetitiveTaskId) return;
    setValue("isActive", "active");
    setValue("isIndividual", "individual");
    setValue("hasDuration", false);
    setValue("durationHours", "");
    setValue("durationMinutes", "");
  }, [repetitiveTaskId, setValue]);

  useEffect(() => {
    if (!repetitiveTaskId || !taskdata || initializedRef.current) return;
    initializedRef.current = true;
    const t: any = taskdata;

    const deadlineDate = t.taskDeadline ? new Date(t.taskDeadline) : null;
    const validTaskDeadline =
      deadlineDate && !isNaN(deadlineDate.getTime()) ? deadlineDate : null;
    const targetProjectId = queryProjectId || t.projectId || "";

    setValue("repetitiveTaskId", t.repetitiveTaskId);
    setValue("repeatTime", convertUtcTimeToLocal(t.repeatTime));
    if (targetProjectId) {
      setValue("project", {
        projectId: targetProjectId,
        projectName: t.projectName || "",
      });
    }
    setValue("taskName", t.taskName || "");
    setValue("taskDescription", t.taskDescription || "");
    setValue("taskStartDate", t.taskStartDate ? new Date(t.taskStartDate) : null);
    setValue("taskDeadline", validTaskDeadline);
    setValue("repeatType", t.repeatType || "");
    setValue("isActive", t.isActive ? "active" : "inactive");
    setValue("isIndividual", t.isIndividual ? "individual" : "group");
    setValue("taskTypeId", t.taskTypeId || "");
    setValue("customObj", t.customObj || null);
    setValue("assignUser", t.assignUsers ?? []);
    if (t.customObj) setCustomRepeatData(t.customObj);
    if (t.duration && t.duration > 0) {
      setValue("hasDuration", true);
      const h = Math.floor(t.duration / 60);
      const m = t.duration % 60;
      setValue("durationHours", h > 0 ? String(h) : "");
      setValue("durationMinutes", m > 0 ? String(m) : "");
    } else {
      setValue("hasDuration", false);
      setValue("durationHours", "");
      setValue("durationMinutes", "");
    }
    // keep repeat helper in sync (value only used by original for dropdown label)
    getRepeatTypeOrCustomForRepeatMeeting(t);
  }, [repetitiveTaskId, taskdata, queryProjectId, setValue]);

  // Resolve project object (query param on add / full object on edit)
  useEffect(() => {
    const targetId = queryProjectId || taskdata?.projectId;
    if (!targetId || projectCleared) return;
    const found = projectList.find((p) => p.projectId === targetId);
    if (found && !getValues("project")) {
      setValue("project", found, { shouldDirty: true });
    }
  }, [projectList, queryProjectId, taskdata?.projectId, projectCleared, setValue, getValues]);

  // Resolve meeting object (query param on add / task meeting on edit)
  useEffect(() => {
    const targetId = queryMeetingId || taskdata?.meetingId;
    if (!targetId || meetingClearedRef.current || getValues("meeting")) return;
    const found = flatMeetings.find((m) => m.meetingId === targetId);
    if (found) setValue("meeting", found, { shouldDirty: true });
  }, [flatMeetings, queryMeetingId, taskdata?.meetingId, setValue, getValues]);

  // Prefer full employee records for the assigned users when available
  useEffect(() => {
    if (!repetitiveTaskId || !employeedata?.data) return;
    const current: Employee[] = getValues("assignUser") || [];
    if (current.length === 0) return;
    const merged = current.map(
      (u) => employeedata.data.find((e) => e.employeeId === u.employeeId) || u,
    );
    if (merged.some((m, i) => m !== current[i])) setValue("assignUser", merged);
  }, [employeedata?.data, repetitiveTaskId, setValue, getValues]);

  // ---------- Repeat calculation ----------
  const handleSaveCustomRepeatData = useCallback(
    (customData: CustomObjREPT) => setCustomRepeatData(customData),
    [],
  );
  const initialCustomRef = useRef(taskdata?.customObj);

  useEffect(() => {
    if (selectedRepeat !== "CUSTOMTYPE" || !CustomRepeatData || !repeatTime)
      return;

    const hasCustomChanged =
      JSON.stringify(CustomRepeatData) !==
      JSON.stringify(initialCustomRef.current);
    if (hasCustomChanged || repeatTime !== taskdata?.repeatTime) {
      setHasUserChangedRepeat(true);
      setIsRepeatChange(true);
    }

    setRepeatResult(
      getNextRepeatDatesCustom(
        "CUSTOMTYPE",
        repeatTime,
        CustomRepeatData as CustomRepeatConfig,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepeat, repeatTime, CustomRepeatData]);

  useEffect(() => {
    if (!selectedRepeat || selectedRepeat === "CUSTOMTYPE" || !repeatTime)
      return;

    const hasChanged =
      selectedRepeat !== taskdata?.repeatType ||
      repeatTime !== taskdata?.repeatTime;
    if (hasChanged) {
      setHasUserChangedRepeat(true);
      setIsRepeatChange(true);
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRepeatResult(getNextRepeatDates(selectedRepeat, repeatTime, timezone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepeat, repeatTime]);

  useEffect(() => {
    if (repeatResult) {
      setValue("createDateUTC", repeatResult.createDateUTC);
      setValue("nextDateUTC", repeatResult.nextDateUTC);
    }
  }, [repeatResult, setValue]);

  const oldDate = taskDataById?.data?.nextDate
    ? updateDateTime(taskDataById.data.nextDate, repeatTime)
    : "";

  // ---------- Submit ----------
  const onSubmit = handleSubmit(async (data) => {
    const isActiveValue =
      typeof data?.isActive === "string"
        ? data.isActive === "active"
        : !!data.isActive;
    const isIndividualValue =
      typeof data?.isIndividual === "string"
        ? data.isIndividual === "individual"
        : !!data.isIndividual;
    const assigneeIds =
      (data.assignUser as unknown as { employeeId: string }[])?.map(
        (user) => user.employeeId,
      ) ?? [];
    const now = new Date();
    const defaultDeadline = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        18, // 6 PM UTC
        0,
        0,
      ),
    );
    const durationMinutes = data.hasDuration
      ? (Number(data.durationHours) || 0) * 60 +
        (Number(data.durationMinutes) || 0)
      : null;

    const payload = data.repetitiveTaskId
      ? {
          repetitiveTaskId: repetitiveTaskId,
          taskName: data.taskName,
          repeatTime: data.repeatTime,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
          taskStatusId: data?.taskStatusId,
          isActive: isActiveValue,
          isIndividual: isIndividualValue,
          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId:
            (data.project as unknown as { projectId: string })?.projectId ??
            null,
          meetingId:
            (data.meeting as unknown as { meetingId: string })?.meetingId ??
            null,
          repeatType: data.repeatType,
          customObj: data.customObj,
          isChildDataKey: data.additionalKey,
          duration: durationMinutes,
        }
      : {
          taskName: data.taskName,
          repeatTime: data.repeatTime,
          taskDescription: data.taskDescription,
          taskStartDate: data.taskStartDate
            ? new Date(data.taskStartDate)
            : null,
          taskDeadline: data.taskDeadline
            ? new Date(data.taskDeadline)
            : defaultDeadline,
          taskStatusId: data?.taskStatusId,
          isActive: isActiveValue,
          isIndividual: isIndividualValue,
          taskTypeId: data?.taskTypeId,
          comment: data.comment,
          employeeIds: assigneeIds,
          projectId:
            (data.project as unknown as { projectId: string })?.projectId ??
            null,
          meetingId:
            (data.meeting as unknown as { meetingId: string })?.meetingId ??
            null,
          repeatType: data.repeatType,
          customObj: data.customObj,
          duration: durationMinutes,
        };

    addUpdateTask(payload, {
      onSuccess: () => {
        navigate("/tasksrepeat");
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setIsChildData(axiosError.response?.data?.message);
        } else {
          toast.error(
            `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
          );
        }
      },
    });
  });

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) setModalOpen(true);
  }, [trigger]);

  const handleKeepAll = () => {
    setValue("additionalKey", "UPDATE_ALL");
    onSubmit();
  };

  const handleDeleteAll = () => {
    setValue("additionalKey", "DELETE_ALL");
    onSubmit();
  };

  // ---------- Dropdown options ----------
  const projectOptions = useMemo(() => {
    const opts = projectList.map((p) => ({
      label: p.projectName || "",
      value: p.projectId || "",
    }));
    if (projectVal?.projectId && !opts.some((o) => o.value === projectVal.projectId)) {
      opts.unshift({
        label: projectVal.projectName || "",
        value: projectVal.projectId,
      });
    }
    return opts;
  }, [projectList, projectVal]);

  const meetingOptions = useMemo(() => {
    if (!meetingData?.data) return [];
    const rawData = meetingData.data as unknown as GroupedCompanyMeetings;

    const normalMeetings = rawData.normalMeetings || [];
    const detailMeetings = rawData.detailMeetings || [];

    const options: { label: string; value: string; isHeader?: boolean }[] = [];

    if (detailMeetings.length > 0) {
      options.push({ label: "Detail Meetings", value: "detail-header", isHeader: true });
      detailMeetings.forEach((m) => {
        options.push({
          label: m.meetingName || "",
          value: m.meetingId || "",
        });
      });
    }

    if (normalMeetings.length > 0) {
      options.push({ label: "Normal Meetings", value: "normal-header", isHeader: true });
      normalMeetings.forEach((m) => {
        options.push({
          label: m.meetingName || "",
          value: m.meetingId || "",
        });
      });
    }

    if (options.length === 0 && Array.isArray(meetingData.data)) {
      (meetingData.data as CompanyMeetingDataProps[]).forEach((m) => {
        options.push({
          label: m.meetingName || "",
          value: m.meetingId || "",
        });
      });
    }

    if (meetingVal?.meetingId && !options.some((o) => o.value === meetingVal.meetingId)) {
      options.unshift({
        label: meetingVal.meetingName || "",
        value: meetingVal.meetingId,
      });
    }

    return options;
  }, [meetingData, meetingVal]);

  const employeeOptions = useMemo(() => {
    const opts = (employeedata?.data ?? []).map((e) => ({
      label: e.employeeName || "",
      value: e.employeeId || "",
    }));
    assignUserVal.forEach((u) => {
      if (!opts.some((o) => o.value === u.employeeId)) {
        opts.push({ label: u.employeeName || "", value: u.employeeId });
      }
    });
    return opts;
  }, [employeedata?.data, assignUserVal]);

  const selectedRepeatLabel =
    repeatOptions.find((item) => item.value === selectedRepeat)?.label ||
    (selectedRepeat === "CUSTOMTYPE" ? "Custom" : "Repeat");

  const isActiveVal = watch("isActive");

  const employeePreview = getValues();

  return (
    <CompanyAccessGuard
      companyId={repetitiveTaskId ? resourceCompanyId : undefined}
      isLoading={repetitiveTaskId ? !taskDataById : false}
    >
      <div className="w-full h-full p-6 flex flex-col overflow-y-auto bg-[#f8f8fb] font-sans">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          {/* <h1 className="text-2xl font-bold text-gray-800">
            {repetitiveTaskId
              ? "Update Repetition Task"
              : "Create New Repetition Task"}
          </h1> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Card: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl ">
              {/* Task Name and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-semibold text-gray-900 ">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.taskName
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-primary"
                    }`}
                    placeholder="Enter task name..."
                    {...register("taskName", {
                      required: "Task Name is required",
                    })}
                  />
                  {errors.taskName && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {String(errors.taskName.message)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-md font-semibold text-gray-900 ">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-md px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.taskDescription
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-primary"
                    }`}
                    placeholder="Enter task description..."
                    {...register("taskDescription", {
                      required: "Please Enter Task Description",
                    })}
                  />
                  {errors.taskDescription && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {String(errors.taskDescription.message)}
                    </span>
                  )}
                </div>
              </div>

              {/* Project and Meeting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-md font-semibold text-gray-900">
                      Project <span className="text-red-500">*</span>
                    </label>
                    {permission.PROJECT_LIST?.Add && (
                      <a
                        href={`/projects/add?from=tasksrepeat${repetitiveTaskId ? `&taskId=${repetitiveTaskId}` : ""}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        + Add Project
                      </a>
                    )}
                  </div>
                  <Controller
                    name="project"
                    control={control}
                    rules={{ required: "Please select a Company Project" }}
                    render={({ field }) => (
                      <SearchDropdown
                        className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                        placeholder="Search project..."
                        options={projectOptions}
                        selectedValues={
                          field.value?.projectId ? [field.value.projectId] : []
                        }
                        onSelect={(item) => {
                          if (!item.value) {
                            setProjectCleared(true);
                            return field.onChange(undefined);
                          }
                          field.onChange(
                            projectList.find((p) => p.projectId === item.value) ?? {
                              projectId: item.value,
                              projectName: item.label,
                            },
                          );
                        }}
                        onSearchChange={setProjectSearch}
                        isMandatory
                        error={errors.project}
                        isCrossShow={true}
                      />
                    )}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-md font-semibold text-gray-900">
                      Meeting <span className="text-red-500">*</span>
                    </label>
                    {permission.MEETING_LIST?.Add && (
                      <a
                        href={`/meeting/add?from=tasksrepeat&projectId=${projectVal?.projectId ?? ""}${repetitiveTaskId ? `&taskId=${repetitiveTaskId}` : ""}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        + Add Meeting
                      </a>
                    )}
                  </div>
                  <Controller
                    name="meeting"
                    control={control}
                    rules={{ required: "Please select a meeting" }}
                    render={({ field }) => (
                      <SearchDropdown
                        className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                        placeholder="Search Meeting..."
                        options={meetingOptions}
                        selectedValues={
                          field.value?.meetingId ? [field.value.meetingId] : []
                        }
                        onSelect={(item) => {
                          if (!item.value) {
                            meetingClearedRef.current = true;
                            return field.onChange(undefined);
                          }
                          field.onChange(
                            flatMeetings.find((m) => m.meetingId === item.value) ?? {
                              meetingId: item.value,
                              meetingName: item.label,
                            },
                          );
                        }}
                        onSearchChange={(val) =>
                          setMeetingPagination((prev) => ({
                            ...prev,
                            search: val,
                            currentPage: 1,
                          }))
                        }
                        isMandatory
                        error={errors.meeting}
                        isCrossShow={true}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Assign To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-semibold text-gray-900 ">
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="assignUser"
                    control={control}
                    rules={{
                      validate: (v) =>
                        (Array.isArray(v) && v.length > 0) ||
                        "Please select a User",
                    }}
                    render={({ field }) => (
                      <SearchDropdown
                        className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                        placeholder="Search employee..."
                        options={employeeOptions}
                        selectedValues={(Array.isArray(field.value)
                          ? field.value
                          : []
                        ).map((u: Employee) => u.employeeId)}
                        multiSelect={true}
                        onSelect={(item) => {
                          const vals: Employee[] = Array.isArray(field.value)
                            ? field.value
                            : [];
                          if (vals.some((v) => v.employeeId === item.value)) {
                            field.onChange(
                              vals.filter((v) => v.employeeId !== item.value),
                            );
                          } else {
                            const emp = employeedata?.data?.find(
                              (e) => e.employeeId === item.value,
                            );
                            if (emp) field.onChange([...vals, emp]);
                          }
                        }}
                        onSearchChange={(val) =>
                          setEmployeePagination((prev) => ({
                            ...prev,
                            search: val,
                            currentPage: 1,
                          }))
                        }
                        error={errors.assignUser}
                        isCrossShow={false}
                      />
                    )}
                  />

                  {assignUserVal.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 items-center">
                      {assignUserVal.slice(0, 2).map((emp) => (
                        <div
                          key={emp.employeeId}
                          className="flex items-center space-x-1.5 bg-gray-50 border border-gray-150 hover:bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                            {getInitials(emp.employeeName)}
                          </div>
                          <span>{emp.employeeName}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "assignUser",
                                assignUserVal.filter(
                                  (v) => v.employeeId !== emp.employeeId,
                                ),
                                { shouldValidate: true },
                              )
                            }
                            className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {assignUserVal.length > 2 && (
                        <div className="px-2.5 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 border border-primary/20">
                          +{assignUserVal.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-md font-semibold text-gray-900 ">
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="taskTypeId"
                    rules={{ required: "Please select Task Type" }}
                    render={({ field }) => (
                      <SearchDropdown
                        className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                        options={taskTypeOptions}
                        selectedValues={field.value ? [field.value] : []}
                        onSelect={(value) => {
                          field.onChange(value.value);
                          setValue("taskTypeId", value.value);
                        }}
                        placeholder="Select Task Type..."
                        error={errors.taskTypeId}
                        onSearchChange={setIsTypeSearch}
                        isCrossShow={true}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Task Time and Repeat Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Controller
                    control={control}
                    name="repeatTime"
                    rules={{ required: "Time is required" }}
                    render={({ field, fieldState }) => (
                      <FormTimePicker
                        label="Task Time"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error}
                        isMandatory
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    control={control}
                    name="repeatType"
                    rules={{ required: "Please select Repetition Type" }}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1 w-full">
                        <label className="block text-md font-semibold text-gray-900">
                          Repeat Type <span className="text-red-500">*</span>
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer border border-gray-200 rounded-md hover:bg-accent bg-white">
                              <Repeat className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-800 text-base font-medium">
                                {selectedRepeatLabel}
                              </span>
                            </div>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="start" className="w-fit">
                            {repeatOptions.map((item) => {
                              const isSelected = item.value === selectedRepeat;
                              return (
                                <DropdownMenuItem
                                  key={item.value}
                                  onClick={() => {
                                    if (item.value === "CUSTOMTYPE") {
                                      setOpenCustomModal(true);
                                    } else {
                                      field.onChange(item.value);
                                      setValue("customObj", undefined);
                                      setCustomRepeatData(undefined);
                                      setIsRepeatChange(true);
                                    }
                                  }}
                                  className={`flex items-center justify-between ${
                                    isSelected
                                      ? "bg-accent text-accent-foreground"
                                      : ""
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {isSelected && <span className="ml-2">✔</span>}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <CustomModalFile
                          open={openCustomModal}
                          multiSelectAllow={false}
                          defaultValues={
                            watch("customObj") ||
                            CustomRepeatData ||
                            taskDataById?.data?.customObj
                          }
                          onOpenChange={setOpenCustomModal}
                          onSave={(data) => {
                            field.onChange("CUSTOMTYPE");
                            setValue("customObj", data);
                            handleSaveCustomRepeatData(data);
                            setIsRepeatChange(true);
                          }}
                        />

                        {errors.repeatType && (
                          <p className="text-red-500 text-sm mt-1 before:content-['*']">
                            {errors.repeatType.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {hasUserChangedRepeat && repeatResult && isRepeatChange ? (
                <div className="flex gap-4 text-sm text-gray-700">
                  <p>
                    <strong>Create First Task:</strong>{" "}
                    {formatToLocalDateTime(repeatResult.createDateUTC)}
                  </p>
                  <p>
                    <strong>Next Task:</strong>{" "}
                    {formatToLocalDateTime(repeatResult.nextDateUTC)}
                  </p>
                </div>
              ) : taskdata?.nextDate ? (
                <div className="flex gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Next Task:</strong> {oldDate}
                  </p>
                </div>
              ) : null}

              {/* Active/Inactive and Individual/Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="isActive"
                  rules={{ required: "Please select Any One Status" }}
                  render={({ field }) => (
                    <FormSelect
                      label="Active/InActive"
                      options={[
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                      ]}
                      error={errors.isActive}
                      {...field}
                      triggerClassName="py-3"
                      isMandatory
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="isIndividual"
                  rules={{ required: "Please select Individual or Group task" }}
                  render={({ field }) => (
                    <FormSelect
                      label="Individual / Group Task"
                      options={[
                        { label: "Individual Task", value: "individual" },
                        { label: "Group Task", value: "group" },
                      ]}
                      error={errors.isIndividual}
                      {...field}
                      triggerClassName="py-3"
                      isMandatory
                    />
                  )}
                />
              </div>

              {/* Duration Option */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-slate-700 select-none">
                    CheckIn-out Task
                  </Label>
                  <Switch
                    checked={watch("hasDuration") || false}
                    onCheckedChange={(checked) => {
                      setValue("hasDuration", checked);
                      if (!checked) {
                        setValue("durationHours", "");
                        setValue("durationMinutes", "");
                      }
                    }}
                  />
                </div>

                {(watch("hasDuration") || false) && (
                  <div className="flex items-center gap-2 ml-2 animate-in fade-in-50 slide-in-from-left-1 duration-150">
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...register("durationHours", {
                          onChange: (e) => {
                            const val = e.target.value;
                            if (val !== "" && (Number(val) < 0 || val.includes("."))) {
                              setValue("durationHours", "");
                            }
                          },
                        })}
                        className="w-10 text-center text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-primary focus:outline-none pb-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-slate-500 font-medium text-xs">hr</span>
                    </div>

                    <span className="text-slate-300 text-sm font-light pb-0.5">:</span>

                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={0}
                        max={59}
                        placeholder="00"
                        {...register("durationMinutes", {
                          onChange: (e) => {
                            const val = e.target.value;
                            if (
                              val !== "" &&
                              (Number(val) < 0 || Number(val) > 59 || val.includes("."))
                            ) {
                              setValue("durationMinutes", "");
                            }
                          },
                        })}
                        className="w-10 text-center text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-primary focus:outline-none pb-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-slate-500 font-medium text-xs">min</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tasksrepeat")}
                className="px-6 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onFinish}
                disabled={isPending}
                className="px-6 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {repetitiveTaskId ? "Update Task" : "Create Task"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Card: Summary */}
          <div className="space-y-6">
            <Card className="p-5 border border-gray-150 shadow-sm bg-white rounded-xl space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
                Task Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Project
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">
                      {projectVal?.projectName || "Search project..."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Meeting
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">
                      {meetingVal?.meetingName || "Search Meeting..."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Assign To
                    </p>
                    <div className="flex -space-x-1.5 overflow-hidden mt-1.5">
                      {assignUserVal.map((emp) => (
                        <div
                          key={emp.employeeId}
                          className="relative inline-block h-7 w-7 rounded-full ring-2 ring-white bg-primary/10 overflow-hidden shadow-sm flex items-center justify-center"
                          title={emp.employeeName}
                        >
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                            {getInitials(emp.employeeName)}
                          </div>
                        </div>
                      ))}
                      {assignUserVal.length === 0 && (
                        <span className="text-sm text-gray-400 font-medium font-sans">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Repeat
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">
                      {selectedRepeat ? selectedRepeatLabel : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div
                    className="p-2 bg-gray-50 rounded-lg"
                    style={{ color: isActiveVal === "inactive" ? "#9ca3af" : "#34c38f" }}
                  >
                    <Circle
                      className="w-4 h-4"
                      style={{ fill: isActiveVal === "inactive" ? "#9ca3af" : "#34c38f" }}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Status
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">
                      {isActiveVal === "inactive" ? "Inactive" : "Active"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {isModalOpen && (
          <AddRepetitiveTaskModal
            modalData={employeePreview as TaskPreviewData}
            isModalOpen={isModalOpen}
            modalClose={() => setModalOpen(false)}
            onSubmit={onSubmit}
            isLoading={isPending}
            isChildData={isChildData}
            onKeepAll={handleKeepAll}
            onDeleteAll={handleDeleteAll}
          />
        )}
      </div>
    </CompanyAccessGuard>
  );
}

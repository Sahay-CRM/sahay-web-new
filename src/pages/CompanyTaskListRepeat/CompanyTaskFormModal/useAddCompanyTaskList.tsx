import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormSelect from "@/components/shared/Form/FormSelect";

import {
  addUpdateRepeatCompanyTaskMutation,
  useDdTaskType,
  useGetRepeatCompanyTaskById,
} from "@/features/api/companyTask";
import { useGetCompanyProject } from "@/features/api/companyProject";
import { useGetBothCompanyMeeting } from "@/features/api/companyMeeting";
import { getEmployee } from "@/features/api/companyEmployee";
import { getUserPermission } from "@/features/selectors/auth.selector";

import {
  buildRepetitionOptionsREPT,
  getRepeatTypeOrCustomForRepeatMeeting,
} from "@/components/shared/RepeatOption/repeatOption";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AxiosError } from "axios";
import { toast } from "sonner";
import CustomModalFile from "@/components/shared/CustomModalRepeatMeeting";
import { FormTimePicker } from "@/components/shared/FormDateTimePicker/formTimePicker";
import {
  getNextRepeatDates,
  getNextRepeatDatesCustom,
} from "@/features/utils/nextDate.utils";
import {
  convertUtcTimeToLocal,
  formatToLocalDateTime,
  updateDateTime,
} from "@/features/utils/app.utils";

export default function useAddEmployee() {
  const { id: repetitiveTaskId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let queryProjectId = searchParams.get("projectId") || "";
  let queryMeetingId = searchParams.get("meetingId") || "";
  queryProjectId = queryProjectId.replace(/[?&]+$/, "");
  queryMeetingId = queryMeetingId.replace(/[?&]+$/, "");

  const { data: taskDataById } = useGetRepeatCompanyTaskById({
    filter: {
      id: repetitiveTaskId,
    },
    enable: !!repetitiveTaskId,
  });

  const taskdata = taskDataById?.data;
  const { mutate: addUpdateTask, isPending } =
    addUpdateRepeatCompanyTaskMutation();

  const [isChildData, setIsChildData] = useState<string | undefined>("");

  const {
    register,
    control,
    watch,
    formState: { errors },
    handleSubmit,
    trigger,
    // reset,
    setValue,
    getValues,
  } = useForm();

  const [isModalOpen, setModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedRepeat, setSelectedRepeat] = useState<string>("");

  const [CustomRepeatData, setCustomRepeatData] = useState<
    CustomObjREPT | undefined
  >();
  const [projectPagination] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  // const [meetingPagination] = useState<PaginationFilter>({
  //   currentPage: 1,
  //   pageSize: 25,
  //   search: "",
  // });
  const [localPagination, setLocalPagination] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const [employeePagination] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  }); 

  const { data: projectListdata } = useGetCompanyProject({
    filter: {
      ...projectPagination,
      projectId: taskdata?.projectId || undefined,
    },
    enable: !!projectPagination,
  });

  const { data: meetingData, isLoading: meetingLoading } =
    useGetBothCompanyMeeting({
      filter: {
        ...localPagination,
        meetingId: taskdata?.meetingId || undefined,
      },
    });

interface GroupedCompanyMeetings {
  detailMeetings?: CompanyMeetingDataProps[];
  normalMeetings?: CompanyMeetingDataProps[];
}

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
  useEffect(() => {
    if (repetitiveTaskId && taskDataById?.data) {
      const t = taskDataById.data;

      const deadlineString = t.taskDeadline;
      const taskDeadlineDate = deadlineString ? new Date(deadlineString) : null;
      const validTaskDeadline =
        taskDeadlineDate && !isNaN(taskDeadlineDate.getTime())
          ? taskDeadlineDate
          : null;

      const employeeIds = t.assignUsers?.map((u) => u.employeeId) || [];
      const targetProjectId = queryProjectId || t.projectId || "";
      const targetMeetingId = queryMeetingId || t.meetingId || "";

      setValue("repetitiveTaskId", t.repetitiveTaskId);
      setValue("repeatTime", convertUtcTimeToLocal(t.repeatTime));
      setValue(
        "project",
        projectListdata?.data?.find((p) => p.projectId === targetProjectId) || null,
      );
      const foundMeeting = flatMeetings.find((m) => m.meetingId === targetMeetingId);
      setValue(
        "meeting",
        foundMeeting || null,
      );
      setValue("taskName", t.taskName || "");
      setValue("taskDescription", t.taskDescription || "");
      setValue(
        "taskStartDate",
        t.taskStartDate ? new Date(t.taskStartDate) : null,
      );
      setValue("taskDeadline", validTaskDeadline);
      setValue("repeatType", t.repeatType || "");
      setValue("isActive", t.isActive ? "active" : "inactive");
      setValue("isIndividual", t.isIndividual ? "individual" : "group");
      setValue("taskTypeId", t.taskTypeId || "");
      setValue("customObj", t.customObj || null);
      setValue(
        "assignUser",
        employeedata?.data?.filter((emp) =>
          employeeIds.includes(emp.employeeId),
        ) ?? [],
      );
      if (t.customObj) {
        setCustomRepeatData(t.customObj);
      }
      setSelectedRepeat(getRepeatTypeOrCustomForRepeatMeeting(t));
      if (t.duration && t.duration > 0) {
        setValue("hasDuration", true);
        const totalMinutes = t.duration;
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        setValue("durationHours", h > 0 ? String(h) : "");
        setValue("durationMinutes", m > 0 ? String(m) : "");
      } else {
        setValue("hasDuration", false);
        setValue("durationHours", "");
        setValue("durationMinutes", "");
      }
    } else {
      setValue("isActive", "active");
      setValue("isIndividual", "individual");
      setSelectedRepeat("");
      setValue("hasDuration", false);
      setValue("durationHours", "");
      setValue("durationMinutes", "");
    }
  }, [
    repetitiveTaskId,
    taskDataById,
    projectListdata?.data,
    flatMeetings,
    employeedata?.data,
    setValue,
    meetingData,
    queryProjectId,
    queryMeetingId,
  ]);

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
      ? (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0)
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
          // repeatType: data.repeatType.toUpperCase(),
          customObj: data.customObj,
          duration: durationMinutes,
        };

    addUpdateTask(payload, {
      onSuccess: () => {
        navigate("/dashboard/tasksrepeat");
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setIsChildData(axiosError.response?.data?.message);
        } else if (axiosError.response?.data.status !== 417) {
          toast.error(
            `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
          );
        }
      },
    });
  });

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const handleClose = () => setModalOpen(false);

  // ---------- Steps (components) ----------
  const ProjectSelectionStep = () => {
    const permission = useSelector(getUserPermission);

    // local pagination for this step (keeps isolation)
    const [localPagination, setLocalPagination] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

    // prefer the global projectList but allow local filtering too
    const { data: localProjectList, isLoading: localProjectLoading } =
      useGetCompanyProject({
        filter: localPagination,
        enable: !!localPagination,
      });

    return (
      <div className="h-full flex flex-col overflow-hidden p-0">
        <div className="flex items-center space-x-5 tb:space-x-7 mb-4 justify-between shrink-0">
          <div className="flex gap-4">
            <SearchInput
              placeholder="Search Projects..."
              searchValue={localPagination?.search || ""}
              setPaginationFilter={setLocalPagination}
              className="w-96"
            />
            {errors?.project && (
              <div className="mt-2">
                <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                  {String(errors?.project?.message || "")}
                </span>
              </div>
            )}
          </div>
          {permission.PROJECT_LIST?.Add && (
            <a href={`/dashboard/projects/add?from=tasksrepeat${repetitiveTaskId ? `&taskId=${repetitiveTaskId}` : ""}`}>
              <Button className="py-2 w-fit">Add Company Project</Button>
            </a>
          )}
        </div>

        <Controller
          name="project"
          control={control}
          rules={{ required: "Please select a Company Project" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={localProjectList?.data?.map((item, index: number) => ({
                ...item,
                srNo:
                  (localProjectList.currentPage - 1) *
                    localProjectList.pageSize +
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={{
                srNo: "sr No",
                projectName: "Project Name",
              }}
              isLoading={localProjectLoading}
              primaryKey="projectId"
              multiSelect={false}
              selectedValue={
                field.value?.projectId &&
                localProjectList?.data?.find(
                  (item) => item.projectId === field.value.projectId,
                )
              }
              handleChange={(val) => {
                if (!val || (Array.isArray(val) && val.length === 0)) {
                  field.onChange(undefined);
                } else if (Array.isArray(val)) {
                  field.onChange(val[0]);
                } else {
                  field.onChange(val);
                }
              }}
              onCheckbox={() => true}
              paginationDetails={localProjectList as PaginationFilter}
              setPaginationFilter={setLocalPagination}
              showActionsColumn={false}
              tableHeightClass="flex-1"
            />
          )}
        />
      </div>
    );
  };

  const MeetingSelectionStep = () => {
    const permission = useSelector(getUserPermission);
    const projectId = watch("project");

    return (
      <div className="h-full flex flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7 shrink-0">
          <div className="flex items-center gap-4">
            <SearchInput
              placeholder="Search..."
              searchValue={localPagination?.search || ""}
              setPaginationFilter={setLocalPagination}
              className="w-80"
            />

            {errors?.meeting && (
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] whitespace-nowrap">
                {String(errors?.meeting?.message || "")}
              </span>
            )}
          </div>

          {permission.MEETING_LIST?.Add && (
            <a
              href={`/dashboard/meeting/add?from=tasksrepeat&projectId=${projectId?.projectId ?? ""}${repetitiveTaskId ? `&taskId=${repetitiveTaskId}` : ""}`}
            >
              <Button className="py-2 w-fit">Add Meeting </Button>
            </a>
          )}
        </div>

        <Controller
          name="meeting"
          control={control}
          rules={{ required: "Please select a meeting" }}
          render={({ field }) => (
            <TableData
              {...field}
              tableData={flatMeetings.map((item, index: number) => ({
                ...item,
                srNo:
                 
                  index +
                  1,
              }))}
              isActionButton={() => false}
              columns={{
                srNo: "sr No",
                meetingName: "Meeting Name",
              }}
              primaryKey="meetingId"
              multiSelect={false}
              selectedValue={
                field.value?.meetingId &&
                flatMeetings.find(
                  (item) => item.meetingId === field.value.meetingId,
                )
              }
              handleChange={(val) => {
                if (!val || (Array.isArray(val) && val.length === 0)) {
                  field.onChange(undefined);
                } else if (Array.isArray(val)) {
                  field.onChange(val[0]);
                } else {
                  field.onChange(val);
                }
              }}
              onCheckbox={() => true}
              // paginationDetails={meetingData as PaginationFilter}
              // setPaginationFilter={setLocalPagination}
              showActionsColumn={false}
              isLoading={meetingLoading}
              tableHeightClass="flex-1"
            />
          )}
        />
      </div>
    );
  };

  const TaskDetailsStep = () => {
    const repeatOptions = buildRepetitionOptionsREPT(new Date());
    const [openCustomModal, setOpenCustomModal] = useState(false);
    const [isTypeSearch, setIsTypeSearch] = useState("");
    const [hasUserChangedRepeat, setHasUserChangedRepeat] = useState(false);
    const [isRepeatChange, setIsRepeatChange] = useState(false);

    const repeatTime = watch("repeatTime");
    const selectedRepeat = watch("repeatType");

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

    const [repeatResult, setRepeatResult] = useState<{
      createDateUTC: string;
      nextDateUTC: string;
    } | null>(null);

    // const prevCustomDataRef = useRef<CustomObjREPT | undefined>(
    //   CustomRepeatData
    // );
    // const initialCustomRef = useRef<CustomObjREPT | undefined>(
    //   taskdata?.customObj
    // );
    const prevCustomDataRef = useRef(CustomRepeatData);
    const initialCustomRef = useRef(taskdata?.customObj);
    const handleSaveCustomRepeatData = useCallback(
      (customData: CustomObjREPT) => {
        setCustomRepeatData(customData);
      },
      [],
    );
    // 🔹 CUSTOMTYPE logic
    useEffect(() => {
      if (selectedRepeat !== "CUSTOMTYPE" || !CustomRepeatData || !repeatTime)
        return;

      const hasCustomChanged =
        JSON.stringify(CustomRepeatData) !==
        JSON.stringify(initialCustomRef.current);

      // mark user-changed only if user really changed custom data or time
      if (hasCustomChanged || repeatTime !== taskdata?.repeatTime) {
        setHasUserChangedRepeat(true);
        setIsRepeatChange(true);
      }

      prevCustomDataRef.current = CustomRepeatData;

      const result = getNextRepeatDatesCustom(
        "CUSTOMTYPE",
        repeatTime,
        CustomRepeatData as CustomRepeatConfig,
      );
      setRepeatResult(result);
    }, [selectedRepeat, repeatTime]);

    // 🔹 Non-CUSTOMTYPE logic
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
      const result = getNextRepeatDates(selectedRepeat, repeatTime, timezone);
      setRepeatResult(result);
    }, [selectedRepeat, repeatTime]);

    // 🔹 Update form fields when repeat result changes
    useEffect(() => {
      if (repeatResult) {
        setValue("createDateUTC", repeatResult.createDateUTC);
        setValue("nextDateUTC", repeatResult.nextDateUTC);
      }
    }, [repeatResult]);

    const oldDate = taskDataById?.data?.nextDate
      ? updateDateTime(taskDataById.data.nextDate, repeatTime)
      : "";

    return (
      <div className="grid mb-10 grid-cols-2 gap-4">
        <Card className="col-span-2 mt-4 px-4 py-4 grid grid-cols-2 gap-4">
          <div>
            <FormInputField
              label="Task Name"
              {...register("taskName", { required: "Task Name is required" })}
              error={errors.taskName}
            />
            <div className="mt-2">
              <label className="block mb-1 font-medium">
                Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border rounded-md p-2 text-base min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                {...register("taskDescription", {
                  required: "Please Enter Task Description",
                })}
              />
              {errors.taskDescription && (
                <span className="text-red-600 text-sm before:content-['*']">
                  {errors.taskDescription?.message as string}
                </span>
              )}
            </div>

            {/* Duration Option */}
            <div className="flex items-center gap-3 mt-4 pt-2 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-slate-700 select-none">CheckIn-out Task</Label>
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
                  {/* Hours */}
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
                        }
                      })}
                      className="w-10 text-center text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-primary focus:outline-none pb-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-medium text-xs">hr</span>
                  </div>

                  {/* Separator */}
                  <span className="text-slate-300 text-sm font-light pb-0.5">:</span>

                  {/* Minutes */}
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      {...register("durationMinutes", {
                        onChange: (e) => {
                          const val = e.target.value;
                          if (val !== "" && (Number(val) < 0 || Number(val) > 59 || val.includes("."))) {
                            setValue("durationMinutes", "");
                          }
                        }
                      })}
                      className="w-10 text-center text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-primary focus:outline-none pb-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-medium text-xs">min</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watch("repetition") === "none" && (
                <Controller
                  control={control}
                  name="taskStartDate"
                  render={({ field }) => (
                    <FormDateTimePicker
                      label="Task Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.taskStartDate}
                      disablePastDays={
                        Number(import.meta.env.VITE_DISABLEPASTDATES) || 3
                      }
                    />
                  )}
                />
              )}
            </div>

            <div className="flex gap-4 items-start w-full">
              <div className="w-[180px] shrink-0">
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

              <div className="flex-1 min-w-0">
                <Controller
                  control={control}
                  name="repeatType"
                  rules={{ required: "Please select Repetition Type" }}
                  render={({ field }) => {
                    const selectedRepeatLabel =
                      repeatOptions.find((item) => item.value === selectedRepeat)
                        ?.label ||
                      (selectedRepeat === "CUSTOMTYPE" ? "Custom" : "Repeat");

                    return (
                      <div className="flex flex-col gap-1 w-full">
                        <Label className="mb-0.5">Repeat Type</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 px-3 h-9 cursor-pointer border rounded-md hover:bg-accent bg-white">
                              <Repeat className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-800 text-sm font-medium">{selectedRepeatLabel}</span>
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
                                      setSelectedRepeat(item.value);
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
                            setSelectedRepeat("CUSTOMTYPE");
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
                    );
                  }}
                />
              </div>
            </div>

            {hasUserChangedRepeat && repeatResult && isRepeatChange ? (
              <div className="flex gap-2 text-sm text-gray-700">
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

            <div className="flex gap-4">
              <div className="w-1/2">
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
              </div>

              <div className="w-1/2">
                <Controller
                  control={control}
                  name="taskTypeId"
                  rules={{ required: "Please select Task Type" }}
                  render={({ field }) => (
                    <SearchDropdown
                      options={taskTypeOptions}
                      className="mt-0.5"
                      selectedValues={field.value ? [field.value] : []}
                      onSelect={(value) => {
                        field.onChange(value.value);
                        setValue("taskTypeId", value.value);
                      }}
                      placeholder="Select Task Type..."
                      label="Task Type"
                      error={errors.taskTypeId}
                      isMandatory
                      onSearchChange={setIsTypeSearch}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
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
              <div className="w-1/2" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const AssignUserStep = () => {
    const [localPagination, setLocalPagination] = useState<PaginationFilter>({
      currentPage: 1,
      pageSize: 25,
      search: "",
    });

    const { data: localEmployeeList, isLoading: localEmployeeLoading } =
      getEmployee({
        filter: { ...localPagination, isDeactivated: false },
      });

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 space-x-5 tb:space-x-7 shrink-0">
          <div className="flex  items-center gap-4">
            <SearchInput
              placeholder="Search..."
              searchValue={localPagination?.search || ""}
              setPaginationFilter={setLocalPagination}
              className="w-80"
            />

            {errors?.assignUser && (
              <span className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*'] whitespace-nowrap">
                {String(errors?.assignUser?.message || "")}
              </span>
            )}
          </div>
        </div>

        <Controller
          name="assignUser"
          control={control}
          rules={{ required: "Please select a User" }}
          render={({ field }) => {
            return (
              <TableData
                {...field}
                tableData={localEmployeeList?.data?.map(
                  (item, index: number) => ({
                    ...item,
                    srNo:
                      (localEmployeeList.currentPage - 1) *
                        localEmployeeList.pageSize +
                      index +
                      1,
                  }),
                )}
                isActionButton={() => false}
                columns={{
                  srNo: "srNo",
                  employeeName: "User Name",
                  employeeType: "Employee Type",
                  designationName: "Designation",
                }}
                primaryKey="employeeId"
                multiSelect={true}
                selectedValue={field.value || []}
                handleChange={(selected) => {
                  field.onChange(Array.isArray(selected) ? selected : []);
                }}
                onCheckbox={() => true}
                paginationDetails={localEmployeeList as PaginationFilter}
                setPaginationFilter={setLocalPagination}
                showActionsColumn={false}
                isLoading={localEmployeeLoading}
                tableHeightClass="flex-1"
              />
            );
          }}
        />
      </div>
    );
  };

  const employeePreview = getValues();

  const handleKeepAll = () => {
    setValue("additionalKey", "UPDATE_ALL");
    onSubmit();
  };

  const handleDeleteAll = () => {
    setValue("additionalKey", "DELETE_ALL");
    onSubmit();
  };

  return {
    employeeData: employeedata,
    showNextStep: watch("employeeType") !== "OWNER",
    isPending,
    onFinish,
    trigger,
    isModalOpen,
    employeePreview,
    handleClose,
    onSubmit,
    repetitiveTaskId,
    taskDataById,
    ProjectSelectionStep,
    MeetingSelectionStep,
    TaskDetailsStep,
    AssignUserStep,
    setValue,
    meetingData,
    flatMeetings,
    projectListdata,
    handleKeepAll,
    handleDeleteAll,
    isChildData,
  };
}

import { Controller, FormProvider } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import ProjectDrawer from "./projectDrawer";
import MeetingDrawer from "./meetingDrawer";

import { Button } from "@/components/ui/button";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { useAddCompanyTaskSingle } from "./useAddCompanyTaskSingle";
import { useGetCompanyTaskSearch } from "@/features/api/companyTask";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import PageNotAccess from "@/pages/PageNoAccess";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/features/utils/app.utils";


import {
  Folder,
  Calendar,
  Users,
  Circle,
  X,
  Send,
  Loader2,
} from "lucide-react";

export default function AddCompanyTaskSingle() {
  const hookProps = useAddCompanyTaskSingle();
  const {
    onSubmit,
    methods,
    employeedata,
    projectListdata,
    setPaginationFilterEmployee,
    setPaginationFilterProject,
    setPaginationFilterMeeting,
    meetingData,
    taskId,
    taskStatusOptions,
    taskTypeOptions,
    isPending,
    taskDataById,
    taskPermission,
    setIsTypeSearch,
    setIsStatusSearch,
    isConfModalOpen,
    setIsConfModalOpen,
    reasons,
    setReasons,
    onConfirmSubmit,
  } = hookProps;

  const queryClient = useQueryClient();

  // Project Drawer States
  const [isOpenProjectDrawer, setIsOpenProjectDrawer] = useState(false);

  // Meeting Drawer States
  const [isOpenMeetingDrawer, setIsOpenMeetingDrawer] = useState(false);

  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = taskDataById?.data?.companyId;
  const isAuthorized =
    !taskId ||
    !resourceCompanyId ||
    resourceCompanyId === currentCompany?.companyId;

  let initialProjectId = searchParams.get("projectId") || "";
  let initialMeetingId = searchParams.get("meetingId") || "";
  initialProjectId = initialProjectId.replace(/[?&]+$/, "");
  initialMeetingId = initialMeetingId.replace(/[?&]+$/, "");

  const { handleSubmit, register, control, setValue, watch, formState: { errors } } = methods;

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: taskId ? "Update Task" : "Add Task", href: "" },
      ...(taskId && isAuthorized
        ? [
            {
              label: taskDataById?.data.taskName || "",
              href: `/dashboard/kpi/${taskId}`,
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, taskDataById?.data.taskName, taskId, isAuthorized]);

  // Set initial project and meeting from search params if present
  useEffect(() => {
    if (initialProjectId) {
      setValue("project", initialProjectId);
    }
    if (initialMeetingId) {
      setValue("meeting", initialMeetingId);
    }
  }, [initialMeetingId, initialProjectId, setValue]);



  // Form values watchers for real-time summary card and logic
  const taskNameValue = watch("taskName") || "";
  const taskDescriptionValue = watch("taskDescription") || "";
  const prevTaskNameRef = useRef(taskNameValue);

  // Auto-fill description if empty and matches previous name
  useEffect(() => {
    if (taskDescriptionValue === "" || taskDescriptionValue === prevTaskNameRef.current) {
      if (taskDescriptionValue !== taskNameValue) {
        setValue("taskDescription", taskNameValue);
      }
    }
    prevTaskNameRef.current = taskNameValue;
  }, [taskNameValue, taskDescriptionValue, setValue]);

  // Similar tasks check logic
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [nameChanged, setNameChanged] = useState(false);

  useEffect(() => {
    if (taskId && originalName === null && taskNameValue.trim().length > 0) {
      setOriginalName(taskNameValue);
    }
  }, [taskId, originalName, taskNameValue]);

  useEffect(() => {
    if (taskId && originalName !== null) {
      setNameChanged(taskNameValue !== originalName);
    }
  }, [taskId, originalName, taskNameValue]);

  const shouldSearch = !taskId || nameChanged;
  const { data: taskSearchData } = useGetCompanyTaskSearch(
    shouldSearch ? taskNameValue : "",
  );

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (taskId && !nameChanged) {
      setShowSearchDropdown(false);
      return;
    }
    const hasResults =
      (taskSearchData?.data?.length ?? 0) > 0 &&
      taskNameValue.trim().length >= 5;

    if (hasResults) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [taskNameValue, taskSearchData, taskId, nameChanged]);

  const showSimilarResults =
    shouldSearch &&
    showSearchDropdown &&
    taskNameValue.trim().length >= 5 &&
    (taskSearchData?.data?.length ?? 0) > 0;

  // Watch fields for Task Summary Real-time view
  const projectVal = watch("project");
  const meetingVal = watch("meeting");
  const assignUserVal = watch("assignUser") || [];
  const deadlineVal = watch("taskDeadline");
  const statusVal = watch("taskStatusId");

  const projectOptions = projectListdata?.data
    ? projectListdata.data.map((p) => ({
        label: p.projectName || "",
        value: p.projectId || "",
      }))
    : [];

interface GroupedCompanyMeetings {
  detailMeetings?: CompanyMeetingDataProps[];
  normalMeetings?: CompanyMeetingDataProps[];
}

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

    return options;
  }, [meetingData]);

  const employeeOptions = employeedata?.data
    ? employeedata.data.map((e) => ({
        label: e.employeeName || "",
        value: e.employeeId || "",
      }))
    : [];

  const selectedProject = projectListdata?.data?.find((p) => p.projectId === projectVal);
  const selectedMeeting = useMemo(() => {
    if (!meetingData?.data) return null;
    const rawData = meetingData.data as unknown as GroupedCompanyMeetings;
    if (Array.isArray(rawData)) {
      return (rawData as CompanyMeetingDataProps[]).find((m) => m.meetingId === meetingVal);
    }
    const allMeetings = [
      ...(rawData.normalMeetings || []),
      ...(rawData.detailMeetings || []),
    ];
    return allMeetings.find((m) => m.meetingId === meetingVal);
  }, [meetingData, meetingVal]);
  const selectedStatus = taskStatusOptions.find((s) => s.value === statusVal);

  const selectedEmployees = (assignUserVal
    .map((id) => {
      return (
        employeedata?.data?.find((e) => e.employeeId === id) ||
        taskDataById?.data?.assignUsers?.find((e) => e.employeeId === id)
      );
    })
    .filter(Boolean) as Employee[]);



  const formattedDeadline = deadlineVal
    ? new Date(deadlineVal).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const quickDeadlines = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "This Week", value: "this_week" },
    { label: "Next Week", value: "next_week" },
  ];

  const handleQuickDeadline = (type: string, onChange: (d: Date) => void) => {
    const targetDate = new Date();
    if (type === "today") {
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "this_week") {
      const day = targetDate.getDay();
      const diff = 5 - day; // 5 is Friday
      targetDate.setDate(targetDate.getDate() + (diff >= 0 ? diff : diff + 7));
      targetDate.setHours(18, 0, 0, 0);
    } else if (type === "next_week") {
      const day = targetDate.getDay();
      const diff = 5 - day + 7;
      targetDate.setDate(targetDate.getDate() + diff);
      targetDate.setHours(18, 0, 0, 0);
    }
    onChange(targetDate);
  };

  if (!taskPermission || taskPermission.Add === false) {
    return <PageNotAccess />;
  }

  return (
    <CompanyAccessGuard
      companyId={taskId ? resourceCompanyId : undefined}
      isLoading={taskId ? !taskDataById : false}
    >
      <FormProvider {...methods}>
        <div className="w-full h-full p-6 flex flex-col overflow-y-auto bg-[#f8f8fb] font-sans">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {taskId ? "Update Task" : "Create New Task"}
              </h1>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Card: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border border-gray-100 shadow-sm bg-white rounded-xl ">
                {/* Task Name and Description fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task Name */}
                  <div className="relative" ref={searchDropdownRef}>
                    <label className="block text-md font-semibold text-gray-900 ">
                      Task Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
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
                        onFocus={() => {
                          if (
                            shouldSearch &&
                            taskNameValue.trim().length >= 5 &&
                            (taskSearchData?.data?.length ?? 0) > 0
                          ) {
                            setShowSearchDropdown(true);
                          }
                        }}
                      />
                    </div>
                    {errors.taskName && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {String(errors.taskName.message)}
                      </span>
                    )}

                    {showSimilarResults && (
                      <div className="absolute top-[100%] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[99]">
                        <div className="px-3 py-2 text-[12px] text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 font-medium">
                          Similar Tasks Found
                        </div>
                        {taskSearchData?.data?.map((item: SearchResponse) => (
                          <div
                            key={item.taskId}
                            className="px-3 py-2 text-sm text-gray-700 border-b last:border-b-0 cursor-default hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{item.taskName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Task Description */}
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

                {/* Project and Meeting Select fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-md font-semibold text-gray-900">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOpenProjectDrawer(true)}
                        className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                      >
                        + Add Project
                      </button>
                    </div>
                    <div className="relative">
                      <Controller
                        name="project"
                        control={control}
                        rules={{ required: "Please select a Project" }}
                        render={({ field }) => (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                            placeholder="Search project..."
                            options={projectOptions}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(item) => field.onChange(item.value)}
                            onSearchChange={(val) =>
                              setPaginationFilterProject((prev) => ({
                                ...prev,
                                search: val,
                                currentPage: 1,
                              }))
                            }
                            error={errors.project}
                            isCrossShow={true}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-md font-semibold text-gray-900">
                        Meeting
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOpenMeetingDrawer(true)}
                        className="text-xs font-semibold text-primary hover:underline focus:outline-none"
                      >
                        + Add Meeting
                      </button>
                    </div>
                    <div className="relative">
                      <Controller
                        name="meeting"
                        control={control}
                        render={({ field }) => (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                            placeholder="Search meeting (optional)..."
                            options={meetingOptions}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(item) => field.onChange(item.value)}
                            onSearchChange={(val) =>
                              setPaginationFilterMeeting((prev) => ({
                                ...prev,
                                search: val,
                                currentPage: 1,
                              }))
                            }
                            error={errors.meeting}
                            isCrossShow={true}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Assign To and Task Deadline fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-md font-semibold text-gray-900 ">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Controller
                        name="assignUser"
                        control={control}
                        rules={{
                          required:
                            "Please assign this task to at least one user",
                        }}
                        render={({ field }) => (
                          <SearchDropdown
                            className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                            placeholder="Search employee..."
                            options={employeeOptions}
                            selectedValues={
                              Array.isArray(field.value) ? field.value : []
                            }
                            multiSelect={true}
                            onSelect={(item) => {
                              const vals = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (vals.includes(item.value)) {
                                field.onChange(
                                  vals.filter((v) => v !== item.value),
                                );
                              } else {
                                field.onChange([...vals, item.value]);
                              }
                            }}
                            onSearchChange={(val) =>
                              setPaginationFilterEmployee((prev) => ({
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
                    </div>

                    {/* Assigned User Pills list */}
                    {selectedEmployees.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5 items-center">
                        {selectedEmployees.slice(0, 2).map((emp: Employee) => {
                          return (
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
                                onClick={() => {
                                  const vals = Array.isArray(assignUserVal)
                                    ? assignUserVal
                                    : [];
                                  setValue(
                                    "assignUser",
                                    vals.filter((v) => v !== emp.employeeId),
                                    { shouldValidate: true },
                                  );
                                }}
                                className="text-gray-400 hover:text-red-500 rounded-full focus:outline-none"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        {selectedEmployees.length > 2 && (
                          <div className="px-2.5 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                            +{selectedEmployees.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-md font-semibold text-gray-900 mb-3 ">
                      Task Deadline <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="taskDeadline"
                      rules={{ required: "Task Deadline is required" }}
                      render={({ field }) => (
                        <div>
                          <div className="[&_input]:text-base [&_input]:py-2.5 [&_input]:px-3.5 [&_input]:border-gray-200 [&_input]:h-auto [&_svg]:hidden">
                            <FormDateTimePicker
                              label=""
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.taskDeadline}
                              disablePastDays={
                                Number(import.meta.env.VITE_DISABLEPASTDATES) ||
                                3
                              }
                              disabled={
                                taskDataById?.data?.deadlineRequest ===
                                "PENDING"
                              }
                            />
                          </div>
                          {taskDataById?.data?.deadlineRequest ===
                            "PENDING" && (
                            <p className="text-xs text-primary mt-1">
                              Deadline change request is pending approval
                            </p>
                          )}

                          {/* Quick Deadline Chips */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {quickDeadlines.map((chip) => (
                              <button
                                key={chip.value}
                                type="button"
                                onClick={() =>
                                  handleQuickDeadline(
                                    chip.value,
                                    field.onChange,
                                  )
                                }
                                className="px-2.5 py-1 text-[11px] bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-md font-medium transition-all"
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Task Type and Task Status fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-md font-semibold text-gray-900 ">
                      Task Status <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="taskStatusId"
                      rules={{ required: "Please select Task Status" }}
                      render={({ field }) => (
                        <SearchDropdown
                          className="w-full border-gray-200 text-base py-2.5 h-auto font-normal"
                          options={taskStatusOptions}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value.value);
                            setValue("taskStatusId", value.value);
                          }}
                          placeholder="Select Task Status..."
                          error={errors.taskStatusId}
                          onSearchChange={setIsStatusSearch}
                          isCrossShow={false}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Comment field (Optional, Add mode only) */}
                {!taskId && (
                  <div>
                    <label className="block text-md font-semibold text-gray-900 ">
                      Comment
                    </label>
                    <Textarea
                      className="w-full border-gray-200 focus-visible:ring-primary/20 focus-visible:border-primary text-base py-2.5 min-h-[80px]"
                      placeholder="Add a starting comment..."
                      {...register("comment")}
                    />
                  </div>
                )}
              </Card>

              {/* Action Buttons (Bottom) */}
              <div className="flex items-center space-x-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/tasks")}
                  className="px-6 border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
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
                      <span>{taskId ? "Update Task" : "Create Task"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Card: Task Summary Sidebar */}
            <div className="space-y-6">
              <Card className="p-5 border border-gray-150 shadow-sm bg-white rounded-xl space-y-4">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">
                  Task Summary
                </h3>

                <div className="space-y-4">
                  {/* Project Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Project
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {selectedProject
                          ? selectedProject.projectName
                          : "Search project..."}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Meeting
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {selectedMeeting
                          ? selectedMeeting.meetingName
                          : "Weekly Team Sync"}
                      </p>
                    </div>
                  </div>

                  {/* Assignee Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Assign To
                      </p>
                      <div className="flex -space-x-1.5 overflow-hidden mt-1.5">
                        {selectedEmployees.map((emp: Employee) => {
                          return (
                            <div
                              key={emp.employeeId}
                              className="relative inline-block h-7 w-7 rounded-full ring-2 ring-white bg-primary/10 overflow-hidden shadow-sm flex items-center justify-center"
                              title={emp.employeeName}
                            >
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                                {getInitials(emp.employeeName)}
                              </div>
                            </div>
                          );
                        })}
                        {selectedEmployees.length === 0 && (
                          <span className="text-sm text-gray-400 font-medium font-sans">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Deadline Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Deadline
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {formattedDeadline || "No deadline set"}
                      </p>
                    </div>
                  </div>

                  {/* Status Summary Block */}
                  <div className="flex items-start space-x-3">
                    <div
                      className="p-2 bg-gray-50 rounded-lg"
                      style={{ color: selectedStatus?.color || "#556ee6" }}
                    >
                      <Circle
                        className="w-4 h-4"
                        style={{ fill: selectedStatus?.color || "#556ee6" }}
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        Status
                      </p>
                      <p
                        className="text-sm font-semibold text-gray-700 mt-0.5"
                        style={{ color: selectedStatus?.color }}
                      >
                        {selectedStatus ? selectedStatus.label : "In Progress"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Deadline change reason dialog */}
          <Dialog open={isConfModalOpen} onOpenChange={setIsConfModalOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-gray-800">
                  Confirmation Required
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  The deadline has been changed. Please provide a reason to
                  proceed with the update.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-3">
                <div className="grid gap-2">
                  <label
                    htmlFor="reason"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Reason
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reasons for deadline change..."
                    value={reasons}
                    onChange={(e) => setReasons(e.target.value)}
                    className="col-span-3 border-gray-200 focus:border-primary"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfModalOpen(false)}
                  disabled={isPending}
                  className="border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirmSubmit}
                  disabled={isPending || !reasons.trim()}
                  className="bg-primary hover:bg-primary-dark text-white font-medium"
                >
                  {isPending ? "Confirming..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ProjectDrawer
            open={isOpenProjectDrawer}
            onClose={() => setIsOpenProjectDrawer(false)}
            projectsFireBase={() => {}}
            onProjectCreated={(newProj) => {
              setValue("project", newProj.projectId || "");
              queryClient.invalidateQueries({
                queryKey: ["get-project-list-meeting"],
              });
              queryClient.invalidateQueries({ queryKey: ["get-project-list"] });
            }}
          />

          <MeetingDrawer
            open={isOpenMeetingDrawer}
            onClose={() => setIsOpenMeetingDrawer(false)}
            onMeetingCreated={(newMeet) => {
              setValue("meeting", newMeet.meetingId || "");
              queryClient.invalidateQueries({ queryKey: ["get-both-meeting"] });
            }}
          />
        </div>
      </FormProvider>
    </CompanyAccessGuard>
  );
}

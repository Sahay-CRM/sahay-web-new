import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/shared/SearchInput";
import TableData from "@/components/shared/DataTable/DataTable";

import { TaskForm } from "./taskForm";

import {
  addUpdateCompanyTaskMutation,
  useAllCompanyTask,
  useDdTaskType,
  useGetAllTaskStatus,
  useGetCompanyTaskById,
} from "@/features/api/companyTask";
import { formatToLocalDateTime } from "@/features/utils/app.utils";
import { queryClient } from "@/queryClient";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useGetMeetingSearch } from "@/features/api/companyMeeting";

export default function ProjectTaskList({
  activeProjectId,
  className,
}: {
  activeProjectId: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const taskPermission = useSelector(getUserPermission).TASK;
  const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { data: taskDataById } = useGetCompanyTaskById(editingTaskId || "");
  const [isMeetingSearch, setIsMeetingSearch] = useState("");
  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const taskNameValue = watch("taskName") || "";
  const taskDescriptionValue = watch("taskDescription") || "";
  const prevTaskNameRef = useRef(taskNameValue);

  useEffect(() => {
    if (
      taskDescriptionValue === "" ||
      taskDescriptionValue === prevTaskNameRef.current
    ) {
      if (taskDescriptionValue !== taskNameValue) {
        setValue("taskDescription", taskNameValue);
      }
    }
    prevTaskNameRef.current = taskNameValue;
  }, [taskNameValue, taskDescriptionValue, setValue]);

  const defaultValue = {
    meetingId: "",
    taskName: "",
    taskDescription: "",
    taskDeadline: null,
    taskStatusId: "",
    taskTypeId: "",
    assignUsers: [],
  };

  const { data: tasks } = useAllCompanyTask({
    filter: {
      projectId: activeProjectId,
    },
  });

  const taskTableData = (tasks?.data ?? [])
    .filter((task) => {
      if (!taskSearch) return true;
      const search = taskSearch.toLowerCase();
      return (
        task.taskName?.toLowerCase().includes(search) ||
        task.taskDescription?.toLowerCase().includes(search) ||
        task.taskStatus?.toLowerCase().includes(search)
      );
    })
    .map((item, index) => ({
      ...item,
      srNo: index + 1,
      taskDeadline: item.taskDeadline
        ? formatToLocalDateTime(item.taskDeadline)
        : "",
      assigneeNames: item.TaskEmployeeJunction
        ? item.TaskEmployeeJunction.map((j) => j.Employee?.employeeName)
            .filter(Boolean)
            .join(", ")
        : "",
    }));

  const { data: taskTypeData } = useDdTaskType({
    filter: { search: isTypeSearch.length >= 3 ? isTypeSearch : undefined },
  });

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
      pageSize: 25,
    },
  });

  const { data: employeedata } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });

  const { data: searchMeetingData } = useGetMeetingSearch(isMeetingSearch);

  const employeeOption = employeedata
    ? employeedata.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];

  const meetingDataOption = [
    ...(searchMeetingData?.data?.normal?.length
      ? [{ label: "NORMAL meetings", value: "header-normal", isHeader: true }]
      : []),
    ...(searchMeetingData?.data?.normal ?? []).map((item) => ({
      label: item.meetingName ?? "",
      value: item.meetingId ?? "",
    })),
    ...(searchMeetingData?.data?.detail?.length
      ? [{ label: "DETAIL meetings", value: "header-detail", isHeader: true }]
      : []),
    ...(searchMeetingData?.data?.detail ?? []).map((item) => ({
      label: item.meetingName ?? "",
      value: item.meetingId ?? "",
    })),
  ];

  const taskStatusOptions = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
        color: status.color || "#2e3195",
      }))
    : [];

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "",
      }))
    : [];

  const defaultTaskStatus = (taskStatus?.data || [])
    .slice()
    .sort((a, b) => (a.taskStatusOrder || 0) - (b.taskStatusOrder || 0))[0];

  useEffect(() => {
    if (!editingTaskId && defaultTaskStatus && !watch("taskStatusId")) {
      setValue("taskStatusId", defaultTaskStatus.taskStatusId);
    }
  }, [defaultTaskStatus, editingTaskId, setValue, watch]);

  useEffect(() => {
    if (taskDataById?.data && editingTaskId) {
      reset({
        taskId: taskDataById.data.taskId || "",
        meetingId: taskDataById.data?.meetingId || "",
        taskName: taskDataById.data.taskName || "",
        taskDescription: taskDataById.data.taskDescription || "",
        taskDeadline: taskDataById.data.taskDeadline
          ? new Date(taskDataById.data.taskDeadline)
          : null,
        taskStatusId: taskDataById.data.taskStatusId || "",
        taskTypeId: taskDataById.data.taskTypeId || "",
        assignUsers: taskDataById.data.assignUsers
          ? taskDataById.data.assignUsers.map((u) => u.employeeId)
          : [],
      });
    }
  }, [editingTaskId, taskDataById, reset]);

  const onSubmitTask = handleSubmit(async (data) => {
    const assigneeIds = data.assignUsers;
    const payload = {
      taskId: editingTaskId || undefined,
      taskName: data.taskName,
      taskDescription: data.taskDescription,
      taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
      taskStatusId: data?.taskStatusId,
      employeeIds: assigneeIds,
      projectId: activeProjectId,
      meetingId: data.meetingId,
      taskTypeId: data.taskTypeId,
    };

    addUpdateTask(payload, {
      onSuccess: () => {
        queryClient.resetQueries({
          queryKey: ["get-project-by-id", activeProjectId],
        });
        queryClient.resetQueries({
          queryKey: ["get-company-sub-projects", activeProjectId],
        });
        setIsAddTaskOpen(false);
        setEditingTaskId(null);
        reset();
      },
    });
  });

  return (
    <div
      className={`bg-white border rounded-2xl shadow-md flex flex-col ${className || "h-[calc(100vh-120px)]"}`}
    >
      {/* Task List (scroll container includes header so it stays sticky) */}
      <div className="flex-1 overflow-auto px-5 pb-2">
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 -mx-5 px-5 mt-4">
          <div className="flex justify-between items-center w-full gap-4">
            <SearchInput
              placeholder="Search..."
              searchValue={taskSearch}
              setPaginationFilter={setTaskSearch}
              className="w-80 h-9"
            />
            {taskPermission.Add && (
              <Button
                className="py-2 w-fit h-9"
                onClick={() => {
                  setEditingTaskId(null);
                  setIsAddTaskOpen(true);
                  reset(defaultValue);
                }}
              >
                Add Task
              </Button>
            )}
          </div>

          {/* Add Task Form */}
          {isAddTaskOpen && (
            <TaskForm
              key="add-task-form"
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
              onSubmitTask={onSubmitTask}
              reset={reset}
              defaultValue={defaultValue}
              setIsAddTaskOpen={setIsAddTaskOpen}
              setEditingTaskId={setEditingTaskId}
              editingTaskId={editingTaskId}
              meetingDataOption={meetingDataOption}
              taskTypeOptions={taskTypeOptions}
              taskStatusOptions={taskStatusOptions}
              employeeOption={employeeOption}
              handleMeetingSearch={setIsMeetingSearch}
              handleTypeSearch={setIsTypeSearch}
              handleStatusSearch={setIsStatusSearch}
            />
          )}
        </div>

        <div className="mt-4">
          <TableData
            tableData={taskTableData}
            columns={{
              taskName: "Task Name",
              taskDescription: "Task Description",
              taskDeadline: "Task Deadline",
              assigneeNames: "Assignees",
            }}
            primaryKey="taskId"
            onEdit={
              taskPermission.Edit
                ? (row) => {
                    setIsAddTaskOpen(false);
                    setEditingTaskId(row.taskId as string);
                  }
                : undefined
            }
            onViewButton={(row) => {
              navigate(`/dashboard/tasks/view/${row.taskId}`);
            }}
            viewButton={true}
            isActionButton={() => true}
            moduleKey="TASK"
            onRowClick={(row) => {
              if (taskPermission.View) {
                navigate(`/dashboard/tasks/view/${row.taskId}`);
              }
            }}
            sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
            actionColumnWidth="w-[100px]"
            extraColumns={[
              {
                label: "Status",
                width: "w-[140px]",
                render: (row) => (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
                    style={{
                      backgroundColor: (row.color as string) || "#e5e7eb",
                    }}
                  >
                    {row.taskStatus as string}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {editingTaskId && (
          <TaskForm
            key={`edit-${editingTaskId}`}
            control={control}
            errors={errors}
            register={register}
            setValue={setValue}
            onSubmitTask={onSubmitTask}
            reset={reset}
            defaultValue={defaultValue}
            setIsAddTaskOpen={setIsAddTaskOpen}
            setEditingTaskId={setEditingTaskId}
            editingTaskId={editingTaskId}
            meetingDataOption={meetingDataOption}
            taskTypeOptions={taskTypeOptions}
            taskStatusOptions={taskStatusOptions}
            employeeOption={employeeOption}
            handleMeetingSearch={setIsMeetingSearch}
            handleTypeSearch={setIsTypeSearch}
            handleStatusSearch={setIsStatusSearch}
          />
        )}
      </div>
    </div>
  );
}

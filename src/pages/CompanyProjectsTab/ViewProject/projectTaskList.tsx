import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "@/components/shared/SearchInput";
import Pagination from "@/components/shared/Pagination/Pagination";

import { TaskForm } from "./taskForm";

import {
  addUpdateCompanyTaskMutation,
  useDdTaskType,
  useGetAllTaskStatus,
  useGetCompanyTask,
  useGetCompanyTaskById,
} from "@/features/api/companyTask";
import { getInitials } from "@/features/utils/app.utils";
import { queryClient } from "@/queryClient";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useGetCompanyMeeting } from "@/features/api/companyMeeting";

export default function ProjectTaskList() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const taskPermission = useSelector(getUserPermission).TASK;
  const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { data: taskDataById } = useGetCompanyTaskById(editingTaskId || "");
  const [isMeetingSearch, setIsMeetingSearch] = useState("");
  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const defaultValue = {
    meetingId: "",
    taskName: "",
    taskDescription: "",
    taskDeadline: null,
    taskStatusId: "",
    taskTypeId: "",
    assignUsers: [],
  };

  const { data: tasks } = useGetCompanyTask({
    filter: {
      ...paginationFilter,
      projectId: projectId,
    },
  });

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

  const { data: meetingData } = useGetCompanyMeeting({
    filter: {
      search: isMeetingSearch,
      pageSize: 25,
    },
  });

  const employeeOption = employeedata
    ? employeedata.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];

  const meetingDataOption = (meetingData?.data ?? []).map((item) => ({
    label: item.meetingName ?? "",
    value: item.meetingId ?? "",
  }));

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
      projectId: projectId,
      meetingId: data.meetingId,
      taskTypeId: data.taskTypeId,
    };

    addUpdateTask(payload, {
      onSuccess: () => {
        queryClient.resetQueries({
          queryKey: ["get-project-by-id", projectId],
        });
        setIsAddTaskOpen(false);
        setEditingTaskId(null);
        reset();
      },
    });
  });

  return (
    <div className="bg-white p-1 border h-[calc(100vh-120px)] rounded-2xl shadow-md flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-20 px-5 pt-2">
        <div className="flex justify-between w-full">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <div className="flex gap-2 flex-row">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80 h-9"
            />
            {taskPermission.Add && (
              <Button
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
        </div>
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
          setMeetingSearch={setIsMeetingSearch}
          setTypeSearch={setIsTypeSearch}
          setStatusSearch={setIsStatusSearch}
        />
      )}

      {/* Task List */}
      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-4">
          {tasks?.data?.length ? (
            tasks.data.map((task) => (
              <div key={task.taskId}>
                <div
                  onClick={() =>
                    taskPermission.View &&
                    navigate(`/dashboard/tasks/view/${task.taskId}`)
                  }
                  className="p-2 rounded-xl border hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="px-1 text-lg font-semibold">
                      {task.taskName}
                    </h3>
                    <div className="flex flex-row gap-1 items-center">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: task.color || "#e5e7eb",
                        }}
                      >
                        {task.taskStatus}
                      </span>
                      {taskPermission.Edit && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddTaskOpen(false);
                            setEditingTaskId(
                              editingTaskId === task.taskId
                                ? null
                                : task.taskId,
                            );
                          }}
                        >
                          <Edit className="w-4 h-4 text-primary cursor-pointer" />
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm px-1 text-muted-foreground mb-1">
                    {task.taskDescription || "-"}
                  </p>

                  <div className="flex px-1 flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Deadline:</span>
                      <span>
                        {task.taskDeadline
                          ? format(
                              new Date(task.taskDeadline),
                              "dd/MM/yyyy h:mm a",
                            )
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Assignees:</span>
                      <div className="flex gap-1 flex-wrap">
                        {task.TaskEmployeeJunction &&
                          task.TaskEmployeeJunction.map((a) => (
                            <TooltipProvider key={a.employeeId}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-7 w-7 rounded-full bg-gray-200 text-xs flex items-center justify-center font-medium cursor-default">
                                    {getInitials(a.Employee.employeeName)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {a.Employee.employeeName}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {editingTaskId === task.taskId && (
                  <TaskForm
                    key={`edit-${task.taskId}`}
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
                    setMeetingSearch={setIsMeetingSearch}
                    setTypeSearch={setIsTypeSearch}
                    setStatusSearch={setIsStatusSearch}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No Tasks Found</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {tasks && tasks.data?.length > 0 && (
        <div className="sticky bottom-0 bg-white z-10 py-1">
          <Pagination
            paginationDetails={tasks as PaginationFilter}
            setPaginationFilter={setPaginationFilter}
          />
        </div>
      )}
    </div>
  );
}

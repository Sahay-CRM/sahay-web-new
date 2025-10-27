import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import SearchInput from "@/components/shared/SearchInput";
import Pagination from "@/components/shared/Pagination/Pagination";

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
  const defaultvalue = {
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
    filter: {
      search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
    },
    enable: isTypeSearch.length >= 3,
  });
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
      pageSize: 25,
    },
    enable: isStatusSearch.length >= 3,
  });
  const { data: employeedata } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });

  const employeeOption = employeedata
    ? employeedata.data.map((status) => ({
        label: status.employeeName,
        value: status.employeeId,
      }))
    : [];

  const { data: meetingData } = useGetCompanyMeeting({
    filter: {
      search: isMeetingSearch,
      pageSize: 25,
    },
  });

  const meetingDataOption = (meetingData?.data ?? []).map((item) => ({
    label: item.meetingName ?? "",
    value: item.meetingId ?? "",
  }));
  const taskStatusOptions = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
      }))
    : [];

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "",
      }))
    : [];

  useEffect(() => {
    if (taskDataById?.data) {
      reset({
        taskId: taskDataById.data.taskId || "",
        project: taskDataById.data?.projectId || "",
        meetingId: taskDataById.data?.meetingId || "",
        taskName: taskDataById.data.taskName || "",
        taskDescription: taskDataById.data.taskDescription || "",
        taskStartDate: taskDataById.data.taskStartDate
          ? new Date(taskDataById.data.taskStartDate)
          : null,
        taskDeadline: taskDataById.data.taskDeadline
          ? new Date(taskDataById.data.taskDeadline)
          : null,
        taskStatusId: taskDataById.data.taskStatusId || "",
        taskTypeId: taskDataById.data.taskTypeId || "",
        assignUsers: taskDataById.data.assignUsers
          ? taskDataById.data.assignUsers.map((user) => user.employeeId)
          : [],
      });
    }
  }, [taskDataById, reset]);

  const onSubmitTask = handleSubmit(async (data) => {
    const assigneeIds = data.assignUsers;

    const payload = {
      taskId: editingTaskId || undefined, // if editing, include taskId
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

  // 🔹 Reusable Task Form Component
  const TaskForm = () => (
    <div className="p-5 border-b mt-2">
      <form onSubmit={onSubmitTask} className="border rounded-md p-4 mb-2 pb-2">
        <div className="grid grid-cols-2 space-y-1.5 gap-2 last-of-type:space-y-0">
          <div>
            <Controller
              control={control}
              name="meetingId"
              rules={{ required: "Please select Meeting" }}
              render={({ field }) => (
                <SearchDropdown
                  options={meetingDataOption}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("meetingId", value.value);
                  }}
                  placeholder="Select Meeting..."
                  label="Meeting"
                  error={errors.meetingId}
                  isMandatory
                  onSearchChange={setIsMeetingSearch}
                  labelClass="mb-2"
                />
              )}
            />
          </div>

          <div>
            <FormInputField
              label="Task Name"
              className="p-4 px-3 mt-0"
              {...register("taskName", {
                required: "Task Name is required",
              })}
              error={errors.taskName}
              placeholder="Enter Task Name"
            />
          </div>

          <div>
            <Controller
              control={control}
              name="taskDeadline"
              rules={{ required: "Task Deadline is required" }}
              render={({ field }) => (
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                />
              )}
            />
          </div>

          <div>
            <Controller
              control={control}
              name="taskTypeId"
              rules={{ required: "Please select Task Type" }}
              render={({ field }) => (
                <SearchDropdown
                  options={taskTypeOptions}
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
                  labelClass="mb-2 mt-1.5"
                />
              )}
            />
          </div>

          <div>
            <Controller
              control={control}
              name="taskStatusId"
              rules={{ required: "Please select Task Status" }}
              render={({ field }) => (
                <SearchDropdown
                  options={taskStatusOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("taskStatusId", value.value);
                  }}
                  placeholder="Select Task Status..."
                  label="Task Status"
                  error={errors.taskStatusId}
                  isMandatory
                  onSearchChange={setIsStatusSearch}
                  labelClass="mb-2 mt-1.5"
                />
              )}
            />
          </div>

          <div>
            <Controller
              control={control}
              name="assignUsers"
              rules={{ required: "Select User is Required" }}
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.assignUsers}
                  isMulti={true}
                  placeholder="Select employees"
                  isMandatory
                  labelClass="mb-2"
                />
              )}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded-md p-2 text-base h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("taskDescription", {
                required: "Please Enter Task Description",
              })}
            />
            {errors.taskDescription && (
              <span className="text-red-600 text-sm">
                {errors.taskDescription?.message as string}
              </span>
            )}
          </div>

          <div className="w-full h-full gap-1 flex justify-end items-end">
            <Button
              type="button"
              className="mb-4"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddTaskOpen(false);
                setEditingTaskId(null); // also close inline edit form
                reset(); // clear form values
              }}
            >
              Cancel
            </Button>

            <Button type="submit" className="mb-4">
              {editingTaskId ? "Update Task" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="bg-white p-1 border h-[calc(100vh-120px)] rounded-2xl shadow-md flex flex-col">
      {/* Sticky Header */}
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
                  setEditingTaskId(null); // not editing
                  setIsAddTaskOpen(true); // force open form
                  reset(defaultvalue);
                }}
              >
                Add Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {isAddTaskOpen && <TaskForm />}

      {/* Scrollable Task List */}
      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-4">
          {tasks?.data.length ? (
            tasks.data.map((task) => (
              <div key={task.taskId}>
                <div
                  onClick={() =>
                    taskPermission.View &&
                    navigate(`/dashboard/tasks/view/${task.taskId}`)
                  }
                  className="p-2 rounded-xl border hover:shadow-md transition cursor-pointer"
                >
                  {/* Task Header */}
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

                  {/* Task Description */}
                  <p className="text-sm px-1 text-muted-foreground mb-1">
                    {task.taskDescription || "-"}
                  </p>

                  {/* Task Info */}
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

                {/* Inline Edit Form */}
                {editingTaskId === task.taskId && <TaskForm />}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No Tasks Found</p>
          )}
        </div>
      </div>

      {/* Sticky Pagination */}
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

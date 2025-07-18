import { useCallback, useState } from "react";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetAllTaskStatus,
  useGetCompanyTask,
} from "@/features/api/companyTask";

import TaskSearchDropdown from "./TaskSearchDropdown";
import {
  addMeetingTaskDataMutation,
  deleteMeetingTaskMutation,
  useGetMeetingTask,
} from "@/features/api/companyMeeting";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { queryClient } from "@/queryClient";

interface TasksProps {
  meetingId: string;
  tasksFireBase: () => void;
}

export default function Tasks({ meetingId, tasksFireBase }: TasksProps) {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });
  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();

  const { mutate: addMeetingTask } = addMeetingTaskDataMutation();
  const { mutate: deleteTaskById } = deleteMeetingTaskMutation();

  const { data: meetTask } = useGetMeetingTask({
    filter: {
      meetingId: meetingId,
    },
  });

  const stopTaskApi = meetTask?.map((item) => item.taskId) ?? [];

  const { data: selectedTask } = useGetCompanyTask({
    filter: {
      ...paginationFilter,
      taskIds: stopTaskApi,
    },
    enable: Array.isArray(stopTaskApi) && stopTaskApi.length > 0,
  });

  const handleAddTasks = (tasks: TaskGetPaging[]) => {
    const payload = {
      meetingId: meetingId,
      taskIds: tasks.map((item) => item.taskId),
    };
    addMeetingTask(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
        tasksFireBase();
        // setSelectedTask(tasks);
      },
    });
  };

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "taskName", label: "Task Name", visible: true },
    {
      key: "taskDescription",
      label: "Task Description",
      visible: true,
    },
    { key: "taskDeadline", label: "Task Deadline", visible: true },
    { key: "assigneeNames", label: "Assignees", visible: true },
    { key: "taskStatus", label: "Status", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const canToggleColumns = columnToggleOptions.length > 3;

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const handleStatusChange = (data: string, row: TaskGetPaging) => {
    const payload = {
      taskStatusId: data,
      taskId: row?.taskId,
    };
    updateCompanyTask(payload);
  };

  const conformDelete = useCallback(
    async (data: TaskGetPaging) => {
      if (data && data.taskId) {
        const payload = {
          taskId: data.taskId,
          meetingId: meetingId,
        };
        deleteTaskById(payload, {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
            tasksFireBase();
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
      }
    },
    [deleteTaskById, meetingId, tasksFireBase],
  );

  return (
    <div>
      <div className="flex gap-5 justify-between mb-5">
        <div>
          <TaskSearchDropdown
            onAdd={handleAddTasks}
            minSearchLength={2}
            filterProps={{ pageSize: 20 }}
          />
        </div>
        <div>
          {canToggleColumns && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownSearchMenu
                      columns={columnToggleOptions}
                      onToggleColumn={onToggleColumn}
                      columnIcon={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-white">Toggle Visible Columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <TableData
        tableData={(selectedTask?.data ?? []).map((task) => ({
          ...task,
          status: task.taskStatusId,
        }))}
        columns={visibleColumns}
        primaryKey="taskId"
        // onEdit={navigate(`/dashboard/tasks/edit/${row.taskId}`)}
        // onViewButton={(row) => {
        //   navigate(`/dashboard/tasks/view/${row.taskId}`);
        // }}
        showIndexColumn={false}
        isActionButton={() => true}
        isEditDelete={true}
        // viewButton={true}
        permissionKey="users"
        paginationDetails={mapPaginationDetails(selectedTask)}
        setPaginationFilter={setPaginationFilter}
        onDelete={(row) => {
          conformDelete(row as unknown as TaskGetPaging);
        }}
        isEditDeleteShow={true}
        dropdownColumns={{
          taskStatus: {
            options: (taskStatus?.data ?? []).map((opt) => ({
              label: opt.taskStatus,
              value: opt.taskStatusId,
              color: opt.color || "#2e3195",
            })),
            onChange: (row, value) => handleStatusChange(value, row),
          },
        }}
        // onRowClick={(row) => {
        //   handleRowsModalOpen(row);
        // }}

        sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
      />
    </div>
  );
}

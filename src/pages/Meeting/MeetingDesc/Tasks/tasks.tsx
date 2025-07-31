import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllTaskStatus } from "@/features/api/companyTask";

import TaskSearchDropdown from "./TaskSearchDropdown";
import {
  addMeetingTaskDataMutation,
  deleteMeetingTaskMutation,
  useGetMeetingTask,
} from "@/features/api/companyMeeting";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { queryClient } from "@/queryClient";
import TaskDrawer from "./taskDrawer";
import { Button } from "@/components/ui/button";

interface TasksProps {
  tasksFireBase: () => void;
  meetingAgendaIssueId?: string | undefined;
  detailMeetingId: string | undefined;
}

export default function Tasks({
  tasksFireBase,
  meetingAgendaIssueId,
  detailMeetingId,
}: TasksProps) {
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });
  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();

  const { mutate: addMeetingTask } = addMeetingTaskDataMutation();
  const { mutate: deleteTaskById } = deleteMeetingTaskMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<TaskGetPaging | null>(null);

  const { data: selectedTask } = useGetMeetingTask({
    filter: {
      detailMeetingId: detailMeetingId,
      detailMeetingAgendaIssueId: meetingAgendaIssueId,
    },
    enable: !!detailMeetingId && !!meetingAgendaIssueId,
  });

  const handleAddTasks = (tasks: TaskGetPaging[]) => {
    if (meetingAgendaIssueId && detailMeetingId) {
      const payload = {
        detailMeetingId: detailMeetingId,
        taskIds: tasks.map((item) => item.taskId),
        detailMeetingAgendaIssueId: meetingAgendaIssueId,
      };
      addMeetingTask(payload, {
        onSuccess: () => {
          queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
          tasksFireBase();
          // setSelectedTask(tasks);
        },
      });
    }
  };

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "taskName", label: "Task Name", visible: true },
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
    updateCompanyTask(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
        tasksFireBase();
      },
    });
  };

  const conformDelete = useCallback(
    async (data: TaskGetPaging) => {
      if (data && data.detailMeetingTaskId) {
        // const payload = {
        //   taskId: data.taskId,
        //   meetingId: meetingId,
        // };
        deleteTaskById(data.detailMeetingTaskId, {
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
    [deleteTaskById, tasksFireBase],
  );

  const handleAddTask = () => {
    setDrawerOpen(true);
    setSelected(null);
  };

  return (
    <div className=" h-full">
      <div className="flex gap-5 justify-between mb-5">
        <div className="flex gap-5 items-center">
          <TaskSearchDropdown
            onAdd={handleAddTasks}
            minSearchLength={2}
            filterProps={{ pageSize: 20 }}
          />
          <Button className="py-2 w-fit" onClick={handleAddTask}>
            Add Company Task
          </Button>
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
        tableData={(selectedTask ?? []).map((task) => ({
          ...task,
          status: task.taskStatusId,
          assigneeNames: task.assignUsers
            ? task.assignUsers
                .map((j) => j.employeeName)
                .filter(Boolean)
                .join(", ")
            : "",
          taskDeadline: task.taskDeadline
            ? new Date(task.taskDeadline).toISOString().split("T")[0]
            : "",
        }))}
        columns={visibleColumns}
        primaryKey="taskId"
        // onEdit={navigate(`/dashboard/tasks/edit/${row.taskId}`)}
        // onViewButton={(row) => {
        //   navigate(`/dashboard/tasks/view/${row.taskId}`);
        // }}
        onRowClick={(row) => {
          if (row) {
            setSelected(row);
            setDrawerOpen(true);
          }
        }}
        showIndexColumn={false}
        isActionButton={() => true}
        isEditDelete={() => true}
        // viewButton={true}
        permissionKey="users"
        onDelete={(row) => {
          conformDelete(row as unknown as TaskGetPaging);
        }}
        showActionsColumn={true}
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
      {drawerOpen && (
        <TaskDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          taskData={selected}
          detailMeetingAgendaIssueId={meetingAgendaIssueId}
          detailMeetingId={detailMeetingId}
        />
      )}
    </div>
  );
}

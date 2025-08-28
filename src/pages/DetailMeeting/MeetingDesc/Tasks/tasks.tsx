import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { getDatabase, off, onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";

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

import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { queryClient } from "@/queryClient";
import TaskDrawer from "./taskDrawer";
import { Button } from "@/components/ui/button";
import {
  addMeetingTaskDataMutation,
  deleteMeetingTaskMutation,
  useGetMeetingTask,
} from "@/features/api/detailMeeting";
import { Unlink } from "lucide-react";

interface TasksProps {
  tasksFireBase: () => void;
  issueId?: string | undefined;
  ioType?: string;
  selectedIssueId?: string;
}

export default function Tasks({
  tasksFireBase,
  issueId,
  ioType,
  selectedIssueId,
}: TasksProps) {
  const { id: meetingId } = useParams();
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
      meetingId: meetingId,
      ...(ioType === "ISSUE" ? { issueId: issueId } : { objectiveId: issueId }),
      ioType: ioType,
    },
    enable: !!meetingId && !!issueId && !!ioType,
  });

  const handleAddTasks = (tasks: TaskGetPaging) => {
    if (issueId && meetingId) {
      const payload = {
        meetingId: meetingId,
        taskId: tasks.taskId,
        ...(ioType === "ISSUE"
          ? { issueId: issueId }
          : { objectiveId: issueId }),
        ioType: ioType,
      };
      addMeetingTask(payload, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-detailMeetingAgendaIssue"],
          });
          tasksFireBase();
        },
      });
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${selectedIssueId}/tasks`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] });
        // queryClient.resetQueries({
        //   queryKey: ["get-detail-meeting-agenda-issue-obj"],
        // });
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [selectedIssueId, meetingId]);

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
      if (data && ioType) {
        const payload = {
          taskId: data.taskId,
          ioType: ioType,
          ...(ioType === "ISSUE"
            ? {
                issueTaskId: data.issueTaskId,
              }
            : {
                objectiveTaskId: data.objectiveTaskId,
              }),
        };
        deleteTaskById(payload, {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-detailMeetingAgendaIssue"],
            });
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
    [deleteTaskById, ioType, tasksFireBase],
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
        // viewButton={true}
        permissionKey="users"
        onDelete={(row) => {
          conformDelete(row as unknown as TaskGetPaging);
        }}
        customActions={(row) => {
          return (
            <>
              <Button
                className="py-1 px-3 bg-transparent cursor-pointer hover:bg-transparent"
                onClick={() => {
                  conformDelete(row as unknown as TaskGetPaging);
                }}
              >
                <Unlink className="w-4 h-4 text-red-700" />
              </Button>
            </>
          );
        }}
        // showActionsColumn={false}
        isEditDeleteShow={false}
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
        actionColumnWidth="w-22"
        sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
      />
      {drawerOpen && (
        <TaskDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          taskData={selected}
          issueId={issueId}
          tasksFireBase={tasksFireBase}
          ioType={ioType}
        />
      )}
    </div>
  );
}

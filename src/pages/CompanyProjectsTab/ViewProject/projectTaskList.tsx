import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/shared/SearchInput";
import TableData from "@/components/shared/DataTable/DataTable";

import ProjectTaskDrawer from "./projectTaskDrawer";

import { useAllCompanyTask } from "@/features/api/companyTask";
import { formatToLocalDateTime } from "@/features/utils/app.utils";
import { queryClient } from "@/queryClient";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function ProjectTaskList({
  activeProjectId,
  className,
  statusFilter = "all",
}: {
  activeProjectId: string;
  className?: string;
  statusFilter?: "all" | "pending" | "completed";
}) {
  const navigate = useNavigate();
  const taskPermission = useSelector(getUserPermission).TASK;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskGetPaging | null>(null);
  const [taskSearch, setTaskSearch] = useState("");

  const { data: tasks } = useAllCompanyTask({
    filter: {
      projectId: activeProjectId,
    },
  });

  const taskTableData = (tasks?.data ?? [])
    .filter((task) => {
      if (statusFilter === "pending") {
        return task.taskStatus?.toLowerCase() !== "completed";
      }
      if (statusFilter === "completed") {
        return task.taskStatus?.toLowerCase() === "completed";
      }
      return true;
    })
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
      rawTaskDeadline: item.taskDeadline,
      taskDeadline: item.taskDeadline
        ? formatToLocalDateTime(item.taskDeadline)
        : "",
      assigneeNames: item.TaskEmployeeJunction
        ? item.TaskEmployeeJunction.map((j) => j.Employee?.employeeName)
            .filter(Boolean)
            .join(", ")
        : "",
    }));

  return (
    <div
      className={`bg-white border rounded-2xl shadow-md flex flex-col ${className || "h-[calc(100vh-120px)]"}`}
    >
      {/* Task List (scroll container includes header so it stays sticky) */}
      <div className="flex-1 overflow-auto px-5 pb-2">
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 -mx-5 px-5 mt-4">
          <div className="flex justify-between items-center w-full gap-4 pb-4">
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
                  setSelectedTaskForEdit(null);
                  setIsDrawerOpen(true);
                }}
              >
                Add Task
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2">
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
                    setSelectedTaskForEdit(row);
                    setIsDrawerOpen(true);
                  }
                : undefined
            }
            onViewButton={(row) => {
              navigate(`/dashboard/tasks/view/${row.taskId}`);
            }}
            viewButton={true}
            isActionButton={() => true}
            canDelete={() => false}
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
      </div>

      {isDrawerOpen && (
        <ProjectTaskDrawer
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedTaskForEdit(null);
          }}
          taskData={selectedTaskForEdit}
          projectId={activeProjectId}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["get-all-task-dropdown", { projectId: activeProjectId }],
            });
            queryClient.resetQueries({
              queryKey: ["get-project-by-id", activeProjectId],
            });
            queryClient.resetQueries({
              queryKey: ["get-company-sub-projects", activeProjectId],
            });
          }}
        />
      )}
    </div>
  );
}

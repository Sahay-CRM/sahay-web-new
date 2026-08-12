import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "@/components/shared/SearchInput";
import TableData from "@/components/shared/DataTable/DataTable";

import ProjectTaskDrawer from "./projectTaskDrawer";

import { useAllCompanyTask } from "@/features/api/companyTask";
import {
  useGetCompanyProjectById,
  useGetAllProjectStatus,
} from "@/features/api/companyProject";
import { formatToLocalDateTime, getInitials } from "@/features/utils/app.utils";
import { queryClient } from "@/queryClient";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { isColorDark } from "@/features/utils/color.utils";

export default function ProjectTaskList({
  activeProjectId,
  className,
  statusFilter = "all",
  hideAddButton = false,
}: {
  activeProjectId: string;
  className?: string;
  statusFilter?: "all" | "pending" | "completed";
  hideAddButton?: boolean;
}) {
  const navigate = useNavigate();
  const taskPermission = useSelector(getUserPermission).TASK;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskGetPaging | null>(null);
  const [taskSearch, setTaskSearch] = useState({ search: "" });

  const { data: tasks } = useAllCompanyTask({
    filter: {
      projectId: activeProjectId,
    },
  });

  const { data: projectData } = useGetCompanyProjectById(activeProjectId);
  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {},
    enable: true,
  });

  const isProjectClosed = useMemo(() => {
    const projectStatusId = projectData?.data?.projectStatusId;
    if (!projectStatusId || !projectStatusList?.data) return false;

    const currentStatus = projectStatusList.data.find(
      (status) => status.projectStatusId === projectStatusId
    );

    return (
      currentStatus?.winLostProject === 1 || currentStatus?.winLostProject === 0
    );
  }, [projectData?.data?.projectStatusId, projectStatusList?.data]);

  const taskTableData = (tasks?.data ?? [])
    .filter((task) => {
      if (statusFilter === "pending") {
        const status = task.taskStatus?.toLowerCase() || "";
        return status !== "completed" && status !== "cancelled" && status !== "cancel";
      }
      if (statusFilter === "completed") {
        return task.taskStatus?.toLowerCase() === "completed";
      }
      return true;
    })
    .filter((task) => {
      if (!taskSearch.search) return true;
      const search = taskSearch.search.toLowerCase();
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
      className={`bg-white border rounded-2xl shadow-md flex flex-col ${className || "h-auto"}`}
    >
      {/* Task List (scroll container includes header so it stays sticky) */}
      <div className="px-5 pb-2">
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 -mx-5 px-5 mt-4">
          <div className="flex justify-between items-center w-full gap-4 pb-4">
            <SearchInput
              placeholder="Search..."
              searchValue={taskSearch.search}
              setPaginationFilter={setTaskSearch}
              className="w-80 h-9"
            />
            {taskPermission.Add && !hideAddButton && !isProjectClosed && (
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
              taskName: {
                label: "Task Name",
                width: "w-[45%]",
                render: (_, item) => {
                  const row = item as TaskGetPaging;
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="break-words whitespace-normal cursor-pointer">
                            {row.taskName}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-2 bg-slate-900 border border-slate-800 text-white rounded-md shadow-md">
                          <p className="text-[11px] text-white break-words whitespace-pre-wrap">
                            {row.taskDescription || "No description"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                },
              },
              // taskDescription: "Task Description",
              taskDeadline: {
                label: "Task Deadline",
                width: "w-[35%]",
              },
              assigneeNames: {
                label: "Assignees",
                width: "w-[20%]",
                render: (_, item) => {
                  const row = item as TaskGetPaging;
                  const assignees = row.TaskEmployeeJunction || [];
                  if (assignees.length === 0) {
                    return <span className="text-xs text-slate-400">Unassigned</span>;
                  }
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex -space-x-2 overflow-hidden cursor-pointer">
                            {assignees.slice(0, 3).map((junction, idx) => {
                              const name = junction.Employee?.employeeName || "";
                              if (!name) return null;
                              return (
                                <div
                                  key={idx}
                                  className="rounded-full h-6 w-6 bg-slate-100 text-sm flex items-center justify-center  text-black border border-slate-200/50 ring-2 ring-white hover:bg-slate-200 hover:z-10 transition-all"
                                >
                                  {getInitials(name)}
                                </div>
                              );
                            })}
                            {assignees.length > 3 && (
                              <div className="rounded-full h-6 w-6 bg-slate-200 text-[10px] flex items-center justify-center  text-black border border-slate-350 ring-2 ring-white hover:bg-slate-300 hover:z-10 transition-all">
                                +{assignees.length - 3}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px] p-2.5 bg-slate-900 border border-slate-800 text-white rounded-md shadow-md">
                          <div className="space-y-1">
                            <ul className="text-[10px] text-white list-disc list-inside space-y-0.5">
                              {assignees.map((junction, idx) => {
                                const name = junction.Employee?.employeeName || "";
                                if (!name) return null;
                                return <li key={idx}>{name}</li>;
                              })}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                },
              },
            }}
            primaryKey="taskId"
            onEdit={
              taskPermission.Edit && !isProjectClosed
                ? (row) => {
                    setSelectedTaskForEdit(row);
                    setIsDrawerOpen(true);
                  }
                : undefined
            }
            viewButton={false}
            isActionButton={() => !isProjectClosed}
            canDelete={() => false}
            moduleKey="TASK"
            onRowClick={(row) => {
              if (taskPermission.View) {
                navigate(`/dashboard/tasks/view/${row.taskId}`);
              }
            }}
            sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
            actionColumnWidth="w-[70px]"
            extraColumns={[
              {
                label: "Status",
                width: "w-[80px]",
                render: (row) => {
                  const getStatusInitial = (status: string) => {
                    const s = status?.toLowerCase() || "";
                    if (s.includes("progress")) return "P";
                    if (s.includes("yet")) return "Y";
                    if (s.includes("complete")) return "C";
                    if (s.includes("delay")) return "D";
                    return s.charAt(0).toUpperCase();
                  };
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`rounded-full h-6 w-6 flex items-center justify-center text-[10px] font-bold border border-slate-350 shadow-sm cursor-default select-none ${
                              row.color && isColorDark(row.color as string)
                                ? "text-white"
                                : "text-slate-800"
                            }`}
                            style={{
                              backgroundColor: (row.color as string) || "#e5e7eb",
                            }}
                          >
                            {getStatusInitial(row.taskStatus as string)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {row.taskStatus as string}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                },
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

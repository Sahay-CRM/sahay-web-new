import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useZoom } from "@/features/context/ZoomContext";
import { isColorDark } from "@/features/utils/color.utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Eye, Trash2 } from "lucide-react";
import { getInitials } from "@/features/utils/app.utils";
import { format } from "date-fns";
import { useState } from "react";
import ViewMeetingModal from "../ViewMeetingModal";
import ConfirmationDeleteModal from "../ConfirmTaskDeleteModal";
import { deleteCompanyTaskMutation } from "@/features/api/companyTask";
import { toast } from "sonner";
import { AxiosError } from "axios";
interface TaskCardProps {
  task: TaskGetPaging;
  refetch: () => void;
}

export default function TaskCard({ task, refetch }: TaskCardProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const { mutate: deleteTaskById } = deleteCompanyTaskMutation();

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setIsChildData(undefined);
  };

  const handleDeleteSubmit = () => {
    if (task.taskId) {
      deleteTaskById(task.taskId, {
        onSuccess: () => {
          toast.success("Task deleted successfully");
          closeDeleteModal();
          refetch();
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{
            message?: string;
            status: number;
          }>;
          if (axiosError.response?.data?.status === 417) {
            setIsChildData(axiosError.response?.data?.message);
          } else {
            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          }
        },
      });
    }
  };
  const { zoom } = useZoom();
  const scale = zoom / 100;
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.taskId,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 bg-white p-4 rounded-xl border-2 border-primary border-dashed min-h-[140px] cursor-grabbing"
      />
    );
  }
  // const fullDeadline = task.taskDeadline
  //   ? format(new Date(task.taskDeadline), "dd-MM-yyyy")
  //   : "No Date";

  const assigneeList =
    task.TaskEmployeeJunction?.map(
      (j: TaskEmployee) => j.Employee?.employeeName,
    ).filter(Boolean) || [];

  const assigneesString = assigneeList.join(", ") || "Unassigned";

  const statusColor = task.color || "#2e3195";

  const formattedTaskForModal = {
    ...task,
    taskDeadline: task.taskDeadline
      ? format(new Date(task.taskDeadline), "dd/MM/yyyy hh:mm a")
      : "",
    assigneeNames: assigneesString,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-grab active:cursor-grabbing relative group"
    >
      <div className="flex flex-col gap-0.5 mb-1">
        <div className="flex flex-row justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-bold text-gray-800 leading-tight truncate cursor-help">
                  {task.taskName}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{task.taskName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsViewModalOpen(true);
              }}
              className="p-1.5 bg-gray-50 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer group/edit"
            >
              <Eye className="w-4 h-4 text-primary group-hover/edit:scale-110 transition-transform" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer group/delete"
            >
              <Trash2 className="w-4 h-4 text-red-500 group-hover/delete:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        <div
          className="mb-1 text-sm text-gray-600 flex flex-col gap-1"
          style={{ fontSize: `${13 * scale}px` }}
        >
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 w-full">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-semibold">Assignees :</span>
              <div className="flex flex-shrink-0">
                {assigneeList.slice(0, 4).map((name, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div
                        className="rounded-full bg-white border-2 border-white ring-1 ring-gray-100 text-xs flex items-center justify-center font-bold text-primary shadow-sm cursor-help hover:z-10 transition-transform hover:-translate-y-0.5"
                        style={{
                          width: 24 * scale,
                          height: 24 * scale,
                          fontSize: `${12 * scale}px`,
                        }}
                      >
                        {getInitials(name)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{name}</TooltipContent>
                  </Tooltip>
                ))}

                {assigneeList.length > 4 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="rounded-full bg-gray-100 text-xs flex items-center justify-center font-medium"
                        style={{
                          width: 24 * scale,
                          height: 24 * scale,
                          fontSize: `${12 * scale}px`,
                        }}
                      >
                        +{assigneeList.length - 4}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex w-35 flex-col gap-1 max-h-[400px] overflow-y-auto py-1">
                        <p className="font-bold border-b border-white/20 pb-1 mb-1">
                          All Assignees
                        </p>
                        {assigneeList.map((name, idx) => (
                          <div key={idx} className="whitespace-nowrap">
                            {name}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap"
              style={{ fontSize: `${13 * scale}px` }}
            >
              <span className="font-semibold">By :</span>
              <TableTooltip text={`${task.createdBy || ""}`} />
            </div>
          </div>
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-600"
            style={{ fontSize: `${13 * scale}px` }}
          >
            <span className="font-semibold whitespace-nowrap">Deadline :</span>
            <TableTooltip
              text={`${task.taskDeadline ? format(new Date(task.taskDeadline), "dd/MM/yyyy hh:mm a") : ""}`}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between right-0 border-t pt-0.5 ">
        <div
          className="flex  mt-1  items-center gap-2 text-sm text-gray-600"
          style={{ fontSize: `${13 * scale}px` }}
        >
          <Clock
            className="text-gray-400"
            style={{ width: 16 * scale, height: 16 * scale }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <div style={{ fontSize: `${12 * scale}px` }}>
                {task.taskDuration}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Task Duration : {task.taskDuration}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Priority pill bottom-right */}
        {task.taskStatus && (
          <div className="absolute  mt-1 right-0 pt-1">
            <div
              className=" py-0.5 pl-2 pr-1 rounded-l-full font-semibold cursor-pointer"
              style={{
                color: isColorDark(statusColor) ? "#fff" : "#000",
                borderRight: `2px solid ${statusColor}`,
                background: `${statusColor}`,
                fontSize: `${14 * scale}px`,
              }}
            >
              <TableTooltip text={task.taskStatus} />
            </div>
          </div>
        )}
      </div>
      <ViewMeetingModal
        isModalOpen={isViewModalOpen}
        modalData={formattedTaskForModal}
        modalClose={() => setIsViewModalOpen(false)}
      />

      {isDeleteModalOpen && (
        <ConfirmationDeleteModal
          title={"Delete Company Task"}
          modalData={formattedTaskForModal}
          isModalOpen={isDeleteModalOpen}
          modalClose={closeDeleteModal}
          onSubmit={handleDeleteSubmit}
          isChildData={isChildData}
        />
      )}
    </div>
  );
}

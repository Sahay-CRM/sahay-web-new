import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Eye } from "lucide-react";

import { useNavigate } from "react-router-dom";

interface TaskCardProps {
  task: TaskGetPaging;
}

export default function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
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

  const fullDeadline = task.taskDeadline
    ? format(new Date(task.taskDeadline), "dd-MM-yyyy")
    : "No Date";

  const assignees =
    task.TaskEmployeeJunction?.map(
      (j: TaskEmployee) => j.Employee?.employeeName,
    )
      .filter(Boolean)
      .join(", ") || "Unassigned";

  const statusColor = task.color || "#2e3195";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-grab active:cursor-grabbing relative group"
    >
      <div className="flex flex-col gap-1 mb-3">
        <h3 className="text-sm font-bold text-gray-800 leading-tight">
          {task.taskName}
        </h3>
        {task.projectName && (
          <p className="text-xs text-gray-600 font-medium">
            Project: {task.projectName}
          </p>
        )}
        <p className="text-xs text-gray-500 font-medium">{assignees}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className="px-3 py-1 rounded-full text-[10px] font-bold capitalize shadow-sm"
          style={{
            backgroundColor: `${statusColor}15`, // 15% opacity
            color: statusColor,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {task.taskStatus}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
            {fullDeadline}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/tasks/edit/${task.taskId}`);
            }}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <div className="px-2 py-1 rounded bg-teal-50 text-teal-600 text-[10px] font-bold uppercase tracking-wider border border-teal-100">
            {task.taskTypeName || "Normal"}
          </div>
        </div>
      </div>
    </div>
  );
}

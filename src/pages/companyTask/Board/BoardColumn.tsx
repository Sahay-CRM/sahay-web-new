import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

interface Column {
  id: string;
  title: string;
  color: string;
}

interface BoardColumnProps {
  column: Column;
  tasks: TaskGetPaging[];
  refetch: () => void;
}

export default function BoardColumn({
  column,
  tasks,
  refetch,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const taskIds = tasks.map((t) => t.taskId);

  return (
    <div className="flex flex-col w-[390px] bg-[#f8f9fa] rounded-xl border border-gray-100 shadow-sm max-h-full">
      <div className="p-2 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
        <div className="flex px-4 items-center gap-3">
          <span className="font-bold text-gray-800 text-sm tracking-tight">
            {column.title}
          </span>
          <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
            {tasks.length}
          </span>
        </div>
        {/* <div
          className="w-2 h-2 rounded-full ring-4 ring-primary/10"
          style={{ backgroundColor: column.color }}
        /> */}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto min-h-[200px] custom-scrollbar"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task.taskId} task={task} refetch={refetch} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="text-xs font-medium">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

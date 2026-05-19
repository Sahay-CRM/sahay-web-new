import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useAllCompanyTask,
  useGetAllTaskStatus,
} from "@/features/api/companyTask";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import DateRangePicker from "@/components/shared/DateRange";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { getUTCEndOfDay, getUTCStartOfDay } from "@/features/utils/app.utils";

export default function TaskBoard() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { mutate: updateTask } = useAddUpdateCompanyTask();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: "Board View", href: "" },
    ]);
  }, [setBreadcrumbs]);

  // Date Range State
  const today = new Date();
  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

  const [taskDateRange, setTaskDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: before14,
    taskDeadline: after14,
  });

  const [appliedDateRange, setAppliedDateRange] = useState(taskDateRange);
  const [filters, setFilters] = useState<{ taskStatusName: string[] }>({
    taskStatusName: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  const { data: statusData, isLoading: isStatusLoading } = useGetAllTaskStatus({
    filter: {},
  });

  const {
    data: taskData,
    isLoading: isTasksLoading,
    refetch,
  } = useAllCompanyTask({
    filter: {
      startDate:
        !showOverdue && appliedDateRange.taskStartDate
          ? getUTCStartOfDay(appliedDateRange.taskStartDate)
          : undefined,
      endDate:
        !showOverdue && appliedDateRange.taskDeadline
          ? getUTCEndOfDay(appliedDateRange.taskDeadline)
          : undefined,
      overDue: showOverdue,
      search: searchTerm,
    },
  });

  const statusOptions = useMemo(() => {
    return (statusData?.data ?? []).map((status) => ({
      label: status.taskStatus,
      value: status.taskStatus, // Use name for filtering
      color: status.color,
    }));
  }, [statusData]);

  const handleDateRangeApply = (range: DateRange | undefined) => {
    if (range) {
      setAppliedDateRange({
        taskStartDate: range.from,
        taskDeadline: range.to,
      });
    }
  };

  const handleDateRangeReset = () => {
    const resetRange = { taskStartDate: before14, taskDeadline: after14 };
    setTaskDateRange(resetRange);
    setAppliedDateRange(resetRange);
  };

  const handleStatusChange = (selected: string[]) => {
    setFilters({ taskStatusName: selected });
  };

  const [tasks, setTasks] = useState<TaskGetPaging[]>([]);
  const [activeTask, setActiveTask] = useState<TaskGetPaging | null>(null);
  const [initialStatusId, setInitialStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (taskData?.data) {
      setTasks([...taskData.data]); // Copy to avoid mutation of query cache
    }
  }, [taskData]);

  const columns = useMemo(() => {
    return (statusData?.data ?? []).map((status) => ({
      id: status.taskStatusId,
      title: status.taskStatus,
      color: status.color || "#2e3195",
    }));
  }, [statusData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.taskId === active.id);
    setActiveTask(task || null);
    setInitialStatusId(task?.taskStatusId || null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.taskId === activeId);
        const overIndex = tasks.findIndex((t) => t.taskId === overId);

        if (tasks[activeIndex].taskStatusId !== tasks[overIndex].taskStatusId) {
          const updatedTasks = [...tasks];
          updatedTasks[activeIndex] = {
            ...updatedTasks[activeIndex],
            taskStatusId: tasks[overIndex].taskStatusId,
          };
          return arrayMove(updatedTasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.taskId === activeId);
        const updatedTasks = [...tasks];
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          taskStatusId: overId as string,
        };
        return arrayMove(updatedTasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;

    let newStatusId = task.taskStatusId;

    if (over.data.current?.type === "Column") {
      newStatusId = overId;
    } else if (over.data.current?.type === "Task") {
      const overTask = tasks.find((t) => t.taskId === overId);
      if (overTask) {
        newStatusId = overTask.taskStatusId;
      }
    }

    if (newStatusId !== initialStatusId) {
      updateTask(
        { taskId, taskStatusId: newStatusId },
        {
          onSuccess: () => {
            toast.success("Task status updated");
            refetch();
          },
          onError: () => {
            toast.error("Failed to update task status");
            refetch();
          },
        },
      );
    }

    setActiveTask(null);
  };

  if (isStatusLoading || isTasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-4 h-[calc(100vh-90px)] overflow-hidden bg-white">
      {/* Header Section */}
      <div className="w-full px-2 overflow-x-auto sm:px-4  flex flex-col">
        <div className="flex mb-3 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Company Task List
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/tasks">
              <Button
                variant="outline"
                className="h-9 px-4 text-[11px] font-bold border-primary/30 text-primary hover:bg-primary/5 rounded-full"
              >
                View as List
              </Button>
            </Link>
            <Link to="/dashboard/tasks/add">
              <Button className="py-2 w-fit">Add Company Task</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <SearchInput
            placeholder="Search..."
            searchValue={searchTerm}
            setPaginationFilter={(
              updater:
                | { search: string }
                | ((prev: { search: string }) => { search: string }),
            ) => {
              if (typeof updater === "function") {
                const result = updater({ search: searchTerm });
                setSearchTerm(result.search);
              } else {
                setSearchTerm(updater.search);
              }
            }}
            className="w-80"
          />

          <div className="flex items-center gap-4 flex-wrap">
            {!showOverdue && (
              <DateRangePicker
                value={{
                  from: taskDateRange.taskStartDate,
                  to: taskDateRange.taskDeadline,
                }}
                onChange={(range) => {
                  setTaskDateRange({
                    taskStartDate: range?.from,
                    taskDeadline: range?.to,
                  });
                }}
                onApply={handleDateRangeApply}
                defaultDate={{
                  startDate: appliedDateRange.taskStartDate,
                  deadline: appliedDateRange.taskDeadline,
                }}
                isClear
                handleClear={handleDateRangeReset}
              />
            )}

            <DropdownSearchMenu
              label="Status"
              options={statusOptions}
              selected={filters.taskStatusName}
              onChange={handleStatusChange}
              multiSelect
            />

            <Button
              variant={showOverdue ? "destructive" : "outline"}
              onClick={() => setShowOverdue(!showOverdue)}
              className="h-10 px-4 text-sm font-medium"
            >
              {showOverdue ? "Show All Tasks" : "Show Overdue"}
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 scrollbar-thin scrollbar-thumb-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pb-4">
            {columns
              .filter(
                (col) =>
                  filters.taskStatusName.length === 0 ||
                  filters.taskStatusName.includes(col.title),
              )
              .map((col) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  tasks={tasks.filter((t) => t.taskStatusId === col.id)}
                  refetch={refetch}
                />
              ))}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: "0.5",
                  },
                },
              }),
            }}
          >
            {activeTask ? (
              <div className="scale-105 rotate-3 transition-transform">
                <TaskCard task={activeTask} refetch={refetch} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

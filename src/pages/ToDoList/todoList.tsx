import { useEffect, useState } from "react";
import { Calendar, Pencil, Trash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import TaskSheet from "./todoListDrawer";
import { useTodoList } from "./useTodoList";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";

export default function TodoList() {
  const {
    tasks,
    newTask,
    selectedTask,
    isDrawerOpen,
    setNewTask,
    setIsDrawerOpen,
    handleAddTask,
    handleOpenDrawer,
    toggleComplete,
    editValue,
    setEditValue,
    handleDelete,
    handleUpdateTodo,
  } = useTodoList();
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const completedTasks = (tasks ?? []).filter((t) => t.isCompleted);
  const activeTasks = (tasks ?? []).filter((t) => !t.isCompleted);
  const userData = useSelector(getUserDetail);
  const allowedTypes = ["CONSULTANT", "OWNER"];
  const canToggle = allowedTypes.includes(userData.employeeType ?? "");
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: "ToDo List", href: "" }]);
  }, [setBreadcrumbs]);

  const renderDate = (dateStr: string) => {
    const due = new Date(dateStr),
      today = new Date(),
      tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
    if (isSameDay(due, today)) return "Today";
    if (isSameDay(due, tomorrow)) return "Tomorrow";
    return `Due ${due.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="flex h-[calc(100vh-90px)] w-full bg-background">
      <div
        className={`flex flex-col transition-all duration-300 ${isDrawerOpen ? "w-3/4" : "w-full"}`}
      >
        <div className="flex-1 space-y-1 p-4 overflow-y-auto pr-1">
          {tasks?.length === 0 && (
            <p className="text-muted-foreground text-sm italic text-center py-6">
              No tasks yet. Add one below.
            </p>
          )}
          {activeTasks.map((task) => (
            <div
              key={task.toDoId}
              className={`flex justify-between p-1 rounded-sm border bg-card hover:bg-accent pl-2 transition ${task.isCompleted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              onClick={() =>
                !task.isCompleted &&
                editTaskId === null &&
                task.toDoName &&
                task.toDoId &&
                handleOpenDrawer(task.toDoId, task.toDoName)
              }
            >
              <div className="flex gap-4 flex-1 items-center justify-between">
                <div className="flex gap-3 flex-1 items-center overflow-hidden min-w-0">
                  <RadioGroup
                    value={task.isCompleted ? "done" : "todo"}
                    onValueChange={() =>
                      task.toDoId &&
                      toggleComplete(task.toDoId, !!task.isCompleted)
                    }
                    className="px-1 cursor-pointer flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RadioGroupItem
                      value="done"
                      id={`task-${task.toDoId}`}
                      className="w-4 h-4 cursor-pointer rounded-full border border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </RadioGroup>
                  {editTaskId === task.toDoId ? (
                    <>
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && task.toDoId) {
                            handleUpdateTodo(task.toDoId);
                            setEditTaskId(null);
                            setEditValue("");
                          }
                          if (e.key === "Escape") {
                            setEditTaskId(null);
                            setEditValue("");
                          }
                        }}
                        disabled={!task.toDoId}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        title="Cancel edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTaskId(null);
                          setEditValue("");
                        }}
                        className="text-muted-foreground hover:text-red-500 w-10 border rounded-md aspect-square"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col flex-1 min-w-0">
                      <Label
                        className="text-black text-[12px] whitespace-normal break-words min-w-0"
                        title={task.toDoName}
                      >
                        {task.toDoName}
                      </Label>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-primary leading-none">
                          <Calendar className="w-2 h-2 shrink-0" />
                          <span className="inline-block leading-none">
                            {renderDate(task.dueDate)}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <span
                    title="Delete task"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (task.toDoId) {
                        handleDelete(task.toDoId);
                        if (editTaskId === task.toDoId) {
                          setEditTaskId(null);
                          setEditValue("");
                        }
                      }
                    }}
                    className={`cursor-pointer p-2 rounded-md hover:bg-red-100 
        ${task.isCompleted || editTaskId === task.toDoId ? "opacity-50 hidden pointer-events-none" : ""}`}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </span>
                  {editTaskId !== task.toDoId && (
                    <span
                      title="Edit task"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTaskId(task.toDoId ?? null);
                        setEditValue(task.toDoName || "");
                      }}
                      className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 ${task.isCompleted ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="space-y-1 overflow-auto flex-1 pr-1">
            <h2 className="mt-2 text-primary border-b mb-3 font-medium">
              COMPLETED
            </h2>
            {completedTasks.map((task) => (
              <div
                key={task.toDoId}
                className="flex h-10 justify-between border p-1 break-all rounded-sm bg-card hover:bg-accent transition items-center"
              >
                <div className="flex gap-3 flex-1 items-center">
                  <div className="px-1 flex-shrink-0 flex items-center h-full">
                    <RadioGroup
                      value={task.isCompleted ? "notdone" : "todo"}
                      onValueChange={() =>
                        canToggle &&
                        task.toDoId &&
                        toggleComplete(task.toDoId, !!task.isCompleted)
                      }
                      onClick={(e) => !canToggle && e.stopPropagation()}
                    >
                      <RadioGroupItem
                        value="notdonef"
                        id={`task-${task.toDoId}`}
                        className={`w-4 h-4 rounded-full border border-gray-400 bg-gray-600 ${canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                      />
                    </RadioGroup>
                  </div>
                  <div className="flex flex-col flex-1">
                    <Label
                      className="text-muted-foreground line-through text-[12px]"
                      title={task.toDoName}
                    >
                      {task.toDoName}
                    </Label>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] text-primary leading-none">
                        <Calendar className="w-2 h-2 shrink-0" />
                        <span className="inline-block leading-none">
                          {renderDate(task.dueDate)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 bg-primary p-2 pb-3 flex items-center gap-2 rounded-md">
          <Input
            type="text"
            placeholder="Add a todo..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            className="flex-1 mt-1 bg-white rounded-lg border border-white text-black placeholder:text-gray-800"
          />
        </div>
      </div>
      <TaskSheet
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        taskId={selectedTask?.id || null}
        taskTitle={selectedTask?.name || null}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Pencil, Trash, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import TaskSheet from "./todoListDrawer";
import { useTodoList } from "./useTodoList";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

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

  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: "ToDo List", href: "" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="flex h-[calc(100vh-90px)] w-full bg-background">
      {/* Task List */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isDrawerOpen ? "w-3/4" : "w-full"
        }`}
      >
        <div className="flex-1 space-y-3 p-4 overflow-y-auto pr-1">
          {tasks?.length === 0 && (
            <p className="text-muted-foreground text-sm italic text-center py-6">
              No tasks yet. Add one below.
            </p>
          )}

          {/* Active Tasks */}
          {activeTasks.map((task) => (
            <div
              key={task.toDoId}
              className={`flex justify-between rounded-lg border bg-card hover:bg-accent pl-2 transition 
                ${task.isCompleted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              onClick={() => {
                if (
                  !task.isCompleted &&
                  editTaskId === null &&
                  task.toDoName &&
                  task.toDoId
                ) {
                  handleOpenDrawer(task.toDoId, task.toDoName);
                }
              }}
            >
              <div className="flex gap-3 flex-1 items-center justify-between ">
                <div className="flex gap-2 flex-1 items-center overflow-hidden">
                  <RadioGroup
                    value={task.isCompleted ? "done" : "todo"}
                    onValueChange={() => {
                      if (task.toDoId) {
                        toggleComplete(task.toDoId);
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    <RadioGroupItem
                      value="done"
                      id={`task-${task.toDoId}`}
                      className="w-5 h-5 rounded-full"
                      disabled={task.isCompleted}
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
                        className="text-muted-foreground hover:text-primary w-10 border rounded-md aspect-square"
                      >
                        <X className="text-black w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Label
                      className={`cursor-pointer truncate flex-1 ${
                        task.isCompleted
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                      title={task.toDoName} // tooltip for full text
                    >
                      {task.toDoName}
                    </Label>
                  )}
                </div>

                <div>
                  <Button
                    variant="ghost"
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
                    disabled={task.isCompleted || editTaskId === task.toDoId}
                    className="text-muted-foreground hover:text-primary w-10 border rounded-md aspect-square mr-2 cursor-pointer"
                  >
                    <Trash className="text-black w-4 h-4" />
                  </Button>
                  {editTaskId !== task.toDoId && (
                    <Button
                      variant="ghost"
                      title="Edit task"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTaskId(task.toDoId ?? null);
                        setEditValue(task.toDoName || "");
                      }}
                      disabled={task.isCompleted} // Optional: keep disabled for completed tasks
                      className="text-muted-foreground hover:text-primary w-10 border rounded-md aspect-square cursor-pointer"
                    >
                      <Pencil className="text-black w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="space-y-3 overflow-auto flex-1 pr-1">
            <h2 className="text-sm font-medium">COMPLETED </h2>
            {completedTasks.map((task) => (
              <div
                key={task.toDoId}
                className="flex justify-between border p-1 break-all rounded-lg bg-card hover:bg-accent transition cursor-not-allowed opacity-70"
              >
                <div className="flex gap-3 flex-1 items-center justify-between">
                  <div className="flex gap-2 flex-1 items-center">
                    <RadioGroup value="done" className="flex-shrink-0">
                      <RadioGroupItem
                        value="done"
                        id={`task-${task.toDoId}`}
                        className="w-5 h-5 rounded-full"
                        disabled
                      />
                    </RadioGroup>
                    <Label className="mr-5 text-[12px]" title={task.toDoName}>
                      {task.toDoName}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}

        {/* Input for new task */}
        <div className="mt-3 bg-primary p-2 pb-4 flex items-center gap-2 rounded-md">
          <Input
            type="text"
            placeholder="Add a todo..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            className="flex-1 mt-2  rounded-lg border border-white text-white placeholder:text-white"
          />
        </div>
      </div>

      {/* Right Sheet */}
      <TaskSheet
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        taskId={selectedTask?.id || null}
        taskTitle={selectedTask?.name || null}
      />
    </div>
  );
}

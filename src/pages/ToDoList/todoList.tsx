import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  const [showCompleted, setShowCompleted] = useState(true);

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
        className={`flex flex-col p-4 transition-all duration-300 ${
          isDrawerOpen ? "w-3/4" : "w-full"
        }`}
      >
        <div className="flex-1 h-[60%] space-y-3 overflow-y-auto pr-1">
          {tasks?.length === 0 && (
            <p className="text-muted-foreground text-sm italic text-center py-6">
              No tasks yet. Add one below.
            </p>
          )}

          {/* Active Tasks */}
          {activeTasks.map((task) => (
            <Card
              key={task.toDoId}
              className={`flex justify-between px-4 py-3 rounded-lg bg-card hover:bg-accent transition 
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
            </Card>
          ))}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <>
            {showCompleted ? (
              <div className="mt-6 h-[40%] flex flex-col">
                {/* Toggle Button */}
                <div className="shrink-0 sticky top-0 bg-background z-10">
                  <Button
                    variant="outline"
                    className="w-50 hover:text-primary justify-center font-semibold text-primary border border-primary"
                    onClick={() => setShowCompleted(false)}
                  >
                    <ChevronDown className="text-primary w-4 h-4 mr-1" />
                    COMPLETED {completedTasks.length}
                  </Button>
                </div>

                {/* Scrollable Completed List */}
                <div className="mt-3 space-y-3 overflow-auto flex-1 pr-1">
                  {completedTasks.map((task) => (
                    <Card
                      key={task.toDoId}
                      className="flex justify-between px-4 py-3 rounded-lg bg-card hover:bg-accent transition cursor-not-allowed opacity-70"
                    >
                      <div className="flex gap-3 flex-1 items-center justify-between">
                        <div className="flex gap-2 flex-1 items-center overflow-hidden">
                          <RadioGroup value="done" className="flex-shrink-0">
                            <RadioGroupItem
                              value="done"
                              id={`task-${task.toDoId}`}
                              className="w-5 h-5 rounded-full"
                              disabled
                            />
                          </RadioGroup>
                          <Label
                            className="text-muted-foreground truncate mr-5 overflow-hidden whitespace-nowrap"
                            title={task.toDoName}
                          >
                            {task.toDoName}
                          </Label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-50 hover:text-primary justify-center font-semibold text-primary border border-primary"
                  onClick={() => setShowCompleted(true)}
                >
                  <ChevronUp className="text-primary w-4 h-4 mr-1" />
                  COMPLETED {completedTasks.length}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Input for new task */}
        <div className="mt-3 border-t border-gray-800  flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add a todo..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            className="flex-1 mt-2  rounded-lg border border-primary  "
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

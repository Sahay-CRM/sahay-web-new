import { useEffect } from "react";
import { CalendarDays, Pencil, ReceiptText, Trash2 } from "lucide-react";

import { useRepeatTaskToDo } from "./useRepeatTaskToDo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import RoutineTaskDrawer from "./routineTaskDrawer";
import { Button } from "@/components/ui/button";
import ViewRepeatTask from "./ViewRepeatTask";
import { convertToLocalTime } from "@/features/utils/app.utils";
import { SpinnerIcon } from "@/components/shared/Icons";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SingleDatePicker from "@/components/shared/FormDateTimePicker/SingleDatePicker";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import ProgressBar from "@/components/shared/ProgressBar/progressBar";

function getDayDiff(deadline?: string | Date | null): number {
  if (!deadline) return Infinity;

  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const today = new Date();

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const deadlineOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diff =
    (deadlineOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24);
  return diff;
}

export default function RepeatTaskToDo() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "My Day", href: "" }]);
  }, [setBreadcrumbs]);

  const {
    companyTaskData,
    toggleComplete,
    setIsEmployeeId,
    employeeOption,
    isEmployeeId,
    setIsEmpSearch,
    permission,
    handleEditTask,
    modalData,
    isModalOpen,
    handleClose,
    handleViewTask,
    isViewModalOpen,
    handleDeleteTask,
    isLoading,
    userid,
    setSelectedDate,
    selectedDate,
    today,
    userData,
    shouldDisableCheckbox,
  } = useRepeatTaskToDo();

  const tasks = companyTaskData?.data || [];

  const activeTasks = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => getDayDiff(a.taskDeadline) - getDayDiff(b.taskDeadline));

  const doneTasks = tasks
    .filter((t) => t.isCompleted)
    .sort((a, b) => getDayDiff(a.taskDeadline) - getDayDiff(b.taskDeadline));

  const allTasks = [...activeTasks, ...doneTasks];
  const totalTasks = tasks.length;
  const completedTasks = doneTasks.length;

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const renderTaskItem = (task: RepeatTaskAllRes, isCompleted: boolean) => (
    <div
      key={task.taskId}
      className={`group overflow-hidden flex h-12 justify-between px-2 rounded-sm border bg-card hover:bg-accent transition ${
        !isSameDate(selectedDate!, today) && "bg-gray-300 hover:bg-gray-200"
      } ${isCompleted && "bg-gray-100 hover:bg-gray-200"}`}
    >
      <div className="flex gap-4 flex-1 items-center justify-between">
        <div className="flex gap-3 flex-1 items-center overflow-hidden min-w-0">
          {isCompleted ? (
            <FormCheckbox
              checked={task.isCompleted}
              onChange={() => {
                if (task.taskId && isSameDate(selectedDate!, today)) {
                  toggleComplete(task.taskId, !task.isCompleted);
                }
              }}
              className={`w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                isSameDate(selectedDate!, today) ? "" : "cursor-not-allowed"
              }`}
              containerClass="rounded-full overflow-hidden mt-0"
              onClick={(e) => e.stopPropagation()}
              disabled={shouldDisableCheckbox(task)}
            />
          ) : (
            <RadioGroup
              value={task.isCompleted ? "done" : "todo"}
              onValueChange={() => {
                if (
                  !shouldDisableCheckbox(task) &&
                  task.taskId &&
                  isSameDate(selectedDate!, today)
                ) {
                  toggleComplete(task.taskId, !task.isCompleted);
                }
              }}
              className={`px-1 flex-shrink-0 ${
                isSameDate(selectedDate!, today)
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
              onClick={(e) => e.stopPropagation()}
              disabled={shouldDisableCheckbox(task)}
            >
              <RadioGroupItem
                value="done"
                id={`task-${task.taskId}`}
                className={`w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                  isSameDate(selectedDate!, today)
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                }`}
              />
            </RadioGroup>
          )}

          <div className="w-full flex gap-2 group">
            <div
              className="flex flex-col flex-1 min-w-0 cursor-pointer py-1.5 w-full"
              onClick={() => {
                if (task.taskId && isSameDate(selectedDate!, today)) {
                  toggleComplete(task.taskId, !task.isCompleted);
                }
              }}
            >
              <Label
                className="text-black text-[14px] whitespace-normal break-words min-w-0"
                title={task.taskName}
              >
                {task.taskName} &nbsp; &nbsp; Project: {task.projectName}
              </Label>
              {(permission.Add || permission.Edit) && (
                <div className="flex gap-2 items-center">
                  <span className="text-[12px] text-primary flex gap-2 items-center">
                    <CalendarDays className="w-3 h-3" />
                    {convertToLocalTime(task.taskDeadline ?? null)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="text-black h-6 w-6 p-0 hover:bg-gray-300 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                      onClick={() => handleViewTask(task)}
                    >
                      <ReceiptText className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs text-white">Task Detail</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {permission.Edit && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="text-black hover:bg-gray-300 h-6 w-6 p-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => handleEditTask(task)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs text-white">Edit Task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {permission.Delete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="text-white h-6 w-6 p-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                        onClick={() => handleDeleteTask(task.taskId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs text-white">Delete Task</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col w-full py-4 px-4 h-full">
        <div className="flex justify-between gap-2 items-center mb-4 w-full">
          <div className="w-full">
            {totalTasks > 0 && (
              <ProgressBar total={totalTasks} completed={completedTasks} />
            )}
          </div>
          {(permission.Add || permission.Edit) &&
          userData.employeeType !== "EMPLOYEE" ? (
            <div className="z-15 relative flex items-center gap-2 w-1/3 justify-end">
              <SearchDropdown
                options={employeeOption}
                selectedValues={isEmployeeId ? [isEmployeeId] : []}
                onSelect={(value) => setIsEmployeeId(value.value)}
                placeholder="Select Employee..."
                isMandatory
                onSearchChange={setIsEmpSearch}
                dropdownClass="min-w-60"
                isCrossShow={isEmployeeId !== userid}
              />
              <SingleDatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
          ) : (
            <div className="w-44 ml-5">
              <SingleDatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
          )}
        </div>

        {/* Tasks List - Single Scrollable Section */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin">
              <SpinnerIcon />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {allTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm italic text-center py-4">
                No tasks. You're all caught up!
              </p>
            ) : (
              <div className="flex flex-col overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 pt-2 pb-1">
                  <h2 className="text-sm font-medium">ALL TASKS</h2>
                </div>
                <div className="flex flex-col gap-2 pr-2">
                  {allTasks.map((task) => (
                    <div key={task.taskId}>
                      {activeTasks.includes(task) && (
                        <>
                          {activeTasks.indexOf(task) === 0 && (
                            <h3 className="text-xs font-semibold text-gray-600 mt-2 mb-1">
                              PENDING
                            </h3>
                          )}
                          {renderTaskItem(task, false)}
                        </>
                      )}
                      {doneTasks.includes(task) && (
                        <>
                          {doneTasks.indexOf(task) === 0 && (
                            <h3 className="text-xs font-semibold text-gray-600 mt-4 mb-1">
                              COMPLETED
                            </h3>
                          )}
                          {renderTaskItem(task, true)}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {isModalOpen && (
          <RoutineTaskDrawer
            open={isModalOpen}
            taskData={modalData}
            onClose={handleClose}
          />
        )}
        {isViewModalOpen && (
          <ViewRepeatTask
            modalData={modalData}
            isModalOpen={isViewModalOpen}
            modalClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

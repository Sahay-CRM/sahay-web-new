import { useRepeatTaskToDo } from "./useRepeatTaskToDo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DateRangePicker from "@/components/shared/DateRange";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import RoutineTaskDrawer from "./routineTaskDrawer";
import { Button } from "@/components/ui/button";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import ViewRepeatTask from "./ViewRepeatTask";
import { convertToLocalTime } from "@/features/utils/app.utils";
import { SpinnerIcon } from "@/components/shared/Icons";

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
  const {
    companyTaskData,
    toggleComplete,
    isDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
    handleClear,
    isAppliedDateRange,
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
  } = useRepeatTaskToDo();

  const tasks = companyTaskData?.data || [];

  const activeTasks = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => getDayDiff(a.taskDeadline) - getDayDiff(b.taskDeadline));

  const doneTasks = tasks
    .filter((t) => t.isCompleted)
    .sort((a, b) => getDayDiff(a.taskDeadline) - getDayDiff(b.taskDeadline));

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col w-full py-4 px-4 h-full">
        <div className="flex justify-between items-center mb-4 w-full">
          <div className="w-52">
            <h1 className="text-lg font-bold text-gray-800">
              Repeat Task List
            </h1>
          </div>
          {(permission.Add || permission.Edit) && (
            <div className="z-15 relative flex items-center gap-2 w-full justify-end">
              <div>
                <SearchDropdown
                  options={employeeOption}
                  selectedValues={isEmployeeId ? [isEmployeeId] : []}
                  onSelect={(value) => {
                    setIsEmployeeId(value.value);
                  }}
                  placeholder="Select Employee..."
                  isMandatory
                  onSearchChange={setIsEmpSearch}
                  dropdownClass="min-w-60"
                />
              </div>
              <DateRangePicker
                value={{
                  from: isDateRange.startDate,
                  to: isDateRange.deadline,
                }}
                onChange={handleDateRangeChange}
                onApply={handleDateRangeApply}
                onSaveApply={handleDateRangeSaveApply}
                isClear={true}
                handleClear={handleClear}
                defaultDate={isAppliedDateRange}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin">
              <SpinnerIcon />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {tasks.length === 0 ? (
              <div>No Repeat Task Data Found</div>
            ) : (
              <>
                {activeTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic text-center py-4">
                    No active tasks. You're all caught up!
                  </p>
                ) : (
                  <div className="flex-1 overflow-hidden flex flex-col mb-4">
                    <h2 className="text-sm font-medium mb-2">ACTIVE TASKS</h2>

                    <div className="flex-1 overflow-y-auto pr-2">
                      {activeTasks.map((task) => (
                        <div
                          key={task.taskId}
                          className="group overflow-hidden flex h-12 justify-between px-2 rounded-sm border bg-card hover:bg-accent transition mb-2"
                        >
                          <div className="flex gap-4 flex-1 items-center justify-between">
                            <div className="flex gap-3 flex-1 items-center overflow-hidden min-w-0">
                              <RadioGroup
                                value={task.isCompleted ? "done" : "todo"}
                                onValueChange={() =>
                                  task.taskId &&
                                  toggleComplete(task.taskId, !task.isCompleted)
                                }
                                className="px-1 cursor-pointer flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <RadioGroupItem
                                  value="done"
                                  id={`task-${task.taskId}`}
                                  className="w-4 h-4 cursor-pointer rounded-full border border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </RadioGroup>

                              <div className="w-full flex gap-2 group">
                                <div
                                  className="flex flex-col flex-1 min-w-0 cursor-pointer py-1.5 w-full"
                                  onClick={() => handleViewTask(task)}
                                >
                                  <Label
                                    className="text-black text-[14px] whitespace-normal break-words min-w-0"
                                    title={task.taskName}
                                  >
                                    {task.taskName}
                                  </Label>
                                  {(permission.Add || permission.Edit) && (
                                    <div className="flex gap-2 items-center">
                                      <span className="text-[12px] text-primary flex gap-2 items-center">
                                        <CalendarDays className="w-3 h-3" />
                                        {convertToLocalTime(
                                          task.taskDeadline ?? null,
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {permission.Edit && (
                                    <Button
                                      size="sm"
                                      className="text-black hover:bg-gray-300 h-6 w-6 p-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      onClick={() => handleEditTask(task)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {permission.Delete && (
                                    <Button
                                      size="sm"
                                      className="text-black h-6 w-6 p-0 hover:bg-gray-300 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                                      onClick={() =>
                                        handleDeleteTask(task.taskId)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {doneTasks.length > 0 && (
              <div className="flex-1 overflow-hidden flex flex-col border-t pt-4">
                <h2 className="text-primary font-medium text-sm mb-2">
                  COMPLETED
                </h2>
                <div className="flex-1 overflow-y-auto pr-2">
                  {doneTasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="flex h-12 justify-between border p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition items-center mb-2"
                    >
                      <div className="flex gap-3 flex-1 items-center">
                        <RadioGroup
                          value="done"
                          className="px-1 flex-shrink-0 flex items-center h-full"
                        >
                          <RadioGroupItem
                            value="done"
                            id={`task-${task.taskId}`}
                            className="w-4 h-4 rounded-full border border-gray-400 bg-gray-500"
                          />
                        </RadioGroup>

                        <div className="w-full flex gap-2 group">
                          <div
                            className="flex flex-col flex-1 min-w-0 cursor-pointer py-1.5 w-full"
                            onClick={() => handleViewTask(task)}
                          >
                            <Label
                              className="text-black text-[14px] whitespace-normal break-words min-w-0"
                              title={task.taskName}
                            >
                              {task.taskName}
                            </Label>
                            {(permission.Add || permission.Edit) && (
                              <div className="flex gap-2 items-center">
                                <span className="text-[12px] text-primary flex gap-2 items-center">
                                  <CalendarDays className="w-3 h-3" />
                                  {convertToLocalTime(
                                    task.taskDeadline ?? null,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            {permission.Edit && (
                              <Button
                                size="sm"
                                className="text-black h-6 w-6 p-0 hover:bg-gray-300 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => handleEditTask(task)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {permission.Delete && (
                              <Button
                                size="sm"
                                className="text-black h-6 w-6 p-0 hover:bg-gray-300 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

import { useRepeatTaskToDo } from "./useRepeatTaskToDo";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DateRangePicker from "@/components/shared/DateRange";

export default function RepeatTaskToDo() {
  const {
    companyTaskData,
    toggleComplete,
    isDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
  } = useRepeatTaskToDo();

  const tasks = companyTaskData?.data || [];
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const doneTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full bg-gray-50 py-4 px-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold mb-4 text-gray-800">
          Repeat Task List
        </h1>
        <div className="z-15 relative flex items-center gap-2">
          <DateRangePicker
            value={{
              from: isDateRange.startDate,
              to: isDateRange.deadline,
            }}
            onChange={handleDateRangeChange}
            onApply={handleDateRangeApply}
            onSaveApply={handleDateRangeSaveApply}
          />
        </div>
      </div>

      {/* Active Tasks */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {activeTasks.length === 0 && (
          <p className="text-muted-foreground text-sm italic text-center py-6">
            No active tasks. You're all caught up!
          </p>
        )}

        {activeTasks.map((task) => (
          <div
            key={task.taskId}
            className="group flex h-10 justify-between p-1 rounded-sm border bg-card hover:bg-accent pl-2 transition"
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

                <div className="flex flex-col flex-1 min-w-0">
                  <Label
                    className="text-black text-sm whitespace-normal break-words min-w-0"
                    title={task.taskName}
                  >
                    {task.taskName}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Completed Tasks */}
        {doneTasks.length > 0 && (
          <div className="mt-6 space-y-1 overflow-auto flex-1 pr-1">
            <h2 className="text-primary border-b mb-3 font-medium text-sm">
              COMPLETED
            </h2>

            {doneTasks.map((task) => (
              <div
                key={task.taskId}
                className="flex h-12 justify-between border p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition items-center"
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

                  <div className="flex flex-col flex-1">
                    <Label
                      className="text-muted-foreground line-through text-sm"
                      title={task.taskName}
                    >
                      {task.taskName}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

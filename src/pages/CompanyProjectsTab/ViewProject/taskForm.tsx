/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/shared/Form/FormSelect";

export function TaskForm({
  control,
  errors,
  register,
  setValue,
  onSubmitTask,
  reset,
  defaultValue,
  setIsAddTaskOpen,
  setEditingTaskId,
  editingTaskId,
  meetingDataOption,
  taskTypeOptions,
  taskStatusOptions,
  employeeOption,
  handleStatusSearch,
  handleMeetingSearch,
  handleTypeSearch,
}: any) {
  return (
    <div className="p-5 border-b mt-2">
      <form onSubmit={onSubmitTask} className="border rounded-md p-4 mb-2 pb-2">
        <div className="grid grid-cols-2 space-y-1.5 gap-2 last-of-type:space-y-0">
          {/* Meeting */}
          <div>
            <Controller
              control={control}
              name="meetingId"
              rules={{ required: "Please select Meeting" }}
              render={({ field }) => (
                <SearchDropdown
                  options={meetingDataOption}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("meetingId", value.value);
                  }}
                  placeholder="Select Meeting..."
                  label="Meeting"
                  error={errors.meetingId}
                  isMandatory
                  onSearchChange={handleMeetingSearch}
                  labelClass="mb-2"
                />
              )}
            />
          </div>

          {/* Task Name */}
          <div>
            <FormInputField
              label="Task Name"
              className="p-4 px-3 mt-0"
              {...register("taskName", { required: "Task Name is required" })}
              error={errors.taskName}
              placeholder="Enter Task Name"
            />
          </div>

          {/* Deadline */}
          <div>
            <Controller
              control={control}
              name="taskDeadline"
              rules={{ required: "Task Deadline is required" }}
              render={({ field }) => (
                <FormDateTimePicker
                  label="Task Deadline"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.taskDeadline}
                />
              )}
            />
          </div>

          {/* Task Type */}
          <div>
            <Controller
              control={control}
              name="taskTypeId"
              rules={{ required: "Please select Task Type" }}
              render={({ field }) => (
                <SearchDropdown
                  options={taskTypeOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("taskTypeId", value.value);
                  }}
                  placeholder="Select Task Type..."
                  label="Task Type"
                  error={errors.taskTypeId}
                  isMandatory
                  onSearchChange={handleTypeSearch}
                  labelClass="mb-2 mt-1.5"
                />
              )}
            />
          </div>

          {/* Task Status */}
          <div>
            <Controller
              control={control}
              name="taskStatusId"
              rules={{ required: "Please select Task Status" }}
              render={({ field }) => (
                <SearchDropdown
                  options={taskStatusOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("taskStatusId", value.value);
                  }}
                  placeholder="Select Task Status..."
                  label="Task Status"
                  error={errors.taskStatusId}
                  isMandatory
                  onSearchChange={handleStatusSearch}
                  labelClass="mb-2 mt-1.5"
                />
              )}
            />
            {/* <Controller
              control={control}
              name="taskStatusId"
              rules={{ required: "Please select Task Status" }}
              render={({ field }) => (
                <FormSelect
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  options={taskStatusOptions} // ✅ same array
                  placeholder="Select Task Status..."
                  label="Task Status"
                  isMandatory
                  triggerClassName="py-4"
                  disabled={false}
                  error={errors.taskStatusId}
                />
              )}
            /> */}
          </div>

          {/* Assign Employees */}
          <div>
            <Controller
              control={control}
              name="assignUsers"
              rules={{ required: "Select User is Required" }}
              render={({ field }) => (
                <FormSelect
                  label="Assign Employees"
                  value={field.value}
                  onChange={field.onChange}
                  options={employeeOption}
                  error={errors.assignUsers}
                  isMulti={true}
                  placeholder="Select employees"
                  isMandatory
                  labelClass="mb-2"
                />
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded-md p-2 text-base h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("taskDescription", {
                required: "Please Enter Task Description",
              })}
            />
            {errors.taskDescription && (
              <span className="text-red-600 text-sm">
                {errors.taskDescription?.message as string}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="w-full h-full gap-1 flex justify-end items-end">
            <Button
              type="button"
              className="mb-4"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddTaskOpen(false);
                setEditingTaskId(null);
                reset(defaultValue);
              }}
            >
              Cancel
            </Button>

            <Button type="submit" className="mb-4">
              {editingTaskId ? "Update Task" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

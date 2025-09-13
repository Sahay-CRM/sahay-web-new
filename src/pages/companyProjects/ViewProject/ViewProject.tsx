import { useEffect, useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { Calendar, EditIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import useViewProject from "./useViewProject";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/features/utils/app.utils";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useGetProjectComments from "@/features/api/companyProject/useGetProjectComments";
import {
  addUpdateCommentMutation,
  deleteCommentMutation,
} from "@/features/api/companyProject";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

const ProjectView = () => {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Project", href: "/dashboard/projects" },
      { label: "View Company Project", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const {
    projectApiData,
    navigate,
    statusOptions,
    handleStatusChange,
    methods,
    taskPermission,
    permission,
    setIsAddTaskOpen,
    isAddTaskOpen,
    taskTypeOptions,
    setIsTypeSearch,
    meetingDataOption,
    setIsMeetingSearch,
    taskStatusOptions,
    setIsStatusSearch,
    employeeOption,
    onSubmittask,
    projectId,
    control,
    register,
    setValue,
    errors,
  } = useViewProject();

  const { reset } = methods;
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");

  const commentsdata = useGetProjectComments(projectId || "");
  const { mutate: addcomment, isPending } = addUpdateCommentMutation();
  const { mutate: deleteComment } = deleteCommentMutation();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const handleEditComment = (projectCommentId: string, currentText: string) => {
    setEditingCommentId(projectCommentId);
    setEditingText(currentText);
  };

  const handleSaveComment = (projectCommentId?: string) => {
    if (!editingText.trim()) return;

    addcomment({
      projectId: projectId!,
      comment: editingText,
      projectCommentId,
    });

    setEditingCommentId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };
  const handleDeleteComment = (id: string) => {
    deleteComment(id);
  };

  const onSubmitComment = () => {
    if (!newComment.trim()) return;

    addcomment({
      projectId: projectId!,
      comment: newComment,
    });

    setShowCommentInput(false);
    setNewComment("");
    reset({ comment: "" });
  };

  const project = projectApiData?.data;
  if (!project) return null;

  const tasks = project.ProjectTasks || [];

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 p-4  lg:grid-cols-2 gap-8">
        {/* ================= Left Column ================= */}
        <div className="space-y-5">
          {/* Project Overview */}
          <div className="bg-white rounded-2xl shadow-md p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-xl font-bold">{project.projectName}</h1>
                <p className="text-sm text-gray-500 mt-2">
                  {project.projectDescription || "-"}
                </p>
              </div>
              {permission?.Edit && (
                <Button
                  onClick={() =>
                    navigate(
                      `/dashboard/projects/edit/${project.projectId}?source=view`,
                    )
                  }
                >
                  Edit Project
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Controller
                  name="projectStatus"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      {...field}
                      options={statusOptions}
                      error={fieldState.error}
                      onChange={(val) => handleStatusChange(val as string)}
                    />
                  )}
                />

                {project.projectDeadline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Deadline
                    </p>
                    <p className="mt-1 font-semibold">
                      {project.projectDeadline
                        ? format(
                            new Date(project.projectDeadline),
                            "dd/MM/yyyy h:mm a",
                          )
                        : "-"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created By
                  </p>
                  <p className="mt-1 font-semibold">
                    {project.createdBy?.employeeName || "-"}
                  </p>
                </div>

                {(project.ProjectParameters?.subParameters?.length ?? 0) >
                  0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Key Result Areas
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.ProjectParameters?.subParameters.map((sub) => (
                        <Badge
                          key={sub.projectSubParameterId}
                          variant="secondary"
                          className="text-sm px-2 py-1"
                        >
                          {sub.subParameterName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Assignees</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.ProjectEmployees?.map((emp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="rounded-full h-6 w-6 bg-gray-200 text-xs flex items-center justify-center font-medium">
                                {getInitials(emp.employeeName)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>{emp.employeeName}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments (just below Project) */}
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Comments</h2>
              <Button onClick={() => setShowCommentInput((v) => !v)}>
                {showCommentInput ? "Cancel" : "Add Comment"}
              </Button>
            </div>

            {showCommentInput && (
              <div className="mb-4">
                <FormInputField
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter Comment .."
                />

                <Button
                  className="mt-2"
                  disabled={isPending}
                  onClick={() => onSubmitComment()}
                >
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}

            <ScrollArea className="overflow-auto max-h-[40vh]">
              <div className="space-y-4 pr-2">
                {commentsdata.isLoading ? (
                  <p className="text-muted-foreground">Loading comments...</p>
                ) : commentsdata.data?.length ? (
                  [...commentsdata.data]
                    .sort(
                      (a, b) =>
                        new Date(b.commentDate).getTime() -
                        new Date(a.commentDate).getTime(),
                    )
                    .map((comment) => (
                      <div
                        key={comment.projectCommentId}
                        className="group relative rounded-lg border bg-muted/30 px-3 text-md shadow-sm"
                      >
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium text-muted-foreground">
                            {comment.employeeName || "Unknown User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {/* {format(new Date(comment.commentDate), "PPP")} */}
                          </span>

                          {/* Edit/Delete buttons */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-gray-200"
                              onClick={() =>
                                handleEditComment(
                                  comment.projectCommentId,
                                  comment.comment,
                                )
                              }
                            >
                              <EditIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-gray-200"
                              onClick={() =>
                                handleDeleteComment(comment.projectCommentId)
                              }
                            >
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          {editingCommentId === comment.projectCommentId ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-md"
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveComment(comment.projectCommentId)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="text-md">{comment.comment}</span>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <span className="font-medium text-center text-muted-foreground block">
                    No Comments Found
                  </span>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="bg-white h-[calc(100vh-120px)] rounded-2xl shadow-md flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white z-20 flex justify-between items-center p-5 ">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            {taskPermission.Add && (
              <Button onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}>
                Add Task
              </Button>
            )}
          </div>

          {/* Add Task Form */}
          {isAddTaskOpen && (
            <div className="p-5 border-b">
              <form
                onSubmit={onSubmittask}
                className="border rounded-md p-4 mb-2 pb-2"
              >
                <div className="grid grid-cols-2 space-y-1.5 gap-2 last-of-type:space-y-0">
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
                          onSearchChange={setIsMeetingSearch}
                          labelClass="mb-2"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <FormInputField
                      label="Task Name"
                      className="p-4 px-3 mt-0"
                      {...register("taskName", {
                        required: "Task Name is required",
                      })}
                      error={errors.taskName}
                      placeholder="Enter Task Name"
                    />
                  </div>

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
                          onSearchChange={setIsTypeSearch}
                          labelClass="mb-2 mt-1.5"
                        />
                      )}
                    />
                  </div>

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
                          onSearchChange={setIsStatusSearch}
                          labelClass="mb-2 mt-1.5"
                        />
                      )}
                    />
                  </div>

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

                  <div className="w-full h-full flex justify-end items-end">
                    <Button type="submit" className="mb-4">
                      Submit
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Scrollable Task List */}
          <ScrollArea className="flex-1 overflow-auto p-5">
            <div className="space-y-4">
              {tasks.length ? (
                tasks
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.taskDeadline).getTime() -
                      new Date(b.taskDeadline).getTime(),
                  )
                  .map((task) => (
                    <div
                      key={task.taskId}
                      onClick={() =>
                        taskPermission.View &&
                        navigate(`/dashboard/tasks/view/${task.taskId}`)
                      }
                      className="p-2 rounded-xl border hover:shadow-md transition cursor-pointer"
                    >
                      {/* Task Header */}
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="px-1 text-lg font-semibold">
                          {task.taskName}
                        </h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              task.taskStatus?.color || "#e5e7eb",
                          }}
                        >
                          {task.taskStatus?.taskStatus}
                        </span>
                      </div>

                      {/* Task Description */}
                      <p className="text-sm px-1 text-muted-foreground mb-1">
                        {task.taskDescription || "-"}
                      </p>

                      {/* Task Info */}
                      <div className="flex px-1 flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Deadline:</span>
                          <span>
                            {task.taskDeadline
                              ? format(
                                  new Date(task.taskDeadline),
                                  "dd/MM/yyyy h:mm a",
                                )
                              : "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">Assignees:</span>
                          <div className="flex gap-1 flex-wrap">
                            {task.assignees.map((a) => (
                              <TooltipProvider key={a.employeeId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-7 w-7 rounded-full bg-gray-200 text-xs flex items-center justify-center font-medium cursor-default">
                                      {getInitials(a.employeeName)}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {a.employeeName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No Tasks Found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </FormProvider>
  );
};

export default ProjectView;

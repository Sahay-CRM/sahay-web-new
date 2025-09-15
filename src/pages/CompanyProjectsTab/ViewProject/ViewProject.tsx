import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { EditIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
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
import ProjectTaskList from "./projectTaskList";
// import SearchDropdown from "@/components/shared/Form/SearchDropdown";
// import FormDateTimePicker from "@/components/shared/FormDateTimePicker/formDateTimePicker";

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
    // methods,
    // taskPermission,
    permission,
    // setIsAddTaskOpen,
    // isAddTaskOpen,
    // taskTypeOptions,
    // setIsTypeSearch,
    // meetingDataOption,
    // setIsMeetingSearch,
    // taskStatusOptions,
    // setIsStatusSearch,
    // employeeOption,
    // onSubmittask,
    projectId,
    // control,
    // register,
    // setValue,
    // errors,
  } = useViewProject();

  // const { reset } = methods;
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");

  const commentsData = useGetProjectComments(projectId || "");
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
    // reset({ comment: "" });
  };
  const methods = useForm();

  const project = projectApiData?.data;
  if (!project) return null;

  // const tasks = project.ProjectTasks || [];

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

          <div className="bg-white p-5 h-[calc(100vh-450px)] overflow-auto rounded-xl shadow-md flex flex-col">
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

            <div className="overflow-auto">
              <div className="space-y-2 pr-2">
                {commentsData.isLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Loading comments...
                  </p>
                ) : commentsData.data?.length ? (
                  [...commentsData.data]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((comment) => (
                      <div
                        key={comment.projectCommentId}
                        className="group relative rounded-md border bg-muted/40 px-3 py-2 text-sm shadow-sm"
                      >
                        {/* Header: Name + Date + Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              {comment.employeeName || "Unknown User"}
                            </span>
                          </div>

                          {/* Edit/Delete buttons */}
                          <div className="flex gap-1 ">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "Pp")}
                            </span>
                          </div>
                        </div>

                        {/* Comment Body */}
                        <div className="mt-1">
                          {editingCommentId === comment.projectCommentId ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-sm"
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
                            <div className="flex items-center justify-between  ">
                              <p className="text-sm text-gray-700">
                                {comment.comment}
                              </p>
                              <div className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    handleDeleteComment(
                                      comment.projectCommentId,
                                    )
                                  }
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
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
            </div>
          </div>
        </div>

        <ProjectTaskList />
      </div>
    </FormProvider>
  );
};

export default ProjectView;

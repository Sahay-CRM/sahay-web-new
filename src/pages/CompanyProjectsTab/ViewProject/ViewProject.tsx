import { FormProvider, useForm } from "react-hook-form";
import { EditIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import ProjectTaskList from "./projectTaskList";
import useViewProject from "./useViewProject";

import { useEffect } from "react";
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
    permission,
    editingText,
    setEditingText,
    editingCommentId,
    showAll,
    setShowAll,
    newComment,
    setNewComment,
    showCommentInput,
    setShowCommentInput,
    commentsData,
    onSubmitComment,
    handleDeleteComment,
    handleCancelEdit,
    handleSaveComment,
    handleEditComment,
    isPending,
    setShowFull,
    showFull,
  } = useViewProject();
  const methods = useForm();
  useEffect(() => {
    if (projectApiData?.data?.projectStatus?.projectStatusId) {
      methods.reset({
        projectStatus: projectApiData.data?.projectStatus.projectStatusId,
      });
    }
  }, [methods, projectApiData]);

  const project = projectApiData?.data;
  if (!project) return null;

  // const tasks = project.ProjectTasks || [];
  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 p-4  lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="bg-white h-85 p-5    rounded-2xl shadow-md flex flex-col">
            <div className="flex mb-3 flex-col sm:flex-row sm:justify-between sm:items-start  ">
              <div>
                <h1 className="text-xl font-bold">{project.projectName}</h1>
              </div>

              {permission?.Edit && (
                <Button
                  size="sm"
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-5">
              {/* Description */}
              <div className="text-sm text-gray-500">
                <p
                  className={`transition-all ${
                    showFull ? " overflow-y-auto pr-2" : "line-clamp-2"
                  }`}
                >
                  {project.projectDescription || "-"}
                </p>

                {project.projectDescription &&
                  project.projectDescription.length > 70 && (
                    <button
                      className="text-xs text-primary hover:underline mt-1"
                      onClick={() => setShowFull(!showFull)}
                    >
                      {showFull ? "Show less" : "Show more"}
                    </button>
                  )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-500">
                      Created By:
                    </span>
                    <span className="font-semibold">
                      {project.createdBy?.employeeName || "-"}
                    </span>
                  </div>

                  {project.projectDeadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-500">
                        Deadline:
                      </span>
                      <span className="font-semibold">
                        {format(
                          new Date(project.projectDeadline),
                          "dd/MM/yyyy h:mm a",
                        )}
                      </span>
                    </div>
                  )}

                  {(project.ProjectParameters?.subParameters?.length ?? 0) >
                    0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Key Result Areas :
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.ProjectParameters?.subParameters.map((sub) => (
                          <Badge
                            key={sub.projectSubParameterId}
                            variant="secondary"
                            className="text-sm px-2 "
                          >
                            {sub.subParameterName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Project Status
                  </p>
                  <FormSelect
                    value={project.projectStatusId}
                    onChange={(val) => handleStatusChange(val as string)}
                    options={statusOptions}
                    triggerClassName="mb-0 py-4"
                    // className="h-9"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Assignees
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(showAll
                        ? project.ProjectEmployees
                        : project?.ProjectEmployees?.slice(0, 10)
                      )?.map((emp, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="rounded-full h-6 w-6 bg-gray-200 text-xs flex items-center justify-center font-medium">
                                {getInitials(emp.employeeName)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>{emp.employeeName}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {project?.ProjectEmployees &&
                        !showAll &&
                        project.ProjectEmployees.length > 10 && (
                          <span
                            className="rounded-full h-6 w-6 bg-gray-300 text-xs flex items-center justify-center font-medium cursor-pointer"
                            onClick={() => setShowAll(true)}
                          >
                            +{project.ProjectEmployees.length - 10}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 h-[calc(100vh-480px)]  rounded-xl shadow-md flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Updates</h2>
              <Button onClick={() => setShowCommentInput((v) => !v)}>
                {showCommentInput ? "Cancel" : "Add Updates"}
              </Button>
            </div>

            {showCommentInput && (
              <div className="mb-4">
                <FormInputField
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter Update .."
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
                    Loading Updates...
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
                    No Updates Found
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

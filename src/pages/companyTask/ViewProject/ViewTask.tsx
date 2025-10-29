import { Calendar, EditIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import useViewTask from "./useViewTask";
import { Controller, FormProvider } from "react-hook-form";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useEffect, useState } from "react";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "@/pages/PageNoAccess";
import { getInitials } from "@/features/utils/app.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SpinnerIcon } from "@/components/shared/Icons";

export default function CompanyTaskView() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: "View Task", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const {
    taskApiData,
    navigate,
    statusOptions,
    handleStatusChange,
    methods,
    permission,
    isPending,
    commentsData,
    editingCommentId,
    setShowCommentInput,
    onSubmitComment,
    handleDeleteComment,
    handleCancelEdit,
    handleEditComment,
    handleSaveComment,
    showCommentInput,
    setEditingText,
    editingText,
    newComment,
    setNewComment,
  } = useViewTask();

  const taskData = taskApiData?.data;
  const [showAll, setShowAll] = useState(false);
  if (!taskData) return null;

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="p-6">
        {/* <h1 className="font-semibold capitalize text-xl text-black mb-2">
          Company Task Overview
        </h1> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm h-fit border text-sm">
            <div className="flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold">{taskData.taskName}</h1>
                <p className="text-sm text-gray-500 mt-2">
                  {taskData.taskDescription || "-"}
                </p>
              </div>
              {permission?.Edit && (
                <Button
                  onClick={() =>
                    navigate(`/dashboard/tasks/edit/${taskData?.taskId}`)
                  }
                >
                  Edit Task
                </Button>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Controller
                    name="taskStatus"
                    control={methods?.control}
                    render={({ field, fieldState }) => (
                      <FormSelect
                        {...field}
                        value={field.value}
                        options={statusOptions}
                        error={fieldState.error}
                        onChange={(ele) => {
                          if (typeof ele === "string") {
                            handleStatusChange(ele);
                          }
                        }}
                        disabled={permission.Edit === false}
                      />
                    )}
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {taskData.taskDeadline
                      ? format(new Date(taskData.taskDeadline), "Pp")
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assignees</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(showAll
                      ? taskData.assignUsers
                      : taskData?.assignUsers?.slice(0, 10)
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
                    {taskData?.assignUsers &&
                      !showAll &&
                      taskData.assignUsers.length > 10 && (
                        <span
                          className="rounded-full h-6 w-6 bg-gray-300 text-xs flex items-center justify-center font-medium cursor-pointer"
                          onClick={() => setShowAll(true)}
                        >
                          +{taskData.assignUsers.length - 10}
                        </span>
                      )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Created By
                  </p>
                  <p className="text-base font-medium">
                    {taskData.createdBy?.employeeName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Task Type
                  </p>
                  <p className="text-base font-medium">
                    {taskData.taskTypeName || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className=" p-5 bg-white border rounded-xl shadow-sm flex flex-col max-h-[calc(100vh-150px)] overflow-auto ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Comments</h2>
              {permission.Edit && (
                <Button onClick={() => setShowCommentInput((v) => !v)}>
                  {showCommentInput ? "Cancel" : "Add Comment"}
                </Button>
              )}
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

            <div className="space-y-2 pr-2 overflow-y-auto">
              {commentsData.isLoading ? (
                <div className="flex items-center animate-spin gap-2 text-sm text-muted-foreground">
                  <SpinnerIcon />
                </div>
              ) : commentsData.data?.length ? (
                [...commentsData.data]
                  .sort(
                    (a, b) =>
                      new Date(b.createdDatetime).getTime() -
                      new Date(a.createdDatetime).getTime(),
                  )
                  .map((comment) => (
                    <div
                      key={comment.taskCommentId}
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
                            {format(new Date(comment.createdDatetime), "Pp")}
                          </span>
                        </div>
                      </div>

                      {/* Comment Body */}
                      <div className="mt-1">
                        {editingCommentId === comment.taskCommentId ? (
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
                                handleSaveComment(comment.taskCommentId)
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
                                    comment.taskCommentId,
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
                                  handleDeleteComment(comment.taskCommentId)
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
                  No Comment Found
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

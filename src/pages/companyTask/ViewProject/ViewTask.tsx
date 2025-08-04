import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import useViewTask from "./useViewTask";
import { Controller, FormProvider } from "react-hook-form";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useEffect, useState } from "react";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "@/pages/PageNoAccess";

export default function CompanyTaskView() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Task", href: "/dashboard/tasks" },
      { label: "View Task", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const {
    taskApiData,
    navigate,
    statusOptions,
    handleStatusChange,
    methods,
    permission,
  } = useViewTask();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;
  const taskData = taskApiData?.data;
  const addUpdateCompanyTask = useAddUpdateCompanyTask();

  if (!taskData) return null;

  const onSubmitComment = (data: AddUpdateTask) => {
    if (!data.comment) return;
    addUpdateCompanyTask.mutate({
      taskId: taskData.taskId,
      comment: data.comment,
    });
    setShowCommentInput(false);
    reset({ comment: "" });
  };

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <h1 className="font-semibold capitalize text-xl text-black mb-2">
        Company Task Overview
      </h1>
      <div className="p-6 bg-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-muted-foreground text-md font-medium">
                  Task Name:
                </p>
                <h2 className="text-xl font-semibold text-primary">
                  {taskData.taskName}
                </h2>
              </div>
              {permission?.Edit && (
                <Button
                  onClick={() => {
                    navigate(`/dashboard/tasks/edit/${taskData?.taskId}`);
                  }}
                >
                  Edit Task
                </Button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground text-md font-medium">
                Description:
              </p>
              <p className="text-md font-medium">{taskData.taskDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Status:
                  </p>
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
                      />
                    )}
                  />
                </div>
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Deadline:
                  </p>
                  <div className="flex items-center gap-2 text-md font-semibold">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {taskData.taskDeadline
                      ? format(new Date(taskData.taskDeadline), "PPP p")
                      : "-"}
                  </div>
                </div>
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Actual End Date:
                  </p>
                  <div className="flex items-center gap-2 text-md font-semibold">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {taskData.taskActualEndDate
                      ? format(new Date(taskData.taskActualEndDate), "PPP p")
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Assignees:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {taskData.assignUsers?.map((emp) => (
                      <Badge
                        key={emp.employeeId}
                        variant="secondary"
                        className="mt-1 text-md font-semibold bg-primary text-white"
                      >
                        {emp.employeeName}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Created By:
                  </p>
                  {/* <p className="text-md font-semibold mt-1">
                    {taskData.createdByEmployee?.employeeName || "-"}
                  </p> */}
                </div>
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Task Type:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="mt-1 text-md font-semibold"
                    >
                      {taskData.taskTypeName || "-"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea>
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Comments</h2>
                <Button onClick={() => setShowCommentInput((v) => !v)}>
                  {showCommentInput ? "Cancel" : "Add Comment"}
                </Button>
              </div>
              {showCommentInput && (
                <form onSubmit={handleSubmit(onSubmitComment)} className="mb-4">
                  <FormInputField
                    label="Comment"
                    {...register("comment", {
                      required: "Comment is required",
                    })}
                    error={errors.comment}
                  />
                  <Button type="submit" className="mt-2">
                    Submit
                  </Button>
                </form>
              )}
              <div className="space-y-4 pr-2 overflow-y-auto">
                {taskData.comments?.length > 0 ? (
                  [...taskData.comments]
                    .sort(
                      (a: TaskComment, b: TaskComment) =>
                        new Date(b.commentDate).getTime() -
                        new Date(a.commentDate).getTime(),
                    )
                    .map((comment: TaskComment) => (
                      <div
                        key={comment.commentDate + comment.employeeId}
                        className="rounded-lg border bg-muted/30 p-4 text-md shadow-sm"
                      >
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium text-muted-foreground">
                            {comment.employeeName || "Unknown User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.commentDate), "PPP p")}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-md">{comment.comment}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <span className="font-medium text-center text-muted-foreground">
                    No Comments Found
                  </span>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </FormProvider>
  );
}

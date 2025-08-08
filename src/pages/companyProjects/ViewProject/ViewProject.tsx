import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import useViewProject from "./useViewProject";
import { Controller, FormProvider } from "react-hook-form";
import FormSelect from "@/components/shared/Form/FormSelect";
import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
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
    methods,
    taskPermission,
    permission,
  } = useViewProject();

  const projectData = projectApiData?.data;
  if (!projectData) return null;
  const tasks = projectData?.ProjectTasks || [];

  return (
    <FormProvider {...methods}>
      <div className="p-4">
        <h1 className="font-semibold capitalize text-xl text-black mb-2">
          Project Overview
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Project Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-muted-foreground text-md font-medium">
                  Project Name:
                </p>
                <h2 className="text-xl font-semibold text-primary">
                  {projectData.projectName}
                </h2>
              </div>
              {permission?.Edit && (
                <Button
                  onClick={() => {
                    navigate(
                      `/dashboard/projects/edit/${projectData?.projectId}?source=view`,
                    );
                  }}
                >
                  Edit Project
                </Button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground text-md font-medium">
                Description:
              </p>
              <p className="text-md font-medium">
                {projectData.projectDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Status:
                  </p>
                  <Controller
                    name="projectStatus"
                    control={methods?.control}
                    render={({ field, fieldState }) => (
                      <FormSelect
                        {...field}
                        value={field.value}
                        options={statusOptions}
                        error={fieldState.error}
                        onChange={(ele) => {
                          handleStatusChange(ele as string);
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
                    {projectData.projectDeadline
                      ? format(new Date(projectData.projectDeadline), "PPP p")
                      : "-"}
                  </div>
                </div>

                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Actual End Date:
                  </p>
                  <div className="flex items-center gap-2 text-md font-semibold">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {projectData.projectActualEndDate
                      ? format(
                          new Date(projectData.projectActualEndDate),
                          "PPP p",
                        )
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Created By:
                  </p>
                  <p className="text-md font-semibold mt-1">
                    {/* Replace with actual creator name if available */}-
                  </p>
                </div>

                <div>
                  <p className="text-md text-muted-foreground font-medium">
                    Project Key Result Area:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {projectData.ProjectParameters?.subParameters?.map(
                      (sub) => (
                        <Badge
                          key={sub.projectSubParameterId}
                          variant="secondary"
                          className="mt-1 text-md font-semibold"
                        >
                          {sub.subParameterName}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-md text-muted-foreground font-medium">
                Assignee:
              </p>
              <div className="flex gap-2 flex-wrap">
                {projectData.ProjectEmployees?.map((emp) => (
                  <Badge
                    key={emp.employeeId}
                    variant="secondary"
                    className="mt-1 text-sm font-semibold bg-primary text-white"
                  >
                    {emp.employeeName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Task List */}
          <ScrollArea>
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                {taskPermission.Add && (
                  <Link to="/dashboard/tasks/add">
                    <Button className="py-2 w-fit">Add Task</Button>
                  </Link>
                )}
              </div>
              <div className="space-y-4 pr-2 overflow-y-auto">
                {tasks?.length > 0 ? (
                  <>
                    {tasks.map((task) => (
                      <div
                        key={task.taskId}
                        className={`rounded-lg border bg-muted/30 p-4 text-md shadow-sm ${
                          taskPermission.View ? "cursor-pointer" : ""
                        }`}
                        {...(taskPermission.View
                          ? {
                              onClick: () =>
                                navigate(
                                  `/dashboard/tasks/view/${task.taskId}`,
                                ),
                            }
                          : {})}
                      >
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium text-muted-foreground">
                            Task Name:
                          </span>
                          <h3 className="text-base font-semibold text-primary">
                            {task.taskName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 mb-4">
                          <span className="font-medium text-muted-foreground">
                            Description:
                          </span>
                          <span>-</span> {/* Replace if you have description */}
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {/* Left Column */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">
                                Deadline:
                              </span>
                              <span>
                                {task.taskDeadline
                                  ? format(new Date(task.taskDeadline), "PPP p")
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-muted-foreground">
                                Assignees:
                              </span>
                              {task.assignees.map((a) => (
                                <Badge
                                  key={a.employeeId}
                                  variant="outline"
                                  className="text-md"
                                >
                                  {a.employeeName}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">
                                Task Type:
                              </span>
                              <span>-</span> {/* Replace if available */}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">
                                Status:
                              </span>
                              <span>{task.taskStatus.taskStatus}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <span className="font-medium text-center text-muted-foreground">
                    No Task Found
                  </span>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </FormProvider>
  );
};

export default ProjectView;

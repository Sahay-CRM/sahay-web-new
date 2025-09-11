import { useEffect } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import useViewProject from "./useViewProject";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

const ProjectView = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { id: projectId } = useParams();

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

  const project = projectApiData?.data;
  if (!project) return null;

  const tasks = project.ProjectTasks || [];

  const safeDate = (d?: string | null) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.getFullYear() <= 1970 ? "-" : format(date, "PP");
  };

  const formattedDeadline =
    project.projectDeadline && project.projectDeadline !== "1970-01-01T00:00:00"
      ? format(
          new Date(project.projectDeadline as string | number | Date),
          "PPP",
        )
      : "-";

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= Project Overview ================= */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.projectName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
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

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Status
                </p>
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
              </div>
              {project.projectDeadline && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Deadline
                  </p>
                  <p className="text-md font-semibold mt-1">
                    {formattedDeadline}
                  </p>
                </div>
              )}
            </div>

            <div className="">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Created By
                </p>
                <p className="mt-1 font-semibold">
                  {project.createdBy?.employeeName || "-"}
                </p>
              </div>
              {(project.ProjectParameters?.subParameters?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Key Result Areas
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.ProjectParameters?.subParameters.map((sub) => (
                      <Badge
                        key={sub.projectSubParameterId}
                        variant="secondary"
                      >
                        {sub.subParameterName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Assignees
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.ProjectEmployees?.map((emp) => (
                    <Badge
                      key={emp.employeeId}
                      className="bg-primary text-white"
                    >
                      {emp.employeeName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            {taskPermission.Add && (
              <Link to={`/dashboard/tasks/add?projectId=${projectId}`}>
                <Button>Add Task</Button>
              </Link>
            )}
          </div>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4">
              {tasks.length ? (
                tasks.map((task) => (
                  <div
                    key={task.taskId}
                    onClick={() =>
                      taskPermission.View &&
                      navigate(`/dashboard/tasks/view/${task.taskId}`)
                    }
                    className="p-5 rounded-xl border hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{task.taskName}</h3>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: task.taskStatus?.color || "#e5e7eb",
                        }}
                      >
                        {task.taskStatus?.taskStatus}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {task.taskDescription || "-"}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Deadline:</span>
                        <span>{safeDate(task.taskDeadline)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Assignees:</span>
                        <div className="flex gap-1 flex-wrap">
                          {task.assignees.map((a) => (
                            <Badge key={a.employeeId} variant="outline">
                              {a.employeeName}
                            </Badge>
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

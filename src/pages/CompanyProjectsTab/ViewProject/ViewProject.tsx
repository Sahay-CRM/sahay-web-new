import { FormProvider, useForm } from "react-hook-form";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import { EditIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useSelector } from "react-redux";
import FormSelect from "@/components/shared/Form/FormSelect";
import SearchDropdown from "@/components/shared/Form/SearchDropdown/searchDropdown";

const ProjectView = () => {
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
    filteredComments,
    filterUserId,
    setFilterUserId,
    onSubmitComment,
    handleDeleteComment,
    handleCancelEdit,
    handleSaveComment,
    handleEditComment,
    isPending,
    setShowFull,
    showFull,
    currentUserId,
  } = useViewProject();

  const { setBreadcrumbs } = useBreadcrumbs();
  const companiesList = useSelector(getCompaniesList);
  const currentCompany = companiesList?.find((c) => c.isCurrentCompany);
  const resourceCompanyId = projectApiData?.data?.companyId;
  const isAuthorized =
    !resourceCompanyId || resourceCompanyId === currentCompany?.companyId;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Company Project", href: "/dashboard/projects" },
      { label: "View Company Project", href: "" },
      ...(isAuthorized && projectApiData?.data?.projectName
        ? [
            {
              label: `${projectApiData.data.projectName}`,
              href: "",
              isHighlight: true,
            },
          ]
        : []),
    ]);
  }, [setBreadcrumbs, isAuthorized, projectApiData?.data?.projectName]);
  const methods = useForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionTarget, setMentionTarget] = useState<"new" | "edit">("new");

  const project = projectApiData?.data;
  const otherEmployees = project?.otherEmployee || [];

  const filteredEmployees = mentionQuery
    ? otherEmployees.filter((emp: Employee) =>
        emp.employeeName?.toLowerCase().includes(mentionQuery?.toLowerCase()),
      )
    : otherEmployees;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "new" | "edit",
  ) => {
    const value = e.target.value;
    const pos = e.target.selectionStart || 0;

    if (target === "new") setNewComment(value);
    else setEditingText(value);

    setCursorPosition(pos);
    setMentionTarget(target);

    const textBeforeCursor = value.slice(0, pos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const query = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!query.includes(" ")) {
        setMentionQuery(query);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && filteredEmployees.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredEmployees.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredEmployees.length) % filteredEmployees.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleMentionSelect(filteredEmployees[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    }
  };

  const handleMentionSelect = (employee: Employee) => {
    const currentValue = mentionTarget === "new" ? newComment : editingText;
    const textBeforeAt = currentValue.slice(
      0,
      currentValue.lastIndexOf("@", cursorPosition - 1),
    );
    const textAfterMention = currentValue.slice(cursorPosition);
    const updatedValue = `${textBeforeAt}@${employee.employeeName} ${textAfterMention}`;

    if (mentionTarget === "new") setNewComment(updatedValue);
    else setEditingText(updatedValue);

    setShowMentions(false);

    // Set focus back and move cursor
    setTimeout(() => {
      const activeInput =
        mentionTarget === "new"
          ? inputRef.current
          : (document.activeElement as HTMLInputElement);
      if (activeInput) {
        activeInput.focus();
        const newPos = textBeforeAt.length + employee.employeeName.length + 2;
        if ("setSelectionRange" in activeInput) {
          (activeInput as HTMLInputElement).setSelectionRange(newPos, newPos);
        }
      }
    }, 0);
  };

  useEffect(() => {
    if (projectApiData?.data?.projectStatus?.projectStatusId) {
      methods.reset({
        projectStatus: projectApiData.data?.projectStatus.projectStatusId,
      });
    }
  }, [methods, projectApiData]);

  if (!project) return null;

  // const tasks = project.ProjectTasks || [];
  return (
    <CompanyAccessGuard
      companyId={resourceCompanyId}
      isLoading={!projectApiData}
    >
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
                        {project.createdBy || "-"}
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
                          {project.ProjectParameters?.subParameters.map(
                            (sub) => (
                              <Badge
                                key={sub.projectSubParameterId}
                                variant="secondary"
                                className="text-sm px-2 "
                              >
                                {sub.subParameterName}
                              </Badge>
                            ),
                          )}
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
                      disabled={permission.Edit === false}
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
                              <TooltipContent>
                                {emp.employeeName}
                              </TooltipContent>
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
                <div className="flex items-center gap-2">
                  <SearchDropdown
                    placeholder="Filter Tagged"
                    options={[
                      { label: "All", value: "all" },
                      ...(otherEmployees.map((emp: Employee) => ({
                        label: emp.employeeName,
                        value: emp.employeeId,
                      })) || []),
                    ]}
                    selectedValues={[filterUserId]}
                    onSelect={(item) => setFilterUserId(item.value)}
                    onSearchChange={() => {}}
                    className="w-48"
                  />
                  {permission.Edit && (
                    <Button onClick={() => setShowCommentInput((v) => !v)}>
                      {showCommentInput ? "Cancel" : "Add Updates"}
                    </Button>
                  )}
                </div>
              </div>

              {showCommentInput && (
                <div className="mb-4 relative">
                  <Popover open={showMentions && filteredEmployees.length > 0}>
                    <PopoverAnchor asChild>
                      <div className="w-full">
                        <FormInputField
                          ref={inputRef}
                          value={newComment}
                          onChange={(e) => handleInputChange(e, "new")}
                          onKeyDown={(e) => handleKeyDown(e)}
                          placeholder="Enter Update .. (Use @ to tag)"
                        />
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="p-1 w-64 max-h-60 overflow-y-auto"
                      side="bottom"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col">
                        {filteredEmployees.map(
                          (emp: Employee, index: number) => (
                            <button
                              key={emp.employeeId}
                              className={`flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                                index === selectedIndex
                                  ? "bg-muted"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => handleMentionSelect(emp)}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {getInitials(emp.employeeName)}
                              </div>
                              <span>{emp.employeeName}</span>
                            </button>
                          ),
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    className="mt-2"
                    disabled={isPending}
                    onClick={() => {
                      const tagPerson = otherEmployees
                        .filter((emp: Employee) =>
                          newComment.includes(`@${emp.employeeName}`),
                        )
                        .map((emp: Employee) => emp.employeeId);
                      onSubmitComment(tagPerson);
                    }}
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
                  ) : filteredComments?.length ? (
                    [...filteredComments]
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
                                <Popover
                                  open={
                                    showMentions &&
                                    mentionTarget === "edit" &&
                                    filteredEmployees.length > 0
                                  }
                                >
                                  <PopoverAnchor asChild>
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        autoFocus
                                        value={editingText}
                                        onChange={(e) =>
                                          handleInputChange(e, "edit")
                                        }
                                        onKeyDown={(e) => handleKeyDown(e)}
                                        className="w-full border rounded px-2 py-1 text-sm focus:outline-primary"
                                      />
                                    </div>
                                  </PopoverAnchor>
                                  <PopoverContent
                                    className="p-1 w-64 max-h-60 overflow-y-auto"
                                    side="bottom"
                                    align="start"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                  >
                                    <div className="flex flex-col">
                                      {filteredEmployees.map(
                                        (emp: Employee, index: number) => (
                                          <button
                                            key={emp.employeeId}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                                              index === selectedIndex
                                                ? "bg-muted"
                                                : "hover:bg-muted"
                                            }`}
                                            onClick={() =>
                                              handleMentionSelect(emp)
                                            }
                                            onMouseEnter={() =>
                                              setSelectedIndex(index)
                                            }
                                          >
                                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                              {getInitials(emp.employeeName)}
                                            </div>
                                            <span>{emp.employeeName}</span>
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const tagPerson = otherEmployees
                                      .filter((emp: Employee) =>
                                        editingText.includes(
                                          `@${emp.employeeName}`,
                                        ),
                                      )
                                      .map((emp: Employee) => emp.employeeId);
                                    handleSaveComment(
                                      comment.projectCommentId,
                                      tagPerson,
                                    );
                                  }}
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
                                  {comment.employeeId === currentUserId && (
                                    <>
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
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                      </button>
                                    </>
                                  )}
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
    </CompanyAccessGuard>
  );
};

export default ProjectView;

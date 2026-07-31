import { FormProvider, useForm } from "react-hook-form";
import CompanyAccessGuard from "@/components/shared/CompanyAccessGuard/CompanyAccessGuard";
import { getCompaniesList } from "@/features/selectors/company.selector";
import { EditIcon, TrashIcon,  ChevronRight, ChevronDown, Folder, Maximize2, Minimize2 } from "lucide-react";
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
import { getInitials, formatToLocalDateTime, formatUTCDateToLocal } from "@/features/utils/app.utils";
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

type TreeNode = CompanyProjectDataProps;

const SubProjectTreeNode = ({
  node,
  level,
  expandedIds,
  onToggle,
  activeProjectId,
  setActiveProjectId,
}: {
  node: TreeNode;
  level: number;
  expandedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
}) => {
  const hasChildren = node.companyProjectMasters && node.companyProjectMasters.length > 0;
  const isExpanded = !!expandedIds[node.projectId!];
  const isSelected = activeProjectId === node.projectId;

  return (
    <div className="w-full select-none">
      {/* Node Row */}
      <div 
        onClick={() => setActiveProjectId(node.projectId!)}
        className={`flex items-center justify-between py-0.5 px-2 rounded-lg transition duration-150 group cursor-pointer border ${
          isSelected 
            ? "bg-slate-100 border-slate-200" 
            : "hover:bg-slate-50 border-transparent"
        }`}
      >
        {/* Name Column */}
        <div className="flex items-center min-w-0 flex-1 gap-1.5">
          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.projectId!);
              }}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded transition"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Title & Description */}
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-semibold truncate ${
              isSelected ? "text-primary" : "text-slate-800"
            }`}>
              {node.projectName}
            </span>
          </div>
        </div>

        {/* Status Column */}
        <div className="w-36 flex-shrink-0 flex justify-start pl-2">
          <span 
            className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
            style={{ 
              backgroundColor: `${node.color || '#3b82f6'}15`, 
              color: node.color || '#3b82f6' 
            }}
          >
            {node.projectStatus?.projectStatus || (typeof node.projectStatus === 'string' ? node.projectStatus : 'Yet to start')}
          </span>
        </div>

        {/* Deadline Column */}
        <div className="w-28 flex-shrink-0 flex items-center justify-start text-[12px] text-slate-500">
          <span>{node.projectDeadline ? formatUTCDateToLocal(node.projectDeadline) : '-'}</span>
        </div>

        
      </div>

      {/* Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="pl-4 border-l border-dashed border-slate-200 ml-[9px] mt-0.5 space-y-0.5 relative">
          {node.companyProjectMasters?.map((child) => (
            <div key={child.projectId} className="relative">
              <SubProjectTreeNode
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
    subProjectsRes,
    subProjectsLoading,
    activeProjectId,
    setActiveProjectId,
    effectiveProjectId,
    selectedProjectData,
    selectedProjectLoading,
  } = useViewProject();

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const ids: Record<string, boolean> = {};
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.projectId) {
          ids[n.projectId] = true;
          if (n.companyProjectMasters) {
            collectIds(n.companyProjectMasters);
          }
        }
      });
    };
    collectIds(subProjectsList);
    setExpandedIds(ids);
  };

  const handleCollapseAll = () => {
    setExpandedIds({});
  };

  const [isMaximized, setIsMaximized] = useState(false);

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

  const getSubProjectsList = (): TreeNode[] => {
    if (!subProjectsRes?.data) return [];
    if (Array.isArray(subProjectsRes.data)) {
      return subProjectsRes.data;
    }
    const data = subProjectsRes.data;
    if (data.projectId === project?.projectId) {
      return (data.companyProjectMasters as TreeNode[]) || [];
    }
    return [data] as TreeNode[];
  };

  const subProjectsList = getSubProjectsList();

  const activeProject = activeProjectId 
    ? selectedProjectData?.data 
    : project;

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
        <div className="relative w-full h-[calc(100vh-110px)] overflow-hidden">
          <div className="grid grid-cols-1 p-4 lg:grid-cols-2 gap-8 h-full">
          <div className="space-y-5 h-full flex flex-col overflow-hidden px-1.5 py-1">
            <div className="bg-white h-70 p-5 rounded-2xl shadow-md flex flex-col flex-shrink-0">
              <div className="flex mb-3 flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">{project.projectName}</h1>
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
                          {formatToLocalDateTime(project.projectDeadline)}
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

            {/* Backdrop for Maximized Tree */}
            {isMaximized && (
              <div 
                className="absolute inset-0 bg-slate-50 z-[9998] rounded-2xl"
                onClick={() => setIsMaximized(false)}
              />
            )}

            {/* Project Structure Card */}
            <div 
              className={`bg-white p-5 rounded-2xl flex flex-col transition-all duration-300 flex-1 min-h-0 ${
                isMaximized 
                  ? "absolute inset-6 z-[9999] shadow-xl border border-slate-200" 
                  : "shadow-md"
              }`}
            >
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2 flex-shrink-0">
                <h2 className="text-xl font-semibold text-slate-800">Project Structure (Sub Projects)</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1.5 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      Exit Full Screen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      Full Screen
                    </>
                  )}
                </Button>
              </div>

              {/* Table Column Headers */}
              {subProjectsList.length > 0 && !subProjectsLoading && (
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 text-[11px] font-bold text-slate-400 select-none uppercase tracking-wider mb-0.5 flex-shrink-0">
                  <span className="flex-1">Project Name</span>
                  <span className="w-36 text-left pl-2">Status</span>
                  <span className="w-28 text-left">Deadline</span>
                  <span className="w-6"></span>
                </div>
              )}

              <div className="flex-1 overflow-auto pr-2 space-y-0.5 mt-0.5">
                {subProjectsLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Loading Project Structure...
                  </p>
                ) : subProjectsList.length > 0 ? (
                  <div className="space-y-0.5">
                    {subProjectsList.map((node) => (
                      <SubProjectTreeNode
                        key={node.projectId}
                        node={node}
                        level={0}
                        expandedIds={expandedIds}
                        onToggle={handleToggleExpand}
                        activeProjectId={activeProjectId}
                        setActiveProjectId={setActiveProjectId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Folder className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="font-medium text-slate-500 text-sm">No Sub Projects Found</span>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                      Create sub-projects to build a nested hierarchy of work.
                    </p>
                  </div>
                )}
              </div>

              {subProjectsList.length > 0 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Showing 1 to {subProjectsList.length} of {subProjectsList.length} sub projects
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExpandAll}
                      className="hover:underline font-medium text-primary"
                    >
                      Expand All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleCollapseAll}
                      className="hover:underline font-medium text-primary"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5 h-full overflow-y-auto px-1.5 py-5 pb-8 flex flex-col">
            {/* Selected Project Info Card */}
            {activeProjectId && (
              <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col space-y-4 min-h-[160px] justify-center">
                {selectedProjectLoading ? (
                  <p className="text-muted-foreground text-sm text-center">
                    Loading project details...
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Selected Project
                        </span>
                        <h2 className="text-xl font-bold text-slate-800 mt-0.5">
                          {activeProject?.projectName}
                        </h2>
                        <p className="text-sm text-slate-500 line-clamp-3">
                        {activeProject?.projectDescription}
                      </p>
                      </div>
                      {/* {permission?.Edit && activeProject?.projectId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() =>
                            navigate(
                              `/dashboard/projects/edit/${activeProject.projectId}?source=view`,
                            )
                          }
                        >
                          Edit Info
                        </Button>
                      )} */}
                    </div>

                    {/* {activeProject?.projectDescription && ( */}
                    
                    {/* )} */}

                    <div className="grid grid-cols-1 p-5 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                        {activeProject?.projectStatusId && (
                          <FormSelect
                            value={activeProject.projectStatusId}
                            onChange={(val) => handleStatusChange(val as string, activeProject.projectId)}
                            options={statusOptions}
                            triggerClassName="mb-0 py-2 h-9"
                            disabled={permission.Edit === false}
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Deadline</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-2">
                          {activeProject?.projectDeadline ? formatToLocalDateTime(activeProject.projectDeadline) : "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assignees</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activeProject?.ProjectEmployees && activeProject.ProjectEmployees.length > 0 ? (
                            activeProject.ProjectEmployees.slice(0, 5).map((emp, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="rounded-full h-6 w-6 bg-slate-100 border border-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                                      {getInitials(emp.employeeName)}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {emp.employeeName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Unassigned</span>
                          )}
                          {activeProject?.ProjectEmployees && activeProject.ProjectEmployees.length > 5 && (
                            <span className="rounded-full h-6 w-6 bg-slate-200 border border-slate-300 text-[9px] flex items-center justify-center font-bold text-slate-700">
                              +{activeProject.ProjectEmployees.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tasks Card */}
            <ProjectTaskList activeProjectId={effectiveProjectId} className="h-auto flex-shrink-0" />

            {/* Updates Card */}
            <div className="bg-white p-5 rounded-xl shadow-md flex flex-col flex-shrink-0">
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
                <div className="mb-4 relative flex-shrink-0">
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

              <div className="flex-shrink-0 mt-3">
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
        </div>
        </div>
      </FormProvider>
    </CompanyAccessGuard>
  );
};

export default ProjectView;

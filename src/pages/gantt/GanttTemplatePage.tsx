import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";

import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { GanttTemplate } from "@/types/gantt";
import GanttCreateWorkspaceModal from "./components/GanttCreateWorkspaceModal";
import useGanttTemplate from "./useGanttTemplate";

export default function GanttTemplatePage() {
  const {
    // data
    templates,
    paginationDetails,
    isLoading,

    // filters
    paginationFilter,
    setPaginationFilter,
    ownerTypeFilter,
    handleOwnerTypeChange,

    // columns
    columnToggleOptions,
    visibleColumns,
    onToggleColumn,
    canToggleColumns,

    // use template modal
    useTemplateTarget,
    openUseModal,
    closeUseModal,

    // actions
    handleRowClick,
  } = useGanttTemplate();

  return (
    <div className="w-full h-full flex flex-col px-2 sm:px-4 py-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search templates..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-full"
          />

          <Select value={ownerTypeFilter} onValueChange={handleOwnerTypeChange}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="COMPANY">COMPANY</SelectItem>
              <SelectItem value="SYSTEM">SYSTEM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/gantt/workspaces">
            <Button variant="outline">Workspaces</Button>
          </Link>

          {canToggleColumns && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownSearchMenu
                      columns={columnToggleOptions}
                      onToggleColumn={onToggleColumn}
                      columnIcon={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-white">Toggle Visible Columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col rounded-md border border-slate-100">
        {!isLoading && templates.length === 0 ? (
          // ── Empty state ─────────────────────────────────────────────────────
          <div className="flex flex-col items-center justify-center h-full gap-3 py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No Templates Available</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Templates are created by the Admin. Once published, they will
              appear here and you can use them to generate workspaces.
            </p>
            <Link to="/dashboard/gantt/workspaces" className="mt-2">
              <Button variant="outline" size="sm">
                Go to Workspaces
              </Button>
            </Link>
          </div>
        ) : (
          <TableData
            tableHeightClass="flex-1"
            tableData={templates}
            columns={visibleColumns}
            primaryKey="ganttTemplateId"
            isActionButton={() => false}
            onRowClick={handleRowClick}
            paginationDetails={paginationDetails}
            isLoading={isLoading}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            permissionKey="ganttTemplateId"
            moduleKey="EMPLOYEE"
            sortableColumns={["templateName"]}
            actionColumnWidth="w-[150px]"
            customActions={(row) => {
              const t = row as unknown as GanttTemplate;
              if (!t.isPublished) return null;
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUseModal(t);
                        }}
                      >
                        <GitBranch className="w-3.5 h-3.5 mr-1" />
                        Use Template
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Create workspace from this template
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }}
          />
        )}
      </div>

      {/* Use Template Modal */}
      {useTemplateTarget && (
        <GanttCreateWorkspaceModal
          open={!!useTemplateTarget}
          onOpenChange={(v) => !v && closeUseModal()}
          templateId={useTemplateTarget.ganttTemplateId}
          templateName={useTemplateTarget.templateName}
        />
      )}
    </div>
  );
}

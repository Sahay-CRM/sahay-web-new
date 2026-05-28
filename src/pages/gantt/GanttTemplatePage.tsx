import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { GanttTemplate } from "@/types/gantt";
import GanttTemplateFormModal from "./components/GanttTemplateFormModal";
import useGanttTemplate from "./useGanttTemplate";

export default function GanttTemplatePage() {
  const {
    // data
    templates,
    paginationDetails,
    isLoading,
    refetch,

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

    // modals
    deleteTarget,
    editTarget,
    createOpen,
    openCreate,
    openEdit,
    openDelete,
    closeFormModal,
    closeDeleteModal,

    // actions
    handleToggleActive,
    handleDeleteTemplate,
    handleRowClick,
    deleteMutation,
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
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Template
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col rounded-md border border-slate-100">
        <TableData
          tableHeightClass="flex-1"
          tableData={templates}
          columns={visibleColumns}
          primaryKey="ganttTemplateId"
          isActionButton={() => true}
          onEdit={(row) => openEdit(row as GanttTemplate)}
          onRowClick={handleRowClick}
          onDelete={(row) => openDelete(row as GanttTemplate)}
          canDelete={() => true}
          paginationDetails={paginationDetails}
          isLoading={isLoading}
          setPaginationFilter={setPaginationFilter}
          searchValue={paginationFilter?.search}
          permissionKey="ganttTemplateId"
          moduleKey="EMPLOYEE"
          sortableColumns={["templateName"]}
          showActiveToggle={true}
          onToggleActive={(item) => handleToggleActive(item as GanttTemplate)}
          activeToggleKey="isActive"
          actionColumnWidth="w-[140px] overflow-hidden"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={closeDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete template &quot;
              {deleteTarget?.templateName}&quot;? This cannot be undone.
              Existing workspaces created from this template will not be
              affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Template Modal */}
      <GanttTemplateFormModal
        isModalOpen={createOpen || !!editTarget}
        modalClose={closeFormModal}
        onSuccess={() => refetch()}
        editData={editTarget}
      />
    </div>
  );
}

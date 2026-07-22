import { useMemo, useState } from "react";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { Plus, CalendarDays, Clock, ListTodo, Presentation, Layers, CheckCheck } from "lucide-react";

import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { Button } from "@/components/ui/button";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";
import useCheckIn from "./useCheckIn";
import AddEditCheckInModal from "./CheckInFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageNotAccess from "@/pages/PageNoAccess";

export default function CheckIn() {
  const {
    todayDate,
    filteredItems,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    totalItems,
    totalEstimatedTime,
    totalTasks,
    totalMeetings,
    isEditWindowExpired,
    permission,
    isAddModalOpen,
    setIsAddModalOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,

    handleConfirmDelete,
    isDeleting,
    handleSubmitPlan,
    isSubmitting,
  } = useCheckIn();

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "title", label: "Title", visible: true },
    { key: "type", label: "Type", visible: true },
    { key: "estimatedTimeFormatted", label: "Estimated Time", visible: true },
    { key: "remarks", label: "Remarks", visible: true },
  ]);

  const visibleColumns = useMemo(() => {
    return columnToggleOptions.reduce((acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    }, {} as Record<string, string>);
  }, [columnToggleOptions]);

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();



  const activePermission = useMemo(() => {
    return permission || {
      View: true,
      Add: true,
      Edit: true,
      Delete: true,
    };
  }, [permission]);

  if (activePermission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full flex flex-col px-2 sm:px-4 py-4 overflow-hidden">
        {/* Top Header Bar & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 shrink-0">
          <div>
            <SearchInput
              placeholder="Search planning..."
              searchValue={paginationFilter.search}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Date: {format(new Date(todayDate), "dd MMM yyyy")}</span>
            </div>

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

            {activePermission.Add && !isEditWindowExpired && (
              <>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="py-2 w-fit gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
                <Button
                  onClick={handleSubmitPlan}
                  disabled={totalItems === 0 || isSubmitting}
                  className="py-2 w-fit gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-none cursor-pointer"
                >
                  <CheckCheck className="h-4 w-4" />
                  Submit Plan
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4 shrink-0">
          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Total Items
              </p>
              <p className="text-lg font-bold text-slate-900">{totalItems}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Est. Time
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatMinutesToHours(totalEstimatedTime)}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Total Tasks
              </p>
              <p className="text-lg font-bold text-slate-900">{totalTasks}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>

          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Total Meetings
              </p>
              <p className="text-lg font-bold text-slate-900">{totalMeetings}</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <Presentation className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Main Table Data Container */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col tb:pt-4 border border-slate-200 rounded-lg">
          <TableData
            tableHeightClass="flex-1"
            tableData={filteredItems.map((item, index) => ({
              ...item,
              estimatedTimeFormatted: formatMinutesToHours(item.estimatedTime || 0),
              title: item.title || (item.type === "TASK" ? item.task?.taskName : item.meeting?.meetingName) || "-",
              srNo: index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="planItemId"
            onEdit={(row) => setEditingItem(row as unknown as DailyPlanItem)}
            onDelete={(row) => setDeletingItem(row as unknown as DailyPlanItem)}
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            isLoading={isLoading}
            permissionKey="daily-planning"
            moduleKey="DAILY_PLANNING"
            isEditDeleteShow={activePermission.Edit && !isEditWindowExpired}
            actionColumnWidth="w-[100px] overflow-hidden"
          />
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddEditCheckInModal
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
          />
        )}

        {/* Edit Modal */}
        {Boolean(editingItem) && (
          <AddEditCheckInModal
            open={Boolean(editingItem)}
            onOpenChange={(open) => !open && setEditingItem(null)}
            initialItem={editingItem}
          />
        )}

        {/* Delete Confirmation Modal */}
        {Boolean(deletingItem) && (
          <ConfirmDeleteModal
            open={Boolean(deletingItem)}
            onOpenChange={(open) => !open && setDeletingItem(null)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
          />
        )}
      </div>
    </FormProvider>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { Plus, Clock, ListTodo, Presentation, Layers, CheckCheck, AlertTriangle, Hourglass, ChevronLeft, ChevronRight } from "lucide-react";

import TableData, { ColumnConfig } from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SingleCalendarDatePicker from "@/components/shared/FormDateTimePicker/SingleCalendarDatePicker";
import { Button } from "@/components/ui/button";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";
import { isColorDark } from "@/features/utils/color.utils";
import useCheckIn from "./useCheckIn";
import AddEditCheckInModal from "./CheckInFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ConfirmSubmitPlanModal from "./ConfirmSubmitPlanModal";
import CalendarAddTaskDrawer from "@/pages/DailyPlanning/CalendarAddTaskDrawer";
import MeetingDrawer from "@/pages/companyTask/CompanyTaskFormModal/meetingDrawer";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";
import { getUserId, getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    selectedDate,
    setSelectedDate,
    minDate,
    maxDate,
    goToDate,
    shiftDay,
    items,
    filteredItems,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    totalItems,
    totalEstimatedTime,
    totalActualTime,
    totalTasks,
    totalMeetings,
    remainingTime,
    isOvertime,
    isEditWindowExpired,
    isSubmitted,
    permission,
    companyWorkingMinutes,
    isAddModalOpen,
    setIsAddModalOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    isSubmitModalOpen,
    setIsSubmitModalOpen,

    handleConfirmDelete,
    isDeleting,
    handleSubmitPlan,
    handleConfirmSubmitPlan,
    isSubmitting,
    isCompanyTimeDefined,
  } = useCheckIn();

  const navigate = useNavigate();
  const allPermissions = useSelector(getUserPermission);
  const canEditCompanyProfile = allPermissions?.COMPANY_PROFILE?.Edit;

  const { mutate: addItem } = useAddDailyPlanItem();
  const employeeId = useSelector(getUserId);
  const todayDateStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [isOpenTaskDrawer, setIsOpenTaskDrawer] = useState(false);
  const [isOpenMeetingDrawer, setIsOpenMeetingDrawer] = useState(false);

  const handleDirectSubmitPlanningItem = async (payload: {
    taskId?: string;
    meetingId?: string;
    ganttItemId?: string;
    estimatedTime: number;
    remarks: string;
    title: string;
  }) => {
    addItem(
      {
        employeeId,
        date: todayDateStr,
        type: payload.taskId ? "TASK" : payload.meetingId ? "MEETING" : "GANTT",
        title: payload.title,
        priority: "Medium",
        estimatedTime: payload.estimatedTime,
        remarks: payload.remarks || undefined,
        taskId: payload.taskId,
        meetingId: payload.meetingId,
        ganttItemId: payload.ganttItemId,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        },
      }
    );
  };

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "title", label: "Title", visible: true },
    { key: "type", label: "Type", visible: true },
    { key: "estimatedTimeFormatted", label: "Estimated Time", visible: true },
    { key: "actualTimeTimeFormatted", label: "Actual Time", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "remarks", label: "Remarks", visible: true },
  ]);

  const visibleColumns = useMemo(() => {
    return columnToggleOptions.reduce((acc, col) => {
      if (col.visible) {
        if (col.key === "status") {
          acc[col.key] = {
            label: col.label,
            render: (_value, item: any) => {
              const isInProgress = item.status === "PLANNED" && Boolean(item.startTime);
              const statusName = isInProgress
                ? "In Progress"
                : item.status === "PLANNED"
                ? "Planned"
                : item.status === "COMPLETED"
                ? "Completed"
                : item.status === "FORWARDED"
                ? "Forwarded"
                : "Cancelled";

              const color = isInProgress
                ? "#0ea5e9"
                : item.status === "PLANNED"
                ? "#eee100"
                : item.status === "COMPLETED"
                ? "#10b981"
                : item.status === "FORWARDED"
                ? "#3b82f6"
                : "#ef4444";

              const textColor = isColorDark(color) ? "#FFFFFF" : "#000000";

              return (
                <span
                  className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm select-none min-w-[100px] h-8 text-center"
                  style={{
                    backgroundColor: color,
                    color: textColor,
                  }}
                >
                  {statusName}
                </span>
              );
            },
          };
        } else if (col.key === "title") {
          acc[col.key] = {
            label: col.label,
            render: (_value, item: any) => {
              const displayTitle = item.title || (item.type === "TASK" ? item.task?.taskName : item.type === "MEETING" ? item.meeting?.meetingName : item.gantItem?.itemName) || "-";
              return (
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <span className="font-semibold text-slate-800 truncate" title={displayTitle}>
                    {displayTitle}
                  </span>
                  {item.isPlanned === false && (
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 shadow-2xs select-none shrink-0">
                      {item.type === "TASK" ? "Extra Task" : item.type === "MEETING" ? "Extra Meeting" : "Extra Gant Task"}
                    </span>
                  )}
                </div>
              );
            },
          };
        } else if (col.key === "type") {
          acc[col.key] = {
            label: col.label,
            render: (_value, item: any) => {
              return item.type === "TASK"
                ? "Task"
                : item.type === "MEETING"
                ? "Meeting"
                : item.type === "GANTT"
                ? "Gant Task"
                : item.type || "-";
            },
          };
        } else {
          acc[col.key] = col.label;
        }
      }
      return acc;
    }, {} as Record<string, string | ColumnConfig>);
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

 if (!isCompanyTimeDefined) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-50/30">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="inline-flex p-4 bg-primary/10 rounded-full text-primary">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            Working Hours Undefined
          </h3>

          <p className="text-slate-500 text-sm leading-relaxed">
            Company has not defined their start time and end time. Please
            provide this information first.
          </p>
        </div>

        {canEditCompanyProfile && (
          <Button
            onClick={() => navigate("/dashboard/company-profile")}
            >
            Go to Company Profile
          </Button>
        )}
      </div>
    </div>
  );
}

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full flex flex-col px-2 sm:px-4 py-4 overflow-hidden">
        {/* Top Header Bar & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchInput
              placeholder="Search planning..."
              searchValue={paginationFilter.search}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />

            {/* Date Switcher Box */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white  shadow-2xs">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => shiftDay(-1)}
                disabled={selectedDate <= minDate}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <SingleCalendarDatePicker
                value={new Date(selectedDate)}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(format(date, "yyyy-MM-dd"));
                  }
                }}
                minDate={new Date(minDate)}
                maxDate={new Date(maxDate)}
                variant="ghost"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => shiftDay(1)}
                disabled={selectedDate >= maxDate}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {selectedDate !== todayDate && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm cursor-pointer"
                onClick={() => goToDate(new Date())}
              >
                Today
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-sm font-bold shadow-2xs">
                <CheckCheck className="h-4 w-4" />
                <span>Plan Submitted</span>
              </div>
            )}

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
                    <p className="text-sm text-white">Toggle Visible Columns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {activePermission.Add && !isEditWindowExpired && !isSubmitted && isCompanyTimeDefined && (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-4 shrink-0">
          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-sm font-semibold text-slate-500  tracking-wider mb-0.5">
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
              <p className="text-sm font-semibold text-slate-500  tracking-wider mb-0.5">
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
              {isSubmitted ? (
                <>
                  <p className="text-sm font-semibold text-slate-500 tracking-wider mb-0.5">
                    Actual Time
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatMinutesToHours(totalActualTime)}
                  </p>
                </>
              ) : isOvertime ? (
                <>
                  <p className="text-sm font-semibold text-rose-600 tracking-wider mb-0.5 animate-pulse">
                    Extra Hours
                  </p>
                  <p className="text-lg font-bold text-rose-700">
                    {formatMinutesToHours(totalEstimatedTime - companyWorkingMinutes)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-500 tracking-wider mb-0.5">
                    Remaining Time
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatMinutesToHours(remainingTime)}
                  </p>
                </>
              )}
            </div>
            {isSubmitted ? (
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            ) : isOvertime ? (
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg shrink-0">
                <Hourglass className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="border border-slate-200 bg-white rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-sm font-semibold text-slate-500  tracking-wider mb-0.5">
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
              <p className="text-sm font-semibold text-slate-500  tracking-wider mb-0.5">
                Total Meetings
              </p>
              <p className="text-lg font-bold text-slate-900">{totalMeetings}</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <Presentation className="h-5 w-5" />
            </div>
          </div>
        </div>

        {isOvertime && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2.5 shadow-2xs shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>Overtime Warning:</strong> Your total planned time exceeds the company's working hours. You are planning overtime.
            </span>
          </div>
        )}

        {/* Main Table Data Container */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col tb:pt-4 border border-slate-200 rounded-lg">
          <TableData
            tableHeightClass="flex-1"
            tableData={filteredItems.map((item, index) => ({
              ...item,
              estimatedTimeFormatted: formatMinutesToHours(item.estimatedTime || 0),
              actualTimeTimeFormatted: formatMinutesToHours(item.actualTime || 0),
              title: item.title || (item.type === "TASK" ? item.task?.taskName : item.type === "MEETING" ? item.meeting?.meetingName : item.gantItem?.itemName) || "-",
              srNo: index + 1,
            }))}
            rowClassName={(item: any) =>
              item.isPlanned === false
                ? "bg-amber-50/40 hover:bg-amber-100/50 transition-colors"
                : ""
            }
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
            isEditDeleteShow={activePermission.Edit && !isEditWindowExpired && !isSubmitted && isCompanyTimeDefined}
            showActionsColumn={!isSubmitted && !isEditWindowExpired && isCompanyTimeDefined}
            actionColumnWidth="w-[100px] overflow-hidden"
          />
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddEditCheckInModal
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            date={selectedDate}
            onAddTaskClick={() => {
              setIsAddModalOpen(false);
              setIsOpenTaskDrawer(true);
            }}
            onAddMeetingClick={() => {
              setIsAddModalOpen(false);
              setIsOpenMeetingDrawer(true);
            }}
            items={items}
            companyWorkingMinutes={companyWorkingMinutes}
          />
        )}

        {/* Edit Modal */}
        {Boolean(editingItem) && (
          <AddEditCheckInModal
            open={Boolean(editingItem)}
            onOpenChange={(open) => !open && setEditingItem(null)}
            initialItem={editingItem}
            date={selectedDate}
            onAddTaskClick={() => {
              setEditingItem(null);
              setIsOpenTaskDrawer(true);
            }}
            onAddMeetingClick={() => {
              setEditingItem(null);
              setIsOpenMeetingDrawer(true);
            }}
            items={items}
            companyWorkingMinutes={companyWorkingMinutes}
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

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <ConfirmSubmitPlanModal
            open={isSubmitModalOpen}
            onOpenChange={setIsSubmitModalOpen}
            onConfirm={handleConfirmSubmitPlan}
            isLoading={isSubmitting}
            isOvertime={isOvertime}
            plannedMinutes={totalEstimatedTime}
            remainingMinutes={remainingTime}
          />
        )}

        {isOpenTaskDrawer && (
          <CalendarAddTaskDrawer
            open={isOpenTaskDrawer}
            onClose={() => {
              setIsOpenTaskDrawer(false);
              setIsAddModalOpen(true);
            }}
            isPlanningMode={true}
            hideProjectMeetingAdd={true}
            onPlanningSubmit={async (payload) => {
              setIsOpenTaskDrawer(false);
              await handleDirectSubmitPlanningItem({
                taskId: payload.taskId,
                estimatedTime: payload.estimatedTime,
                remarks: payload.remarks,
                title: payload.title,
              });
            }}
          />
        )}

        {isOpenMeetingDrawer && (
          <MeetingDrawer
            open={isOpenMeetingDrawer}
            onClose={() => {
              setIsOpenMeetingDrawer(false);
              setIsAddModalOpen(true);
            }}
            isPlanningMode={true}
            onPlanningSubmit={async (payload) => {
              setIsOpenMeetingDrawer(false);
              await handleDirectSubmitPlanningItem({
                meetingId: payload.meetingId,
                estimatedTime: payload.estimatedTime,
                remarks: payload.remarks,
                title: payload.title,
              });
            }}
          />
        )}
      </div>
    </FormProvider>
  );
}

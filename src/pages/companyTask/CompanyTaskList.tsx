import { Link, useNavigate } from "react-router-dom";
import useCompanyTaskList from "./useCompanyTaskList";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import DateRangePicker from "@/components/shared/DateRange";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ViewMeetingModal from "./ViewMeetingModal";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "../PageNoAccess";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { getColorFromName } from "@/features/utils/formatting.utils";
import ConfirmationDeleteModal from "./ConfirmTaskDeleteModal";
import { isColorDark } from "@/features/utils/color.utils";

function getInitials(name: string) {
  if (!name || name.trim() === "") {
    return "-";
  }
  const nameParts = name.trim().split(" ");
  if (nameParts.length > 1) {
    return nameParts.map((word) => word.charAt(0).toUpperCase()).join("");
  }
  return name.charAt(0).toUpperCase();
}

export default function CompanyTaskList() {
  const {
    companyTaskData,
    closeDeleteModal,
    setPaginationFilter,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    statusOptions,
    handleStatusChange,
    permission,
    filters,
    handleFilterChange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
    showOverdue,
    handleOverdueToggle,
    handleRowsModalOpen,
    isLoading,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    taskDateRange,
    appliedDateRange,
    handleDateRangeReset,
  } = useCompanyTaskList();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Task", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "taskName", label: "Task Name", visible: true },
    {
      key: "taskDescription",
      label: "Task Description",
      visible: true,
    },
    { key: "taskDeadline", label: "Task Deadline", visible: true },
    { key: "assigneeNames", label: "Assignees", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Toggle column visibility
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();
  const navigate = useNavigate();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6 flex flex-col">
        <div className="flex mb-3 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Company Task List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/tasks/add">
                <Button className="py-2 w-fit">Add Company Task</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="z-15 relative flex items-center gap-2">
              {!showOverdue && (
                <DateRangePicker
                  value={{
                    from: taskDateRange.taskStartDate,
                    to: taskDateRange.taskDeadline,
                  }}
                  onChange={handleDateRangeChange}
                  onApply={handleDateRangeApply}
                  onSaveApply={handleDateRangeSaveApply}
                  defaultDate={{
                    startDate: appliedDateRange.taskStartDate,
                    deadline: appliedDateRange.taskDeadline,
                  }}
                  isClear
                  handleClear={handleDateRangeReset}
                />
              )}
            </div>
            <div>
              <DropdownSearchMenu
                label="Status"
                options={statusOptions}
                selected={filters.taskStatusName || []}
                onChange={(selected) => {
                  handleFilterChange("taskStatusName", selected);
                }}
                multiSelect
              />
            </div>
            <Button
              variant={showOverdue ? "destructive" : "outline"}
              onClick={handleOverdueToggle}
              className="py-2 w-fit"
            >
              {showOverdue ? "Show All Tasks" : "Show Overdue"}
            </Button>
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

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={companyTaskData?.data.map(
              (item: TaskGetPaging, index: number) => ({
                ...item,
                srNo:
                  (companyTaskData.currentPage - 1) * companyTaskData.pageSize +
                  index +
                  1,
                taskDeadline: item.taskDeadline
                  ? format(new Date(item.taskDeadline), "dd/MM/yyyy h:mm aa")
                  : "",
                assigneeNames: item.TaskEmployeeJunction
                  ? item.TaskEmployeeJunction.map(
                      (j) => j.Employee?.employeeName,
                    )
                      .filter(Boolean)
                      .join(", ")
                  : "",
                createdByEmployeeName: getInitials(item.createdBy || ""),
                createdByFullName: item.createdBy || "",
                showDoth: item.deadlineRequest === "PENDING",
              }),
            )}
            dotsKey="showDoth"
            dotsAnchorKey="taskName"
            columns={visibleColumns}
            primaryKey="taskId"
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/tasks/edit/${row.taskId}`);
                  }
                : undefined
            }
            onDelete={(row) => {
              onDelete(row);
            }}
            onViewButton={(row) => {
              navigate(`/dashboard/tasks/view/${row.taskId}`);
            }}
            paginationDetails={mapPaginationDetails(companyTaskData)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            moduleKey="TASK"
            showIndexColumn={false}
            isActionButton={() => true}
            viewButton={true}
            permissionKey="users"
            onRowClick={(row) => {
              handleRowsModalOpen(row);
            }}
            sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
            actionColumnWidth="w-[120px]"
            extraColumns={[
              {
                label: "Created",
                width: "w-[100px]",
                render: (row: TaskGetPaging) => {
                  const initials = getInitials(row.createdBy!);
                  const fullName = String(row.createdBy!);
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-7 h-7 bg-primary text-white flex flex-col items-center justify-center aspect-square rounded-full text-[10px] font-semibold ${getColorFromName(fullName)}`}
                          >
                            {initials}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{fullName}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                },
              },
              {
                label: "Status",
                width: "w-[170px]",
                render: (row: TaskGetPaging) => {
                  const currentStatus = statusOptions.find(
                    (opt) => opt.value === row.taskStatusId,
                  );
                  return (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 min-w-[100px] justify-between"
                            style={{
                              backgroundColor:
                                currentStatus?.color || "#2e3195",
                              color: isColorDark(
                                currentStatus?.color || "#2e3195",
                              )
                                ? "#FFFFFF"
                                : "#000000",
                            }}
                          >
                            {currentStatus?.label || row.taskStatus || "Select"}
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {statusOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() =>
                                handleStatusChange(option.value, row)
                              }
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                },
              },
            ]}
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Company Task"}
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        <ViewMeetingModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </FormProvider>
  );
}

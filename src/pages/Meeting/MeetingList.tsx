import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import useMeeting from "./useMeeting";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ViewMeetingModal from "./ViewMeetingModal";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import { format } from "date-fns";
import DateRangePicker from "@/components/shared/DateRange";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "../PageNoAccess";
import ConfirmationDeleteModal from "./confirmMeetingDeleteModal";
import { getInitials } from "@/features/utils/app.utils";
import { getColorFromName } from "@/features/utils/formatting.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { isColorDark } from "@/features/utils/color.utils";

export default function MeetingList() {
  const {
    meetingData,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    permission,
    statusOptions,
    filters,
    handleFilterChange,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    handleStatusChange,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDateRangeSaveApply,
    showOverdue,
    handleOverdueToggle,
    taskDateRange,
    handleDateRangeReset,
    // handleDetailToggle,
    // showDetail,
  } = useMeeting();

  const { setBreadcrumbs } = useBreadcrumbs();
  // const userId = useSelector(getUserId);
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Meeting", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "meetingName", label: "Meeting Name", visible: true },
    {
      key: "meetingDescription",
      label: "Meeting Description",
      visible: true,
    },
    { key: "meetingDateTime", label: "Start Date", visible: true },
    { key: "endDate", label: "End Date", visible: true },
    { key: "joinerNames", label: "Joiners", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full px-2 overflow-x-auto sm:px-4 py-6 flex flex-col">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Meeting List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/meeting/add">
                <Button className="py-2 w-fit">Add Meeting</Button>
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
            <div className="relative flex items-center gap-2 ">
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
                    startDate: taskDateRange.taskStartDate,
                    deadline: taskDateRange.taskDeadline,
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
                selected={filters?.selected}
                onChange={(selected) => {
                  handleFilterChange(selected);
                }}
                multiSelect
              />
            </div>
            {/* <Button
              variant={showDetail ? "outline" : "destructive"}
              onClick={handleDetailToggle}
              className="py-2 w-fit"
            >
              {showDetail ? "Show Other Meetings" : "Show Detail Meetings"}
            </Button> */}
            <Button
              variant={showOverdue ? "destructive" : "outline"}
              onClick={handleOverdueToggle}
              className="py-2 w-fit"
            >
              {showOverdue ? "Show All Meeting" : "Show Overdue"}
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
            key={meetingData?.currentPage}
            tableData={meetingData?.data.map((item, index) => ({
              ...item,
              srNo:
                (meetingData.currentPage - 1) * meetingData.pageSize +
                index +
                1,
              status: item.meetingStatusId,
              meetingDateTime: format(
                new Date(item.meetingDateTime ?? 0),
                "dd/MM/yyyy hh:mm a",
              ),
              endDate: format(
                new Date(item.meetingDateTime ?? 0),
                "dd/MM/yyyy hh:mm a",
              ),
              joinerNames:
                item.joiners
                  ?.map((emp) =>
                    typeof emp === "object" &&
                    emp !== null &&
                    "employeeName" in emp
                      ? (emp as { employeeName: string }).employeeName
                      : String(emp),
                  )
                  .join(", ") || "",
              createdByEmployeeName: getInitials(
                (typeof item.createdBy === "object"
                  ? item.createdBy?.employeeName
                  : item.createdBy) || "",
              ),
              createdByFullName:
                (typeof item.createdBy === "object"
                  ? item.createdBy?.employeeName
                  : item.createdBy) || "",
              showDoth: item.deadlineRequest === "PENDING",
            }))}
            dotsKey="showDoth"
            dotsAnchorKey="meetingName"
            columns={visibleColumns}
            primaryKey="meetingId"
            actionColumnWidth="w-[90px]"
            extraColumns={[
              {
                label: "Created",
                width: "w-[100px]",
                render: (row) => {
                  const initials = String(row.createdByEmployeeName ?? " - ");
                  const fullName = String(row.createdByFullName ?? "");
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
                width: "w-[180px]",
                render: (row) => {
                  const currentStatus = statusOptions.find(
                    (opt) => opt.value === row.meetingStatusId,
                  );
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 min-w-[100px] justify-between"
                          style={{
                            backgroundColor: currentStatus?.color || "#2e3195",
                            color: isColorDark(
                              currentStatus?.color || "#2e3195",
                            )
                              ? "#FFFFFF"
                              : "#000000",
                          }}
                        >
                          {currentStatus?.label ||
                            (typeof row.meetingStatus === "object"
                              ? row.meetingStatus?.meetingStatus
                              : row.meetingStatus) ||
                            "Select"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statusOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() =>
                              handleStatusChange(option.value, row.meetingId!)
                            }
                          >
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: option.color }}
                              />
                              {option.label}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                },
              },
            ]}
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/meeting/edit/${row.meetingId}`);
                  }
                : undefined
            }
            isActionButton={() => true}
            onDelete={(row) => {
              onDelete(row as unknown as CompanyMeetingDataProps);
            }}
            onRowClick={(row) => {
              handleRowsModalOpen(row as unknown as CompanyMeetingDataProps);
            }}
            paginationDetails={mapPaginationDetails(meetingData)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            permissionKey="users"
            localStorageId="MeetingList"
            moduleKey="MEETING_LIST"
            sortableColumns={[
              "meetingName",
              "meetingDateTime",
              "meetingStatus",
            ]}
            dropdownColumns={{
              meetingStatus: {
                options: statusOptions ?? [],
                onChange: (row, value) =>
                  row.meetingId
                    ? handleStatusChange(value, row.meetingId)
                    : undefined,
              },
            }}
          />
        </div>
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Meeting"}
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        {/* View Meeting Modal */}
        <ViewMeetingModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </FormProvider>
  );
}

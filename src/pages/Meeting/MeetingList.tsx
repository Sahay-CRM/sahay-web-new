import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
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
    showOverdue,
    handleOverdueToggle,
    taskDateRange,
    handleDetailToggle,
    showDetail,
  } = useMeeting();

  const { setBreadcrumbs } = useBreadcrumbs();

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
    { key: "meetingDateTime", label: "Meeting TIme", visible: true },
    { key: "joinerNames", label: "Joiners", visible: true },
    { key: "meetingStatus", label: "Status", visible: true }, // <-- add this line
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
  const navigate = useNavigate();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
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

        <div className="flex justify-between items-center mb-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>
          <div className="flex gap-4">
            <div className="z-10 relative flex items-center gap-2">
              {!showOverdue && (
                <DateRangePicker
                  value={{
                    from: taskDateRange.taskStartDate,
                    to: taskDateRange.taskDeadline,
                  }}
                  onChange={handleDateRangeChange}
                  onApply={handleDateRangeApply}
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
            <Button
              variant={showDetail ? "outline" : "destructive"}
              onClick={handleDetailToggle}
              className="py-2 w-fit"
            >
              {showDetail ? "Show Detail" : "Show All Other"}
            </Button>
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
                new Date(item.meetingDateTime),
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
            }))}
            columns={visibleColumns}
            primaryKey="meetingId"
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/meeting/edit/${row.meetingId}`);
                  }
                : undefined
            }
            isActionButton={() => true}
            onDelete={(row) => {
              onDelete(row as unknown as MeetingData);
            }}
            onRowClick={(row) => {
              handleRowsModalOpen(row as unknown as MeetingData);
            }}
            paginationDetails={mapPaginationDetails(meetingData)}
            setPaginationFilter={setPaginationFilter}
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
            label={"Meeting Name :"}
            modalData={`${modalData?.meetingName}`}
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

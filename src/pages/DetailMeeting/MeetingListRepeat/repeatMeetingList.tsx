import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";

import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TableData from "@/components/shared/DataTable/DataTable";

import useRepeatMeetingList from "./useRepeatMeetingList";
// import ViewRepeatTaskModal from "./ViewRepeatTaskModal";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
// import DateRangePicker from "@/components/shared/DateRange";

import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import PageNotAccess from "../../PageNoAccess";
// import DateRangePicker from "@/components/shared/DateRange";
import AddRepeatMeetingModal from "./addRepeatMeetingModal";
// import { Trash } from "lucide-react";

export default function RepeatMeetingList() {
  const {
    repeatMeetingData,
    closeDeleteModal,
    setPaginationFilter,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    permission,
    handleRowsModalOpen,
    isLoading,
    handleStopRepeat,
    // taskDateRange,
    // handleDateRangeApply,
    // handleDateRangeChange,
    isChildDataActive,
    isModalOpen,
    istemData,
    handleClose,
  } = useRepeatMeetingList();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Live Meetings Templates", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "meetingName", label: "Meeting Name", visible: true },
    {
      key: "meetingDescription",
      label: "Meeting Description",
      visible: true,
    },
    { key: "meetingDateTime", label: "Next Meeting Time", visible: true },
    { key: "joinerNames", label: "Joiners", visible: true },
    { key: "teamLeaderName", label: "Team Leaders", visible: true },
    { key: "repeatType", label: "Repeat", visible: true },
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
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-3 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Live Meetings Templates
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/repeat-meeting/add">
                <Button className="py-2 w-fit">
                  Add Live Meeting Templates
                </Button>
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
            {/* <div className="relative flex items-center gap-2 ">
              <DateRangePicker
                value={{
                  from: taskDateRange.taskStartDate,
                  to: taskDateRange.taskDeadline,
                }}
                onChange={handleDateRangeChange}
                onApply={handleDateRangeApply}
              />
            </div> */}
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
            tableData={repeatMeetingData?.data.map((item, index) => ({
              ...item,
              srNo:
                (repeatMeetingData.currentPage - 1) *
                  repeatMeetingData.pageSize +
                index +
                1,
              meetingDateTime: format(
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
            }))}
            columns={visibleColumns}
            primaryKey="repetitiveMeetingId"
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(
                      `/dashboard/repeat-meeting/update/${row.repetitiveMeetingId}`,
                    );
                  }
                : undefined
            }
            onDelete={(row) => {
              onDelete(row);
            }}
            customActions={(row) => {
              return (
                <>
                  {/* {permission.Add && (
                    <Button
                      className={`w-fit mr-1`}
                      onClick={() => {
                        navigate(
                          `/dashboard/repeat-meeting/detail/${row.repetitiveMeetingId}?meetingName=${encodeURIComponent(row.meetingName || "")}`,
                        );
                      }}
                    >
                      Details
                    </Button>
                  )} */}

                  {permission.Edit && (
                    <Button
                      className={`w-fit ${row.isActive && "bg-red-500 text-white hover:bg-red-400"}`}
                      onClick={() => handleStopRepeat(row)}
                    >
                      {row.isActive ? "Stop Repeat" : "Start Repeat"}
                    </Button>
                  )}
                </>
              );
            }}
            // isEditDeleteShow={true}
            paginationDetails={mapPaginationDetails(repeatMeetingData)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="LIVE_MEETING_TEMPLATES"
            showIndexColumn={false}
            isActionButton={() => true}
            permissionKey="users"
            onRowClick={(row) => {
              handleRowsModalOpen(row);
            }}
            sortableColumns={["meetingName"]}
            actionColumnWidth="w-[220px]"
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title="Delete Repetitive Meeting"
            label="Repetitive Meeting Name:"
            modalData={`${modalData?.meetingName}`}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={(isGroupDelete) => conformDelete(isGroupDelete ?? false)}
            isChildData={isChildData}
          />
        )}

        {isModalOpen && (
          <AddRepeatMeetingModal
            // modalData={modalData as MeetingData}
            isModalOpen={isModalOpen}
            modalClose={handleClose}
            isChildData={isChildDataActive}
            onKeepAll={() => handleStopRepeat(istemData!, "UPDATE_ALL")}
            onDeleteAll={() => handleStopRepeat(istemData!, "DELETE_ALL")}
          />
        )}
      </div>
    </FormProvider>
  );
}

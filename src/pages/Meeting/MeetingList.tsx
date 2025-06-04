import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useMeeting from "./useMeeting";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import DateRangePicker from "@/components/shared/DateRange";

export default function MeetingList() {
  const {
    meetingData,
    closeDeleteModal,
    setPaginationFilter,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    permission,
    handleDateRangeChange,
    filteredTaskData,
    statusOptions,
    filters,
    handleFilterChange,
  } = useMeeting();

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
  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Meeting List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
            <div className="flex gap-4">
              <div className="z-10 relative">
                <DateRangePicker onChange={handleDateRangeChange} />
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
            </div>
            {canToggleColumns && (
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            )}
            {permission.Add && (
              <Link to="/dashboard/meeting/add">
                <Button className="py-2 w-fit">Add Meeting</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={filteredTaskData?.map((item, index) => ({
              ...item,
              srNo: index + 1,
              joinerNames: item.joiners?.length
                ? item.joiners
                    .map((joiner) =>
                      typeof joiner === "object" &&
                      joiner !== null &&
                      "employeeName" in joiner
                        ? (joiner as { employeeName?: string }).employeeName
                        : undefined,
                    )
                    .filter(Boolean)
                    .join(", ")
                : "-",
              meetingDateTime: item.meetingDateTime
                ? format(new Date(item.meetingDateTime), "dd-MM-yyyy")
                : "-",
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
            paginationDetails={meetingData}
            setPaginationFilter={setPaginationFilter}
            //   isLoading={isLoading}
            permissionKey="users"
            localStorageId="MeetingList"
            moduleKey="MEETING_LIST"
          />
        </div>
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            label={"User Name :"}
            modalData={`${modalData?.meetingName}`}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
      </div>
    </FormProvider>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useMeeting from "./useMeeting";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    statusOptions,
    filters,
    handleFilterChange,
    handleRowsModalOpen,
    // isRowModal,
  } = useMeeting();

  // console.log(isRowModal);

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

  const [tableRenderKey, setTableRenderKey] = useState(0);

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

  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_MeetingList");
    }
    setTableRenderKey((k) => k + 1);
  };

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
        <div className="flex gap-4 justify-end">
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetColumnWidths}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-white">Reset Columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            key={tableRenderKey}
            tableData={meetingData?.data.map((item, index) => ({
              ...item,
              srNo:
                (meetingData.currentPage - 1) * meetingData.pageSize +
                index +
                1,
              meetingDateTime: new Date(item.meetingDateTime).toLocaleString(),
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

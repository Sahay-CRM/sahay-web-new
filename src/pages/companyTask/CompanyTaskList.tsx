import { Link, useNavigate } from "react-router-dom";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyTaskList from "./useCompanyTaskList";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import TableWithDropdown from "@/components/shared/DataTable/DropdownTable/DropdownTable";
import DateRangePicker from "@/components/shared/DateRange";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ViewMeetingModal from "./ViewMeetingModal";

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
    showOverdue,
    handleOverdueToggle,
    handleRowsModalOpen,
    isLoading,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
  } = useCompanyTaskList();

  const [tableRenderKey, setTableRenderKey] = useState(0);

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
    { key: "status", label: "Status", visible: true },
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

  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_CompanyTaskList");
    }
    setTableRenderKey((k) => k + 1);
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full  overflow-x-auto">
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
              <DateRangePicker
                onChange={handleDateRangeChange}
                onApply={handleDateRangeApply}
              />
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
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
                columnIcon={true}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetColumnWidths}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableWithDropdown
            key={tableRenderKey}
            tableData={companyTaskData?.data.map(
              (item: TaskGetPaging, index: number) => ({
                ...item,
                srNo: index + 1,
                status: item.taskStatusId,
                taskDeadline: item.taskDeadline
                  ? new Date(item.taskDeadline).toISOString().split("T")[0]
                  : "",
                assigneeNames: item.TaskEmployeeJunction
                  ? item.TaskEmployeeJunction.map(
                      (j) => j.Employee?.employeeName,
                    )
                      .filter(Boolean)
                      .join(", ")
                  : "",
              }),
            )}
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
            viewButton={true}
            isActionButton={() => true}
            // canDelete={(row) => !row.isSuperAdmin}
            paginationDetails={companyTaskData}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            permissionKey="users"
            localStorageId="CompanyTaskList"
            statusOptions={statusOptions}
            showDropdown={true}
            handleStatusChange={handleStatusChange}
            onViewButton={(row) => {
              navigate(`/dashboard/tasks/view/${row.taskId}`);
            }}
            moduleKey="TASK"
            onRowClick={(row) => {
              handleRowsModalOpen(row);
            }}
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Company Task"}
            label={"taskName Name :"}
            modalData={`${modalData?.taskName}`}
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

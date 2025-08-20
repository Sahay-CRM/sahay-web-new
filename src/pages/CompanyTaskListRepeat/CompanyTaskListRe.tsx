import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

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

import useCompanyTaskList from "./useCompanyTaskListRe";
// import ViewRepeatTaskModal from "./ViewRepeatTaskModal";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
// import DateRangePicker from "@/components/shared/DateRange";

import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import PageNotAccess from "../PageNoAccess";
// import { Trash } from "lucide-react";

export default function CompanyTaskListRe() {
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
    // statusOptions,
    // handleStatusChange,
    permission,
    // filters,
    // handleFilterChange,
    // handleDateRangeChange,
    // handleDateRangeApply,
    // showOverdue,
    // handleOverdueToggle,
    handleRowsModalOpen,
    isLoading,
    // isViewModalOpen,
    // setIsViewModalOpen,
    // viewModalData,
    // taskStatus,
    // taskDateRange,
  } = useCompanyTaskList();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Task Repetition", href: "" }]);
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
    { key: "employees", label: "Assignees", visible: true },
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

  const formatLocalDate = (isoDate?: string): string => {
    if (!isoDate) return "";

    const date = new Date(isoDate);

    // Format as YYYY-MM-DD in local time zone
    return date.toLocaleDateString("en-CA"); // en-CA gives "yyyy-mm-dd"
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-3 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Company Repetition Task List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/tasksrepet/add">
                <Button className="py-2 w-fit">Add Company Repeat Task</Button>
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
                status: item.taskStatusId,
                taskDeadline: formatLocalDate(item.taskDeadline),
                assigneeNames: item.TaskEmployeeJunction
                  ? item.TaskEmployeeJunction.map(
                      (j) => j.Employee?.employeeName,
                    )
                      .filter(Boolean)
                      .join(" , ")
                  : " ",
              }),
            )}
            columns={visibleColumns}
            primaryKey="repetitiveTaskId"
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(
                      `/dashboard/tasksrepeat/edit/${row.repetitiveTaskId}`,
                    );
                  }
                : undefined
            }
            onDelete={(row) => {
              onDelete(row);
            }}
            // onViewButton={(row) => {
            //   navigate(`/dashboard/tasksrepeat/view/${row.repetitiveTaskId}`);
            // }}
            // customActions={(row) => {
            //   return (
            //     <div className="flex flex-col ">
            //       {/* Delete Button */}
            //       <Button
            //         variant="outline"
            //         size="sm"
            //         className="h-8 w-8 p-0 text-red-600"
            //         onClick={(e) => {
            //           e.stopPropagation();
            //           onDelete(row);
            //         }}
            //       >
            //         <Trash className="w-4 h-4" />
            //       </Button>
            //     </div>
            //   );
            // }}
            isEditDeleteShow={true}
            paginationDetails={mapPaginationDetails(companyTaskData)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="TASK"
            showIndexColumn={false}
            isActionButton={() => true}
            // viewButton={true}
            permissionKey="users"
            // dropdownColumns={{
            //   taskStatus: {
            //     options: (taskStatus?.data ?? []).map((opt) => ({
            //       label: opt.taskStatus,
            //       value: opt.taskStatusId,
            //       color: opt.color || "#2e3195",
            //     })),
            //     onChange: (row, value) => handleStatusChange(value, row),
            //   },
            // }}

            onRowClick={(row) => {
              handleRowsModalOpen(row);
            }}
            sortableColumns={["taskName", "taskDeadline", "taskStatus"]}
            actionColumnWidth="w-[100px]"
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title="Delete Repetitive Task"
            label="Repetitive Task Name:"
            modalData={`${modalData?.taskName}`}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={(isGroupDelete) => conformDelete(isGroupDelete ?? false)}
            isChildData={isChildData}
            // showDeleteOptions={true}
          />
        )}
        {/* <ViewRepeatTaskModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        /> */}
      </div>
    </FormProvider>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyEmployee from "./useCompanyEmployee";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import ViewEmployeeModal from "./ViewEmployeeModal";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "../PageNoAccess";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";

export default function CompanyDesignation() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Employee", href: "" }]);
  }, [setBreadcrumbs]);

  const userData = useSelector(getUserDetail);

  const {
    employeedata,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // currentStatus,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    permission,
    isViewModalOpen,
    setIsViewModalOpen,
    handleRowsModalOpen,
    viewModalData,
    handleInactive,
  } = useCompanyEmployee();

  //   const { setBreadcrumbs } = useBreadcrumbs();

  //   useEffect(() => {
  //     setBreadcrumbs([
  //       { label: "Admin Tools", href: "/admin-tools" },
  //       { label: "User" },
  //     ]);
  //   }, [setBreadcrumbs]);

  // Column visibility state

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
    {
      key: "employeeEmail",
      label: "Employee Email",
      visible: true,
    },
    { key: "employeeMobile", label: "Employee Mobile", visible: true },
    { key: "employeeType", label: "Employee Type", visible: true },
  ]);

  // Filter visible columns
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
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Employee List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/employees/add">
                <Button className="py-2 w-fit">Add Employee</Button>
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

          <div className="flex items-center gap-2">
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
            tableData={employeedata?.data.map((item, index) => ({
              ...item,
              srNo:
                (employeedata.currentPage - 1) * employeedata.pageSize +
                index +
                1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            isActionButton={(row) =>
              row?.employeeType == "OWNER" || row?.employeeType == "EMPLOYEE"
            }
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/employees/edit/${row.employeeId}`);
                  }
                : undefined
            }
            onRowClick={(row) => {
              if (
                row?.employeeType == "OWNER" ||
                row?.employeeType == "EMPLOYEE"
              ) {
                handleRowsModalOpen(row as unknown as EmployeeData);
              }
            }}
            onDelete={(row) => onDelete(row as unknown as EmployeeData)}
            canDelete={() => !!userData.isSuperAdmin}
            paginationDetails={mapPaginationDetails(employeedata)}
            isLoading={isLoading}
            setPaginationFilter={setPaginationFilter}
            permissionKey="employeeId"
            moduleKey="EMPLOYEE"
            sortableColumns={["employeeName", "employeeType"]}
            showActiveToggle={true}
            onToggleActive={(item) => {
              handleInactive(item);
            }}
            activeToggleKey="isDeactivated"
            actionColumnWidth="w-[160px] overflow-hidden "
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Company Employee"}
            label={"User Name :"}
            modalData={`${modalData?.employeeName}`}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        {/* View Meeting Modal */}
        <ViewEmployeeModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </FormProvider>
  );
}

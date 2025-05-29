import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyEmployee from "./useCompanyEmployee";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

export default function CompanyDesignation() {
  const {
    employeedata,
    // isLoading,
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
  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Employee List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
            {permission.Add && (
              <Link to="/dashboard/employees/add">
                <Button className="py-2 w-fit">Add Employee</Button>
              </Link>
            )}
            {canToggleColumns && (
              <DropdownSearchMenu
                columns={columnToggleOptions}
                onToggleColumn={onToggleColumn}
              />
            )}
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={employeedata?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            onEdit={
              permission.Edit
                ? (row) =>
                    navigate(`/dashboard/employees/edit/${row.employeeId}`)
                : undefined
            }
            onDelete={(row) => {
              if (!row.isSuperAdmin) {
                onDelete(row);
              }
            }}
            isActionButton={true}
            canDelete={(row) => !row.isSuperAdmin}
            paginationDetails={employeedata}
            setPaginationFilter={setPaginationFilter}
            permissionKey="employeeId"
            localStorageId="EmployeeList"
            moduleKey="EMPLOYEE"
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            label={"User Name :"}
            modalData={`${modalData?.employeeName}`}
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

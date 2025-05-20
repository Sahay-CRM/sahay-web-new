import { useState } from "react";
import { Link } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useAdminUser from "./useAdminUser";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
export default function AdminUser() {
  const {
    user,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // currentStatus,
    openModal,
    onDelete,
    modalData,
    conformDelete,
    paginationFilter,
    isUserModalOpen,
    isChildData,
  } = useAdminUser();
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
    { key: "userFirstName", label: "User First Name", visible: true },
    { key: "userLastName", label: "User Last Name", visible: true },
    { key: "userEmail", label: "Email", visible: true },
    { key: "departmentName", label: "Department", visible: true },
    { key: "designationName", label: "Designation", visible: true },
    { key: "cityName", label: "City Name", visible: true },
    { key: "localityName", label: "Locality Name", visible: true },
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

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">User</h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
            <Link to="">
              <Button className="py-2 w-fit">Add User</Button>
            </Link>
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
            tableData={user?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            columns={visibleColumns} // Pass only visible columns to the Table
            primaryKey="userId"
            onEdit={openModal}
            onDelete={(row) => {
              if (!row.isSuperAdmin) {
                onDelete(row);
              }
            }}
            canDelete={(row) => !row.isSuperAdmin}
            paginationDetails={user}
            setPaginationFilter={setPaginationFilter}
            //   isLoading={isLoading}
            permissionKey="users"
            showIndexColumn={false}
          />
        </div>

        {/* Modal Component */}
        {isUserModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            label={"User Name :"}
            modalData={`${modalData?.userFirstName} + ${modalData?.userLastName}`}
            isModalOpen={isUserModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
      </div>
    </FormProvider>
  );
}

import { useState } from "react";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useUserpermissionlist from "./useUserpermissionlist";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function MeetingList() {
  const {
    employeeData,
    closeDeleteModal,
    setPaginationFilter,
    // currentStatus,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    isChildData,
    paginationFilter,
    isLoading,
  } = useUserpermissionlist();

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
    { key: "departmentName", label: "Department", visible: true },
    { key: "designationName", label: "Designation", visible: true },
  ]);
  const [tableRenderKey, setTableRenderKey] = useState(0);
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
  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_UserPermissionList");
    }
    setTableRenderKey((k) => k + 1);
  };
  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Permission List
          </h1>
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
          <TableData
            key={tableRenderKey}
            tableData={employeeData?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            paginationDetails={employeeData}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            permissionKey="users"
            isActionButton={() => true}
            localStorageId="UserPermissionList"
            moduleKey="ROLES_PERMISSION"
            additionalButton={true}
            isEditDelete={false}
            onAdditionButton={(data) => {
              navigate(
                `/dashboard/roles/user-permission/edit/${data.employeeId}`,
              );
            }}
          />
        </div>
        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            label={"User Name :"}
            modalData={`${modalData?.departmentName}`}
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

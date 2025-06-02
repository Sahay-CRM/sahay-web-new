import { useState } from "react";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useUserpermissionlist from "./useUserpermissionlist";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
  } = useUserpermissionlist();

  //   const { setBreadcrumbs } = useBreadcrumbs();

  //   useEffect(() => {
  //     setBreadcrumbs([
  //       { label: "Admin Tools", href: "/admin-tools" },
  //       { label: "User" },
  //     ]);
  //   }, [setBreadcrumbs]);

  // Column visibility state

  const [columnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
    { key: "departmentName", label: "Department", visible: true },
    { key: "designationName", label: "Designation", visible: true },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const methods = useForm();
  const navigate = useNavigate();

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Permission List
          </h1>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={employeeData?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            paginationDetails={employeeData}
            setPaginationFilter={setPaginationFilter}
            //   isLoading={isLoading}
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

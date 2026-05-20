import { useEffect, useState } from "react";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useKpiPermissionList from "./useKpiPermissionList";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../PageNoAccess";

export default function KpiPermissionList() {
  const {
    employeeData,
    closeDeleteModal,
    setPaginationFilter,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    isChildData,
    paginationFilter,
    isLoading,
  } = useKpiPermissionList();

  const permission = useSelector(getUserPermission).KPI_PERMISSION;

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Permission", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
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
      <div className="w-full h-full px-2 sm:px-4 py-6 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0 gap-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>
          <div className="flex items-center gap-3">
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

        <div className="flex-1 bg-white overflow-hidden flex flex-col  tb:pt-4">
          <TableData
            tableHeightClass="flex-1"
            key={employeeData?.currentPage}
            tableData={employeeData?.data.map((item, index) => ({
              ...item,
              srNo:
                (employeeData.currentPage - 1) * employeeData.pageSize +
                index +
                1,
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            paginationDetails={employeeData as PaginationFilter}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            permissionKey="KPI_PERMISSION"
            isActionButton={() => false}
            canDelete={() => false}
            isEditDeleteShow={false}
            localStorageId="KpiPermissionList"
            moduleKey="KPI_PERMISSION"
            additionalButton={() => true}
            isEditDelete={() => false}
            isPermissionIcon={(item) => !item.isSuperAdmin}
            onAdditionButton={(data) => {
              navigate(
                `/dashboard/roles/kpi-permission/edit/${data.employeeId}`,
                { state: { userName: data.employeeName } },
              );
            }}
            actionColumnWidth="w-[80px] overflow-hidden "
            sortableColumns={[
              "employeeName",
              "departmentName",
              "designationName",
            ]}
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import useSahayTeammate from "./useSahayTeammate";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import ViewEmployeeModal from "../companyEmployee/ViewEmployeeModal";
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
import { Trash } from "lucide-react";
import { getUserDetail } from "@/features/selectors/auth.selector";
import ConfirmationDeleteModal from "../companyEmployee/confirmEmployeDeleteModal";
import { formatEmployeeType, getInitials } from "@/features/utils/app.utils";
import { getColorFromName } from "@/features/utils/formatting.utils";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import ModalData from "@/components/shared/Modal/ModalData";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function SahayTeammate() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Sahay Teammate / Consultant", href: "" }]);
  }, [setBreadcrumbs]);

  const userData = useSelector(getUserDetail);

  const {
    employeeData,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    currentStatus,
    onStatusChange,
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
    handoverPermission,
  } = useSahayTeammate();

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "employeeName", label: "Employee Name", visible: true },
    {
      key: "employeeEmail",
      label: "Employee Email",
      visible: true,
    },
    { key: "employeeMobile", label: "Employee Mobile", visible: true },
    { key: "designationName", label: "Designation", visible: true },
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

  const [pendingToggleItem, setPendingToggleItem] =
    useState<EmployeeDetails | null>(null);

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full flex flex-col px-2 sm:px-4 py-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>

          <div className="flex items-center gap-3">
            <FormSelect
              value={currentStatus}
              onChange={(val) => onStatusChange(val as string)}
              options={statusOptions}
              placeholder="Status"
              className="w-40"
              triggerClassName="py-2"
            />
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
            tableData={employeeData?.data.map((item, index) => ({
              ...item,
              srNo:
                (employeeData.currentPage - 1) * employeeData.pageSize +
                index +
                1,
              createdByEmployeeName: getInitials(item.createdByName || ""),
              designationName:
                item.designationName || formatEmployeeType(item.employeeType),
            }))}
            columns={visibleColumns}
            primaryKey="employeeId"
            isActionButton={() => false}
            onRowClick={(row) => {
              handleRowsModalOpen(row as unknown as EmployeeData);
            }}
            extraColumns={[
              {
                label: "Added",
                width: "w-[80px]",
                render: (row) => {
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-7 h-7 bg-primary text-white flex items-center justify-center aspect-square rounded-full text-[12px] font-medium ${getColorFromName(row.createdByEmployeeName)}`}
                          >
                            {row.createdByEmployeeName}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{row.createdByName}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                },
              },
            ]}
            onDelete={(row) => onDelete(row as unknown as EmployeeData)}
            canDelete={() => !!userData.isSuperAdmin}
            paginationDetails={mapPaginationDetails(employeeData)}
            isLoading={isLoading}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            permissionKey="employeeId"
            moduleKey="SAHAY_EMP"
            sortableColumns={["employeeName"]}
            showActiveToggle={true}
            onToggleActive={(item) => {
              setPendingToggleItem(item as EmployeeDetails);
            }}
            activeToggleKey="isDeactivated"
            invertActiveToggle
            customActions={(row) => (
              <div className="flex items-center gap-1 justify-end">
                {handoverPermission?.View && row.isDeactivated && (
                  <Button
                    variant="outline"
                    size="default"
                    className="h-8 px-2 text-xs cursor-pointer"
                    onClick={() =>
                      navigate("/dashboard/handover", {
                        state: { oldUserId: row.employeeId },
                      })
                    }
                  >
                    Handover
                  </Button>
                )}
                {permission?.Delete && !!userData?.isSuperAdmin && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 cursor-pointer"
                            onClick={() => onDelete(row as unknown as EmployeeData)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className={`h-8 w-auto px-2 cursor-pointer ${
                              !row.isDeactivated
                                ? "bg-primary hover:bg-primary text-white"
                                : "bg-red-700/80 hover:bg-red-700 text-white"
                            }`}
                            onClick={() => setPendingToggleItem(row as EmployeeDetails)}
                          >
                            {!row.isDeactivated ? "Inactive" : "Active"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!row.isDeactivated ? "Set Inactive" : "Set Active"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            )}
            actionColumnWidth="w-[230px] overflow-hidden "
          />
        </div>

        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        <ViewEmployeeModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />

        {/* Active/Inactive Toggle Confirmation */}
        <ModalData
          isModalOpen={!!pendingToggleItem}
          modalClose={() => setPendingToggleItem(null)}
          modalTitle={
            pendingToggleItem?.isDeactivated
              ? "Activate User"
              : "Deactivate User"
          }
          containerClass="min-w-[400px] max-w-[500px]"
          buttons={[
            {
              btnText: "Cancel",
              buttonCss:
                "bg-gray-200 text-black border-gray-300 hover:bg-gray-300",
              btnClick: () => setPendingToggleItem(null),
            },
            {
              btnText: "Confirm",
              btnClick: () => {
                if (pendingToggleItem) {
                  handleInactive(pendingToggleItem);
                }
                setPendingToggleItem(null);
              },
            },
          ]}
        >
          <p className="text-sm text-gray-600">
            {pendingToggleItem?.isDeactivated
              ? `Are you sure you want to mark ${pendingToggleItem?.employeeName} as active?`
              : `Are you sure you want to mark ${pendingToggleItem?.employeeName} as inactive?`}
          </p>
        </ModalData>
      </div>
    </FormProvider>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyProject from "./useCompanyProject";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import TableWithDropdown from "@/components/shared/DataTable/DropdownTable/DropdownTable";
import { RefreshCw } from "lucide-react";
// import DesignationAddFormModal from "./DesignationAddFormModal";
export default function CompanyProject() {
  const {
    projectlistdata,
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
    handleFilterChange,
    filters,
  } = useCompanyProject();
  const [tableRenderKey, setTableRenderKey] = useState(0);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "projectName", label: "Project Name", visible: true },
    {
      key: "projectDeadline",
      label: "Project Deadline",
      visible: true,
    },
    { key: "projectDescription", label: "Project Description", visible: true },
    { key: "status", label: "Status", visible: true },
  ]);

  // Toggle column visibility
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const resetColumnWidths = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tableWidths_CompanyTaskList");
    }
    setTableRenderKey((k) => k + 1);
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
            Company Project List
          </h1>
          <div>
            {permission.Add && (
              <Link to="/dashboard/projects/add">
                <Button className="py-2 w-fit">Add Company Project</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end space-x-5 tb:space-x-7">
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

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableWithDropdown
            key={tableRenderKey}
            tableData={projectlistdata?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
              status: item?.projectStatus?.projectStatusId ?? "",
            }))}
            columns={visibleColumns}
            primaryKey="projectId"
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/projects/edit/${row.projectId}`);
                  }
                : undefined
            }
            onDelete={(row) => {
              onDelete(row as unknown as IProjectFormData);
            }}
            isActionButton={() => true}
            viewButton={true}
            onViewButton={(row) => {
              navigate(`/dashboard/projects/view/${row.projectId}`);
            }}
            showDropdown={true}
            statusOptions={statusOptions}
            handleStatusChange={handleStatusChange}
            paginationDetails={projectlistdata}
            setPaginationFilter={setPaginationFilter}
            permissionKey="users"
            localStorageId="CompanyProjectList"
            moduleKey="PROJECT_LIST"
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete User"}
            label={"User Name :"}
            modalData={`${modalData?.projectName}`}
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

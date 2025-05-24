import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyProject from "./useCompanyProject";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
// import DesignationAddFormModal from "./DesignationAddFormModal";
export default function CompanyProject() {
  const {
    projectlistdata,
    // isLoading,
    closeDeleteModal,
    setPaginationFilter,
    // currentStatus,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    // isUserModalOpen,
    isChildData,
  } = useCompanyProject();

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
    { key: "projectName", label: "Project Name", visible: true },
    {
      key: "projectDeadline",
      label: "Project Deadline",
      visible: true,
    },
    { key: "projectDescription", label: "Project Description", visible: true },
    { key: "status", label: "Status", visible: true },
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
            Company Project List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-96"
            />
            <Link to="/dashboard/projects/add">
              <Button className="py-2 w-fit">Add Company Project</Button>
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
            tableData={projectlistdata?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
              //   assigneeNames: item.assignees[0]?.employeeName,
            }))}
            columns={visibleColumns} // Pass only visible columns to the Table
            primaryKey="projectId"
            onEdit={(row) =>
              navigate(`/dashboard/projects/edit/${row.projectId}`)
            }
            onDelete={(row) => {
              if (!row.isSuperAdmin) {
                onDelete(row);
              }
            }}
            canDelete={(row) => !row.isSuperAdmin}
            paginationDetails={projectlistdata}
            setPaginationFilter={setPaginationFilter}
            //   isLoading={isLoading}
            permissionKey="users"
            localStorageId="CompanyProjectList"
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

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCompanyProject from "./useCompanyProject";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import ViewMeetingModal from "./ViewProjectModal";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "../PageNoAccess";
import ConformationDeleteModal from "./conformationDeleteModal";

export default function CompanyProject() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Project", href: "" }]);
  }, [setBreadcrumbs]);

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
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    isLoading,
    projectStatusList,
  } = useCompanyProject();

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "projectName", label: "Project Name", visible: true },
    {
      key: "projectDeadline",
      label: "Project Deadline",
      visible: true,
    },
    { key: "projectDescription", label: "Project Description", visible: true },
    { key: "projectStatus", label: "Status", visible: true },
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

  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();
  const navigate = useNavigate();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full overflow-x-auto p-4">
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
        <div className="flex items-center justify-between space-x-5 tb:space-x-7">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-96"
          />
          <div className="flex items-center space-x-3">
            <DropdownSearchMenu
              label="Status"
              options={statusOptions}
              selected={filters?.selected}
              onChange={(selected) => {
                handleFilterChange(selected);
              }}
              multiSelect
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

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={projectlistdata?.data.map((item, index) => ({
              ...item,
              srNo:
                (projectlistdata.currentPage - 1) * projectlistdata.pageSize +
                index +
                1,
              projectDeadline: item.projectDeadline
                ? new Date(item.projectDeadline).toISOString().split("T")[0]
                : "",
              // Keep projectStatus as the original object for type compatibility
              status: item.projectStatusId,
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
            onViewButton={(row) => {
              navigate(`/dashboard/projects/view/${row.projectId}`);
            }}
            paginationDetails={mapPaginationDetails(projectlistdata)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="PROJECT_LIST"
            showIndexColumn={false}
            isActionButton={() => true}
            viewButton={true}
            permissionKey="users"
            dropdownColumns={{
              projectStatus: {
                options: (projectStatusList?.data ?? []).map((opt) => ({
                  label: opt.projectStatus,
                  value: opt.projectStatusId,
                  color: opt.color || "#2e3195",
                })),
                onChange: (row, value) => handleStatusChange(value, row),
              },
            }}
            actionColumnWidth="w-[130px] overflow-hidden "
            onRowClick={(row) => {
              handleRowsModalOpen(row as unknown as IProjectFormData);
            }}
            sortableColumns={["projectName", "projectDeadline"]}
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConformationDeleteModal
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        <ViewMeetingModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </FormProvider>
  );
}

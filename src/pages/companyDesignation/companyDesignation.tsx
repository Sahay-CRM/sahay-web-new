import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyDesignation from "./useCompanyDesignation";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";

import { Button } from "@/components/ui/button";
import DesignationAddFormModal from "./designationFormModal/designationAddFormModal";
import SearchInput from "@/components/shared/SearchInput";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import PageNotAccess from "../PageNoAccess";

export default function CompanyDesignation() {
  const {
    designationList,
    closeDeleteModal,
    setPaginationFilter,
    handleAdd,
    openModal,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    addDesignationModal,
    isChildData,
    permission,
    isLoading,
  } = useCompanyDesignation();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Company Designation", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "designationName", label: "Designation Name", visible: true },
    {
      key: "departmentName",
      label: "Department Name",
      visible: true,
    },
    { key: "parentName", label: "Parent Designation", visible: true },
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
  // Check if the number of columns is more than 3
  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Designation List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="">
                <Button className="py-2 w-fit" onClick={handleAdd}>
                  Add Designation
                </Button>
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
          </div>{" "}
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
            tableData={designationList?.data.map(
              (item: DesignationDataProps, index: number) => ({
                ...item,
                srNo:
                  (designationList.currentPage - 1) * designationList.pageSize +
                  index +
                  1,
              }),
            )}
            columns={visibleColumns} // Pass only visible columns to the Table
            primaryKey="designationId"
            onEdit={(row) => openModal(row as unknown as DesignationData)}
            onDelete={(row) => onDelete(row as unknown as DesignationData)}
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            paginationDetails={mapPaginationDetails(designationList)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            permissionKey="users"
            moduleKey="DESIGNATION"
            sortableColumns={[
              "designationName",
              "departmentName",
              "parentName",
            ]}
          />
        </div>
        {addDesignationModal && (
          <DesignationAddFormModal
            isModalOpen={addDesignationModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}

        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Designation Name"}
            label={"Designation Name :"}
            modalData={`${modalData?.designationName}`}
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

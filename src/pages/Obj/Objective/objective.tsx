import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/shared/SearchInput";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useObjective from "./useObjective";
import PageNotAccess from "@/pages/PageNoAccess";
import ObjectiveFormModal from "./ObjectiveFormModal/objectiveAddFormModal";

export default function Objective() {
  const {
    addModal,
    objectiveList,
    modalData,
    isChildData,
    isDeleteModalOpen,
    openModal,
    handleAdd,
    onDelete,
    conformDelete,
    isLoading,
    permission,
    paginationFilter,
    setPaginationFilter,
    closeDeleteModal,
  } = useObjective();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Objective", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "objectiveName", label: "Objective Name", visible: true },
    { key: "isResolved", label: "isResolved", visible: true },
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
     <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Objective List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="">
                <Button className="py-2 w-fit" onClick={handleAdd}>
                  Add Objective
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
            tableData={objectiveList?.data.map(
              (item: ObjectiveProps, index: number) => ({
                ...item,
                srNo:
                  (objectiveList.currentPage - 1) * objectiveList.pageSize +
                  index +
                  1,
              }),
            )}
            columns={visibleColumns}
            primaryKey="objectiveId"
            onEdit={(row) => openModal(row as unknown as ObjectiveProps)}
            onDelete={(row) => onDelete(row as unknown as ObjectiveProps)}
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            paginationDetails={mapPaginationDetails(objectiveList)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            permissionKey="users"
            moduleKey="DESIGNATION"
            actionColumnWidth="w-[100px] overflow-hidden "
            // sortableColumns={[
            //   "designationName",
            //   "departmentName",
            //   "parentName",
            // ]}
          />
        </div>
        {addModal && (
          <ObjectiveFormModal
            isModalOpen={addModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}

        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete Objective"}
            label={"Objective :"}
            modalData={`${modalData?.objectiveName}`}
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import useCompanyDesignation from "./useCompanyDesignation";
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
import PageNotAccess from "@/pages/PageNoAccess";
import CalenderFormModal from "../companyImportantDates/calenderFormModal/CalenderFormModal";
import ConfirmationDeleteModal from "./ConfirmDesignationDeleteModal";
import { format } from "date-fns";

export default function CompanyDesignation() {
  const {
    importantDatesList,
    setPaginationFilter,
    handleAddModal,
    addImportantDate,
    handleCloseModal,
    modalData,
    paginationFilter,
    permission,
    isLoading,
    openModal,
    onDelete,
    isDeleteModalOpen,
    conformDelete,
    closeDeleteModal,
  } = useCompanyDesignation();

  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Calendar", href: "/dashboard/calendar" },
      { label: "important Dates", href: "", isHighlight: true },
    ]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "importantDateName", label: "Important Date Name", visible: true },
    { key: "importantDate", label: "Date", visible: true },
    { key: "importantDateRemarks", label: "Remarks", visible: true },
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
            important Date List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="">
                <Button className="py-2 w-fit" onClick={handleAddModal}>
                  Add Important Date
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
            tableData={importantDatesList?.data.map((item, index) => ({
              ...item,
              srNo:
                (importantDatesList.currentPage - 1) *
                  importantDatesList.pageSize +
                index +
                1,
              importantDate: item.importantDate
                ? format(new Date(item.importantDate), "dd/MM/yyyy hh:mm a")
                : "-",
            }))}
            columns={visibleColumns}
            primaryKey="importantDateId"
            onEdit={(row) =>
              openModal(row as unknown as ImportantDatesDataProps)
            }
            onDelete={(row) =>
              onDelete(row as unknown as ImportantDatesDataProps)
            }
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            paginationDetails={mapPaginationDetails(importantDatesList)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            permissionKey="users"
            moduleKey="IMPORTANT_DATE"
            actionColumnWidth="w-[100px] overflow-hidden "
          />
        </div>
      </div>
      {isDeleteModalOpen && (
        <ConfirmationDeleteModal
          title={"Delete Important Date"}
          modalData={modalData}
          isModalOpen={isDeleteModalOpen}
          modalClose={closeDeleteModal}
          onSubmit={conformDelete}
          // isChildData={isChildData}
        />
      )}
      {addImportantDate && (
        <CalenderFormModal
          isModalOpen={addImportantDate}
          modalClose={handleCloseModal}
          modalData={modalData}
        />
      )}
    </FormProvider>
  );
}

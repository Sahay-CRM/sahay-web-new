import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
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
import useIssues from "./useIssues";
import PageNotAccess from "@/pages/PageNoAccess";
import IssueFormModal from "./IssuesFormModal/issuesAddFormModal";
import IssueDeleteModal from "./issueDeleteModal";
import FormSelect from "@/components/shared/Form/FormSelect";
import { RotateCcw } from "lucide-react";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";

const dataFilterOption = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Active",
    value: "false",
  },
  {
    label: "Inactive",
    value: "true",
  },
];

export default function Issues() {
  const {
    addModal,
    issueList,
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
    conformForceDelete,
    isDataFilter,
    setIsDataFilter,
    handleRestoreIssue,
    isDeleteOpen,
  } = useIssues();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Issues", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "issueName", label: "Issues Name", visible: true },
    { key: "isResolved", label: "isResolved", visible: true },
    { key: "departmentName", label: "Department Name", visible: true },
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
            Issues List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            <FormSelect
              value={isDataFilter}
              options={dataFilterOption}
              onChange={(ele) => {
                setIsDataFilter(ele as string);
              }}
              triggerClassName="mb-0"
            />
            {permission.Add && (
              <Link to="">
                <Button className="py-2 w-fit" onClick={handleAdd}>
                  Add Issues
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
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
            tableData={issueList?.data.map(
              (item: IssuesProps, index: number) => ({
                ...item,
                srNo:
                  (issueList.currentPage - 1) * issueList.pageSize + index + 1,
              }),
            )}
            columns={visibleColumns}
            primaryKey="issueId"
            onEdit={(row) => openModal(row as unknown as IssuesProps)}
            onDelete={(row) => onDelete(row as unknown as IssuesProps)}
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            paginationDetails={mapPaginationDetails(issueList)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            permissionKey="users"
            moduleKey="DESIGNATION"
            actionColumnWidth="w-[130px] overflow-hidden "
            customActions={(row) => {
              return (
                <>
                  {isDataFilter === "true" && (
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleRestoreIssue(row)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  {isDataFilter === "all" && row.isDelete && (
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleRestoreIssue(row)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </>
              );
            }}
          />
        </div>
        {addModal && (
          <IssueFormModal
            isModalOpen={addModal}
            modalClose={closeDeleteModal}
            modalData={modalData}
          />
        )}

        {isDeleteModalOpen && (
          <IssueDeleteModal
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            onForceSubmit={conformForceDelete}
            modalData={modalData}
            isChildData={isChildData}
          />
        )}
        {isDeleteOpen && (
          <ConfirmationDeleteModal
            title={"are you sure to Delete this Issue"}
            label={"Issue Name :"}
            modalData={`${modalData?.issueName}`}
            isModalOpen={isDeleteOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformForceDelete}
          />
        )}
      </div>
    </FormProvider>
  );
}

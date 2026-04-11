import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRequestMasterList } from "./useRequestMasterList";
import SearchInput from "@/components/shared/SearchInput";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TableData from "@/components/shared/DataTable/DataTable";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import { format } from "date-fns";

import { UpdateStatusModal } from "./UpdateStatusModal";

export default function RequestMasterList() {
  const {
    requestData,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    onDelete,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedRequest,
    setSelectedRequest,
    onUpdateStatus,
    filters,
    handleFilterChange,
    statusOptions,
    typeOptions,
  } = useRequestMasterList();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Request Master", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "type", label: "Type", visible: true },
    { key: "oldValue", label: "Old Value", visible: true },
    { key: "newValue", label: "New Value", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "reasions", label: "Reasons", visible: true },
    { key: "employeeName", label: "Requested By", visible: true },
    { key: "createdDatetime", label: "Date", visible: true },
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

  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-3 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Request Master List
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div>
            <SearchInput
              placeholder="Search..."
              searchValue={paginationFilter?.search || ""}
              setPaginationFilter={setPaginationFilter}
              className="w-80"
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <div>
              <DropdownSearchMenu
                label="Status"
                options={statusOptions}
                selected={filters.status || []}
                onChange={(selected) => {
                  handleFilterChange("status", selected);
                }}
                multiSelect
              />
            </div>
            <div>
              <DropdownSearchMenu
                label="Type"
                options={typeOptions}
                selected={filters.type || []}
                onChange={(selected) => {
                  handleFilterChange("type", selected);
                }}
                multiSelect
              />
            </div>
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
          </div>
        </div>

        <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
          <TableData
            tableData={requestData?.data.map(
              (item: RequestMasterData, index: number) => ({
                ...item,
                srNo:
                  (requestData.currentPage - 1) * requestData.pageSize +
                  index +
                  1,
                requestMasterId: item.requestMasterId || item.id,
                id: item.id || item.requestMasterId,
                employeeName: item.createdBy?.employeeName || " - ",
                createdDatetime: item.createdDatetime
                  ? format(new Date(item.createdDatetime), "dd/MM/yyyy h:mm aa")
                  : " - ",
                oldValue: item.oldValue
                  ? format(new Date(item.oldValue), "dd/MM/yyyy h:mm aa")
                  : " - ",
                newValue: item.newValue
                  ? format(new Date(item.newValue), "dd/MM/yyyy h:mm aa")
                  : " - ",
              }),
            )}
            columns={visibleColumns}
            primaryKey="requestMasterId"
            onEdit={(row: RequestMasterData) => {
              setSelectedRequest(row);
              setIsUpdateModalOpen(true);
            }}
            onDelete={(row: RequestMasterData) => {
              onDelete(row.requestMasterId);
            }}
            paginationDetails={mapPaginationDetails(requestData)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            // moduleKey="user"
            isActionButton={() => true}
            actionColumnWidth="w-[120px]"
            isEditDeleteShow={true}
          />
        </div>

        {isUpdateModalOpen && (
          <UpdateStatusModal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedRequest(null);
            }}
            data={selectedRequest as RequestMasterData}
            onSubmit={(requestMasterId, status) => {
              onUpdateStatus(requestMasterId, status);
            }}
          />
        )}
      </div>
    </FormProvider>
  );
}

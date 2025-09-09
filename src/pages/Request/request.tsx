import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useRequest from "./useRequest";
import FormSelect from "@/components/shared/Form/FormSelect";

export default function Request() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Requests", href: "" }]);
  }, [setBreadcrumbs]);

  const {
    reqData,
    paginationFilter,
    setPaginationFilter,
    isLoading,
    isDataFilter,
    setIsDataFilter,
  } = useRequest();

  // Column visibility state
  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "requestType", label: "Request Type", visible: true },
    { key: "requesterNote", label: "Request Notes", visible: true },
    { key: "requestStatus", label: "Request Status", visible: true },
    { key: "reviewerNote", label: "Review Notes", visible: true },
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

  // if (permission && permission.View === false) {
  //   return <PageNotAccess />;
  // }

  const dataFilterOption = [
    {
      label: "All",
      value: "ALL",
    },
    {
      label: "pending",
      value: "PENDING",
    },
    {
      label: "Approved",
      value: "APPROVED",
    },
    {
      label: "Rejected",
      value: "REJECTED",
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Requests
          </h1>
          <div>
            <FormSelect
              value={isDataFilter}
              options={dataFilterOption}
              onChange={(ele) => {
                setIsDataFilter(ele as string);
              }}
            />
          </div>
          {/* <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Button className="py-2 w-fit" onClick={handleAdd}>
                Add Product
              </Button>
            )}
          </div> */}
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
            tableData={reqData?.data.map((item, index) => ({
              ...item,
              srNo: (reqData.currentPage - 1) * reqData.pageSize + index + 1,
            }))}
            columns={visibleColumns}
            primaryKey="changeRequestId"
            // onEdit={openModal}
            // onDelete={onDelete}
            paginationDetails={mapPaginationDetails(reqData)}
            setPaginationFilter={setPaginationFilter}
            isLoading={isLoading}
            moduleKey="PRODUCT"
            showIndexColumn={false}
            showActionsColumn={false}
            permissionKey="users"
            sortableColumns={["productName", "brandName"]}
          />
        </div>
      </div>
    </FormProvider>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import useCompanyTaskList from "./useDatapointList";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import SearchInput from "@/components/shared/SearchInput";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ViewKPIDetailModal from "./ViewKPIDetailModal";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
export default function CompanyTaskList() {
  const {
    datpointData,
    isLoading,
    closeDeleteModal,
    setPaginationFilter,
    permission,
    onDelete,
    modalData,
    conformDelete,
    isDeleteModalOpen,
    paginationFilter,
    isChildData,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
  } = useCompanyTaskList();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI List", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "KPINameWithLabel", label: "KPI Name - Label", visible: true },
    {
      key: "KPIName",
      label: "KPI Name",
      visible: true,
    },
    { key: "KPILabel", label: "KPI Label", visible: true },
    { key: "validationType", label: "Validation Type", visible: true },
    { key: "frequencyType", label: "Frequency", visible: true },
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
            KPI List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Link to="/dashboard/kpi/add">
                <Button className="py-2 w-fit">Add KPI</Button>
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
          </div>

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
            key={datpointData?.currentPage}
            tableData={datpointData?.data.map((item, index) => ({
              ...item,
              srNo: index + 1,
              KPINameWithLabel: `${item.KPIName} - ${item.KPILabel}`,
            }))}
            columns={visibleColumns}
            primaryKey="dataPointId"
            onDelete={(row) => {
              onDelete(row);
            }}
            onEdit={
              permission.Edit
                ? (row) => {
                    navigate(`/dashboard/kpi/edit/${row.dataPointId}`);
                  }
                : undefined
            }
            onRowClick={(row) => {
              handleRowsModalOpen(row as unknown as KPIFormData);
            }}
            isLoading={isLoading}
            isActionButton={() => true}
            paginationDetails={mapPaginationDetails(datpointData)}
            setPaginationFilter={setPaginationFilter}
            permissionKey="users"
            localStorageId="KpiList"
            moduleKey="DATAPOINT_LIST"
            sortableColumns={[
              "KPIName",
              "KPILabel",
              "validationType",
              "frequencyType",
            ]}
          />
        </div>

        {/* Modal Component */}
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete KPI"}
            label={"KPI Name :"}
            modalData={`${modalData?.dataPointLabel}`}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
          />
        )}
        <ViewKPIDetailModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </FormProvider>
  );
}

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import TableData from "@/components/shared/DataTable/DataTable";
import useDashboardRegistry from "./useDashboardRegistry";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export default function DashboardReport() {
  const navigate = useNavigate();
  const {
    reports,
    closeModal,
    setPaginationFilter,
    onDelete,
    modalData,
    confirmDelete,
    isDeleteModalOpen,
    paginationFilter,
    permission,
    isLoading,
  } = useDashboardRegistry();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard Report", href: "/dashboard/report-builder" },
    ]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "report_name", label: "Widget Name", visible: true },
    { key: "module", label: "Module", visible: true },
    { key: "metric", label: "Metric", visible: true },
    { key: "visualization", label: "Visualization", visible: true },
    { key: "createdAt", label: "Created At", visible: true },
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

  const canToggleColumns = columnToggleOptions.length > 3;
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full px-2 sm:px-4 py-6 flex flex-col overflow-hidden">
        <div className="flex mb-5 justify-between items-center shrink-0">
          <h1 className="font-semibold capitalize text-xl text-black">
            Widget List
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {permission.Add && (
              <Button
                className="py-2 w-fit"
                onClick={() => navigate("/dashboard/report-builder/add")}
              >
                Add Widget
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 shrink-0">
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

        <div className="flex-1 bg-white overflow-hidden flex flex-col rounded-md shadow-sm mt-3 tb:mt-6 pt-2 tb:pt-4">
          <TableData
            tableHeightClass="flex-1"
            tableData={reports?.data?.map((item, index: number) => ({
              ...item,
              srNo:
                ((paginationFilter?.currentPage || 1) - 1) *
                  (paginationFilter?.pageSize || 25) +
                index +
                1,
              report_name: item.report_name || item.widgetName,
              module: item.module || item.moduleKey,
              metric: (item.metric || item.metricKey || "").replace(/_/g, " "),
              createdAt: new Date(item.createdAt).toLocaleDateString(),
            }))}
            columns={visibleColumns}
            primaryKey="id"
            onEdit={(row: DashboardRegistryReport) =>
              navigate(`/dashboard/report-builder/edit/${row.id}`)
            }
            onDelete={(row: DashboardRegistryReport) => onDelete(row)}
            isActionButton={() =>
              columnToggleOptions.some((col) => col.visible)
            }
            paginationDetails={mapPaginationDetails(reports)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            isLoading={isLoading}
            permissionKey="dashboard"
            moduleKey="TASK"
            sortableColumns={[
              "report_name",
              "module",
              "metric",
              "visualization",
            ]}
            actionColumnWidth="w-[100px] overflow-hidden "
          />
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={(open) => !open && closeModal()}
        >
          <DialogContent className="max-w-md p-6 rounded-2xl border-none shadow-2xl">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-center">
                Delete Widget
              </DialogTitle>
              <p className="text-sm text-gray-500 text-center">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  {modalData?.widgetName || "this widget"}
                </span>
                ? This action cannot be undone.
              </p>
            </DialogHeader>
            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
}

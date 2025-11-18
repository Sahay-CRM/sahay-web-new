import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import PageNotAccess from "../PageNoAccess";
import { formatFrequencyType } from "@/features/utils/app.utils";
import EditDatapointAddFormModal from "./EditDatapointFormModal/editDatapointAddFormModal";
import TableData from "@/components/shared/DataTable/DataTableKpi";
import ConfirmationDeleteModal from "./ConfirmationKPIDeleteModal";

const validationOptions = [
  { value: "EQUAL_TO", label: "= Equal to" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: ">= Greater than or equal to" },
  { value: "GREATER_THAN", label: "> Greater than" },
  { value: "LESS_THAN", label: "< Less than" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
  { value: "BETWEEN", label: "Between" },
  { value: "YES_NO", label: "Yes/No" },
];

// Helper to get label from value
function getValidationLabel(value: string) {
  const found = validationOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
}
// Add this helper function in your file
// function getFrequencySymbol(value: string) {
//   switch (value) {
//     case "DAILY":
//       return "D";
//     case "WEEKLY":
//       return "W";
//     case "MONTHLY":
//       return "M";
//     case "QUARTERLY":
//       return "Q";
//     case "HALF_YEARLY":
//       return "H";
//     case "YEARLY":
//       return "Y";
//     default:
//       return value;
//   }
// }
// Helper to get only the symbol from the label
function getValidationSymbol(value: string) {
  const found = validationOptions.find((opt) => opt.value === value);
  if (!found) return value;
  const label = found.label;
  const symbolMatch = label.match(/^[^a-zA-Z\s]+/);
  return symbolMatch ? symbolMatch[0].trim() : label;
}
// Add this helper function in your file, likely near the others
function getInitials(name: string) {
  if (!name || name.trim() === "") {
    return "-";
  }

  // Split the name by spaces
  const nameParts = name.trim().split(" ");

  // If there's more than one word, get the first letter of each
  if (nameParts.length > 1) {
    return nameParts.map((word) => word.charAt(0).toUpperCase()).join("");
  }

  // If there's only one word, return just the first letter in uppercase
  return name.charAt(0).toUpperCase();
}
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
    onForceSubmit,
    isEditModalOpen,
    isEditKpiId,
    setIsEditKpiId,
    setIsEditModalOpen,
  } = useCompanyTaskList();
  console.log(modalData);

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI List", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    {
      key: "KPIName",
      label: "KPI Name",
      visible: true,
      tooltipColumn: "KPILabel",
    },
    {
      key: "tag",
      label: "Tag",
      visible: true,
    },
    {
      key: "employeeName",
      label: "Assigned",
      visible: true,
      tooltipColumn: "employeeFullName",
    },
    {
      key: "validationType",
      label: "Validation",
      visible: true,
      tooltipColumn: "validationTypeFullLabel",
    },
    {
      key: "goal",
      label: "Goal",
      visible: true,
    },
    {
      key: "unit",
      label: "Unit",
      visible: true,
    },
    {
      key: "frequencyType",
      label: "Frequency",
      visible: true,
    },
    {
      key: "coreParameterName",
      label: "Business Function Name",
      visible: true,
    },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) {
        acc[col.key] = {
          label: col.label,
          tooltipColumn: col.tooltipColumn,
        };
      }
      return acc;
    },
    {} as Record<string, { label: string; tooltipColumn?: string }>,
  );

  // Toggle column visibility
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
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
        <div className="bg-white">
          <TableData
            key={datpointData?.currentPage}
            tableData={datpointData?.data.map((item, index) => ({
              ...item,
              srNo:
                (datpointData.currentPage - 1) * datpointData.pageSize +
                index +
                1,

              validationType: getValidationSymbol(item.validationType),
              validationTypeFullLabel: getValidationLabel(item.validationType),
              frequencyType: formatFrequencyType(item.frequencyType),
              // frequencyType: getFrequencySymbol(item.frequencyType),
              // frequencyTypeFullName: formatFrequencyType(item.frequencyType),
              goal:
                item.validationType === "YES_NO"
                  ? item.value1 === "1"
                    ? "Yes"
                    : "No"
                  : item.value2
                    ? `${item.value1} to ${item.value2}`
                    : `${item.value1}`,
              employeeName: getInitials(item.employeeName || ""), // Use initials for the display
              employeeFullName: item.employeeName,
            }))}
            columns={visibleColumns}
            primaryKey="kpiId"
            onDelete={(row) => {
              onDelete(row);
            }}
            onEdit={
              permission.Edit
                ? (row) => {
                    if (row.kpiId) {
                      setIsEditKpiId(row.kpiId);
                      setIsEditModalOpen(true);
                    }
                  }
                : undefined
            }
            onRowClick={(row) => {
              handleRowsModalOpen(row);
            }}
            isLoading={isLoading}
            isActionButton={() => true}
            paginationDetails={mapPaginationDetails(datpointData)}
            setPaginationFilter={setPaginationFilter}
            searchValue={paginationFilter?.search}
            permissionKey="users"
            localStorageId="KpiList"
            moduleKey="DATAPOINT_LIST"
            sortableColumns={[
              "KPIName",
              "KPILabel",
              "validationType",
              "frequencyType",
              "coreParameterName",
            ]}
            actionColumnWidth="w-[100px] overflow-hidden "
          />
        </div>
        {isDeleteModalOpen && (
          <ConfirmationDeleteModal
            title={"Delete KPI"}
            modalData={modalData}
            isModalOpen={isDeleteModalOpen}
            modalClose={closeDeleteModal}
            onSubmit={conformDelete}
            isChildData={isChildData}
            onForceSubmit={onForceSubmit}
          />
        )}
        {isEditModalOpen && (
          <EditDatapointAddFormModal
            modalClose={closeDeleteModal}
            kpiId={isEditKpiId}
            isModalOpen={isEditModalOpen}
          />
        )}
        <ViewKPIDetailModal
          isModalOpen={isViewModalOpen}
          modalData={viewModalData}
          modalClose={() => setIsViewModalOpen(false)}
          onEdit={(kpiId) => {
            setIsViewModalOpen(false);
            setIsEditKpiId(kpiId);
            setIsEditModalOpen(true);
          }}
        />
      </div>
    </FormProvider>
  );
}

import { useState, useEffect } from "react";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useNavigate } from "react-router-dom";
import {
  useDeleteKPIMerge,
  useGetAllKpiMerge,
} from "@/features/api/companyDatapoint";
import ConfirmationDeleteModal from "@/components/shared/Modal/ConfirmationDeleteModal/ConfirmationDeleteModal";
import TableData from "@/components/shared/DataTable/DataTableKpi";
import { formatFrequencyType, getInitials } from "@/features/utils/app.utils";
import { getColorFromName } from "@/features/utils/formatting.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const validationOptions = [
  { value: "EQUAL_TO", label: "= Equal to" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: ">= Greater than or equal to" },
  { value: "GREATER_THAN", label: "> Greater than" },
  { value: "LESS_THAN", label: "< Less than" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
  { value: "BETWEEN", label: "Between" },
  { value: "YES_NO", label: "Yes/No" },
];

function getValidationLabel(value: string) {
  const found = validationOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
}

function getValidationSymbol(value: string) {
  const found = validationOptions.find((opt) => opt.value === value);
  if (!found) return value;
  const label = found.label;
  const symbolMatch = label.match(/^[^a-zA-Z\s]+/);
  return symbolMatch ? symbolMatch[0].trim() : label;
}

export default function GroupKpis() {
  const navigate = useNavigate();
  const { data: apiData, isLoading } = useGetAllKpiMerge();
  const { setBreadcrumbs } = useBreadcrumbs();

  const deleteMutation = useDeleteKPIMerge();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);
  const [groupNameToDelete, setGroupNameToDelete] = useState("");

  const onDeleteClick = (groupId: string, groupName: string) => {
    setGroupIdToDelete(groupId);
    setGroupNameToDelete(groupName);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (groupIdToDelete) {
      deleteMutation.mutate(groupIdToDelete, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setGroupIdToDelete(null);
          setGroupNameToDelete("");
        },
      });
    }
  };

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Group", href: "" }]);
  }, [setBreadcrumbs]);

  const onEditClick = (groupId: string) => {
    navigate(`/dashboard/kpi/group-kpis/edit/${groupId}`);
  };

  const columnToggleOptions = [
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
      key: "isBase",
      label: "Base KPI",
      visible: true,
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
  ];

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

  const formattedData = (apiData || []).flatMap((group) => {
    const baseKpiIds = group.baseKpiIds || [];

    return (group.kpis || []).map((item) => {
      const isBase = baseKpiIds.includes(item.kpiId);

      return {
        ...item,
        kpiMergeId: group.kpiMergeId,
        kpiMergeName: group.kpiMergeName,
        kpiMergeNameCombined: group.kpiMergeName,

        // Mapped fields that TableData expects
        isBase: isBase ? "	Base KPI" : "-",
        validationType: getValidationSymbol(item.validationType),
        validationTypeFullLabel: getValidationLabel(item.validationType),
        frequencyType: formatFrequencyType(item.frequencyType),
        goal:
          item.validationType === "YES_NO"
            ? item.value1 === "1"
              ? "Yes"
              : "No"
            : item.value2
              ? `${item.value1} to ${item.value2}`
              : `${item.value1 ?? " - "}`,
        employeeName: getInitials(item.employeeName || ""),
        employeeFullName: item.employeeName,
        createdByFullName: item.createdBy,
        createdByEmployeeName: getInitials(item.createdBy || ""),

        isActive: !item.isDelete,
      };
    });
  });

  return (
    <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
      <div className="w-full text-right shrink-0">
        <Button
          className="py-2 w-fit mb-5"
          onClick={() => navigate("/dashboard/kpi/group-kpis/add")}
        >
          Create Group KPIs
        </Button>
      </div>

      <div className="flex h-[calc(100vh-195px)] flex-col overflow-hidden bg-white rounded-md shadow-sm">
        <TableData
          tableHeightClass="flex-1"
          key={formattedData.length}
          tableData={formattedData}
          columns={visibleColumns}
          primaryKey="kpiId"
          groupBy="kpiMergeNameCombined"
          onGroupEdit={(_groupName, firstItem) => {
            onEditClick(firstItem.kpiMergeId as string);
          }}
          onGroupDelete={(_groupName, firstItem) => {
            onDeleteClick(firstItem.kpiMergeId as string, firstItem.kpiMergeName as string);
          }}
          isLoading={isLoading}
          isActionButton={() => true}
          permissionKey="users"
          moduleKey="DATAPOINT_LIST"
          showActionsColumn={true}
          extraColumns={[
            {
              label: "Added",
              width: "w-[80px]",
              render: (row) => {
                return (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-7 h-7 bg-primary text-white flex items-center justify-center aspect-square rounded-full text-[12px] font-medium ${getColorFromName(row.createdBy as string)}`}
                        >
                          {row.createdByEmployeeName}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{row.createdBy as string}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              },
            },
          ]}
        />
      </div>

      <ConfirmationDeleteModal
        title="Delete Group KPI"
        label="Are you sure you want to delete this Group KPI?"
        modalData={groupNameToDelete}
        isModalOpen={isDeleteModalOpen}
        modalClose={() => {
          setIsDeleteModalOpen(false);
          setGroupIdToDelete(null);
          setGroupNameToDelete("");
        }}
        onSubmit={handleConfirmDelete}
      />
    </div>
  );
}

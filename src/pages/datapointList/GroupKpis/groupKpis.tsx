import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpinnerIcon } from "@/components/shared/Icons";
import { Fragment, useEffect } from "react";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import { Button } from "@/components/ui/button";
import { useDdAllKpiList } from "@/features/api/KpiList";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GroupKpis() {
  const navigate = useNavigate();
  const { data: datpointData, isLoading } = useDdAllKpiList({
    filter: { mergeFlag: true },
    enable: true,
  });
  const { setBreadcrumbs } = useBreadcrumbs();

  const selectedKpis: string[] = [];

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Group", href: "" }]);
  }, [setBreadcrumbs]);

  const groupedData = datpointData?.data?.reduce(
    (acc, item) => {
      if (!item.kpiId) return acc;

      const masterId = item.kpiMergeId || "undefined-group";
      if (!acc[masterId]) acc[masterId] = [];
      acc[masterId].push(item);
      return acc;
    },
    {} as Record<string, KPIFormData[]>,
  );

  const isGroupSelected = (masterId: string) => {
    if (!groupedData || !groupedData[masterId]) return false;
    return groupedData[masterId].some((item) =>
      selectedKpis.includes(item.kpiId!),
    );
  };

  const onEditClick = (groupId: string) => {
    navigate(`/dashboard/kpi/group-kpis/edit/${groupId}`);
  };

  return (
    <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
      <div>
        <Button
          className="py-2 w-fit mb-5"
          onClick={() => navigate("/dashboard/kpi/group-kpis/add")}
        >
          Create Group KPIs
        </Button>
      </div>

      <div className="flex h-[calc(100vh-195px)] flex-col overflow-hidden">
        <Table className="min-w-full h-full table-fixed">
          <TableHeader className="sticky top-0 z-15 bg-primary shadow-sm">
            <TableRow>
              <TableHead className="w-[60px] sticky left-0 z-20 bg-primary">
                Sr No
              </TableHead>
              <TableHead className="min-w-[200px]">KPI Name</TableHead>
              <TableHead className="min-w-[200px]">KPI Label</TableHead>
              <TableHead className="min-w-[200px]">Core Parameter</TableHead>
              <TableHead className="min-w-[150px]">Tag</TableHead>
              <TableHead className="min-w-[150px]">Validation Type</TableHead>
              <TableHead className="min-w-[150px]">Frequency</TableHead>
              <TableHead className="min-w-[100px]">Unit</TableHead>
              <TableHead className="min-w-[150px]">Value1</TableHead>
              <TableHead className="min-w-[150px]">Value2</TableHead>
              <TableHead className="text-end w-16">Delete</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <div className="flex justify-center items-center h-20 animate-spin">
                    <SpinnerIcon />
                  </div>
                </TableCell>
              </TableRow>
            ) : groupedData && Object.keys(groupedData).length ? (
              Object.entries(groupedData).map(([masterId, groupItems]) => (
                <Fragment key={masterId}>
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={11}
                      className="font-semibold left-0 bg-gray-100 relative"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          {groupItems[0]?.kpiMergeName || "Unnamed Group"} - (
                          {groupItems[0].coreParameterName})
                          {isGroupSelected(masterId) && (
                            <span className="ml-2 text-sm text-green-600">
                              (Selected)
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                          <Edit
                            size={16}
                            className="cursor-pointer"
                            onClick={() => onEditClick(masterId)}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {groupItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-25" : "bg-white"}
                    >
                      <TableCell>{item.srNo}</TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.KPIName ?? " - ")} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.KPILabel ?? " - ")} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip
                          text={String(item.coreParameterName ?? " - ")}
                        />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.tag ?? " - ")} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip
                          text={String(item.validationType ?? " - ")}
                        />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip
                          text={String(item.frequencyType ?? " - ")}
                        />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.unit ?? " - ")} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.value1 ?? " - ")} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={String(item.value2 ?? " - ")} />
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No Data Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


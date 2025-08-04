import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpinnerIcon } from "@/components/shared/Icons";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { Fragment, useEffect, useState } from "react";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import { Button } from "@/components/ui/button";
import GroupKpisFormModal from "./GroupKPIsFormModal";
import { useDdAllKpiList } from "@/features/api/KpiList";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function GroupKpisCreate() {
  const { data: datpointData, isLoading } = useDdAllKpiList({
    filter: {},
    enable: true,
  });
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "KPI Group", href: "/dashboard/kpi/group-kpis" },
      { label: "Create KPI Group", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedKpiData, setSelectedKpiData] = useState<KPIFormData[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const groupedData = datpointData?.data?.reduce(
    (acc, item) => {
      if (!item.kpiId) return acc;

      const masterId = item.KPIMasterId || "undefined-group";
      if (!acc[masterId]) {
        acc[masterId] = [];
      }
      acc[masterId].push(item as KpiAllList);
      return acc;
    },
    {} as Record<string, KPIFormData[]>,
  );

  const isGroupSelected = (masterId: string) => {
    if (!groupedData || !groupedData[masterId]) return false;
    return groupedData[masterId].some((item) => {
      if (!item.kpiId) return null;
      selectedKpis.includes(item.kpiId);
    });
  };

  const toggleKpiSelection = (kpiId: string, masterId: string) => {
    if (selectedGroup && selectedGroup !== masterId) {
      return;
    }

    setSelectedKpis((prev) => {
      const newSelection = prev.includes(kpiId)
        ? prev.filter((id) => id !== kpiId)
        : [...prev, kpiId];

      if (newSelection.length === 1) {
        setSelectedGroup(masterId);
      } else if (newSelection.length === 0) {
        setSelectedGroup(null);
      }

      if (groupedData) {
        const allItems = Object.values(groupedData).flat();
        const newSelectedData = allItems.filter((item) =>
          newSelection.includes(item.kpiId!),
        );
        setSelectedKpiData(newSelectedData);
      }

      return newSelection;
    });
  };

  const isCheckboxDisabled = (masterId: string) => {
    return selectedGroup !== null && selectedGroup !== masterId;
  };

  const modalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
      <div>
        <Button
          className="py-2 w-fit mb-5 "
          disabled={selectedKpis.length === 0}
          onClick={handleModalOpen}
        >
          Create Group
        </Button>
      </div>

      <div className="flex h-[calc(100vh-195px)] flex-col overflow-hidden">
        <Table className="min-w-full h-full table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-primary shadow-sm">
            <TableRow>
              <TableHead className="w-[40px] sticky left-0 z-40 bg-primary">
                #
              </TableHead>
              <TableHead className="w-[50px] sticky left-0 z-40 bg-primary">
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
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="py-6 w-full">
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin">
                      <SpinnerIcon />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : groupedData && Object.keys(groupedData).length ? (
              Object.entries(groupedData).map(([masterId, groupItems]) => (
                <Fragment key={masterId}>
                  <TableRow
                    key={`group-${masterId} + 1`}
                    className="bg-gray-100"
                  >
                    <TableCell
                      colSpan={11}
                      className="font-semibold sticky left-0 bg-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          {groupItems[0]?.KPIName || "Unnamed Group"}
                          {isGroupSelected(masterId) && (
                            <span className="ml-2 text-sm text-green-600">
                              (Selected)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {groupItems.map((item, index) => (
                    <TableRow
                      key={index + 1}
                      className={`${
                        index % 2 === 0 ? "bg-gray-25" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <TableCell
                        className="sticky left-0 bg-inherit text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FormCheckbox
                          id={`${item.kpiId}-checkbox`}
                          className="w-[16px] h-[16px]"
                          containerClass="p-0 ml-1"
                          onChange={() =>
                            toggleKpiSelection(item.kpiId!, masterId)
                          }
                          checked={selectedKpis.includes(item.kpiId!)}
                          disabled={isCheckboxDisabled(masterId)}
                        />
                      </TableCell>
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
                <TableCell colSpan={10} className="text-center">
                  No Data Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isModalOpen && (
        <GroupKpisFormModal
          isModalOpen={isModalOpen}
          selectedKpisIds={selectedKpis}
          selectedKpiData={selectedKpiData}
          modalClose={modalClose}
        />
      )}
    </div>
  );
}

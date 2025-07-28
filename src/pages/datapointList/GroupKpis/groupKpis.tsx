import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpinnerIcon } from "@/components/shared/Icons";
import { Fragment, useEffect, useState, useRef } from "react";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import { Button } from "@/components/ui/button";
import GroupKpisFormModal from "./GroupKPIsFormModal";
import { useDdAllKpiList } from "@/features/api/KpiList";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { addUpdateKpiMergeMutation } from "@/features/api/companyDatapoint";
import { Link } from "react-router-dom";
import useGetAvailableKpis from "@/features/api/companyDatapoint/useGetAvailableKpis";

export default function GroupKpis() {
  const { data: datpointData, isLoading } = useDdAllKpiList({
    filter: { mergeFlag: true },
    enable: true,
  });
  const { setBreadcrumbs } = useBreadcrumbs();

  const selectedKpis: string[] = [];

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: addUpdateKpiGroup } = addUpdateKpiMergeMutation();
  const { mutate: addGetAvailableKpi } = useGetAvailableKpis();

  // State to store dropdown options by group masterId
  const [dropdownOptions, setDropdownOptions] = useState<
    Record<string, KPIFormData[]>
  >({});

  // Track which dropdown is open
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "KPI Group", href: "" }]);
  }, [setBreadcrumbs]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownKey(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const groupedData = datpointData?.data?.reduce(
    (acc, item) => {
      if (!item.kpiId) return acc;

      const masterId = item.kpiMergeId || "undefined-group";
      if (!acc[masterId]) acc[masterId] = [];
      acc[masterId].push(item);
      return acc;
    },
    {} as Record<string, KPIFormData[]>
  );

  const isGroupSelected = (masterId: string) => {
    if (!groupedData || !groupedData[masterId]) return false;
    return groupedData[masterId].some((item) =>
      selectedKpis.includes(item.kpiId!)
    );
  };

  const modalClose = () => {
    setIsModalOpen(false);
  };

  const onEditClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsModalOpen(true);
  };

  const handleDelete = (deletedItem: KPIFormData) => {
    const masterId = deletedItem.kpiMergeId;
    if (!masterId || !groupedData?.[masterId]) return;

    const remainingItems = groupedData[masterId].filter(
      (item) => item.kpiId !== deletedItem.kpiId
    );
    const remainingIds = remainingItems
      .map((item) => item.kpiId)
      .filter((id): id is string => typeof id === "string");

    const payload = {
      kpiMergeId: masterId,
      kpiIds: remainingIds,
    };
    addUpdateKpiGroup(payload);
  };

  const handlePlusClick = (kpiMergeId: string, kpiMasterId: string) => {
    const payload = {
      kpiMergeId,
      kpiMasterId,
    };

    addGetAvailableKpi(payload, {
      onSuccess: (res) => {
        setDropdownOptions((prev) => ({
          ...prev,
          [kpiMergeId]: res.data || [],
        }));
        setOpenDropdownKey(kpiMergeId);
      },
    });
  };
  const handleDropdownSelect = (option: KPIFormData) => {
    if (!openDropdownKey) return;

    const currentItems = groupedData?.[openDropdownKey] || [];
    const existingIds = currentItems.map((item) => item.kpiId);

    const payload = {
      kpiMergeId: openDropdownKey,
      kpiIds: [...existingIds, option.kpiId]
        .filter((v, i, a) => a.indexOf(v) === i)
        .filter((v): v is string => typeof v === "string"),
    };

    addUpdateKpiGroup(payload);
    setOpenDropdownKey(null);
  };

  return (
    <div>
      <div>
        <Link to="/dashboard/kpi/group-create">
          <Button className="py-2 w-fit mb-5">Create Group KPIs</Button>
        </Link>
      </div>

      <div className="flex h-[calc(100vh-195px)] flex-col overflow-hidden">
        <Table className="min-w-full h-full table-fixed">
          <TableHeader className="sticky top-0 z-50 bg-primary shadow-sm">
            <TableRow>
              <TableHead className="w-[60px] sticky left-0 z-40 bg-primary">
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
              <TableHead className="w-[60px] text-end">Delete</TableHead>
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
                      className="font-semibold  left-0 bg-gray-100 relative"
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
                        <div className="relative flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                          <PlusCircle
                            size={16}
                            className="cursor-pointer"
                            onClick={() =>
                              handlePlusClick(
                                masterId,
                                groupItems[0]?.KPIMasterId ?? ""
                              )
                            }
                          />

                          {/* Dropdown */}
                          {openDropdownKey === masterId &&
                            dropdownOptions[masterId] && (
                              <div
                                ref={dropdownRef}
                                className="absolute top-full right-0 z-20 mt-1 max-h-60 w-80 overflow-auto rounded border bg-white shadow-lg"
                              >
                                {dropdownOptions[masterId].length ? (
                                  <>
                                    {/* Header Row */}
                                    {/* Header Row */}
                                    <div className="flex items-center font-semibold text-sm text-white px-3 py-2 border-b bg-primary sticky top-0 z-10">
                                      <span className="w-1/2">KPI Name</span>
                                      <span className="w-1/2">KPI Label</span>
                                    </div>

                                    {/* Option Rows */}
                                    {dropdownOptions[masterId].map(
                                      (option, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center cursor-pointer px-3 py-2 hover:bg-gray-100 border-b text-sm text-gray-800"
                                          onClick={() =>
                                            handleDropdownSelect(option)
                                          }
                                          title={`${option.KPIName} - ${option.KPILabel}`}
                                        >
                                          <span className="truncate w-1/2">
                                            {option.KPIName}
                                          </span>
                                          <span className="truncate w-1/2 text-gray-500">
                                            {option.KPILabel}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </>
                                ) : (
                                  <div className="p-3 text-center text-gray-500">
                                    No options available
                                  </div>
                                )}
                              </div>
                            )}

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
                        <TableTooltip text={item.KPIName ?? " - "} />
                      </TableCell>
                      <TableCell className="truncate">
                        {item.KPILabel ?? " - "}
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={item.coreParameterName ?? " - "} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={item.tag ?? " - "} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={item.validationType ?? " - "} />
                      </TableCell>
                      <TableCell className="truncate">
                        <TableTooltip text={item.frequencyType ?? " - "} />
                      </TableCell>
                      <TableCell className="truncate">
                        {item.unit ?? " - "}
                      </TableCell>
                      <TableCell className="truncate">
                        {item.value1 ?? " - "}
                      </TableCell>
                      <TableCell className="truncate">
                        {item.value2 ?? " - "}
                      </TableCell>
                      <TableCell className="truncate text-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
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

      {isModalOpen && (
        <GroupKpisFormModal
          isModalOpen={isModalOpen}
          selectedKpisIds={selectedKpis}
          modalClose={modalClose}
          groupId={selectedGroupId}
        />
      )}
    </div>
  );
}

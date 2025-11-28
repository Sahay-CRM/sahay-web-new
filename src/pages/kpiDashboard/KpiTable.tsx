import React from "react";
import { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
import useKpiDashboard from "./useKpiDashboard";
import {
  formatCompactNumber,
  formatTempValuesToPayload,
  getColorFromName,
  getKpiHeadersFromData,
  isValidInput,
} from "@/features/utils/formatting.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormProvider, useForm } from "react-hook-form";
import Loader from "@/components/shared/Loader/Loader";
import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";
import { Button } from "@/components/ui/button";
import { RefreshCcw, GripVertical, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TabsSection from "./TabSection";
import {
  addUpdateKpi,
  useGetKpiDashboardStructure,
} from "@/features/api/kpiDashboard";
import { updateKPISequenceMutation } from "@/features/api/KpiList";
import WarningDialog from "./WarningModal";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
  getValidationKeyId,
} from "@/features/selectors/auth.selector";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
// import CommentModal from "./KpiCommentModal";
import { twMerge } from "tailwind-merge";
import CommentModal from "./KpiCommentModal";
import SearchInput from "@/components/shared/SearchInput";
import MultiIconSelect from "@/components/shared/Form/FormSelect/MultiIconSelect";
import KpiDetailsSheet from "./KpiDetailsSheet";

function isKpiDataCellArrayArray(data: unknown): data is KpiDataCell[][] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(data[0]) &&
    (data[0].length === 0 ||
      (typeof data[0][0] === "object" &&
        data[0][0] !== null &&
        "kpiId" in data[0][0]))
  );
}

function formatToThreeDecimals(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
}

// Active item types for drag and drop
interface ActiveGroupItem {
  type: "group";
  data: {
    coreParameter: {
      coreParameterId: string;
      coreParameterName: string;
    };
    kpis: Array<{
      kpi: {
        kpiId: string;
        kpiName: string;
        employeeName?: string;
        tag?: string;
        validationType: string;
        goalValue?: number;
        value1: string | number | null;
        value2?: string | number | null;
        unit?: string | null;
      };
    }>;
  };
}

interface ActiveKpiItem {
  type: "kpi";
  data: {
    kpiId: string;
    kpiName: string;
    employeeName?: string;
    tag?: string;
    validationType: string;
    goalValue?: number;
    value1: string | number | null;
    value2?: string | number | null;
    unit?: string | null;
  };
}

type ActiveItem = ActiveGroupItem | ActiveKpiItem | null;
type KpiType = {
  kpiId: string;
  kpiName: string;
  kpiLabel?: string;
  employeeName?: string;
  tag?: string;
  validationType: string;
  goalValue?: number;
  value1: string | number | null;
  value2?: string | number | null;
  unit?: string | null;
};

// Sortable KPI Row Component
interface SortableKpiRowProps {
  id: string;
  selectedPeriod?: string;
  onRowClick?: (kpi: KpiType) => void;
  kpi: KpiType;
  disabled?: boolean;
  isDragging?: boolean;
  showDragHandle?: boolean;
  getFormattedValue: (
    validationType: string,
    value1: string | number | null,
    value2?: string | number | null,
    unit?: string | null,
  ) => string;
}

function SortableKpiRow({
  id,
  kpi,
  disabled = false,
  isDragging = false,
  showDragHandle = true,
  getFormattedValue,
  selectedPeriod,
  onRowClick,
}: SortableKpiRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      // className={`group/row border-b bg-gray-50 ${isDragging ? "pointer-events-none" : ""} ${isSortableDragging ? "z-10" : ""}`}
      className={clsx(
        "group/row border-b bg-gray-50 transition-all duration-150",
        isDragging ? "pointer-events-none" : "",
        isSortableDragging ? "z-10" : "",
        "hover:outline  cursor-pointer hover:outline-primary hover:outline-offset-[-1px]",
      )}
      {...attributes}
      onClick={() => {
        if (kpi.validationType === "YES_NO") return;
        onRowClick?.(kpi);
      }}
    >
      <td className="p-3  w-[75px] h-[55px]">
        <div className="flex items-center gap-2">
          {showDragHandle && (
            <div
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover/row:opacity-100 transition-opacity"
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <Avatar className="h-6 w-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AvatarFallback
                    className={clsx(
                      "font-semibold",
                      getColorFromName(kpi?.employeeName),
                    )}
                  >
                    {(() => {
                      if (!kpi?.employeeName) return "";
                      const names = kpi.employeeName.split(" ");
                      const firstInitial = names[0]?.[0] ?? "";
                      const lastInitial =
                        names.length > 1 ? names[names.length - 1][0] : "";
                      return (firstInitial + lastInitial).toUpperCase();
                    })()}
                  </AvatarFallback>
                </TooltipTrigger>
                <TooltipContent>{kpi?.employeeName}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Avatar>
        </div>
      </td>
      <td className="px-3 border w-[180px] text-left h-[59px] align-middle">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="line-clamp-2 break-words cursor-default">
                {kpi?.kpiName}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>{kpi?.kpiLabel}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-3 border w-[130px] text-left h-[59px] align-middle">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="line-clamp-2 break-words cursor-default">
                {kpi?.tag}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>{kpi?.tag}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-3 border w-[130px] text-left h-[59px] align-middle">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="line-clamp-2 break-words cursor-default">
                {kpi.validationType === "YES_NO" ? (
                  <>
                    {selectedPeriod === "DAILY" ? (
                      Number(kpi.value1) === 1 ? (
                        "Yes"
                      ) : (
                        "No"
                      )
                    ) : (
                      <>
                        {formatToThreeDecimals(kpi.goalValue)} {" - "}
                        {Number(kpi.value1) === 1 ? "Yes" : "No"}
                      </>
                    )}
                  </>
                ) : (
                  getFormattedValue(
                    kpi.validationType,
                    String(kpi?.goalValue),
                    kpi?.value2,
                    kpi?.unit,
                  )
                )}
              </span>
            </TooltipTrigger>

            {/* ✅ Tooltip logic remains same */}
            {(() => {
              const rawValue = String(kpi.value1 ?? "");
              const formattedNormal = formatToThreeDecimals(kpi.goalValue);
              const formattedCompact = formatCompactNumber(kpi.value1);

              const shouldShowTooltip =
                formattedCompact !== formattedNormal &&
                formattedCompact !== rawValue &&
                formattedCompact !== "" &&
                formattedNormal !== "";

              return (
                shouldShowTooltip && (
                  <TooltipContent>
                    <span>
                      {kpi.validationType === "BETWEEN"
                        ? `${formatToThreeDecimals(kpi?.value1)} - ${formatToThreeDecimals(
                            kpi?.value2,
                          )}`
                        : formattedNormal}
                    </span>
                  </TooltipContent>
                )
              );
            })()}
          </Tooltip>
        </TooltipProvider>
      </td>
    </tr>
  );
}

// Sortable Core Parameter Group Component
interface SortableCoreParameterGroupProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  isDragging?: boolean;
  showDragHandle?: boolean;
}

function SortableCoreParameterGroup({
  id,
  children,
  disabled = false,
  isDragging = false,
  showDragHandle = true,
}: SortableCoreParameterGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`sticky top-[50px] bg-blue-50 z-10 h-[39px] group/group ${isDragging ? "pointer-events-none" : ""} ${isSortableDragging ? "z-20" : ""}`}
      {...attributes}
    >
      <td colSpan={4} className="p-2 text-blue-800 font-bold">
        <div className="flex items-center gap-2">
          {showDragHandle && (
            <div
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover/group:opacity-100 transition-opacity"
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          {children}
        </div>
      </td>
    </tr>
  );
}

// interface SortConfig {
//   key: string;
//   direction: "asc" | "desc";
// }
export default function UpdatedKpiTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  const userData = useSelector(getUserDetail);
  const [isDataFilter, setIsDataFilter] = useState("default");
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const urlSelectedPeriod = searchParams.get("selectedType");
  const [selectedPeriod, setSelectedPeriod] = useState(urlSelectedPeriod || "");
  useEffect(() => {
    if (selectedPeriod === "DAILY") {
      setIsDataFilter("default");
    }
  }, [selectedPeriod]);
  // const [sortConfig, setSortConfig] = useState<SortConfig>({
  //   key: "sequence",
  //   direction: "asc",
  // });
  const finalFilterValue =
    selectedPeriod === "DAILY" ? "default" : isDataFilter;
  const { data: kpiStructure, isLoading: isKpiStructureLoading } =
    useGetKpiDashboardStructure({
      filter: {
        sortBy: "sequence",
        sortOrder: "asc",
        filter: finalFilterValue,
      },
    });

  const employeeOptions =
    kpiStructure?.data
      ?.flatMap((item) => item.kpis?.flatMap((k) => k.kpis ?? [])) // flatten nested levels
      ?.filter((k) => k.employeeId != null) // remove undefined/null IDs
      ?.map((k) => ({
        label: k.employeeName,
        value: k.employeeId as string, // now safe
      })) ?? [];

  const uniqueEmployeeOptions = Array.from(
    new Map(employeeOptions.map((item) => [item.value, item])).values(),
  );

  // const [selectOpen, setSelectOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const permission = useSelector(getUserPermission).DATAPOINT_TABLE;
  const permissionSequence = useSelector(getUserPermission).KPI_SEQ;
  const navigate = useNavigate();
  const location = useLocation();
  const leftScrollRef = React.useRef<HTMLDivElement>(null);
  const rightScrollRef = React.useRef<HTMLDivElement>(null);
  const [selectedKpi, setSelectedKpi] = useState<SelectedKpi | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  type SelectedKpi = KpiType & {
    details: KpiDataCell[];
    selectedPeriod: string;
  };
  const handleRowClick = (kpi: KpiType) => {
    if (!kpiData?.data) {
      return;
    }

    const flatKpiData: KpiDataCell[] = kpiData.data.flat();

    const matchingDetails = flatKpiData.filter(
      (item) => item.kpiId === kpi.kpiId,
    );

    if (matchingDetails.length > 0) {
      const combinedKpi: SelectedKpi = {
        ...kpi,
        selectedPeriod: selectedPeriod,
        details: matchingDetails,
      };
      setSelectedKpi(combinedKpi);
      setIsSheetOpen(true);
    }
  };

  useEffect(() => {
    if (!isKpiStructureLoading && kpiStructure?.data?.length) {
      const urlSelectedPeriod = searchParams.get("selectedType");
      const availablePeriods = kpiStructure.data.map(
        (item) => item.frequencyType,
      );
      const newPeriod =
        urlSelectedPeriod && availablePeriods.includes(urlSelectedPeriod)
          ? urlSelectedPeriod
          : kpiStructure.data[0].frequencyType;

      if (newPeriod !== selectedPeriod) {
        setSelectedPeriod(newPeriod);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiStructure, isKpiStructureLoading, searchParams]);

  const [searchTerm, setSearchTerm] = useState<PaginationFilter>({
    search: "",
  });

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [currentCellKey, setCurrentCellKey] = useState<string>("");
  const [commentModalInput, setCommentModalInput] = useState<{
    note: string;
    noteId?: string;
  }>({
    note: "",
    noteId: "",
  });

  const canDrag = userData?.isSuperAdmin || permissionSequence?.Edit;

  const [tempValues, setTempValues] = useState<{
    [key: string]: { value: string; comment?: string };
  }>({});

  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);
  const { mutate: updateSequence } = updateKPISequenceMutation();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setIsDragging(true);

    // Find the active item data for the overlay
    const activeData = String(active.id).split(":");
    if (activeData[0] === "group") {
      const group = groupedKpiRows?.find(
        (g) => g.coreParameter.coreParameterId === activeData[1],
      );
      if (group) {
        setActiveItem({ type: "group", data: group });
      }
    } else if (activeData[0] === "kpi") {
      const group = groupedKpiRows?.find(
        (g) => g.coreParameter.coreParameterId === activeData[2],
      );
      const kpi = group?.kpis.find((k) => k.kpi.kpiId === activeData[1]);
      if (kpi?.kpi) {
        setActiveItem({ type: "kpi", data: kpi.kpi });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveItem(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Extract drag type and data from IDs
    const activeData = String(active.id).split(":");
    const overData = String(over.id).split(":");

    if (activeData[0] === "group" && overData[0] === "group") {
      // Handle core parameter group reordering
      handleGroupReorder(activeData[1], overData[1]);
    } else if (activeData[0] === "kpi" && overData[0] === "kpi") {
      // Handle KPI reordering within groups
      handleKpiReorder(activeData[1], overData[1], activeData[2], overData[2]);
    }
  };

  // Helper functions for reordering
  const handleGroupReorder = (activeGroupId: string, overGroupId: string) => {
    if (!groupedKpiRows) return;

    const activeIndex = groupedKpiRows.findIndex(
      (group) => group.coreParameter.coreParameterId === activeGroupId,
    );
    const overIndex = groupedKpiRows.findIndex(
      (group) => group.coreParameter.coreParameterId === overGroupId,
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      const newOrder = arrayMove(groupedKpiRows, activeIndex, overIndex);
      const kpiIds = newOrder.flatMap((group) =>
        group.kpis.map((k) => k.kpi.kpiId),
      );

      updateSequence({
        frequencyType: selectedPeriod,
        kpiSequenceArray: kpiIds,
      });
    }
  };

  const handleKpiReorder = (
    activeKpiId: string,
    overKpiId: string,
    activeGroupId: string,
    overGroupId: string,
  ) => {
    // Only allow reordering within the same group
    if (activeGroupId !== overGroupId || !groupedKpiRows) return;

    const groupIndex = groupedKpiRows.findIndex(
      (group) => group.coreParameter.coreParameterId === activeGroupId,
    );

    if (groupIndex === -1) return;

    const group = groupedKpiRows[groupIndex];
    const activeKpiIndex = group.kpis.findIndex(
      (k) => k.kpi.kpiId === activeKpiId,
    );
    const overKpiIndex = group.kpis.findIndex((k) => k.kpi.kpiId === overKpiId);

    if (activeKpiIndex !== -1 && overKpiIndex !== -1) {
      const newKpis = arrayMove(group.kpis, activeKpiIndex, overKpiIndex);
      const newGroups = [...groupedKpiRows];
      newGroups[groupIndex] = { ...group, kpis: newKpis };

      const kpiIds = newGroups.flatMap((g) => g.kpis.map((k) => k.kpi.kpiId));

      updateSequence({
        frequencyType: selectedPeriod,
        kpiSequenceArray: kpiIds,
      });
    }
  };

  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (
      data: unknown,
      title: string,
      url?: string | URL | null,
    ) {
      if (
        Object.keys(tempValues).length > 0 &&
        url &&
        url !== location.pathname
      ) {
        const targetPath = typeof url === "string" ? url : url?.toString();
        if (targetPath && targetPath !== location.pathname) {
          setPendingNavigation(targetPath);
          setShowWarning(true);
          return;
        }
      }
      return originalPushState.call(this, data, title, url);
    };

    history.replaceState = function (
      data: unknown,
      title: string,
      url?: string | URL | null,
    ) {
      if (
        Object.keys(tempValues).length > 0 &&
        url &&
        url !== location.pathname
      ) {
        const targetPath = typeof url === "string" ? url : url?.toString();
        if (targetPath && targetPath !== location.pathname) {
          setPendingNavigation(targetPath);
          setShowWarning(true);
          return;
        }
      }
      return originalReplaceState.call(this, data, title, url);
    };

    const handleNavigation = (event: Event) => {
      if (Object.keys(tempValues).length > 0) {
        const target = event.target as HTMLElement;
        const isDrawerNavigation =
          target?.closest('li[class*="cursor-pointer"]') ||
          target?.closest('button[class*="hover:text-primary"]') ||
          target?.closest('li[class*="hover:text-primary"]') ||
          target?.closest("a[href]") ||
          target?.closest('div[class*="cursor-pointer"]') ||
          target?.closest('[data-sidebar="menu-button"]') ||
          target?.closest('[data-slot="sidebar-menu-button"]');

        if (isDrawerNavigation) {
          event.preventDefault();
          event.stopPropagation();
          let href = null;

          if (target.closest("a")) {
            href = target.closest("a")?.getAttribute("href");
          } else {
            const clickElement =
              target.closest("li") ||
              target.closest("button") ||
              target.closest("div");
            const textContent = clickElement?.textContent?.toLowerCase().trim();
            const routeMap: { [key: string]: string } = {
              "company designation": "/dashboard/company-designation",
              "company employee": "/dashboard/company-employee",
              calendar: "/dashboard/calendar",
              "meeting list": "/dashboard/meeting",
              "company task list": "/dashboard/tasks",
              "company project list": "/dashboard/projects",
              "kpi list": "/dashboard/kpi",
              "kpi dashboard": "/dashboard/kpi-dashboard",
              "health weightage": "/dashboard/business/health-weightage",
              "health score": "/dashboard/business/healthscore-achieve",
              "company level assign":
                "/dashboard/business/company-level-assign",
              "role & permission": "/dashboard/roles/user-permission",
              brand: "/dashboard/brand",
              product: "/dashboard/product",
              "user log": "/dashboard/user-log",
            };

            if (textContent) {
              href = routeMap[textContent];
            }
          }

          if (href && href !== location.pathname) {
            setPendingNavigation(href);
            setShowWarning(true);
          }
        }
      }
    };
    document.addEventListener("click", handleNavigation, true);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener("click", handleNavigation, true);
    };
  }, [tempValues, location.pathname]);

  useEffect(() => {
    if (selectedPeriod) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", selectedPeriod);
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedPeriod, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedPeriod && kpiStructure?.data && kpiStructure.data.length > 0) {
      setSelectedPeriod(kpiStructure.data[0].frequencyType);
    }
  }, [kpiStructure, selectedPeriod]);

  const { kpiData } = useKpiDashboard({
    selectedPeriod,
    selectedDate,
    isDataFilter: finalFilterValue,
  });
  const hasNoKpis = useMemo(() => {
    return !kpiStructure?.totalCount || kpiStructure.totalCount === 0;
  }, [kpiStructure]);

  const filteredData = useMemo(() => {
    return (
      kpiStructure?.data?.filter(
        (item) => item.frequencyType == selectedPeriod,
      ) ?? []
    );
  }, [kpiStructure, selectedPeriod]);
  const validationKeyString = useSelector(getValidationKeyId);
  const validationKey = Number(validationKeyString);

  const headers = getKpiHeadersFromData(
    isKpiDataCellArrayArray(kpiData?.data) ? kpiData.data : [],
    selectedPeriod,
  );

  // const groupedKpiRows = useMemo(() => {
  //   if (!filteredData.length || !filteredData[0].kpis) return [];

  //   const groups: {
  //     coreParameter: { coreParameterId: string; coreParameterName: string };
  //     kpis: { kpi: Kpi }[];
  //   }[] = [];

  //   (filteredData[0].kpis as CoreParameterGroup[]).forEach((coreParam) => {
  //     if (coreParam.kpis && Array.isArray(coreParam.kpis)) {
  //       const kpiRows = coreParam.kpis.map((kpi: Kpi) => ({ kpi }));
  //       groups.push({
  //         coreParameter: {
  //           coreParameterId: coreParam.coreParameterId,
  //           coreParameterName: coreParam.coreParameterName,
  //         },
  //         kpis: kpiRows,
  //       });
  //     }
  //   });

  //   return groups;
  // }, [filteredData]);

  // const groupedKpiRows = useMemo(() => {
  //   if (!filteredData.length || !filteredData[0].kpis) return [];
  //   const search = String(searchTerm.search ?? "").toLowerCase();
  //   console.log(filteredData, "filteredData");

  //   const groups: {
  //     coreParameter: { coreParameterId: string; coreParameterName: string };
  //     kpis: { kpi: Kpi }[];
  //   }[] = [];

  //   (filteredData[0].kpis as CoreParameterGroup[]).forEach((coreParam) => {
  //     if (coreParam.kpis && Array.isArray(coreParam.kpis)) {
  //       const filteredKpis = coreParam.kpis.filter((kpi: Kpi) => {
  //         const coreName = coreParam.coreParameterName?.toLowerCase() || "";
  //         const tag = kpi.tag?.toLowerCase() || "";
  //         const name = kpi.kpiName?.toLowerCase() || "";

  //         const match =
  //           coreName.includes(search) ||
  //           tag.includes(search) ||
  //           name.includes(search);

  //         return match;
  //       });

  //       if (filteredKpis.length > 0) {
  //         groups.push({
  //           coreParameter: {
  //             coreParameterId: coreParam.coreParameterId,
  //             coreParameterName: coreParam.coreParameterName,
  //           },
  //           kpis: filteredKpis.map((kpi) => ({ kpi })),
  //         });
  //       }
  //     }
  //   });
  //   return groups;
  // }, [filteredData, searchTerm]);

  const groupedKpiRows = useMemo(() => {
    if (!filteredData.length || !filteredData[0].kpis) return [];

    const search = String(searchTerm.search ?? "").toLowerCase();

    const groups: {
      coreParameter: { coreParameterId: string; coreParameterName: string };
      kpis: { kpi: Kpi }[];
    }[] = [];

    const selectedList = Array.isArray(selectedEmployees)
      ? selectedEmployees
      : selectedEmployees
        ? [selectedEmployees]
        : [];

    (filteredData[0].kpis as CoreParameterGroup[]).forEach((coreParam) => {
      if (coreParam.kpis && Array.isArray(coreParam.kpis)) {
        const filteredKpis = coreParam.kpis.filter((kpi: Kpi) => {
          const coreName = coreParam.coreParameterName?.toLowerCase() || "";
          const tag = kpi.tag?.toLowerCase() || "";
          const name = kpi.kpiName?.toLowerCase() || "";

          const matchesSearch =
            coreName.includes(search) ||
            tag.includes(search) ||
            name.includes(search);

          // ⭐ Employee Filter (supports multi + none)
          const matchesEmployee =
            selectedList.length === 0 ||
            selectedList.includes(String(kpi.employeeId));

          return matchesSearch && matchesEmployee;
        });

        if (filteredKpis.length > 0) {
          groups.push({
            coreParameter: {
              coreParameterId: coreParam.coreParameterId,
              coreParameterName: coreParam.coreParameterName,
            },
            kpis: filteredKpis.map((kpi) => ({ kpi })),
          });
        }
      }
    });

    return groups;
  }, [filteredData, searchTerm, selectedEmployees]);

  useEffect(() => {
    const syncScroll = (e: Event) => {
      if (leftScrollRef.current && rightScrollRef.current) {
        leftScrollRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
        rightScrollRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
      }
    };
    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;
    leftEl?.addEventListener("scroll", syncScroll);
    rightEl?.addEventListener("scroll", syncScroll);

    return () => {
      leftEl?.removeEventListener("scroll", syncScroll);
      rightEl?.removeEventListener("scroll", syncScroll);
    };
  }, [groupedKpiRows, headers]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(tempValues).length > 0) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tempValues]);

  const { mutate: addUpdateKpiData } = addUpdateKpi();

  useEffect(() => {
    if (isKpiDataCellArrayArray(kpiData?.data)) {
      const initialValues: { [key: string]: string } = {};
      kpiData.data.forEach((row: KpiDataCell[], rowIndex: number) => {
        row.forEach((cell: KpiDataCell, colIndex: number) => {
          initialValues[`${rowIndex}-${colIndex}`] =
            cell?.data?.toString() ?? "";
        });
      });
      setInputValues(initialValues);
      setTempValues({});
    }
  }, [kpiData]);

  const methods = useForm();

  function getFormattedValue(
    validationType: string,
    value1: string | number | null,
    value2?: string | number | null,
    unit?: string | null,
  ) {
    const formatted1 = formatCompactNumber(value1);
    const formatted2 = formatCompactNumber(value2);
    const safeUnit = unit ?? "";

    if (validationType === "BETWEEN") {
      return `${formatted1} ${safeUnit} - ${formatted2} ${safeUnit}`;
    }

    switch (validationType) {
      case "EQUAL_TO":
        return `= ${formatted1} ${safeUnit}`;
      case "GREATER_THAN":
        return `> ${formatted1} ${safeUnit}`;
      case "LESS_THAN":
        return `< ${formatted1} ${safeUnit}`;
      case "GREATER_THAN_OR_EQUAL_TO":
        return `≥ ${formatted1} ${safeUnit}`;
      case "LESS_THAN_OR_EQUAL_TO":
        return `≤ ${formatted1} ${safeUnit}`;
      case "YES_NO":
        return value1 === "1" ? "✓(Yes)" : "✗(No)";
      default:
        return formatted1;
    }
  }

  const handleSubmit = () => {
    addUpdateKpiData(formatTempValuesToPayload(tempValues));
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (Object.keys(tempValues).length > 0) {
      setPendingPeriod(newPeriod);
      setShowWarning(true);
    } else {
      setSelectedPeriod(newPeriod);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", newPeriod);
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleWarningSubmit = () => {
    handleSubmit();
    setTempValues({});
    setShowWarning(false);

    if (pendingPeriod) {
      setSelectedPeriod(pendingPeriod);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", pendingPeriod);
      setSearchParams(newParams, { replace: true });
      setPendingPeriod(null);
    }
    if (pendingNavigation) {
      setTimeout(() => {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }, 0);
    }
  };

  const handleWarningDiscard = () => {
    setTempValues({});
    setShowWarning(false);

    if (pendingPeriod) {
      setSelectedPeriod(pendingPeriod);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", pendingPeriod);
      setSearchParams(newParams, { replace: true });
      setPendingPeriod(null);
    }
    if (pendingNavigation) {
      setTimeout(() => {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }, 0);
    }
  };

  const handleWarningClose = () => {
    setPendingPeriod(null);
    setPendingNavigation(null);
    setShowWarning(false);
  };

  // const handleSort = (key: string) => {
  //   let direction: "asc" | "desc" = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    cellKey: string,
  ) => {
    setInputFocused((prev) => ({
      ...prev,
      [cellKey]: true,
    }));
    setTimeout(() => e.target.select(), 10);
  };

  const handleBlur = (cellKey: string) => {
    setInputFocused((prev) => ({
      ...prev,
      [cellKey]: false,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    cellKey: string,
  ) => {
    const val = e.target.value;

    // Only allow numbers, decimal point, and empty string
    const isValidNumber = /^-?\d*\.?\d*$/.test(val) || val === "";

    if (isValidNumber) {
      setInputValues((prev) => ({ ...prev, [cellKey]: val }));
      setTempValues((prev) => ({
        ...prev,
        [cellKey]: {
          ...prev[cellKey],
          value: val,
        },
      }));
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   const charCode = e.which ? e.which : e.keyCode;
  //   const char = String.fromCharCode(charCode);

  //   if (
  //     !/[\d.]/.test(char) &&
  //     charCode > 31 &&
  //     (charCode < 48 || charCode > 57)
  //   ) {
  //     e.preventDefault();
  //   }

  //   // Allow only one decimal point
  //   if (char === "." && e.currentTarget.value.includes(".")) {
  //     e.preventDefault();
  //   }
  // };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.which ? e.which : e.keyCode;
    const char = String.fromCharCode(charCode);

    // Allow digits, and minus
    if (!/[\d.-]/.test(char) && charCode > 31) {
      e.preventDefault();
    }

    // Only one decimal point
    if (char === "." && e.currentTarget.value.includes(".")) {
      e.preventDefault();
    }

    // Only one "-" and only at start
    if (char === "-" && e.currentTarget.selectionStart !== 0) {
      e.preventDefault();
    }
    if (char === "-" && e.currentTarget.value.includes("-")) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Validate pasted content
    const pastedText = e.clipboardData.getData("text");
    const isValidPaste = /^-?\d+$/.test(pastedText);

    if (!isValidPaste) {
      e.preventDefault();
    }
  };

  const dataFilterOption = [
    {
      label: "All",
      value: "default",
    },
    {
      label: "Edit",
      value: "edit",
    },
    {
      label: "Auto",
      value: "auto",
    },
  ];

  //   if (isLoading) {
  //     return <Loader />;
  //   }
  if (isKpiStructureLoading || !kpiStructure || !kpiData || !kpiData.data) {
    return <Loader />;
  }
  if (hasNoKpis) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No KPIs Available
          </h3>
          <p className="text-gray-500">
            Please add KPI first to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="sticky top-0 z-30 bg-white p-4 m-0">
        <div className="flex justify-between">
          <div className="flex justify-between items-center">
            <TabsSection
              selectedPeriod={selectedPeriod}
              onSelectPeriod={handlePeriodChange}
              kpiStructure={kpiStructure}
              isDataFilter={isDataFilter}
            />
          </div>
          <div className="flex gap-4 items-center justify-end">
            {Object.keys(tempValues).length > 0 && (
              <Button onClick={handleSubmit}>Submit</Button>
            )}

            {urlSelectedPeriod !== "DAILY" && (
              <div>
                <FormSelect
                  value={isDataFilter}
                  options={dataFilterOption}
                  onChange={(ele) => {
                    setIsDataFilter(ele as string);
                  }}
                  className="h-10"
                />
              </div>
            )}

            <SearchInput
              placeholder="Search..."
              searchValue={searchTerm?.search || ""}
              setPaginationFilter={setSearchTerm}
              className="w-80"
            />

            <FormDatePicker
              value={selectedDate}
              onSubmit={(date) => {
                setSelectedDate(date ?? null);
              }}
              className="w-[200px]"
              placeholder="Choose a date"
              periodType={
                selectedPeriod as
                  | "DAILY"
                  | "WEEKLY"
                  | "MONTHLY"
                  | "QUARTERLY"
                  | "HALFYEARLY"
                  | "YEARLY"
              }
            />
            {selectedDate && (
              <Button onClick={() => setSelectedDate(null)}>
                <RefreshCcw />
                Reset Date
              </Button>
            )}
          </div>
        </div>
      </div>

      {groupedKpiRows && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={canDrag ? handleDragStart : undefined}
          onDragEnd={canDrag ? handleDragEnd : undefined}
        >
          <div className="flex w-full gap-0 p-2">
            {/* LEFT TABLE */}
            <div
              ref={leftScrollRef}
              className="max-h-[78vh] overflow-y-scroll scrollbar-hide border shadow-sm"
              style={{ width: "500px", minWidth: "500px", maxWidth: "500px" }}
            >
              <table className="w-full table-fixed border-collapse text-sm bg-white">
                <thead className="bg-primary sticky top-0 z-20">
                  <tr>
                    <th
                      className="w-[75px] p-2 font-semibold text-white text-left h-[51px] cursor-pointer select-none"
                      // onClick={() => handleSort("employeeName")}
                    >
                      <div className="flex items-center ">
                        Who
                        <MultiIconSelect
                          value={selectedEmployees}
                          options={uniqueEmployeeOptions}
                          onChange={(v) => setSelectedEmployees(v)}
                          searchable
                          className="ml-0.5"
                        />
                      </div>
                      {/* {sortConfig.key === "employeeName" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                    {sortConfig.key !== "employeeName" && (
                      <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                    )} */}
                    </th>
                    <th
                      className="w-[190px] p-2 font-semibold text-white text-left h-[51px] cursor-pointer select-none"
                      // onClick={() => handleSort("KPIName")}
                    >
                      <div className="flex items-center gap-1">
                        KPI
                        {/* {sortConfig.key === "KPIName" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                    {sortConfig.key !== "KPIName" && (
                      <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                    )} */}
                      </div>
                    </th>
                    <th
                      className="w-[120px] p-2 font-semibold text-white text-left h-[51px] cursor-pointer select-none"
                      // onClick={() => handleSort("tag")}
                    >
                      <div className="flex items-center gap-1">
                        Tag
                        {/* {sortConfig.key === "tag" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                    {sortConfig.key !== "tag" && (
                      <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                    )} */}
                      </div>
                    </th>
                    <th className="w-[100px] p-2 font-semibold text-white text-left h-[51px]">
                      Goal
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={[
                    ...groupedKpiRows.map(
                      (group) => `group:${group.coreParameter.coreParameterId}`,
                    ),
                    ...groupedKpiRows.flatMap((group) =>
                      group.kpis.map(
                        ({ kpi }) =>
                          `kpi:${kpi.kpiId}:${group.coreParameter.coreParameterId}`,
                      ),
                    ),
                  ]}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody>
                    {groupedKpiRows.map((group) => (
                      <React.Fragment key={group.coreParameter.coreParameterId}>
                        <SortableCoreParameterGroup
                          id={`group:${group.coreParameter.coreParameterId}`}
                          isDragging={isDragging}
                          disabled={!canDrag}
                          showDragHandle={!!canDrag}
                        >
                          {group.coreParameter.coreParameterName}
                        </SortableCoreParameterGroup>
                        {group.kpis.map(({ kpi }) => (
                          <SortableKpiRow
                            key={kpi.kpiId}
                            id={`kpi:${kpi.kpiId}:${group.coreParameter.coreParameterId}`}
                            kpi={kpi}
                            isDragging={isDragging}
                            disabled={!canDrag}
                            showDragHandle={!!canDrag}
                            getFormattedValue={getFormattedValue}
                            selectedPeriod={selectedPeriod}
                            onRowClick={handleRowClick}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                    <KpiDetailsSheet
                      isOpen={isSheetOpen}
                      onOpenChange={setIsSheetOpen}
                      selectedKpi={selectedKpi}
                    />
                  </tbody>
                </SortableContext>
              </table>
            </div>

            <div className="overflow-x-auto border shadow-sm flex-1 bg-white">
              <div
                ref={rightScrollRef}
                className="max-h-[78vh] overflow-y-auto"
              >
                <table className="min-w-max border-collapse text-sm table-fixed">
                  <thead className="sticky top-0 z-20 bg-white h-[51px]">
                    <tr className="">
                      {headers.map((header, idx) => {
                        return (
                          <th
                            key={idx}
                            className={clsx(
                              "border p-2 min-w-[80px] font-semibold text-gray text-center h-[43px]",
                              header.isSunday &&
                                header.isHoliday &&
                                header.isSkipDay
                                ? "bg-blue-100"
                                : header.isSunday || header.isSkipDay
                                  ? "bg-gray-100"
                                  : header.isHoliday
                                    ? "bg-blue-100"
                                    : "",
                            )}
                          >
                            <div className="flex flex-col items-center leading-tight">
                              <span>{header.label}</span>
                              {header.year && (
                                <span className="text-xs text-muted-foreground">
                                  {header.year}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedKpiRows.map((group, idx) => (
                      <React.Fragment
                        key={(group.coreParameter.coreParameterId, idx)}
                      >
                        <tr className="sticky h-[39px] top-[50px] bg-blue-50 z-10">
                          <td
                            colSpan={headers.length}
                            className="p-2  border text-black font-bold"
                          >
                            {/* {group.coreParameter.coreParameterName} */}
                          </td>
                        </tr>
                        {group.kpis.map(({ kpi }) => {
                          let dataRow: KpiDataCell[] | undefined = undefined;
                          if (isKpiDataCellArrayArray(kpiData?.data)) {
                            dataRow = (kpiData.data as KpiDataCell[][]).find(
                              (cells) =>
                                Array.isArray(cells) &&
                                cells.length > 0 &&
                                cells[0].kpiId === kpi.kpiId,
                            );
                          }
                          return (
                            <tr key={kpi.kpiId} className="h-[50px]">
                              {headers.map((_, colIdx) => {
                                const cell = dataRow?.[colIdx];
                                const key = `${kpi.kpiId}/${cell?.startDate}/${cell?.endDate}`;
                                const validationType = cell?.validationType;
                                const value1 = cell?.value1;
                                const value2 = cell?.value2;
                                const inputVal =
                                  inputValues[key] ??
                                  cell?.data?.toString() ??
                                  "";
                                const inputnote =
                                  tempValues[key]?.comment ?? cell?.note ?? "";
                                const noteId = cell?.noteId ?? "";

                                const isVisualized = kpi?.isVisualized;
                                const canAdd = permission?.Add && !cell?.data;
                                const canEdit =
                                  permission?.Edit && !!cell?.data;
                                const canInput =
                                  !isVisualized && (canAdd || canEdit);

                                if (validationType == "YES_NO") {
                                  const selectOptions = [
                                    { value: "1", label: "Yes" },
                                    { value: "2", label: "No" },
                                  ];
                                  const isValid = inputVal === String(value1);

                                  return (
                                    <td
                                      key={colIdx}
                                      className={clsx(
                                        "p-2 border text-center w-[80px] h-[42px]",
                                        headers[colIdx].isSunday &&
                                          headers[colIdx].isHoliday &&
                                          headers[colIdx].isSkipDay
                                          ? "bg-blue-100"
                                          : headers[colIdx].isSunday ||
                                              headers[colIdx].isSkipDay
                                            ? "bg-gray-100"
                                            : headers[colIdx].isHoliday
                                              ? "bg-blue-100"
                                              : "",
                                      )}
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div
                                              className={twMerge(
                                                "relative border  rounded-sm text-sm w-[80px] h-[42px] bg-white group",
                                                cell?.data !== "-" &&
                                                  inputVal !== "" &&
                                                  selectedPeriod !== "YEARLY" &&
                                                  (isValid
                                                    ? "bg-green-100 "
                                                    : "bg-red-100 "),
                                                cell?.data !== "-" &&
                                                  isVisualized &&
                                                  cell?.validationPercentage !=
                                                    null &&
                                                  (cell.validationPercentage ===
                                                  100
                                                    ? "bg-green-200"
                                                    : cell.validationPercentage <
                                                        validationKey
                                                      ? "bg-red-200"
                                                      : "bg-yellow-200"),

                                                isVisualized &&
                                                  "opacity-60 cursor-not-allowed",
                                                cell?.isSkipDay &&
                                                  "cursor-not-allowed",
                                              )}
                                            >
                                              {!isVisualized ? (
                                                <FormSelect
                                                  value={inputVal}
                                                  onChange={
                                                    canInput
                                                      ? (val) => {
                                                          setInputValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [key]:
                                                                Array.isArray(
                                                                  val,
                                                                )
                                                                  ? val.join(
                                                                      ", ",
                                                                    )
                                                                  : String(val),
                                                            }),
                                                          );
                                                          setTempValues(
                                                            (prev) => ({
                                                              ...prev,
                                                              [key]: {
                                                                value:
                                                                  Array.isArray(
                                                                    val,
                                                                  )
                                                                    ? val.join(
                                                                        ", ",
                                                                      )
                                                                    : String(
                                                                        val,
                                                                      ),
                                                                comment:
                                                                  prev[key]
                                                                    ?.comment ??
                                                                  cell?.note ??
                                                                  "",
                                                              },
                                                            }),
                                                          );
                                                        }
                                                      : () => {}
                                                  }
                                                  options={selectOptions}
                                                  placeholder="Select"
                                                  disabled={!canInput}
                                                  triggerClassName="text-sm px-1 text-center justify-center border-none"
                                                />
                                              ) : (
                                                <div className="flex flex-col items-center  justify-center h-full w-full cursor-not-allowed">
                                                  <span className="text-black">
                                                    {inputFocused[key]
                                                      ? inputVal
                                                      : formatCompactNumber(
                                                          cell?.matchCount,
                                                        )}
                                                  </span>
                                                </div>
                                              )}
                                              <div
                                                className={clsx(
                                                  "transition-opacity",
                                                  inputnote &&
                                                    inputnote.trim() !== "" &&
                                                    inputnote !== "0"
                                                    ? "opacity-100"
                                                    : "opacity-0 group-hover:opacity-100",
                                                )}
                                              >
                                                {/* {canInput && !isVisualized && ( */}
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    {inputnote &&
                                                    inputnote.trim() !== "" &&
                                                    inputnote !== "0" ? (
                                                      <span
                                                        className="absolute top-[1px] right-[1px] w-3 h-3 rounded-tr-sm cursor-pointer overflow-hidden"
                                                        style={{
                                                          background:
                                                            inputVal !== "" &&
                                                            validationType &&
                                                            selectedPeriod !==
                                                              "YEARLY"
                                                              ? isValidInput(
                                                                  validationType,
                                                                  inputVal,
                                                                  value1 ??
                                                                    null,
                                                                  value2 ??
                                                                    null,
                                                                )
                                                                ? "linear-gradient(to bottom left, #5b8f65 50%, transparent 55%)" // valid → greenish
                                                                : "linear-gradient(to bottom left, #fca5a5 50%, transparent 55%)" // invalid → reddish
                                                              : "linear-gradient(to bottom left, #2e3090 50%, white 55%)",
                                                          borderBottomLeftRadius:
                                                            "5px",
                                                        }}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setCurrentCellKey(
                                                            key,
                                                          );
                                                          setCommentModalInput({
                                                            note: inputnote,
                                                            noteId,
                                                          });
                                                          setCommentModalOpen(
                                                            true,
                                                          );
                                                        }}
                                                      ></span>
                                                    ) : (
                                                      <span
                                                        className="absolute border-l border-b border-gray-300 top-[1px] right-[1px] w-4 h-4  cursor-pointer flex items-center justify-center rounded-bl-md text-xs font-bold text-gray-600"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setCurrentCellKey(
                                                            key,
                                                          );
                                                          setCommentModalInput({
                                                            note: "",
                                                            noteId: "",
                                                          });

                                                          setCommentModalOpen(
                                                            true,
                                                          );
                                                        }}
                                                      >
                                                        <Plus className="w-3 h-3 text-gray-700" />
                                                      </span>
                                                    )}
                                                  </TooltipTrigger>{" "}
                                                  <TooltipContent>
                                                    <span>
                                                      {inputnote &&
                                                      inputnote.trim() !== "" &&
                                                      inputnote !== "0"
                                                        ? "View note"
                                                        : "Add note"}
                                                    </span>
                                                  </TooltipContent>
                                                </Tooltip>
                                                {/* )} */}
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </td>
                                  );
                                }
                                return (
                                  <td
                                    key={colIdx}
                                    className={clsx(
                                      "p-2 border text-center w-[80px] h-[42px] relative",
                                      headers[colIdx].isSunday &&
                                        headers[colIdx].isHoliday &&
                                        headers[colIdx].isSkipDay
                                        ? "bg-blue-100"
                                        : headers[colIdx].isSunday ||
                                            headers[colIdx].isSkipDay
                                          ? "bg-gray-100"
                                          : headers[colIdx].isHoliday
                                            ? "bg-blue-100"
                                            : "",
                                      // cell?.isSkipDay && "bg-gray-300"
                                    )}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="relative w-full h-full group">
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              value={
                                                inputFocused[key]
                                                  ? inputVal
                                                  : formatCompactNumber(
                                                      inputVal,
                                                    )
                                              }
                                              onFocus={
                                                canInput
                                                  ? (e) => handleFocus(e, key)
                                                  : undefined
                                              }
                                              onBlur={
                                                canInput
                                                  ? () => handleBlur(key)
                                                  : undefined
                                              }
                                              onChange={
                                                canInput
                                                  ? (e) => handleChange(e, key)
                                                  : undefined
                                              }
                                              onKeyPress={handleKeyPress}
                                              onPaste={handlePaste}
                                              // className={twMerge(
                                              //   "border p-2 rounded-sm text-center text-sm w-full h-[42px] transition-all bg-white",
                                              //   "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                              //   inputVal !== "" &&
                                              //     validationType &&
                                              //     selectedPeriod !== "YEARLY" &&
                                              //     (isValidInput(
                                              //       validationType,
                                              //       inputVal,
                                              //       value1 ?? null,
                                              //       value2 ?? null
                                              //     )
                                              //       ? "bg-green-100 border-green-500"
                                              //       : "bg-red-100 border-red-500"),
                                              //   isVisualized &&
                                              //     "cursor-not-allowed"
                                              // )}
                                              className={twMerge(
                                                "border p-2 rounded-sm text-center text-sm w-full h-[42px] transition-all bg-white",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",

                                                // ⭐ Normal validation (when input is editable)
                                                cell?.data !== "-" &&
                                                  inputVal !== "" &&
                                                  validationType &&
                                                  selectedPeriod !== "YEARLY" &&
                                                  (isValidInput(
                                                    validationType,
                                                    inputVal,
                                                    value1 ?? null,
                                                    value2 ?? null,
                                                  )
                                                    ? "bg-green-100 border-green-500"
                                                    : "bg-red-100 border-red-500"),

                                                // ⭐ Visualization-based color logic
                                                cell?.data !== "-" &&
                                                  isVisualized &&
                                                  cell?.validationPercentage !=
                                                    null &&
                                                  (cell.validationPercentage ===
                                                  100
                                                    ? "bg-green-200"
                                                    : cell.validationPercentage <
                                                        validationKey
                                                      ? "bg-red-200"
                                                      : "bg-yellow-200  border-yellow-500"),

                                                isVisualized &&
                                                  "cursor-not-allowed",
                                              )}
                                              // placeholder="0"
                                              disabled={!canInput}
                                              readOnly={!canInput}
                                            />
                                            <div
                                              className={clsx(
                                                "transition-opacity",
                                                inputnote &&
                                                  inputnote.trim() !== "" &&
                                                  inputnote !== "0"
                                                  ? "opacity-100" // always visible when note exists
                                                  : "opacity-0 group-hover:opacity-100", // only on hover when no note
                                              )}
                                            >
                                              {/* {canInput && ( */}
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  {inputnote &&
                                                  inputnote.trim() !== "" &&
                                                  inputnote !== "0" ? (
                                                    <span
                                                      className="absolute top-[1px] right-[1px] w-3 h-3 rounded-tr-sm cursor-pointer overflow-hidden"
                                                      style={{
                                                        background:
                                                          inputVal !== "" &&
                                                          validationType &&
                                                          selectedPeriod !==
                                                            "YEARLY"
                                                            ? isValidInput(
                                                                validationType,
                                                                inputVal,
                                                                value1 ?? null,
                                                                value2 ?? null,
                                                              )
                                                              ? "linear-gradient(to bottom left, #5b8f65 50%, transparent 55%)" // valid → greenish
                                                              : "linear-gradient(to bottom left, #fca5a5 50%, transparent 55%)" // invalid → reddish
                                                            : "linear-gradient(to bottom left, #2e3090 50%, white 55%)", // default
                                                        borderBottomLeftRadius:
                                                          "5px",
                                                      }}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentCellKey(key);
                                                        setCommentModalInput({
                                                          note: inputnote,
                                                          noteId,
                                                        });
                                                        setCommentModalOpen(
                                                          true,
                                                        );
                                                      }}
                                                    ></span>
                                                  ) : (
                                                    <span
                                                      className="absolute border-l border-b border-gray-300 top-[1px] right-[1px] w-4 h-4  cursor-pointer flex items-center justify-center rounded-bl-md text-xs font-bold text-gray-600"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentCellKey(key);
                                                        setCommentModalInput({
                                                          note: "",
                                                          noteId: "",
                                                        });

                                                        setCommentModalOpen(
                                                          true,
                                                        );
                                                      }}
                                                    >
                                                      <Plus className="w-3 h-3 text-gray-700" />
                                                    </span>
                                                  )}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <span>
                                                    {inputnote &&
                                                    inputnote.trim() !== "" &&
                                                    inputnote !== "0"
                                                      ? `View note`
                                                      : "Add note"}
                                                  </span>
                                                </TooltipContent>
                                              </Tooltip>
                                              {/* )} */}
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        {inputVal !== "" &&
                                          inputVal !== "0" &&
                                          !isNaN(Number(inputVal)) && (
                                            <TooltipContent>
                                              <span>
                                                {parseFloat(inputVal)
                                                  .toFixed(4)
                                                  .replace(/\.?0+$/, "")}
                                              </span>
                                            </TooltipContent>
                                          )}
                                      </Tooltip>
                                    </TooltipProvider>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DragOverlay>
            {userData.isSuperAdmin &&
              activeItem?.type === "group" &&
              activeItem.data && (
                <div
                  className="bg-blue-50 border border-gray-300 rounded shadow-lg"
                  style={{ width: "500px" }}
                >
                  <table className="w-full table-fixed border-collapse text-sm bg-white">
                    <tbody>
                      <tr className="sticky top-[50px] bg-blue-50 z-10 h-[39px]">
                        <td
                          colSpan={4}
                          className="p-2 text-blue-800 border font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            {activeItem.data.coreParameter.coreParameterName}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            {userData.isSuperAdmin &&
              activeItem?.type === "kpi" &&
              activeItem.data && (
                <div
                  className="bg-white border border-gray-300 rounded shadow-lg"
                  style={{ width: "500px" }}
                >
                  <table className="w-full table-fixed border-collapse text-sm bg-white">
                    <tbody>
                      <tr className="group/row border-b bg-gray-50">
                        <td className="p-3  w-[75px] h-[55px]">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <Avatar className="h-6 w-6">
                              <AvatarFallback
                                className={clsx(
                                  "font-semibold",
                                  getColorFromName(
                                    activeItem.data?.employeeName,
                                  ),
                                )}
                              >
                                {(() => {
                                  if (!activeItem.data?.employeeName) return "";
                                  const names =
                                    activeItem.data.employeeName.split(" ");
                                  const firstInitial = names[0]?.[0] ?? "";
                                  const lastInitial =
                                    names.length > 1
                                      ? names[names.length - 1][0]
                                      : "";
                                  return (
                                    firstInitial + lastInitial
                                  ).toUpperCase();
                                })()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </td>
                        <td className="px-3 border w-[180px] text-left h-[59px] align-middle">
                          <span className="line-clamp-2 break-words cursor-default">
                            {activeItem.data.kpiName}
                          </span>
                        </td>
                        <td className="px-3 border w-[130px] text-left h-[59px] align-middle">
                          <span className="line-clamp-2 break-words cursor-default">
                            {activeItem.data.tag}
                          </span>
                        </td>
                        <td className="px-3 border w-[130px] text-left h-[59px] align-middle">
                          <span className="line-clamp-2 break-words cursor-default">
                            {activeItem.data.validationType === "YES_NO"
                              ? activeItem.data.goalValue === 1
                                ? "Yes"
                                : "No"
                              : getFormattedValue(
                                  activeItem.data.validationType,
                                  activeItem.data?.value1,
                                  activeItem.data?.value2,
                                  activeItem.data?.unit,
                                )}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
          </DragOverlay>
        </DndContext>
      )}
      <WarningDialog
        open={showWarning}
        onSubmit={handleWarningSubmit}
        onDiscard={handleWarningDiscard}
        onClose={handleWarningClose}
      />
      <CommentModal
        isModalOpen={commentModalOpen}
        modalClose={() => setCommentModalOpen(false)}
        noteId={commentModalInput.noteId}
        initialComment={commentModalInput.note}
        onSave={(comment) => {
          setTempValues((prev) => {
            const updated = {
              ...prev,
              [currentCellKey]: {
                ...prev[currentCellKey],
                comment: comment,
              },
            };
            addUpdateKpiData(formatTempValuesToPayload(updated));
            return updated;
          });
        }}
      />
    </FormProvider>
  );
}

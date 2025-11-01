import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  Suspense,
  lazy,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
import { off, onValue, ref } from "firebase/database";
import { database } from "@/firebaseConfig";

import {
  formatCompactNumber,
  formatTempValuesMeetingToPayload,
  getColorFromName,
  getKpiHeadersFromData,
  isValidInput,
} from "@/features/utils/formatting.utils";
import { queryClient } from "@/queryClient";
import {
  addMeetingKpisDataMutation,
  updateKPIDataMutation,
  useGetMeetingSelectedKpis,
} from "@/features/api/detailMeeting";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormSelect from "@/components/shared/Form/FormSelect";
import Loader from "@/components/shared/Loader/Loader";
import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";
import { Button } from "@/components/ui/button";

// Lazy load components
const TabsSection = lazy(() => import("./TabSection"));
const WarningDialog = lazy(() => import("./WarningModal"));
const KpisSearchDropdown = lazy(() => import("./KpiSearchDropdown"));
const KpiDrawer = lazy(() => import("./KpiDrawer"));

import { format } from "date-fns";
import { useSelector } from "react-redux";
import { getUserId } from "@/features/selectors/auth.selector";

// Loading components for Suspense fallbacks
const TabsSectionFallback = () => (
  <div className="flex gap-2 p-2 bg-gray-100 rounded animate-pulse">
    <div className="h-8 w-20 bg-gray-300 rounded"></div>
    <div className="h-8 w-20 bg-gray-300 rounded"></div>
    <div className="h-8 w-20 bg-gray-300 rounded"></div>
  </div>
);

const KpisSearchDropdownFallback = () => (
  <div className="w-full p-2 mb-4">
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

const KpiDrawerFallback = () => <div className="hidden"></div>;

const WarningDialogFallback = () => <div className="hidden"></div>;

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

interface KpisProps {
  meetingId: string;
  kpisFireBase: () => void;
  ioId: string | undefined;
  ioType?: string;
  selectedIssueId?: string;
  isTeamLeader?: boolean | undefined;
  follow?: boolean;
  meetingRes: MeetingResFire | null;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export default function KPITable({
  meetingId,
  ioId,
  kpisFireBase,
  ioType,
  selectedIssueId,
  isTeamLeader,
  follow,
  meetingRes,
}: KpisProps) {
  const userId = useSelector(getUserId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const urlSelectedPeriod = searchParams.get("selectedType");
  const [selectedPeriod, setSelectedPeriod] = useState(urlSelectedPeriod || "");
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "employeeName",
    direction: "asc",
  });

  const { mutate: addKpiList } = addMeetingKpisDataMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const { mutate: addUpdateKpiData } = updateKPIDataMutation();

  const { data: selectedKpis, isLoading: meetingLoading } =
    useGetMeetingSelectedKpis({
      filter: {
        meetingId: meetingId,
        ...(ioType === "ISSUE" ? { issueId: ioId } : { objectiveId: ioId }),
        ioType: ioType,
        selectDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      },
      enable: !!meetingId && !!ioId && !!ioType,
    });

  const selectedKpisTyped = useMemo(
    () => (Array.isArray(selectedKpis) ? selectedKpis : []),
    [selectedKpis],
  );

  const unfollowed = Object.keys(meetingRes?.state?.unfollow || {});
  const isUnfollow = unfollowed.includes(userId);

  // Tabs data
  const kpiStructure = useMemo(
    () => ({
      data: selectedKpisTyped,
      totalCount: selectedKpisTyped.length,
      success: true,
      status: 200,
      message: "",
      currentPage: 1,
      pageSize: selectedKpisTyped.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      hasMore: false,
      totalPage: 1,
      sortBy: "",
      sortOrder: "",
    }),
    [selectedKpisTyped],
  );

  const isLoading = !kpiStructure && !meetingLoading;
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [ioKPIId, setIoKPIId] = useState("");

  useEffect(() => {
    const db = database;
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${selectedIssueId}/kpis`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
        queryClient.resetQueries({ queryKey: ["get-detailMeeting-kpis-res"] });
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [selectedIssueId, meetingId]);

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

  const headers = useMemo(() => {
    const periodGroup = selectedKpisTyped.find(
      (item) => item.frequencyType === selectedPeriod,
    );

    // If no data for selected period, try to use the first available period
    if (!periodGroup || !periodGroup.kpis || !periodGroup.kpis.length) {
      const firstPeriod = selectedKpisTyped[0];
      if (firstPeriod && firstPeriod.kpis && firstPeriod.kpis.length) {
        const allDataArrays = firstPeriod.kpis.flatMap(
          (coreParam: KPICoreParameter) =>
            (coreParam.kpis || []).flatMap(
              (kpi: KpiAllList) => kpi.dataArray || [],
            ),
        );
        if (allDataArrays.length) {
          return getKpiHeadersFromData(
            [allDataArrays],
            firstPeriod.frequencyType,
          );
        }
      }
      return [];
    }

    const allDataArrays = periodGroup.kpis.flatMap(
      (coreParam: KPICoreParameter) =>
        (coreParam.kpis || []).flatMap(
          (kpi: KpiAllList) => kpi.dataArray || [],
        ),
    );
    if (!allDataArrays.length) {
      return [];
    }
    return getKpiHeadersFromData([allDataArrays], selectedPeriod);
  }, [selectedKpisTyped, selectedPeriod]);

  const filteredData = useMemo(() => {
    const dataForPeriod = selectedKpisTyped.filter(
      (item) => item.frequencyType === selectedPeriod,
    );

    // If no data for selected period, use the first available period
    if (dataForPeriod.length === 0 && selectedKpisTyped.length > 0) {
      return [selectedKpisTyped[0]];
    }

    return dataForPeriod;
  }, [selectedKpisTyped, selectedPeriod]);

  const groupedKpiRows = useMemo(() => {
    if (!filteredData.length || !filteredData[0].kpis) return [];
    const groups: {
      coreParameter: { coreParameterId: string; coreParameterName: string };
      kpis: KpiAllList[];
      dataArray: KpiDataCell[];
    }[] = [];
    filteredData[0].kpis.forEach((coreParam: KPICoreParameter) => {
      if (coreParam.kpis && Array.isArray(coreParam.kpis)) {
        groups.push({
          coreParameter: {
            coreParameterId: coreParam.coreParameterId,
            coreParameterName: coreParam.coreParameterName,
          },
          kpis: coreParam.kpis,
          dataArray: coreParam.dataArray,
        });
      }
    });
    return groups;
  }, [filteredData]);

  useEffect(() => {
    if (selectedPeriod) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", selectedPeriod);
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedPeriod, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedPeriod && selectedKpisTyped && selectedKpisTyped.length > 0) {
      // Use URL parameter if available, otherwise use the first frequency type
      const urlPeriod = searchParams.get("selectedType");
      const initialPeriod = urlPeriod || selectedKpisTyped[0]?.frequencyType;

      if (initialPeriod) {
        setSelectedPeriod(initialPeriod);

        // Only update URL if it's not already set correctly
        if (!urlPeriod || urlPeriod !== initialPeriod) {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("selectedType", initialPeriod);
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [selectedKpisTyped, selectedPeriod, searchParams, setSearchParams]);

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

  useEffect(() => {
    if (isKpiDataCellArrayArray(selectedKpisTyped)) {
      const initialValues: { [key: string]: string } = {};
      selectedKpisTyped.forEach((row: KpiDataCell[], rowIndex: number) => {
        row.forEach((cell: KpiDataCell, colIndex: number) => {
          initialValues[`${rowIndex}-${colIndex}`] =
            cell?.data?.toString() ?? "";
        });
      });
      setInputValues(initialValues);
      setTempValues({});
      setIoKPIId("");
    }
  }, [selectedKpisTyped]);

  const methods = useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiAllList | null>(null);

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
    if (ioId && ioType) {
      addUpdateKpiData(
        formatTempValuesMeetingToPayload(
          tempValues,
          ioId,
          ioType,
          ioKPIId,
          meetingId,
          selectedIssueId!,
        ),
        {
          onSuccess: () => {
            // queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
            kpisFireBase();
            setTempValues({});
          },
        },
      );
    }
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
    setIoKPIId("");
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
    setIoKPIId("");
    setShowWarning(false);

    const nextPeriod = pendingPeriod;
    const nextNavigation = pendingNavigation;
    setPendingPeriod(null);
    setPendingNavigation(null);

    if (nextPeriod) {
      setSelectedPeriod(nextPeriod);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selectedType", nextPeriod);
      setSearchParams(newParams, { replace: true });
    }

    if (nextNavigation) {
      setTimeout(() => {
        navigate(nextNavigation);
      }, 0);
    }
  };

  const handleWarningClose = () => {
    setPendingPeriod(null);
    setPendingNavigation(null);
    setShowWarning(false);
  };

  const handleAddKpis = (tasks: KpiAllList) => {
    const payload = {
      meetingId: meetingId,
      kpiId: tasks.kpiId,
      ...(ioType === "ISSUE" ? { issueId: ioId } : { objectiveId: ioId }),
      ioType: ioType,
    };
    addKpiList(payload, {
      onSuccess: () => {
        // queryClient.resetQueries({ queryKey: ["get-detailMeeting-kpis-res"] });
        // queryClient.resetQueries({
        //   queryKey: ["get-detailMeetingAgendaIssue"],
        // });
        kpisFireBase();
      },
    });
  };

  const handleCancel = () => {
    setTempValues({});
    setInputValues({});
    setInputFocused({});
    setIoKPIId("");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        {isTeamLeader && (
          <Suspense fallback={<KpisSearchDropdownFallback />}>
            <KpisSearchDropdown
              onAdd={handleAddKpis}
              minSearchLength={2}
              filterProps={{ pageSize: 20 }}
            />
          </Suspense>
        )}
      </div>

      {selectedKpisTyped && selectedKpisTyped.length > 0 && (
        <>
          <div className="sticky top-0 z-10 bg-white px-4 py-2 m-0">
            <div className="flex justify-between">
              <div className="flex justify-between items-center">
                <Suspense fallback={<TabsSectionFallback />}>
                  <TabsSection
                    selectedPeriod={selectedPeriod}
                    onSelectPeriod={handlePeriodChange}
                    kpiStructure={kpiStructure}
                    isDisabled={!follow && !isUnfollow}
                    isUnfollow={isUnfollow}
                  />
                </Suspense>
              </div>
              <div className="flex gap-4 items-center justify-end">
                {Object.keys(tempValues).length > 0 && (
                  <>
                    <Button onClick={handleSubmit}>Submit</Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="text-gray-600 border-gray-300 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                  </>
                )}
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

          <div className="flex w-full gap-0 p-2">
            <div
              ref={leftScrollRef}
              className="max-h-[78vh] overflow-y-scroll scrollbar-hide border shadow-sm"
              style={{ width: "500px", minWidth: "500px", maxWidth: "500px" }}
            >
              <table className="w-full table-fixed border-collapse text-sm bg-white">
                <thead className="bg-primary sticky top-0 z-20">
                  <tr>
                    <th
                      className="w-[55px] p-2 font-semibold text-white text-left h-[51px]"
                      onClick={() => handleSort("employeeName")}
                    >
                      <div className="flex items-center">
                        <span>Who</span>
                        <span>
                          {sortConfig.key === "employeeName" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ArrowDown className="w-4 h-4 ml-1" />
                            ))}
                          {sortConfig.key !== "employeeName" && (
                            <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                          )}
                        </span>
                      </div>
                    </th>
                    <th
                      className="w-[200px] p-2 font-semibold text-white text-left h-[51px]"
                      onClick={() => handleSort("KPIName")}
                    >
                      <div className="flex items-center">
                        <span>KPI</span>
                        <span>
                          {sortConfig.key === "KPIName" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ArrowDown className="w-4 h-4 ml-1" />
                            ))}
                          {sortConfig.key !== "KPIName" && (
                            <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                          )}
                        </span>
                      </div>
                    </th>
                    <th
                      className="w-[130px] p-2 font-semibold text-white text-left h-[51px]"
                      onClick={() => handleSort("tag")}
                    >
                      <div className="flex items-center">
                        <span>Tag</span>
                        <span>
                          {sortConfig.key === "tag" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ArrowDown className="w-4 h-4 ml-1" />
                            ))}
                          {sortConfig.key !== "tag" && (
                            <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
                          )}
                        </span>
                      </div>
                    </th>
                    <th className="w-[100px] p-2 font-semibold text-white text-left h-[51px]">
                      Goal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedKpiRows.map((group, idx) => (
                    <React.Fragment
                      key={`${group.coreParameter.coreParameterId}-${idx}`}
                    >
                      <tr className="sticky top-[50px] bg-blue-50 z-10 h-[39px]">
                        <td
                          colSpan={4}
                          className="p-2 text-blue-800 border font-bold"
                        >
                          {group.coreParameter.coreParameterName}
                        </td>
                      </tr>
                      {group.kpis.map((kpi) => (
                        <tr
                          key={kpi.kpiId}
                          className="border-b bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedKpi(kpi);
                            setDrawerOpen(true);
                          }}
                        >
                          <td className="p-3 border w-[60px] align-middle h-[59px]">
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
                                        const names =
                                          kpi.employeeName.split(" ");
                                        const firstInitial =
                                          names[0]?.[0] ?? "";
                                        const lastInitial =
                                          names.length > 1
                                            ? names[names.length - 1][0]
                                            : "";
                                        return (
                                          firstInitial + lastInitial
                                        ).toUpperCase();
                                      })()}
                                    </AvatarFallback>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {kpi?.employeeName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Avatar>
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
                                    {getFormattedValue(
                                      kpi.validationType,
                                      kpi?.value1,
                                      kpi?.value2,
                                      kpi?.unit,
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    {kpi.validationType === "BETWEEN"
                                      ? `${formatToThreeDecimals(kpi?.value1)} - ${formatToThreeDecimals(kpi?.value2)}`
                                      : formatToThreeDecimals(kpi?.value1)}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
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
                              header.isSunday && "bg-gray-100",
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
                        key={`${group.coreParameter.coreParameterId}-${idx}`}
                      >
                        <tr className="sticky h-[39px] top-[50px] bg-blue-50 z-10">
                          <td
                            colSpan={headers.length}
                            className="p-2 border text-black font-bold"
                          >
                            {/* Empty header for alignment */}
                          </td>
                        </tr>
                        {group.kpis.map((kpi) => {
                          const dataArray = kpi.dataArray || [];
                          return (
                            <tr key={kpi.kpiId} className="h-[50px]">
                              {headers.map((_, colIdx) => {
                                const cell = dataArray[colIdx] || null;
                                const key = `${kpi.kpiId}/${cell?.startDate}/${cell?.endDate}`;
                                const validationType = kpi?.validationType;
                                const value1 = kpi?.value1;
                                const value2 = kpi?.value2;
                                const inputVal =
                                  inputValues[key] ??
                                  cell?.data?.toString() ??
                                  "";
                                const isVisualized = kpi?.isVisualized;
                                const canAdd = true;
                                const canEdit = true;
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
                                          "bg-gray-100",
                                      )}
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div
                                              className={clsx(
                                                "rounded-sm text-sm w-[80px] h-[42px]",
                                                inputVal !== "" &&
                                                  (isValid
                                                    ? "bg-green-100 border border-green-500"
                                                    : "bg-red-100 border border-red-500"),
                                                isVisualized && "opacity-60",
                                              )}
                                            >
                                              <FormSelect
                                                value={inputVal}
                                                onChange={
                                                  canInput
                                                    ? (val) => {
                                                        setInputValues(
                                                          (prev) => ({
                                                            ...prev,
                                                            [key]:
                                                              Array.isArray(val)
                                                                ? val.join(", ")
                                                                : String(val),
                                                          }),
                                                        );
                                                        setTempValues(
                                                          (prev) => ({
                                                            ...prev,
                                                            [key]:
                                                              Array.isArray(val)
                                                                ? val.join(", ")
                                                                : String(val),
                                                          }),
                                                        );
                                                        if (kpi.ioKPIId) {
                                                          setIoKPIId(
                                                            kpi.ioKPIId,
                                                          );
                                                        }
                                                      }
                                                    : () => {}
                                                }
                                                options={selectOptions}
                                                placeholder="Select"
                                                disabled={!canInput}
                                                triggerClassName="text-sm px-1 text-center justify-center"
                                              />
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
                                      "p-2 border text-center w-[80px] h-[42px]",
                                      headers[colIdx].isSunday && "bg-gray-100",
                                    )}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <input
                                            type="text"
                                            value={
                                              inputFocused[key]
                                                ? inputVal
                                                : formatCompactNumber(inputVal)
                                            }
                                            onFocus={
                                              canInput
                                                ? () =>
                                                    setInputFocused((prev) => ({
                                                      ...prev,
                                                      [key]: true,
                                                    }))
                                                : undefined
                                            }
                                            onBlur={
                                              canInput
                                                ? () =>
                                                    setInputFocused((prev) => ({
                                                      ...prev,
                                                      [key]: false,
                                                    }))
                                                : undefined
                                            }
                                            onChange={
                                              canInput
                                                ? (e) => {
                                                    const val = e.target.value;
                                                    const isValidNumber =
                                                      /^(\d+(\.\d*)?|\.\d*)?$/.test(
                                                        val,
                                                      ) || val === "";
                                                    if (isValidNumber) {
                                                      setInputValues(
                                                        (prev) => ({
                                                          ...prev,
                                                          [key]: val,
                                                        }),
                                                      );
                                                    }
                                                    setTempValues((prev) => ({
                                                      ...prev,
                                                      [key]: e?.target.value,
                                                    }));
                                                    if (kpi.ioKPIId) {
                                                      setIoKPIId(kpi.ioKPIId);
                                                    }
                                                  }
                                                : undefined
                                            }
                                            className={clsx(
                                              "border p-2 rounded-sm text-center text-sm w-[80px] h-[42px]",
                                              inputVal !== "" &&
                                                validationType &&
                                                (isValidInput(
                                                  validationType,
                                                  inputVal,
                                                  value1 ?? null,
                                                  value2 ?? null,
                                                )
                                                  ? "bg-green-100 border-green-500"
                                                  : "bg-red-100 border-red-500"),
                                              (!canInput || isVisualized) &&
                                                "opacity-60 cursor-not-allowed bg-gray-50",
                                            )}
                                            placeholder=""
                                            disabled={!canInput}
                                            readOnly={!canInput}
                                          />
                                        </TooltipTrigger>
                                        {inputVal && (
                                          <TooltipContent side="top">
                                            <span>{inputVal}</span>
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
        </>
      )}

      <Suspense fallback={<WarningDialogFallback />}>
        <WarningDialog
          open={showWarning}
          onSubmit={handleWarningSubmit}
          onDiscard={handleWarningDiscard}
          onClose={handleWarningClose}
        />
      </Suspense>

      <Suspense fallback={<KpiDrawerFallback />}>
        <KpiDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          kpiId={selectedKpi?.kpiId}
          meetingId={meetingId}
          kpisFireBase={kpisFireBase}
          ioKPIId={selectedKpi && selectedKpi.ioKPIId}
          ioType={ioType}
        />
      </Suspense>
    </FormProvider>
  );
}

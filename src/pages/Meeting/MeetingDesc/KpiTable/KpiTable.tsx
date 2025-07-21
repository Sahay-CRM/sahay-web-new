import React, { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
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
import Loader from "@/components/shared/Loader/Loader";
import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";
import { Button } from "@/components/ui/button";
import TabsSection from "./TabSection";

import WarningDialog from "./WarningModal";
import KpisSearchDropdown from "./KpiSearchDropdown";
import {
  addMeetingKpisDataMutation,
  // useGetMeetingKpis,
  useGetMeetingSelectedKpis,
} from "@/features/api/companyMeeting";
import KpiDrawer from "./KpiDrawer";
import { addUpdateKpi } from "@/features/api/kpiDashboard";
import { queryClient } from "@/queryClient";

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

interface KpisProps {
  meetingId: string;
  kpisFireBase: () => void;
  meetingAgendaIssueId: string | undefined;
  detailMeetingId: string | undefined;
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

export default function KPITable({
  meetingId,
  meetingAgendaIssueId,
  kpisFireBase,
  detailMeetingId,
}: KpisProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const urlSelectedPeriod = searchParams.get("selectedType");
  const [selectedPeriod, setSelectedPeriod] = useState(urlSelectedPeriod || "");

  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const { mutate: addKpiList } = addMeetingKpisDataMutation();

  const navigate = useNavigate();
  const location = useLocation();

  const { data: selectedKpis, isLoading: meetingLoading } =
    useGetMeetingSelectedKpis({
      filter: {
        detailMeetingAgendaIssueId: meetingAgendaIssueId,
        detailMeetingId: detailMeetingId,
      },
      enable: !!meetingAgendaIssueId || !!detailMeetingId,
    });

  const selectedKpisTyped = useMemo(
    () => (Array.isArray(selectedKpis) ? selectedKpis : []),
    [selectedKpis],
  );

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
  // Prepare input values for each cell - moved here so tempValues is available earlier
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  ); // Custom navigation interceptor for drawer/sidebar navigation
  useEffect(() => {
    // Store the original navigate function to restore later
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    // Override history methods to intercept navigation
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
        // Check if this navigation should be intercepted
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
      // Check if there are unsaved changes
      if (Object.keys(tempValues).length > 0) {
        // Check if this is a navigation event from drawer/sidebar
        const target = event.target as HTMLElement;

        // Look for drawer navigation elements with more specific selectors
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

          // Try to get the navigation path from various sources
          let href = null;

          if (target.closest("a")) {
            href = target.closest("a")?.getAttribute("href");
          } else {
            // For drawer navigation items, try to extract the path
            const clickElement =
              target.closest("li") ||
              target.closest("button") ||
              target.closest("div");
            const textContent = clickElement?.textContent?.toLowerCase().trim();

            // Enhanced route mapping based on your navigation structure
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

    // Add event listeners to catch navigation attempts
    document.addEventListener("click", handleNavigation, true);

    return () => {
      // Restore original methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener("click", handleNavigation, true);
    };
  }, [tempValues, location.pathname]);

  const headers = useMemo(() => {
    // Find the group for the selected period
    const periodGroup = selectedKpisTyped.find(
      (item) => item.frequencyType === selectedPeriod,
    );
    if (!periodGroup || !periodGroup.kpis || !periodGroup.kpis.length) {
      return [];
    }
    // Collect all dataArrays from all KPIs in all core parameter groups
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

  // --- GROUPED KPI ROWS ---
  const filteredData = useMemo(() => {
    return (
      selectedKpisTyped.filter(
        (item) => item.frequencyType === selectedPeriod,
      ) ?? []
    );
  }, [selectedKpisTyped, selectedPeriod]);

  const groupedKpiRows = useMemo(() => {
    if (!filteredData.length || !filteredData[0].kpis)
      return [] as {
        coreParameter: { coreParameterId: string; coreParameterName: string };
        kpis: KpiAllList[];
        dataArray: KpiDataCell[];
      }[];
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
    if (!selectedPeriod && kpiStructure?.data && kpiStructure.data.length > 0) {
      setSelectedPeriod(kpiStructure.data[0].frequencyType);
    }
  }, [kpiStructure, selectedPeriod]);

  // Warn on page refresh, reload, or close if there are unsaved changes
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
    }
  }, [selectedKpisTyped]);

  const methods = useForm();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiAllList | null>(null);

  const renderKpiRows = (
    rows: { kpi: KpiAllList; dataArray: KpiDataCell[] }[],
  ) => {
    const visualizedRows = rows.filter((row) => row.kpi.isVisualized);
    const nonVisualizedRows = rows.filter((row) => !row.kpi.isVisualized);

    const renderRow = (row: { kpi: KpiAllList; dataArray: KpiDataCell[] }) => {
      const { kpi, dataArray } = row;

      return (
        <TableRow key={kpi.kpiId} className="border-b">
          <TableCell className={clsx("p-0 sticky left-0 z-10")}>
            <div className="w-[400px] bg-gray-100 overflow-hidden border-r border-gray-300 shadow-xl shadow-gray-200/80">
              <table className="p-0">
                <tbody className="p-0">
                  <tr
                    className="h-14 cursor-pointer"
                    onClick={() => {
                      setSelectedKpi(kpi);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="bg-transparent mt-2 w-[40px] overflow-hidden p-0 border-r border-gray-300">
                      <Avatar
                        className={`h-6 w-6 m-auto ${getColorFromName(kpi?.employeeName)}`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AvatarFallback
                                className={`${getColorFromName(kpi?.employeeName)} font-semibold`}
                              >
                                {(() => {
                                  if (!kpi?.employeeName) return "";
                                  const names = kpi.employeeName.split(" ");
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
                            </TooltipTrigger>
                            {/* <TooltipContent>{kpi?.employeeName}</TooltipContent> */}
                          </Tooltip>
                        </TooltipProvider>
                      </Avatar>
                    </td>
                    <td className="w-[150px] min-w-[150px] max-w-[150px] text-left px-3 overflow-hidden border-r border-gray-300">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-md cursor-default break-words whitespace-pre-line overflow-hidden m-0 p-0">
                              {kpi?.kpiName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{kpi?.kpiLabel}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td
                      className={clsx(
                        "p-0 w-[120px] min-w-[120px] max-w-[120px]  text-left px-3 overflow-hidden break-all border-r border-gray-300 sticky left-0 z-10",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-md cursor-default break-words whitespace-pre-line overflow-hidden m-0 p-0">
                              {kpi?.tag}
                            </span>
                          </TooltipTrigger>
                          {/* <TooltipContent>
                            <span>{kpi?.tag}</span>
                          </TooltipContent> */}
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td
                      className={clsx(
                        "px-3 w-[100px] min-w-[100px] max-w-[100px] text-left overflow-hidden break-all sticky left-0 z-10",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className=" truncate max-w-[82px] inline-block cursor-default break-words w-full">
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
                </tbody>
              </table>
            </div>
          </TableCell>
          {headers.map((_, colIdx) => {
            // Find the data cell for this kpi and this date
            let cell = null;
            if (dataArray && Array.isArray(dataArray)) {
              cell = dataArray[colIdx] || null;
            }
            const key = `${kpi.kpiId}/${cell?.startDate}/${cell?.endDate}`;
            const validationType = kpi?.validationType;
            const value1 = kpi?.value1;
            const value2 = kpi?.value2;
            const inputVal = inputValues[key] ?? cell?.data?.toString() ?? "";
            const isVisualized = kpi?.isVisualized;
            // Permission logic
            const canAdd = true;
            const canEdit = true;
            const canInput = !isVisualized && (canAdd || canEdit);
            // console.log(colIdx);

            if (validationType == "YES_NO") {
              const selectOptions = [
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ];
              const isValid = inputVal === String(value1);
              return (
                <TableCell key={colIdx} className="py-0 px-1">
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
                              setInputValues((prev) => ({
                                ...prev,
                                [key]: Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val), // ensure string
                              }));
                              setTempValues((prev) => ({
                                ...prev,
                                [key]: Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val), // ensure string
                              }));
                            }
                          : () => {}
                      }
                      options={selectOptions}
                      placeholder="Select"
                      disabled={!canInput}
                      triggerClassName="text-sm  px-1  text-center justify-center"
                    />
                  </div>
                </TableCell>
              );
            }
            return (
              <TableCell key={colIdx} className="py-0 px-1">
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
                                  /^(\d+(\.\d*)?|\.\d*)?$/.test(val) ||
                                  val === "";
                                if (isValidNumber) {
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [key]: val,
                                  }));
                                }
                                setTempValues((prev) => ({
                                  ...prev,
                                  [key]: e?.target.value,
                                }));
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
              </TableCell>
            );
          })}
        </TableRow>
      );
    };

    return (
      <>
        {nonVisualizedRows.map(renderRow)}
        {nonVisualizedRows.length > 0 && visualizedRows.length > 0 && (
          <TableRow>
            <TableCell
              colSpan={4 + headers.length}
              className="h-4 bg-gray-50"
            />
          </TableRow>
        )}
        {visualizedRows.map(renderRow)}
      </>
    );
  };

  // REMOVE: const headers = getKpiHeadersFromData(
  // REMOVE:   isKpiDataCellArrayArray(kpiData?.data) ? kpiData.data : [],
  // REMOVE:   selectedPeriod
  // REMOVE: );

  const renderCoreParameterHeader = (coreParameter: {
    coreParameterId: string;
    coreParameterName: string;
  }) => {
    return (
      <TableRow
        key={`header-${coreParameter.coreParameterId}`}
        className="bg-blue-100 h-8"
      >
        <TableCell colSpan={4 + headers.length} className="px-3">
          <div className="w-96 text-left sticky text-primary font-medium text-sm left-8 z-10 leading-0">
            {coreParameter.coreParameterName}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderGroupedKpiRows = (
    groups: {
      coreParameter: { coreParameterId: string; coreParameterName: string };
      kpis: KpiAllList[];
      dataArray?: KpiDataCell[];
    }[],
  ) => {
    return groups.map((group, groupIndex) => {
      return (
        <React.Fragment key={group.coreParameter.coreParameterId}>
          {renderCoreParameterHeader(group.coreParameter)}
          {renderKpiRows(
            group.kpis.map((kpi) => ({ kpi, dataArray: kpi.dataArray ?? [] })),
          )}
          {groupIndex < groups.length - 1 && (
            <TableRow>
              <TableCell
                colSpan={4 + headers.length}
                className="h-4 bg-gray-50"
              />
            </TableRow>
          )}
        </React.Fragment>
      );
    });
  };

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
    // console.log(formatTempValuesToPayload(tempValues));
    addUpdateKpiData(formatTempValuesToPayload(tempValues), {
      onSuccess: () => {
        // queryClient.resetQueries({ queryKey: ["get-meeting-kpis-res"] });
        // queryClient.resetQueries({ queryKey: ["get-kpi-dashboard-data"] });
        kpisFireBase();
      },
    });
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

    // Handle navigation immediately
    if (pendingNavigation) {
      // Use setTimeout to ensure the state updates are processed first
      setTimeout(() => {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }, 0);
    }
  };

  const handleWarningDiscard = () => {
    setTempValues({});
    setShowWarning(false);

    // Save to local variables before resetting
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
    // Reset pending period if user cancels
    setPendingPeriod(null);

    // Reset pending navigation if user cancels
    setPendingNavigation(null);

    setShowWarning(false);
  };
  if (isLoading) {
    return <Loader />;
  }

  // Show empty state when no KPIs are available
  // if (hasNoKpis) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-12">
  //       <div className="text-center">
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           No KPIs Available
  //         </h3>
  //         <p className="text-gray-500">
  //           Please add KPI first to view the dashboard.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  const handleAddKpis = (tasks: KpiAllList[]) => {
    const payload = {
      meetingId: meetingId,
      kpiIds: tasks.map((item) => item.kpiId),
      detailMeetingAgendaIssueId: meetingAgendaIssueId,
      detailMeetingId: detailMeetingId,
    };
    addKpiList(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-kpis-res"] });
        kpisFireBase();
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <div>
        <KpisSearchDropdown
          onAdd={handleAddKpis}
          minSearchLength={2}
          filterProps={{ pageSize: 20 }}
        />
      </div>
      <div className="flex justify-between">
        {" "}
        <div className="flex justify-between items-center">
          <TabsSection
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handlePeriodChange}
            kpiStructure={kpiStructure}
          />
        </div>{" "}
        <div className="flex gap-4 items-center justify-end mb-4">
          {Object.keys(tempValues).length > 0 && (
            <Button onClick={handleSubmit}>Submit</Button>
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
      <div className="relative w-full">
        <div className="overflow-x-auto w-full scroll-thin">
          <Table className="min-w-max text-sm text-center">
            <TableHeader>
              <TableRow className="h-[50px]">
                <TableHead className={clsx("sticky left-0 z-20 bg-primary")}>
                  <div className=" w-[370px]">
                    <table className="bg-transparent border-0 w-full">
                      <thead>
                        <tr className="h-[50px]" style={{ border: 0 }}>
                          <td className="w-[40px] py-2  bg-transparent sticky min-w-[40px] text-left  overflow-hidden text-base text-white">
                            Who
                          </td>
                          <td
                            className={clsx(
                              " py-2 px-3 bg-transparent sticky left-[40px] z-20 text-white w-[150px] min-w-[150px] max-w-[150px] overflow-hidden text-base text-left",
                            )}
                          >
                            KPI
                          </td>
                          <td
                            className={clsx(
                              "py-2 px-3 bg-transparent sticky z-20 text-white text-base  w-[120px] min-w-[120px] max-w-[120px] text-left",
                            )}
                          >
                            Tag
                          </td>
                          <td className=" py-2 px-3 w-[150px] sticky left-[210px] z-20 text-white text-left">
                            Goal
                          </td>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </TableHead>
                {/* <TableHead className="w-[60px] bg-primary sticky left-[320px] z-20" /> */}
                {headers.map((header, i) => (
                  <TableHead
                    key={i}
                    className="px-1 w-[80px] whitespace-nowrap bg-white text-gray-600"
                  >
                    <div className="flex flex-col items-center leading-tight">
                      <span>{header.label}</span>
                      {header.year && (
                        <span className="text-xs text-muted-foreground">
                          {header.year}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{renderGroupedKpiRows(groupedKpiRows)}</TableBody>
          </Table>
        </div>
      </div>{" "}
      <WarningDialog
        open={showWarning}
        onSubmit={handleWarningSubmit}
        onDiscard={handleWarningDiscard}
        onClose={handleWarningClose}
      />
      <KpiDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        kpiId={selectedKpi?.kpiId}
        meetingId={meetingId}
      />
    </FormProvider>
  );
}

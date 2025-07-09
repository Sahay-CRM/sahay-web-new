import { useEffect, useState, useMemo } from "react";
import { Ellipsis, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
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
import useKpiDashboard from "./useKpiDashboard";
import {
  formatCompactNumber,
  formatTempValuesToPayload,
  // formatTempValuesToPayload,
  getColorFromName,
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
import TabsSection from "./TabSection";

import WarningDialog from "./WarningModal";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import KpisSearchDropdown from "./KpiSearchDropdown";
import {
  addMeetingKpisDataMutation,
  // useGetMeetingKpis,
  useGetMeetingSelectedKpis,
} from "@/features/api/companyMeeting";
import KpiDrawer from "./KpiDrawer";
import { addUpdateKpi } from "@/features/api/kpiDashboard";

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
}

export default function KPITable({ meetingId, kpisFireBase }: KpisProps) {
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
        meetingId: meetingId,
      },
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

  // Filtered data for selected period
  const filteredKpiData = useMemo(() => {
    return (
      selectedKpisTyped.filter(
        (item: FrequencyData) => item.frequencyType == selectedPeriod,
      ) ?? []
    );
  }, [selectedKpisTyped, selectedPeriod]);

  // Table headers from first kpi's dataArray
  const kpiHeaders = useMemo(() => {
    const firstKpi = filteredKpiData[0]?.kpis?.[0] as
      | SelectedKpisData
      | undefined;
    if (!firstKpi || !Array.isArray(firstKpi.dataArray)) return [];
    return firstKpi.dataArray.map((cell: KpiDataCell) => {
      const start = cell.startDate ? new Date(cell.startDate) : null;
      const end = cell.endDate ? new Date(cell.endDate) : null;
      if (selectedPeriod === "DAILY") {
        return {
          label: start ? format(start, "dd MMM") : "",
          year: start ? format(start, "yyyy") : "",
        };
      } else {
        return {
          label: start ? format(start, "dd MMM") : "",
          year: end ? format(end, "dd MMM") : "",
        };
      }
    });
  }, [filteredKpiData, selectedPeriod]);

  // Table rows: each kpi is a row
  const kpiTableRows = useMemo(() => {
    if (!filteredKpiData.length || !filteredKpiData[0].kpis) return [];
    // If kpis are already SelectedKpisData[]
    if (
      (filteredKpiData[0].kpis as unknown as SelectedKpisData[])[0]?.dataArray
    ) {
      return (filteredKpiData[0].kpis as unknown as SelectedKpisData[]).map(
        (kpi) => ({ kpi }),
      );
    }
    // Otherwise, fallback to empty
    return [];
  }, [filteredKpiData]);

  // Visualized/non-visualized rows
  const visualizedKpiRows = useMemo(() => {
    return kpiTableRows.filter(
      (row: { kpi: SelectedKpisData }) => row.kpi.isVisualized,
    );
  }, [kpiTableRows]);
  const nonVisualizedKpiRows = useMemo(() => {
    return kpiTableRows.filter(
      (row: { kpi: SelectedKpisData }) => !row.kpi.isVisualized,
    );
  }, [kpiTableRows]);

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
  });

  // Check if there are no KPIs available using totalCount
  // const hasNoKpis = useMemo(() => {
  //   return !kpiStructure?.totalCount || kpiStructure.totalCount === 0;
  // }, [kpiStructure]);

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

  // const [menuOpen, setMenuOpen] = useState<{ [kpiId: string]: boolean }>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<SelectedKpisData | null>(null);

  // Helper function to render table rows
  const renderKpiRows = (rows: { kpi: SelectedKpisData }[]) => {
    return rows.map((row: { kpi: SelectedKpisData }) => {
      const { kpi } = row;
      // Use kpi.dataArray for columns
      const dataRow: KpiDataCell[] = kpi.dataArray || [];
      return (
        <TableRow key={kpi.kpiId} className="border-b ">
          <TableCell
            className={clsx(
              "px-3 py-2 w-[60px] bg-gray-100 sticky left-0 z-10",
            )}
          >
            <div className="flex gap-3 items-center">
              <Avatar
                className={`h-8 w-8 ${getColorFromName(kpi?.employeeName)}`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AvatarFallback
                        className={`${getColorFromName(kpi?.employeeName)} font-bold`}
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
          </TableCell>
          <TableCell
            className={clsx(
              "py-2 bg-gray-100 sticky left-[60px] z-10 w-[150px] min-w-[150px] max-w-[150px] p-0",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-md cursor-default w-full break-words whitespace-pre-line overflow-hidden">
                      {kpi?.kpiName} {kpi.tag}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{kpi?.kpiLabel}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Add button to open drawer */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setSelectedKpi(kpi);
                  setDrawerOpen(true);
                }}
                className="ml-2"
              >
                <Ellipsis size={18} />
              </Button>
            </div>
          </TableCell>
          <TableCell className="px-3 py-2 w-[80px] bg-gray-100 sticky left-[210px] break-words z-10 pl-0 ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[100px] inline-block cursor-default break-words w-full">
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
                      ? `${kpi?.value1 ?? ""} - ${kpi?.value2 ?? ""}`
                      : (kpi?.value1 ?? "")}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
          {kpiHeaders.map((_: { label: string; year: string }, i: number) => {
            const cell = dataRow?.[i];
            const key = `${kpi.kpiId}/${cell?.startDate}/${cell?.endDate}`;
            const validationType = cell?.validationType;
            const value1 = cell?.value1;
            const value2 = cell?.value2;
            const inputVal = inputValues[key] ?? cell?.data?.toString() ?? "";
            const isVisualized = kpi?.isVisualized;
            // Permission logic
            const canAdd = !cell?.data;
            const canEdit = !!cell?.data;
            const canInput = !isVisualized && (canAdd || canEdit);

            if (validationType == "YES_NO") {
              const selectOptions = [
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ];
              const isValid = inputVal === String(value1);
              return (
                <TableCell key={i} className="px-3 py-2">
                  <div
                    className={clsx(
                      "rounded-sm text-sm w-[100px] h-[40px]",
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
                                  : val,
                              }));
                              setTempValues((prev) => ({
                                ...prev,
                                [key]: Array.isArray(val)
                                  ? val.join(", ")
                                  : val,
                              }));
                            }
                          : () => {}
                      }
                      options={selectOptions}
                      placeholder="Select"
                      disabled={!canInput}
                    />
                  </div>
                </TableCell>
              );
            }
            return (
              <TableCell key={i} className="px-3 py-2">
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
                          "border p-2 rounded-sm text-center text-sm w-[100px] h-[40px]",
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

    if (validationType === "BETWEEN") {
      return `${formatted1} ${unit} - ${formatted2} ${unit}`;
    }

    switch (validationType) {
      case "EQUAL_TO":
        return `= ${formatted1} ${unit}`;
      case "GREATER_THAN":
        return `> ${formatted1} ${unit}`;
      case "LESS_THAN":
        return `< ${formatted1} ${unit}`;
      case "GREATER_THAN_OR_EQUAL_TO":
        return `≥ ${formatted1} ${unit}`;
      case "LESS_THAN_OR_EQUAL_TO":
        return `≤ ${formatted1} ${unit}`;
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
    };
    addKpiList(payload, {
      onSuccess: () => {
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
        <div className="flex gap-4 items-center justify-end">
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
                <TableHead
                  className={clsx(
                    "bg-primary w-[60px] px-3 py-2 sticky left-0 z-20",
                  )}
                />
                <TableHead
                  className={clsx(
                    "px-3 py-2 bg-primary sticky left-[60px] z-20 text-white w-[150px] text-center",
                  )}
                >
                  KPI
                </TableHead>
                <TableHead className="px-3 py-2 w-[80px] bg-primary sticky left-[210px] z-20 text-white text-center">
                  Goal
                </TableHead>
                {kpiHeaders.map(
                  (header: { label: string; year: string }, i: number) => (
                    <TableHead
                      key={i}
                      className="px-3 py-2 w-[100px] whitespace-nowrap bg-white text-gray-600"
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
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Visualized KPIs Section */}
              {visualizedKpiRows.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4 + kpiHeaders.length}
                      className="bg-gray-100 border-b px-3 py-1"
                    />
                  </TableRow>
                  {renderKpiRows(visualizedKpiRows)}
                </>
              )}

              {/* Non-Visualized KPIs Section */}
              {nonVisualizedKpiRows.length > 0 && (
                <>
                  {visualizedKpiRows.length > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4 + kpiHeaders.length}
                        className="bg-gray-100 border-b px-3 py-1"
                      />
                    </TableRow>
                  )}
                  {renderKpiRows(nonVisualizedKpiRows)}
                </>
              )}
            </TableBody>
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
      />
    </FormProvider>
  );
}

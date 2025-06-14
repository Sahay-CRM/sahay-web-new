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
  getColorFromName,
  getKpiHeadersFromData,
  isValidInput,
} from "@/features/utils/formatting.utils";
import { useEffect, useState, useMemo } from "react";
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
import { RefreshCcw } from "lucide-react";
import TabsSection from "./TabSection";
import {
  addUpdateKpi,
  useGetKpiDashboardStructure,
} from "@/features/api/kpiDashboard";
import WarningDialog from "./WarningModal";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useNavigate, useLocation } from "react-router-dom";

function isKpiDataCellArrayArray(data: unknown): data is KpiDataCell[][] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(data[0]) &&
    (data[0].length === 0 ||
      (typeof data[0][0] === "object" &&
        data[0][0] !== null &&
        "dataPointEmpId" in data[0][0]))
  );
}

export default function KPITable() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const permission = useSelector(getUserPermission).DATAPOINT_TABLE;
  const navigate = useNavigate();
  const location = useLocation();

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

  const { data: kpiStructure } = useGetKpiDashboardStructure();

  useEffect(() => {
    if (!selectedPeriod && kpiStructure?.data && kpiStructure.data.length > 0) {
      setSelectedPeriod(kpiStructure.data[0].frequencyType);
    }
  }, [kpiStructure, selectedPeriod]);

  const { kpiData } = useKpiDashboard({
    selectedPeriod,
    selectedDate,
  });

  const isLoading = !kpiStructure || !kpiData;

  // Check if there are no KPIs available using totalCount
  const hasNoKpis = useMemo(() => {
    return !kpiStructure?.totalCount || kpiStructure.totalCount === 0;
  }, [kpiStructure]);
  // Memoize filteredData
  const filteredData = useMemo(() => {
    return (
      kpiStructure?.data?.filter(
        (item) => item.frequencyType == selectedPeriod,
      ) ?? []
    );
  }, [kpiStructure, selectedPeriod]);

  // Use type guard for headers
  const headers = getKpiHeadersFromData(
    isKpiDataCellArrayArray(kpiData?.data) ? kpiData.data : [],
    selectedPeriod,
  ); // Flatten KPI structure to rows: each row = { kpi, assignee }
  const kpiRows = useMemo(() => {
    if (!filteredData.length || !filteredData[0].kpis) return [];
    const rows: { kpi: Kpi; assignee: Assignee }[] = [];
    filteredData[0].kpis.forEach((kpi) => {
      kpi.assignees?.forEach((assignee) => {
        rows.push({
          kpi,
          assignee,
        });
      });
    });
    return rows;
  }, [filteredData]);

  // Separate rows by visualization status
  const visualizedRows = useMemo(() => {
    return kpiRows.filter((row) => row.kpi.isVisualized);
  }, [kpiRows]);
  const nonVisualizedRows = useMemo(() => {
    return kpiRows.filter((row) => !row.kpi.isVisualized);
  }, [kpiRows]);

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

  // Helper function to render table rows
  const renderKpiRows = (rows: { kpi: Kpi; assignee: Assignee }[]) => {
    return rows.map((row) => {
      const { kpi, assignee } = row;
      let dataRow: KpiDataCell[] | undefined = undefined;
      if (isKpiDataCellArrayArray(kpiData?.data)) {
        dataRow = isKpiDataCellArrayArray(kpiData?.data)
          ? (kpiData.data as KpiDataCell[][]).find(
              (cells) =>
                Array.isArray(cells) &&
                cells.length > 0 &&
                cells[0].dataPointEmpId === assignee.dataPointEmpId,
            )
          : undefined;
      }
      return (
        <TableRow key={assignee.dataPointEmpId} className="border-b">
          <TableCell
            className={clsx(
              "px-3 py-2 w-[60px] bg-gray-100 sticky left-0 z-10",
            )}
          >
            <Avatar
              className={`h-8 w-8 ${getColorFromName(assignee?.employeeName)}`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AvatarFallback
                      className={`${getColorFromName(assignee?.employeeName)} font-bold`}
                    >
                      {(() => {
                        if (!assignee?.employeeName) return "";
                        const names = assignee.employeeName.split(" ");
                        const firstInitial = names[0]?.[0] ?? "";
                        const lastInitial =
                          names.length > 1 ? names[names.length - 1][0] : "";
                        return (firstInitial + lastInitial).toUpperCase();
                      })()}
                    </AvatarFallback>
                  </TooltipTrigger>
                  <TooltipContent>{assignee?.employeeName}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Avatar>
          </TableCell>
          <TableCell
            className={clsx(
              " py-2 bg-gray-100 sticky left-[60px] z-10 w-fit min-w-[102%] mr-2",
            )}
          >
            {" "}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-md cursor-default">
                      {kpi?.kpiName}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{kpi?.kpiLabel}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableCell>
          <TableCell className="px-3 py-2 w-fit bg-gray-100 sticky left-[205px] z-10 pl-0 ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[100px] inline-block cursor-default">
                    {getFormattedValue(
                      kpi.validationType,
                      assignee?.value1,
                      assignee?.value2,
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    {kpi.validationType === "BETWEEN"
                      ? `${assignee?.value1 ?? ""} - ${assignee?.value2 ?? ""}`
                      : (assignee?.value1 ?? "")}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
          {/* <TableCell className="w-[60px] bg-gray-100 sticky left-[320px] z-10 text-center"></TableCell> */}
          {headers.map((_, colIdx) => {
            const cell = dataRow?.[colIdx];
            const key = `${assignee.dataPointEmpId}/${cell?.startDate}/${cell?.endDate}`;
            const validationType = cell?.validationType;
            const value1 = cell?.value1;
            const value2 = cell?.value2;
            const inputVal = inputValues[key] ?? cell?.data?.toString() ?? "";
            const isVisualized = kpi?.isVisualized;

            // Permission logic
            const canAdd = permission?.Add && !cell?.data;
            const canEdit = permission?.Edit && !!cell?.data;
            const canInput = !isVisualized && (canAdd || canEdit);

            if (validationType == "YES_NO") {
              const selectOptions = [
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ];
              const isValid = inputVal === String(value1);
              return (
                <TableCell key={colIdx} className="px-3 py-2">
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
              <TableCell key={colIdx} className="px-3 py-2">
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
  ) {
    const formatted1 = formatCompactNumber(value1);
    const formatted2 = formatCompactNumber(value2);

    if (validationType === "BETWEEN") {
      return `${formatted1} - ${formatted2}`;
    }

    switch (validationType) {
      case "EQUAL_TO":
        return `= ${formatted1}`;
      case "GREATER_THAN":
        return `> ${formatted1}`;
      case "LESS_THAN":
        return `< ${formatted1}`;
      case "GREATER_THAN_OR_EQUAL_TO":
        return `≥ ${formatted1}`;
      case "LESS_THAN_OR_EQUAL_TO":
        return `≤ ${formatted1}`;
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
    }
  };
  const handleWarningSubmit = () => {
    handleSubmit();
    setTempValues({});
    setShowWarning(false);

    // Handle period change
    if (pendingPeriod) {
      setSelectedPeriod(pendingPeriod);
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

    // Handle period change
    if (pendingPeriod) {
      setSelectedPeriod(pendingPeriod);
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
                    "px-3 py-2 bg-primary sticky left-[60px] z-20 text-white w-fit text-center",
                  )}
                >
                  KPI
                </TableHead>
                <TableHead className="px-3 py-2 w-fit bg-primary sticky left-[200px] z-20 text-white text-center">
                  Goal
                </TableHead>
                {/* <TableHead className="w-[60px] bg-primary sticky left-[320px] z-20" /> */}
                {headers.map((header, i) => (
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
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Visualized KPIs Section */}
              {visualizedRows.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={4 + headers.length}
                      className="bg-gray-100 border-b px-3 py-1"
                    />
                  </TableRow>
                  {renderKpiRows(visualizedRows)}
                </>
              )}

              {/* Non-Visualized KPIs Section */}
              {nonVisualizedRows.length > 0 && (
                <>
                  {visualizedRows.length > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4 + headers.length}
                        className="bg-gray-100 border-b px-3 py-1"
                      />
                    </TableRow>
                  )}
                  {renderKpiRows(nonVisualizedRows)}
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
    </FormProvider>
  );
}

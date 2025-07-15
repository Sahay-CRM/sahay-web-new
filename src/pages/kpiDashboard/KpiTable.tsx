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
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import React from "react";

interface CoreParameterGroup {
  coreParameterId: string;
  coreParameterName: string;
  kpis: Kpi[];
}

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

// Helper to format numbers to three decimal places
function formatToThreeDecimals(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
}

export default function KPITable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: kpiStructure, isLoading: isKpiStructureLoading } =
    useGetKpiDashboardStructure();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const urlSelectedPeriod = searchParams.get("selectedType");
  const [selectedPeriod, setSelectedPeriod] = useState(urlSelectedPeriod || "");

  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const permission = useSelector(getUserPermission).DATAPOINT_TABLE;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isKpiStructureLoading && kpiStructure?.data?.length) {
      const urlSelectedPeriod = searchParams.get("selectedType");
      const availablePeriods = kpiStructure.data.map(
        (item) => item.frequencyType,
      );

      // Set to URL param if valid, otherwise first available period
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

  // Prepare input values for each cell - moved here so tempValues is available earlier
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );
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

  const isLoading = !kpiStructure;
  // const isLoading = false;

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
  );

  const groupedKpiRows = useMemo(() => {
    if (!filteredData.length || !filteredData[0].kpis) return [];

    const groups: {
      coreParameter: { coreParameterId: string; coreParameterName: string };
      kpis: { kpi: Kpi }[];
    }[] = [];

    // Use the new CoreParameterGroup interface for type safety
    (filteredData[0].kpis as CoreParameterGroup[]).forEach((coreParam) => {
      if (coreParam.kpis && Array.isArray(coreParam.kpis)) {
        const kpiRows = coreParam.kpis.map((kpi: Kpi) => ({ kpi }));
        groups.push({
          coreParameter: {
            coreParameterId: coreParam.coreParameterId,
            coreParameterName: coreParam.coreParameterName,
          },
          kpis: kpiRows,
        });
      }
    });

    return groups;
  }, [filteredData]);

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
          <div className="w-5xl text-left sticky text-primary font-medium text-sm left-8 z-10 leading-0">
            {coreParameter.coreParameterName}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Helper function to render table rows
  const renderKpiRows = (rows: { kpi: Kpi }[]) => {
    const visualizedRows = rows.filter((row) => row.kpi.isVisualized);
    const nonVisualizedRows = rows.filter((row) => !row.kpi.isVisualized);

    const renderRow = (row: { kpi: Kpi }) => {
      const { kpi } = row;
      let dataRow: KpiDataCell[] | undefined = undefined;
      if (isKpiDataCellArrayArray(kpiData?.data)) {
        dataRow = isKpiDataCellArrayArray(kpiData?.data)
          ? (kpiData.data as KpiDataCell[][]).find(
              (cells) =>
                Array.isArray(cells) &&
                cells.length > 0 &&
                cells[0].kpiId === kpi.kpiId,
            )
          : undefined;
      }
      return (
        <TableRow key={kpi.kpiId} className="border-b">
          <TableCell className={clsx("p-0 sticky left-0 z-10")}>
            <div className="w-[470px] bg-gray-100 overflow-hidden border-r border-gray-300 shadow-xl shadow-gray-200/80">
              <table className="p-0">
                <tbody className="p-0">
                  <tr className="h-14 ">
                    <td className="bg-transparent px-3 w-[40px] overflow-hidden h-full p-0 border-r border-gray-300">
                      <Avatar
                        className={`h-7 w-7 ${getColorFromName(kpi?.employeeName)}`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AvatarFallback
                                className={`${getColorFromName(kpi?.employeeName)} text-[12px] font-medium`}
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
                    <td className="w-[200px] min-w-[200px] max-w-[200px] text-left px-3 overflow-hidden border-r border-gray-300">
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
                        "p-0 w-[120px] min-w-[120px] max-w-[120px]  text-left px-3 overflow-hidden border-r border-gray-300 sticky left-0 z-10",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-md cursor-default  whitespace-pre-line overflow-hidden m-0 p-0">
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
            const cell = dataRow?.[colIdx];
            const key = `${kpi.kpiId}/${cell?.startDate}/${cell?.endDate}`;
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
                <TableCell key={colIdx} className="py-0 px-0">
                  <div
                    className={clsx(
                      "rounded-sm text-sm w-[80px] h-[42px] mx-1",
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
              <TableCell key={colIdx} className="py-0 px-0">
                <div className="mx-1">
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
                </div>
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

  const renderGroupedKpiRows = (
    groups: {
      coreParameter: { coreParameterId: string; coreParameterName: string };
      kpis: { kpi: Kpi }[];
    }[],
  ) => {
    return groups.map((group, groupIndex) => {
      // console.log(group);

      return (
        <React.Fragment key={group.coreParameter.coreParameterId}>
          {renderCoreParameterHeader(group.coreParameter)}
          {renderKpiRows(group.kpis)}

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
                <TableHead className={clsx("sticky left-0 z-20 bg-primary")}>
                  <div className=" w-[450px]">
                    <table className="bg-transparent border-0 w-full">
                      <thead>
                        <tr className="h-[50px]">
                          <td className="w-[40px] py-2  bg-transparent sticky min-w-[40px] text-left  overflow-hidden text-md text-white">
                            Who
                          </td>
                          <td
                            className={clsx(
                              " py-2 px-3 bg-transparent sticky left-[40px] z-20 text-white w-[200px] min-w-[200px] max-w-[200px] overflow-hidden text-md text-left",
                            )}
                          >
                            KPI
                          </td>
                          <td
                            className={clsx(
                              "py-2 px-3 bg-transparent sticky z-20 text-white text-md  w-[120px] min-w-[120px] max-w-[120px] text-left",
                            )}
                          >
                            Tag
                          </td>
                          <td className=" py-2 px-3 w-[150px] sticky left-[210px] text-md z-20 text-white text-left">
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
                    className="px-3 w-[80px] whitespace-nowrap bg-white text-gray-600"
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
              {/* {visualizedGroups.length > 0 && (
                <>
                  {renderGroupedKpiRows(visualizedGroups)}
                </>
              )} */}

              {/* Non-Visualized KPIs Section */}
              {/* {nonVisualizedGroups.length > 0 && (
                <>
                  {visualizedGroups.length > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4 + headers.length}
                        className="bg-gray-100 border-b px-3 py-1"
                      />
                    </TableRow>
                  )}
                </>
              )} */}
              {renderGroupedKpiRows(groupedKpiRows)}
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

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

function formatToThreeDecimals(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
}

export default function UpdatedKpiTable() {
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
  const leftScrollRef = React.useRef<HTMLDivElement>(null);
  const rightScrollRef = React.useRef<HTMLDivElement>(null);

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

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );
  console.log(inputValues);

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
  });

  // const isLoading = !kpiStructure;
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
      <div className="sticky top-0 z-30 bg-white pb-2 mb-2 pt-6">
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
      </div>
      <div className="flex w-full p-0 gap-0 mt-4">
        {/* LEFT TABLE */}
        <div
          ref={leftScrollRef}
          className="max-h-[70vh] overflow-y-scroll scrollbar-hide border shadow-sm"
          style={{ width: "500px", minWidth: "500px", maxWidth: "500px" }}
        >
          <table className="w-full table-fixed border-collapse text-sm bg-white">
            <thead className="bg-primary sticky top-0 z-20">
              <tr>
                <th className="w-[55px] p-2 font-semibold text-white text-left h-[51px]">
                  Who
                </th>
                <th className="w-[200px] p-2 font-semibold text-white text-left h-[51px]">
                  KPI
                </th>
                <th className="w-[130px] p-2 font-semibold text-white text-left h-[51px]">
                  Tag
                </th>
                <th className="w-[100px] p-2 font-semibold text-white text-left h-[51px]">
                  Goal
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedKpiRows.map((group) => (
                <React.Fragment key={group.coreParameter.coreParameterId}>
                  <tr className="sticky top-[50px] bg-blue-50 z-10">
                    <td
                      colSpan={4}
                      className="p-2 text-blue-800 border font-bold"
                    >
                      {group.coreParameter.coreParameterName}
                    </td>
                  </tr>
                  {group.kpis.map(({ kpi }) => (
                    <tr key={kpi.kpiId} className="border-b bg-gray-50 ">
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

        {/* RIGHT TABLE */}
        <div className="overflow-x-auto border shadow-sm flex-1 bg-white">
          <div ref={rightScrollRef} className="max-h-[70vh] overflow-y-auto">
            <table className="min-w-max border-collapse text-sm table-fixed">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="">
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="border p-2 min-w-[80px] font-semibold text-gray text-center h-[43px]"
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedKpiRows.map((group) => (
                  <React.Fragment key={group.coreParameter.coreParameterId}>
                    <tr className="sticky h-[39px] top-[51px] bg-blue-50 z-0">
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
                              inputValues[key] ?? cell?.data?.toString() ?? "";
                            const isVisualized = kpi?.isVisualized;
                            const canAdd = permission?.Add && !cell?.data;
                            const canEdit = permission?.Edit && !!cell?.data;
                            const canInput =
                              !isVisualized && (canAdd || canEdit);

                            if (validationType == "YES_NO") {
                              const selectOptions = [
                                { value: "1", label: "Yes" },
                                { value: "0", label: "No" },
                              ];
                              const isValid = inputVal === String(value1);
                              return (
                                <td
                                  key={colIdx}
                                  className="p-2 border text-center w-[80px] h-[42px]"
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
                                                    setInputValues((prev) => ({
                                                      ...prev,
                                                      [key]: Array.isArray(val)
                                                        ? val.join(", ")
                                                        : String(val),
                                                    }));
                                                    setTempValues((prev) => ({
                                                      ...prev,
                                                      [key]: Array.isArray(val)
                                                        ? val.join(", ")
                                                        : String(val),
                                                    }));
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
                                className="p-2 border text-center w-[80px] h-[42px]"
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
      <WarningDialog
        open={showWarning}
        onSubmit={handleWarningSubmit}
        onDiscard={handleWarningDiscard}
        onClose={handleWarningClose}
      />
    </FormProvider>
  );
}

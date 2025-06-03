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
import { RefreshCcw, Search } from "lucide-react";
import TabsSection from "./TabSection";
import { addUpdateKpi } from "@/features/api/kpiDashboard";
import WarningDialog from "./WarningModal";
import SearchKpiModal from "./VisualizeModal";

// --- Types for API data ---
type Assignee = {
  dataPointEmpId: string;
  employeeName: string;
  value1: string | number | null;
  value2?: string | number | null;
};
type Kpi = {
  kpiId: string;
  kpiName: string;
  kpiLabel: string;
  validationType: string;
  assignees: Assignee[];
};
type FrequencyData = {
  srNo: number;
  frequencyType: string;
  count: number;
  kpis: Kpi[];
};
type KpiDataCell = {
  dataPointEmpId: string;
  validationType: string;
  startDate: string;
  endDate: string;
  data: string | number | null;
};

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
  const [selectedPeriod, setSelectedPeriod] = useState("DAILY");
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);
  const { kpiStructure, kpiData } = useKpiDashboard({
    selectedPeriod,
    selectedDate,
  });
  const isLoading = !kpiStructure || !kpiData;

  // Memoize filteredData
  const filteredData = useMemo(() => {
    return (
      (kpiStructure?.data as FrequencyData[] | undefined)?.filter(
        (item) => item.frequencyType == selectedPeriod,
      ) ?? []
    );
  }, [kpiStructure, selectedPeriod]);

  // Use type guard for headers
  const headers = getKpiHeadersFromData(
    isKpiDataCellArrayArray(kpiData?.data) ? kpiData.data : [],
    selectedPeriod,
  );

  // Flatten KPI structure to rows: each row = { kpi, assignee }
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

  // Prepare input values for each cell
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedKpiSearchData, setSelectedKpiSearchData] = useState<{
    dataPointEmpId: string;
    selectFrequency: string;
  } | null>(null);
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
  ) {
    if (validationType === "BETWEEN") {
      return `${value1 ?? ""} - ${value2 ?? ""}`;
    }
    switch (validationType) {
      case "EQUAL_TO":
        return `= ${value1 ?? ""}`;
      case "GREATER_THAN":
        return `> ${value1 ?? ""}`;
      case "LESS_THAN":
        return `< ${value1 ?? ""}`;
      case "GREATER_THAN_OR_EQUAL_TO":
        return `≥ ${value1 ?? ""}`;
      case "LESS_THAN_OR_EQUAL_TO":
        return `≤ ${value1 ?? ""}`;
      case "YES_NO":
        return value1 === "1" ? "✓(Yes)" : "✗(No)";
      default:
        return value1 ?? "";
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
  if (isLoading) {
    return <Loader />;
  }
  return (
    <FormProvider {...methods}>
      <div className="flex justify-between">
        <div className="flex justify-between items-center">
          <TabsSection
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handlePeriodChange}
          />
        </div>
        <div className="flex gap-4 items-center justify-end">
          <Button onClick={handleSubmit}>Submit</Button>{" "}
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
                    "px-3 py-2 bg-primary sticky left-[60px] z-20 text-white w-[140px] text-center",
                  )}
                >
                  KPI
                </TableHead>
                <TableHead className="px-3 py-2 w-[120px] bg-primary sticky left-[200px] z-20 text-white text-center">
                  Goal
                </TableHead>
                <TableHead className="w-[60px] bg-primary sticky left-[320px] z-20" />
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
              {kpiRows.map((row) => {
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
                                  const names =
                                    assignee.employeeName.split(" ");
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
                              {assignee?.employeeName}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Avatar>
                    </TableCell>
                    <TableCell
                      className={clsx(
                        "px-3 py-2 bg-gray-100 sticky left-[60px] z-10 w-[140px]",
                      )}
                    >
                      {kpi?.kpiName}
                    </TableCell>
                    <TableCell className="px-3 py-2 w-[120px] bg-gray-100 sticky left-[200px] z-10">
                      {getFormattedValue(
                        kpi.validationType,
                        assignee?.value1,
                        assignee?.value2,
                      )}
                    </TableCell>
                    <TableCell className="w-[60px] bg-gray-100 sticky left-[320px] z-10 text-center">
                      <Search
                        onClick={() => {
                          setSelectedKpiSearchData({
                            dataPointEmpId: assignee.dataPointEmpId,
                            selectFrequency: selectedPeriod,
                          });
                          setSearchModalOpen(true);
                        }}
                        className="h-4 w-4 text-muted-foreground mx-auto"
                      />
                    </TableCell>
                    {headers.map((_, colIdx) => {
                      const cell = dataRow?.[colIdx];
                      const key = `${assignee.dataPointEmpId}/${cell?.startDate}/${cell?.endDate}`;
                      const validationType = kpi.validationType;
                      const value1 = assignee?.value1;
                      const value2 = assignee?.value2;
                      const inputVal =
                        inputValues[key] ?? cell?.data?.toString() ?? "";
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
                              )}
                            >
                              <FormSelect
                                value={inputVal}
                                onChange={(val) => {
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
                                }}
                                options={selectOptions}
                                placeholder="Select"
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
                                  onFocus={() =>
                                    setInputFocused((prev) => ({
                                      ...prev,
                                      [key]: true,
                                    }))
                                  }
                                  onBlur={() =>
                                    setInputFocused((prev) => ({
                                      ...prev,
                                      [key]: false,
                                    }))
                                  }
                                  onChange={(e) => {
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
                                  }}
                                  className={clsx(
                                    "border p-2 rounded-sm text-center text-sm w-[100px] h-[40px]",
                                    inputVal !== "" &&
                                      (isValidInput(
                                        validationType,
                                        inputVal,
                                        value1,
                                        value2,
                                      )
                                        ? "bg-green-100 border-green-500"
                                        : "bg-red-100 border-red-500"),
                                  )}
                                  placeholder=""
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
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <WarningDialog
        open={showWarning}
        onSubmit={() => {
          handleSubmit();
          setTempValues({});
          if (pendingPeriod) setSelectedPeriod(pendingPeriod);
          setPendingPeriod(null);
          setShowWarning(false);
        }}
        onDiscard={() => {
          setTempValues({});
          if (pendingPeriod) setSelectedPeriod(pendingPeriod);
          setPendingPeriod(null);
          setShowWarning(false);
        }}
        onClose={() => setShowWarning(false)}
      />
      {selectedKpiSearchData && (
        <SearchKpiModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          dataPointEmpId={selectedKpiSearchData.dataPointEmpId}
          selectFrequency={selectedKpiSearchData.selectFrequency}
        />
      )}
    </FormProvider>
  );
}

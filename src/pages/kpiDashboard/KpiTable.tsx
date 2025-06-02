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
  getColorFromName,
  getKpiHeadersFromData,
  isValidInput,
} from "@/features/utils/formatting.utils";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormSelect from "@/components/shared/Form/FormSelect";
import { FormProvider, useForm } from "react-hook-form";

export default function KPITable({
  selectedPeriod,
  selectedDate,
}: {
  selectedPeriod: string;
  selectedDate: Date | null;
}) {
  const { kpiStructure, kpiData } = useKpiDashboard({
    selectedPeriod,
    selectedDate,
  });
  const filteredData = kpiStructure?.data?.filter(
    (item) => item.frequencyType == selectedPeriod,
  );

  const headers = getKpiHeadersFromData(kpiData?.data, selectedPeriod);
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
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [inputFocused, setInputFocused] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    if (kpiData?.data) {
      const initialValues: { [key: string]: string } = {};
      kpiData.data.forEach((row, rowIndex: number) => {
        row?.forEach((cell, colIndex) => {
          initialValues[`${rowIndex}-${colIndex}`] =
            cell?.data?.toString() ?? "";
        });
      });
      setInputValues(initialValues);
    }
  }, [kpiData]);

  const getValidationMeta = (rowIdx: number) => {
    const kpis = filteredData?.[0]?.kpis ?? [];
    let kpiIndex = 0;
    for (const kpi of kpis) {
      for (let i = 0; i < (kpi.assignees?.length ?? 0); i++) {
        if (kpiIndex === rowIdx) {
          return {
            validationType: kpi.validationType,
            value1: kpi.assignees?.[i]?.value1 ?? null,
            value2: kpi.assignees?.[i]?.value2 ?? null,
          };
        }
        kpiIndex++;
      }
    }
    return {};
  };
  const methods = useForm();

  console.log(kpiData?.data, "<====kpiData?.data");

  return (
    <FormProvider {...methods}>
      <div className="relative w-full">
        <div className="flex w-full">
          <div className="bg-white sticky left-0 z-10 border-r">
            <Table className="min-w-fit text-sm text-left rounded-none">
              <TableHeader>
                <TableRow className="h-[50px]">
                  <TableHead
                    className={clsx("bg-primary w-[60px] px-3 py-2")}
                  ></TableHead>
                  <TableHead className={clsx("px-3 py-2")}>KPI</TableHead>
                  <TableHead className="px-3 py-2 w-[80px]">Goal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData &&
                  filteredData[0]?.kpis?.map((item) => (
                    <>
                      {item?.assignees?.map((ele) => (
                        <TableRow
                          key={item?.dataPointId}
                          className="border-b bg-gray-100 hover:bg-gray-50 h-[57px]"
                        >
                          <TableCell className={clsx("px-3 py-2 w-[60px]")}>
                            <Avatar
                              className={`h-8 w-8 ${getColorFromName(ele?.employeeName)}`}
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AvatarFallback
                                      className={`${getColorFromName(ele?.employeeName)} font-bold`}
                                    >
                                      {(() => {
                                        if (!ele?.employeeName) return "";
                                        const names =
                                          ele.employeeName.split(" ");
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
                                    {ele?.employeeName}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Avatar>
                          </TableCell>
                          <TableCell className={clsx("px-3 py-2")}>
                            {item?.kpiName}
                            {/* {`(${ele?.employeeName})`} */}
                          </TableCell>
                          <TableCell className="px-3 py-2 w-[80px]">
                            {getFormattedValue(
                              item.validationType,
                              ele?.value1,
                              ele?.value2,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="overflow-x-auto w-full scroll-thin">
            <Table className="min-w-max text-sm text-center">
              <TableHeader>
                <TableRow className="h-[50px]">
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
                {kpiData &&
                  kpiData?.data?.map((item, idx) => (
                    <TableRow key={idx} className="bg-white border-b">
                      {item &&
                        item?.map((ele, i) => (
                          <TableCell key={i} className="px-3 py-2">
                            {(() => {
                              const key = `${idx}-${i}`;
                              const { validationType, value1, value2 } =
                                getValidationMeta(idx, i);
                              const inputVal = inputValues[key] ?? "";
                              if (validationType == "YES_NO") {
                                const selectOptions = [
                                  { value: "1", label: "Yes" },
                                  { value: "0", label: "No" },
                                ];

                                const isValid = inputVal === String(value1);

                                return (
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
                                      }}
                                      options={selectOptions}
                                      placeholder="Select"
                                    />
                                  </div>
                                );
                              }

                              return (
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
                                            /^(\d+(\.\d*)?|\.\d*)?$/.test(
                                              val,
                                            ) || val === "";

                                          if (isValidNumber) {
                                            setInputValues((prev) => ({
                                              ...prev,
                                              [key]: val,
                                            }));
                                          }
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
                              );
                            })()}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

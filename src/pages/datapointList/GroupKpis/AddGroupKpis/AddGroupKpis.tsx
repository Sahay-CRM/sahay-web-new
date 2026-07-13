import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/shared/Icons";
import StepProgress from "@/components/shared/StepProgress/stepProgress";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  AddUpdateKpiMergeRes,
  addUpdateKpiMergeMutation,
  useGetKpiMergeById,
} from "@/features/api/companyDatapoint";
import { useDdAllKpiList } from "@/features/api/KpiList";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableTooltip } from "@/components/shared/DataTable/tableTooltip";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { SpinnerIcon } from "@/components/shared/Icons";
import { formatFrequencyType, getInitials } from "@/features/utils/app.utils";
import { getColorFromName } from "@/features/utils/formatting.utils";

export interface AddGroupKpiFormValues {
  kpiIds: string[];
  baseKpiIds: string[];
  otherKpiIds: string[];
  frequencyType: string;
  visualFrequencyTypes: string[];
  visualFrequencyAggregate: string;
  unit: string;
  tag: string;
  kpiMergeName: string;
  value1: string;
  value2: string;
  validationType: string;
  isMinusKpi: boolean;
}

const frequenceOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALFYEARLY", label: "Half-Yearly" },
  { value: "YEARLY", label: "Yearly" },
];

const validationTypeOptions = [
  { value: "EQUAL_TO", label: "= (Equal to)" },
  { value: "GREATER_THAN", label: "> (Greater than)" },
  { value: "LESS_THAN", label: "< (Less than)" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: "≥ (Greater than or equal to)" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "≤ (Less than or equal to)" },
  { value: "BETWEEN", label: "Between" },
  { value: "YES_NO", label: "Yes / No" },
];

const sumAveOptions = [
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "minus", label: "Minus" },
];

const frequencyOrder = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "HALFYEARLY",
  "YEARLY",
];

function getValidationSymbol(value: string) {
  switch (value) {
    case "EQUAL_TO":
      return "=";
    case "GREATER_THAN":
      return ">";
    case "LESS_THAN":
      return "<";
    case "GREATER_THAN_OR_EQUAL_TO":
      return ">=";
    case "LESS_THAN_OR_EQUAL_TO":
      return "<=";
    case "BETWEEN":
      return "Between";
    case "YES_NO":
      return "Yes/No";
    default:
      return value || "-";
  }
}

function getGoalDisplay(item: {
  validationType?: string;
  value1?: string;
  value2?: string;
}) {
  if (item.validationType === "YES_NO") {
    return item.value1 === "1"
      ? "Yes"
      : item.value1 === "2"
        ? "No"
        : item.value1 || "-";
  }
  if (item.value2) {
    return `${item.value1 ?? ""} to ${item.value2}`;
  }
  return item.value1 ?? "-";
}

export default function AddGroupKpis() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [step, setStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const [isManualValue1, setIsManualValue1] = useState(false);
  const [isManualValue2, setIsManualValue2] = useState(false);

  const methods = useForm<AddGroupKpiFormValues>({
    defaultValues: {
      kpiIds: [],
      baseKpiIds: [],
      otherKpiIds: [],
      frequencyType: "",
      visualFrequencyTypes: [],
      visualFrequencyAggregate: "sum",
      unit: "",
      tag: "",
      kpiMergeName: "",
      value1: "",
      value2: "",
      validationType: "",
      isMinusKpi: false,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const selectedFrequency = watch("frequencyType");
  const rawKpiIds = watch("kpiIds");
  const selectedKpiIds = useMemo(() => rawKpiIds || [], [rawKpiIds]);

  const rawBaseKpiIds = watch("baseKpiIds");
  const baseKpiIds = useMemo(() => rawBaseKpiIds || [], [rawBaseKpiIds]);

  const rawOtherKpiIds = watch("otherKpiIds");
  const otherKpiIds = useMemo(() => rawOtherKpiIds || [], [rawOtherKpiIds]);

  const selectedValidationType = watch("validationType");
  const visualFrequencyAggregate = watch("visualFrequencyAggregate");
  const isMinusKpiActive =
    watch("isMinusKpi") || visualFrequencyAggregate === "minus";
  const kpiMergeName = watch("kpiMergeName");

  const isStep1Valid = useMemo(() => {
    if (!selectedFrequency) return false;
    if (isMinusKpiActive) {
      return baseKpiIds.length > 0 && otherKpiIds.length > 0;
    } else {
      return selectedKpiIds.length > 0;
    }
  }, [
    selectedFrequency,
    isMinusKpiActive,
    baseKpiIds,
    otherKpiIds,
    selectedKpiIds,
  ]);

  const isStep2Valid = useMemo(() => {
    return !!kpiMergeName?.trim() && !!selectedValidationType;
  }, [kpiMergeName, selectedValidationType]);

  // Fetch KPI list filtered by selected frequency
  const { data: kpiListData, isLoading: isKpisLoading } = useDdAllKpiList({
    filter: { frequencyType: selectedFrequency },
    enable: !!selectedFrequency,
  });

  // Fetch existing group KPI details when editing
  const { data: fetchedGroupData, isSuccess } = useGetKpiMergeById(id ?? "");
  const addUpdateMutation = addUpdateKpiMergeMutation();

  useEffect(() => {
    setBreadcrumbs([
      { label: "KPI Group", href: "/dashboard/kpi/group-kpis" },
      { label: id ? "Update Group KPI" : "Add Group KPI", href: "" },
    ]);
  }, [setBreadcrumbs, id]);

  // Helper to parse comma-separated strings or arrays into string[]
  const parseIdList = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "string")
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (isSuccess && fetchedGroupData) {
      const resObj = fetchedGroupData as unknown as Record<string, unknown>;
      setValue("kpiMergeName", fetchedGroupData.kpiMergeName || "");
      setValue("frequencyType", fetchedGroupData.frequencyType || "");

      const isMinus =
        Boolean(resObj.isMinusKpi) ||
        fetchedGroupData.visualFrequencyAggregate === "minus";
      setValue("isMinusKpi", isMinus);
      setValue(
        "visualFrequencyAggregate",
        fetchedGroupData.visualFrequencyAggregate ||
          (isMinus ? "minus" : "sum"),
      );

      const visualTypes =
        typeof fetchedGroupData.visualFrequencyTypes === "string"
          ? fetchedGroupData.visualFrequencyTypes.split(",").filter(Boolean)
          : fetchedGroupData.visualFrequencyTypes || [];
      setValue("visualFrequencyTypes", visualTypes);

      setValue("unit", fetchedGroupData.unit || "");
      setValue("tag", fetchedGroupData.tag || "");
      setValue("validationType", fetchedGroupData.validationType || "");
      setValue("value1", fetchedGroupData.value1 || "");
      setValue("value2", fetchedGroupData.value2 || "");

      if (fetchedGroupData.value1) {
        setIsManualValue1(true);
      } else {
        setIsManualValue1(false);
      }

      if (fetchedGroupData.value2) {
        setIsManualValue2(true);
      } else {
        setIsManualValue2(false);
      }

      const fetchedKpiIds = parseIdList(
        resObj.kpiIds || fetchedGroupData.kpiIds,
      );
      const fetchedBaseKpiIds = parseIdList(
        resObj.baseKpiIds || resObj.baseKpiId,
      );
      const fetchedOtherKpiIds = parseIdList(
        resObj.otherKpiIds || resObj.otherKpiId,
      );

      setValue("kpiIds", fetchedKpiIds);
      setValue("baseKpiIds", fetchedBaseKpiIds);
      setValue("otherKpiIds", fetchedOtherKpiIds);
    }
  }, [isSuccess, fetchedGroupData, setValue]);

  // Helper to parse values safely
  const parseVal = (val: unknown): number => {
    if (val === undefined || val === null || val === "") return 0;
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper to format values cleanly (up to 4 decimal places, removing trailing zeros)
  const roundValue = (num: number): string => {
    return Number(num.toFixed(4)).toString();
  };

  // Auto-calculate value1 and value2 based on selected KPIs when not entered manually
  const allKpis = useMemo(() => {
    return kpiListData?.data || [];
  }, [kpiListData]);

  useEffect(() => {
    let autoValue1 = "";
    let autoValue2 = "";

    if (isMinusKpiActive) {
      if (baseKpiIds.length > 0 || otherKpiIds.length > 0) {
        const baseKpisList = allKpis.filter(
          (k) => k.kpiId && baseKpiIds.includes(k.kpiId),
        );
        const otherKpisList = allKpis.filter(
          (k) => k.kpiId && otherKpiIds.includes(k.kpiId),
        );

        const baseSum1 = baseKpisList.reduce(
          (acc, k) => acc + parseVal(k.value1),
          0,
        );
        const otherSum1 = otherKpisList.reduce(
          (acc, k) => acc + parseVal(k.value1),
          0,
        );
        autoValue1 = roundValue(baseSum1 - otherSum1);

        const baseSum2 = baseKpisList.reduce(
          (acc, k) => acc + parseVal(k.value2),
          0,
        );
        const otherSum2 = otherKpisList.reduce(
          (acc, k) => acc + parseVal(k.value2),
          0,
        );
        autoValue2 = roundValue(baseSum2 - otherSum2);
      }
    } else {
      if (selectedKpiIds.length > 0) {
        const selectedKpisList = allKpis.filter(
          (k) => k.kpiId && selectedKpiIds.includes(k.kpiId),
        );

        const sum1 = selectedKpisList.reduce(
          (acc, k) => acc + parseVal(k.value1),
          0,
        );
        const sum2 = selectedKpisList.reduce(
          (acc, k) => acc + parseVal(k.value2),
          0,
        );

        if (visualFrequencyAggregate === "average") {
          autoValue1 = roundValue(sum1 / selectedKpiIds.length);
          autoValue2 = roundValue(sum2 / selectedKpiIds.length);
        } else {
          autoValue1 = roundValue(sum1);
          autoValue2 = roundValue(sum2);
        }
      }
    }

    if (!isManualValue1) {
      setValue("value1", autoValue1, { shouldValidate: true });
    }
    if (!isManualValue2) {
      setValue("value2", autoValue2, { shouldValidate: true });
    }
  }, [
    selectedKpiIds,
    baseKpiIds,
    otherKpiIds,
    visualFrequencyAggregate,
    isMinusKpiActive,
    allKpis,
    isManualValue1,
    isManualValue2,
    setValue,
  ]);

  // Default select a validationType based on majority of selected KPIs in Step 1
  useEffect(() => {
    if (!!id || step !== 1) return;

    const idsToCompare = isMinusKpiActive
      ? [...baseKpiIds, ...otherKpiIds]
      : selectedKpiIds;

    if (idsToCompare.length === 0) {
      setValue("validationType", "", { shouldValidate: true });
      return;
    }

    const selectedKpis = allKpis.filter(
      (k) => k.kpiId && idsToCompare.includes(k.kpiId),
    );

    if (selectedKpis.length === 0) return;

    const counts: Record<string, number> = {};
    selectedKpis.forEach((k) => {
      if (k.validationType) {
        counts[k.validationType] = (counts[k.validationType] || 0) + 1;
      }
    });

    let majorityType = "";
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        majorityType = type;
      }
    });

    if (majorityType) {
      setValue("validationType", majorityType, { shouldValidate: true });
    } else {
      setValue("validationType", "", { shouldValidate: true });
    }
  }, [
    id,
    step,
    selectedKpiIds,
    baseKpiIds,
    otherKpiIds,
    isMinusKpiActive,
    allKpis,
    setValue,
  ]);

  // Visual frequency options helper
  const getFilteredVisualFrequencyOptions = () => {
    if (!selectedFrequency) return frequenceOptions;
    const currentIndex = frequencyOrder.indexOf(selectedFrequency);
    if (currentIndex === -1) return frequenceOptions;
    return frequenceOptions.filter(
      (opt) => frequencyOrder.indexOf(opt.value) > currentIndex,
    );
  };

  const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

  // Filter KPI items based on real-time search term
  const filteredKpis = useMemo(() => {
    let list = allKpis;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((item) => {
        return (
          item.KPIName?.toLowerCase().includes(term) ||
          item.KPILabel?.toLowerCase().includes(term) ||
          item.coreParameterName?.toLowerCase().includes(term) ||
          item.tag?.toLowerCase().includes(term) ||
          item.employeeName?.toLowerCase().includes(term) ||
          item.unit?.toLowerCase().includes(term)
        );
      });
    }
    return [...list].sort((a, b) => {
      const nameA = a.KPIName || "";
      const nameB = b.KPIName || "";
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [allKpis, searchTerm, sortAsc]);

  // Other KPI list excludes any KPI selected in Base KPI list
  const otherFilteredKpis = useMemo(() => {
    if (!isMinusKpiActive) return [];
    return filteredKpis.filter(
      (item) => !item.kpiId || !baseKpiIds.includes(item.kpiId),
    );
  }, [filteredKpis, baseKpiIds, isMinusKpiActive]);

  // Grouping helper by Core Parameter Name
  const groupKpisByCoreParameter = (kpiList: typeof filteredKpis) => {
    const groups: Record<string, typeof filteredKpis> = {};
    kpiList.forEach((item) => {
      const key = item.coreParameterName || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  /* ---------------- Handlers for Single KPI Mode ---------------- */
  const handleToggleSelectKpi = (kpiId: string) => {
    if (!kpiId) return;
    if (selectedKpiIds.includes(kpiId)) {
      setValue(
        "kpiIds",
        selectedKpiIds.filter((id) => id !== kpiId),
        { shouldValidate: true },
      );
    } else {
      setValue("kpiIds", [...selectedKpiIds, kpiId], { shouldValidate: true });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allMatchingIds = filteredKpis
        .map((item) => item.kpiId)
        .filter((kpiId): kpiId is string => !!kpiId);
      const combined = Array.from(
        new Set([...selectedKpiIds, ...allMatchingIds]),
      );
      setValue("kpiIds", combined, { shouldValidate: true });
    } else {
      const matchingIdsSet = new Set(filteredKpis.map((item) => item.kpiId));
      const remaining = selectedKpiIds.filter((id) => !matchingIdsSet.has(id));
      setValue("kpiIds", remaining, { shouldValidate: true });
    }
  };

  const isAllSelected = useMemo(() => {
    if (filteredKpis.length === 0) return false;
    return filteredKpis.every(
      (item) => item.kpiId && selectedKpiIds.includes(item.kpiId),
    );
  }, [filteredKpis, selectedKpiIds]);

  /* ---------------- Handlers for Base KPI Mode ---------------- */
  const handleToggleBaseKpi = (kpiId: string) => {
    if (!kpiId) return;
    if (baseKpiIds.includes(kpiId)) {
      setValue(
        "baseKpiIds",
        baseKpiIds.filter((id) => id !== kpiId),
        { shouldValidate: true },
      );
    } else {
      setValue("baseKpiIds", [...baseKpiIds, kpiId], { shouldValidate: true });
      if (otherKpiIds.includes(kpiId)) {
        setValue(
          "otherKpiIds",
          otherKpiIds.filter((id) => id !== kpiId),
          { shouldValidate: true },
        );
      }
    }
  };

  const handleSelectAllBase = (checked: boolean) => {
    if (checked) {
      const allMatchingIds = filteredKpis
        .map((item) => item.kpiId)
        .filter((kpiId): kpiId is string => !!kpiId);
      const combined = Array.from(new Set([...baseKpiIds, ...allMatchingIds]));
      setValue("baseKpiIds", combined, { shouldValidate: true });
      setValue(
        "otherKpiIds",
        otherKpiIds.filter((id) => !allMatchingIds.includes(id)),
        { shouldValidate: true },
      );
    } else {
      const matchingIdsSet = new Set(filteredKpis.map((item) => item.kpiId));
      const remaining = baseKpiIds.filter((id) => !matchingIdsSet.has(id));
      setValue("baseKpiIds", remaining, { shouldValidate: true });
    }
  };

  const isAllBaseSelected = useMemo(() => {
    if (filteredKpis.length === 0) return false;
    return filteredKpis.every(
      (item) => item.kpiId && baseKpiIds.includes(item.kpiId),
    );
  }, [filteredKpis, baseKpiIds]);

  /* ---------------- Handlers for Other KPI Mode ---------------- */
  const handleToggleOtherKpi = (kpiId: string) => {
    if (!kpiId) return;
    if (otherKpiIds.includes(kpiId)) {
      setValue(
        "otherKpiIds",
        otherKpiIds.filter((id) => id !== kpiId),
        { shouldValidate: true },
      );
    } else {
      if (!baseKpiIds.includes(kpiId)) {
        setValue("otherKpiIds", [...otherKpiIds, kpiId], {
          shouldValidate: true,
        });
      }
    }
  };

  const handleSelectAllOther = (checked: boolean) => {
    if (checked) {
      const allMatchingOtherIds = otherFilteredKpis
        .map((item) => item.kpiId)
        .filter((kpiId): kpiId is string => !!kpiId);
      const combined = Array.from(
        new Set([...otherKpiIds, ...allMatchingOtherIds]),
      );
      setValue("otherKpiIds", combined, { shouldValidate: true });
    } else {
      const matchingIdsSet = new Set(
        otherFilteredKpis.map((item) => item.kpiId),
      );
      const remaining = otherKpiIds.filter((id) => !matchingIdsSet.has(id));
      setValue("otherKpiIds", remaining, { shouldValidate: true });
    }
  };

  const isAllOtherSelected = useMemo(() => {
    if (otherFilteredKpis.length === 0) return false;
    return otherFilteredKpis.every(
      (item) => item.kpiId && otherKpiIds.includes(item.kpiId),
    );
  }, [otherFilteredKpis, otherKpiIds]);

  const nextStep = () => {
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: AddGroupKpiFormValues) => {
    const isMinus =
      data.visualFrequencyAggregate === "minus" || data.isMinusKpi;

    const payload: Record<string, unknown> = {
      kpiMergeId: id || undefined,
      unit: data.unit,
      tag: data.tag,
      kpiMergeName: data.kpiMergeName,
      visualFrequencyTypes: Array.isArray(data.visualFrequencyTypes)
        ? data.visualFrequencyTypes.join(",")
        : data.visualFrequencyTypes || "",
      visualFrequencyAggregate: data.visualFrequencyAggregate || "sum",
      frequencyType: data.frequencyType,
      value1: data.value1,
      value2: data.value2,
      validationType: data.validationType,
      isMinusKpi: isMinus,
    };

    if (isMinus) {
      payload.baseKpiIds = data.baseKpiIds;
      payload.otherKpiIds = data.otherKpiIds;
    } else {
      payload.kpiIds = data.kpiIds;
    }

    addUpdateMutation.mutate(payload as AddUpdateKpiMergeRes, {
      onSuccess: () => {
        navigate("/dashboard/kpi/group-kpis");
      },
    });
  };

  // Render Category Grouped Table for any given KPI list
  const renderKpiGroupedTable = (
    kpiList: typeof filteredKpis,
    selectedIds: string[],
    onToggle: (id: string) => void,
    onSelectAllGroup: (checked: boolean) => void,
    isGroupAllSelected: boolean,
    headerBgClass: string = "bg-[#2e3090]",
  ) => {
    const groupedData = groupKpisByCoreParameter(kpiList);

    return (
      <div className="flex-1 overflow-y-auto border rounded-md shadow-xs">
        <Table className="min-w-full table-fixed border-collapse">
          <TableHeader
            className={`sticky top-0 z-20 ${headerBgClass} text-white shadow-sm`}
          >
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[45px] text-white">
                <FormCheckbox
                  id={`select-all-${headerBgClass}`}
                  checked={isGroupAllSelected}
                  onChange={(e) => onSelectAllGroup(e.target.checked)}
                />
              </TableHead>
              <TableHead className="min-w-[180px] text-white">
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1.5 font-bold hover:text-gray-200 focus:outline-none"
                >
                  KPI Name <ArrowUpDown size={14} />
                </button>
              </TableHead>
              <TableHead className="min-w-[100px] text-white font-bold">
                Tag
              </TableHead>
              <TableHead className="min-w-[100px] text-white font-bold">
                Assigned
              </TableHead>
              <TableHead className="min-w-[100px] text-white font-bold">
                Validation
              </TableHead>
              <TableHead className="min-w-[90px] text-white font-bold">
                Goal
              </TableHead>
              <TableHead className="min-w-[80px] text-white font-bold">
                Unit
              </TableHead>
              <TableHead className="min-w-[100px] text-white font-bold">
                Frequency
              </TableHead>
              <TableHead className="min-w-[90px] text-white font-bold">
                Added
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isKpisLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex justify-center items-center gap-2 animate-spin">
                    <SpinnerIcon />
                  </div>
                </TableCell>
              </TableRow>
            ) : Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([coreParamName, groupItems]) => (
                <Fragment key={coreParamName}>
                  {/* Category Header Row */}
                  <TableRow className="bg-[#f0f2fd] border-y border-indigo-100 hover:bg-[#f0f2fd]">
                    <TableCell
                      colSpan={9}
                      className="py-2.5 px-4 font-bold text-[#2e3090] text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{coreParamName}</span>
                        <span className="px-2 py-0.5 text-xs font-bold text-[#2e3090] bg-indigo-100 rounded-full inline-flex items-center justify-center min-w-[20px]">
                          {groupItems.length}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Category Item Rows */}
                  {groupItems.map((item, index) => {
                    const isChecked =
                      !!item.kpiId && selectedIds.includes(item.kpiId);
                    const itemObj = item as unknown as Record<string, unknown>;
                    const assignedName =
                      item.employeeName ||
                      (itemObj.employeeName as string) ||
                      "";
                    const createdByName =
                      (itemObj.createdByName as string) ||
                      (itemObj.createdBy as string) ||
                      (itemObj.createdEmployeeName as string) ||
                      "";

                    return (
                      <TableRow
                        key={item.kpiId || index}
                        className={`cursor-pointer transition-colors border-b border-gray-100 ${
                          isChecked
                            ? "bg-blue-50/70 hover:bg-blue-100/70"
                            : index % 2 === 0
                              ? "bg-gray-50/40 hover:bg-gray-100/60"
                              : "bg-white hover:bg-gray-100/60"
                        }`}
                        onClick={() => item.kpiId && onToggle(item.kpiId)}
                      >
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className="py-2.5"
                        >
                          <FormCheckbox
                            id={`kpi-row-${item.kpiId}`}
                            checked={isChecked}
                            onChange={() => item.kpiId && onToggle(item.kpiId)}
                          />
                        </TableCell>
                        <TableCell className="truncate font-medium text-gray-900 py-2.5">
                          <TableTooltip text={String(item.KPIName ?? " - ")} />
                        </TableCell>
                        <TableCell className="truncate text-gray-700 py-2.5">
                          <TableTooltip text={String(item.tag ?? " - ")} />
                        </TableCell>
                        <TableCell className="py-2.5">
                          {assignedName ? (
                            <div
                              className="flex items-center"
                              title={assignedName}
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase shrink-0 shadow-xs ${getColorFromName(assignedName)}`}
                              >
                                {getInitials(assignedName)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="truncate font-medium text-gray-800 py-2.5">
                          {getValidationSymbol(item.validationType || "")}
                        </TableCell>
                        <TableCell className="truncate text-gray-800 py-2.5">
                          {getGoalDisplay(item)}
                        </TableCell>
                        <TableCell className="truncate text-gray-700 py-2.5">
                          {item.unit || "-"}
                        </TableCell>
                        <TableCell className="truncate text-gray-700 py-2.5">
                          {formatFrequencyType(item.frequencyType || "")}
                        </TableCell>
                        <TableCell className="py-2.5">
                          {createdByName ? (
                            <div
                              className="flex items-center"
                              title={createdByName}
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase shrink-0 shadow-xs ${getColorFromName(createdByName)}`}
                              >
                                {getInitials(createdByName)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-gray-500"
                >
                  No KPIs found matching search/frequency filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full px-2 sm:px-4 py-6 flex flex-col overflow-hidden">
        {/* Stepper Progress Bar */}
        <div className="shrink-0">
          <StepProgress
            currentStep={step}
            totalSteps={2}
            stepNames={["KPIs Selection", "Basic Details"]}
            back={prevStep}
            next={nextStep}
            isFirstStep={step === 1}
            isLastStep={step === 2}
            isPending={addUpdateMutation.isPending}
            onFinish={handleSubmit(onSubmit)}
            isUpdate={!!id}
            isNextDisabled={!isStep1Valid}
            isSubmitDisabled={!isStep1Valid || !isStep2Valid}
          />
        </div>

        {/* Step Content */}
        <div className="step-content w-full flex-1 overflow-hidden flex flex-col pt-4">
          {step === 1 && (
            <div className="bg-white rounded-lg border p-4 flex flex-col flex-1 overflow-hidden">
              {/* Header controls layout: Frequency, Sum/Average, and optional Search bar in one line */}
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4 shrink-0 border-b pb-3">
                <div className="flex flex-wrap items-end gap-4 flex-1">
                  {/* Frequency Selector */}
                  <div className="w-full sm:w-64">
                    <Controller
                      control={control}
                      name="frequencyType"
                      rules={{ required: "Frequency is required" }}
                      render={({ field }) => (
                        <FormSelect
                          label="Frequency"
                          value={field.value}
                          onChange={(val) => {
                            const freqStr =
                              typeof val === "string"
                                ? val
                                : Array.isArray(val)
                                  ? val[0] || ""
                                  : "";
                            field.onChange(freqStr);
                            setValue("kpiIds", []);
                            setValue("baseKpiIds", []);
                            setValue("otherKpiIds", []);

                            const newUpperIndex =
                              frequencyOrder.indexOf(freqStr);
                            const currentVisuals =
                              watch("visualFrequencyTypes") || [];
                            const validVisuals = currentVisuals.filter(
                              (v) => frequencyOrder.indexOf(v) > newUpperIndex,
                            );
                            setValue("visualFrequencyTypes", validVisuals);
                          }}
                          options={frequenceOptions}
                          error={errors.frequencyType}
                          isMandatory
                          placeholder="Select Frequency"
                        />
                      )}
                    />
                  </div>

                  {/* Sum/Average Selector */}
                  <div className="w-full sm:w-64">
                    <Controller
                      control={control}
                      name="visualFrequencyAggregate"
                      render={({ field }) => (
                        <FormSelect
                          label="Sum/Average"
                          value={field.value || "sum"}
                          onChange={(val) => {
                            field.onChange(val);
                            const isMinus = val === "minus";
                            setValue("isMinusKpi", isMinus);
                          }}
                          options={sumAveOptions}
                          error={errors.visualFrequencyAggregate}
                          placeholder="Select visual frequency Aggregate"
                        />
                      )}
                    />
                  </div>

                  {/* Search Bar (shown only when selectedFrequency is true) */}
                  {selectedFrequency && (
                    <div className="flex-1 min-w-[280px] mb-2">
                      <label className="text-lg font-medium text-black mb-4 block">
                        Search KPI
                      </label>
                      <div className="relative h-10 w-full pt-0.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
                          <SearchIcon />
                        </span>
                        <Input
                          type="text"
                          placeholder="Search KPI by name, tag, core parameter..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-3 h-10 text-sm w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Value 1 and Value 2 if validation type is selected and frequency is selected */}
                {selectedFrequency && selectedValidationType && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-md flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-xs text-gray-500 font-normal">
                        Value 1:
                      </span>
                      {selectedValidationType === "YES_NO"
                        ? watch("value1") === "1"
                          ? "Yes"
                          : watch("value1") === "2"
                            ? "No"
                            : watch("value1") || "-"
                        : watch("value1") || "-"}
                    </div>

                    {selectedValidationType === "BETWEEN" && (
                      <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-md flex items-center gap-1.5 animate-in fade-in">
                        <span className="text-xs text-gray-500 font-normal">
                          Value 2:
                        </span>
                        {watch("value2") || "-"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!selectedFrequency ? (
                <div className="p-8 text-center text-indigo-600 bg-indigo-50/50 border border-dashed rounded-md flex-1 flex flex-col justify-center items-center">
                  <p className="text-base font-medium">
                    Please select a Frequency above to view and select KPIs.
                  </p>
                </div>
              ) : (
                <Fragment>
                  {isMinusKpiActive ? (
                    /* TWO-PART VIEW WHEN IS MINUS KPI IS TRUE */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
                      {/* PART 1: BASE KPI SELECTION */}
                      <div className="flex flex-col border rounded-md p-3 bg-gray-50/30 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <h3 className="text-base font-bold text-[#2e3090]">
                            Base KPI
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                              Base Selected: {baseKpiIds.length}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                handleSelectAllBase(!isAllBaseSelected)
                              }
                              disabled={filteredKpis.length === 0}
                            >
                              {isAllBaseSelected
                                ? "Deselect All"
                                : "Select All"}
                            </Button>
                          </div>
                        </div>

                        {renderKpiGroupedTable(
                          filteredKpis,
                          baseKpiIds,
                          handleToggleBaseKpi,
                          handleSelectAllBase,
                          isAllBaseSelected,
                          "bg-[#2e3090]",
                        )}
                      </div>

                      {/* PART 2: OTHER KPI SELECTION (Excludes Base Selected KPIs) */}
                      <div className="flex flex-col border rounded-md p-3 bg-gray-50/30 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <h3 className="text-base font-bold text-[#2e3090]">
                            Other KPI
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                              Other Selected: {otherKpiIds.length}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                handleSelectAllOther(!isAllOtherSelected)
                              }
                              disabled={otherFilteredKpis.length === 0}
                            >
                              {isAllOtherSelected
                                ? "Deselect All"
                                : "Select All"}
                            </Button>
                          </div>
                        </div>

                        {renderKpiGroupedTable(
                          otherFilteredKpis,
                          otherKpiIds,
                          handleToggleOtherKpi,
                          handleSelectAllOther,
                          isAllOtherSelected,
                          "bg-[#2e3090]",
                        )}
                      </div>
                    </div>
                  ) : (
                    /* SINGLE TABLE VIEW FOR SUM / AVERAGE MODE */
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-sm font-semibold text-[#2e3090] px-3 py-1.5 bg-indigo-50 rounded-md">
                          Selected: {selectedKpiIds.length} KPI(s)
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(!isAllSelected)}
                          disabled={filteredKpis.length === 0}
                        >
                          {isAllSelected
                            ? "Deselect All Matching"
                            : "Select All Matching"}
                        </Button>
                      </div>

                      {renderKpiGroupedTable(
                        filteredKpis,
                        selectedKpiIds,
                        handleToggleSelectKpi,
                        handleSelectAll,
                        isAllSelected,
                        "bg-[#2e3090]",
                      )}
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg border p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id ? "Edit Basic Details" : "Group KPI Basic Details"}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter the group name, validation, and aggregate settings.
                </p>
              </div>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormInputField
                  label="Group Name"
                  {...register("kpiMergeName", {
                    required: "Group name is required",
                  })}
                  isMandatory
                  error={errors.kpiMergeName}
                  placeholder="Enter Group Name"
                />

                <Controller
                  control={control}
                  name="validationType"
                  rules={{
                    required: "Validation type is required",
                  }}
                  render={({ field }) => (
                    <FormSelect
                      label="Validation Type"
                      value={field.value}
                      onChange={field.onChange}
                      options={validationTypeOptions}
                      error={errors.validationType}
                      placeholder="Select validation type"
                      isMandatory
                    />
                  )}
                />
              </div>

              {shouldShowVisualFrequency && (
                <div className="flex gap-2 items-center">
                  <div>
                    <Controller
                      control={control}
                      name="visualFrequencyTypes"
                      render={({ field }) => (
                        <FormSelect
                          label="Visual Frequency Types"
                          value={field.value || []}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          options={getFilteredVisualFrequencyOptions()}
                          error={errors.visualFrequencyTypes}
                          isMulti={true}
                          placeholder="Select visual frequency types"
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-center">
                    {selectedValidationType === "YES_NO" ? (
                      <Controller
                        control={control}
                        name="value1"
                        render={({ field }) => (
                          <FormSelect
                            label="Value 1"
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              if (
                                val === "" ||
                                val === undefined ||
                                val === null
                              ) {
                                setIsManualValue1(false);
                              } else {
                                setIsManualValue1(true);
                              }
                            }}
                            options={[
                              { value: "1", label: "Yes" },
                              { value: "2", label: "No" },
                            ]}
                            error={errors.value1}
                            placeholder="Select Yes/No"
                          />
                        )}
                      />
                    ) : (
                      <FormInputField
                        label="Value 1"
                        type="number"
                        {...register("value1", {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9.-]/g,
                              "",
                            );
                            if (e.target.value === "") {
                              setIsManualValue1(false);
                            } else {
                              setIsManualValue1(true);
                            }
                          },
                        })}
                        error={errors.value1}
                        placeholder="Enter Value 1 (Numbers only)"
                      />
                    )}

                    {selectedValidationType === "BETWEEN" && (
                      <FormInputField
                        label="Value 2"
                        type="number"
                        {...register("value2", {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9.-]/g,
                              "",
                            );
                            if (e.target.value === "") {
                              setIsManualValue2(false);
                            } else {
                              setIsManualValue2(true);
                            }
                          },
                        })}
                        error={errors.value2}
                        placeholder="Enter Value 2 (Numbers only)"
                      />
                    )}

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormInputField
                        label="Unit"
                        {...register("unit")}
                        placeholder="Enter Unit (e.g. %, Count, Days)"
                      />
                      <FormInputField
                        label="Tag"
                        {...register("tag")}
                        placeholder="Enter Tag"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

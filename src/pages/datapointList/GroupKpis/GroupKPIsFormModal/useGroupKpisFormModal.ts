import { addUpdateKpiMergeMutation } from "@/features/api/companyDatapoint";
import { useDdAllKpiList } from "@/features/api/KpiList";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

const frequenceOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALFYEARLY", label: "Half-Yearly" },
  { value: "YEARLY", label: "Yearly" },
];

export interface GroupKpiFormValues {
  kpiIds: string[];
  frequencyType: string;
  visualFrequencyTypes: string[];
  visualFrequencyAggregate: string;
  unit: string;
  tag: string;
  kpiMergeName: string;
  value1: string;
  value2: string;
  validationType: string;
}

export const validationTypeOptions = [
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
  {
    value: "average",
    label: "Average",
  },
];

const frequencyOrder = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "HALFYEARLY",
  "YEARLY",
];

export default function useGroupKpisFormModal({
  modalClose,
  selectedKpiData,
  groupId,
}: GroupKpisProps) {
  const methods = useForm<GroupKpiFormValues>({
    defaultValues: {
      kpiIds: [],
      frequencyType: "",
      visualFrequencyTypes: [],
      visualFrequencyAggregate: "sum",
      unit: "",
      tag: "",
      kpiMergeName: "",
      value1: "",
      value2: "",
      validationType: "",
    },
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const selectedFrequency = watch("frequencyType");

  const { data: kpiListData, isLoading: isKpisLoading } = useDdAllKpiList({
    filter: { frequencyType: selectedFrequency },
    enable: !!selectedFrequency,
  });

  const selectedKpiIds = watch("kpiIds");
  const selectedValidationType = watch("validationType");

  // Determine if the first selected KPI is YES_NO type
  const firstSelectedKpiValidationType = useMemo(() => {
    if (!selectedKpiIds || selectedKpiIds.length === 0 || !kpiListData?.data)
      return null;
    const firstKpi = kpiListData.data.find(
      (item) => item.kpiId === selectedKpiIds[0],
    );
    return firstKpi?.validationType || null;
  }, [selectedKpiIds, kpiListData]);

  const isYesNoGroup =
    firstSelectedKpiValidationType === "YES_NO" ||
    selectedValidationType === "YES_NO";

  const kpiOptions = useMemo(() => {
    if (!kpiListData?.data) return [];

    let filteredData = kpiListData.data;

    // Filter KPIs based on either the first selected KPI or the explicitly selected validation type
    if (firstSelectedKpiValidationType || selectedValidationType) {
      if (isYesNoGroup) {
        // Only show YES_NO KPIs
        filteredData = filteredData.filter(
          (item) => item.validationType === "YES_NO",
        );
      } else {
        // Show all non-YES_NO KPIs
        filteredData = filteredData.filter(
          (item) => item.validationType !== "YES_NO",
        );
      }
    }

    return filteredData.map((item) => ({
      value: item.kpiId,
      label: `${item.KPIName} (${item.KPILabel}) (${item.coreParameterName})`,
    }));
  }, [
    kpiListData,
    firstSelectedKpiValidationType,
    isYesNoGroup,
    selectedValidationType,
  ]);

  // Filter validation type options based on selected KPIs
  const filteredValidationTypeOptions = useMemo(() => {
    if (!firstSelectedKpiValidationType) return validationTypeOptions;
    if (firstSelectedKpiValidationType === "YES_NO") {
      return validationTypeOptions.filter((opt) => opt.value === "YES_NO");
    }
    return validationTypeOptions.filter((opt) => opt.value !== "YES_NO");
  }, [firstSelectedKpiValidationType]);

  // Auto-set and clear fields based on selected KPIs
  const prevIsYesNo = useRef<boolean | null>(null);
  useEffect(() => {
    if (firstSelectedKpiValidationType === null) {
      prevIsYesNo.current = null;
      return;
    }

    const currentlyIsYesNo = firstSelectedKpiValidationType === "YES_NO";

    // If we just entered a new type group
    if (prevIsYesNo.current !== currentlyIsYesNo) {
      if (currentlyIsYesNo) {
        setValue("validationType", "YES_NO");
        setValue("value1", "");
        setValue("value2", "");
      } else {
        // If we switched from YES_NO to something else, reset validation type if it was YES_NO
        if (selectedValidationType === "YES_NO") {
          setValue("validationType", "");
        }
        setValue("value1", "");
        setValue("value2", "");
      }
    }
    prevIsYesNo.current = currentlyIsYesNo;
  }, [firstSelectedKpiValidationType, setValue, selectedValidationType]);

  const addUpdateKpiGroupMutation = addUpdateKpiMergeMutation();

  const prevFrequency = useRef(selectedFrequency);

  // Reset KPIs when frequency changes
  useEffect(() => {
    if (
      selectedFrequency &&
      prevFrequency.current &&
      selectedFrequency !== prevFrequency.current
    ) {
      setValue("kpiIds", []);
    }
    prevFrequency.current = selectedFrequency;
  }, [selectedFrequency, setValue]);

  useEffect(() => {
    if (!selectedKpiData || selectedKpiData.length === 0) return;
    const frequencies = [
      ...new Set(
        selectedKpiData
          .map((item) => item.frequencyType)
          .filter((f): f is string => !!f),
      ),
    ];
    if (frequencies.length === 0) return;
    const highestFrequency = frequencies.reduce((highest, current) => {
      return frequencyOrder.indexOf(current) > frequencyOrder.indexOf(highest)
        ? current
        : highest;
    }, frequencies[0]);
    setValue("frequencyType", highestFrequency);

    if (!groupId) {
      setValue(
        "kpiIds",
        selectedKpiData
          .map((item) => item.kpiId)
          .filter((id): id is string => !!id),
      );
    }
  }, [selectedKpiData, setValue, groupId]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      kpiMergeId: groupId ?? undefined,
      kpiIds: data.kpiIds,
      unit: data.unit,
      tag: data.tag,
      kpiMergeName: data.kpiMergeName,
      visualFrequencyTypes: data.visualFrequencyTypes.join(","),
      visualFrequencyAggregate: data.visualFrequencyAggregate,
      frequencyType: data.frequencyType,
      value1: data.value1,
      value2: data.value2,
      validationType: data.validationType,
    };
    addUpdateKpiGroupMutation.mutate(payload);
    modalClose();
  });

  const handleModalClose = () => {
    reset();
    modalClose();
  };

  const getFilteredVisualFrequencyOptions = () => {
    const selected = selectedFrequency;
    if (!selected) return frequenceOptions;
    const currentIndex = frequencyOrder.indexOf(selected);
    if (currentIndex === -1) return frequenceOptions;
    return frequenceOptions.filter(
      (opt) => frequencyOrder.indexOf(opt.value) >= currentIndex,
    );
  };

  const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

  return {
    ...methods,
    onSubmit,
    handleModalClose,
    isPending: addUpdateKpiGroupMutation.isPending,
    frequenceOptions,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    sumAveOptions,
    validationTypeOptions: filteredValidationTypeOptions,
    kpiOptions,
    isKpisLoading,
  };
}

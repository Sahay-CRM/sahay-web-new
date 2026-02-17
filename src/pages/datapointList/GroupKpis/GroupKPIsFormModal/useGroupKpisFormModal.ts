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
}

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
    },
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const selectedFrequency = watch("frequencyType");

  const { data: kpiListData, isLoading: isKpisLoading } = useDdAllKpiList({
    filter: { frequencyType: selectedFrequency },
    enable: !!selectedFrequency,
  });

  const kpiOptions = useMemo(() => {
    return (
      kpiListData?.data?.map((item) => ({
        value: item.kpiId,
        label: `${item.KPIName} (${item.KPILabel}) (${item.coreParameterName})`,
      })) || []
    );
  }, [kpiListData]);

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
    kpiOptions,
    isKpisLoading,
  };
}

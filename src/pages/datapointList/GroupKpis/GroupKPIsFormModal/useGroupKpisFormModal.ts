import { addUpdateKpiMergeMutation } from "@/features/api/companyDatapoint";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const frequenceOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALFYEARLY", label: "Half-Yearly" },
  { value: "YEARLY", label: "Yearly" },
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
  selectedKpisIds,
  groupId,
}: GroupKpisProps) {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const selectedFrequency = watch("frequencyType");

  const { mutate: addUpdateKpiGroup } = addUpdateKpiMergeMutation();

  useEffect(() => {
    if (!selectedKpiData || selectedKpiData.length === 0) return;
    const frequencies = [
      ...new Set(
        selectedKpiData
          .map((item) => item.frequencyType)
          .filter((f): f is string => !!f)
      ),
    ];
    if (frequencies.length === 0) return;
    const highestFrequency = frequencies.reduce((highest, current) => {
      return frequencyOrder.indexOf(current) > frequencyOrder.indexOf(highest)
        ? current
        : highest;
    }, frequencies[0]);
    setValue("frequencyType", highestFrequency);
    const highestFreqKpis = selectedKpiData.filter(
      (kpi) => kpi.frequencyType === highestFrequency
    );
    const aggregate = highestFreqKpis[0]?.visualFrequencyAggregate || "sum";
    setValue("visualFrequencyAggregate", aggregate);
    const visualFreqTypes = highestFreqKpis[0]?.visualFrequencyTypes;
    const visualFrequencies =
      typeof visualFreqTypes === "string"
        ? visualFreqTypes.split(",")
        : visualFreqTypes || [];
    setValue("visualFrequencyTypes", visualFrequencies);
    const unit = highestFreqKpis.find((kpi) => kpi.unit)?.unit || "";
    setValue("unit", unit);
    const tag = highestFreqKpis.find((kpi) => kpi.tag)?.tag || "";
    setValue("tag", tag);
  }, [selectedKpiData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (selectedKpisIds) {
      // const kpiMergeId = "5ef4dfbd-a0c7-4ee4-8dff-c816311fb7d3";
      // const payload = kpiMergeId
      //   ? {
      //       kpiMergeId: kpiMergeId,
      //       kpiIds: selectedKpisIds,
      //       tag: data.tag,
      //       visualFrequencyTypes: data.visualFrequencyTypes,
      //       visualFrequencyAggregate: data.visualFrequencyAggregate,
      //     }
      //   : {
      //       kpiIds: selectedKpisIds,
      //       tag: data.tag,
      //       visualFrequencyTypes: data.visualFrequencyTypes,
      //       visualFrequencyAggregate: data.visualFrequencyAggregate,
      //     };

      const payload = {
        kpiMergeId: groupId ?? undefined,
        kpiIds: selectedKpisIds,
        unit: data.unit,
        tag: data.tag,
        visualFrequencyTypes: data.visualFrequencyTypes,
        visualFrequencyAggregate: data.visualFrequencyAggregate,
      };
      addUpdateKpiGroup(payload);
      modalClose();
    }
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
      (opt) => frequencyOrder.indexOf(opt.value) >= currentIndex
    );
  };

  const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

  return {
    register,
    control,
    setValue,
    errors,
    onSubmit,
    watch,
    handleModalClose,
    isPending: false,
    frequenceOptions,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    sumAveOptions,
  };
}

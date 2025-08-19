import { useForm } from "react-hook-form";
import {
  useAddUpdateDatapoint,
  useGetDatapointById,
} from "@/features/api/companyDatapoint";
import { useEffect } from "react";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";

interface UseEditDatapointFormModalProps {
  modalClose: () => void;
  kpiId: string;
}

export default function useEditDatapointFormModal({
  modalClose,
  kpiId,
}: UseEditDatapointFormModalProps) {
  const { mutate: addDatapoint, isPending } = useAddUpdateDatapoint();

  const { data: datapointApiData } = useGetDatapointById(kpiId);
  const { data: employeeData } = useGetEmployeeDd({
    filter: { isDeactivated: false },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm();

  useEffect(() => {
    if (datapointApiData) {
      setValue("KPIMasterId", {
        kpiId: datapointApiData.kpiId,
        KPIMasterId: datapointApiData.KPIMasterId,
        KPIName:
          datapointApiData.KPIMaster?.KPIName ||
          datapointApiData.dataPointLabel,
        KPILabel:
          datapointApiData.KPIMaster?.KPILabel ||
          datapointApiData.dataPointName,
      });
      // Set frequency
      setValue("frequencyType", datapointApiData.frequencyType);
      // Set validation type
      setValue("validationType", datapointApiData.validationType);
      setValue(
        "visualFrequencyAggregate",
        datapointApiData.visualFrequencyAggregate,
      );
      // Set unit
      setValue("employeeId", datapointApiData.employeeId);
      setValue("unit", datapointApiData.unit);
      setValue("value1", datapointApiData.value1);
      setValue("value2", datapointApiData.value2);
      setValue("tag", datapointApiData.tag);
      if (
        datapointApiData.validationType === "YES_NO" &&
        datapointApiData.employeeId
      ) {
        setValue(
          `yesno_${datapointApiData.employeeId}`,
          datapointApiData.value1 === "1"
            ? { value: "1", label: "Yes" }
            : { value: "0", label: "No" },
        );
      }
      // Set core parameter
      setValue("coreParameterId", datapointApiData.coreParameterId);
      if (datapointApiData.visualFrequencyTypes) {
        const visualFrequencyArray = datapointApiData.visualFrequencyTypes
          .split(",")
          .map((type) => type.trim());
        setValue("visualFrequencyTypes", visualFrequencyArray);
      }
    }
  }, [datapointApiData, setValue]);

  const onSubmit = handleSubmit((data) => {
    const visualFrequencyTypesStr = Array.isArray(data.visualFrequencyTypes)
      ? data.visualFrequencyTypes.join(",")
      : data.visualFrequencyTypes;
    const payload = {
      kpiId: kpiId,
      KPIMasterId: data.KPIMasterId.KPIMasterId,
      coreParameterId: data.coreParameterId,
      employeeId: data.employeeId,
      // frequencyType: data.frequencyType,
      tag: data.tag,
      unit: data.unit,
      validationType: data.validationType,
      value1: data.value1,
      value2: data.value2,
      frequencyType: data.frequencyType,
      visualFrequencyTypes: visualFrequencyTypesStr,
      visualFrequencyAggregate: data.visualFrequencyAggregate,
    };
    addDatapoint(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  });

  const handleClose = () => {
    reset();
    modalClose();
  };

  const frequenceOptions = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "HALFYEARLY", label: "Half-Yearly" },
    { value: "YEARLY", label: "Yearly" },
  ];
  // Get the selected frequency value
  const selectedFrequency = watch("frequencyType");
  const validationType = watch("validationType");
  const visualFrequencyTypes = watch("visualFrequencyTypes");
  const visualFrequencyAggregate = watch("visualFrequencyAggregate");
  const employee = watch("employeeId");

  const showBoth = validationType === "6" || validationType === "BETWEEN";
  const showYesNo = validationType === "7" || validationType === "YES_NO";

  const allOptions = (employeeData?.data || [])
    .filter((item) => !item.isDeactivated)
    .map((emp) => ({
      value: emp.employeeId,
      label: emp.employeeName,
    }));

  // Filter visual frequency options based on selected frequency
  const getFilteredVisualFrequencyOptions = () => {
    if (!selectedFrequency) return frequenceOptions;

    const frequencyIndex = frequenceOptions.findIndex(
      (opt) => opt.value === selectedFrequency,
    );

    if (frequencyIndex === -1) return frequenceOptions;

    // Return only options that come after the selected frequency
    return frequenceOptions.slice(frequencyIndex + 1);
  };

  // Check if visual frequency should be shown (not when YEARLY is selected)
  const shouldShowVisualFrequency = selectedFrequency !== "YEARLY";

  // Check if sum/ave field should be shown
  const shouldShowSumAveField =
    validationType !== "YES_NO" && visualFrequencyTypes?.length > 0;

  const validationOptions = [
    { value: "EQUAL_TO", label: "= Equal to" },
    {
      value: "GREATER_THAN_OR_EQUAL_TO",
      label: ">= Greater than or equal to",
    },
    { value: "GREATER_THAN", label: "> Greater than" },
    { value: "LESS_THAN", label: "< Less than" },
    { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
    { value: "BETWEEN", label: "Between" },
    { value: "YES_NO", label: "Yes/No" },
  ];
  const sumAveOptions = [
    { value: "sum", label: "Sum" },
    {
      value: "average",
      label: "Average",
    },
  ];
  const yesnoOptions = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  const getEmployeeName = (emp: DataPointEmployee) => {
    if (emp?.employeeName) return emp.employeeName;
    const found = employeeData?.data?.find(
      (e: EmployeeDetails) => e.employeeId === emp.employeeId,
    );
    return found?.employeeName || emp.employeeId || "";
  };

  return {
    register,
    errors,
    onSubmit,
    control,
    isPending,
    handleClose,
    sumAveOptions,
    validationOptions,
    shouldShowSumAveField,
    shouldShowVisualFrequency,
    getFilteredVisualFrequencyOptions,
    visualFrequencyAggregate,
    hasData: datapointApiData?.hasData,
    setValue,
    frequenceOptions,
    validationType,
    watch,
    selectedFrequency,
    datapointApiData,
    employee,
    allOptions,
    getEmployeeName,
    showYesNo,
    showBoth,
    yesnoOptions,
  };
}

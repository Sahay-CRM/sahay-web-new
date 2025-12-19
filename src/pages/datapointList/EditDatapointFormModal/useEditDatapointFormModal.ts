import { useForm } from "react-hook-form";
import {
  useAddUpdateDatapoint,
  useGetDatapointById,
} from "@/features/api/companyDatapoint";
import { useEffect, useState } from "react";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
import { useDdNonSelectAllKpiList } from "@/features/api/KpiList";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UseEditDatapointFormModalProps {
  modalClose: () => void;
  kpiId: string;
}

export default function useEditDatapointFormModal({
  modalClose,
  kpiId,
}: UseEditDatapointFormModalProps) {
  const [isKpiSearch, setIsKpiSearch] = useState("");
  const [isEmployeeSearch, setIsEmployeeSearch] = useState("");

  const [isChildData, setIsChildData] = useState<string | undefined>();

  const [isForceDelete, setIsForceDelete] = useState(false);
  const { mutate: addDatapoint, isPending } = useAddUpdateDatapoint();

  const { data: datapointApiData } = useGetDatapointById(kpiId);
  const { data: employeeData } = useGetEmployeeDd({
    filter: {
      isDeactivated: false,
      search: isEmployeeSearch.length >= 3 ? isEmployeeSearch : undefined,
      pageSize: 25,
    },
    enable: isEmployeeSearch.length >= 3,
  });
  const { data: datpointData } = useDdNonSelectAllKpiList({
    filter: {
      search: isKpiSearch && isKpiSearch.length >= 3 ? isKpiSearch : undefined,
    },
    enable: false,
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
      setValue("KPIMasterId", datapointApiData.KPIMasterId);

      setValue("kpiId", datapointApiData.kpiId);

      setValue("frequencyType", datapointApiData.frequencyType);

      setValue("validationType", datapointApiData.validationType);
      setValue(
        "visualFrequencyAggregate",
        datapointApiData.visualFrequencyAggregate,
      );

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

      setValue("coreParameterId", datapointApiData.coreParameterId);

      if (datapointApiData.visualFrequencyTypes) {
        let visualFrequencyArray: string[];

        if (typeof datapointApiData.visualFrequencyTypes === "string") {
          visualFrequencyArray = datapointApiData.visualFrequencyTypes
            .split(",")
            .map((type) => type.trim());
        } else {
          visualFrequencyArray = datapointApiData.visualFrequencyTypes;
        }

        setValue("visualFrequencyTypes", visualFrequencyArray);
      }
    }
  }, [datapointApiData, setValue]);

  const onSubmit = (isForceChange?: boolean) => {
    handleSubmit((data) => {
      const visualFrequencyTypesStr = Array.isArray(data.visualFrequencyTypes)
        ? data.visualFrequencyTypes.join(",")
        : data.visualFrequencyTypes;
      const payload = {
        KPIMasterId: data.KPIMasterId,
        kpiId: data.kpiId,
        coreParameterId: data.coreParameterId,
        employeeId: data.employeeId,
        tag: data.tag,
        unit: data.unit,
        validationType: data.validationType,
        value1: data.value1,
        value2: data.value2,
        frequencyType: data.frequencyType,
        visualFrequencyTypes: visualFrequencyTypesStr,
        visualFrequencyAggregate: data.visualFrequencyAggregate,
        isForceChange: isForceChange,
      };
      addDatapoint(payload, {
        onSuccess: () => {
          handleClose();
          setIsForceDelete(false);
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{
            message?: string;
            status: number;
          }>;

          if (axiosError.response?.data?.status === 417) {
            setIsChildData(axiosError.response?.data?.message);
            setIsForceDelete(true);
          } else if (axiosError.response?.data.status !== 417) {
            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          }
        },
      });
    })();
  };
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

  const allKpi = (datpointData?.data || []).map((emp) => ({
    KPIMasterId: emp.KPIMasterId ?? "",
    KPIId: emp.kpiId ?? "",
    KPIName: emp.KPIName ?? "",
    value: emp.KPIMasterId ?? "",
    label: emp.KPIName ?? "",
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
    { label: "No", value: "2" },
  ];
  // const skipDaysOption = [
  //   { label: "Sun", value: "0" },
  //   { label: "Mon", value: "1" },
  //   { label: "Tue", value: "2" },
  //   { label: "Wed", value: "3" },
  //   { label: "Thu", value: "4" },
  //   { label: "Fri", value: "5" },
  //   { label: "Sat", value: "6" },
  // ];

  const getEmployeeName = (emp: DataPointEmployee) => {
    if (emp?.employeeName) return emp.employeeName;
    const found = employeeData?.data?.find(
      (e: EmployeeDetails) => e.employeeId === emp.employeeId,
    );
    return found?.employeeName || emp.employeeId || "";
  };

  useEffect(() => {
    if (!selectedFrequency) return;

    // Allowed options after selectedFrequency
    const validOptions = getFilteredVisualFrequencyOptions().map(
      (opt) => opt.value,
    );

    // Remove invalid visualFrequencyTypes
    if (Array.isArray(visualFrequencyTypes)) {
      const filtered = visualFrequencyTypes.filter((val) =>
        validOptions.includes(val),
      );
      if (filtered.length !== visualFrequencyTypes.length) {
        setValue("visualFrequencyTypes", filtered, { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrequency]);

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
    allKpi,
    getEmployeeName,
    showYesNo,
    showBoth,
    yesnoOptions,
    setIsKpiSearch,
    isChildData,
    setIsEmployeeSearch,
    isForceDelete,
    // skipDaysOption,
  };
}

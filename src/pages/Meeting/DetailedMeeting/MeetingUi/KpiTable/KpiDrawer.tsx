import {
  useAddUpdateDatapoint,
  useGetDatapointById,
} from "@/features/api/companyDatapoint";
import { useGetCoreParameterDropdown } from "@/features/api/Business";
import React, { useRef, useEffect, useState } from "react";
import FormSelect from "@/components/shared/Form/FormSelect";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { queryClient } from "@/queryClient";

interface KpiDrawerProps {
  open: boolean;
  onClose: () => void;
  kpiId?: string;
}

const frequenceOptions = [
  { value: "DAILY", label: "DAILY" },
  { value: "WEEKLY", label: "WEEKLY" },
  { value: "MONTHLY", label: "MONTHLY" },
  { value: "QUARTERLY", label: "QUARTERLY" },
  { value: "HALFYEARLY", label: "HALFYEARLY" },
  { value: "YEARLY", label: "YEARLY" },
];

const validationOptions = [
  { value: "EQUAL_TO", label: "= Equal to" },
  { value: "GREATER_THAN_OR_EQUAL_TO", label: ">= Greater than or equal to" },
  { value: "GREATER_THAN", label: "> Greater than" },
  { value: "LESS_THAN", label: "< Less than" },
  { value: "LESS_THAN_OR_EQUAL_TO", label: "<= Less than or equal to" },
  { value: "BETWEEN", label: "Between" },
  { value: "YES_NO", label: "Yes/No" },
];

const KpiDrawer: React.FC<KpiDrawerProps> = ({ open, onClose, kpiId }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { data: kpiData } = useGetDatapointById(kpiId || "");
  const { data: corePara } = useGetCoreParameterDropdown();

  const { mutate: addDatapoint } = useAddUpdateDatapoint();

  const coreParameterOption = corePara
    ? corePara.data.map((status) => ({
        label: status.coreParameterName,
        value: status.coreParameterId,
      }))
    : [];

  const onSubmit = (data: KPIFormData) => {
    const payload = {
      ...data,
      kpiId: kpiId,
    };
    addDatapoint(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-kpis-res"] });
        onClose();
      },
    });
  };

  // Local state for editable data
  const [editableData, setEditableData] = useState<KPIFormData | null>(null);

  useEffect(() => {
    if (kpiData) {
      setEditableData({
        dataPointName: kpiData.dataPointName,
        coreParameterId: kpiData.coreParameterId,
        frequencyType: kpiData.frequencyType,
        tag: kpiData.tag,
        unit: kpiData.unit,
        validationType: kpiData.validationType,
        value1: kpiData.value1,
        value2: kpiData.value2,
        visualFrequencyTypes: kpiData.visualFrequencyTypes,
        employeeId: kpiData.employeeId || "",
      });
    }
  }, [kpiData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // Helper for visualFrequencyTypes options
  const getFilteredVisualFrequencyOptions = () => {
    const selectedFrequency = editableData?.frequencyType;
    if (!selectedFrequency) return frequenceOptions;
    const frequencyIndex = frequenceOptions.findIndex(
      (opt) => opt.value === selectedFrequency,
    );
    if (frequencyIndex === -1) return frequenceOptions;
    return frequenceOptions.slice(frequencyIndex + 1);
  };

  // Handle input/select change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    if (!editableData) return;
    setEditableData({ ...editableData, [key]: value });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity" />
      )}
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div className="h-[calc(100vh-30px)] overflow-scroll">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">KPI Drawer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          {editableData && (
            <div className="p-4 space-y-4">
              <FormInputField
                label="KPI Name"
                value={editableData.dataPointName || ""}
                disabled
              />
              <FormSelect
                label="Core Parameter"
                value={editableData.coreParameterId || ""}
                onChange={(val) => handleChange("coreParameterId", val)}
                options={coreParameterOption}
              />
              <FormSelect
                label="Frequency"
                value={editableData.frequencyType || ""}
                onChange={(val) => handleChange("frequencyType", val)}
                options={frequenceOptions}
              />
              <FormInputField
                label="Tag"
                value={editableData.tag || ""}
                onChange={(e) => handleChange("tag", e.target.value)}
              />
              <FormInputField
                label="Unit"
                value={editableData.unit || ""}
                onChange={(e) => handleChange("unit", e.target.value)}
              />
              <FormSelect
                label="Validation Type"
                value={editableData.validationType || ""}
                onChange={(val) => handleChange("validationType", val)}
                options={validationOptions}
              />
              <FormInputField
                label="Value 1"
                value={editableData.value1 || ""}
                onChange={(e) => handleChange("value1", e.target.value)}
              />
              {editableData.validationType === "EQUAL_TO" && (
                <FormInputField
                  label="Value 2"
                  value={editableData.value2 || ""}
                  onChange={(e) => handleChange("value2", e.target.value)}
                />
              )}
              {editableData.frequencyType !== "YEARLY" && (
                <FormSelect
                  label="Visual Frequency Types"
                  value={editableData.visualFrequencyTypes || []}
                  onChange={(val) => handleChange("visualFrequencyTypes", val)}
                  options={getFilteredVisualFrequencyOptions()}
                  isMulti
                />
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => onSubmit(editableData)}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KpiDrawer;

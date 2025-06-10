import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormDatePicker } from "@/components/shared/Form/FormDatePicker/FormDatePicker";
import FormSelect from "@/components/shared/Form/FormSelect";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setKpiData } from "@/features/reducers/auth.reducer";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  dataPointEmpId: string;
  selectFrequency: string;
};

const frequencyOptions = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "HALFYEARLY",
  "YEARLY",
];

export default function SearchKpiModal({
  open,
  onClose,
  dataPointEmpId,
  selectFrequency,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFreq, setSelectedFreq] = useState<string>(selectFrequency);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const frequencyDropdownOptions = useMemo(() => {
    const startIndex = frequencyOptions.indexOf(selectFrequency);
    const options = frequencyOptions.slice(startIndex); // Include current
    return options.map((freq) => ({
      label: freq,
      value: freq,
    }));
  }, [selectFrequency]);

  useEffect(() => {
    setSelectedFreq(selectFrequency);
  }, [selectFrequency]);

  const handleSubmit = () => {
    if (startDate && endDate) {
      const data = {
        dataPointEmpId: dataPointEmpId,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        selectFrequency: selectedFreq,
      };
      dispatch(setKpiData(data));
      navigate(`/dashboard/kpi-visualize`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormSelect
            value={selectedFreq}
            onChange={(val) => {
              setSelectedFreq(Array.isArray(val) ? val[0] : val);
            }}
            options={frequencyDropdownOptions}
            placeholder="Select Frequency"
          />
          <FormDatePicker
            value={startDate}
            onSubmit={(date) => setStartDate(date ?? null)}
            placeholder="Start Date"
          />
          <FormDatePicker
            value={endDate}
            onSubmit={(date) => setEndDate(date ?? null)}
            placeholder="End Date"
          />
          <Button onClick={handleSubmit}>View KPI</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

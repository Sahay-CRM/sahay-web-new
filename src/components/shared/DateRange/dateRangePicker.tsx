import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  className?: string;
  onChange?: (range: DateRange | undefined) => void;
  onApply?: (range: DateRange | undefined) => void;
  onSaveApply?: (range: DateRange | undefined) => void;
  value?: { from: Date | undefined; to: Date | undefined };
  isClear?: boolean;
  handleClear?: () => void;
  defaultDate?: { startDate: Date | undefined; deadline: Date | undefined };
}

export default function DateRangePicker({
  className,
  onChange,
  onApply,
  value,
  onSaveApply,
  isClear,
  handleClear,
  defaultDate,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: defaultDate?.startDate,
    to: defaultDate?.deadline,
  });
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>({
    from: defaultDate?.startDate,
    to: defaultDate?.deadline,
  });
  const [isOpen, setIsOpen] = React.useState(false);

  // If parent gives controlled value, sync it
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTempDate(value);
    }
  }, [value]);

  // When popover opens, reset tempDate from defaultDate
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && defaultDate) {
      const revert: DateRange = {
        from: defaultDate.startDate,
        to: defaultDate.deadline,
      };
      setTempDate(revert);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    setTempDate(range);
    onChange?.(range);
  };

  const handleApply = () => {
    setDate(tempDate);
    onApply?.(tempDate);
    setIsOpen(false);
  };

  const handleSave = () => {
    setDate(tempDate);
    onSaveApply?.(tempDate);
    setIsOpen(false);
  };

  const onClear = () => {
    if (isClear && handleClear) {
      handleClear();
      setIsOpen(false);
    }
  };

  const onClose = () => {
    if (defaultDate) {
      const revert: DateRange = {
        from: defaultDate.startDate,
        to: defaultDate.deadline,
      };
      setTempDate(revert);
      setDate(revert);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2 bg-white", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-auto min-w-0 px-4 justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd-MM-yyyy")} -{" "}
                  {format(date.to, "dd-MM-yyyy")}
                </>
              ) : (
                format(date.from, "dd-MM-yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto z-50 bg-white mr-8 shadow-2xl p-3 rounded-2xl border mt-2"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-between gap-2 mt-3 pt-3 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex gap-4">
              {isClear && (
                <Button variant="outline" size="sm" onClick={onClear}>
                  Reset
                </Button>
              )}
              {onSaveApply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={!tempDate?.from}
                  className="border-primary"
                >
                  Save
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!tempDate?.from}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

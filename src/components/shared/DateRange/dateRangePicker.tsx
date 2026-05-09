import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

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
  value?: DateRange;
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

  // Sync controlled value
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTempDate(value);
    }
  }, [value]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && defaultDate) {
      setTempDate({ from: defaultDate.startDate, to: defaultDate.deadline });
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

  const hasRange = date?.from && date?.to;

  return (
    <div className={cn("inline-flex", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            id="date-range-trigger"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all",
              "hover:bg-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
              hasRange ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            {date?.from ? (
              date.to ? (
                <span className="font-semibold tracking-tight">
                  {format(date.from, "dd MMM yyyy")}
                  <span className="mx-1.5 font-normal text-muted-foreground">
                    →
                  </span>
                  {format(date.to, "dd MMM yyyy")}
                </span>
              ) : (
                <span className="font-semibold">
                  {format(date.from, "dd MMM yyyy")}
                </span>
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className={cn(
            "z-50 w-auto rounded-2xl border border-border bg-white p-0 shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-150",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <CalendarIcon className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Select Date Range
                </p>
                {tempDate?.from ? (
                  <p className="text-xs text-muted-foreground">
                    {format(tempDate.from, "dd MMM yyyy")}
                    {tempDate.to && (
                      <> → {format(tempDate.to, "dd MMM yyyy")}</>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No dates selected
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={tempDate?.from}
              selected={tempDate}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 rounded-b-2xl">
            <div className="flex gap-2">
              {isClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 rounded-lg text-xs"
              >
                Cancel
              </Button>
              {onSaveApply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={!tempDate?.from}
                  className="h-8 rounded-lg border-primary text-primary hover:bg-primary hover:text-white text-xs"
                >
                  Save
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!tempDate?.from}
                className="h-8 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs px-4"
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

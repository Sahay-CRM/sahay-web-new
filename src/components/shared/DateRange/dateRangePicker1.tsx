import * as React from "react";
import { format, addMonths, setMonth, setYear } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATERANGE_FILTER_START_YEAR =
  Number(import.meta.env.VITE_DATERANGE_FILTER_START_YEAR) || undefined;

function getYearOptions(centerYear: number, forwardSpan = 15) {
  const startYear = DATERANGE_FILTER_START_YEAR ?? centerYear - forwardSpan;
  const endYear = centerYear + forwardSpan;
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

interface MonthYearSelectProps {
  month: Date;
  onMonthChange: (month: Date) => void;
}

function YearGridSelect({
  year,
  onYearChange,
}: {
  year: number;
  onYearChange: (year: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const yearOptions = React.useMemo(
    () => getYearOptions(new Date().getFullYear()),
    [],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 justify-between gap-1 text-sm font-normal"
        >
          {year}
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="grid max-h-56 grid-cols-4 gap-1 overflow-y-auto ">
          {yearOptions.map((y) => (
            <Button
              key={y}
              type="button"
              size="sm"
              variant={y === year ? "default" : "ghost"}
              className={cn(
                "h-8 px-1 text-sm font-normal hover:bg-gray-200",
                y === year && "bg-primary text-primary-foreground",
              )}
              onClick={() => {
                onYearChange(y);
                setIsOpen(false);
              }}
            >
              {y}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthYearSelect({ month, onMonthChange }: MonthYearSelectProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Select
        value={String(month.getMonth())}
        onValueChange={(val) => {
          onMonthChange(setMonth(month, Number(val)));
        }}
      >
        <SelectTrigger size="sm" className="h-8 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, idx) => (
            <SelectItem
              key={name}
              value={String(idx)}
              className="hover:bg-gray-200"
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <YearGridSelect
        year={month.getFullYear()}
        onYearChange={(y) => onMonthChange(setYear(month, y))}
      />
    </div>
  );
}

interface MonthYearCalendarProps {
  month: Date;
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  onMonthChange: (month: Date) => void;
}

function MonthYearCalendar({
  month,
  selected,
  onSelect,
  onMonthChange,
}: MonthYearCalendarProps) {
  return (
    <Calendar
      mode="range"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={1}
      hideNavigation
    />
  );
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
  const isMobile = useIsMobile();

  const [startMonth, setStartMonth] = React.useState<Date>(
    defaultDate?.startDate || new Date(),
  );
  const [endMonth, setEndMonth] = React.useState<Date>(
    addMonths(defaultDate?.startDate || new Date(), 1),
  );
  // Tracks whether the end month was manually chosen by the user, so an
  // auto-follow of the start month doesn't clobber their choice.
  const endMonthManuallySet = React.useRef(false);

  // If parent gives controlled value, sync it
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTempDate(value);
    }
  }, [value]);

  const resetMonthsFrom = (range: DateRange | undefined) => {
    const from = range?.from || new Date();
    setStartMonth(from);
    setEndMonth(addMonths(from, 1));
    endMonthManuallySet.current = false;
  };

  // When popover opens, reset tempDate from defaultDate
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && defaultDate) {
      const revert: DateRange = {
        from: defaultDate.startDate,
        to: defaultDate.deadline,
      };
      setTempDate(revert);
      resetMonthsFrom(revert);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    setTempDate(range);
    onChange?.(range);

    // Auto-follow: once a start date is picked and no end date exists yet,
    // point the end calendar at the next month — unless the user has
    // already changed the end month manually.
    if (range?.from && !range?.to && !endMonthManuallySet.current) {
      setStartMonth(range.from);
      setEndMonth(addMonths(range.from, 1));
    }

    if (range?.from && range?.to) {
      endMonthManuallySet.current = false;
    }
  };

  const handleStartMonthChange = (month: Date) => {
    setStartMonth(month);
  };

  const handleEndMonthChange = (month: Date) => {
    endMonthManuallySet.current = true;
    setEndMonth(month);
  };

  const handlePrev = () => {
    setStartMonth((prev) => addMonths(prev, -1));
    setEndMonth((prev) => addMonths(prev, -1));
  };

  const handleNext = () => {
    setStartMonth((prev) => addMonths(prev, 1));
    setEndMonth((prev) => addMonths(prev, 1));
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
      resetMonthsFrom(revert);
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
              "w-full min-w-0 px-4 justify-start text-left font-normal",
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
          className="w-auto p-0 border-none shadow-none bg-transparent"
          align={isMobile ? "center" : "end"}
          sideOffset={8}
          collisionPadding={16}
        >
          <div className="bg-white rounded-2xl border shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 bg-transparent p-0 opacity-70 hover:opacity-100"
                onClick={handlePrev}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex flex-1 items-center justify-center gap-4">
                <MonthYearSelect
                  month={startMonth}
                  onMonthChange={handleStartMonthChange}
                />
                {!isMobile && (
                  <MonthYearSelect
                    month={endMonth}
                    onMonthChange={handleEndMonthChange}
                  />
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 bg-transparent p-0 opacity-70 hover:opacity-100"
                onClick={handleNext}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <MonthYearCalendar
                month={startMonth}
                onMonthChange={handleStartMonthChange}
                selected={tempDate}
                onSelect={handleSelect}
              />
              {!isMobile && (
                <MonthYearCalendar
                  month={endMonth}
                  onMonthChange={handleEndMonthChange}
                  selected={tempDate}
                  onSelect={handleSelect}
                />
              )}
            </div>
            <div className="flex justify-between gap-2 mt-3 pt-3 border-t">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>
              <div className="flex gap-2">
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
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Save
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!tempDate?.from}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

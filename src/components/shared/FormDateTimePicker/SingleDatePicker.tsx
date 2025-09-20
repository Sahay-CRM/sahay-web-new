import * as React from "react";
import { Calendar, ChevronDown } from "lucide-react";

const months = [
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

const generateYears = (from: number, to: number): number[] => {
  const years: number[] = [];
  for (let year = from; year <= to; year++) {
    years.push(year);
  }
  return years;
};

// Helper functions to replace date-fns
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "";
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const isToday = (date: Date | null | undefined): boolean => {
  if (!date) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

interface SelectOption {
  value: number;
  label: string;
}

// Custom Select Component
interface CustomSelectProps {
  value: number;
  onValueChange: (value: number) => void;
  options: SelectOption[];
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors ${
                  value === option.value
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-900"
                }`}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
}

// Custom Calendar Component
interface CustomCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selected,
  onSelect,
  currentMonth,
  onMonthChange,
}) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const days: CalendarDay[] = [];

  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // Current month days
  for (let date = 1; date <= daysInMonth; date++) {
    days.push({
      date,
      isCurrentMonth: true,
      isPrevMonth: false,
    });
  }

  // Next month days to fill the grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextMonthDate = 1;
  for (let i = days.length; i < totalCells; i++) {
    days.push({
      date: nextMonthDate++,
      isCurrentMonth: false,
      isPrevMonth: false,
    });
  }

  const handleDateClick = (day: CalendarDay): void => {
    if (!day.isCurrentMonth) return;

    const newDate = new Date(year, month, day.date);
    onSelect(newDate);
  };

  const isSelected = (day: CalendarDay): boolean => {
    if (!selected || !day.isCurrentMonth) return false;
    const dayDate = new Date(year, month, day.date);
    return dayDate.toDateString() === selected.toDateString();
  };

  const isTodayDate = (day: CalendarDay): boolean => {
    if (!day.isCurrentMonth) return false;
    const dayDate = new Date(year, month, day.date);
    return dayDate.toDateString() === today.toDateString();
  };

  const monthOptions: SelectOption[] = months.map((monthName, index) => ({
    value: index,
    label: monthName,
  }));

  const yearOptions: SelectOption[] = generateYears(2000, 2035).map((year) => ({
    value: year,
    label: year.toString(),
  }));

  return (
    <div className="w-80">
      {/* Header with custom selects */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <CustomSelect
            value={month}
            onValueChange={(newMonth: number) =>
              onMonthChange(new Date(year, newMonth, 1))
            }
            options={monthOptions}
            placeholder="Month"
          />
        </div>
        <div className="flex-1">
          <CustomSelect
            value={year}
            onValueChange={(newYear: number) =>
              onMonthChange(new Date(newYear, month, 1))
            }
            options={yearOptions}
            placeholder="Year"
          />
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
              !day.isCurrentMonth
                ? "text-gray-300 cursor-not-allowed"
                : isSelected(day)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : isTodayDate(day)
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleDateClick(day)}
            disabled={!day.isCurrentMonth}
          >
            {day.date}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Date Picker Component
interface SingleDatePickerProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  isClear?: boolean;
  handleClear?: () => void;
  defaultDate?: Date;
}

const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  className,
  value,
  onChange,
  // isClear = true,
  // handleClear,
  defaultDate,
}) => {
  const [date, setDate] = React.useState<Date | undefined>(
    value ?? defaultDate,
  );
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    date ?? new Date(),
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (selected: Date): void => {
    setDate(selected);
    onChange?.(selected);
    setIsOpen(false);
  };

  // const onClear = (): void => {
  //   setDate(undefined);
  //   onChange?.(undefined);
  //   handleClear?.();
  //   setIsOpen(false);
  // };

  return (
    <div className={`relative ${className || ""}`}>
      <button
        type="button"
        className="flex items-center justify-start w-auto min-w-0 px-4 py-2 text-left font-normal bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
        {date ? (
          isToday(date) ? (
            <span className="text-gray-900 text-sm">Today</span>
          ) : (
            <span className="text-gray-900 text-sm">{formatDate(date)}</span>
          )
        ) : (
          <span className="text-gray-500 text-sm">Pick a date</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 p-4">
            <CustomCalendar
              selected={date}
              onSelect={handleSelect}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />

            {/* <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-gray-200">
              {isClear && (
                <button
                  type="button"
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  onClick={onClear}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div> */}
          </div>
        </>
      )}
    </div>
  );
};

export default SingleDatePicker;

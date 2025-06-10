import React from "react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  getDay,
  lastDayOfMonth,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selected,
  onSelect,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selected || new Date(),
  );

  const goToPrevious = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNext = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const generateWeeks = () => {
    const weeks: { label: string; start: Date; end: Date }[] = [];
    const firstDay = startOfMonth(currentMonth);
    const lastDay = lastDayOfMonth(currentMonth);

    // Week 1
    const firstDayWeekday = getDay(firstDay); // 0=Sun, 6=Sat
    const daysUntilSaturday = (6 - firstDayWeekday + 7) % 7;
    const week1End = addDays(firstDay, daysUntilSaturday);

    weeks.push({
      label: "Week 1",
      start: firstDay,
      end: week1End,
    });

    // Following full Sunday–Saturday weeks
    let weekStart = addDays(week1End, 1); // Sunday after Week 1
    let count = 2;
    while (weekStart <= lastDay) {
      const weekEnd = addDays(weekStart, 6);
      const boundedEnd = weekEnd > lastDay ? lastDay : weekEnd;

      weeks.push({
        label: `Week ${count}`,
        start: weekStart,
        end: boundedEnd,
      });

      if (weekEnd >= lastDay) break;
      weekStart = addDays(weekStart, 7);
      count++;
    }

    return weeks;
  };

  const weeks = generateWeeks();

  return (
    <div className="p-3 w-full max-w-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-2 gap-x-4 text-xs font-semibold text-muted-foreground mb-2">
        <div className="text-left pl-2">Week</div>
        <div className="text-right pr-2">Date Range</div>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {weeks.map((week) => {
          const isSelected =
            selected &&
            isWithinInterval(selected, { start: week.start, end: week.end });

          return (
            <Button
              key={week.start.toISOString()}
              variant={isSelected ? "default" : "ghost"}
              className="grid grid-cols-2 w-full justify-between items-center text-left px-2 py-2"
              onClick={() => onSelect(week.start)}
            >
              <span className="text-sm font-medium">{week.label}</span>
              <span
                className={`text-xs text-right text-muted-foreground ${
                  isSelected ? "text-white" : ""
                }`}
              >
                {format(week.start, "MMM dd")} - {format(week.end, "MMM dd")}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

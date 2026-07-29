import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { format, addDays, isToday } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  ArrowRightCircle,
  X,
  ListChecks,
  Presentation,
  CalendarDays,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getUserId } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useUpdateDailyPlanItem from "@/features/api/dailyPlan/useUpdateDailyPlanItem";
import useRemoveDailyPlanItem from "@/features/api/dailyPlan/useRemoveDailyPlanItem";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";

import StatusBadge from "./statusBadge";
import AddDailyPlanItemDialog from "./AddDailyPlanItemDialog";
import CompleteItemDialog from "./CompleteItemDialog";
import CarryForwardDialog from "./CarryForwardDialog";
import ItemHistorySheet from "./ItemHistorySheet";

export default function DailyPlanning() {
  const employeeId = useSelector(getUserId);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [completeItem, setCompleteItem] = useState<DailyPlanItem | null>(null);
  const [forwardItem, setForwardItem] = useState<DailyPlanItem | null>(null);
  const [historyItem, setHistoryItem] = useState<DailyPlanItem | null>(null);

  const { data, isLoading } = useGetDailyPlan(employeeId, selectedDate);
  const { mutate: updateItem } = useUpdateDailyPlanItem();
  const { mutate: removeItem } = useRemoveDailyPlanItem();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Daily Planning", href: "" }]);
  }, [setBreadcrumbs]);

  const items = useMemo(() => data?.data?.dailyPlanItems || [], [data]);

  const tasks = items.filter((i) => i.type === "TASK");
  const meetings = items.filter((i) => i.type === "MEETING");

  const completedCount = items.filter((i) => i.status === "COMPLETED").length;
  const totalCount = items.length;
  const completionPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const goToDate = (date: Date) => setSelectedDate(format(date, "yyyy-MM-dd"));
  const shiftDay = (delta: number) =>
    goToDate(addDays(new Date(selectedDate), delta));

  const handleStart = (item: DailyPlanItem) => {
    updateItem({
      planItemId: item.planItemId,
      startTime: new Date().toISOString(),
    });
  };

  const handleRemove = (item: DailyPlanItem) => {
    removeItem(item.planItemId);
  };

  const radius = 29;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="w-full h-full px-2 sm:px-4 py-6 flex flex-col gap-5 overflow-auto bg-theme-bg-base/20">
      {/* Header / Date Selector */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Date Switcher Box */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-1.5 shadow-xs dark:bg-white/5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => shiftDay(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              onClick={() => dateInputRef.current?.showPicker()}
              className="relative flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-slate-800 select-none">
                {format(new Date(selectedDate), "dd MMM yyyy")}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => shiftDay(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Today Button (rendered outside date switcher box) */}
          {!isToday(new Date(selectedDate)) && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => goToDate(new Date())}
            >
              Today
            </Button>
          )}
        </div>

        {isToday(new Date(selectedDate)) && (
          <Button
            size="default"
            className="gap-2 px-4 py-2 h-9 text-sm font-medium"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Item to Plan
          </Button>
        )}
      </div>

      {/* Progress Summary Card */}
      <Card className="overflow-hidden border border-border rounded-xl shadow-xs bg-white shrink-0">
        <CardContent className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="shrink-0"
            >
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/20"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-primary transition-all duration-500"
                transform="rotate(-90 32 32)"
              />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-foreground text-sm font-bold"
              >
                {completionPct}%
              </text>
            </svg>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Today's Progress
              </p>
              <p className="text-base font-bold text-slate-800">
                Completed: {completedCount} / {totalCount} items
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-4 gap-3 sm:w-auto">
            {(
              [
                ["PLANNED", "Planned", "bg-slate-50 border-slate-200 text-slate-700"],
                ["COMPLETED", "Completed", "bg-emerald-50 border-emerald-200 text-emerald-700"],
                ["FORWARDED", "Forwarded", "bg-blue-50 border-blue-200 text-blue-700"],
                ["CANCELLED", "Cancelled", "bg-red-50 border-red-200 text-red-700"],
              ] as [PlanningStatus, string, string][]
            ).map(([status, label, colorClasses]) => (
              <div
                key={status}
                className={`rounded-xl border ${colorClasses} px-4 py-2 text-center shadow-xs min-w-[90px] sm:min-w-[100px]`}
              >
                <p className="text-base font-bold">
                  {items.filter((i) => i.status === status).length}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-85 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Tabs */}
      <Tabs defaultValue="tasks" className="w-full flex-1 flex flex-col gap-4">
        <TabsList className="bg-muted p-1 rounded-xl w-fit shrink-0">
          <TabsTrigger
            value="tasks"
            className="gap-2 rounded-lg px-4 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-medium cursor-pointer"
          >
            <ListChecks className="h-4 w-4" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="gap-2 rounded-lg px-4 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-medium cursor-pointer"
          >
            <Presentation className="h-4 w-4" />
            Meetings ({meetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 mt-0">
          <ItemsTable
            items={tasks}
            isLoading={isLoading}
            emptyLabel="No tasks planned for this day."
            onOpenHistory={setHistoryItem}
            onStart={handleStart}
            onComplete={setCompleteItem}
            onForward={setForwardItem}
            onRemove={handleRemove}
          />
        </TabsContent>

        <TabsContent value="meetings" className="flex-1 mt-0">
          <ItemsTable
            items={meetings}
            isLoading={isLoading}
            emptyLabel="No meetings planned for this day."
            onOpenHistory={setHistoryItem}
            onStart={handleStart}
            onComplete={setCompleteItem}
            onForward={setForwardItem}
            onRemove={handleRemove}
          />
        </TabsContent>
      </Tabs>

      <AddDailyPlanItemDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        date={selectedDate}
        employeeId={employeeId}
      />

      <CompleteItemDialog
        open={Boolean(completeItem)}
        onOpenChange={(open) => !open && setCompleteItem(null)}
        item={completeItem}
      />

      <CarryForwardDialog
        open={Boolean(forwardItem)}
        onOpenChange={(open) => !open && setForwardItem(null)}
        item={forwardItem}
      />

      <ItemHistorySheet
        open={Boolean(historyItem)}
        onOpenChange={(open) => !open && setHistoryItem(null)}
        item={historyItem}
      />
    </div>
  );
}

interface ItemsTableProps {
  items: DailyPlanItem[];
  isLoading: boolean;
  emptyLabel: string;
  onOpenHistory: (item: DailyPlanItem) => void;
  onStart: (item: DailyPlanItem) => void;
  onComplete: (item: DailyPlanItem) => void;
  onForward: (item: DailyPlanItem) => void;
  onRemove: (item: DailyPlanItem) => void;
}

function ItemsTable({
  items,
  isLoading,
  emptyLabel,
  onStart,
  onComplete,
  onForward,
  onRemove,
}: ItemsTableProps) {
  const hasActions = useMemo(
    () => items.some((item) => item.status === "PLANNED"),
    [items],
  );

  return (
    <Card className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
      <CardContent className="p-0">
        {isLoading && (
          <p className="p-6 text-sm text-muted-foreground">Loading plan...</p>
        )}

        {!isLoading && items.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">{emptyLabel}</p>
        )}

        {!isLoading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Est. Time</th>
                  <th className="px-4 py-3 font-semibold">Actual Time</th>
                  <th className="px-4 py-3 font-semibold">Remarks</th>
                  {hasActions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const isInProgress =
                    item.status === "PLANNED" && Boolean(item.startTime);

                  const forwardedFromDate = item.isForwarded
                    ? item.historyRecords?.find((h) => h.forwardedFromDate)
                        ?.forwardedFromDate
                    : null;

                  return (
                    <tr
                      key={item.planItemId}
                      className={item.isPlanned === false
                        ? "bg-amber-50/40 hover:bg-amber-100/50 transition-colors"
                        : "hover:bg-muted/5 transition-colors"}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2 min-w-0 w-full">
                          <span className="truncate" title={item.task?.taskName || item.meeting?.meetingName || "Untitled"}>
                            {item.task?.taskName ||
                              item.meeting?.meetingName ||
                              "Untitled"}
                          </span>
                          {item.isPlanned === false && (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20 shadow-2xs select-none shrink-0">
                              {item.task ? "Extra Task" : "Extra Meeting"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status}
                          startTime={item.startTime}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {formatMinutesToHours(item.estimatedTime)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {formatMinutesToHours(item.actualTime)}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-muted-foreground">
                        {item.remarks ||
                          (forwardedFromDate
                            ? `Forwarded from ${format(new Date(forwardedFromDate), "dd-MM-yyyy")}`
                            : "-")}
                      </td>
                      {hasActions && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "PLANNED" && !isInProgress && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 gap-1 rounded-md text-xs"
                                onClick={() => onStart(item)}
                              >
                                <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600/20" />
                                Start
                              </Button>
                            )}

                            {item.status === "PLANNED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 gap-1 rounded-md text-xs"
                                onClick={() => onComplete(item)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                Complete
                              </Button>
                            )}

                            {item.status === "PLANNED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 gap-1 rounded-md text-xs"
                                onClick={() => onForward(item)}
                              >
                                <ArrowRightCircle className="h-3.5 w-3.5 text-amber-600" />
                                Forward
                              </Button>
                            )}

                            {item.status === "PLANNED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 gap-1 rounded-md text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onRemove(item)}
                              >
                                <X className="h-3.5 w-3.5" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getUserId } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useUpdateDailyPlanItem from "@/features/api/dailyPlan/useUpdateDailyPlanItem";
import useRemoveDailyPlanItem from "@/features/api/dailyPlan/useRemoveDailyPlanItem";

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

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [completeItem, setCompleteItem] = useState<DailyPlanItem | null>(null);
  const [forwardItem, setForwardItem] = useState<DailyPlanItem | null>(null);
  const [historyItem, setHistoryItem] = useState<DailyPlanItem | null>(null);

  const { data, isLoading } = useGetDailyPlan(employeeId, selectedDate);
  const { mutate: updateItem } = useUpdateDailyPlanItem();
  const { mutate: removeItem } = useRemoveDailyPlanItem();

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

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-white/5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-sm"
            onClick={() => shiftDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold sm:text-base">
              {isToday(new Date(selectedDate)) ? "Today, " : ""}
              {format(new Date(selectedDate), "dd MMMM yyyy")}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-sm"
            onClick={() => shiftDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-1 w-[150px] rounded-sm"
          />

          {!isToday(new Date(selectedDate)) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm"
              onClick={() => goToDate(new Date())}
            >
              Today
            </Button>
          )}
        </div>

        {isToday(new Date(selectedDate)) && (
          <Button
            className="gap-2 rounded-sm"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Item to Plan
          </Button>
        )}
      </div>

      {/* Progress Summary */}
      <Card className="overflow-hidden py-0">
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5">
            <svg
              width="88"
              height="88"
              viewBox="0 0 88 88"
              className="shrink-0"
            >
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/40"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-primary transition-all duration-500"
                transform="rotate(-90 44 44)"
              />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-foreground text-lg font-bold"
              >
                {completionPct}%
              </text>
            </svg>

            <div>
              <p className="text-sm text-muted-foreground">
                Today&apos;s Progress
              </p>
              <p className="text-xl font-bold">
                Completed: {completedCount} / {totalCount} items
                {/* ({totalCount > 0 ? completionPct.toFixed(1) : "0.0"}%) */}
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
            {(
              [
                ["PLANNED", "Planned"],
                ["COMPLETED", "Completed"],
                ["FORWARDED", "Forwarded"],
                ["CANCELLED", "Cancelled"],
              ] as [PlanningStatus, string][]
            ).map(([status, label]) => (
              <div
                key={status}
                className="rounded-sm border bg-white/70 px-3 py-2 text-center shadow-sm dark:bg-white/5"
              >
                <p className="text-lg font-bold">
                  {items.filter((i) => i.status === status).length}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="rounded-sm">
          <TabsTrigger value="tasks" className="gap-2 rounded-lg">
            <ListChecks className="h-4 w-4" />
            Planned Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2 rounded-lg">
            <Presentation className="h-4 w-4" />
            Planned Meetings ({meetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
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

        <TabsContent value="meetings">
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
  onOpenHistory,
  onStart,
  onComplete,
  onForward,
  onRemove,
}: ItemsTableProps) {
  return (
    <Card className="mt-4 rounded-2xl border shadow-sm">
      <CardContent className="p-0">
        {isLoading && (
          <p className="p-6 text-sm text-muted-foreground">Loading plan...</p>
        )}

        {!isLoading && items.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">{emptyLabel}</p>
        )}

        {!isLoading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Est. (min)</th>
                  <th className="px-4 py-3 font-medium">Actual (min)</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <button
                          className="font-medium text-primary hover:underline"
                          onClick={() => onOpenHistory(item)}
                        >
                          {item.task?.taskName ||
                            item.meeting?.meetingName ||
                            "Untitled"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status}
                          startTime={item.startTime}
                        />
                      </td>
                      <td className="px-4 py-3">{item.estimatedTime}</td>
                      <td className="px-4 py-3">{item.actualTime ?? "-"}</td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-muted-foreground">
                        {item.remarks ||
                          (forwardedFromDate
                            ? `Forwarded from ${format(new Date(forwardedFromDate), "dd-MM-yyyy")}`
                            : "-")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "PLANNED" && !isInProgress && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 rounded-lg"
                              onClick={() => onStart(item)}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </Button>
                          )}

                          {item.status === "PLANNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 rounded-lg"
                              onClick={() => onComplete(item)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Complete
                            </Button>
                          )}

                          {item.status === "PLANNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 rounded-lg"
                              onClick={() => onForward(item)}
                            >
                              <ArrowRightCircle className="h-3.5 w-3.5" />
                              Forward
                            </Button>
                          )}

                          {item.status === "PLANNED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 rounded-lg text-destructive hover:text-destructive"
                              onClick={() => onRemove(item)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </td>
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

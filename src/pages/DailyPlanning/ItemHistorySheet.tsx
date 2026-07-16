import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { CalendarDays, ArrowRightCircle } from "lucide-react";
import useGetDailyPlanItemHistory from "@/features/api/dailyPlan/useGetDailyPlanItemHistory";
import StatusBadge from "./statusBadge";

interface ItemHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DailyPlanItem | null;
}

export default function ItemHistorySheet({
  open,
  onOpenChange,
  item,
}: ItemHistorySheetProps) {
  const { data, isLoading } = useGetDailyPlanItemHistory({
    taskId: item?.type === "TASK" ? item.taskId || undefined : undefined,
    meetingId: item?.type === "MEETING" ? item.meetingId || undefined : undefined,
  });

  const history = [...(data?.data || [])].sort(
    (a, b) =>
      new Date(a.createdDatetime).getTime() -
      new Date(b.createdDatetime).getTime(),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {item?.task?.taskName || item?.meeting?.meetingName || "Item History"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4 pb-6">
          <div className="flex items-center gap-2">
            {item && <StatusBadge status={item.status} startTime={item.startTime} />}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Estimated</span>
            <span className="font-medium">{item?.estimatedTime ?? 0} mins</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Actual</span>
            <span className="font-medium">
              {item?.actualTime ?? "-"} {item?.actualTime ? "mins" : ""}
            </span>
          </div>

          {item?.remarks && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <p className="text-muted-foreground">Remarks</p>
              <p className="mt-1 text-foreground/90">{item.remarks}</p>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Planning Timeline
            </p>

            {isLoading && (
              <p className="text-sm text-muted-foreground">Loading history...</p>
            )}

            {!isLoading && history.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No history recorded yet.
              </p>
            )}

            {!isLoading && history.length > 0 && (
              <ol className="relative ml-3 border-l border-border">
                {history.map((entry) => {
                  const isForward = Boolean(
                    entry.forwardedFromDate && entry.forwardedToDate,
                  );
                  const Icon = isForward ? ArrowRightCircle : CalendarDays;

                  return (
                    <li key={entry.historyId} className="mb-6 ml-5 last:mb-0">
                      <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-background ring-4 ring-background">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {isForward ? "Carried Forward" : "Planned"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.createdDatetime
                              ? format(
                                  new Date(entry.createdDatetime),
                                  "dd MMM yyyy, hh:mm a",
                                )
                              : ""}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Planned for{" "}
                          {format(new Date(entry.planningDate), "dd MMM yyyy")}
                        </p>

                        {isForward && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.forwardedFromDate!), "dd MMM")}
                            {" → "}
                            {format(new Date(entry.forwardedToDate!), "dd MMM")}
                          </p>
                        )}

                        {entry.createdByName && (
                          <p className="text-xs text-muted-foreground">
                            by {entry.createdByName}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

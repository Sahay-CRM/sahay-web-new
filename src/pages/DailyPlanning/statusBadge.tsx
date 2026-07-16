const STATUS_STYLES: Record<PlanningStatus, string> = {
  PLANNED: "bg-slate-100 text-slate-700 border-slate-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  FORWARDED: "bg-white text-black border-primary",
};

const STATUS_LABELS: Record<PlanningStatus, string> = {
  PLANNED: "Planned",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FORWARDED: "Forwarded",
};

interface StatusBadgeProps {
  status: PlanningStatus;
  startTime?: string | null;
}

export default function StatusBadge({ status, startTime }: StatusBadgeProps) {
  const isInProgress = status === "PLANNED" && Boolean(startTime);

  return (
    <span
      className={`inline-flex items-center rounded-full leading-4 pt-1 border px-2.5 py-0.5 text-xs font-regular ${
        isInProgress
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : STATUS_STYLES[status]
      }`}
    >
      {isInProgress ? "In Progress" : STATUS_LABELS[status]}
    </span>
  );
}

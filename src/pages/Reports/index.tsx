import { useEffect, useState } from "react";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useGetReports from "@/features/api/Reports/useGetReports";
// import useGetMonthlyReports from "@/features/api/Reports/useGetMonthlyReports";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isColorDark } from "@/features/utils/color.utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import mockDashboardData from "./datajson";

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[14px] font-bold text-slate-400 mb-4">{title}</h3>
);

const BusinessFunctionTable = ({
  data,
  type,
  initiallyShow = 6,
}: {
  data: (TaskInsight | ProjectInsight)[];
  type: "task" | "project";
  initiallyShow?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayData = isExpanded ? data : data.slice(0, initiallyShow);

  return (
    <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        {/* HEADER */}
        <thead>
          <tr className="bg-gray-200 text-[12px] text-black">
            <th className="px-4 py-2 font-medium">Business Functions</th>
            <th className="px-2 py-2 text-center font-medium">Total</th>
            <th className="px-2 py-2 text-center font-medium">
              {type === "task" ? "Filling" : "Active"}
            </th>
            {type === "project" && (
              <th className="px-2 py-2 text-center font-medium">Delayed</th>
            )}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-slate-100">
          {displayData.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/40">
              <td className="px-4 py-2 text-[13px] font-medium text-slate-800">
                {item.businessFunction}
              </td>

              <td className="px-2 py-2 text-[13px] font-semibold text-center text-slate-900">
                {item.total}
              </td>

              <td className="px-2 py-2 text-[13px] font-semibold text-center text-slate-900">
                {"filling" in item
                  ? item.filling
                  : (item as ProjectInsight).active}
              </td>

              {type === "project" && (
                <td className="px-2 py-2 text-[13px] font-semibold text-center text-slate-900">
                  {"delayed" in item ? item.delayed : "-"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* BUTTON */}
      {data.length > initiallyShow && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-[11px] font-medium text-slate-500 hover:bg-slate-50 border-t border-slate-100"
        >
          {isExpanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

interface ListItem {
  name: string;
  duration: string;
  dueDate?: string;
  assignee?: string;
  assignees?: { name: string }[];
  status?: string;
  color?: string;
}

const KPICard = ({
  title,
  value,
  subtext,
  children,
}: {
  title: string;
  value: string | number;
  subtext?: string;
  children?: React.ReactNode;
}) => (
  <div className="bg-white border border-slate-200 rounded-[12px] px-4 py-3 min-w-[140px] flex flex-col justify-between h-full">
    <div>
      <p className="text-[11px] text-slate-500 mb-1 font-medium">{title}</p>
      <p className="text-[30px] font-bold text-slate-900 leading-none">
        {value}
      </p>
    </div>
    {subtext && !children && (
      <p className="text-[10px] text-slate-400 mt-[2px]">{subtext}</p>
    )}
    {children}
  </div>
);

const LongTermList = ({ items }: { items: ListItem[] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[12px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-200">
        <p className="text-[12px] font-medium text-slate-500">
          Long Term Tasks
        </p>
      </div>

      {/* Rows */}
      <div>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 items-center px-4 py-2 text-[12px]"
          >
            {/* Name */}
            <div className="col-span-3 font-medium text-slate-800 truncate">
              {item.name}
            </div>

            {/* Duration */}
            <div className="col-span-2 text-slate-500 pl-2">
              {item.duration}
            </div>

            {/* Date */}
            <div className="col-span-3 text-slate-500">{item.dueDate}</div>

            {/* Assignees */}
            <div className="col-span-2 flex -space-x-1.5 overflow-hidden">
              {item.assignees && item.assignees.length > 0 ? (
                <>
                  {item.assignees.slice(0, 3).map((a, i) => {
                    const initials =
                      a.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?";

                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E5F7A3] border border-white text-[10px] font-bold text-slate-700 shrink-0 cursor-default">
                            {initials}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-[11px]">{a.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {item.assignees.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-white text-[10px] font-bold text-slate-500 shrink-0 cursor-default">
                          +{item.assignees.length - 3}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1">
                          {item.assignees.slice(3).map((a, i) => (
                            <p key={i} className="text-[11px]">
                              {a.name}
                            </p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-[11px]">—</div>
              )}
            </div>

            {/* Status */}
            <div className="col-span-2 flex justify-end">
              <span
                style={{
                  backgroundColor: item.color || "#D9DE6B",
                  color: isColorDark(item.color || "#D9DE6B")
                    ? "#FFFFFF"
                    : "#0f172a",
                }}
                className="px-2 py-[2px] rounded-md text-[12px] font-normal"
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AgendaList = ({ title, items }: { title: string; items: ListItem[] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[12px] overflow-hidden">
      {/* Header */}
      <div className="px-4 bg-gray-200 py-2 border-b border-slate-200">
        <p className="text-[12px] text-black font-medium">{title}</p>
      </div>

      {/* List */}
      <div>
        {items.map((item, idx) => {
          const hasDate = !!item.dueDate;

          return (
            <div
              key={idx}
              className={`grid items-center px-4 py-2 text-[12px] ${
                hasDate ? "grid-cols-12" : "grid-cols-9"
              }`}
            >
              {/* Name */}
              <div
                className={`text-slate-800 font-medium truncate ${
                  hasDate ? "col-span-6" : "col-span-6"
                }`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default">{item.name}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-[11px]">{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Duration */}
              <div
                className={`text-slate-500 pl-4 ${
                  hasDate ? "col-span-3 text-left" : "col-span-3 text-right"
                }`}
              >
                {item.duration}
              </div>

              {/* Date */}
              {hasDate && (
                <div className="col-span-3 text-slate-500 text-right">
                  {item.dueDate}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default function ReportsPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { data: reportsData, isLoading } = useGetReports();
  // const [selectedMonth, setSelectedMonth] = useState("April 2026");
  // const { data: monthlyData } = useGetMonthlyReports(selectedMonth);

  useEffect(() => {
    setBreadcrumbs([{ label: "Performance Insights", href: "" }]);
  }, [setBreadcrumbs]);

  // const months = [
  //   { value: "January 2026", label: "January 2026" },
  //   { value: "February 2026", label: "February 2026" },
  //   { value: "March 2026", label: "March 2026" },
  //   { value: "April 2026", label: "April 2026" },
  //   { value: "May 2026", label: "May 2026" },
  // ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-50 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-[14px] text-slate-400 font-bold tracking-widest uppercase">
          Analyzing Data...
        </p>
      </div>
    );
  }

  // Use both real data and mock data for missing parts
  // const data = mockDashboardData;
  const realData = reportsData;

  return (
    <TooltipProvider>
      <div className="bg-[#F3F4F6] min-h-screen p-6">
        <div className="grid grid-cols-1 bor lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            <section>
              <SectionTitle title="Task Insights" />
              <div className="flex gap-2 mb-6">
                <KPICard
                  title="Not Updated"
                  value={realData?.tasks?.notUpdatedTasks ?? "0"}
                  subtext="in last 30 days"
                />
                <KPICard
                  title="Total"
                  value={realData?.tasks?.totalTasks ?? "0"}
                  subtext="in last 30 days"
                />
                <KPICard
                  title="Delayed"
                  value={realData?.tasks?.delayedTasks ?? "0"}
                  subtext="till date"
                />
              </div>
              <LongTermList
                items={
                  realData?.tasks?.longDurationTop5?.map((t) => ({
                    name: t.taskName,
                    duration: t.durationDays,
                    dueDate: new Date(t.taskDeadline)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", ""),
                    assignees: t.assignees,
                    status: t.status || "In Progress",
                    color: t.color,
                  })) ?? []
                }
              />
            </section>

            <div className="grid grid-cols-[4fr_6fr] gap-6">
              <section>
                <SectionTitle title="KPI Insights" />
                <BusinessFunctionTable
                  type="task"
                  data={
                    realData?.kpi?.kpiStatsPerCoreParameter?.map((k) => ({
                      businessFunction: k.name,
                      total: k.totalKpi,
                      filling: k.fillingRate,
                    })) ?? []
                  }
                />
              </section>
              <section>
                <SectionTitle title="Live Meeting Insights" />
                <div className="grid grid-cols-3 gap-3">
                  <KPICard
                    title="Total"
                    value={realData?.meetings?.totalDetailed ?? "0"}
                    subtext="live meetings"
                  />
                  <KPICard
                    title="Total Sahay"
                    value={realData?.meetings?.sahayDetailed ?? "0"}
                    subtext="live meeting"
                  />
                  <KPICard
                    title="Missed"
                    value={realData?.meetings?.missedDetailed ?? "0"}
                    subtext="live meeting"
                  />
                  <KPICard
                    title="Notes"
                    value={realData?.meetingNotes?.notesPerMinute ?? "0"}
                    subtext="per minute"
                  />
                  <KPICard
                    title="Notes/Meeting"
                    value={realData?.meetingNotes?.notesPerMeeting ?? "0"}
                    subtext="per meeting"
                  />
                  <KPICard
                    title="Note Tags"
                    value={
                      realData?.meetingNotes?.noteTagDistribution?.[0]?.count ??
                      "0"
                    }
                    subtext="tags total"
                  />
                </div>
              </section>
            </div>

            <section>
              <SectionTitle title="Meeting Insights" />
              <div className="grid grid-cols-5 gap-3 mb-6">
                {(realData?.meetings?.meetingStatsPerType || []).map(
                  (m, idx) => (
                    <KPICard
                      key={idx}
                      title={m.typeName}
                      value={m.totalMeetings}
                      subtext="total"
                    />
                  ),
                )}
              </div>
              <div className="w-[140px]">
                <KPICard
                  title="Creation Rate"
                  value={realData?.meetings?.creationRate ?? "0"}
                  subtext={`${new Date()
                    .toLocaleString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })
                    .replace(",", "")}`}
                >
                  {/* <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-6 text-[10px] border-none p-0 focus:ring-0 text-slate-400 font-medium font-bold">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="text-[11px]">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}
                </KPICard>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <section>
              <SectionTitle title="Project Insights" />
              <div className="grid grid-cols-[6fr_4fr] gap-6 mb-6">
                <BusinessFunctionTable
                  type="project"
                  data={
                    realData?.projects?.projectStatsPerCoreParameter?.map(
                      (p) => ({
                        businessFunction: p.name,
                        total: p.total,
                        active: p.active,
                        delayed: p.delayed,
                      }),
                    ) ?? []
                  }
                />
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-black mb-4">
                    Zero Projects Business Function
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(realData?.projects?.otherCoreParameters || []).map(
                      (item, idx) => (
                        <p
                          key={idx}
                          className="text-[12px] font-medium text-slate-500"
                        >
                          {item}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <KPICard
                  title="Zero Task"
                  value={realData?.projects?.zeroTaskProjects ?? "0"}
                  subtext="projects"
                />
                <KPICard
                  title="Delayed"
                  value={realData?.projects?.delayedProjects ?? "0"}
                  subtext="till date"
                />
                <KPICard
                  title="Creation Rate"
                  value={realData?.projects?.creationRate ?? "0"}
                  subtext="till date"
                />
              </div>

              <div className="grid grid-cols-[6fr_4fr] gap-4">
                <AgendaList
                  title="Long Term Projects"
                  items={
                    realData?.projects?.longDurationTop5?.map((p) => ({
                      name: p.projectName,
                      duration: p.durationDays,
                      dueDate: new Date(p.projectDeadline).toLocaleDateString(),
                    })) ?? []
                  }
                />
                <AgendaList
                  title="Most Delayed Projects"
                  items={
                    realData?.projects?.delayTop5?.map((p) => ({
                      name: p.projectName,
                      duration: p.delayDays,
                    })) ?? []
                  }
                />
              </div>
            </section>

            <section>
              <SectionTitle title="Agenda" />
              <div className="grid grid-cols-[6fr_4fr] gap-6">
                <AgendaList
                  title="Most Unresolved Agenda"
                  items={
                    realData?.agenda?.longestTop5?.map((a) => ({
                      name: a.name,
                      duration: `${a.daysUnresolved} days`,
                    })) ?? []
                  }
                />
                <div className="grid grid-cols-2  gap-3">
                  <KPICard
                    title="Unresolved"
                    value={realData?.agenda?.unresolved ?? "0"}
                    subtext="total"
                  />
                  <KPICard
                    title="Resolved"
                    value={realData?.agenda?.resolved ?? "0"}
                    subtext="total"
                  />
                  <KPICard
                    title="Parked"
                    value={realData?.agenda?.parked ?? "0"}
                    subtext="total"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

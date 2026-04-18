import { useEffect, useState } from "react";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
// import useGetReports from "@/features/api/Reports/useGetReports";
import { TooltipProvider } from "@/components/ui/tooltip";
import mockDashboardData from "./datajson";

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
  status?: string;
}
const KPICard = ({
  title,
  value,
  subtext,
}: {
  title: string;
  value: string | number;
  subtext?: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-[12px] px-4 py-3 w-[140px]">
    <p className="text-[11px] text-slate-500 mb-1 font-medium">{title}</p>

    <p className="text-[30px] font-bold text-slate-900 leading-none">{value}</p>

    {subtext && (
      <p className="text-[10px] text-slate-400 mt-[2px]">{subtext}</p>
    )}
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
            <div className="col-span-4 font-medium text-slate-800 truncate">
              {item.name}
            </div>

            {/* Duration */}
            <div className="col-span-1 text-slate-500">{item.duration}</div>

            {/* Date */}
            <div className="col-span-3 text-slate-500">{item.dueDate}</div>

            {/* Assignee */}
            <div className="col-span-2 text-slate-500 ">{item.assignee}</div>

            {/* Status */}
            <div className="col-span-2 flex justify-end">
              <span className="bg-[#D9DE6B] text-slate-900 px-2 py-[2px] rounded-md text-[10px] font-medium">
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
                  hasDate ? "col-span-7" : "col-span-7"
                }`}
              >
                {item.name}
              </div>

              {/* Duration */}
              <div
                className={`text-slate-500 ${
                  hasDate ? "col-span-2" : "col-span-2"
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
  // const { data: reportsData, isLoading } = useGetReports();

  useEffect(() => {
    setBreadcrumbs([{ label: "Performance Insights", href: "" }]);
  }, [setBreadcrumbs]);

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-[#F8FAFC]">
  //       <div className="relative">
  //         <div className="w-16 h-16 border-4 border-indigo-50 rounded-full" />
  //         <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
  //       </div>
  //       <p className="text-[14px] text-slate-400 font-bold tracking-widest uppercase">Analyzing Data...</p>
  //     </div>
  //   );
  // }

  // Use both real data and mock data for missing parts
  const data = mockDashboardData;
  // const realData = reportsData;

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
                  value="50"
                  subtext="in last 30 days"
                />
                <KPICard title="Total" value="50" subtext="in last 30 days" />
                <KPICard title="Delayed" value="50" subtext="till date" />
              </div>
              <LongTermList items={data.longTermTasks} />
            </section>

            <div className="grid grid-cols-[4fr_6fr] gap-6">
              <section>
                <SectionTitle title="KPI Insights" />
                <BusinessFunctionTable
                  data={data.taskInsights.kpis}
                  type="task"
                />
              </section>
              <section>
                <SectionTitle title="Live Meeting Insights" />
                <div className="grid grid-cols-3 gap-3">
                  <KPICard title="Total" value="50" subtext="live meetings" />
                  <KPICard
                    title="Total Sahay"
                    value="50"
                    subtext="live meeting"
                  />
                  <KPICard title="Missed" value="50" subtext="live meeting" />
                  <KPICard title="Notes" value="50" subtext="per minute" />
                  <KPICard
                    title="Other Notes"
                    value="50"
                    subtext="per meeting"
                  />
                  <KPICard title="Note Tags" value="50" subtext="per meeting" />
                </div>
              </section>
            </div>

            <section>
              <SectionTitle title="Meeting Insights" />
              <div className="grid grid-cols-5 gap-3">
                <KPICard title="Backend Work" value="50" subtext="total" />
                <KPICard title="Chat" value="50" subtext="total" />
                <KPICard title="Online" value="50" subtext="total" />
                <KPICard title="Onsite" value="50" subtext="total" />
                <KPICard title="Voice Call" value="50" subtext="total" />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <section>
              <SectionTitle title="Project Insights" />
              <div className="grid grid-cols-[6fr_4fr] gap-6 mb-6">
                <BusinessFunctionTable
                  data={data.projectInsights.businessFunctions}
                  type="project"
                />
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[12px] font-bold text-slate-400 mb-4">
                    Zero Projects Business Function
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Human Resource",
                      "Finance",
                      "Unknowns",
                      "Human Resource",
                      "Finance",
                      "Unknowns",
                    ].map((item, idx) => (
                      <p
                        key={idx}
                        className="text-[12px] font-bold text-slate-500"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <KPICard title="Zero Task" value="50" subtext="projects" />
                <KPICard title="Delayed" value="50" subtext="till date" />
                <KPICard title="Creation Rate" value="50" subtext="till date" />
              </div>

              <div className="grid grid-cols-[6fr_4fr] gap-4">
                <AgendaList
                  title="Long Term Projects"
                  items={data.projectInsights.longTermProjects}
                />
                <AgendaList
                  title="Most Delayed Projects"
                  items={data.projectInsights.mostDelayedProjects}
                />
              </div>
            </section>

            <section>
              <SectionTitle title="Agenda" />
              <div className="grid grid-cols-[6fr_4fr] gap-6">
                <AgendaList
                  title="Most Unresolved Agenda"
                  items={data.projectInsights.agenda.unresolved}
                />
                <div className="grid grid-cols-2  gap-3">
                  <KPICard title="Unresolved" value="50" subtext="total" />
                  <KPICard title="Resolved" value="50" subtext="total" />
                  <KPICard title="Parked" value="50" subtext="total" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

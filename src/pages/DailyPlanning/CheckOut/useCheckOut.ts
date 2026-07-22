import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import { getUserId } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function useCheckOut() {
  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Daily Planning", href: "" },
      { label: "Check-out", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const [paginationFilter, setPaginationFilter] = useState({ search: "" });

  const { data, isLoading } = useGetDailyPlan(employeeId, todayDate);

  const items = useMemo(() => {
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    return data?.data?.dailyPlanItems || [];
  }, [data]);

  const filteredItems = useMemo(() => {
    const term = (paginationFilter.search || "").toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) => {
      const title =
        item.title ||
        item.task?.taskName ||
        item.meeting?.meetingName ||
        "";
      const remarks = item.remarks || "";
      return (
        title.toLowerCase().includes(term) ||
        remarks.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term)
      );
    });
  }, [items, paginationFilter.search]);

  const totalItems = items.length;
  const totalEstimatedTime = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.estimatedTime || 0), 0),
    [items]
  );
  const totalTasks = useMemo(
    () => items.filter((i) => i.type === "TASK").length,
    [items]
  );
  const totalMeetings = useMemo(
    () => items.filter((i) => i.type === "MEETING").length,
    [items]
  );

  return {
    todayDate,
    items,
    filteredItems,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    totalItems,
    totalEstimatedTime,
    totalTasks,
    totalMeetings,
  };
}

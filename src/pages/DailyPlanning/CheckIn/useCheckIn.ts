import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import { getUserId, getUserDetail, getUserPermission } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useRemoveDailyPlanItem from "@/features/api/dailyPlan/useRemoveDailyPlanItem";
import useUpdateDailyPlanItem from "@/features/api/dailyPlan/useUpdateDailyPlanItem";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function useCheckIn() {
  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Daily Planning", href: "" },
      { label: "Check-in", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DailyPlanItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DailyPlanItem | null>(null);
  const [paginationFilter, setPaginationFilter] = useState({ search: "" });

  const { data, isLoading } = useGetDailyPlan(employeeId, todayDate);
  const { mutate: removeItem, isPending: isDeleting } = useRemoveDailyPlanItem();
  const { mutate: updateItem, isPending: isSubmitting } = useUpdateDailyPlanItem();

  const user = useSelector(getUserDetail);
  const startTime = user?.companyStartTime;

  const isEditWindowExpired = useMemo(() => {
    if (!startTime) return false;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const checkinStartDateTime = new Date();
    checkinStartDateTime.setHours(startHour, startMin, 0, 0);

    const editWindowHours = Number(import.meta.env.VITE_CHECKIN_EDIT_WINDOW_HOURS) || 2;
    const cutOffDateTime = new Date(checkinStartDateTime.getTime() + editWindowHours * 60 * 60 * 1000);

    const now = new Date();
    return now.getTime() > cutOffDateTime.getTime();
  }, [startTime]);

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

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    removeItem(deletingItem.planItemId, {
      onSuccess: () => {
        setDeletingItem(null);
      },
    });
  };

  const handleSubmitPlan = () => {
    const firstItem = items[0];
    if (!firstItem) return;

    const confirmSubmit = window.confirm("Are you sure you want to submit your plan for today?");
    if (!confirmSubmit) return;

    updateItem({
      planItemId: firstItem.planItemId,
      planId: firstItem.planId,
      isFinalSubmit: true,
    });
  };

  const permission = useSelector(getUserPermission).DAILY_PLANNING;


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
    isEditWindowExpired,
    permission,

    // Modal state
    isAddModalOpen,
    setIsAddModalOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,

    // Delete handler
    handleConfirmDelete,
    isDeleting,

    // Submit handler
    handleSubmitPlan,
    isSubmitting,
  };
}

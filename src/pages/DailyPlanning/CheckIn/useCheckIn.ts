import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format, subDays, addDays } from "date-fns";

import { getUserId, getUserDetail, getUserPermission } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useRemoveDailyPlanItem from "@/features/api/dailyPlan/useRemoveDailyPlanItem";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";
import useCheckInDailyPlan from "@/features/api/dailyPlan/useCheckInDailyPlan";
import useAllCompanyTask from "@/features/api/companyTask/useAllCompanyTask";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";

export default function useCheckIn() {
  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const minDate = useMemo(() => format(subDays(new Date(), 365 * 10), "yyyy-MM-dd"), []);
  const maxDate = useMemo(() => format(addDays(new Date(), 2), "yyyy-MM-dd"), []);

  const [selectedDate, setSelectedDate] = useState(todayDate);

  const goToDate = (date: Date) => {
    const formatted = format(date, "yyyy-MM-dd");
    if (formatted >= minDate && formatted <= maxDate) {
      setSelectedDate(formatted);
    }
  };

  const shiftDay = (delta: number) => {
    const target = addDays(new Date(selectedDate), delta);
    goToDate(target);
  };

  const handleSetSelectedDate = (dateStr: string) => {
    if (dateStr >= minDate && dateStr <= maxDate) {
      setSelectedDate(dateStr);
    }
  };

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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [paginationFilter, setPaginationFilter] = useState({ search: "" });

  const { data, isLoading, refetch } = useGetDailyPlan(employeeId, selectedDate);
  const { mutate: removeItem, isPending: isDeleting } = useRemoveDailyPlanItem();
  const { mutate: addItem } = useAddDailyPlanItem();
  const { mutate: submitCheckIn, isPending: isSubmitting } = useCheckInDailyPlan();

  const { data: pendingTasksData, isLoading: isLoadingPendingTasks } = useAllCompanyTask({
    filter: {
      isNotCompleteCancel: true,
      dailyplantasknotinclude: true,
      employeeId: employeeId,
      taskdeadline: selectedDate,
    },
  });

  const pendingTasks = useMemo(() => {
    return pendingTasksData?.data || [];
  }, [pendingTasksData]);

  const user = useSelector(getUserDetail);
  const startTime = user?.companyStartTime;

  const isEditWindowExpired = useMemo(() => {
    if (selectedDate < todayDate) return true;
    if (selectedDate > todayDate) return false;
    if (!startTime) return false;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const checkinStartDateTime = new Date();
    checkinStartDateTime.setHours(startHour, startMin, 0, 0);

    const editWindowHours = Number(import.meta.env.VITE_CHECKIN_EDIT_WINDOW_HOURS) || 2;
    const cutOffDateTime = new Date(checkinStartDateTime.getTime() + editWindowHours * 60 * 60 * 1000);

    const now = new Date();
    return now.getTime() > cutOffDateTime.getTime();
  }, [startTime, selectedDate, todayDate]);

  const items = useMemo(() => {
    const rawItems = (Array.isArray(data?.data)
      ? data.data
      : data?.data?.dailyPlanItems || []) as DailyPlanItem[];
    const filteredRaw = rawItems.filter((item: DailyPlanItem) => item.isPlaned !== false);
    return filteredRaw.map((item: DailyPlanItem) => {
      let derivedType = "TASK";
      if (item.meetingId || item.meeting) {
        derivedType = "MEETING";
      } else if (item.ganttItemId || item.gantItem) {
        derivedType = "GANTT";
      }

      // Calculate estimatedTime in seconds from meeting if meeting
      let estTimeSec = (item.planTime !== undefined && item.planTime !== null) ? item.planTime : item.estimatedTime;
      if (derivedType === "MEETING" && item.meeting?.meetingDateTime && item.meeting?.endDate) {
        const start = new Date(item.meeting.meetingDateTime).getTime();
        const end = new Date(item.meeting.endDate).getTime();
        if (end > start) {
          estTimeSec = Math.round((end - start) / 1000);
        }
      }

      const isRepeatTask = item.isRepeat || !!item.task?.repetitiveTaskId;
      const isDetailMeeting = Boolean(item.isDetailMeeting || (item.meetingId && item.meeting?.detailMeetingStatus));

      let estTimeMins = 0;
      if (estTimeSec) {
        if (derivedType === "MEETING" && !isDetailMeeting) {
          estTimeMins = estTimeSec;
        } else {
          estTimeMins = isRepeatTask ? estTimeSec : Math.round(estTimeSec / 60);
        }
      }

      return {
        ...item,
        type: item.type || derivedType,
        isDetailMeeting,
        estimatedTime: estTimeMins,
        actualTime: item.actualTime
          ? (derivedType === "MEETING" && isDetailMeeting ? item.actualTime : Math.round(item.actualTime / 60))
          : 0,
      };
    });
  }, [data]);

  const filteredItems = useMemo(() => {
    const term = (paginationFilter.search || "").toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) => {
      const title =
        item.title ||
        item.task?.taskName ||
        item.meeting?.meetingName ||
        item.gantItem?.itemName ||
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
    () => items.filter((i) => i.type === "TASK" || i.type === "GANTT").length,
    [items]
  );
  const totalMeetings = useMemo(
    () => items.filter((i) => i.type === "MEETING").length,
    [items]
  );
  const totalActualTime = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.actualTime || 0), 0),
    [items]
  );

  const companyWorkingMinutes = useMemo(() => {
    if (!user?.companyStartTime || !user?.companyEndTime) return 0;
    const [startH, startM] = user.companyStartTime.split(":").map(Number);
    const [endH, endM] = user.companyEndTime.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;
    return diff;
  }, [user?.companyStartTime, user?.companyEndTime]);

  const isCompanyTimeDefined = Boolean(user?.companyStartTime && user?.companyEndTime);

  const remainingTime = useMemo(() => {
    return Math.max(0, companyWorkingMinutes - totalEstimatedTime);
  }, [companyWorkingMinutes, totalEstimatedTime]);

  const isOvertime = useMemo(() => {
    return totalEstimatedTime > companyWorkingMinutes;
  }, [totalEstimatedTime, companyWorkingMinutes]);


  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    removeItem(deletingItem.planItemId, {
      onSuccess: () => {
        setDeletingItem(null);
        refetch();
      },
    });
  };

  const handleSubmitPlan = () => {
    const firstItem = items[0];
    if (!firstItem) return;
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmitPlan = () => {
    submitCheckIn(
      {
        checkinDate: selectedDate,
        submitTime: new Date().toISOString(),
        isFinalSubmit: true,
        isAutoSubmit: false,
      },
      {
        onSuccess: () => {
          setIsSubmitModalOpen(false);
          refetch();
        },
      }
    );
  };

  const handleDirectSubmitPlanningItem = async (payload: {
    taskId?: string;
    meetingId?: string;
    ganttItemId?: string;
    estimatedTime: number;
    remarks: string;
    title: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      addItem(
        {
          date: selectedDate,
          type: payload.taskId ? "TASK" : payload.meetingId ? "MEETING" : "GANTT",
          planTime: payload.estimatedTime * 60, // Convert minutes to seconds
          remarks: payload.remarks || undefined,
          taskId: payload.taskId,
          meetingId: payload.meetingId,
          ganttItemId: payload.ganttItemId,
          isPlaned: true,
        },
        {
          onSuccess: () => {
            refetch();
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        }
      );
    });
  };

  const handleAddSuggestedTask = (taskTitle: string, durationMins: number, type: "TASK" | "GANTT", refId?: string) => {
    addItem(
      {
        date: selectedDate,
        type: type,
        planTime: durationMins * 60, // Convert minutes to seconds
        remarks: taskTitle,
        isPlaned: true,
        ganttItemId: type === "GANTT" ? refId : undefined,
        taskId: type === "TASK" ? refId : undefined,
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const isSubmitted = useMemo(() => {
    return Boolean(data?.data?.isAutoSubmit || data?.data?.isFinalSubmit);
  }, [data]);

  const permission = useSelector(getUserPermission).DAILY_PLANNING;


  return {
    todayDate,
    selectedDate,
    setSelectedDate: handleSetSelectedDate,
    minDate,
    maxDate,
    goToDate,
    shiftDay,
    items,
    filteredItems,
    isLoading,
    paginationFilter,
    setPaginationFilter,
    totalItems,
    totalEstimatedTime,
    totalActualTime,
    totalTasks,
    totalMeetings,
    remainingTime,
    isOvertime,
    isEditWindowExpired,
    isSubmitted,
    permission,
    companyWorkingMinutes,
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
    handleConfirmSubmitPlan,
    isSubmitting,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    isCompanyTimeDefined,

    // Direct and suggested add
    handleDirectSubmitPlanningItem,
    handleAddSuggestedTask,
    pendingTasks,
    isLoadingPendingTasks,
    planData: data,
  };
}

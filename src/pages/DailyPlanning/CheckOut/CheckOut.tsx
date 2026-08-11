import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  ArrowRightLeft,
  Plus, 
  CheckCircle2, 
  Clock,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModalData from "@/components/shared/Modal/ModalData";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { format, subDays, addDays } from "date-fns";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserId } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useCheckOutDailyPlan from "@/features/api/dailyPlan/useCheckOutDailyPlan";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";
import useAllCompanyTask from "@/features/api/companyTask/useAllCompanyTask";
import useGetGanttItems from "@/features/api/gantt/useGetGanttItems";
import Loader from "@/components/shared/Loader/Loader";
import SingleCalendarDatePicker from "@/components/shared/FormDateTimePicker/SingleCalendarDatePicker";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface CheckoutItem {
  id: string;
  title: string;
  plannedTimeMinutes: number;
  actualHours: number | "";
  actualMinutes: number | "";
  taskId?: string;
  meetingId?: string;
  ganttItemId?: string;
  isExtra?: boolean;
  dueDate?: string | null;
  ganttStartDate?: string | null;
  ganttEndDate?: string | null;
  meetingStartTime?: string | null;
  meetingEndTime?: string | null;
  remarks?: string;
  joiners?: string[];
  isDetailMeeting?: boolean;
  forwardDate?: string | null;
}

interface ExtendedDailyPlanItem extends DailyPlanItem {
  ganttItem?: {
    ganttItemId?: string;
    itemName?: string;
    itemDeadline?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    projectName?: string;
  } | null;
  gantItem?: {
    ganttItemId: string;
    itemName: string;
    itemDeadline?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    projectName?: string;
  } | null;
  task?: (DailyPlanItemTaskRef & {
    companyProject?: {
      projectName?: string;
    } | null;
  }) | null;
  meeting?: (DailyPlanItemMeetingRef & {
    companyProject?: {
      projectName?: string;
    } | null;
  }) | null;
  isForward?: boolean;
}

export default function CheckOut() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Daily Planning", href: "" },
      { label: "Check-out", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const employeeId = useSelector(getUserId);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const minDate = useMemo(() => format(subDays(new Date(), 365 * 10), "yyyy-MM-dd"), []);
  const maxDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [selectedDate, setSelectedDate] = useState(todayDate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [ratingError, setRatingError] = useState<string | null>(null);

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

  // Fetch today's daily plan from backend
  const { data: planData, isLoading, refetch } = useGetDailyPlan(employeeId, selectedDate);
  const { mutate: submitCheckout, isPending: isSubmitting } = useCheckOutDailyPlan();
  const { mutate: addItem, isPending: isAddingItem } = useAddDailyPlanItem();

  const isPlanSubmitted = useMemo(() => {
    return Boolean(
      planData?.data?.isAutoSubmit ||
      planData?.data?.isFinalSubmit
    );
  }, [planData]);

  const dailyPlanItems = useMemo(() => {
    if (Array.isArray(planData?.data)) {
      return planData.data;
    }
    return planData?.data?.dailyPlanItems || [];
  }, [planData]);

  const timeLogId = useMemo(() => {
    return planData?.data?.timeLogId || planData?.data?.timeLog?.timeLogId || planData?.data?.id;
  }, [planData]);

  const backendRating = useMemo(() => {
    return (
      planData?.data?.dayRating ||
      planData?.data?.timeLog?.dayRating ||
      planData?.data?.timeLog?.rating ||
      planData?.data?.rating ||
      null
    );
  }, [planData]);

  const backendRemark = useMemo(() => {
    return (
      planData?.data?.remarks ||
      planData?.data?.timeLog?.remarks ||
      ""
    );
  }, [planData]);

  const isAlreadyCheckedOut = useMemo(() => {
    return Boolean(
      planData?.data?.checkoutTime ||
      planData?.data?.timeLog?.checkoutTime ||
      planData?.data?.isCheckoutSubmitted
    );
  }, [planData]);

  const isEditable = useMemo(() => {
    return selectedDate === todayDate && !isAlreadyCheckedOut;
  }, [selectedDate, todayDate, isAlreadyCheckedOut]);

  // List of checkout tasks/items
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Sync rating state with fetched backend rating
  useEffect(() => {
    if (backendRating !== null) {
      setRating(backendRating);
    } else {
      setRating(null);
    }
  }, [backendRating]);

  // Sync notes state with fetched backend remark
  useEffect(() => {
    if (backendRemark) {
      setNotes(backendRemark);
    } else {
      setNotes("");
    }
  }, [backendRemark]);

  useEffect(() => {
    setIsSubmitted(false);
    setRatingError(null);
    setValidationErrors({});
    setShowValidationErrors(false);
  }, [selectedDate]);

  const handleShareCheckout = () => {
    if (!items || items.length === 0) {
      toast.error("No items to share!");
      return;
    }

    let formattedDate = "";
    try {
      formattedDate = format(new Date(selectedDate), "dd/MM/yyyy");
    } catch {
      formattedDate = selectedDate;
    }

    const plan = planData?.data;
    const timeLog = plan?.timeLog;

    const rawCheckin = 
      timeLog?.checkinTime || 
      plan?.checkinTime ||
      timeLog?.createdDatetime ||
      plan?.createdDatetime ||
      timeLog?.submitTime ||
      plan?.submitTime;
    let checkinTimeStr = "-";
    if (rawCheckin) {
      try {
        if (rawCheckin.includes("T") || rawCheckin.includes("-")) {
          checkinTimeStr = format(new Date(rawCheckin), "hh:mm a").toUpperCase();
        } else {
          const [h, m] = rawCheckin.split(":");
          const d = new Date();
          d.setHours(parseInt(h) || 0, parseInt(m) || 0, 0, 0);
          checkinTimeStr = format(d, "hh:mm a").toUpperCase();
        }
      } catch {
        checkinTimeStr = rawCheckin;
      }
    }

    const rawCheckout = 
      timeLog?.checkoutTime || 
      plan?.checkoutTime ||
      timeLog?.updatedDatetime ||
      plan?.updatedDatetime;
    let checkoutTimeStr = "";
    if (rawCheckout) {
      try {
        if (rawCheckout.includes("T") || rawCheckout.includes("-")) {
          checkoutTimeStr = format(new Date(rawCheckout), "hh:mm a").toUpperCase();
        } else {
          const [h, m] = rawCheckout.split(":");
          const d = new Date();
          d.setHours(parseInt(h) || 0, parseInt(m) || 0, 0, 0);
          checkoutTimeStr = format(d, "hh:mm a").toUpperCase();
        }
      } catch {
        checkoutTimeStr = rawCheckout;
      }
    } else {
      checkoutTimeStr = format(new Date(), "hh:mm a").toUpperCase();
    }

    const tasks = items.filter((item) => !item.meetingId && !item.ganttItemId && !item.isExtra);
    const meetings = items.filter((item) => Boolean(item.meetingId) && !item.isExtra);
    const gantt = items.filter((item) => Boolean(item.ganttItemId) && !item.isExtra);
    const extra = items.filter((item) => Boolean(item.isExtra));

    const summaryGroups = [
      { displayName: "Task", items: tasks },
      { displayName: "Meeting", items: meetings },
      { displayName: "Gantt", items: gantt },
      { displayName: "Extra", items: extra },
    ].filter((group) => group.items.length > 0);

    let text = `${formattedDate}\n\n`;
    text += `Check-in: ${checkinTimeStr}\n`;
    text += `Check-out: ${checkoutTimeStr}\n\n\n`;

    summaryGroups.forEach((group) => {
      text += `${group.displayName} (${group.items.length})\n`;
      group.items.forEach((item) => {
        const title = item.title;
        const isMeeting = Boolean(item.meetingId);

        let estDuration = "—";
        if (!item.isExtra || isMeeting) {
          estDuration = item.plannedTimeMinutes > 0 ? formatMinutesToHours(item.plannedTimeMinutes) : "—";
        }

        const h = item.actualHours === "" ? 0 : Number(item.actualHours) || 0;
        const m = item.actualMinutes === "" ? 0 : Number(item.actualMinutes) || 0;
        const actualMins = h * 60 + m;
        const actDuration = actualMins > 0 ? formatMinutesToHours(actualMins) : "—";

        let emoji = "❌";
        if (actualMins > 0) {
          emoji = "✅";
        }

        text += `• ${title}: Est: ${estDuration} | Act: ${actDuration} ${emoji}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text.trim())
      .then(() => {
        toast.success("Check-out summary copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy check-out summary.");
      });
  };

  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);

  // Extra Task Form State
  const [extraTaskHours, setExtraTaskHours] = useState("");
  const [extraTaskMinutes, setExtraTaskMinutes] = useState("");

  const [extraTaskTab, setExtraTaskTab] = useState<"pending" | "gantt">("pending");
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState("");
  const [selectedGanttItemId, setSelectedGanttItemId] = useState("");

  // Fetch pending tasks from backend
  const { data: pendingTasksData, isLoading: isLoadingPendingTasks } = useAllCompanyTask({
    filter: {
      isNotCompleteCancel: true,
      dailyplantasknotinclude: true,
      employeeId: employeeId || "",
      taskdeadline: selectedDate,
    },
  });

  const pendingTasksList = useMemo(() => {
    return pendingTasksData?.data || [];
  }, [pendingTasksData]);

  // Fetch Gantt tasks from backend
  const { data: ganttResponse, isLoading: isLoadingGantt } = useGetGanttItems({
    date: selectedDate,
  });

  const ganttTasksList = useMemo(() => {
    return ganttResponse?.data || [];
  }, [ganttResponse]);

  // Filtered dropdown lists (excluding tasks already added/logged today)
  const availablePendingTasks = useMemo(() => {
    return pendingTasksList.filter(
      (task: TaskGetPaging) => !items.some((i) => i.taskId === task.taskId)
    );
  }, [pendingTasksList, items]);

  const availableGanttTasks = useMemo(() => {
    return ganttTasksList.filter(
      (task: TodayGanttItem) => !items.some((i) => i.ganttItemId === task.ganttItemId)
    );
  }, [ganttTasksList, items]);

  const pendingOptions = useMemo(() => {
    return availablePendingTasks.map((t) => ({
      label: t.taskName || "Unnamed Task",
      value: t.taskId || "",
    }));
  }, [availablePendingTasks]);

  const ganttOptions = useMemo(() => {
    return availableGanttTasks.map((t) => ({
      label: t.itemName || "Unnamed Gantt Task",
      value: t.ganttItemId || "",
    }));
  }, [availableGanttTasks]);

  const [notes, setNotes] = useState("");

  const totalPlannedMinutes = useMemo(() => {
    return items.reduce((acc, item) => acc + item.plannedTimeMinutes, 0);
  }, [items]);

  const totalActualMinutes = useMemo(() => {
    return items.reduce((acc, item) => {
      const h = typeof item.actualHours === "number" ? Number(item.actualHours) : 0;
      const m = typeof item.actualMinutes === "number" ? Number(item.actualMinutes) : 0;
      return acc + (h * 60 + m);
    }, 0);
  }, [items]);
  const groupedCheckoutItems = useMemo(() => {
    const tasks = items.filter((item) => !item.meetingId && !item.ganttItemId && !item.isExtra);
    const meetings = items.filter((item) => Boolean(item.meetingId) && !item.isExtra);
    const gantt = items.filter((item) => Boolean(item.ganttItemId) && !item.isExtra);
    const extra = items.filter((item) => Boolean(item.isExtra));

    return [
      { name: "task", displayName: "Task", items: tasks },
      { name: "meeting", displayName: "Meeting", items: meetings },
      { name: "gant", displayName: "Gant", items: gantt },
      { name: "extra", displayName: "Extra", items: extra },
    ].filter((group) => group.items.length > 0);
  }, [items]);





  const formatMeetingTimeRange = (startStr?: string | null, endStr?: string | null) => {
    if (!startStr) return "";
    try {
      const startDate = new Date(startStr);
      const startFormatted = format(startDate, "hh:mm a");
      if (endStr) {
        const endDate = new Date(endStr);
        return `${startFormatted} - ${format(endDate, "hh:mm a")}`;
      }
      return startFormatted;
    } catch {
      return "";
    }
  };

  const formatItemDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return "";
    }
  };

  // Sync state with fetched daily plan items
  useEffect(() => {
    if (dailyPlanItems.length > 0) {
      setItems((prevItems) => {
        return (dailyPlanItems as ExtendedDailyPlanItem[]).map((item) => {
          let derivedType = item.type;
          if (!derivedType) {
            if (item.meetingId || item.meeting) derivedType = "MEETING";
            else if (item.ganttItemId || item.gantItem) derivedType = "GANTT";
            else derivedType = "TASK";
          }

          let estTimeSec = (item.planTime !== undefined && item.planTime !== null) ? item.planTime : item.estimatedTime;
          if (!estTimeSec && derivedType === "MEETING" && item.meeting?.meetingDateTime && item.meeting?.endDate) {
            const start = new Date(item.meeting.meetingDateTime).getTime();
            const end = new Date(item.meeting.endDate).getTime();
            if (end > start) {
              estTimeSec = Math.round((end - start) / 1000);
            }
          }

          // Convert seconds from backend to minutes for UI fields (except for repeat tasks which are already in minutes)
          const isRepeatTask = item.isRepeat || !!item.task?.repetitiveTaskId;
          const plannedMinutes = estTimeSec
            ? (isRepeatTask ? estTimeSec : Math.round(estTimeSec / 60))
            : 0;
          
          // Check if this item already exists in the previous local items state
          const existingItem = prevItems.find((prev) => prev.id === item.planItemId);
          
          let actualH: number | "" = "";
          let actualM: number | "" = "";
          
          if (existingItem) {
            // Preserve user-filled values from local state
            actualH = existingItem.actualHours;
            actualM = existingItem.actualMinutes;
          } else {
            // Otherwise, initialize from backend values
            const actualMinutes = item.actualTime ? Math.round(item.actualTime / 60) : 0;
            actualH = actualMinutes > 0 ? (Math.floor(actualMinutes / 60) || "") : "";
            actualM = actualMinutes > 0 ? ((actualMinutes % 60) || "") : "";
          }

          const isDetailM = Boolean(item.meetingId && item.meeting?.detailMeetingStatus);

          return {
            id: item.planItemId,
            title: item.title || item.task?.taskName || item.meeting?.meetingName || item.ganttItem?.itemName || item.gantItem?.itemName || "Plan Item",
            plannedTimeMinutes: plannedMinutes,
            actualHours: actualH,
            actualMinutes: actualM,
            taskId: item.taskId || item.task?.taskId || undefined,
            meetingId: item.meetingId || item.meeting?.meetingId || undefined,
            ganttItemId: item.ganttItemId || item.gantItem?.ganttItemId || item.ganttItem?.ganttItemId || undefined,
            isExtra: item.isPlaned === false,
            dueDate: item.task?.taskDeadline || item.task?.dueDate || item.ganttItem?.itemDeadline || item.gantItem?.itemDeadline || null,
            ganttStartDate: item.ganttItem?.actualStartDate || item.gantItem?.actualStartDate || null,
            ganttEndDate: item.ganttItem?.actualEndDate || item.gantItem?.actualEndDate || item.ganttItem?.itemDeadline || item.gantItem?.itemDeadline || null,
            meetingStartTime: item.meeting?.meetingDateTime || null,
            meetingEndTime: item.meeting?.endDate || null,
            remarks: item.remarks || "",
            joiners: item.meeting?.joiners?.map((j: string | DailyPlanUserRef) => typeof j === "string" ? j : j.employeeName || j.name || "") || [],
            isDetailMeeting: isDetailM,
            forwardDate: item.forwardDate || null,
          };
        });
      });
    }
  }, [dailyPlanItems]);

  useEffect(() => {
    if (backendRating !== null) {
      setRating(backendRating);
    }
  }, [backendRating]);

  // Copy all planned times into actual times
  const handleCopyAll = () => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.isDetailMeeting) return item; // Skip detail meetings
        if (item.plannedTimeMinutes <= 0) {
          return {
            ...item,
            actualHours: "",
            actualMinutes: "",
          };
        }
        const hours = Math.floor(item.plannedTimeMinutes / 60) || "";
        const mins = (item.plannedTimeMinutes % 60) || "";
        return {
          ...item,
          actualHours: hours,
          actualMinutes: mins,
        };
      })
    );
    setValidationErrors({});
  };

  // Copy single planned time to actual time
  const handleCopySingle = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (item.isDetailMeeting) return item; // Skip detail meetings
          const hours = Math.floor(item.plannedTimeMinutes / 60) || "";
          const mins = (item.plannedTimeMinutes % 60) || "";
          return {
            ...item,
            actualHours: hours,
            actualMinutes: mins,
          };
        }
        return item;
      })
    );
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleForwardDateChange = (id: string, dateStr: string | null) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, forwardDate: dateStr } : item
      )
    );
  };

  // Handle manual input changes
  const handleHoursChange = (id: string, val: string) => {
    const cleanVal = val.slice(0, 2);
    const num = cleanVal === "" || cleanVal === "0" ? "" : Math.max(0, Math.min(12, parseInt(cleanVal) || 0));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualHours: num } : item))
    );
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleMinutesChange = (id: string, val: string) => {
    const cleanVal = val.slice(0, 2);
    const num = cleanVal === "" || cleanVal === "0" ? "" : Math.max(0, Math.min(59, parseInt(cleanVal) || 0));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualMinutes: num } : item))
    );
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Add Extra Task
  const handleAddExtraTask = () => {
    let type: "TASK" | "GANTT" = "TASK";
    let taskId: string | undefined = undefined;
    let ganttItemId: string | undefined = undefined;

    if (extraTaskTab === "pending") {
      if (!selectedPendingTaskId) {
        toast.error("Please select a pending task");
        return;
      }
      taskId = selectedPendingTaskId;
      type = "TASK";
    } else if (extraTaskTab === "gantt") {
      if (!selectedGanttItemId) {
        toast.error("Please select a Gantt task");
        return;
      }
      ganttItemId = selectedGanttItemId;
      type = "GANTT";
    }

    const h = parseInt(extraTaskHours) || 0;
    const m = parseInt(extraTaskMinutes) || 0;
    const totalMinutes = h * 60 + m;

    // if (totalMinutes <= 0) {
    //   toast.error("Please enter a valid estimated time");
    //   return;
    // }

    addItem(
      {
        date: selectedDate,
        type,
        planTime: totalMinutes * 60, 
        taskId,
        ganttItemId,
        isPlaned: false, 
        isExtra: true, 
      },
      {
        onSuccess: () => {
          setIsExtraModalOpen(false);
          setExtraTaskHours("");
          setExtraTaskMinutes("");
          setSelectedPendingTaskId("");
          setSelectedGanttItemId("");
          refetch(); // Refetch the daily plan to update list
        },
      }
    );
  };

  const handleExecuteCheckoutSubmit = () => {
    const payloadItems = items.map((item) => {
      const h = item.actualHours === "" ? 0 : Number(item.actualHours) || 0;
      const m = item.actualMinutes === "" ? 0 : Number(item.actualMinutes) || 0;
      const actualMins = h * 60 + m;

      const isLogged = actualMins > 0;
      let forwardDateVal: string | undefined = undefined;
      if (!isLogged && !item.isDetailMeeting) {
        forwardDateVal = item.forwardDate || format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd");
      }

      return {
        planItemId: item.id,
        taskId: item.taskId,
        meetingId: item.meetingId,
        ganttItemId: item.ganttItemId,
        planTime: item.plannedTimeMinutes * 60, // Convert minutes to seconds
        actualTime: actualMins * 60, // Convert minutes to seconds
        remarks: item.remarks || item.title,
        isPlaned: !item.isExtra,
        forwardDate: forwardDateVal,
      };
    });

    submitCheckout(
      {
        timeLogId,
        checkinDate: selectedDate,
        checkoutTime: new Date().toISOString(),
        isFinalSubmit: true,
        dayRating: rating ?? undefined,
        remarks: notes || undefined,
        items: payloadItems,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setIsConfirmSubmitOpen(false);
          refetch();
        },
      }
    );
  };

  // Submit Checkout Plan
  // Submit Checkout Plan
  const handleSubmitCheckout = () => {
    const ratingIsMissing = rating === null;
    const hasEmptyTasks = items.some(
      (item) => !item.isDetailMeeting && 
        (item.actualHours === "" || item.actualHours === 0 || item.actualHours == null) && 
        (item.actualMinutes === "" || item.actualMinutes === 0 || item.actualMinutes == null)
    );

    // Turn on warnings for empty inputs immediately if any exist
    if (hasEmptyTasks) {
      setShowValidationErrors(true);
    }

    // Validate Rating (required to proceed)
    if (ratingIsMissing) {
      setRatingError("Please rate your today's productivity (1 to 10)");
      return;
    } else {
      setRatingError(null);
    }

    // If rating is filled and there are empty tasks, show confirmation warning modal
    if (hasEmptyTasks) {
      setIsConfirmSubmitOpen(true);
    } else {
      handleExecuteCheckoutSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 bg-slate-50/50 overflow-y-auto lg:overflow-hidden">
      
      <div className="flex items-center justify-between mb-6 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Check-out</h1>
        </div>

        {/* Date Selector / Calendar at the top */}
        <div className="flex items-center gap-2">
          {(isAlreadyCheckedOut || isSubmitted) && selectedDate === todayDate && (
            <Button
              onClick={handleShareCheckout}
              type="button"
              className=" bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Share2 className="h-4 w-4" /> Share Summary
            </Button>
          )}

          {isEditable && isPlanSubmitted && !isLoading && (
            <Button
              onClick={() => setIsExtraModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Extra Task
            </Button>
          )}
          {/* Date Switcher Box */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white shadow-2xs py-0.5 px-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={() => shiftDay(-1)}
              disabled={selectedDate <= minDate}
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>

            <SingleCalendarDatePicker
              value={new Date(selectedDate)}
              onChange={(date) => {
                if (date) {
                  setSelectedDate(format(date, "yyyy-MM-dd"));
                }
              }}
              minDate={new Date(minDate)}
              maxDate={new Date(maxDate)}
              variant="ghost"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={() => shiftDay(1)}
              disabled={selectedDate >= maxDate}
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          {selectedDate !== todayDate && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm cursor-pointer border-slate-200 hover:bg-slate-50 font-semibold"
              onClick={() => goToDate(new Date())}
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      {isLoading ? (
        <div className="w-full flex-1 flex items-center justify-center bg-slate-50/50 min-h-[400px]">
          <Loader />
        </div>
      ) : !isPlanSubmitted ? (
        selectedDate !== todayDate ? (
          <div className="flex h-full w-full items-center justify-center p-6">
  <div className="max-w-md rounded-2xl  px-8 py-10 text-center">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
      <Calendar className="h-8 w-8 text-primary" />
    </div>

    <h3 className="text-xl font-semibold text-foreground">
      No Daily Plan Found
    </h3>

    <p className="mt-3 text-sm leading-6 text-muted-foreground">
      No daily plan was submitted for
      <span className="mx-1 font-semibold text-primary">
        {selectedDate}
      </span>
      .
    </p>

    
  </div>
</div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-md flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-5 shadow-inner">
                <Info className="h-8 w-8" />
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-2">Daily Plan Not Submitted</h2>
              
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                You cannot check out because the daily plan for this day was not submitted. Please complete check-in first.
              </p>

              <Button
                onClick={() => navigate("/dashboard/daily-planning/check-in")}
                className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md border-none cursor-pointer text-sm"
              >
                <span>Go to Check-In Page</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      ) : isSubmitted ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 shadow-inner">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">Check-out Submitted!</h2>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Thank you! The daily check-out plan, actual logged times, and experience rating ({rating}/10) have been submitted.
            </p>

            <div className="w-full bg-slate-50 rounded-lg p-3 mb-6 text-left border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Rating:</span>
                <span className="font-semibold text-slate-800">{rating}/10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Items:</span>
                <span className="font-semibold text-slate-800">{items.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Actual Hours Logged:</span>
                <span className="font-semibold text-slate-800">
                  {formatMinutesToHours(
                    items.reduce((acc, item) => {
                      const h = typeof item.actualHours === "number" ? item.actualHours : Number(item.actualHours) || 0;
                      const m = typeof item.actualMinutes === "number" ? item.actualMinutes : Number(item.actualMinutes) || 0;
                      return acc + (h * 60 + m);
                    }, 0)
                  )}
                </span>
              </div>
            </div>

            {selectedDate === todayDate && (
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setRating(null);
                }}
                variant="outline"
                className="w-full py-2 border-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Log Check-out Again</span>
              </Button>
            )}
          </div>
        </div>
      ) : (

      /* Main Grid: 2 Columns */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pb-4">
        
        {/* LEFT COLUMN: Today's Items List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col lg:h-full shadow-3xs">
          
          <div className="overflow-x-auto lg:overflow-y-auto lg:flex-1">
            <Table className="w-full text-left border-collapse min-w-[550px] border-none">
              <TableHeader className="sticky top-0 z-10 bg-primary">
                <TableRow className="bg-primary hover:bg-primary border-none text-white text-sm font-semibold">
                  <TableHead className="py-3 pl-5 pr-4 text-left text-white font-semibold border-none w-full">Name</TableHead>
                  <TableHead className="py-3 px-4 text-center text-white font-semibold border-y-0 border-l-0 border-r border-solid border-white/20 w-[220px]">Deadline / Time</TableHead>
                  <TableHead className="py-3 px-2 text-center text-white font-semibold border-none w-[90px]">Est. Time</TableHead>
                  <TableHead className="py-3 px-1 text-center text-white font-semibold w-[40px] border-none">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAll}
                      disabled={items.length === 0 || !isEditable}
                      className="h-8 w-8 p-0 text-white hover:bg-white/10 text-xs font-bold cursor-pointer rounded-lg flex items-center justify-center mx-auto"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" /> 
                    </Button>
                  </TableHead>
                  <TableHead className="py-3 px-2 text-center text-white font-semibold w-[130px] border-none">Actual Time</TableHead>
                  <TableHead className="py-3 pr-5 pl-2 text-center text-white font-semibold w-[140px] border-none">Forward Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-black text-sm border-none">
                {items.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-16 text-center text-slate-400 border-none">
                      <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold">No planned tasks for today.</p>
                      <p className="text-sm text-slate-400 mt-1">Click "+ Extra Task" to add tasks manually.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedCheckoutItems.map((group) => (
                    <React.Fragment key={group.name}>
                      {/* Group Header Row */}
                      <TableRow className="bg-[#f8fbff] hover:bg-[#f8fbff] border-y border-blue-100/50">
                        <TableCell colSpan={6} className="py-2.5 pl-5 pr-4 border-none">
                          <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-bold text-primary tracking-tight">
                              {group.displayName}
                            </h2>
                            <span className="ml-1 bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full font-bold">
                              {group.items.length}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

              {/* Group Items Rows */}
                      {group.items.map((item, idx) => {
                        const isMeeting = Boolean(item.meetingId);
                        const isGantt = Boolean(item.ganttItemId);
                        const isLogged = Number(item.actualHours) > 0 || Number(item.actualMinutes) > 0;
                        const isEmpty = !item.isDetailMeeting && 
                          (item.actualHours === "" || item.actualHours === 0 || item.actualHours == null) && 
                          (item.actualMinutes === "" || item.actualMinutes === 0 || item.actualMinutes == null);
                        const isWarningActive = showValidationErrors && isEmpty;
                        
                        const timeBgClass = isLogged ? "bg-[#e8f5e9]" : "bg-[#edf2fc]";
                        
                        const inputClassName = `w-6 h-6 text-center text-lg font-bold bg-transparent focus:outline-none border-b transition-colors disabled:cursor-default [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                           isLogged
                               ? "border-emerald-350 text-emerald-700 focus:border-emerald-500"
                               : "border-slate-350 text-primary focus:border-primary"
                         }`;

                        const labelClassName = `text-sm font-semibold ${
                           isLogged
                               ? "text-emerald-700"
                               : "text-primary"
                         }`;
                        
                        return (
                          <TableRow
                            key={item.id}
                            className={`hover:bg-slate-50/50 transition-colors border-none ${
                              isLogged ? "bg-emerald-50/5" : idx % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                            }`}
                          >
                            {/* Item Name */}
                            <TableCell className="py-2.5 text-sm pl-5 pr-4 text-black text-left truncate max-w-[320px] border-none" title={item.title}>
                              {item.title}
                            </TableCell>

                            {/* Deadline / Time */}
                            <TableCell className="py-2.5 px-4 text-sm text-center text-black border-y-0 border-l-0 border-r border-solid border-slate-200 w-[220px]">
                              {isMeeting ? (
                                formatMeetingTimeRange(item.meetingStartTime, item.meetingEndTime)
                              ) : isGantt ? (
                                item.ganttStartDate && item.ganttEndDate ? (
                                  `${formatItemDate(item.ganttStartDate)} to ${formatItemDate(item.ganttEndDate)}`
                                ) : (
                                  formatItemDate(item.dueDate)
                                )
                              ) : (
                                item.dueDate ? `${formatItemDate(item.dueDate)}` : "-"
                              )}
                            </TableCell>

                            {/* Est. Time (Planned) */}
                            <TableCell className={`py-2.5 text-sm px-2 text-center border-none w-[90px] ${timeBgClass}`}>
                              {item.isExtra && !item.meetingId ? (
                                <span className="text-slate-350 font-medium">-</span>
                              ) : (
                                <span className="inline-block rounded px-2 py-0.5">
                                  {formatMinutesToHours(item.plannedTimeMinutes)}
                                </span>
                              )}
                            </TableCell>

                             {/* Copy button */}
                            <TableCell className={`py-2.5 px-1 text-sm text-center border-none w-[40px] ${timeBgClass}`}>
                              {!item.isDetailMeeting && (
                                <button
                                  type="button"
                                  onClick={() => handleCopySingle(item.id)}
                                  disabled={!isEditable || item.plannedTimeMinutes <= 0}
                                  className="h-7 w-7 mx-auto border border-slate-200 hover:enabled:border-primary/50 text-slate-400 hover:enabled:text-primary rounded-full inline-flex items-center justify-center transition-colors bg-white shadow-3xs disabled:cursor-default"
                                  title="Copy planned to actual"
                                >
                                  <ArrowRight className="h-4 w-4 text-primary" />
                                </button>
                              )}
                            </TableCell>

                            {/* Actual Time Inputs */}
                            <TableCell className={`py-2.5 text-sm pr-5 pl-2 border-none w-[130px] ${timeBgClass}`}>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.actualHours}
                                    onChange={(e) => handleHoursChange(item.id, e.target.value)}
                                    disabled={item.isDetailMeeting || !isEditable}
                                    className={inputClassName}
                                  />
                                  <span className={`${labelClassName}  pr-1`}>hr</span>
                                  
                                  <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={item.actualMinutes}
                                    onChange={(e) => handleMinutesChange(item.id, e.target.value)}
                                    disabled={item.isDetailMeeting || !isEditable}
                                    className={inputClassName}
                                  />
                                  <span className={labelClassName}>min</span>
                                  {isWarningActive && (
                                    <span title="Time not filled" className="cursor-help inline-flex items-center ml-1">
                                      <TriangleAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Forward Date Column */}
                            <TableCell className={`py-2.5 text-sm pr-5 pl-2 text-center border-none w-[140px] ${timeBgClass}`}>
                              {!item.isDetailMeeting ? (
                                isEditable ? (
                                  !isLogged ? (
                                    <div className="inline-flex items-center justify-center">
                                      <SingleCalendarDatePicker
                                        value={item.forwardDate ? new Date(item.forwardDate) : addDays(new Date(selectedDate), 1)}
                                        onChange={(date) => 
                                          handleForwardDateChange(item.id, date ? format(date, "yyyy-MM-dd") : null)
                                        }
                                        minDate={addDays(new Date(selectedDate), 1)}
                                        variant="ghost"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-medium">-</span>
                                  )
                                ) : (
                                  <span className="text-slate-700 font-medium">
                                    {item.forwardDate ? formatItemDate(item.forwardDate) : "-"}
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-400 font-medium">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>

          </div>

        </div>

        {/* RIGHT COLUMN: Summary and Checkout Submission */}
        <div className="lg:col-span-4 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1 shrink-0 pb-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col h-full text-left gap-6 overflow-hidden">
            
            {/* Top Details Group (Scrollable) */}
            <div className="flex-1 overflow-y-auto pl-1.5 pr-2 py-0.5 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h2 className="text-base font-bold text-slate-800">Check-out Summary</h2>
                <span className="text-sm text-primary font-bold flex items-center gap-1">
                  <Calendar className="h-5 w-5 " />
                  {format(new Date(), "dd MMM yyyy")}
                </span>
              </div>

               {/* Clean Boxed Stats Grid Layout */}
               <div className="grid grid-cols-2 gap-4 shrink-0">
                 {/* Total Planned Time */}
                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col text-left shadow-2xs">
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Planned Time</span>
                   <span className="text-[15px] font-extrabold text-slate-800 mt-1.5 truncate" title={formatMinutesToHours(totalPlannedMinutes)}>
                     {formatMinutesToHours(totalPlannedMinutes)}
                   </span>
                 </div>

                 {/* Total Logged Time */}
                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col text-left shadow-2xs">
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Logged Time</span>
                   <span className="text-[15px] font-extrabold text-slate-800 mt-1.5 truncate" title={totalActualMinutes > 0 ? formatMinutesToHours(totalActualMinutes) : "-"}>
                     {totalActualMinutes > 0 ? formatMinutesToHours(totalActualMinutes) : "-"}
                   </span>
                 </div>
               </div>

              {/* Productivity Rating Section */}
              <div className="space-y-3 pt-2 shrink-0">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Rate Your Day</h2>
                  <p className="text-sm text-slate-400 font-medium">How was your productivity today? <span className="text-rose-500">*</span></p>
                </div>
                
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => {
                        setRating(num);
                        setRatingError(null);
                      }}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold cursor-pointer transition-all ${
                        rating === num
                          ? "bg-primary text-white border-primary shadow-xs scale-105"
                          : !isEditable
                            ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {ratingError && (
                  <span className="text-rose-600 text-sm  block mt-1 ">
                    {ratingError}
                  </span>
                )}
              </div>

              {/* Notes (Optional) Section */}
              <div className="space-y-2 pt-2 flex flex-col flex-1 min-h-0">
                <h2 className="text-base font-bold text-slate-800 shrink-0">Notes</h2>
                <textarea
                  placeholder="Write your thoughts for today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEditable}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-h-[140px] bg-slate-50/30 text-slate-800 placeholder:text-slate-400 font-medium resize-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bottom Actions Group (Fixed Footer) */}
            <div className="pt-4 border-t border-slate-100 shrink-0">
              <Button
                onClick={handleSubmitCheckout}
                disabled={isSubmitting || !isEditable}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md border-none cursor-pointer text-base disabled:opacity-50"
              >
                <span>
                  {isAlreadyCheckedOut 
                    ? "Checked Out" 
                    : selectedDate !== todayDate 
                      ? "Checkout Closed" 
                      : isSubmitting 
                        ? "Submitting Check-out..." 
                        : "Submit Checkout"}
                </span>
                {!isAlreadyCheckedOut && selectedDate === todayDate && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

          </div>


        </div>

      </div>
      )}

      {/* Confirm Checkout Submit Dialog */}
<ModalData
  isModalOpen={isConfirmSubmitOpen}
  modalTitle="Missing Actual Time"
  modalClose={() => setIsConfirmSubmitOpen(false)}
  buttons={[
    {
      btnText: "Cancel",
      buttonCss:
        "py-2 px-5 bg-transparent text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-lg",
      btnClick: () => setIsConfirmSubmitOpen(false),
    },
    {
      btnText: "Yes, Submit Checkout",
      buttonCss:
        "py-2 px-5 bg-primary text-white hover:bg-primary/90 text-sm font-medium rounded-lg",
      btnClick: handleExecuteCheckoutSubmit,
      isLoading: isSubmitting,
    },
  ]}
>
  <div className="py-4 text-center">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
      <TriangleAlert className="h-8 w-8 text-amber-600" />
    </div>

    <h3 className="text-lg font-semibold text-slate-900">
      Missing Actual Time
    </h3>

    <p className="mt-3 text-sm leading-6 text-slate-600">
      Some tasks do not have <span className="font-medium">Actual Time</span>{" "}
      entered.
    </p>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Please review your tasks before submitting your checkout.
      <br />
      You can still continue if this is intentional.
    </p>
  </div>
</ModalData>

      {/* Extra Task Dialog */}
      <ModalData
        isModalOpen={isExtraModalOpen}
        modalTitle="Add Extra Checkout Task"
        modalClose={() => setIsExtraModalOpen(false)}
        buttons={[
          {
            btnText: "Cancel",
            buttonCss: "py-1.5 px-5 bg-transparent text-slate-700 border hover:bg-slate-50 text-sm font-semibold",
            btnClick: () => setIsExtraModalOpen(false),
          },
          {
            btnText: "Add Task",
            buttonCss: `py-1.5 px-5 cursor-pointer text-sm font-semibold ${
              ((extraTaskTab === "pending" && !selectedPendingTaskId) ||
               (extraTaskTab === "gantt" && !selectedGanttItemId))
                ? "opacity-50 pointer-events-none"
                : ""
            }`,
            btnClick: handleAddExtraTask,
            isLoading: isAddingItem,
          },
        ]}
      >
        <div className="space-y-5 py-2 text-left">
          {/* Radio Button Selector */}
          <div className="flex items-center gap-6 py-2 border-b border-slate-100 pb-3">
            <label className="flex items-center gap-2 cursor-pointer text-md text-primary font-semibold ">
              <input
                type="radio"
                name="extraTaskTab"
                value="pending"
                checked={extraTaskTab === "pending"}
                onChange={() => setExtraTaskTab("pending")}
                className="w-4.5 h-4.5 text-primary border-slate-300 focus:ring-primary cursor-pointer"
              />
              Pending Tasks
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-md text-primary font-semibold  ">
              <input
                type="radio"
                name="extraTaskTab"
                value="gantt"
                checked={extraTaskTab === "gantt"}
                onChange={() => setExtraTaskTab("gantt")}
                className="w-4.5 h-4.5 text-primary border-slate-300 focus:ring-primary cursor-pointer"
              />
              Gantt Tasks
            </label>
          </div>

          {/* Tab Contents */}
          {extraTaskTab === "pending" && (
            <div className="grid gap-1.5">
              <Label className="text-md  ">Select Pending Task <span className="text-rose-500">*</span></Label>
              {isLoadingPendingTasks ? (
                <div className="text-sm text-slate-400 py-2">Loading pending tasks...</div>
              ) : availablePendingTasks.length === 0 ? (
                <div className="text-sm text-slate-400 py-2.5 border border-dashed border-slate-200 rounded-xl px-3 text-center">
                  No pending tasks available
                </div>
              ) : (
                <SearchDropdown
                  options={pendingOptions}
                  selectedValues={selectedPendingTaskId ? [selectedPendingTaskId] : []}
                  onSelect={(item) => setSelectedPendingTaskId(item.value)}
                  placeholder="Choose a Pending Task"
                  onSearchChange={() => {}}
                />
              )}
            </div>
          )}

          {extraTaskTab === "gantt" && (
            <div className="grid gap-1.5">
              <Label className="text-md">Select Gantt Task <span className="text-rose-500">*</span></Label>
              {isLoadingGantt ? (
                <div className="text-sm text-slate-400 py-2">Loading Gantt tasks...</div>
              ) : availableGanttTasks.length === 0 ? (
                <div className="text-sm text-slate-400 py-2.5 border border-dashed border-slate-200 rounded-xl px-3 text-center">
                  No Gantt tasks available for today
                </div>
              ) : (
                <SearchDropdown
                  options={ganttOptions}
                  selectedValues={selectedGanttItemId ? [selectedGanttItemId] : []}
                  onSelect={(item) => setSelectedGanttItemId(item.value)}
                  placeholder="Choose a Gantt Task"
                  onSearchChange={() => {}}
                  className="text-sm text-slate-800"
                />
              )}
            </div>
          )}

          {/* <div className="grid gap-1.5">
            <Label className="text-md ">Estimated Time <span className="text-rose-500">*</span></Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  type="number"
                  min={0}
                  value={extraTaskHours}
                  onChange={(e) => setExtraTaskHours(Math.max(0, parseInt(e.target.value) || 0).toString())}
                  placeholder="0"
                  className="h-10 text-center  border-slate-200 text-black font-semibold text-sm"
                />
                <span className="text-sm  font-medium">hr</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={extraTaskMinutes}
                  onChange={(e) => setExtraTaskMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString())}
                  placeholder="0"
                  className="h-10 text-center  border-slate-200 text-black font-semibold text-sm"
                />
                <span className="text-sm  font-medium">min</span>
              </div>
            </div>
          </div> */}
        </div>
      </ModalData>
    </div>
  );
}

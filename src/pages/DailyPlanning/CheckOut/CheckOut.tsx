import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  ArrowRightLeft,
  Plus, 
  CheckCircle2, 
  Clock,
  Info,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModalData from "@/components/shared/Modal/ModalData";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";
import { format } from "date-fns";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserId } from "@/features/selectors/auth.selector";
import useGetDailyPlan from "@/features/api/dailyPlan/useGetDailyPlan";
import useCheckOutDailyPlan from "@/features/api/dailyPlan/useCheckOutDailyPlan";
import useAddDailyPlanItem from "@/features/api/dailyPlan/useAddDailyPlanItem";
import useAllCompanyTask from "@/features/api/companyTask/useAllCompanyTask";
import useGetGanttItems from "@/features/api/gantt/useGetGanttItems";
import Loader from "@/components/shared/Loader/Loader";

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
}

interface ExtendedDailyPlanItem extends DailyPlanItem {
  ganttItem?: {
    ganttItemId?: string;
    itemName?: string;
    itemDeadline?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
  } | null;
  gantItem?: {
    ganttItemId: string;
    itemName: string;
    itemDeadline?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
  } | null;
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

  // Fetch today's daily plan from backend
  const { data: planData, isLoading, refetch } = useGetDailyPlan(employeeId, todayDate);
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

  const isAlreadyCheckedOut = useMemo(() => {
    return Boolean(
      planData?.data?.checkoutTime ||
      planData?.data?.timeLog?.checkoutTime ||
      planData?.data?.isCheckoutSubmitted
    );
  }, [planData]);

  // List of checkout tasks/items
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync rating state with fetched backend rating
  useEffect(() => {
    if (backendRating !== null) {
      setRating(backendRating);
    }
  }, [backendRating]);

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
    },
  });

  const pendingTasksList = useMemo(() => {
    return pendingTasksData?.data || [];
  }, [pendingTasksData]);

  // Fetch Gantt tasks from backend
  const { data: ganttResponse, isLoading: isLoadingGantt } = useGetGanttItems({
    date: todayDate,
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

  const completedItemsCount = useMemo(() => {
    return items.filter(
      (item) => (Number(item.actualHours) > 0 || Number(item.actualMinutes) > 0)
    ).length;
  }, [items]);

  const progressPercent = useMemo(() => {
    return items.length > 0
      ? Math.round((completedItemsCount / items.length) * 100)
      : 0;
  }, [completedItemsCount, items.length]);





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
      setItems(
        (dailyPlanItems as ExtendedDailyPlanItem[]).map((item) => {
          let derivedType = item.type;
          if (!derivedType) {
            if (item.meetingId || item.meeting) derivedType = "MEETING";
            else if (item.ganttItemId || item.gantItem) derivedType = "GANTT";
            else derivedType = "TASK";
          }

          let estTimeSec = (item.planTime !== undefined && item.planTime !== null) ? item.planTime : item.estimatedTime;
          if (derivedType === "MEETING" && item.meeting?.meetingDateTime && item.meeting?.endDate) {
            const start = new Date(item.meeting.meetingDateTime).getTime();
            const end = new Date(item.meeting.endDate).getTime();
            if (end > start) {
              estTimeSec = Math.round((end - start) / 1000);
            }
          }

          // Convert seconds from backend to minutes for UI fields
          const plannedMinutes = estTimeSec ? Math.round(estTimeSec / 60) : 0;
          const actualMinutes = item.actualTime ? Math.round(item.actualTime / 60) : 0;

          const actualH = actualMinutes > 0 ? (Math.floor(actualMinutes / 60) || "") : "";
          const actualM = actualMinutes > 0 ? ((actualMinutes % 60) || "") : "";
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
          };
        })
      );
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
        if (item.isExtra) {
          // Extra tasks have no planTime on this side, so set to ""
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
  };

  // Copy single planned time to actual time
  const handleCopySingle = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (item.isDetailMeeting || item.isExtra) return item; // Skip detail or extra meetings
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
  };

  // Handle manual input changes
  const handleHoursChange = (id: string, val: string) => {
    const num = val === "" || val === "0" ? "" : Math.max(0, parseInt(val) || 0);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualHours: num } : item))
    );
  };

  const handleMinutesChange = (id: string, val: string) => {
    const num = val === "" || val === "0" ? "" : Math.max(0, Math.min(59, parseInt(val) || 0));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualMinutes: num } : item))
    );
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
        date: todayDate,
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

  // Submit Checkout Plan
  const handleSubmitCheckout = () => {
    if (rating === null) {
      toast.error("Please rate your today's experience (1 to 10)");
      return;
    }

     const payloadItems = items.map((item) => {
       const h = item.actualHours === "" ? 0 : Number(item.actualHours) || 0;
       const m = item.actualMinutes === "" ? 0 : Number(item.actualMinutes) || 0;
       const actualMins = h * 60 + m;
 
      return {
        planItemId: item.isExtra ? undefined : item.id,
        taskId: item.taskId,
        meetingId: item.meetingId,
        ganttItemId: item.ganttItemId,
        planTime: item.plannedTimeMinutes * 60, // Convert minutes to seconds
        actualTime: actualMins * 60, // Convert minutes to seconds
        remarks: item.remarks || item.title,
        isPlaned: !item.isExtra,
      };
    });

  

    submitCheckout(
      {
        timeLogId,
        checkinDate: todayDate,
        checkoutTime: new Date().toISOString(),
        isFinalSubmit: true,
        dayRating: rating,
        items: payloadItems,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          refetch();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50/50 min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!isPlanSubmitted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 p-6 min-h-[500px]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-5 shadow-inner">
            <Info className="h-8 w-8" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Daily Plan Not Submitted</h2>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You cannot check out because you have not submitted your daily plan for today. Please complete your check-in and submit your plan first.
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
    );
  }

  const isSubmittedView = isSubmitted;

  if (isSubmittedView) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 p-6 min-h-[500px]">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 shadow-inner">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check-out Submitted!</h2>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Thank you! Your daily check-out plan, actual logged times, and experience rating ({rating}/10) have been submitted.
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
                    const h = typeof item.actualHours === "number" ? item.actualHours : 0;
                    const m = typeof item.actualMinutes === "number" ? item.actualMinutes : 0;
                    return acc + (h * 60 + m);
                  }, 0)
                )}
              </span>
            </div>
          </div>

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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 bg-slate-50/50 overflow-y-auto lg:overflow-hidden">
      
      {/* Title Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Check-out</h1>
        {!isAlreadyCheckedOut && (
          <Button
            onClick={() => setIsExtraModalOpen(true)}
            className="h-9 px-4 bg-primary hover:bg-primary/95 text-white font-semibold text-xs cursor-pointer rounded-lg flex items-center gap-1.5 shadow-sm border-none"
          >
            <Plus className="h-4 w-4" /> Extra Task
          </Button>
        )}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pb-4">
        
        {/* LEFT COLUMN: Today's Items List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col lg:h-full shadow-3xs">
          
          <div className="overflow-x-auto lg:overflow-y-auto lg:flex-1">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead className="sticky top-0 z-10 bg-primary">
                <tr className="bg-primary text-white text-sm font-semibold">
                  <th className="py-3.5 pl-5 pr-4 text-left font-semibold">Item Name</th>
                  <th className="py-3.5 px-4 text-left font-semibold">Deadline / Time</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Est. Time</th>
                  <th className="py-3.5 px-2 text-center font-semibold w-[160px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAll}
                      disabled={items.length === 0 || isAlreadyCheckedOut}
                      className="h-8 text-white hover:bg-white/10 text-xs font-bold cursor-pointer rounded-lg flex items-center gap-1.5 mx-auto px-3"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" /> 
                    </Button>
                  </th>
                  <th className="py-3.5 pr-5 pl-4 text-center font-semibold min-w-[130px]">Actual Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-black text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold">No planned tasks for today.</p>
                      <p className="text-sm text-slate-400 mt-1">Click "+ Extra Task" to add tasks manually.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isMeeting = Boolean(item.meetingId);
                    const isGantt = Boolean(item.ganttItemId);
                    
                    const isLogged = Number(item.actualHours) > 0 || Number(item.actualMinutes) > 0;

                    return (
                      <>
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/30 transition-colors ${
                            isLogged ? "bg-emerald-50/5" : ""
                          }`}
                        >
                          {/* Item Name */}
                          <td className="py-3.5 text-sm pl-5 pr-4 text-black text-left truncate max-w-[200px]" title={item.title}>
                            {item.title}
                          </td>

                          {/* Deadline / Time */}
                          <td className="py-3.5 px-4 text-sm text-left text-black">
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
                          </td>

                          {/* Est. Time (Planned) */}
                          <td className="py-3.5 text-sm px-4 text-center">
                            {item.isExtra ? (
                              <span className="text-slate-350 font-medium">-</span>
                            ) : (
                              <span className="inline-block rounded px-2 py-0.5">
                                {formatMinutesToHours(item.plannedTimeMinutes)}
                              </span>
                            )}
                          </td>

                          {/* Copy `=` button in the middle */}
                          <td className="py-3.5 px-2 text-sm text-center">
                             {!item.isExtra && !item.isDetailMeeting && !isAlreadyCheckedOut && (
                              <button
                                type="button"
                                onClick={() => handleCopySingle(item.id)}
                                className="h-7 w-7 mx-auto border border-slate-200 hover:border-primary/50 text-slate-400 hover:text-primary rounded-full inline-flex items-center justify-center transition-colors cursor-pointer bg-white shadow-3xs"
                                title="Copy planned to actual"
                              >
                                <ArrowRight className="h-4 w-4 text-primary" />
                              </button>
                            )}
                          </td>

                          {/* Actual Time Inputs */}
                          <td className="py-3.5 text-sm pr-5 pl-4">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={item.actualHours}
                                onChange={(e) => handleHoursChange(item.id, e.target.value)}
                                disabled={item.isDetailMeeting || isAlreadyCheckedOut}
                                className={`w-8 h-7 text-center text-sm font-bold text-primary bg-transparent focus:outline-none border-b focus:border-primary transition-colors disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                  item.isDetailMeeting || isAlreadyCheckedOut ? "border-slate-200 text-slate-400" : "border-slate-350"
                                }`}
                              />
                              <span className="text-primary text-sm pr-1">hr</span>
                              
                              
                              <input
                                type="number"
                                min={0}
                                max={59}
                                value={item.actualMinutes}
                                onChange={(e) => handleMinutesChange(item.id, e.target.value)}
                                disabled={item.isDetailMeeting || isAlreadyCheckedOut}
                                className={`w-8 h-7 text-center text-sm font-bold text-primary bg-transparent focus:outline-none border-b focus:border-primary transition-colors disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                  item.isDetailMeeting || isAlreadyCheckedOut ? "border-slate-200 text-slate-400" : "border-slate-350"
                                }`}
                              />
                              <span className="text-primary text-sm">min</span>
                            </div>
                          </td>

                        </tr>
                      </>
                    );
                  })
                )}
              </tbody>
            </table>

          </div>

        </div>

        {/* RIGHT COLUMN: Summary and Checkout Submission */}
        <div className="lg:col-span-4 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1 shrink-0 pb-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col h-full text-left gap-6">
            
            {/* Top Details Group */}
            <div className="flex flex-col flex-1 min-h-0 gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h2 className="text-base font-bold text-slate-800">Check-out Summary</h2>
                <span className="text-sm text-primary font-bold flex items-center gap-1">
                  <Calendar className="h-5 w-5 " />
                  {format(new Date(), "dd MMM yyyy")}
                </span>
              </div>

               {/* Progress Circular SVG and details in a 50-50 split */}
              <div className="grid grid-cols-2 gap-4 items-center shrink-0">
                {/* Left Half: Centered SVG Ring */}
                <div className="flex items-center justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="fill-slate-50/80"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-100"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-primary transition-all duration-300"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (progressPercent / 100) * 251.2}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-slate-800">{progressPercent}%</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Right Half: Stat Values */}
                <div className="space-y-4 min-w-0">
                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-primary text-sm font-bold tracking-wider w-28 shrink-0">Total Planned</span>
                    <span className="font-extrabold text-slate-800 text-base">{formatMinutesToHours(totalPlannedMinutes)}</span>
                  </div>
                  
                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-primary text-sm font-bold tracking-wider w-28 shrink-0">Total Logged</span>
                    <span className="font-extrabold text-slate-800 text-base">
                      {totalActualMinutes > 0 ? formatMinutesToHours(totalActualMinutes) : "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-primary text-sm font-bold tracking-wider w-28 shrink-0">Total Items</span>
                    <span className="font-extrabold text-slate-800 text-base">{items.length}</span>
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    <span className="text-primary text-sm font-bold tracking-wider w-28 shrink-0">Completed</span>
                    <span className="font-extrabold text-slate-800 text-base">{completedItemsCount}</span>
                  </div>
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
                      disabled={isAlreadyCheckedOut}
                      onClick={() => setRating(num)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold cursor-pointer transition-all ${
                        rating === num
                          ? "bg-primary text-white border-primary shadow-xs scale-105"
                          : isAlreadyCheckedOut
                            ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes (Optional) Section */}
              <div className="space-y-2 pt-2 flex flex-col flex-1 min-h-0">
                <h2 className="text-base font-bold text-slate-800 shrink-0">Notes</h2>
                <textarea
                  placeholder="Write your thoughts for today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isAlreadyCheckedOut}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-h-[140px] bg-slate-50/30 text-slate-800 placeholder:text-slate-400 font-medium resize-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bottom Actions Group */}
            <div className="pt-2 shrink-0">
              <Button
                onClick={handleSubmitCheckout}
                disabled={isSubmitting || isAlreadyCheckedOut}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md border-none cursor-pointer text-base disabled:opacity-50"
              >
                <span>{isAlreadyCheckedOut ? "Checked Out" : isSubmitting ? "Submitting Check-out..." : "Submit Checkout"}</span>
                {!isAlreadyCheckedOut && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

          </div>


        </div>

      </div>

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

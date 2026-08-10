/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { 
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMinutesToHours } from "@/features/utils/formatting.utils";
import useCheckIn from "./useCheckIn";
import useGetGanttItems from "@/features/api/gantt/useGetGanttItems";
import AddEditCheckInModal from "./CheckInFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ConfirmSubmitPlanModal from "./ConfirmSubmitPlanModal";
import SingleCalendarDatePicker from "@/components/shared/FormDateTimePicker/SingleCalendarDatePicker";
import CalendarAddTaskDrawer from "@/pages/DailyPlanning/CalendarAddTaskDrawer";
import MeetingDrawer from "@/pages/companyTask/CompanyTaskFormModal/meetingDrawer";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageNotAccess from "@/pages/PageNoAccess";


export default function CheckIn() {
  const {
    selectedDate,
    setSelectedDate,
    minDate,
    maxDate,
    goToDate,
    shiftDay,
    todayDate,
    items,
    filteredItems,
    isLoading,
    totalItems,
    totalEstimatedTime,
    remainingTime,
    isOvertime,
    isEditWindowExpired,
    isSubmitted,
    permission: activePermission = { View: true, Add: true, Edit: true, Delete: true },
    companyWorkingMinutes,
    isAddModalOpen,
    setIsAddModalOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    handleConfirmDelete,
    isDeleting,
    handleSubmitPlan,
    handleConfirmSubmitPlan,
    isSubmitting,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    isCompanyTimeDefined,
    handleDirectSubmitPlanningItem,
    pendingTasks,
    isLoadingPendingTasks,
  } = useCheckIn();

  const { data: ganttResponse, isLoading: isLoadingGantt } = useGetGanttItems({
    date: selectedDate,
  });
  const ganttItems = ganttResponse?.data || [];

  const navigate = useNavigate();
  const allPermissions = useSelector(getUserPermission);
  const canEditCompanyProfile = allPermissions?.COMPANY_PROFILE?.Edit;

  const [isOpenTaskDrawer, setIsOpenTaskDrawer] = useState(false);
  const [isOpenMeetingDrawer, setIsOpenMeetingDrawer] = useState(false);

  // Accordion open/collapse states
  const [isRepetitiveExpanded, setIsRepetitiveExpanded] = useState(false);
  const [isMeetingsExpanded, setIsMeetingsExpanded] = useState(false);
  const [isExtraExpanded, setIsExtraExpanded] = useState(false);

  const methods = useForm();

  // Grouping items based on planning properties and createdBy source
  const systemPlannedTasks = useMemo(() => {
    return filteredItems.filter(item => item.isPlanned !== false && item.type !== "MEETING" && item.createdBy === "SYSTEM");
  }, [filteredItems]);

  const systemPlannedMeetings = useMemo(() => {
    return filteredItems.filter(item => item.type === "MEETING" && item.createdBy === "SYSTEM");
  }, [filteredItems]);

  const manualPlannedTasks = useMemo(() => {
    return filteredItems.filter(item => item.isPlanned !== false && item.type !== "MEETING" && item.createdBy !== "SYSTEM");
  }, [filteredItems]);

  const manualPlannedMeetings = useMemo(() => {
    return filteredItems.filter(item => item.type === "MEETING" && item.createdBy !== "SYSTEM");
  }, [filteredItems]);

  const manualPlannedItems = useMemo(() => {
    return [...manualPlannedTasks, ...manualPlannedMeetings].sort((a, b) => ((a as any).sequence || 0) - ((b as any).sequence || 0));
  }, [manualPlannedTasks, manualPlannedMeetings]);

  const extraTasks = useMemo(() => {
    return filteredItems.filter(item => item.isPlanned === false);
  }, [filteredItems]);

  const systemEstimatedTime = useMemo(() => {
    return [...systemPlannedTasks, ...systemPlannedMeetings].reduce((acc, item) => acc + (item.estimatedTime || 0), 0);
  }, [systemPlannedTasks, systemPlannedMeetings]);

  const manualEstimatedTime = useMemo(() => {
    return manualPlannedItems.reduce((acc, item) => acc + (item.estimatedTime || 0), 0);
  }, [manualPlannedItems]);

  const isPlanningEditable = useMemo(() => {
    return activePermission?.Edit && !isEditWindowExpired && !isSubmitted && isCompanyTimeDefined;
  }, [activePermission, isEditWindowExpired, isSubmitted, isCompanyTimeDefined]);

  const formatMeetingTime = (item: any) => {
    const dateTime = item.meeting?.meetingDateTime;
    if (!dateTime) return "";
    try {
      const d = new Date(dateTime);
      const startStr = format(d, "hh:mm a");
      
      let endStr = "";
      if (item.meeting?.endDate) {
        endStr = format(new Date(item.meeting.endDate), "hh:mm a");
      } else {
        const endD = new Date(d.getTime() + (item.estimatedTime || 60) * 60000);
        endStr = format(endD, "hh:mm a");
      }
      return `${startStr} - ${endStr}`;
    } catch {
      return "";
    }
  };



  const getDeadlineText = (item: any) => {
    const gant = item.ganttItem || item.gantItem;
    if (gant) {
      try {
        const start = gant.actualStartDate ? format(new Date(gant.actualStartDate), "dd/MM/yyyy") : "";
        const end = gant.actualEndDate ? format(new Date(gant.actualEndDate), "dd/MM/yyyy") : "";
        if (start && end) return `${start} to ${end}`;
        return start || end || "-";
      } catch {
        return "-";
      }
    }
    const rawDate = item.task?.taskDeadline || item.meeting?.meetingDateTime || item.gantItem?.endDate;
    if (!rawDate) return "-";
    try {
      const d = new Date(rawDate);
      return format(d, "dd/MM/yyyy hh:mm a");
    } catch {
      return "-";
    }
  };

  if (activePermission.View === false) {
    return <PageNotAccess />;
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isCompanyTimeDefined) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-slate-50/30 min-h-[400px]">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Working Hours Undefined
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Company has not defined their start time and end time. Please
              provide this information first.
            </p>
          </div>
          {canEditCompanyProfile && (
            <Button onClick={() => navigate("/dashboard/company-profile")}>
              Go to Company Profile
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full flex flex-col px-2 sm:px-3 py-3 overflow-y-auto bg-slate-50/50">
        
        {/* Title Header */}
        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4 px-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Check-in</h1>
          </div>

          {/* Date Selector / Calendar at the top */}
          <div className="flex items-center gap-2">
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

        {/* Header content relocated to columns */}

        {/* Overtime Warning Bar */}
        {/* {isOvertime && (
          <div className="mb-3.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg text-sm text-amber-800 flex items-center gap-2 shadow-2xs">
            <span>
              <strong>Overtime Warning:</strong> Your total planned time exceeds the company's working hours.
            </span>
          </div>
        )} */}

        {/* Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          
          {/* LEFT COLUMN: Planned Content */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-slate-600 text-white border border-slate-700/20 rounded-xl p-3 shadow-xs flex flex-row items-center justify-between gap-3 flex-wrap">
              <h2 className="text-base font-bold text-white shrink-0">My Day</h2>
              
              <div className="flex flex-row items-center gap-3.5 md:gap-5 flex-wrap">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm text-slate-100">
                  
                  <div className="flex items-center gap-1">
                    <span className="text-slate-300">Working:</span>
                    <span className="font-bold text-white">{formatMinutesToHours(companyWorkingMinutes)}</span>
                  </div>
                  <div className="h-3 w-px bg-white/20" />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-300">Planned:</span>
                    <span className="font-bold text-white">{formatMinutesToHours(systemEstimatedTime)}</span>
                  </div>
                </div>

                {/* {isSubmitted && (
                  <div className="flex items-center px-2 py-0.5 bg-emerald-500/20 text-emerald-100 rounded-md border border-emerald-500/30 text-xs font-semibold shadow-2xs shrink-0">
                    <span>Plan Submitted</span>
                  </div>
                )} */}
              </div>
            </div>

            {/* My Day Details Container */}
            <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden divide-y divide-slate-100">
              
              {/* Repetitive Tasks Group */}
              <div>
                <div 
                  className="flex items-center justify-between p-2.5 px-3 bg-slate-100 border-b border-slate-100 text-primary cursor-pointer hover:bg-slate-100/70 transition-colors"
                  onClick={() => setIsRepetitiveExpanded(!isRepetitiveExpanded)}
                >
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-bold text-md text-primary">Repetitive Tasks</span>
                     <span className="text-sm font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {systemPlannedTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                   
                    {isRepetitiveExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
                  </div>
                </div>

                {isRepetitiveExpanded && (
                  <div className="p-2 divide-y divide-slate-100 bg-white">
                    {systemPlannedTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-black">
                        <p className="text-sm font-medium">No tasks planned yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="hidden sm:flex items-center justify-between px-1.5 py-1.5 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 bg-white rounded-t-md">
                          <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">TASK NAME</div>
                            <div className="col-span-2">TYPE</div>
                            <div className="col-span-4">DEADLINE</div>
                          </div>
                          <div className="w-36 shrink-0 text-right pr-2">EST. TIME</div>
                        </div>
                        {systemPlannedTasks.map((item) => {
                          const displayTitle = item.title || item.task?.taskName || (item as any).ganttItem?.itemName || item.gantItem?.itemName || "-";
                          const isRepetitiveType = displayTitle.toLowerCase().match(/(stand-up|sync|email|daily|update)/);
                          const isItemEditable = item.createdBy !== "SYSTEM";
                          const deadline = getDeadlineText(item);
                          return (
                            <div key={item.planItemId} className="group flex items-center justify-between py-2 px-1.5 hover:bg-slate-50/80 rounded-md transition-colors">
                              <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6 min-w-0">
                                  <p className="text-sm font-normal text-black truncate" title={displayTitle}>
                                    {displayTitle}
                                  </p>
                                </div>
                                <div className="col-span-2 text-sm font-normal text-black">
                                  {item.type === "GANTT" ? "Gantt" : isRepetitiveType ? "Repetitive" : "Normal"}
                                </div>
                                <div className="col-span-4 text-sm text-black truncate" title={deadline}>
                                  <span className="font-medium text-slate-400 mr-1 sm:hidden">DEADLINE:</span>
                                  {deadline}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3 w-36 justify-end">
                                <span className="text-sm font-normal text-black bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                                  {formatMinutesToHours(item.estimatedTime || 0)}
                                </span>
                                {isPlanningEditable && isItemEditable && (
                                  <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                      onClick={() => setEditingItem(item)}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                      onClick={() => setDeletingItem(item)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Meetings Group */}
              <div>
                <div 
                  className="flex items-center justify-between p-2.5 px-3 bg-slate-50 border-b border-slate-100 text-primary cursor-pointer hover:bg-slate-100/70 transition-colors"
                  onClick={() => setIsMeetingsExpanded(!isMeetingsExpanded)}
                >
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-bold text-md text-primary">Meetings</span>
                    <span className="text-sm font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {systemPlannedMeetings.length} 
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    
                    {isMeetingsExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
                  </div>
                </div>

                {isMeetingsExpanded && (
                  <div className="p-2 divide-y divide-slate-100 bg-white">
                    {systemPlannedMeetings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-black">
                        <p className="text-sm font-medium">No meetings planned yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="hidden sm:flex items-center justify-between px-1.5 py-1.5 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 bg-white rounded-t-md">
                          <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">MEETING NAME</div>
                            <div className="col-span-2">TYPE</div>
                            <div className="col-span-4">MEETING TIME</div>
                          </div>
                          <div className="w-36 shrink-0 text-right pr-2">EST. TIME</div>
                        </div>
                        {systemPlannedMeetings.map((item) => {
                          const displayTitle = item.title || item.meeting?.meetingName || "-";
                          const timeStr = formatMeetingTime(item);
                          const isItemEditable = item.createdBy !== "SYSTEM";
                          const deadline = getDeadlineText(item);
                          return (
                            <div key={item.planItemId} className="group flex items-center justify-between py-2 px-1.5 hover:bg-slate-50/80 rounded-md transition-colors">
                              <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6 min-w-0">
                                  <p className="text-sm font-normal text-black truncate" title={displayTitle}>
                                    {displayTitle}
                                  </p>
                                </div>
                                <div className="col-span-2 text-sm font-normal text-black">
                                  Meeting
                                </div>
                                <div className="col-span-4 text-sm text-black truncate" title={timeStr || deadline}>
                                  <span className="font-medium text-black mr-1 sm:hidden">MEETING TIME:</span>
                                  {timeStr || deadline}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3 w-36 justify-end">
                                <span className="text-sm font-normal text-black bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                                  {formatMinutesToHours(item.estimatedTime || 0)}
                                </span>
                                {isPlanningEditable && isItemEditable && (
                                  <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                      onClick={() => setEditingItem(item)}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                      onClick={() => setDeletingItem(item)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-600 text-white border border-slate-700/20 rounded-xl p-3 shadow-xs flex flex-row items-center justify-between gap-3 flex-wrap">
              <h2 className="text-base font-bold text-white shrink-0">My Plan Today</h2>
              
              <div className="flex flex-row items-center gap-3.5 md:gap-5 flex-wrap">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm text-slate-100">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-300">Planned:</span>
                    <span className="font-bold text-white">{formatMinutesToHours(manualEstimatedTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* My Plan Today Details Container */}
            <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden divide-y divide-slate-100">
              
              {/* Manual Planned Tasks Group */}
              <div>
                <div className="flex items-center justify-between p-2.5 px-3 bg-slate-50 border-b border-slate-100 text-primary">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-bold text-md text-primary">Planned Tasks</span>
                    <span className="text-sm font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {manualPlannedItems.length}
                    </span>
                  </div>
                </div>

                <div className="p-2 divide-y divide-slate-100 bg-white">
                  {manualPlannedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-black">
                      <p className="text-sm font-medium">No tasks planned yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden sm:flex items-center justify-between px-1.5 py-1.5 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 bg-white rounded-t-md">
                        <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">ITEM NAME</div>
                          <div className="col-span-2">TYPE</div>
                          <div className="col-span-4">DEADLINE / TIME</div>
                        </div>
                        <div className="w-36 shrink-0 text-right pr-2">EST. TIME</div>
                      </div>
                      {manualPlannedItems.map((item) => {
                        const displayTitle = item.title || item.task?.taskName || item.meeting?.meetingName || (item as any).ganttItem?.itemName || item.gantItem?.itemName || "-";
                        const isGantt = item.type === "GANTT" || Boolean(item.ganttItemId);
                        const isMeeting = item.type === "MEETING";
                        const deadline = getDeadlineText(item);
                        const timeStr = isMeeting ? formatMeetingTime(item) : "";
                        return (
                          <div key={item.planItemId} className="group flex items-center justify-between py-2 px-1.5 hover:bg-slate-50/80 rounded-md transition-colors">
                            <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-6 min-w-0">
                                <p className="text-sm font-normal text-black truncate" title={displayTitle}>
                                  {displayTitle}
                                </p>
                              </div>
                              <div className="col-span-2 text-sm font-normal text-black">
                                {isGantt ? "Gantt" : isMeeting ? "Meeting" : "Normal"}
                              </div>
                              <div className="col-span-4 text-sm text-black truncate" title={timeStr || deadline}>
                                <span className="font-medium text-slate-400 mr-1 sm:hidden">
                                  {isMeeting ? "MEETING TIME:" : "DEADLINE:"}
                                </span>
                                {timeStr || deadline}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3 w-36 justify-end">
                              <span className="text-sm font-normal text-black bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                                {formatMinutesToHours(item.estimatedTime || 0)}
                              </span>
                              {isPlanningEditable && (
                                <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!isMeeting && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                      onClick={() => setEditingItem(item)}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                    onClick={() => setDeletingItem(item)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* Extra Tasks Group */}
              {extraTasks.length > 0 && (
                <div>
                  <div 
                    className="flex items-center justify-between p-2.5 px-3 bg-slate-50 border-b border-slate-100 text-primary cursor-pointer hover:bg-slate-100/70 transition-colors"
                    onClick={() => setIsExtraExpanded(!isExtraExpanded)}
                  >
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="font-bold text-sm text-primary">Extra Tasks</span>
                      </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {extraTasks.length} Tasks
                      </span>
                      {isExtraExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
                    </div>
                  </div>

                  {isExtraExpanded && (
                    <div className="p-2 divide-y divide-slate-100 bg-white">
                      {extraTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                          <p className="text-sm font-medium">No extra tasks planned</p>
                        </div>
                      ) : (
                        <>
                          <div className="hidden sm:flex items-center justify-between px-1.5 py-1.5 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 bg-white rounded-t-md">
                            <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-6">TASK NAME</div>
                              <div className="col-span-2">TYPE</div>
                              <div className="col-span-4">DEADLINE</div>
                            </div>
                          </div>
                          {extraTasks.map((item) => {
                            const displayTitle = item.title || item.task?.taskName || (item as any).ganttItem?.itemName || item.gantItem?.itemName || "-";
                            const deadline = getDeadlineText(item);
                            return (
                              <div key={item.planItemId} className="group flex items-center justify-between py-2 px-1.5 hover:bg-slate-50/80 rounded-md transition-colors">
                                <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-6 min-w-0">
                                    <p className="text-sm font-normal text-black truncate" title={displayTitle}>
                                      {displayTitle}
                                    </p>
                                  </div>
                                  <div className="col-span-2 text-sm font-normal text-black">
                                    {item.type === "GANTT" ? "Gantt Task" : " Task"}
                                  </div>
                                 <div className="col-span-4 text-sm text-black truncate" title={deadline}>
                                   <span className="font-medium text-slate-400 mr-1 sm:hidden">DEADLINE:</span>
                                   {deadline}
                                 </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Planning Summary Container */}
            <div className="sticky bottom-0 z-20 space-y-3 bg-slate-50/95 backdrop-blur-xs py-2.5 border-t border-slate-200/50">
              {/* Planning Summary Stats Card */}
              <div className="bg-primary text-white border border-primary/20 rounded-xl p-3 shadow-xs flex flex-row items-center justify-between gap-3 flex-wrap">
               <div className="flex items-center gap-2">
                <h2 className="text-lg  text-white shrink-0">Planning Summary</h2>
                <span className="rounded-full bg-white font-bold items-center text-primary px-2 py-1 text-sm">{totalItems}</span>
                </div>
                <div className="flex flex-row items-center gap-3.5 md:gap-5 flex-wrap">
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm text-slate-100">
                   
                    <div className="flex items-center gap-1">
                      <span className="text-slate-300">Planned Hours:</span>
                      <span className="font-bold text-lg text-white">{formatMinutesToHours(totalEstimatedTime)}</span>
                    </div>
                  </div>

                  {activePermission?.Add && isPlanningEditable && !isSubmitted && (
                    <Button
                      onClick={handleSubmitPlan}
                      disabled={totalItems === 0 || isSubmitting}
                      className="py-1 px-4 h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs border-none cursor-pointer rounded-md text-sm font-semibold disabled:opacity-50"
                    >
                      Submit Plan
                    </Button>
                  )}
                </div>
              </div>

              {/* Planning Summary Details Panel */}
              <div className={`rounded-lg p-2.5 px-3 flex items-center gap-2 text-sm text-left border ${
                isOvertime 
                  ? 'bg-rose-50/40 border-rose-100 text-rose-800' 
                  : 'bg-emerald-50/30 border-emerald-100 text-emerald-800'
              }`}>
                {isOvertime ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Overtime warning:</strong> Planned time exceeds working hours by {formatMinutesToHours(totalEstimatedTime - companyWorkingMinutes)}.
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="leading-relaxed">
                        <strong>Perfect fit:</strong> Planned schedule is within working hours. Remaining: {formatMinutesToHours(remainingTime)}.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Suggestive list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pending Tasks Panel */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-indigo-50/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Pending Tasks</h3>
                </div>
                <span className="text-sm font-semibold px-2 py-0.5 bg-indigo-50 text-primary rounded">
                  {pendingTasks.length} Tasks
                </span>
              </div>
              
              <div className="p-2 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {isLoadingPendingTasks ? (
                  <p className="text-sm text-slate-400 text-center py-4">Loading pending tasks...</p>
                ) : pendingTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No pending tasks</p>
                ) : (
                  pendingTasks.map((task: any) => (
                    <div key={task.taskId} className="flex items-center justify-between py-2 px-1 hover:bg-slate-50/50 rounded-md transition-colors">
                      <span className="text-sm font-normal leading-normal pr-3 flex-1 min-w-0" title={task.taskName}>
                        {task.taskName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 text-primary hover:bg-primary hover:text-white border-primary/20 hover:border-primary shrink-0 cursor-pointer disabled:opacity-30 rounded-md"
                          disabled={!isPlanningEditable}
                          onClick={() => setEditingItem({
                            type: "TASK",
                            title: task.taskName,
                            taskId: task.taskId,
                            task: {
                              taskId: task.taskId,
                              taskName: task.taskName
                            }
                          } as any)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gantt Tasks Panel */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-purple-50/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Gantt Tasks</h3>
                </div>
                <span className="text-sm font-semibold px-2 py-0.5 bg-purple-50 text-primary rounded">
                  {ganttItems.length} Tasks
                </span>
              </div>
              
              <div className="p-2 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {isLoadingGantt ? (
                  <p className="text-sm text-slate-400 text-center py-4">Loading Gantt tasks...</p>
                ) : ganttItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center  py-4">No Gantt tasks for today</p>
                ) : (
                  ganttItems.map((task: any) => (
                    <div key={task.ganttItemId} className="flex items-center justify-between py-2 px-1 hover:bg-slate-50/50 rounded-md transition-colors">
                      <span className="text-sm font-normal text-slate-700 leading-normal pr-3 flex-1 min-w-0" title={task.itemName}>
                        {task.itemName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 text-primary hover:bg-primary hover:text-white border-primary/20 hover:border-primary shrink-0 cursor-pointer disabled:opacity-30 rounded-md"
                          disabled={!isPlanningEditable || items.some((i) => i.ganttItemId === task.ganttItemId)}
                          onClick={() => setEditingItem({
                            type: "GANTT",
                            title: task.itemName,
                            ganttItemId: task.ganttItemId,
                            gantItem: {
                              ganttItemId: task.ganttItemId,
                              itemName: task.itemName
                            }
                          } as any)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddEditCheckInModal
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            date={selectedDate}
            onAddTaskClick={() => {
              setIsAddModalOpen(false);
              setIsOpenTaskDrawer(true);
            }}
            onAddMeetingClick={() => {
              setIsAddModalOpen(false);
              setIsOpenMeetingDrawer(true);
            }}
            items={items}
            companyWorkingMinutes={companyWorkingMinutes}
          />
        )}

        {/* Edit Modal */}
        {Boolean(editingItem) && (
          <AddEditCheckInModal
            open={Boolean(editingItem)}
            onOpenChange={(open) => !open && setEditingItem(null)}
            initialItem={editingItem}
            date={selectedDate}
            onAddTaskClick={() => {
              setEditingItem(null);
              setIsOpenTaskDrawer(true);
            }}
            onAddMeetingClick={() => {
              setEditingItem(null);
              setIsOpenMeetingDrawer(true);
            }}
            items={items}
            companyWorkingMinutes={companyWorkingMinutes}
          />
        )}

        {/* Delete Confirmation Modal */}
        {Boolean(deletingItem) && (
          <ConfirmDeleteModal
            open={Boolean(deletingItem)}
            onOpenChange={(open) => !open && setDeletingItem(null)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
          />
        )}

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <ConfirmSubmitPlanModal
            open={isSubmitModalOpen}
            onOpenChange={setIsSubmitModalOpen}
            onConfirm={handleConfirmSubmitPlan}
            isLoading={isSubmitting}
            isOvertime={isOvertime}
            plannedMinutes={totalEstimatedTime}
            remainingMinutes={remainingTime}
          />
        )}

        {/* Add Task Drawer */}
        {isOpenTaskDrawer && (
          <CalendarAddTaskDrawer
            open={isOpenTaskDrawer}
            onClose={() => {
              setIsOpenTaskDrawer(false);
              setIsAddModalOpen(true);
            }}
            isPlanningMode={true}
            hideProjectMeetingAdd={true}
            onPlanningSubmit={async (payload) => {
              setIsOpenTaskDrawer(false);
              await handleDirectSubmitPlanningItem({
                taskId: payload.taskId,
                estimatedTime: payload.estimatedTime,
                remarks: payload.remarks,
                title: payload.title,
              });
            }}
          />
        )}

        {/* Add Meeting Drawer */}
        {isOpenMeetingDrawer && (
          <MeetingDrawer
            open={isOpenMeetingDrawer}
            onClose={() => {
              setIsOpenMeetingDrawer(false);
              setIsAddModalOpen(true);
            }}
            isPlanningMode={true}
            onPlanningSubmit={async (payload) => {
              setIsOpenMeetingDrawer(false);
              await handleDirectSubmitPlanningItem({
                meetingId: payload.meetingId,
                estimatedTime: payload.estimatedTime,
                remarks: payload.remarks,
                title: payload.title,
              });
            }}
          />
        )}

      </div>
    </FormProvider>
  );
}

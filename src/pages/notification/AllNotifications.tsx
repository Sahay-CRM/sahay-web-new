import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { notificationMutation } from "@/features/api/Notification";
import useGetUserNotification from "@/features/layouts/DashboardLayout/useGetUserNotification";
import { 
  Bell, 
  ChevronRight, 
  MailOpen, 
  CheckSquare, 
  Video, 
  TrendingUp, 
  Folder, 
  Check, 
  Inbox,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AppNotification {
  notificationId?: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
  isRead?: boolean;
  notifiedTime?: string;
}

type TabType = "all" | "unread" | "task" | "meeting" | "kpi" | "kpiDashboard" | "project";

const AllNotifications = () => {
  const { data: notifications, refetch } = useGetUserNotification();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { mutate: updateNotification } = notificationMutation();

  useEffect(() => {
    setBreadcrumbs([{ label: "Notifications", href: "" }]);
  }, [setBreadcrumbs]);

  const unreadCount = useMemo(() => {
    return notifications?.data?.filter((n) => !n.isRead).length || 0;
  }, [notifications]);

  const counts = useMemo(() => {
    const list = notifications?.data || [];
    return {
      all: list.length,
      unread: list.filter((n) => !n.isRead).length,
      task: list.filter((n) => n.data?.type?.toUpperCase() === "TASK").length,
      meeting: list.filter((n) => n.data?.type?.toUpperCase() === "MEETING").length,
      kpi: list.filter((n) => n.data?.type?.toUpperCase() === "KPI").length,
      kpiDashboard: list.filter((n) => n.data?.type?.toUpperCase() === "KPIDASHBOARD").length,
      project: list.filter((n) => n.data?.type?.toUpperCase() === "PROJECT").length,
    };
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications?.data
      ?.filter((n) => !n.isRead)
      .map((n) => n.notificationId)
      .filter((id): id is string => !!id);

    if (unreadIds && unreadIds.length > 0) {
      updateNotification(unreadIds, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleView = (
    type?: string,
    typeId?: string,
    notificationId?: string,
    frequencyType?: string,
  ) => {
    const navigateTo = () => {
      if (!typeId) return;
      const upperType = type?.toUpperCase();
      if (upperType === "TASK") {
        navigate(`/dashboard/tasks/view/${typeId}`);
      } else if (upperType === "PROJECT") {
        navigate(`/dashboard/projects/view/${typeId}`);
      } else if (upperType === "MEETING") {
        navigate(`/dashboard/meeting/detail/${typeId}`);
      } else if (upperType === "KPI" || upperType === "KPIDASHBOARD") {
        const query = frequencyType ? `?selectedType=${frequencyType.toUpperCase()}` : "";
        navigate(`/dashboard/kpi-dashboard${query}`);
      }
    };

    if (notificationId) {
      updateNotification([notificationId], {
        onSuccess: () => {
          navigateTo();
          refetch();
        },
        onError: () => {
          navigateTo();
        },
      });
    } else {
      navigateTo();
    }
  };

  const filteredNotifications = useMemo(() => {
    const list = notifications?.data || [];
    switch (activeTab) {
      case "unread":
        return list.filter((n) => !n.isRead);
      case "task":
        return list.filter((n) => n.data?.type?.toUpperCase() === "TASK");
      case "meeting":
        return list.filter((n) => n.data?.type?.toUpperCase() === "MEETING");
      case "kpi":
        return list.filter((n) => n.data?.type?.toUpperCase() === "KPI");
      case "kpiDashboard":
        return list.filter((n) => n.data?.type?.toUpperCase() === "KPIDASHBOARD");
      case "project":
        return list.filter((n) => n.data?.type?.toUpperCase() === "PROJECT");
      case "all":
      default:
        return list;
    }
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    const sorted = [...filteredNotifications].sort((a, b) => {
      const dateA = new Date(a.data?.notifiedTime || a.notifiedTime || 0);
      const dateB = new Date(b.data?.notifiedTime || b.notifiedTime || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const groups: { [key: string]: AppNotification[] } = {};

    sorted.forEach((n) => {
      const timeStr = n.data?.notifiedTime || n.notifiedTime;
      if (!timeStr) return;
      const date = new Date(timeStr);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(n);
    });

    return Object.keys(groups).map((dateKey) => {
      const [year, month, day] = dateKey.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      let label = "";
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = format(date, "dd MMMM yyyy");
      }
      return {
        dateKey,
        dateLabel: label,
        notifications: groups[dateKey],
      };
    });
  }, [filteredNotifications]);

  const getTypeConfig = (type?: string) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case "TASK":
        return {
          icon: CheckSquare,
          iconClass: "text-blue-500 bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50",
          badgeClass: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
          label: "Task",
        };
      case "MEETING":
        return {
          icon: Video,
          iconClass: "text-amber-500 bg-amber-50 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50",
          badgeClass: "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
          label: "Meeting",
        };
      case "KPI":
        return {
          icon: TrendingUp,
          iconClass: "text-emerald-500 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
          badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
          label: "KPI",
        };
      case "KPIDASHBOARD":
        return {
          icon: TrendingUp,
          iconClass: "text-emerald-500 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
          badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
          label: "KPI Dashboard",
        };
      case "PROJECT":
        return {
          icon: Folder,
          iconClass: "text-purple-500 bg-purple-50 border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/50",
          badgeClass: "bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50",
          label: "Project",
        };
      default:
        return {
          icon: Bell,
          iconClass: "text-gray-400 bg-gray-50 border border-gray-100 dark:bg-gray-950/30 dark:border-gray-900/50",
          badgeClass: "bg-gray-50 text-gray-600 border border-gray-100 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900/50",
          label: "Alert",
        };
    }
  };

  const filterTabs: { id: TabType; label: string; icon: typeof Inbox }[] = [
    { id: "all", label: "All Notifications", icon: Inbox },
    { id: "unread", label: "Unread", icon: Bell },
    { id: "task", label: "Tasks", icon: CheckSquare },
    { id: "meeting", label: "Meetings", icon: Video },
    { id: "kpi", label: "KPIs", icon: TrendingUp },
    { id: "kpiDashboard", label: "KPI Dashboard", icon: TrendingUp },
    { id: "project", label: "Projects", icon: Folder },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with your daily tasks, KPIs, projects, and meetings.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5 transition-all shadow-sm rounded-lg"
          >
            <MailOpen className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Category Pills at the Top */}
      <div className="bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm mb-6 flex overflow-x-auto gap-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts[tab.id as keyof typeof counts];
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-gray-400")} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-bold rounded-full shrink-0",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Unified Daily Stacks */}
      <div className="space-y-8">
        {groupedNotifications.length > 0 ? (
          groupedNotifications.map((group) => {
            return (
              <div key={group.dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {group.dateLabel}
                  </h3>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {group.notifications.length} {group.notifications.length === 1 ? 'notification' : 'notifications'}
                  </span>
                </div>

                {/* Unified Card Container for this date group */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
                  {group.notifications.map((notification, index) => {
                    const typeConfig = getTypeConfig(notification.data?.type);
                    const TypeIcon = typeConfig.icon;
                    const timeStr = notification?.data?.notifiedTime || notification?.notifiedTime;
                    const timeFormatted = timeStr ? format(new Date(timeStr), "hh:mm a") : "";

                    return (
                      <div
                        key={notification.notificationId || index}
                        onClick={() =>
                          handleView(
                            notification.data?.type,
                            notification.data?.typeId,
                            notification.notificationId || "",
                            notification.data?.frequencyType,
                          )
                        }
                        className={cn(
                          "group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 transition-all duration-200 cursor-pointer",
                          !notification.isRead
                            ? "bg-primary/[0.015] hover:bg-primary/[0.03]"
                            : "bg-white hover:bg-gray-50/50"
                        )}
                      >
                        {/* Unread Left Border/Highlight Indicator */}
                        {!notification.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                        )}

                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Icon Badge */}
                          <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105", typeConfig.iconClass)}>
                            <TypeIcon className="w-5 h-5" />
                          </div>

                          {/* Text Contents */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <h4 className={cn(
                                "font-bold text-base leading-snug tracking-tight text-gray-900 group-hover:text-primary transition-colors",
                                !notification.isRead ? "text-gray-900" : "text-gray-700"
                              )}>
                                {notification.title}
                              </h4>
                            </div>
                            <p className={cn(
                              "text-sm leading-relaxed whitespace-pre-line",
                              !notification.isRead ? "text-gray-600 font-medium" : "text-gray-500"
                            )}>
                              {notification.body}
                            </p>
                          </div>
                        </div>

                        {/* Right Details, Badges and Actions */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 self-stretch md:self-auto border-t border-gray-50 md:border-none pt-3 md:pt-0">
                          {/* Time tag */}
                          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap bg-gray-50/50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                            {timeFormatted}
                          </span>

                          <div className="flex items-center gap-3">
                            {/* Inline Mark as Read (only if unread) */}
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.notificationId) {
                                    updateNotification([notification.notificationId], {
                                      onSuccess: () => refetch(),
                                    });
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm hover:scale-105 border border-gray-200/80 bg-white"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {notification.data?.type && (
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm",
                                typeConfig.badgeClass
                              )}>
                                {typeConfig.label}
                              </span>
                            )}

                            <div className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200">
                              <ChevronRight className="w-4 h-4 shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/10">
              <Bell className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No notifications found
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              {activeTab === "all"
                ? "We'll notify you when something new arrives!"
                : `You have no notifications in the ${activeTab} category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotifications;

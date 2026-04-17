import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { notificationMutation } from "@/features/api/Notification";
import useGetUserNotification from "@/features/layouts/DashboardLayout/useGetUserNotification";
import { Bell, ChevronRight, MailOpen } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AllNotifications = () => {
  const { data: notifications, refetch } = useGetUserNotification();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const { mutate: updateNotification } = notificationMutation();

  useEffect(() => {
    setBreadcrumbs([{ label: "Notifications", href: "" }]);
  }, [setBreadcrumbs]);

  const unreadCount = useMemo(() => {
    return notifications?.data?.filter((n) => !n.isRead).length || 0;
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
  ) => {
    if (!typeId) return;

    const navigateTo = () => {
      const upperType = type?.toUpperCase();
      if (upperType === "TASK") {
        navigate(`/dashboard/tasks/view/${typeId}`);
      } else if (upperType === "PROJECT") {
        navigate(`/dashboard/projects/view/${typeId}`);
      } else if (upperType === "MEETING") {
        navigate(`/dashboard/meeting/detail/${typeId}`);
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

  return (
    <div className="mx-auto p-4 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex gap-6 items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            All Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 text-sm">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5 transition-all"
          >
            <MailOpen className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications?.data && notifications?.data?.length > 0 ? (
          notifications.data.map((notification, index) => (
            <div
              key={notification.notificationId || index}
              onClick={() =>
                handleView(
                  notification.data?.type,
                  notification.data?.typeId,
                  notification.notificationId || "",
                )
              }
              className={cn(
                "group relative bg-white rounded-xl border p-2 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/20",
                !notification.isRead
                  ? "border-l-4 border-l-primary bg-primary/[0.02]"
                  : "bg-white text-gray-600 border-gray-300",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex gap-4 w-full">
                  <div className="w-full">
                    <h3
                      className={cn(
                        "font-semibold text-base leading-tight break-all",
                        !notification.isRead
                          ? "text-gray-900"
                          : "text-gray-600",
                      )}
                    >
                      {notification.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm break-all line-clamp-2 leading-relaxed",
                        !notification.isRead
                          ? "text-gray-700"
                          : "text-gray-500",
                      )}
                    >
                      {notification.body}
                    </p>
                  </div>

                  <div className="flex flex-col w-56 items-end">
                    <span className="text-[11px] leading-0 font-medium pt-2 mb-4 text-black whitespace-nowrap bg-gray-50 rounded-full">
                      {notification?.data?.notifiedTime ||
                      notification?.notifiedTime
                        ? format(
                            new Date(
                              notification.data?.notifiedTime ||
                                notification.notifiedTime!,
                            ),
                            "dd MMM, hh:mm a",
                          )
                        : ""}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(
                            notification.data?.type,
                            notification.data?.typeId,
                            notification.notificationId || "",
                          );
                        }}
                      >
                        View Details
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {notification.data?.type && (
                        <span className="inline-flex items-center px-2 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                          {notification.data.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Your inbox is empty
            </h3>
            <p className="text-gray-500 text-sm">
              We'll notify you when something new arrives!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotifications;

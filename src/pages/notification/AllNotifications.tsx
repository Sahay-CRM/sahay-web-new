// import { useSelector } from "react-redux";
// import { selectNotifications } from "@/features/reducers/notification.reducer";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { notificationMutation } from "@/features/api/Notification";
import useGetUserNotification from "@/features/layouts/DashboardLayout/useGetUserNotification";

const AllNotifications = () => {
  // const notifications = useSelector(selectNotifications);
  const { data: notifications } = useGetUserNotification();

  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const { mutate: updateNotification } = notificationMutation();

  useEffect(() => {
    setBreadcrumbs([{ label: "Notifications", href: "" }]);
  }, [setBreadcrumbs]);

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
        },
        onError: () => {
          // Navigate anyway if update fails? maybe better to just navigate
          navigateTo();
        },
      });
    } else {
      navigateTo();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
      {notifications?.data && notifications?.data?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Notification Details</th>
                <th className="py-2 px-4 border-b">Date Time</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications?.data?.map((notification, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    notification?.isRead
                      ? "bg-gray-100/50 border-white text-gray-500"
                      : "bg-white"
                  }`}
                  onClick={() =>
                    handleView(
                      notification.data?.type,
                      notification.data?.typeId,
                      notification.notificationId || "",
                    )
                  }
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-semibold ${notification?.isRead ? "text-gray-600" : "text-gray-900"}`}
                      >
                        {notification?.title}
                      </span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        {notification?.body}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {notification?.data?.notifiedTime ||
                    notification?.notifiedTime
                      ? new Date(
                          notification.data?.notifiedTime ||
                            notification.notifiedTime!,
                        ).toLocaleString()
                      : ""}
                  </td>
                  <td className="py-3 px-4">
                    {notification?.data?.type && notification?.data?.typeId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(
                            notification.data?.type,
                            notification.data?.typeId,
                            notification.notificationId || "",
                          );
                        }}
                      >
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-600">No notifications</p>
      )}
    </div>
  );
};

export default AllNotifications;

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
    if (notificationId) {
      updateNotification([notificationId], {
        onSuccess: () => {
          if (type === "TASK" && typeId) {
            navigate(`/dashboard/tasks/view/${typeId}`);
          } else if (type === "PROJECT" && typeId) {
            navigate(`/dashboard/projects/view/${typeId}`);
          } else if (type === "MEETING" && typeId) {
            navigate(`/dashboard/meeting/detail/${typeId}`);
          }
        },
      });
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
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Body</th>
                <th className="py-2 px-4 border-b">Date Time</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications?.data?.map((notification, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 ${
                    notification?.isRead
                      ? "bg-gray-200 border-white"
                      : "bg-white"
                  }`}
                >
                  <td className="py-2 px-4">{notification?.title}</td>
                  <td className="py-2 px-4">{notification?.body}</td>
                  <td className="py-2 px-4">
                    {notification?.data?.notifiedTime
                      ? (() => {
                          const date = new Date(notification.data.notifiedTime);
                          return date.toLocaleString();
                        })()
                      : ""}
                  </td>
                  <td className="py-2 px-4">
                    {notification?.data?.type && notification?.data?.typeId && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleView(
                            notification.data?.type,
                            notification.data?.typeId,
                            notification.notificationId || "",
                          )
                        }
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

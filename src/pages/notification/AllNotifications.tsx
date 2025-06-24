import { useSelector } from "react-redux";
import { selectNotifications } from "@/features/reducers/notification.reducer";

const AllNotifications = () => {
  const notifications = useSelector(selectNotifications);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} className="border-b last:border-b-0 py-2">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">No notifications</p>
      )}
    </div>
  );
};

export default AllNotifications;

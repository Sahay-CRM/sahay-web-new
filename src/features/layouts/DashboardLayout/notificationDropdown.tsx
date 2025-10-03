import { Button } from "@/components/ui/button";

interface NotificationDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  notifications: AppNotification[];
  onMarkAsRead: (notification: AppNotification) => void;
  onAllRead: () => void;
  onViewAll: () => void;
}

const NotificationDropdown = ({
  dropdownRef,
  notifications,
  onMarkAsRead,
  onAllRead,
  onViewAll,
}: NotificationDropdownProps) => {
  return (
    <div>
      <div
        ref={dropdownRef!}
        className="fixed inset-0 z-40"
        onClick={onViewAll}
      />
      <div
        ref={dropdownRef}
        className="absolute right-0 top-12 bg-white shadow-2xl border rounded-lg p-4 w-[400px] z-50"
      >
        {notifications.length > 0 ? (
          <>
            <ul className="h-80 overflow-scroll">
              {notifications.slice(0, 5).map((notification, index) => (
                <li
                  key={notification.notificationId ?? index}
                  className={`border py-1 mb-1 last:mb-0 rounded-md px-2 ${
                    notification.isRead ? "bg-gray-200" : "bg-white"
                  } cursor-pointer hover:bg-gray-300 transition`}
                  onClick={() => onMarkAsRead(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div>
                        <span className="font-semibold text-sm">
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-[13px] mt-1 text-gray-600">
                        {(() => {
                          const words = notification.body?.split(" ") || [];
                          if (words.length > 8) {
                            return words.slice(0, 8).join(" ") + " [...]";
                          }
                          return notification.body;
                        })()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between w-full mt-2 border-t">
              <Button variant="link" onClick={onViewAll}>
                View All Notifications
              </Button>
              <Button variant="link" onClick={onAllRead}>
                Mark all as Read
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">No new notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

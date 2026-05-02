interface AppNotification {
  notificationId?: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
  isRead?: boolean;
  notifiedTime?: string;
}

interface NotificationState {
  notifications: AppNotification[];
}

interface AppNotification {
  notificationId?: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
  isRead?: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
}

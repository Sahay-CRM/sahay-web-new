import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken as firebaseDeleteToken,
} from "firebase/messaging";
import { addNotification } from "./features/reducers/notification.reducer";
import store from "./features/store";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyApKwRS0eZK2Dkjwb7gTpbuLvQ5Yf2EzT4",
  authDomain: "sahay-dev-4c5ba.firebaseapp.com",
  projectId: "sahay-dev-4c5ba",
  storageBucket: "sahay-dev-4c5ba.firebasestorage.app",
  messagingSenderId: "186510074634",
  appId: "1:186510074634:web:f1000c0ed66bbce33dd0f3",
  // measurementId:
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const isMessagingSupported = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  window.isSecureContext;

export const messaging = isMessagingSupported() ? getMessaging(app) : undefined;

// Request permission and get token
export const requestFirebaseNotificationPermission = async () => {
  if (!isMessagingSupported() || !messaging) return null;
  const token = await getToken(messaging, {
    vapidKey:
      "BJpCqAZmB7SKd965C9duzsmn8w9ubGMFsKlhe5oQgDk9EDXHKbn243LkjKEFIc771lNoQ4_hmhMqXJS8w2-UEoQ",
  });
  return token;
};

// Delete FCM token
export const deleteFirebaseToken = async () => {
  if (!isMessagingSupported() || !messaging) return;
  await firebaseDeleteToken(messaging);
};

// Listen for foreground messages
export const onFirebaseMessageListener = () => {
  if (!isMessagingSupported() || !messaging) return;
  onMessage(messaging, (payload) => {
    const { data } = payload;
    const notification = payload.notification;
    const title = notification?.title;
    const body = notification?.body;

    store.dispatch(
      addNotification({ title: title || "", body: body || "", data }),
    );
    import("sonner").then(({ toast }) => {
      toast.success(title || "You have a new notification!", {
        description: body,
      });
    });
  });
};

export const database = getDatabase(app);

// Replace the below config with your Firebase project config from the Firebase Console
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken as firebaseDeleteToken,
} from "firebase/messaging";
import { addNotification } from "./features/reducers/notification.reducer";
import store from "./features/store";

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
export const messaging = getMessaging(app);

// Request permission and get token
export const requestFirebaseNotificationPermission = async () => {
  // Always get a fresh token
  const token = await getToken(messaging, {
    vapidKey:
      "BJpCqAZmB7SKd965C9duzsmn8w9ubGMFsKlhe5oQgDk9EDXHKbn243LkjKEFIc771lNoQ4_hmhMqXJS8w2-UEoQ",
  });

  return token;
};

// Delete FCM token
export const deleteFirebaseToken = async () => {
  await firebaseDeleteToken(messaging);
};

// Listen for foreground messages
export const onFirebaseMessageListener = () => {
  onMessage(messaging, (payload) => {
    const { data } = payload;
    const title = data?.title;
    const body = data?.body;
    store.dispatch(addNotification({ title, body, data }));
    import("sonner").then(({ toast }) => {
      toast.success(body || "You have a new notification!", {
        description: title,
      });
    });
  });
};

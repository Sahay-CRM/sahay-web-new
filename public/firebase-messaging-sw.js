importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyApKwRS0eZK2Dkjwb7gTpbuLvQ5Yf2EzT4",
  authDomain: "sahay-dev-4c5ba.firebaseapp.com",
  projectId: "sahay-dev-4c5ba",
  storageBucket: "sahay-dev-4c5ba.firebasestorage.app",
  messagingSenderId: "186510074634",
  appId: "1:186510074634:web:f1000c0ed66bbce33dd0f3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png", // update with your icon path if needed
  });
});

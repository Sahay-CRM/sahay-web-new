import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";

const decodeJwt = (token: string) => {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
};

export const loginToFirebase = async (firebaseToken: string) => {
  const decoded = decodeJwt(firebaseToken);
  const newUid = decoded?.uid || decoded?.sub;

  if (!newUid) throw new Error("UID not found in token");

  if (auth.currentUser) {
    await signInWithCustomToken(auth, firebaseToken);
  } else {
    await signInWithCustomToken(auth, firebaseToken);
  }

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        resolve(null);
      }
    });
  });
};

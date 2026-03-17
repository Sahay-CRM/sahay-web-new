import { auth } from "@/firebaseConfig";
import { signInWithCustomToken } from "firebase/auth";

const decodeJwt = (token: string) => {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
};

export const loginToFirebase = async (firebaseToken: string) => {
  try {
    const decoded = decodeJwt(firebaseToken);
    const newUid = decoded?.uid || decoded?.sub;

    if (!newUid) {
      // eslint-disable-next-line no-console
      console.error("UID not found in token");
      return null;
    }

    const userCredential = await signInWithCustomToken(auth, firebaseToken);

    return userCredential.user.uid;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    // eslint-disable-next-line no-console
    console.error(
      "Firebase Auth failed. Error Code:",
      firebaseError?.code,
      "Message:",
      firebaseError?.message,
    );

    if (firebaseError?.code === "auth/invalid-custom-token") {
      // eslint-disable-next-line no-console
      console.error(
        "The custom token is invalid. This often happens if the token was issued for a different Firebase project or has expired.",
      );
    }
    return null;
  }
};

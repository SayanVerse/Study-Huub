import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");

export const googleSignIn = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  // Extract Classroom access token from credential
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || null;
  return { user: result.user, accessToken };
};

export const emailSignIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const emailSignUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

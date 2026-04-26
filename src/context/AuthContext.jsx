import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  googleSignIn,
  emailSignIn,
  emailSignUp,
  logOut,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [classroomToken, setClassroomToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout fallback: if Firebase never calls back (e.g., missing config), unblock UI after 5s
    const timeout = setTimeout(() => setLoading(false), 5000);
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        clearTimeout(timeout);
        setCurrentUser(user);
        setLoading(false);
      });
    } catch (err) {
      clearTimeout(timeout);
      console.error("Firebase Auth error:", err);
      setLoading(false);
    }
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    const { user, accessToken } = await googleSignIn();
    setClassroomToken(accessToken);
    return user;
  };

  const signInWithEmail = (email, password) => emailSignIn(email, password);

  const signUpWithEmail = (email, password) => emailSignUp(email, password);

  const logout = async () => {
    await logOut();
    setClassroomToken(null);
  };

  const value = {
    currentUser,
    classroomToken,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const activityRef = (userId) => collection(db, "users", userId, "activity");

export const logActivity = async (userId, { type, title, path, subjectId, folderId }) => {
  try {
    await addDoc(activityRef(userId), {
      type,      // 'note' | 'file' | 'subject' | 'folder'
      title,
      path,      // route path for navigation
      subjectId: subjectId || null,
      folderId: folderId || null,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // Activity logging is non-critical, silently fail
    console.warn("Activity log failed:", e);
  }
};

export const getRecentActivity = async (userId) => {
  const q = query(activityRef(userId), orderBy("createdAt", "desc"), limit(8));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

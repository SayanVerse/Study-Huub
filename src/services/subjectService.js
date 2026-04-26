import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const subjectsRef = (userId) =>
  collection(db, "users", userId, "subjects");

export const subscribeToSubjects = (userId, callback) => {
  const q = query(subjectsRef(userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const subjects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(subjects);
  });
};

export const createSubject = (userId, name) =>
  addDoc(subjectsRef(userId), { name, createdAt: serverTimestamp() });

export const deleteSubject = (userId, subjectId) =>
  deleteDoc(doc(db, "users", userId, "subjects", subjectId));

export const renameSubject = (userId, subjectId, newName) =>
  updateDoc(doc(db, "users", userId, "subjects", subjectId), { name: newName });

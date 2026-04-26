import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const foldersRef = (userId, subjectId) =>
  collection(db, "users", userId, "subjects", subjectId, "folders");

export const subscribeToFolders = (userId, subjectId, callback) => {
  const q = query(foldersRef(userId, subjectId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const folders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(folders);
  });
};

export const createFolder = (userId, subjectId, name) =>
  addDoc(foldersRef(userId, subjectId), { name, createdAt: serverTimestamp() });

export const deleteFolder = (userId, subjectId, folderId) =>
  deleteDoc(doc(db, "users", userId, "subjects", subjectId, "folders", folderId));

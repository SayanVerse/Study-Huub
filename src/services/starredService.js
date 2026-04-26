import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

const starredFoldersRef = (userId) => collection(db, "users", userId, "starred_folders");

export const subscribeToStarredFolders = (userId, callback) => {
  const q = query(starredFoldersRef(userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const folders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(folders);
  });
};

export const createStarredFolder = async (userId, name) => {
  const docRef = await addDoc(starredFoldersRef(userId), {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef;
};

export const deleteStarredFolder = async (userId, folderId) => {
  // Wait, if we delete a folder, what happens to the files inside?
  // They just become unorganized (their starredFolderId points to a non-existent folder).
  // The app will just treat them as unorganized if the folder doesn't exist, which is fine.
  await deleteDoc(doc(db, "users", userId, "starred_folders", folderId));
};

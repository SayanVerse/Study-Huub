import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  collectionGroup,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const notesRef = (userId, subjectId, folderId) =>
  collection(
    db,
    "users",
    userId,
    "subjects",
    subjectId,
    "folders",
    folderId,
    "notes"
  );

export const subscribeToNotes = (userId, subjectId, folderId, callback) => {
  const q = query(notesRef(userId, subjectId, folderId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notes);
  });
};

export const createNote = (userId, subjectId, folderId, { title, content }) =>
  addDoc(notesRef(userId, subjectId, folderId), {
    title,
    content,
    starred: false,
    createdAt: serverTimestamp(),
  });

export const updateNote = (userId, subjectId, folderId, noteId, data) =>
  updateDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "notes", noteId),
    data
  );

export const deleteNote = (userId, subjectId, folderId, noteId) =>
  deleteDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "notes", noteId)
  );

export const toggleStar = (userId, subjectId, folderId, noteId, currentStarred) =>
  updateDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "notes", noteId),
    { starred: !currentStarred }
  );

// Fetch all starred notes across all subjects/folders for this user
export const getStarredNotes = async (userId) => {
  // Firestore collectionGroup query - requires index
  const notesGroup = collectionGroup(db, "notes");
  const q = query(notesGroup, where("starred", "==", true));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.ref.path.startsWith(`users/${userId}/`))
    .map((d) => ({ id: d.id, ...d.data(), _path: d.ref.path }));
};

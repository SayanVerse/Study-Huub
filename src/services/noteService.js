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
    starredFolderId: null,
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
    { starred: currentStarred !== true }  // treats undefined and false the same way
  );

// Fetch all starred notes across all subjects/folders for this user
// Uses manual traversal to avoid collectionGroup security rule requirements.
export const getStarredNotes = async (userId) => {
  const starredNotes = [];

  const subjectsSnap = await getDocs(collection(db, "users", userId, "subjects"));

  for (const subjectDoc of subjectsSnap.docs) {
    const foldersSnap = await getDocs(
      collection(db, "users", userId, "subjects", subjectDoc.id, "folders")
    );

    for (const folderDoc of foldersSnap.docs) {
      const notesSnap = await getDocs(
        collection(db, "users", userId, "subjects", subjectDoc.id, "folders", folderDoc.id, "notes")
      );

      for (const noteDoc of notesSnap.docs) {
        const data = noteDoc.data();
        if (data.starred === true) {
          starredNotes.push({
            id: noteDoc.id,
            ...data,
            _path: noteDoc.ref.path,
          });
        }
      }
    }
  }

  return starredNotes;
};

export const updateNoteStarredFolder = (userId, subjectId, folderId, noteId, starredFolderId) =>
  updateDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "notes", noteId),
    { starredFolderId }
  );

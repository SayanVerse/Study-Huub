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
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const filesRef = (userId, subjectId, folderId) =>
  collection(db, "users", userId, "subjects", subjectId, "folders", folderId, "files");

export const subscribeToFiles = (userId, subjectId, folderId, callback) => {
  const q = query(filesRef(userId, subjectId, folderId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const files = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(files);
  });
};

/**
 * Upload file to Cloudinary
 */
export const uploadFile = (userId, subjectId, folderId, file, onProgress) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(new Error("Cloudinary config missing. Check .env variables."));
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `studyhub/${userId}/${subjectId}/${folderId}`);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const docRef = await addDoc(filesRef(userId, subjectId, folderId), {
          fileName: file.name,
          fileURL: data.secure_url,
          publicId: data.public_id,
          fileType: file.type,
          subjectId,
          folderId,
          starred: false,
          starredFolderId: null,
          createdAt: serverTimestamp(),
        });
        resolve({ id: docRef.id, fileURL: data.secure_url, fileName: file.name });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload network error")));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.send(formData);
  });
};

/**
 * Add an external file (e.g. from Google Classroom/Drive) without uploading to Cloudinary
 */
export const addExternalFile = async (userId, subjectId, folderId, { fileName, fileURL, fileType }) => {
  const docRef = await addDoc(filesRef(userId, subjectId, folderId), {
    fileName,
    fileURL,
    fileType: fileType || "application/pdf",
    publicId: null,
    subjectId,
    folderId,
    starred: false,
    starredFolderId: null,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, fileURL, fileName };
};

export const deleteFile = async (userId, subjectId, folderId, fileId) => {
  await deleteDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "files", fileId)
  );
};

export const toggleFileStar = (userId, subjectId, folderId, fileId, currentStarred) =>
  updateDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "files", fileId),
    { starred: currentStarred !== true }
  );

export const updateFileStarredFolder = (userId, subjectId, folderId, fileId, starredFolderId) =>
  updateDoc(
    doc(db, "users", userId, "subjects", subjectId, "folders", folderId, "files", fileId),
    { starredFolderId }
  );

/**
 * Get all starred files by manually traversing subjects → folders → files.
 * Avoids collectionGroup queries — works with default Firestore security rules.
 */
export const getStarredFiles = async (userId) => {
  const starredFiles = [];

  const subjectsSnap = await getDocs(collection(db, "users", userId, "subjects"));

  for (const subjectDoc of subjectsSnap.docs) {
    const foldersSnap = await getDocs(
      collection(db, "users", userId, "subjects", subjectDoc.id, "folders")
    );

    for (const folderDoc of foldersSnap.docs) {
      const filesSnap = await getDocs(
        collection(db, "users", userId, "subjects", subjectDoc.id, "folders", folderDoc.id, "files")
      );

      for (const fileDoc of filesSnap.docs) {
        const data = fileDoc.data();
        if (data.starred === true) {
          starredFiles.push({
            id: fileDoc.id,
            ...data,
            _path: fileDoc.ref.path,
          });
        }
      }
    }
  }

  return starredFiles;
};
